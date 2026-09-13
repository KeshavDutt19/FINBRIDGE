import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(
  __dirname,
  'finbridge_verified_snapshot_2026-08-22.json'
);

const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

const verifiedDate = '2026-08-22';

/*
|--------------------------------------------------------------------------
| SCHOLARSHIP DATA
|--------------------------------------------------------------------------
*/

export const scholarshipSeed = data.scholarships.map((item) => ({
  title: item.title,

  provider: item.provider,

  ministry: item.provider,

  description: item.eligibility_summary,

  category: item.education_level,

  educationLevels: [
    item.education_level
  ],

  states: [
    item.eligible_state === 'All India'
      ? 'All'
      : item.eligible_state
  ],

  eligibleCategories: [
    item.eligible_category
  ],

  genderEligibility:
    item.eligible_gender || 'Any',

  disabilityEligibility:
    'Any',

  minPercentage:
    undefined,

  maxFamilyIncome:
    item.max_annual_family_income_inr,

  ageLimit:
    undefined,

  benefits:
    item.award_amount,

  amount:
    item.award_amount,

  duration:
    undefined,

  applicationStartDate:
    undefined,

  applicationDeadline:
    item.deadline === 'Rolling'
      ? undefined
      : item.deadline,

  requiredDocuments: [
    'Check official scholarship portal for current document requirements'
  ],

  applicationProcedure: [
    'Review eligibility requirements',
    'Prepare the required documents',
    'Complete the application on the official portal',
    'Submit the application before the applicable deadline'
  ],

  officialUrl:
    item.official_apply_url,

  sourceUrl:
    item.source,

  sourceName:
    item.provider,

  lastUpdated:
    verifiedDate,

  status:
    'Verified snapshot',

  eligibilityRules: [
    item.eligibility_summary
  ],

  termsAndConditions:
    'Eligibility criteria, benefits and deadlines can change. Verify the current requirements on the official source before applying.',

  dataLabel:
    'VERIFIED SNAPSHOT - Verify on official source before applying'
}));

/*
|--------------------------------------------------------------------------
| LOAN HELPERS
|--------------------------------------------------------------------------
*/

function getLoanCategory(category) {
  switch (category) {
    case 'Education Loan':
      return 'education';

    case 'Home Loan':
      return 'home';

    case 'Car Loan':
      return 'car';

    default:
      throw new Error(
        `Unknown loan category: ${category}`
      );
  }
}

function extractTenureNumbers(value) {
  if (!value) {
    return {
      min: undefined,
      max: undefined
    };
  }

  const numbers = String(value).match(/\d+/g);

  if (!numbers || numbers.length === 0) {
    return {
      min: undefined,
      max: undefined
    };
  }

  if (numbers.length === 1) {
    return {
      min: Number(numbers[0]),
      max: Number(numbers[0])
    };
  }

  return {
    min: Number(numbers[0]),
    max: Number(numbers[numbers.length - 1])
  };
}

/*
|--------------------------------------------------------------------------
| VERIFIED LOAN DATA FROM SNAPSHOT
|--------------------------------------------------------------------------
*/

const verifiedLoanSeed = data.loans.map((item) => {
  const category = getLoanCategory(
    item.loan_category
  );

  const tenure = extractTenureNumbers(
    item.preferred_tenure_range_months
  );

  const documentGroups =
    item.required_documents_checklist || {};

  const documents = [
    ...(documentGroups.identity_proof || []),
    ...(documentGroups.address_proof || []),
    ...(documentGroups.income_proof || []),
    ...(documentGroups.category_specific_proof || [])
  ];

  return {
    bankName:
      item.bank_name,

    category,

    productName:
      `${item.bank_name} ${item.loan_category}`,

    description:
      `${item.loan_category} from ${item.bank_name}.`,

    interestRate:
      item.interest_rate_range,

    interestRateType:
      'As published by lender',

    processingFee:
      item.processing_fee,

    loanAmountMin:
      item.min_amount_inr,

    loanAmountMax:
      item.max_amount_inr,

    tenureMin:
      tenure.min,

    tenureMax:
      tenure.max,

    margin:
      item.terms_and_conditions?.margin_money,

    collateralRequired:
      item.terms_and_conditions?.collateral_required,

    eligibility:
      'See the official lender website for the complete current eligibility criteria.',

    ageCriteria:
      'See official lender eligibility criteria.',

    incomeCriteria:
      'See official lender eligibility criteria.',

    documents,

    subsidy:
      item.government_subsidy_details,

    subsidyDetails:
      item.government_subsidy_details,

    specialBenefits: [],

    repaymentInfo:
      item.terms_and_conditions?.moratorium_period,

    applicationProcedure: [
      'Review the loan product',
      'Verify the current terms on the official lender website',
      'Prepare the required documents',
      'Apply directly through the official lender'
    ],

    officialUrl:
      item.official_apply_url,

    sourceUrl:
      item.official_apply_url,

    sourceName:
      item.bank_name,

    lastUpdated:
      verifiedDate,

    disclaimer:
      'Interest rates, fees, eligibility criteria, subsidies and other loan terms can change. Verify all current information with the official lender before applying.',

    dataLabel:
      'VERIFIED SNAPSHOT - Verify current rate and terms with official lender'
  };
});

