// Property API service using Zillow RapidAPI
const RAPIDAPI_KEY = process.env.REACT_APP_RAPIDAPI_KEY;
const ZILLOW_API_BASE = 'https://zillow-com1.p.rapidapi.com';

const apiHeaders = {
  'X-RapidAPI-Key': RAPIDAPI_KEY,
  'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com'
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
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not found, using mock data');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return MOCK_PROPERTIES.filter(property => 
      property.address.toLowerCase().includes(address.toLowerCase())
    );
  }

  try {
    const response = await fetch(`${ZILLOW_API_BASE}/propertybyaddress?address=${encodeURIComponent(address)}`, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
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
  if (!RAPIDAPI_KEY) {
    console.warn('RapidAPI key not found, using mock data');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    const mockProperty = MOCK_PROPERTIES.find(p => p.zpid === zpid);
    return mockProperty || MOCK_PROPERTIES[0];
  }

  try {
    const response = await fetch(`${ZILLOW_API_BASE}/property?zpid=${zpid}`, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching property details:', error);
    // Fallback to mock data on error
    const mockProperty = MOCK_PROPERTIES.find(p => p.zpid === zpid);
    return mockProperty || MOCK_PROPERTIES[0];
  }
};

export const searchPropertiesByFilters = async (filters) => {
  const { city, state, priceMin, priceMax, bedrooms, propertyType } = filters;
  
  // If API key is not available, return filtered mock data
  if (!RAPIDAPI_KEY) {
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
    if (state) queryParams.append('state', state);
    if (priceMin) queryParams.append('price_min', priceMin);
    if (priceMax) queryParams.append('price_max', priceMax);
    if (bedrooms) queryParams.append('bedrooms', bedrooms);
    if (propertyType) queryParams.append('property_type', propertyType);

    const response = await fetch(`${ZILLOW_API_BASE}/search?${queryParams}`, {
      method: 'GET',
      headers: apiHeaders
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching properties by filters:', error);
    return MOCK_PROPERTIES;
  }
};