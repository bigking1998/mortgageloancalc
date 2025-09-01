import { MOCK_RATES, SOFR_INDEX, CREDIT_SCORE_ADJUSTMENTS, PMI_RATES } from '../data/mockData';

export const calculateMonthlyPayment = (principal, rate, termMonths) => {
  const monthlyRate = rate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  
  return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
         (Math.pow(1 + monthlyRate, termMonths) - 1);
};

export const calculatePMI = (loanAmount, homeValue, creditScore) => {
  const ltv = (loanAmount / homeValue) * 100;
  if (ltv <= 80) return 0;
  
  const pmiRate = PMI_RATES[creditScore] || PMI_RATES["<620"];
  return (loanAmount * (pmiRate / 100)) / 12;
};

export const calculateFHAMIP = (loanAmount, downPaymentPercent) => {
  const upfrontMIP = loanAmount * 0.0175; // 1.75% upfront
  const annualMIPRate = downPaymentPercent >= 10 ? 0.80 : 0.85;
  const monthlyMIP = (loanAmount * (annualMIPRate / 100)) / 12;
  
  return {
    upfront: upfrontMIP,
    monthly: monthlyMIP
  };
};

export const calculateARMPayments = (loanAmount, initialRate, termYears) => {
  const { margin, caps } = MOCK_RATES.arm;
  const termMonths = termYears * 12;
  
  // Initial 5-year payment
  const initialPayment = calculateMonthlyPayment(loanAmount, initialRate, termMonths);
  
  // Best case scenario (rates stay low)
  const bestCaseRate = Math.max(initialRate, SOFR_INDEX + margin - 1);
  const bestCasePayment = calculateMonthlyPayment(loanAmount, bestCaseRate, termMonths - 60);
  
  // Likely scenario (current SOFR + margin)
  const likelyRate = SOFR_INDEX + margin;
  const likelyPayment = calculateMonthlyPayment(loanAmount, likelyRate, termMonths - 60);
  
  // Worst case scenario (rate cap)
  const worstCaseRate = Math.min(initialRate + caps.lifetime, likelyRate + caps.periodic);
  const worstCasePayment = calculateMonthlyPayment(loanAmount, worstCaseRate, termMonths - 60);
  
  return {
    initial: initialPayment,
    bestCase: bestCasePayment,
    likely: likelyPayment,
    worstCase: worstCasePayment,
    rates: {
      initial: initialRate,
      bestCase: bestCaseRate,
      likely: likelyRate,
      worstCase: worstCaseRate
    }
  };
};

export const calculateClosingCosts = (homePrice, loanAmount, loanType) => {
  const baseCosts = {
    appraisal: 500,
    creditReport: 50,
    titleInsurance: homePrice * 0.005,
    origination: loanAmount * 0.01,
    underwriting: 995,
    processingFee: 450
  };

  if (loanType === 'fha') {
    baseCosts.upfrontMIP = loanAmount * 0.0175;
  }

  if (loanType === 'va' && homePrice > 766550) {
    baseCosts.vaFundingFee = loanAmount * 0.023;
  }

  return Object.values(baseCosts).reduce((sum, cost) => sum + cost, 0);
};

export const calculateLoanComparison = (inputs) => {
  const {
    homePrice,
    downPaymentPercent,
    loanTerm,
    creditScore,
    discountPoints = 0,
    sellerCredit = 0
  } = inputs;

  const downPayment = (homePrice * downPaymentPercent) / 100;
  const loanAmount = homePrice - downPayment;
  const termMonths = loanTerm * 12;

  const results = {};

  Object.entries(MOCK_RATES).forEach(([loanType, rateInfo]) => {
    let adjustedRate = rateInfo.rate + (CREDIT_SCORE_ADJUSTMENTS[creditScore] || 0);
    adjustedRate -= discountPoints * 0.25; // Each point typically reduces rate by 0.25%

    const monthlyPI = calculateMonthlyPayment(loanAmount, adjustedRate, termMonths);
    let monthlyMI = 0;
    let miEndDate = null;

    // Calculate mortgage insurance
    if (loanType === 'conventional' && downPaymentPercent < 20) {
      monthlyMI = calculatePMI(loanAmount, homePrice, creditScore);
      // PMI cancels at 78% LTV or can be requested at 80% LTV
      const monthsToCancel = Math.ceil(Math.log(0.78) / Math.log(1 - (monthlyPI / loanAmount))) * 12;
      miEndDate = new Date();
      miEndDate.setMonth(miEndDate.getMonth() + monthsToCancel);
    } else if (loanType === 'fha') {
      const mipInfo = calculateFHAMIP(loanAmount, downPaymentPercent);
      monthlyMI = mipInfo.monthly;
      // FHA MIP: Life of loan if <10% down, 11 years if >=10% down
      if (downPaymentPercent >= 10) {
        miEndDate = new Date();
        miEndDate.setFullYear(miEndDate.getFullYear() + 11);
      }
    }

    const monthlyPayment = monthlyPI + monthlyMI;
    const closingCosts = calculateClosingCosts(homePrice, loanAmount, loanType);
    const cashToClose = downPayment + closingCosts - sellerCredit;

    let cost60Month = monthlyPayment * 60;
    let lifetimeCost = monthlyPayment * termMonths;

    // Adjust costs for MI cancellation
    if (miEndDate && loanType === 'conventional') {
      const monthsWithMI = Math.min(60, (miEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
      cost60Month = (monthlyPI * 60) + (monthlyMI * monthsWithMI);
      
      const lifetimeMonthsWithMI = (miEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30);
      lifetimeCost = (monthlyPI * termMonths) + (monthlyMI * lifetimeMonthsWithMI);
    }

    results[loanType] = {
      loanType: rateInfo.name,
      rate: adjustedRate,
      monthlyPayment,
      monthlyPI,
      monthlyMI,
      cashToClose,
      cost60Month,
      lifetimeCost,
      miEndDate,
      description: rateInfo.description
    };

    // Special handling for ARM
    if (loanType === 'arm') {
      const armPayments = calculateARMPayments(loanAmount, adjustedRate, loanTerm);
      results[loanType].armScenarios = armPayments;
    }
  });

  return results;
};