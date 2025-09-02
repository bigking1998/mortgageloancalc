// Property API service using Zillow RapidAPI + Mapbox for address autocomplete
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const ZILLOW_API_BASE = 'https://real-time-zillow-data.p.rapidapi.com';

const apiHeaders = {
  'x-rapidapi-key': RAPIDAPI_KEY,
  'x-rapidapi-host': 'real-time-zillow-data.p.rapidapi.com'
};

// Helper function to extract property images from various API response structures
const extractPropertyImages = (property) => {
  console.log('DEBUG: Extracting images from property:', property);
  
  const ensureHttps = (url) => {
    if (!url) return '';
    try {
      // Some endpoints return protocol-less or http links
      if (url.startsWith('//')) return `https:${url}`;
      if (url.startsWith('http://')) return url.replace('http://', 'https://');
      return url;
    } catch {
      return url;
    }
  };

  // Convert any URL to use our backend proxy for authentication
  const proxyImage = (url) => {
    if (!url || !BACKEND_URL) return url;
    const normalizedUrl = ensureHttps(String(url));
    if (!normalizedUrl || !normalizedUrl.startsWith('http')) return url;
    
    // Use backend proxy for Zillow images and other CDNs that require authentication
    return `${BACKEND_URL}/api/proxy-image?url=${encodeURIComponent(normalizedUrl)}`;
  };

  // Construct Zillow image URL from key and route through proxy
  const constructFromKey = (key) => {
    if (!key) return '';
    console.log('DEBUG: Constructing URL from key:', key);
    // Zillow static photo CDN pattern commonly used for keys
    const zillowUrl = `https://photos.zillowstatic.com/fp/${key}-cc_ft_768.jpg`;
    return proxyImage(zillowUrl);
  };

  const pushIfUrl = (arr, url, source = '') => {
    if (!url) return;
    const normalized = ensureHttps(String(url));
    if (normalized && /^https?:\/\//.test(normalized)) {
      console.log(`DEBUG: Found image URL from ${source}:`, normalized);
      // Route all images through proxy for consistent authentication handling
      arr.push(proxyImage(normalized));
    }
  };

  const images = [];

  // Debug: Log all property keys to see what we're working with
  console.log('DEBUG: Property keys:', Object.keys(property));

  // Check for Zillow-specific image fields based on real API responses
  pushIfUrl(images, property.imgSrc, 'imgSrc');
  pushIfUrl(images, property.image, 'image');
  pushIfUrl(images, property.image_url, 'image_url');
  pushIfUrl(images, property.largePhotoUrl, 'largePhotoUrl');
  pushIfUrl(images, property.photoUrl, 'photoUrl');
  pushIfUrl(images, property.thumbnail, 'thumbnail');
  pushIfUrl(images, property.primaryImageUrl, 'primaryImageUrl');
  pushIfUrl(images, property.listingPhoto, 'listingPhoto');
  pushIfUrl(images, property.mainImageUrl, 'mainImageUrl');
  
  // Real Zillow API fields - these are more common
  pushIfUrl(images, property.carouselPhotos?.[0]?.url, 'carouselPhotos[0]');
  pushIfUrl(images, property.listingPhotos?.[0], 'listingPhotos[0]');
  pushIfUrl(images, property.photoSrc, 'photoSrc');
  
  // hdpData structures sometimes present in search results
  pushIfUrl(images, property?.hdpData?.homeInfo?.imgSrc, 'hdpData.homeInfo.imgSrc');

  // primary photo objects
  pushIfUrl(images, property?.primaryPhoto?.url || property?.primaryPhoto?.href, 'primaryPhoto');
  pushIfUrl(images, property?.primary_image?.url || property?.primary_image?.href, 'primary_image');
  pushIfUrl(images, property?.coverPhoto?.url || property?.coverPhoto?.href, 'coverPhoto');

  // Arrays: photos - check for photo arrays in the response
  const photoArrayFields = ['photos', 'images', 'carouselPhotos', 'listingPhotos'];
  photoArrayFields.forEach(field => {
    if (Array.isArray(property[field])) {
      console.log(`DEBUG: Found photo array "${field}" with ${property[field].length} items`);
      property[field].forEach((photo, index) => {
        if (typeof photo === 'string') {
          pushIfUrl(images, photo, `${field}[${index}] (string)`);
        } else if (photo && typeof photo === 'object') {
          console.log(`DEBUG: Photo object at ${field}[${index}]:`, photo);
          const fromFields =
            photo.url ||
            photo.href ||
            photo.src ||
            photo.mixedSources?.jpeg?.[0]?.url ||
            photo.webpUrl ||
            photo.original?.url ||
            photo.thumbnailUrl;
          if (fromFields) {
            pushIfUrl(images, fromFields, `${field}[${index}] (object field)`);
          } else if (photo.key) {
            // Now we can construct from key since we have proxy
            const keyUrl = constructFromKey(photo.key);
            if (keyUrl) images.push(keyUrl);
          }
        }
      });
    }
  });

  // Arrays: responsivePhotos
  if (Array.isArray(property.responsivePhotos)) {
    console.log(`DEBUG: Found responsivePhotos with ${property.responsivePhotos.length} items`);
    property.responsivePhotos.forEach((photo, index) => {
      if (typeof photo === 'string') {
        pushIfUrl(images, photo, `responsivePhotos[${index}]`);
      } else if (photo && typeof photo === 'object') {
        const fromFields =
          photo.url ||
          photo.href ||
          photo.src ||
          photo.mixedSources?.jpeg?.[0]?.url ||
          photo.mixedSources?.webp?.[0]?.url;
        if (fromFields) {
          pushIfUrl(images, fromFields, `responsivePhotos[${index}]`);
        } else if (photo.key) {
          const keyUrl = constructFromKey(photo.key);
          if (keyUrl) images.push(keyUrl);
        }
      }
    });
  }

  // Objects: photoUrls map (e.g., { "600": "url", "800": "url", "original": "url" })
  if (property.photoUrls && typeof property.photoUrls === 'object') {
    console.log('DEBUG: Found photoUrls object:', property.photoUrls);
    Object.values(property.photoUrls).forEach((u) => pushIfUrl(images, u, 'photoUrls'));
  }

  // Try to extract from nested media or photo objects
  const nestedChecks = [
    property.media,
    property.mediaData,
    property.listing,
    property.listingData,
    property.propertyData
  ];
  
  nestedChecks.forEach((obj, objIndex) => {
    if (obj && typeof obj === 'object') {
      const photoFields = ['images', 'photos', 'gallery', 'galleryPhotos', 'items'];
      photoFields.forEach(field => {
        if (Array.isArray(obj[field])) {
          console.log(`DEBUG: Found nested ${field} in object ${objIndex}`);
          obj[field].forEach((photo) => {
            if (typeof photo === 'string') {
              pushIfUrl(images, photo, `nested ${field}`);
            } else if (photo && typeof photo === 'object') {
              const fromFields =
                photo.url ||
                photo.href ||
                photo.src ||
                photo.original ||
                photo.large ||
                photo.thumbUrl ||
                photo.image_url;
              if (fromFields) pushIfUrl(images, fromFields, `nested ${field} object`);
              else if (photo.key) {
                const keyUrl = constructFromKey(photo.key);
                if (keyUrl) images.push(keyUrl);
              }
            }
          });
        }
      });
    }
  });

  const unique = [...new Set(images)].slice(0, 5);

  // Debug to verify what we extracted - now showing proxy URLs
  console.log('DEBUG: Final extracted property images (via proxy):', unique);

  return unique;
};

