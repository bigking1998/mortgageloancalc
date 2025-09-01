import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Home, Percent, Calendar, CreditCard, TrendingDown, DollarSign } from 'lucide-react';

const InputForm = ({ inputs, onInputChange, selectedProperty }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-blue-900 inter-heading">
            <Home className="w-5 h-5 text-blue-700" />
            Loan Details
          </CardTitle>
          <CardDescription className="text-blue-700">Enter your basic loan information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="homePrice" className="text-sm font-medium text-blue-900">Home Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
              <Input
                id="homePrice"
                type="number"
                value={inputs.homePrice}
                onChange={(e) => onInputChange('homePrice', Number(e.target.value))}
                className="pl-10 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="400,000"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-blue-900">Down Payment</Label>
              <span className="text-sm text-blue-700 font-semibold">
                {inputs.downPaymentPercent}% ({formatCurrency(inputs.homePrice * inputs.downPaymentPercent / 100)})
              </span>
            </div>
            <Slider
              value={[inputs.downPaymentPercent]}
              onValueChange={([value]) => onInputChange('downPaymentPercent', value)}
              max={30}
              min={3}
              step={0.5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-900">Loan Term</Label>
            <Select 
              value={inputs.loanTerm.toString()} 
              onValueChange={(value) => onInputChange('loanTerm', Number(value))}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-blue-900">Credit Score Range</Label>
            <Select 
              value={inputs.creditScore} 
              onValueChange={(value) => onInputChange('creditScore', value)}
            >
              <SelectTrigger className="border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="760+">760+ (Excellent)</SelectItem>
                <SelectItem value="720-759">720-759 (Very Good)</SelectItem>
                <SelectItem value="680-719">680-719 (Good)</SelectItem>
                <SelectItem value="660-679">660-679 (Fair)</SelectItem>
                <SelectItem value="620-659">620-659 (Poor)</SelectItem>
                <SelectItem value="<620">&lt;620 (Very Poor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
          <CardTitle className="flex items-center gap-2 text-blue-900 inter-heading">
            <TrendingDown className="w-5 h-5 text-blue-700" />
            Advanced Options
          </CardTitle>
          <CardDescription className="text-blue-700">Fine-tune your loan parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-blue-900">Add Discount Points</Label>
              <p className="text-xs text-blue-600">Lower your rate by paying points upfront</p>
            </div>
            <Switch
              checked={inputs.addDiscountPoints}
              onCheckedChange={(checked) => onInputChange('addDiscountPoints', checked)}
            />
          </div>

          {inputs.addDiscountPoints && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-blue-900">Number of Points</Label>
                <span className="text-sm text-blue-700 font-semibold">
                  {inputs.discountPoints} points
                </span>
              </div>
              <Slider
                value={[inputs.discountPoints]}
                onValueChange={([value]) => onInputChange('discountPoints', value)}
                max={3}
                min={0}
                step={0.25}
                className="w-full"
              />
              <p className="text-xs text-blue-600">
                Cost: {formatCurrency((inputs.homePrice - (inputs.homePrice * inputs.downPaymentPercent / 100)) * inputs.discountPoints / 100)}
              </p>
            </div>
          )}

          <Separator className="bg-blue-200" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-blue-900">Seller Credit %</Label>
              <span className="text-sm text-blue-700 font-semibold">
                {inputs.sellerCredit}% ({formatCurrency(inputs.homePrice * inputs.sellerCredit / 100)})
              </span>
            </div>
            <Slider
              value={[inputs.sellerCredit]}
              onValueChange={([value]) => onInputChange('sellerCredit', value)}
              max={6}
              min={0}
              step={0.25}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-blue-900">Down Payment Assistance</Label>
              <p className="text-xs text-blue-600">Available programs for qualified buyers</p>
            </div>
            <Switch
              checked={inputs.downPaymentAssistance}
              onCheckedChange={(checked) => onInputChange('downPaymentAssistance', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InputForm;