import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Calculator, TrendingUp, FileText, Mail } from 'lucide-react';
import InputForm from './InputForm';
import ComparisonTable from './ComparisonTable';
import ARMChart from './ARMChart';
import ReportModal from './ReportModal';
import { calculateLoanComparison } from '../utils/mortgageCalculations';
import { BUSINESS_INFO } from '../data/mockData';

const MortgageCalculator = () => {
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

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_5aaf9652-27c7-4995-9755-fdfb3d932235/artifacts/r0esnyd7_IMG_9194.jpeg"
                alt="Gain Equity Mortgage"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Mortgage Rate Comparison Calculator</h1>
                <p className="text-sm text-slate-600">Compare loan options and find your best rate</p>
              </div>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-semibold">{BUSINESS_INFO.company}</p>
              <p>NMLS: {BUSINESS_INFO.nmls}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Discover Your Perfect Mortgage Match
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Compare rates across all major loan types with advanced calculations including PMI cancellation, 
            ARM stress testing, and closing cost optimization. Get your personalized analysis in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-4">
            <InputForm 
              inputs={inputs}
              onInputChange={handleInputChange}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="comparison" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comparison" className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Comparison
                </TabsTrigger>
                <TabsTrigger value="arm-analysis" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  ARM Analysis
                </TabsTrigger>
                <TabsTrigger value="cost-breakdown" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Cost Breakdown
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Cost Analysis</CardTitle>
                      <CardDescription>
                        Break down of all costs over different time periods
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(results).map(([key, loan]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-2">{loan.loanType}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-slate-600">Monthly P&I</p>
                                <p className="font-semibold">${loan.monthlyPI.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Monthly MI</p>
                                <p className="font-semibold">${loan.monthlyMI.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-600">5-Year Cost</p>
                                <p className="font-semibold">${loan.cost60Month.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Lifetime Interest</p>
                                <p className="font-semibold">${(loan.lifetimeCost - (inputs.homePrice - (inputs.homePrice * inputs.downPaymentPercent / 100))).toLocaleString()}</p>
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
            <Card className="mt-8 border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Get Your Complete Underwriter-Style Report
                    </h3>
                    <p className="text-slate-600">
                      Download a comprehensive PDF analysis with all calculations, 
                      recommendations, and next steps tailored to your situation.
                    </p>
                  </div>
                  <Button 
                    onClick={handleGenerateReport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download Report
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
      />
    </div>
  );
};

export default MortgageCalculator;