import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calculator, TrendingUp, FileText, Mail, Home, Search } from 'lucide-react';
import PropertySearch from './PropertySearch';
import InputForm from './InputForm';
import ComparisonTable from './ComparisonTable';
import ARMChart from './ARMChart';
import ReportModal from './ReportModal';
import { calculateLoanComparison } from '../utils/mortgageCalculations';
import { BUSINESS_INFO } from '../data/mockData';

const PropertyCalculator = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [inputs, setInputs] = useState({
    homePrice: 400000,
    downPaymentPercent: 20,
    loanTerm: 30,
    creditScore: '720-759',
    discountPoints: 0,
    sellerCredit: 0,
    addDiscountPoints: false,
    downPaymentAssistance: false
  });

  const [results, setResults] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [leadInfo, setLeadInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const calculatedResults = calculateLoanComparison(inputs);
    setResults(calculatedResults);
  }, [inputs]);

  // Update home price when property is selected
  useEffect(() => {
    if (selectedProperty) {
      const propertyPrice = selectedProperty.price || selectedProperty.zestimate || 400000;
      setInputs(prev => ({
        ...prev,
        homePrice: propertyPrice
      }));
    }
  }, [selectedProperty]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
  };

  const handleClearProperty = () => {
    setSelectedProperty(null);
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-blue-50 shadow-lg border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_5aaf9652-27c7-4995-9755-fdfb3d932235/artifacts/r0esnyd7_IMG_9194.jpeg"
                alt="Gain Equity Mortgage"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900 inter-heading">Dream Home Mortgage Calculator</h1>
                <p className="text-sm text-blue-600">Search properties and calculate your perfect mortgage</p>
              </div>
            </div>
            <div className="text-right text-sm text-blue-700">
              <p className="font-semibold inter-light">{BUSINESS_INFO.company}</p>
              <p className="text-blue-600">NMLS: {BUSINESS_INFO.nmls}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 inter-heading">
            Find Your Dream Home & Calculate Your Mortgage
          </h2>
          <p className="text-lg text-blue-700 max-w-3xl mx-auto">
            Search real properties by address, get instant mortgage calculations, and compare rates across all loan types. 
            Make informed decisions with our comprehensive analysis tools.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Property Search & Input Form */}
          <div className="lg:col-span-5">
            <Tabs defaultValue="property-search" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 to-blue-50">
                <TabsTrigger value="property-search" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Search className="w-4 h-4" />
                  <span className="inter-light">Find Property</span>
                </TabsTrigger>
                <TabsTrigger value="loan-details" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Home className="w-4 h-4" />
                  <span className="inter-light">Loan Details</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="property-search">
                <PropertySearch 
                  onPropertySelect={handlePropertySelect}
                  selectedProperty={selectedProperty}
                  onClearProperty={handleClearProperty}
                />
              </TabsContent>

              <TabsContent value="loan-details">
                <InputForm 
                  inputs={inputs}
                  onInputChange={handleInputChange}
                  selectedProperty={selectedProperty}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-7">
            {/* Property Info Banner */}
            {selectedProperty && (
              <Card className="mb-6 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-blue-700" />
                    <div>
                      <h3 className="font-semibold text-blue-900 inter-light">Calculating for:</h3>
                      <p className="text-blue-800">{selectedProperty.address}</p>
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 mt-1">
                        {inputs.homePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="comparison" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-blue-100 to-blue-50">
                <TabsTrigger value="comparison" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Calculator className="w-4 h-4" />
                  <span className="inter-light">Comparison</span>
                </TabsTrigger>
                <TabsTrigger value="arm-analysis" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <TrendingUp className="w-4 h-4" />
                  <span className="inter-light">ARM Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="cost-breakdown" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <FileText className="w-4 h-4" />
                  <span className="inter-light">Cost Breakdown</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comparison">
                {results && <ComparisonTable results={results} />}
              </TabsContent>

              <TabsContent value="arm-analysis">
                {results && results.arm && (
                  <ARMChart 
                    armData={results.arm.armScenarios}
                    loanAmount={inputs.homePrice - (inputs.homePrice * inputs.downPaymentPercent / 100)}
                  />
                )}
              </TabsContent>

              <TabsContent value="cost-breakdown">
                {results && (
                  <Card className="border-blue-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
                      <CardTitle className="inter-heading text-blue-900">Detailed Cost Analysis</CardTitle>
                      <CardDescription className="text-blue-700">
                        Break down of all costs over different time periods
                        {selectedProperty && (
                          <span className="block mt-1 font-medium">
                            For: {selectedProperty.address}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(results).map(([key, loan]) => (
                          <div key={key} className="border border-blue-200 rounded-lg p-4 bg-gradient-to-r from-blue-25 to-white">
                            <h4 className="font-semibold text-lg mb-2 text-blue-900 inter-light">{loan.loanType}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-blue-600">Monthly P&I</p>
                                <p className="font-semibold text-blue-900">${loan.monthlyPI.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-blue-600">Monthly MI</p>
                                <p className="font-semibold text-blue-900">${loan.monthlyMI.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-blue-600">5-Year Cost</p>
                                <p className="font-semibold text-blue-900">${loan.cost60Month.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-blue-600">Lifetime Interest</p>
                                <p className="font-semibold text-blue-900">${(loan.lifetimeCost - (inputs.homePrice - (inputs.homePrice * inputs.downPaymentPercent / 100))).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* CTA Section */}
            <Card className="mt-8 border-blue-300 bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2 inter-heading">
                      Get Your {selectedProperty ? 'Property-Specific' : 'Complete'} Analysis Report
                    </h3>
                    <p className="text-blue-700">
                      {selectedProperty 
                        ? `Download a comprehensive mortgage analysis for ${selectedProperty.address.split(',')[0]} with all calculations and recommendations.`
                        : 'Download a comprehensive PDF analysis with all calculations, recommendations, and next steps tailored to your situation.'
                      }
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateReport}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 shadow-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="inter-light">Download Report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        results={results}
        inputs={inputs}
        leadInfo={leadInfo}
        setLeadInfo={setLeadInfo}
        selectedProperty={selectedProperty}
      />
    </div>
  );
};

export default PropertyCalculator;