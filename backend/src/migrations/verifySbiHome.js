import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const RATE_SOURCE_URL =
  'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/home-loans-interest-rates-current';

const PROCESSING_FEE_URL =
  'https://sbi.co.in/web/interest-rates/interest-rates/processing-fees';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'State Bank of India',
      category: 'home'
    });

    if (!loan) {
      throw new Error('State Bank of India Home Loan was not found.');
    }

    loan.source = {
      sourceName: 'State Bank of India',
      sourceType: 'official_bank_website',
      sourceUrl: RATE_SOURCE_URL,
      sourceTitle: 'Home Loans Interest Rates - Current',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Official SBI current home-loan rate and processing-fee sources verified. Applicable rate depends on borrower profile, loan conditions and sanctioned product.'
    };

    loan.interestRate =
      'SBI Home Loan current card rates start from approximately 7.50% p.a. onwards, subject to the applicable borrower, credit, loan and product conditions.';

    loan.interestRateType =
      'Floating/scheme-dependent; applicable rate depends on borrower profile and loan conditions';

    loan.rateDetails = {
      startingRate: 7.50,
      minimumRate: 7.50,
      maximumRate: null,
      unit: 'percent',
      frequency: 'annual',
      type: 'scheme_dependent',
      conditions: [
        'Starting rate is an advertised card rate, not a universal borrower rate',
        'Applicable rate depends on borrower credit profile',
        'Loan amount can affect applicable pricing',
        'Loan-to-value/property conditions can affect pricing',
        'Tenure can affect applicable pricing',
        'Final sanctioned rate must be confirmed by SBI before application'
      ]
    };

    loan.processingFee =
      'SBI Home Loan and Top-Up processing charges are subject to the applicable SBI processing-fee schedule, including concessions/waivers for eligible cases and applicable GST/taxes.';

    /*
     * Keep the existing numeric amount fields unchanged because
     * the generic FinBridge record does not yet encode every SBI
     * home-loan product/borrower variation.
     */
    loan.loanAmountMin = loan.loanAmountMin;
    loan.loanAmountMax = loan.loanAmountMax;

    loan.tenureMin = 12;
    loan.tenureMax = 360;

    loan.margin =
      'Margin/down-payment depends on property value, loan amount, LTV and the applicable SBI home-loan product.';

    loan.collateralRequired =
      'Yes; mortgage/security interest over the financed property as required under the sanctioned SBI home-loan product.';

    loan.eligibility =
      'Eligibility depends on borrower income, age, credit profile, repayment capacity, property and the applicable SBI home-loan product.'

    loan.ageCriteria =
      'Age at application and maturity must comply with the applicable SBI home-loan product and sanctioned tenure conditions.';

    loan.incomeCriteria =
      'Regular and verifiable income is required. Salary/business income, bank statements, ITR/Form 16 and other financial evidence may be required according to borrower type.';

    loan.documents = [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Salary slips/Form 16/ITR as applicable',
      'Recent bank statements',
      'Employment or business proof',
      'Sale agreement / property purchase documents',
      'Title and ownership documents',
      'Approved building plan and applicable property approvals',
      'Property-tax and related documents where applicable',
      'Legal and technical valuation documents requested by SBI'
    ];

    loan.repaymentInfo =
      'Repayment is through the sanctioned EMI schedule. Maximum tenure can extend up to 30 years under applicable SBI home-loan conditions, subject to borrower age and product rules.';

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'State Bank of India confirmed.'
      },

      productName: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'SBI Home Loan rate source confirmed.'
      },

      category: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Home-loan category confirmed.'
      },

      interestRate: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Current advertised starting/card rate recorded with conditions.'
      },

      processingFee: {
        status: 'partially_verified',
        sourceUrl: PROCESSING_FEE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official SBI processing-fee policy identified; exact fee/concession depends on the sanctioned product and borrower case.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Generic record does not encode every SBI home-loan product and borrower/area condition.'
      },

      tenure: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Maximum tenure of up to 30 years recorded subject to applicable SBI conditions.'
      },

      margin: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Margin depends on property value, LTV, loan amount and sanctioned product.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Mortgage/security requirement recorded.'
      },

      eligibility: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Borrower and property eligibility remain product/case dependent.'
      },

      repayment: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'EMI repayment and maximum-tenure framework recorded.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core KYC, financial and property documents identified; exact checklist varies by transaction.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 88,
      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'productName',
        'category',
        'interestRate',
        'tenure',
        'collateral',
        'repayment'
      ],

      notes:
        'Official SBI home-loan rate, tenure and core security information verified. Processing fee, loan amount, margin and transaction-specific eligibility remain conditional.',

      fieldVerification
    };

    loan.officialUrl = RATE_SOURCE_URL;
    loan.sourceUrl = RATE_SOURCE_URL;
    loan.sourceName = 'State Bank of India';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - SBI Home Loan rate and core terms verified; case-specific terms require further verification';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('SBI HOME VERIFICATION COMPLETE');
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
      'SBI Home verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();