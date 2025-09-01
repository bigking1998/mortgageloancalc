import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const ComparisonTable = ({ results }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const getBestValue = (field) => {
    const values = Object.values(results).map(loan => loan[field]);
    return Math.min(...values);
  };

  const renderARMScenarios = (armScenarios) => {
    if (!armScenarios) return 'N/A';
    
    return (
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-green-600">Best:</span>
          <span>{formatCurrency(armScenarios.bestCase)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-blue-600">Likely:</span>
          <span>{formatCurrency(armScenarios.likely)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-red-600">Worst:</span>
          <span>{formatCurrency(armScenarios.worstCase)}</span>
        </div>
      </div>
    );
  };

  const bestPayment = getBestValue('monthlyPayment');
  const bestCashToClose = getBestValue('cashToClose');
  const best60MonthCost = getBestValue('cost60Month');
  const bestLifetimeCost = getBestValue('lifetimeCost');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Loan Comparison Results
        </CardTitle>
        <CardDescription>
          Compare monthly payments, closing costs, and long-term expenses across all loan types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Loan Type</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Monthly Payment</TableHead>
                <TableHead className="text-right">Cash to Close</TableHead>
                <TableHead className="text-right">5-Year Cost</TableHead>
                <TableHead className="text-right">Lifetime Cost</TableHead>
                <TableHead className="text-center">MI End Date</TableHead>
                <TableHead className="text-center">ARM Scenarios</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(results).map(([key, loan]) => (
                <TableRow key={key} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{loan.loanType}</span>
                      <span className="text-xs text-slate-500">{loan.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="font-mono">
                      {loan.rate.toFixed(3)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={`font-semibold ${loan.monthlyPayment === bestPayment ? 'text-green-600' : ''}`}>
                        {formatCurrency(loan.monthlyPayment)}
                      </span>
                      {loan.monthlyPayment === bestPayment && (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-1" />
                      )}
                      {loan.monthlyMI > 0 && (
                        <span className="text-xs text-slate-500">
                          +{formatCurrency(loan.monthlyMI)} MI
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${loan.cashToClose === bestCashToClose ? 'text-green-600' : ''}`}>
                      {formatCurrency(loan.cashToClose)}
                    </span>
                    {loan.cashToClose === bestCashToClose && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-1 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${loan.cost60Month === best60MonthCost ? 'text-green-600' : ''}`}>
                      {formatCurrency(loan.cost60Month)}
                    </span>
                    {loan.cost60Month === best60MonthCost && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-1 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${loan.lifetimeCost === bestLifetimeCost ? 'text-green-600' : ''}`}>
                      {formatCurrency(loan.lifetimeCost)}
                    </span>
                    {loan.lifetimeCost === bestLifetimeCost && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-1 inline" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {loan.miEndDate ? (
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{formatDate(loan.miEndDate)}</span>
                        <Badge variant="secondary" className="text-xs mt-1">
                          Cancellable
                        </Badge>
                      </div>
                    ) : loan.monthlyMI > 0 ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs text-amber-600">Life of loan</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {key === 'arm' ? renderARMScenarios(loan.armScenarios) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Important Notes:</p>
              <ul className="space-y-1 text-xs">
                <li>• Rates shown include credit score adjustments and discount points</li>
                <li>• PMI cancellation is modeled according to current regulations</li>
                <li>• FHA MIP: Life of loan if &lt;10% down, 11 years if ≥10% down</li>
                <li>• ARM rates shown are initial rates; see ARM Analysis tab for adjustment scenarios</li>
                <li>• Closing costs include typical fees but may vary by lender and location</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;