// Property API service using Zillow RapidAPI + Mapbox for address autocomplete
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const ZILLOW_API_BASE = 'https://real-time-zillow-data.p.rapidapi.com';

const apiHeaders = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'real-time-zillow-data.p.rapidapi.com'
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

// Mock data for development (replace with real API calls when API key is available)
const MOCK_PROPERTIES = [
  {
    zpid: '1',
    address: '123 Main Street, New York, NY 10001',
    price: 750000,
    bedrooms: 3,
    bathrooms: 2,
    livingArea: 1200,
    propertyType: 'Single Family',
    yearBuilt: 2015,
    zestimate: 745000,
    images: [
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Beautiful modern home in prime location'
  },
  {
    zpid: '2',
    address: '456 Oak Avenue, Los Angeles, CA 90210',
    price: 1200000,
    bedrooms: 4,
    bathrooms: 3,
    livingArea: 2100,
    propertyType: 'Single Family',
    yearBuilt: 2018,
    zestimate: 1185000,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Luxury home with stunning views'
  },
  {
    zpid: '3',
    address: '789 Pine Street, Miami, FL 33101',
    price: 895000,
    bedrooms: 3,
    bathrooms: 2.5,
    livingArea: 1850,
    propertyType: 'Condo',
    yearBuilt: 2020,
    zestimate: 890000,
    images: [
      'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Modern waterfront condo with amenities'
  }
];

export const searchPropertiesByAddress = async (address) => {
  // If API key is not available, return mock data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('RapidAPI key not found, using mock data');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return MOCK_PROPERTIES.filter(property => 
      property.address.toLowerCase().includes(address.toLowerCase())
    );
  }

  try {
    const queryParams = new URLSearchParams({
      address: address,
      matchHouseNumber: '20',
      pageNumber: '1',
      pageSize: '10'
    });

    const response = await fetch(`${ZILLOW_API_BASE}/property-details-address?${queryParams}`, {
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
      address: property.address || `${property.streetAddress}, ${property.city}, ${property.state} ${property.zipcode}`,
      price: property.price || property.zestimate,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      livingArea: property.livingArea,
      propertyType: property.propertyType,
      yearBuilt: property.yearBuilt,
      zestimate: property.zestimate,
      images: property.photos?.slice(0, 5) || [],
      description: property.description || `${property.propertyType} in ${property.city}, ${property.state}`
    })) || [];

    return transformedResults;
  } catch (error) {
    console.error('Error searching properties:', error);
    // Fallback to mock data on error
    return MOCK_PROPERTIES.filter(property => 
      property.address.toLowerCase().includes(address.toLowerCase())
    );
  }
};

export const getPropertyDetails = async (zpid) => {
  // If API key is not available, return mock data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('RapidAPI key not found, using mock data');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    const mockProperty = MOCK_PROPERTIES.find(p => p.zpid === zpid);
    return mockProperty || MOCK_PROPERTIES[0];
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
      images: data.photos?.slice(0, 5) || [],
      description: data.description || `${data.propertyType} in ${data.city}, ${data.state}`
    };

    return transformedProperty;
  } catch (error) {
    console.error('Error fetching property details:', error);
    // Fallback to mock data on error
    const mockProperty = MOCK_PROPERTIES.find(p => p.zpid === zpid);
    return mockProperty || MOCK_PROPERTIES[0];
  }
};

export const getPropertyZestimate = async (address) => {
  // If API key is not available, return mock data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('RapidAPI key not found, using mock zestimate');
    return { zestimate: 500000, rentZestimate: 2500 };
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
    return { zestimate: 500000, rentZestimate: 2500 };
  }
};

export const searchPropertiesByFilters = async (filters) => {
  const { city, state, priceMin, priceMax, bedrooms, propertyType } = filters;
  
  // If API key is not available, return filtered mock data
  if (!RAPIDAPI_KEY || RAPIDAPI_KEY === 'your_rapidapi_key_here') {
    console.warn('RapidAPI key not found, using mock data');
    await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
    
    return MOCK_PROPERTIES.filter(property => {
      let matches = true;
      
      if (city && !property.address.toLowerCase().includes(city.toLowerCase())) {
        matches = false;
      }
      if (state && !property.address.toLowerCase().includes(state.toLowerCase())) {
        matches = false;
      }
      if (priceMin && property.price < priceMin) {
        matches = false;
      }
      if (priceMax && property.price > priceMax) {
        matches = false;
      }
      if (bedrooms && property.bedrooms < bedrooms) {
        matches = false;
      }
      if (propertyType && property.propertyType !== propertyType) {
        matches = false;
      }
      
      return matches;
    });
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
      images: property.photos?.slice(0, 5) || [],
      description: `${property.propertyType} in ${property.city}, ${property.state}`
    })) || [];

    return transformedResults;
  } catch (error) {
    console.error('Error searching properties by filters:', error);
    return MOCK_PROPERTIES;
  }
};