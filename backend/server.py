from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime
import httpx
from urllib.parse import urlparse


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

@api_router.get("/proxy-image")
async def proxy_image(url: str = Query(..., description="Image URL to proxy")):
    """
    Proxy images from Zillow's CDN with proper headers to bypass authentication issues.
    This allows the frontend to display property images that require specific referrer headers.
    """
    # Validate the URL to ensure we only proxy from trusted hosts
    allowed_hosts = [
        "photos.zillowstatic.com",
        "ssl.cdn-redfin.com",
        "ap.rdcpix.com",
        "images1.apartments.com",
        # Add other trusted real estate image CDNs as needed
    ]
    
    try:
        parsed_url = urlparse(url)
        if parsed_url.hostname not in allowed_hosts:
            raise HTTPException(status_code=400, detail=f"Host {parsed_url.hostname} not allowed")
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    try:
        # Create HTTP client with proper headers that Zillow's CDN expects
        async with httpx.AsyncClient() as client:
            headers = {
                "Referer": "https://www.zillow.com/",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "DNT": "1",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
            }
            
            # Fetch the image from Zillow's CDN
            response = await client.get(url, headers=headers, follow_redirects=True)
            
            if not response.is_success:
                logger.warning(f"Failed to fetch image from {url}: {response.status_code}")
                raise HTTPException(status_code=502, detail=f"Upstream server returned {response.status_code}")
            
            # Get content type from response or default to jpeg
            content_type = response.headers.get("content-type", "image/jpeg")
            
            # Create streaming response with appropriate headers
            def generate():
                yield response.content
            
            return StreamingResponse(
                generate(),
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600",
                    "Access-Control-Allow-Origin": "*",
                }
            )
            
    except httpx.RequestError as e:
        logger.error(f"Network error fetching image {url}: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to fetch image")
    except Exception as e:
        logger.error(f"Unexpected error proxying image {url}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
