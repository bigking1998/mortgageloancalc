# Mortgage Calculator API Contracts & Integration Plan

## API Contracts

### 1. Mortgage Rates Endpoint
**GET /api/rates**
- Purpose: Get current mortgage rates from external API
- Response: 
```json
{
  "conventional": 6.5,
  "fha": 6.25,
  "va": 6.125,
  "usda": 6.2,
  "arm": 5.75,
  "timestamp": "2025-01-01T00:00:00Z"
}
```

### 2. Lead Submission Endpoint
**POST /api/leads**
- Purpose: Submit lead to GoHighLevel CRM and generate PDF report
- Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "calculations": {...},
  "inputs": {...}
}
```
- Response:
```json
{
  "success": true,
  "leadId": "ghl_contact_id",
  "reportUrl": "path/to/generated/report.pdf"
}
```

### 3. SOFR Rate Endpoint
**GET /api/sofr**
- Purpose: Get current SOFR index rate for ARM calculations
- Response:
```json
{
  "rate": 4.5,
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## Mock Data Replacement Plan

### Current Mock Data in `/app/frontend/src/data/mockData.js`:
1. **MOCK_RATES**: Replace with live API calls to `/api/rates`
2. **SOFR_INDEX**: Replace with live API calls to `/api/sofr`
3. **BUSINESS_INFO**: Keep as-is (static business information)
4. **CREDIT_SCORE_ADJUSTMENTS**: Keep as-is (standard adjustments)
5. **PMI_RATES**: Keep as-is (standard PMI rates)

## Backend Implementation Requirements

### 1. External API Integrations
- **Freddie Mac PMMS API**: For mortgage rates
- **FRED API (Federal Reserve)**: For SOFR rates
- **GoHighLevel API**: For CRM lead submission

### 2. PDF Generation
- Use `jsPDF` or `puppeteer` to generate comprehensive mortgage reports
- Include business branding, calculations, and recommendations
- Store generated PDFs temporarily for download

### 3. Database Models
```python
# Lead model for tracking submissions
class Lead(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    ghl_contact_id: str
    calculations: dict
    inputs: dict
    created_at: datetime
    report_generated: bool
```

### 4. Environment Variables Required
```
# GoHighLevel Integration
GHL_LOCATION_ID=XKtw72q4SRV3XoFomk0B
GHL_PIT_TOKEN=pit-4b7177ad-5aa6-4f9e-b4be-22b5e3169de0

# External APIs
FREDDIE_MAC_API_KEY=your_key_here
FRED_API_KEY=your_key_here
```

## Frontend Integration Changes

### Files to Modify:
1. **MortgageCalculator.jsx**: Replace mock data calls with API calls
2. **ReportModal.jsx**: Integrate real PDF generation and CRM submission
3. **New service file**: `/app/frontend/src/services/api.js` for API calls

### API Service Functions:
```javascript
// Replace mock data with live API calls
export const fetchMortgageRates = async () => {
  // Call /api/rates
};

export const fetchSOFRRate = async () => {
  // Call /api/sofr
};

export const submitLead = async (leadData) => {
  // Call /api/leads
};
```

## Testing Strategy
1. **Backend API Testing**: Test all endpoints with curl and automated tests
2. **Frontend Integration**: Test form submissions and data flow
3. **PDF Generation**: Verify PDF content and download functionality
4. **CRM Integration**: Confirm leads are properly submitted to GoHighLevel

## Error Handling
- Graceful fallback to mock rates if external APIs fail
- User-friendly error messages for form submission failures
- Retry logic for CRM submissions
- Proper validation for all user inputs

## Next Steps
1. Implement backend endpoints with external API integrations
2. Set up GoHighLevel SDK and environment variables
3. Replace frontend mock data with API calls
4. Test complete flow from form submission to CRM integration
5. Deploy and validate all functionality