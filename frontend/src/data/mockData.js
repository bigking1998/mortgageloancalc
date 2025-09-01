// Mock data for mortgage rates and calculations
export const MOCK_RATES = {
  conventional: {
    rate: 6.5,
    name: "Conventional",
    description: "Standard loan with competitive rates"
  },
  fha: {
    rate: 6.25,
    name: "FHA",
    description: "Government-backed loan with lower down payment",
    mip: 0.85 // Annual MIP rate
  },
  va: {
    rate: 6.125,
    name: "VA",
    description: "Veterans Affairs loan with no down payment"
  },
  usda: {
    rate: 6.2,
    name: "USDA",
    description: "Rural development loan program"
  },
  arm: {
    rate: 5.75,
    name: "ARM 5/1",
    description: "Adjustable rate mortgage",
    margin: 2.25,
    caps: {
      initial: 2,
      periodic: 2,
      lifetime: 5
    }
  }
};

export const SOFR_INDEX = 4.5; // Current SOFR rate

export const BUSINESS_INFO = {
  company: "Gain Equity Mortgage",
  nmls: "1456857",
  contact: {
    name: "Marlene",
    address: "99 Hillside Avenue Ste. 99F, Williston Park, NY 11596",
    cell: "347-408-6002",
    office: "718-559-0175",
    fax: "863-248-7701",
    email: "Marlene@GainEquityMortgages.com"
  }
};

export const CREDIT_SCORE_ADJUSTMENTS = {
  "760+": 0,
  "720-759": 0.125,
  "680-719": 0.25,
  "660-679": 0.375,
  "620-659": 0.75,
  "<620": 1.5
};

export const PMI_RATES = {
  "760+": 0.35,
  "720-759": 0.45,
  "680-719": 0.55,
  "660-679": 0.65,
  "620-659": 0.85,
  "<620": 1.25
};