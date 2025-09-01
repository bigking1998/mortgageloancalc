import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { FileText, Download, Mail, Phone, User, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { BUSINESS_INFO } from '../data/mockData';

const ReportModal = ({ isOpen, onClose, results, inputs, leadInfo, setLeadInfo }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (field, value) => {
    setLeadInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!leadInfo.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to continue.",
        variant: "destructive",
      });
      return false;
    }
    
    if (!leadInfo.email.trim() || !/\S+@\S+\.\S+/.test(leadInfo.email)) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    if (!leadInfo.phone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const generatePDFReport = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    
    try {
      // Simulate PDF generation and CRM submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here we would:
      // 1. Generate PDF with jsPDF
      // 2. Submit lead to GoHighLevel CRM
      // 3. Send email with PDF attachment
      
      const reportData = {
        lead: leadInfo,
        calculations: results,
        inputs: inputs,
        timestamp: new Date().toISOString()
      };

      console.log('Report data would be sent to CRM:', reportData);
      
      toast({
        title: "Report Generated Successfully!",
        description: "Your mortgage analysis report has been sent to your email and you've been added to our system for follow-up.",
      });

      // Simulate PDF download
      const blob = new Blob(['Mock PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mortgage-Analysis-Report-${leadInfo.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!results) return null;

  const bestLoan = Object.entries(results).reduce((best, [key, loan]) => 
    !best || loan.monthlyPayment < best.monthlyPayment ? loan : best
  , null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Get Your Complete Mortgage Analysis Report
          </DialogTitle>
          <DialogDescription>
            Enter your contact information to receive a comprehensive PDF report with all calculations, 
            recommendations, and next steps for your mortgage journey.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Preview */}
          <Card className="border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-3">Report Preview</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Home Price:</span>
                  <span className="font-medium">{formatCurrency(inputs.homePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Down Payment:</span>
                  <span className="font-medium">{inputs.downPaymentPercent}% ({formatCurrency(inputs.homePrice * inputs.downPaymentPercent / 100)})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Recommended Loan:</span>
                  <div className="text-right">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {bestLoan?.loanType}
                    </Badge>
                    <p className="text-xs mt-1">{formatCurrency(bestLoan?.monthlyPayment)} monthly</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  value={leadInfo.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={leadInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">Phone Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="phone"
                  type="tel"
                  value={leadInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Business Contact Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Your Mortgage Professional</h4>
            <div className="text-sm space-y-1">
              <p className="font-medium">{BUSINESS_INFO.contact.name}</p>
              <p>{BUSINESS_INFO.company}</p>
              <p className="text-slate-600">NMLS: {BUSINESS_INFO.nmls}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-xs">
                <span>📱 {BUSINESS_INFO.contact.cell}</span>
                <span>📧 {BUSINESS_INFO.contact.email}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generatePDFReport}
              disabled={isGenerating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download Report & Schedule Consultation
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="sm:w-24"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            By submitting this form, you agree to be contacted by {BUSINESS_INFO.company} 
            regarding your mortgage needs. Your information will be kept confidential and secure.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;