/**
 * Try additional endpoints to fetch images by zpid if main responses lack photos.
 * This is a best-effort fallback and is safe to call. Returns an array of image URLs.
 */
const fetchImagesByZpid = async (zpid) => {
  try {
    const endpoints = [
      `${ZILLOW_API_BASE}/property-photos?zpid=${zpid}`,
      // property-details sometimes includes photos too; keep as fallback
      `${ZILLOW_API_BASE}/property-details?zpid=${zpid}`
    ];

    for (const url of endpoints) {
      try {
        const resp = await fetch(url, { method: 'GET', headers: apiHeaders });
        if (!resp.ok) {
          try { console.warn('fetchImagesByZpid non-OK', resp.status, url); } catch {}
          continue;
        }
        const data = await resp.json();
        const imgs = extractPropertyImages(data);
        if (imgs && imgs.length) {
          console.log('fetchImagesByZpid found images for zpid', zpid, imgs);
          return imgs;
        }
      } catch (e) {
        console.warn('fetchImagesByZpid endpoint failed:', url, e);
        continue;
      }
    }
  } catch (e) {
    console.warn('fetchImagesByZpid failed', e);
  }
  return [];
};

// Real address autocomplete using Mapbox Geocoding API
export const getAddressSuggestions = async (query) => {
  // Fallback mock suggestions if no Mapbox token
  const FALLBACK_SUGGESTIONS = [
    '11 24th Street, New York, NY 10011',
    '25 24th Street, New York, NY 10010',
    '123 Main Street, New York, NY 10001',
    '456 Broadway, New York, NY 10013',
    '789 Park Avenue, New York, NY 10021',
    '555 Market Street, San Francisco, CA 94105',
    '777 Sunset Boulevard, Los Angeles, CA 90028',
    '999 Ocean Drive, Miami Beach, FL 33139'
  ];

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    console.warn('Mapbox token not found, using fallback suggestions');
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    
    return FALLBACK_SUGGESTIONS
      .filter(address => address.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }

  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
      `access_token=${MAPBOX_TOKEN}&` +
      `autocomplete=true&` +
      `country=US&` +
      `types=address&` +
      `limit=10`
    );

    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform Mapbox response to address strings
    return data.features.map(feature => feature.place_name);
    
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    // Fallback to static suggestions on error
    return FALLBACK_SUGGESTIONS
      .filter(address => address.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);
  }
};

