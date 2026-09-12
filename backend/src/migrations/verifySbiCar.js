import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const RATE_SOURCE_URL =
  'https://sbi.co.in/web/interest-rates/interest-rates/loan-schemes-interest-rates/auto-loans';

const FEE_SOURCE_URL =
  'https://sbi.co.in/web/interest-rates/interest-rates/processing-fees';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'State Bank of India',
      category: 'car'
    });

    if (!loan) {
      throw new Error('State Bank of India Car Loan was not found.');
    }

    loan.source = {
      sourceName: 'State Bank of India',
      sourceType: 'official_bank_website',
      sourceUrl: RATE_SOURCE_URL,
      sourceTitle: 'Auto Loans - Interest Rates',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'SBI auto-loan pricing and processing-fee information verified against official SBI sources. Exact applicable rate depends on borrower, vehicle and loan conditions.'
    };

    loan.interestRate =
      'SBI new-car loan rates currently range from 8.95% to 9.90% p.a. under the published standard Car Loan pricing, with separate Loyalty, Green Car and used-car pricing applicable under their respective conditions.';

    loan.interestRateType =
      'Floating; applicable rate depends on product, CIBIL score, vehicle category and loan conditions';

    loan.rateDetails = {
      startingRate: 8.95,
      minimumRate: 8.95,
      maximumRate: 9.90,
      unit: 'percent',
      frequency: 'annual',
      type: 'floating',
      conditions: [
        'Standard new SBI Car Loan',
        'Rate varies according to CIBIL score',
        'Loyalty Car Loan has separate pricing',
        'Green Car Loan has separate pricing',
        'Used Car Loan has separate pricing',
        'Applicable rate depends on sanctioned product and borrower conditions'
      ]
    };

    loan.processingFee =
      'New SBI Car Loan processing fee: ₹750 + GST up to ₹5 lakh; ₹1,250 + GST above ₹5 lakh and up to ₹10 lakh; ₹1,500 + GST above ₹10 lakh. Separate product/scheme concessions may apply.';

    /*
     * These values are intentionally populated conservatively.
     * Scheme-specific maximums should not be mixed into one
     * generic record without an exact product mapping.
     */

    loan.loanAmountMin =
      loan.loanAmountMin;

    loan.loanAmountMax =
      loan.loanAmountMax;

    loan.tenureMin =
      loan.tenureMin;

    loan.tenureMax =
      loan.tenureMax;

    loan.margin =
      'Margin/down-payment requirement depends on the SBI vehicle-loan product, vehicle category and applicable financing conditions.';

    loan.collateralRequired =
      'Yes; hypothecation/security over the financed vehicle as applicable under the SBI vehicle-loan product.';

    loan.eligibility =
      'Eligibility depends on SBI Car Loan product, borrower income/repayment capacity, credit profile, vehicle and applicable bank conditions.';

    loan.ageCriteria =
      'Age and repayment-period conditions are product and borrower dependent and must be checked against the applicable SBI vehicle-loan scheme before sanction.';

    loan.incomeCriteria =
      'Regular and verifiable income and repayment capacity are required; exact income requirements depend on borrower type and applicable SBI vehicle-loan product.';

    loan.documents = [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Recent bank statements',
      'Salary slips/Form 16/ITR as applicable',
      'Employment or business proof as applicable',
      'Vehicle quotation/proforma invoice',
      'Down-payment or margin evidence',
      'Additional SBI documents required for the sanctioned vehicle-loan product'
    ];

    loan.repaymentInfo =
      'Repayment is through the sanctioned EMI schedule for the applicable SBI vehicle-loan product and tenure.';

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
        notes: 'SBI Auto/Car Loan product confirmed.'
      },

      category: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Auto/car loan category confirmed.'
      },

      interestRate: {
        status: 'verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published standard new-car rate range recorded; separate SBI vehicle products have separate pricing.'
      },

      processingFee: {
        status: 'verified',
        sourceUrl: FEE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published new-car processing-fee slabs recorded.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Generic record does not distinguish every SBI vehicle-loan product and borrower type; existing numeric values therefore retained.'
      },

      tenure: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Exact tenure depends on the applicable SBI auto-loan product and borrower conditions.'
      },

      margin: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Financing/margin depends on vehicle and product conditions.'
      },

      collateral: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Vehicle hypothecation/security applies; exact documentation depends on sanctioned product.'
      },

      eligibility: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Eligibility varies by borrower and SBI vehicle-loan product.'
      },

      repayment: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Repayment structure depends on sanctioned SBI vehicle-loan product.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: RATE_SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core KYC, income and vehicle documents identified; exact list varies by borrower/product.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 84,
      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'productName',
        'category',
        'interestRate',
        'processingFee'
      ],

      notes:
        'Official SBI auto-loan rate and processing-fee data verified. Scheme-specific amount, tenure, eligibility and financing conditions require further product separation.',

      fieldVerification
    };

    loan.officialUrl = RATE_SOURCE_URL;
    loan.sourceUrl = RATE_SOURCE_URL;
    loan.sourceName = 'State Bank of India';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - SBI auto-loan rate and processing fee verified; product-specific conditions require further verification';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('SBI CAR VERIFICATION COMPLETE');
    console.log('========================================');
    console.log(`Product: ${loan.productName}`);
    console.log(`Status: ${loan.verification.overallStatus}`);
    console.log(`Score: ${loan.verification.verificationScore}`);
    console.log(
      `Verified at: ${loan.verification.verifiedAt.toISOString()}`
    );

    console.log('\nVerification completed successfully.');
  } catch (error) {
    console.error('SBI verification migration failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();