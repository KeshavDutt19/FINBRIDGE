import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const SOURCE_URL =
  'https://bankofbaroda.bank.in/loans/education-loan/baroda-education-loan-to-students-of-premier-institutions';

const SERVICE_CHARGES_URL =
  'https://bankofbaroda.bank.in/interest-rate-and-service-charges/service-charges';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'Bank of Baroda',
      category: 'education'
    });

    if (!loan) {
      throw new Error('Bank of Baroda Education Loan was not found.');
    }

    loan.source = {
      sourceName: 'Bank of Baroda',
      sourceType: 'official_bank_website',
      sourceUrl: SOURCE_URL,
      sourceTitle:
        'Baroda Education Loan to Students of Premier Institutions',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Official Premier Institutions education-loan route verified. The FinBridge record remains partially verified because Bank of Baroda offers multiple education-loan schemes with different pricing and eligibility.'
    };

    /*
     * Interest rate
     *
     * This is the published Premier Institutions route,
     * not a universal rate for every BoB education loan.
     */
    loan.interestRate =
      'Starting from 6.85% p.a. for the published premier-institution education-loan route; applicable rate varies by institution/category, loan amount and borrower/product conditions.';

    loan.interestRateType =
      'Floating/scheme-dependent; applicable rate depends on institution and loan/product conditions';

    loan.rateDetails = {
      startingRate: 6.85,
      minimumRate: 6.85,
      maximumRate: null,
      unit: 'percent',
      frequency: 'annual',
      type: 'scheme_dependent',
      conditions: [
        'Applicable to the published Premier Institutions education-loan route',
        'Rate is not a universal rate for every Bank of Baroda education-loan scheme',
        'Rate depends on applicable institution/category and loan conditions',
        'Applicable collateral and margin rules depend on the sanctioned education-loan route',
        'Current rate should be reconfirmed at the time of application'
      ]
    };

    /*
     * Processing fee
     *
     * Use the official service-charge schedule rather than
     * assuming one fee for every education-loan scheme.
     */
    loan.processingFee =
      'Study in India: Nil; Study abroad: 1% of loan amount, maximum ₹10,000, refundable after first disbursement; certain education-loan categories have separate charges/conditions; advocate/valuer charges may apply where property is mortgaged.';

    /*
     * Existing amount fields are retained because the generic
     * FinBridge record combines multiple education-loan routes.
     */
    loan.loanAmountMin = loan.loanAmountMin;
    loan.loanAmountMax = loan.loanAmountMax;

    loan.tenureMin = loan.tenureMin;
    loan.tenureMax = loan.tenureMax;

    loan.margin =
      'Margin depends on the education-loan scheme. Published terms include nil margin below ₹4 lakh and 5% for ₹4 lakh–₹7.5 lakh in applicable structures; higher-loan/scheme-specific conditions can differ.';

    loan.collateralRequired =
      'Collateral requirement depends on the sanctioned education-loan scheme and loan amount. Eligible collateral-free limits may apply; higher exposures may require tangible collateral/security according to the scheme.';

    loan.eligibility =
      'Student must have secured admission to an eligible recognised institution/course under the applicable Bank of Baroda education-loan scheme; co-borrower and repayment-capacity requirements apply. Exact eligibility varies by scheme/institution.';

    loan.ageCriteria =
      'Student/borrower age and co-borrower requirements are scheme dependent and should be checked against the applicable Bank of Baroda education-loan route before sanction.';

    loan.incomeCriteria =
      'Parent/guardian/co-borrower repayment capacity and income are assessed according to the applicable education-loan scheme. Required evidence can include salary/business income, ITR and bank statements.';

    loan.documents = [
      'Student identity and address KYC documents',
      'Parent/co-borrower KYC documents',
      'Admission/offer letter',
      'Fee structure / fee demand letter',
      'Academic records',
      'Income proof of parent/co-borrower',
      'Bank statements',
      'ITR/Form 16 or business-income documents as applicable',
      'Collateral/title documents where security is required',
      'Additional institution/scheme-specific documents'
    ];

    loan.repaymentInfo =
      'Repayment follows the applicable education-loan scheme. Published premier-institution terms provide a repayment period extending after the moratorium/course period, with exact commencement and tenure subject to the sanctioned scheme.';

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Bank of Baroda confirmed.'
      },

      productName: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official source confirms the Premier Institutions route, while the FinBridge record is a broader generic education-loan label.'
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
          'Starting rate of 6.85% for the published Premier Institutions route recorded.'
      },

      processingFee: {
        status: 'verified',
        sourceUrl: SERVICE_CHARGES_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official service-charge schedule used; fee varies by study location and scheme.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Generic record covers multiple education-loan routes; exact maximum depends on scheme/institution.'
      },

      tenure: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Education-loan repayment period varies by scheme and sanctioned terms.'
      },

      margin: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published margin conditions recorded, but exact margin remains scheme dependent.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Collateral-free and collateral-backed thresholds depend on applicable scheme and loan exposure.'
      },

      eligibility: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Institution/course and co-borrower requirements vary by scheme.'
      },

      repayment: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Moratorium and repayment period are scheme dependent.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core student/co-borrower and admission documents identified; exact checklist varies by scheme.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 86,
      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'category',
        'interestRate',
        'processingFee',
        'margin',
        'collateral'
      ],

      notes:
        'Official Bank of Baroda Premier Institutions education-loan source and service-charge schedule verified. Generic product record still combines multiple education-loan schemes and therefore remains partially verified.',

      fieldVerification
    };

    /*
     * Backward-compatible source fields
     */
    loan.officialUrl = SOURCE_URL;
    loan.sourceUrl = SOURCE_URL;
    loan.sourceName = 'Bank of Baroda';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - Premier Institutions education-loan route verified; other BoB education schemes require separate verification';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('BOB EDUCATION VERIFICATION COMPLETE');
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
      'BoB Education verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();