export const searchPropertiesByAddress = async (address) => {
  // Ensure API key is available - required for real data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw new Error('Zillow RapidAPI key is required for property searches. Please check your .env configuration.');
  }

  try {
    console.log('Searching properties for address:', address);
    
    // Use the correct GET search API endpoint format as shown in the curl example
    // Format: /search?location=LOCATION&home_status=FOR_SALE&sort=DEFAULT&listing_type=BY_AGENT
    const searchParams = new URLSearchParams({
      location: address,
      home_status: 'FOR_SALE',
      sort: 'DEFAULT',
      listing_type: 'BY_AGENT'
    });

    const endpoint = `/search?${searchParams.toString()}`;
    console.log(`Using correct search endpoint: ${ZILLOW_API_BASE}${endpoint}`);
    
    const response = await fetch(`${ZILLOW_API_BASE}${endpoint}`, {
      method: 'GET',
      headers: apiHeaders
    });

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('API response data:', data);
      console.log('Raw API response structure:', JSON.stringify(data, null, 2));
      
      // Alert to show the user what the API actually returned
      alert(`API Response Status: ${response.status}\nData Keys: ${Object.keys(data).join(', ')}\nFull Response: ${JSON.stringify(data, null, 2)}`);
      
      // Handle different response structures based on endpoint
      let transformedResults = [];
      
      // Check for blocked responses
      if (data.data && data.data.e === "blocked403") {
        console.warn('Property access blocked by Zillow:', data);
        throw new Error('Property access blocked by Zillow');
      }
      
      // Handle the response structure from the correct search endpoint
      if (data.results && Array.isArray(data.results)) {
        transformedResults = data.results.map(property => {
          // Handle address object or string - more comprehensive extraction
          let addressStr = '';
          
          // Check if address is provided as a string
          if (typeof property.address === 'string') {
            addressStr = property.address;
          }
          // Check if address is an object with various possible structures
          else if (property.address && typeof property.address === 'object') {
            const addr = property.address;
            const street = addr.streetAddress || addr.street || addr.address || '';
            const city = addr.city || '';
            const state = addr.state || addr.stateOrProvince || '';
            const zip = addr.zipcode || addr.zip || addr.postalCode || '';
            addressStr = `${street}, ${city}, ${state} ${zip}`.trim();
          }
          // Try to extract from top-level property fields
          else if (property.streetAddress || property.city) {
            addressStr = `${property.streetAddress || ''}, ${property.city || ''}, ${property.state || ''} ${property.zipcode || ''}`.trim();
          }
          // Last resort: try formattedChip or any other address field
          else if (property.formattedChip) {
            addressStr = String(property.formattedChip);
          }
          else {
            addressStr = 'Address not available';
          }
          
          return {
            zpid: String(property.zpid || 'unknown'),
            address: String(addressStr.replace(/^,+|,+$/g, '').replace(/\s+/g, ' ').trim()),
            price: Number(property.price || property.zestimate || 0),
            bedrooms: Number(property.bedrooms || 0),
            bathrooms: Number(property.bathrooms || 0),
            livingArea: Number(property.livingArea || 0),
            propertyType: String(property.propertyType || 'Unknown'),
            yearBuilt: property.yearBuilt ? Number(property.yearBuilt) : null,
            zestimate: property.zestimate ? Number(property.zestimate) : null,
            images: extractPropertyImages(property),
            description: String(`${property.propertyType || 'Property'} in ${property.city || 'Unknown'}, ${property.state || 'Unknown'}`)
          };
        });
      }
      // Handle other possible response structures from the search API
      else if (data.data && Array.isArray(data.data)) {
        // Some search endpoints return data in data.data array
        transformedResults = data.data.map(property => {
          let addressStr = '';
          
          if (typeof property.address === 'string') {
            addressStr = property.address;
          } else if (property.address && typeof property.address === 'object') {
            const addr = property.address;
            const street = addr.streetAddress || addr.street || addr.address || '';
            const city = addr.city || '';
            const state = addr.state || addr.stateOrProvince || '';
            const zip = addr.zipcode || addr.zip || addr.postalCode || '';
            addressStr = `${street}, ${city}, ${state} ${zip}`.trim();
          } else if (property.streetAddress || property.city) {
            addressStr = `${property.streetAddress || ''}, ${property.city || ''}, ${property.state || ''} ${property.zipcode || ''}`.trim();
          } else if (property.formattedChip) {
            addressStr = String(property.formattedChip);
          } else {
            addressStr = 'Address not available';
          }
          
          return {
            zpid: String(property.zpid || 'unknown'),
            address: String(addressStr.replace(/^,+|,+$/g, '').replace(/\s+/g, ' ').trim()),
            price: Number(property.price || property.zestimate || 0),
            bedrooms: Number(property.bedrooms || 0),
            bathrooms: Number(property.bathrooms || 0),
            livingArea: Number(property.livingArea || 0),
            propertyType: String(property.propertyType || 'Unknown'),
            yearBuilt: property.yearBuilt ? Number(property.yearBuilt) : null,
            zestimate: property.zestimate ? Number(property.zestimate) : null,
            images: extractPropertyImages(property),
            description: String(`${property.propertyType || 'Property'} in ${property.city || 'Unknown'}, ${property.state || 'Unknown'}`)
          };
        });
      }
      // Handle single property response
      else if (data.data && data.data.zpid) {
        const mainProperty = data.data;
        let addressStr = '';
        if (typeof mainProperty.address === 'string') {
          addressStr = mainProperty.address;
        } else if (mainProperty.address && typeof mainProperty.address === 'object') {
          addressStr = `${mainProperty.address.streetAddress || mainProperty.address.street || ''}, ${mainProperty.address.city || ''}, ${mainProperty.address.state || ''} ${mainProperty.address.zipcode || mainProperty.address.zip || ''}`.trim();
        } else {
          addressStr = `${mainProperty.streetAddress || ''}, ${mainProperty.city || ''}, ${mainProperty.state || ''} ${mainProperty.zipcode || ''}`.trim();
        }
        
        transformedResults.push({
          zpid: String(mainProperty.zpid),
          address: String(addressStr.replace(/^,+|,+$/g, '').trim()),
          price: Number(mainProperty.price || mainProperty.listPrice || 0),
          bedrooms: Number(mainProperty.bedrooms || 0),
          bathrooms: Number(mainProperty.bathrooms || 0),
          livingArea: Number(mainProperty.livingArea || mainProperty.livingAreaValue || 0),
          propertyType: String(mainProperty.propertyType || mainProperty.homeType || 'Unknown'),
          yearBuilt: mainProperty.yearBuilt ? Number(mainProperty.yearBuilt) : null,
          zestimate: mainProperty.zestimate ? Number(mainProperty.zestimate) : null,
          images: extractPropertyImages(mainProperty),
          description: String(mainProperty.description || `Property in ${mainProperty.city || 'Unknown'}, ${mainProperty.state || 'Unknown'}`)
        });
      }
      
      if (transformedResults.length > 0) {
        console.log('Successfully fetched properties:', transformedResults);
        // Enrich results with images by calling property-details when needed
        const enrichedResults = await Promise.all(
          transformedResults.map(async (p) => {
            try {
              if (p.images && p.images.length > 0) return p;
              if (!p.zpid || p.zpid === 'unknown') return p;
              
              const detailsResp = await fetch(`${ZILLOW_API_BASE}/property-details?zpid=${p.zpid}`, {
                method: 'GET',
                headers: apiHeaders
              });
              if (!detailsResp.ok) return p;
              const detailsData = await detailsResp.json();
              let imgs = extractPropertyImages(detailsData);
              if (!imgs || imgs.length === 0) {
                // As a final fallback, attempt to fetch photos via a dedicated endpoint
                imgs = await fetchImagesByZpid(p.zpid);
              }
              if (imgs && imgs.length > 0) {
                return { ...p, images: imgs };
              }
            } catch (e) {
              console.warn('Failed to enrich images for zpid', p.zpid, e);
            }
            return p;
          })
        );
        try {
          console.log(
            'Enriched results images overview:',
            enrichedResults.map(r => ({
              zpid: r.zpid,
              imagesCount: Array.isArray(r.images) ? r.images.length : 0,
              first: Array.isArray(r.images) ? r.images[0] : null
            }))
          );
        } catch {}
        return enrichedResults;
      }
    } else {
      const responseText = await response.text();
      console.error(`Search API failed: ${response.status} - ${responseText}`);
      if (response.status === 403) {
        throw new Error('API access forbidden - check subscription or API key');
      } else if (response.status === 401) {
        throw new Error('API authentication failed - check API key');
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    }
    
    // If we reach here, no properties were found
    console.warn('No properties found for the search query');
    return [];
    
  } catch (error) {
    console.error('Error searching properties:', error);
    throw error;
  }
};

