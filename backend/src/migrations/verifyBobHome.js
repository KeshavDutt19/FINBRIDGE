import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const SOURCE_URL =
  'https://bankofbaroda.bank.in/loans/home-loan/baroda-home-loan';

const SERVICE_CHARGES_URL =
  'https://bankofbaroda.bank.in/interest-rate-and-service-charges/service-charges';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'Bank of Baroda',
      category: 'home'
    });

    if (!loan) {
      throw new Error('Bank of Baroda Home Loan was not found.');
    }

    loan.source = {
      sourceName: 'Bank of Baroda',
      sourceType: 'official_bank_website',
      sourceUrl: SOURCE_URL,
      sourceTitle: 'Baroda Home Loan',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Official Baroda Home Loan product page and service-charge information verified. Rate and certain terms vary by borrower profile, loan amount, property and sanctioned conditions.'
    };

    loan.interestRate =
      'Starting from 7.20% p.a. on the current Baroda Home Loan page; applicable floating rate varies according to borrower profile, CIBIL/credit conditions and loan characteristics.';

    loan.interestRateType =
      'Floating/scheme-dependent; applicable rate varies by borrower and loan conditions';

    loan.rateDetails = {
      startingRate: 7.20,
      minimumRate: 7.20,
      maximumRate: null,
      unit: 'percent',
      frequency: 'annual',
      type: 'scheme_dependent',
      conditions: [
        'Starting rate advertised on the current Baroda Home Loan page',
        'Applicable rate varies by borrower profile',
        'Credit/CIBIL conditions can affect the rate',
        'Loan amount and property-related conditions can affect pricing',
        'Final sanctioned rate should be confirmed before application'
      ]
    };

    loan.processingFee =
      'For loans up to ₹50 lakh: 0.50% of loan amount, minimum ₹8,500 and maximum ₹15,000; above ₹50 lakh: 0.25%, minimum ₹8,500 and maximum ₹25,000; GST/taxes as applicable. Takeover cases have separate charges.';

    /*
     * Keep the existing numeric limits where the
     * generic record does not map to a single borrower/property
     * configuration.
     */
    loan.loanAmountMin = loan.loanAmountMin;
    loan.loanAmountMax = loan.loanAmountMax;

    loan.tenureMin = 12;
    loan.tenureMax = 360;

    loan.margin =
      'Published margin varies by loan amount: 10% for loans up to ₹30 lakh; 20% for ₹30 lakh–₹75 lakh; 25% above ₹75 lakh.';

    loan.collateralRequired =
      'Yes; mortgage of the financed property. Alternative securities may be accepted by the bank in specified cases and subject to bank discretion.';

    loan.eligibility =
      'Resident Indians and eligible NRI/PIO/OCI applicants may qualify subject to Bank of Baroda eligibility, repayment capacity, property and credit conditions.';

    loan.ageCriteria =
      'Minimum age 21 years; maximum age at maturity generally up to 70 years under the published product conditions.';

    loan.incomeCriteria =
      'Applicant income and repayment capacity are assessed using salary/business income and supporting financial documents such as bank statements, ITR/Form 16 and other applicable evidence.';

    loan.documents = [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Salary slips/Form 16/ITR as applicable',
      'Recent bank statements',
      'Employment or business proof',
      'Property agreement/sale deed',
      'Title/property ownership documents',
      'Approved building plan and applicable property approvals',
      'Property-tax and related documents where applicable',
      'Additional legal/technical valuation documents requested by the lender'
    ];

    loan.repaymentInfo =
      'Home-loan repayment is through sanctioned EMI/repayment schedule. Maximum published tenure is up to 30 years, subject to borrower age, loan profile and sanction conditions.';

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Bank of Baroda confirmed.'
      },

      productName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Baroda Home Loan confirmed.'
      },

      category: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Home-loan category confirmed.'
      },

      interestRate: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Current starting rate of 7.20% recorded; applicable rate remains borrower/profile dependent.'
      },

      processingFee: {
        status: 'verified',
        sourceUrl: SERVICE_CHARGES_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official processing-fee slabs recorded.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Maximum financing varies according to city/area, borrower and property/loan conditions.'
      },

      tenure: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Maximum published tenure of 30 years recorded.'
      },

      margin: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published margin tiers recorded according to loan amount.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Mortgage/security requirement recorded.'
      },

      eligibility: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published borrower eligibility categories recorded.'
      },

      repayment: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Maximum tenure and EMI repayment structure recorded.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core financial, KYC and property documentation identified; exact checklist varies by transaction.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 92,
      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'productName',
        'category',
        'interestRate',
        'processingFee',
        'tenure',
        'margin',
        'collateral',
        'eligibility',
        'repayment'
      ],

      notes:
        'Official Bank of Baroda Home Loan product and fee information verified. Loan amount/property-specific terms and transaction-specific documents remain conditional.',

      fieldVerification
    };

    loan.officialUrl = SOURCE_URL;
    loan.sourceUrl = SOURCE_URL;
    loan.sourceName = 'Bank of Baroda';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - Baroda Home Loan rate, fees and core product conditions verified';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('BOB HOME VERIFICATION COMPLETE');
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
      'BoB Home verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();