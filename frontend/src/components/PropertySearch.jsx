import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Search, MapPin, Bed, Bath, Square, Calendar, DollarSign, Heart, X, Image as ImageIcon } from 'lucide-react';
import { searchPropertiesByAddress, getPropertyDetails } from '../services/propertyApi';

const PropertySearch = ({ onPropertySelect, selectedProperty, onClearProperty }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Address suggestions for autocomplete
  const ADDRESS_SUGGESTIONS = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90210', 
    '789 Pine Street, Miami, FL 33101',
    '101 Broadway, New York, NY 10005',
    '555 Market Street, San Francisco, CA 94105',
    '777 Sunset Boulevard, Los Angeles, CA 90028',
    '999 Ocean Avenue, Miami Beach, FL 33139',
    '1600 Amphitheatre Parkway, Mountain View, CA 94043',
    '1 Infinite Loop, Cupertino, CA 95014',
    '350 Fifth Avenue, New York, NY 10118',
    '1600 Pennsylvania Avenue, Washington, DC 20500',
    '2000 Avenue of the Stars, Los Angeles, CA 90067',
    '5th Avenue, New York, NY',
    'Wall Street, New York, NY',
    'Hollywood Boulevard, Los Angeles, CA',
    'Rodeo Drive, Beverly Hills, CA',
    'Times Square, New York, NY',
    'Central Park West, New York, NY',
    'Madison Avenue, New York, NY',
    'Park Avenue, New York, NY'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Handle address input changes and show suggestions
  const handleSearchInputChange = (value) => {
    setSearchTerm(value);
    
    if (value.length >= 2) {
      const filteredSuggestions = ADDRESS_SUGGESTIONS.filter(address =>
        address.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 8)); // Show max 8 suggestions
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Hide suggestions when clicking outside
  const handleInputBlur = () => {
    // Delay hiding to allow suggestion clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Show suggestions when input is focused
  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      const filteredSuggestions = ADDRESS_SUGGESTIONS.filter(address =>
        address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 8));
      setShowSuggestions(filteredSuggestions.length > 0);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setSearchPerformed(true);
    setShowSuggestions(false);
    
    try {
      const results = await searchPropertiesByAddress(searchTerm);
      setProperties(results);
    } catch (error) {
      console.error('Search failed:', error);
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePropertyClick = async (property) => {
    try {
      const details = await getPropertyDetails(property.zpid);
      onPropertySelect(details);
    } catch (error) {
      console.error('Failed to fetch property details:', error);
      onPropertySelect(property);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    e.target.style.display = 'none';
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card className="border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900 inter-heading">
            <Search className="w-5 h-5 text-blue-700" />
            Property Search
          </CardTitle>
          <CardDescription className="text-blue-700">
            Search for properties by address to calculate your dream home's mortgage
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 z-10" />
              <Input
                type="text"
                placeholder="Enter address (e.g., 123 Main St, New York, NY)"
                value={searchTerm}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                autoComplete="off"
              />
              
              {/* Address Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-blue-300 rounded-md shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm border-b border-blue-100 last:border-b-0 transition-colors duration-150"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur before click
                        handleSuggestionClick(suggestion);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-blue-900">{suggestion}</span>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2 text-xs text-blue-500 bg-blue-25 border-t border-blue-100">
                    💡 Click any address to auto-fill
                  </div>
                </div>
              )}
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isLoading || !searchTerm.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  <span className="inter-light">Search</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Property Display */}
      {selectedProperty && (
        <Card className="border-blue-400 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-blue-900 inter-heading">Selected Property</CardTitle>
                <CardDescription className="text-blue-700">
                  Mortgage calculations will use this property's details
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearProperty}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {selectedProperty.images && selectedProperty.images[0] && (
                <div className="relative">
                  <img 
                    src={selectedProperty.images[0]} 
                    alt="Selected Property"
                    className="w-24 h-24 object-cover rounded-lg border border-blue-200"
                    onError={handleImageError}
                  />
                  {selectedProperty.images.length > 1 && (
                    <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs">
                      +{selectedProperty.images.length - 1}
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2 inter-light">
                  {selectedProperty.address}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-blue-700">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatCurrency(selectedProperty.price || selectedProperty.zestimate)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-700">
                    <Bed className="w-3 h-3" />
                    <span>{selectedProperty.bedrooms} bed</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-700">
                    <Bath className="w-3 h-3" />
                    <span>{selectedProperty.bathrooms} bath</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-700">
                    <Square className="w-3 h-3" />
                    <span>{formatNumber(selectedProperty.livingArea)} sqft</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchPerformed && (
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
            <CardTitle className="text-blue-900 inter-heading">
              Search Results {properties.length > 0 && `(${properties.length} found)`}
            </CardTitle>
            <CardDescription className="text-blue-700">
              Click on a property to use it in your mortgage calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-700">Searching properties...</span>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                <p className="text-blue-600 mb-1">No properties found</p>
                <p className="text-blue-500 text-sm">Try searching with a different address or location</p>
                <div className="mt-4 text-xs text-blue-400">
                  <p className="mb-2">💡 Try typing these addresses to see autocomplete:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200"
                          onClick={() => handleSearchInputChange('123')}>
                      "123" or "New York"
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200"
                          onClick={() => handleSearchInputChange('Los')}>
                      "Los Angeles"
                    </span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-200"
                          onClick={() => handleSearchInputChange('Miami')}>
                      "Miami"
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {properties.map((property, index) => (
                  <div key={property.zpid || index}>
                    <div 
                      className="flex gap-4 p-4 rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-25 cursor-pointer transition-all duration-200 hover:shadow-md"
                      onClick={() => handlePropertyClick(property)}
                    >
                      {/* Property Image */}
                      <div className="flex-shrink-0">
                        {property.images && property.images[0] ? (
                          <div className="relative">
                            <img 
                              src={property.images[0]} 
                              alt="Property"
                              className="w-32 h-24 object-cover rounded-lg border border-blue-200"
                              onError={handleImageError}
                            />
                            {property.images.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                +{property.images.length - 1} photos
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-32 h-24 bg-blue-100 rounded-lg border border-blue-200 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-blue-400" />
                          </div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-blue-900 inter-light truncate pr-2">
                            {property.address}
                          </h4>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-blue-900 text-lg">
                              {formatCurrency(property.price || property.zestimate)}
                            </p>
                            {property.zestimate && property.price !== property.zestimate && (
                              <p className="text-xs text-blue-600">
                                Zestimate: {formatCurrency(property.zestimate)}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 mb-3">
                          <div className="flex items-center gap-1 text-sm text-blue-700">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-blue-700">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} bath</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-blue-700">
                            <Square className="w-4 h-4" />
                            <span>{formatNumber(property.livingArea)} sqft</span>
                          </div>
                          {property.yearBuilt && (
                            <div className="flex items-center gap-1 text-sm text-blue-700">
                              <Calendar className="w-4 h-4" />
                              <span>Built {property.yearBuilt}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {property.propertyType && (
                              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                                {property.propertyType}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-blue-600">
                              Click to calculate mortgage
                            </p>
                          </div>
                        </div>

                        {property.description && (
                          <p className="text-sm text-blue-600 mt-2 line-clamp-2">
                            {property.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < properties.length - 1 && <Separator className="my-4 bg-blue-100" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropertySearch;