import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';

const ARMChart = ({ armData, loanAmount }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const scenarios = [
    {
      name: 'Initial Period (Years 1-5)',
      payment: armData.initial,
      rate: armData.rates.initial,
      color: 'bg-blue-500',
      description: 'Fixed rate period'
    },
    {
      name: 'Best Case Scenario',
      payment: armData.bestCase,
      rate: armData.rates.bestCase,
      color: 'bg-blue-400',
      description: 'If rates stay low'
    },
    {
      name: 'Likely Scenario',
      payment: armData.likely,
      rate: armData.rates.likely,
      color: 'bg-blue-600',
      description: 'Based on current SOFR + margin'
    },
    {
      name: 'Worst Case Scenario',
      payment: armData.worstCase,
      rate: armData.rates.worstCase,
      color: 'bg-blue-800',
      description: 'At rate cap'
    }
  ];

  const maxPayment = Math.max(...scenarios.map(s => s.payment));
  const minPayment = Math.min(...scenarios.map(s => s.payment));
  
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900 inter-heading">
            <TrendingUp className="w-5 h-5 text-blue-700" />
            ARM Stress Test Analysis
          </CardTitle>
          <CardDescription className="text-blue-700">
            5/1 ARM payment scenarios after the initial 5-year fixed period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visual Chart */}
            <div className="space-y-4">
              {scenarios.map((scenario, index) => {
                const percentage = ((scenario.payment - minPayment) / (maxPayment - minPayment)) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${scenario.color}`}></div>
                        <div>
                          <span className="font-medium text-sm text-blue-900 oswald-light">{scenario.name}</span>
                          <p className="text-xs text-blue-600">{scenario.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-900">{formatCurrency(scenario.payment)}</div>
                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-800">
                          {scenario.rate.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-blue-100 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${scenario.color} transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Difference Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-blue-200">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-1 oswald-light">Best Case Savings</h4>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(armData.initial - armData.bestCase)}
                </p>
                <p className="text-xs text-blue-600">vs initial payment</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-blue-300">
                <h4 className="font-semibold text-blue-900 mb-1 oswald-light">Likely Increase</h4>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(armData.likely - armData.initial)}
                </p>
                <p className="text-xs text-blue-700">vs initial payment</p>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg border border-blue-400">
                <h4 className="font-semibold text-blue-900 mb-1 oswald-light">Worst Case Risk</h4>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(armData.worstCase - armData.initial)}
                </p>
                <p className="text-xs text-blue-800">vs initial payment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ARM Details Card */}
      <Card className="border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
          <CardTitle className="flex items-center gap-2 text-blue-900 oswald-heading">
            <AlertTriangle className="w-5 h-5 text-blue-700" />
            ARM Structure & Caps
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-900 oswald-light">Rate Adjustment Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Initial Rate Period:</span>
                  <span className="font-medium text-blue-900">5 Years Fixed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Adjustment Frequency:</span>
                  <span className="font-medium text-blue-900">Annually after Year 5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Index:</span>
                  <span className="font-medium text-blue-900">SOFR (Secured Overnight Financing Rate)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Margin:</span>
                  <span className="font-medium text-blue-900">2.25%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-blue-900 oswald-light">Rate Caps Protection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Initial Adjustment Cap:</span>
                  <span className="font-medium text-blue-900">2.00%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Periodic Adjustment Cap:</span>
                  <span className="font-medium text-blue-900">2.00%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Lifetime Rate Cap:</span>
                  <span className="font-medium text-blue-900">5.00%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Maximum Possible Rate:</span>
                  <span className="font-medium text-blue-900">{(armData.rates.initial + 5).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-700 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2 oswald-light">ARM Considerations:</p>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li>• ARM rates typically start lower but can increase significantly</li>
                  <li>• Payment shock risk if rates rise substantially after year 5</li>
                  <li>• Consider your ability to handle the worst-case payment scenario</li>
                  <li>• ARMs may be suitable if you plan to sell/refinance within 5-7 years</li>
                  <li>• Current SOFR index is {((armData.rates.likely - 2.25)).toFixed(2)}%, margin is 2.25%</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ARMChart;