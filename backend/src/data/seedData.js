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
| LOAN DATA
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

  const numbers = value.match(/\d+/g);

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

export const loanSeed = data.loans.map((item) => {
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

console.log(
  `Loaded ${scholarshipSeed.length} scholarships`
);

console.log(
  `Loaded ${loanSeed.length} loan products`
);