export const getPropertyDetails = async (zpid) => {
  // Ensure API key is available - required for real data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw new Error('Zillow RapidAPI key is required for property details. Please check your .env configuration.');
  }

  try {
    const response = await fetch(`${ZILLOW_API_BASE}/property-details?zpid=${zpid}`, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API response to match our expected format
    const transformedProperty = {
      zpid: data.zpid,
      address: data.address || `${data.streetAddress}, ${data.city}, ${data.state} ${data.zipcode}`,
      price: data.price || data.zestimate,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      livingArea: data.livingArea,
      propertyType: data.propertyType,
      yearBuilt: data.yearBuilt,
      zestimate: data.zestimate,
      images: extractPropertyImages(data),
      description: data.description || `${data.propertyType} in ${data.city}, ${data.state}`
    };

    return transformedProperty;
  } catch (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
};

export const getPropertyZestimate = async (address) => {
  // Ensure API key is available - required for real data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw new Error('Zillow RapidAPI key is required for Zestimate. Please check your .env configuration.');
  }

  try {
    const queryParams = new URLSearchParams({
      address: address
    });

    const response = await fetch(`${ZILLOW_API_BASE}/property-zestimate?${queryParams}`, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      zestimate: data.zestimate,
      rentZestimate: data.rentZestimate
    };
  } catch (error) {
    console.error('Error fetching zestimate:', error);
    throw error;
  }
};

