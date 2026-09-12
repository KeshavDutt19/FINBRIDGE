import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const SOURCE_URL =
  'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/education-loan-scheme';

const PROCESSING_FEE_URL =
  'https://sbi.co.in/web/interest-rates/interest-rates/processing-fees';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'State Bank of India',
      category: 'education'
    });

    if (!loan) {
      throw new Error('State Bank of India Education Loan was not found.');
    }

    /*
     * --------------------------------------------------
     * OFFICIAL SOURCE
     * --------------------------------------------------
     */

    loan.source = {
      sourceName: 'State Bank of India',
      sourceType: 'official_bank_website',
      sourceUrl: SOURCE_URL,
      sourceTitle: 'Education Loan Scheme - Interest Rates',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Official SBI education-loan rate page verified. The FinBridge record represents multiple SBI education-loan schemes, so exact borrower pricing remains scheme dependent.'
    };

    /*
     * --------------------------------------------------
     * INTEREST RATE
     * --------------------------------------------------
     *
     * Do not collapse all SBI education schemes into
     * one universal rate.
     */

    loan.interestRate =
      'SBI education-loan pricing is scheme dependent. Published official rates include PM-Vidyalaxmi rates of 7.15%, 7.45% and 8.65% depending on scheme conditions; Student Loan pricing includes 10.15% without collateral up to ₹7.5 lakh and 9.15% with collateral above ₹7.5 lakh; other SBI education schemes have separate pricing.';

    loan.interestRateType =
      'Floating/scheme-dependent; applicable rate varies by SBI education-loan scheme and borrower/institution conditions';

    loan.rateDetails = {
      startingRate: 7.15,
      minimumRate: 7.15,
      maximumRate: 10.15,
      unit: 'percent',
      frequency: 'annual',
      type: 'scheme_dependent',
      conditions: [
        'PM-Vidyalaxmi has separate published rates by applicable scheme conditions',
        'Student Loan has separate pricing with and without collateral',
        'Scholar Loan has separate pricing',
        'Global Ed-Vantage has separate pricing',
        'Rate depends on applicable SBI education-loan scheme',
        'Institution/category can affect applicable scheme and pricing',
        'Collateral can affect rate under applicable schemes',
        'Girl-student concessions may apply to eligible schemes'
      ]
    };

    /*
     * --------------------------------------------------
     * PROCESSING FEE
     * --------------------------------------------------
     */

    loan.processingFee =
      'Processing fee is scheme dependent. For SBI Global Ed-Vantage, the published fee is 0.50% of the loan amount, subject to minimum ₹10,000 and maximum ₹50,000 plus applicable GST. Other SBI education-loan schemes can have different fee conditions.';

    /*
     * --------------------------------------------------
     * AMOUNT / TENURE
     * --------------------------------------------------
     *
     * Retain the current generic values because the
     * record represents a family of SBI schemes.
     */

    loan.loanAmountMin = loan.loanAmountMin;
    loan.loanAmountMax = loan.loanAmountMax;

    loan.tenureMin = loan.tenureMin;
    loan.tenureMax = loan.tenureMax;

    /*
     * --------------------------------------------------
     * MARGIN
     * --------------------------------------------------
     */

    loan.margin =
      'Margin varies by SBI education-loan scheme, study destination and sanctioned loan amount. Scholarship/assistantship may be considered in applicable scheme margin calculations.';

    /*
     * --------------------------------------------------
     * COLLATERAL
     * --------------------------------------------------
     */

    loan.collateralRequired =
      'Collateral requirement is scheme and loan-amount dependent. Certain eligible schemes/institutions may permit collateral-free financing within prescribed limits, while collateral-backed schemes require tangible security according to SBI rules.';

    /*
     * --------------------------------------------------
     * ELIGIBILITY
     * --------------------------------------------------
     */

    loan.eligibility =
      'Eligibility depends on the applicable SBI education-loan scheme, recognised institution/course, admission status, academic profile, co-borrower and repayment capacity.';

    /*
     * --------------------------------------------------
     * AGE
     * --------------------------------------------------
     */

    loan.ageCriteria =
      'Age and co-borrower requirements are scheme dependent and must be checked against the applicable SBI education-loan product before sanction.';

    /*
     * --------------------------------------------------
     * INCOME
     * --------------------------------------------------
     */

    loan.incomeCriteria =
      'Parent/co-borrower repayment capacity is evaluated under the applicable SBI education-loan scheme. Salary/business income evidence, bank statements, ITR/Form 16 and related financial documents may be required.';

    /*
     * --------------------------------------------------
     * DOCUMENTS
     * --------------------------------------------------
     */

    loan.documents = [
      'Student KYC documents',
      'Parent/co-borrower KYC documents',
      'Admission/offer letter',
      'Course and institution details',
      'Fee structure / fee demand letter',
      'Academic records',
      'Parent/co-borrower income proof',
      'Bank statements',
      'ITR/Form 16 or business-income documents as applicable',
      'Collateral/title documents where security is required',
      'Additional scheme-specific SBI documents'
    ];

    /*
     * --------------------------------------------------
     * REPAYMENT
     * --------------------------------------------------
     */

    loan.repaymentInfo =
      'Repayment and moratorium depend on the sanctioned SBI education-loan scheme. For example, the Global Ed-Vantage structure includes the course period plus a post-course moratorium before repayment, while other schemes can have different conditions.';

    /*
     * --------------------------------------------------
     * FIELD VERIFICATION
     * --------------------------------------------------
     */

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'State Bank of India confirmed.'
      },

      productName: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official SBI page confirms the education-loan family but the database record combines multiple distinct schemes.'
      },

      category: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Education-loan category confirmed.'
      },

      interestRate: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official SBI scheme-specific rate structure recorded.'
      },

      processingFee: {
        status: 'partially_verified',
        sourceUrl: PROCESSING_FEE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Global Ed-Vantage fee confirmed, but fee differs across SBI education-loan schemes.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Current numeric record combines different SBI education schemes with different limits.'
      },

      tenure: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Tenure varies across SBI education-loan schemes.'
      },

      margin: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Margin varies by scheme, destination and loan amount.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Collateral-backed and collateral-free structures are differentiated in the published SBI schemes.'
      },

      eligibility: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Institution, course and borrower conditions vary by scheme.'
      },

      repayment: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Moratorium and repayment conditions are scheme dependent.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core admission, KYC, financial and collateral documentation identified; exact checklist depends on scheme.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',

      verificationScore: 88,

      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'category',
        'interestRate',
        'collateral'
      ],

      notes:
        'Official SBI education-loan rate structure verified. The generic FinBridge record still combines multiple SBI schemes, so amount, tenure, fee and detailed eligibility remain scheme dependent.',

      fieldVerification
    };

    /*
     * --------------------------------------------------
     * BACKWARD-COMPATIBLE SOURCE FIELDS
     * --------------------------------------------------
     */

    loan.officialUrl = SOURCE_URL;
    loan.sourceUrl = SOURCE_URL;
    loan.sourceName = 'State Bank of India';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - SBI education-loan scheme rates verified; scheme-specific terms require further separation';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('SBI EDUCATION VERIFICATION COMPLETE');
    console.log('========================================');

    console.log(`Product: ${loan.productName}`);
    console.log(`Status: ${loan.verification.overallStatus}`);
    console.log(`Score: ${loan.verification.verificationScore}`);
    console.log(
      `Verified at: ${loan.verification.verifiedAt.toISOString()}`
    );

    console.log('\nVerification completed successfully.');
  } catch (error) {
    console.error(
      'SBI Education verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();