/*
|--------------------------------------------------------------------------
| MISSING VERIFIED/PARTIALLY VERIFIED PRODUCTS
|
| These three products were part of the original
| 3-banks × 3-categories comparison architecture:
|
| SBI Car
| SBI Home
| PNB Home
|
| Their detailed official-source verification is applied later
| by:
|
| verifySbiCar.js
| verifySbiHome.js
| verifyPnbHome.js
|--------------------------------------------------------------------------
*/

const missingVerifiedLoanSeed = [
  {
    bankName: 'State Bank of India',
    category: 'car',
    productName: 'State Bank of India Car Loan',

    description:
      'SBI auto/car loan for eligible borrowers and vehicles.',

    interestRate:
      'Official SBI auto-loan rate range is applied by verifySbiCar.js.',

    interestRateType:
      'Floating; product and borrower dependent',

    processingFee:
      'Official SBI processing-fee information is applied by verifySbiCar.js.',

    loanAmountMin:
      100000,

    loanAmountMax:
      10000000,

    tenureMin:
      12,

    tenureMax:
      84,

    margin:
      'Vehicle/product dependent.',

    collateralRequired:
      'Vehicle hypothecation/security as applicable.',

    eligibility:
      'Eligibility depends on SBI vehicle-loan product, borrower income, repayment capacity, credit profile and vehicle.',

    ageCriteria:
      'Subject to applicable SBI auto-loan conditions.',

    incomeCriteria:
      'Regular and verifiable income/repayment capacity required.',

    documents: [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Recent bank statements',
      'Salary slips/Form 16/ITR as applicable',
      'Vehicle quotation/proforma invoice'
    ],

    subsidy:
      'No general government interest subsidy for a standard car loan.',

    subsidyDetails:
      'Verify any lender-specific concession separately.',

    specialBenefits: [],

    repaymentInfo:
      'Repayment through sanctioned EMI schedule.',

    applicationProcedure: [
      'Review SBI auto-loan terms',
      'Verify current official rate and fees',
      'Prepare required documents',
      'Apply through SBI'
    ],

    officialUrl:
      'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/auto-loans',

    sourceUrl:
      'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/auto-loans',

    sourceName:
      'State Bank of India',

    lastUpdated:
      verifiedDate,

    disclaimer:
      'Verify current SBI rates, fees, eligibility and vehicle/product conditions before applying.',

    dataLabel:
      'OFFICIAL SOURCE PARTIALLY VERIFIED - SBI auto-loan rate and processing fee verified; product-specific conditions require further verification'
  },

  {
    bankName: 'State Bank of India',
    category: 'home',
    productName: 'State Bank of India Home Loan',

    description:
      'SBI home loan for eligible residential property financing.',

    interestRate:
      'Official SBI current home-loan rate information is applied by verifySbiHome.js.',

    interestRateType:
      'Floating/scheme-dependent',

    processingFee:
      'Subject to SBI processing-fee schedule and applicable concessions.',

    loanAmountMin:
      100000,

    loanAmountMax:
      100000000,

    tenureMin:
      12,

    tenureMax:
      360,

    margin:
      'Property value, LTV and applicable SBI product dependent.',

    collateralRequired:
      'Mortgage/security over the financed property.',

    eligibility:
      'Eligibility depends on borrower income, age, credit profile, repayment capacity, property and applicable SBI home-loan product.',

    ageCriteria:
      'Subject to SBI age-at-maturity and product conditions.',

    incomeCriteria:
      'Regular and verifiable income is required.',

    documents: [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Salary slips/Form 16/ITR as applicable',
      'Recent bank statements',
      'Employment or business proof',
      'Sale agreement/property purchase documents',
      'Title and ownership documents',
      'Approved building plan and applicable property approvals'
    ],

    subsidy:
      'Government housing subsidy may apply where the borrower qualifies under an active scheme.',

    subsidyDetails:
      'Verify current government housing-scheme eligibility separately.',

    specialBenefits: [],

    repaymentInfo:
      'Repayment through sanctioned EMI schedule; tenure is subject to SBI conditions.',

    applicationProcedure: [
      'Review SBI home-loan terms',
      'Verify current official rate and fees',
      'Prepare borrower and property documents',
      'Apply through SBI'
    ],

    officialUrl:
      'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/home-loans-interest-rates-current',

    sourceUrl:
      'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/home-loans-interest-rates-current',

    sourceName:
      'State Bank of India',

    lastUpdated:
      verifiedDate,

    disclaimer:
      'Verify current SBI rates, fees, eligibility and property/product conditions before applying.',

    dataLabel:
      'OFFICIAL SOURCE PARTIALLY VERIFIED - SBI Home Loan rate and core terms verified; case-specific terms require further verification'
  },

  {
    bankName: 'Punjab National Bank',
    category: 'home',
    productName: 'Punjab National Bank Home Loan',

    description:
      'PNB housing loan for eligible residential property financing.',

    interestRate:
      'PNB Home Loan floating rates currently start from 7.25% p.a. for qualifying borrower/loan conditions.',

    interestRateType:
      'Floating; rate varies by CIBIL, loan amount, LTV and applicable PNB housing-loan conditions',

    processingFee:
      'Processing and service charges depend on the applicable PNB housing-loan product and current service-charge schedule.',

    /*
     * These are BASE values only.
     * verifyPnbHome.js preserves amount/tenure from
     * the base record and adds the official verification layer.
     */
    loanAmountMin:
      200000,

    loanAmountMax:
      50000000,

    tenureMin:
      12,

    tenureMax:
      360,

    margin:
      'Margin/down-payment depends on applicable loan amount, LTV and PNB housing-loan conditions.',

    collateralRequired:
      'Yes; mortgage of the financed property or other security as required by the sanctioned PNB housing-loan product.',

    eligibility:
      'Eligibility depends on applicant income, repayment capacity, CIBIL profile, loan amount, LTV, property and applicable PNB housing-loan product.',

    ageCriteria:
      'Age eligibility depends on borrower age, proposed tenure and PNB product conditions.',

    incomeCriteria:
      'Regular and verifiable income is required. Salary/business income, bank statements, ITR/Form 16 and other financial evidence may be required.',

    documents: [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Salary slips/Form 16/ITR as applicable',
      'Recent bank statements',
      'Employment or business proof',
      'Property sale/agreement documents',
      'Title and ownership documents',
      'Approved building plan and applicable property approvals'
    ],

    subsidy:
      'Government housing subsidy may apply where the borrower qualifies under an applicable scheme.',

    subsidyDetails:
      'Verify current government housing-scheme eligibility separately.',

    specialBenefits: [],

    repaymentInfo:
      'Repayment is through the sanctioned EMI schedule.',

    applicationProcedure: [
      'Review PNB housing-loan terms',
      'Verify current official rate and fees',
      'Prepare borrower and property documents',
      'Apply through PNB'
    ],

    officialUrl:
      'https://www.pnb.bank.in/housing-loan.aspx',

    sourceUrl:
      'https://www.pnb.bank.in/Retail-Advances-interst-rate-on-advances-linked-to-mclr.html',

    sourceName:
      'Punjab National Bank',

    lastUpdated:
      verifiedDate,

    disclaimer:
      'Verify current PNB rates, fees, eligibility, LTV and property-specific conditions before applying.',

    dataLabel:
      'OFFICIAL SOURCE PARTIALLY VERIFIED - PNB Home Loan rate structure verified; borrower/product-specific terms require further verification'
  }
];