export const searchPropertiesByFilters = async (filters) => {
  const { city, state, priceMin, priceMax, bedrooms, propertyType } = filters;
  
  // Ensure API key is available - required for real data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    throw new Error('Zillow RapidAPI key is required for property filters search. Please check your .env configuration.');
  }

  try {
    const queryParams = new URLSearchParams();
    if (city) queryParams.append('city', city);
    if (state) queryParams.append('state_code', state);
    if (priceMin) queryParams.append('price_min', priceMin);
    if (priceMax) queryParams.append('price_max', priceMax);
    if (bedrooms) queryParams.append('beds_min', bedrooms);
    if (propertyType) queryParams.append('home_type', propertyType);
    queryParams.append('page', '1');

    const response = await fetch(`${ZILLOW_API_BASE}/search?${queryParams}`, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform API response to match our expected format
    const transformedResults = data.results?.map(property => ({
      zpid: property.zpid,
      address: `${property.streetAddress}, ${property.city}, ${property.state} ${property.zipcode}`,
      price: property.price || property.zestimate,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      livingArea: property.livingArea,
      propertyType: property.propertyType,
      yearBuilt: property.yearBuilt,
      zestimate: property.zestimate,
      images: extractPropertyImages(property),
      description: `${property.propertyType} in ${property.city}, ${property.state}`
    })) || [];

    return transformedResults;
  } catch (error) {
    console.error('Error searching properties by filters:', error);
    throw error;
  }
};