/*
|--------------------------------------------------------------------------
| FINAL LOAN DATA
|
| Verified snapshot:
|   6 products
|
| Added missing original comparison products:
|   3 products
|
| FINAL:
|   9 products
|
| Exactly:
|   Education → SBI, BOB, PNB
|   Car       → SBI, BOB, PNB
|   Home      → SBI, BOB, PNB
|--------------------------------------------------------------------------
*/

export const loanSeed = [
  ...verifiedLoanSeed,
  ...missingVerifiedLoanSeed
];

/*
|--------------------------------------------------------------------------
| SANITY CHECKS
|--------------------------------------------------------------------------
*/

const expectedLoanKeys = [
  'State Bank of India|education',
  'Bank of Baroda|education',
  'Punjab National Bank|education',

  'State Bank of India|car',
  'Bank of Baroda|car',
  'Punjab National Bank|car',

  'State Bank of India|home',
  'Bank of Baroda|home',
  'Punjab National Bank|home'
];

const actualLoanKeys = loanSeed.map(
  (loan) =>
    `${loan.bankName}|${loan.category}`
);

const missingLoanKeys =
  expectedLoanKeys.filter(
    (key) => !actualLoanKeys.includes(key)
  );

const duplicateLoanKeys =
  actualLoanKeys.filter(
    (key, index) =>
      actualLoanKeys.indexOf(key) !== index
  );

if (missingLoanKeys.length > 0) {
  throw new Error(
    `Missing required loan products: ${missingLoanKeys.join(', ')}`
  );
}

if (duplicateLoanKeys.length > 0) {
  throw new Error(
    `Duplicate loan products detected: ${[
      ...new Set(duplicateLoanKeys)
    ].join(', ')}`
  );
}

if (loanSeed.length !== 9) {
  throw new Error(
    `Expected exactly 9 loan products, found ${loanSeed.length}`
  );
}

/*
|--------------------------------------------------------------------------
| LOGS
|--------------------------------------------------------------------------
*/

console.log(
  `Loaded ${scholarshipSeed.length} scholarships`
);

console.log(
  `Loaded ${loanSeed.length} loan products`
);

console.table(
  loanSeed.map((loan) => ({
    bank: loan.bankName,
    category: loan.category,
    product: loan.productName
  }))
);