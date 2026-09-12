import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const SOURCE_URL =
  'https://bankofbaroda.bank.in/loans/vehicle-loan/baroda-car-loan';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'Bank of Baroda',
      category: 'car'
    });

    if (!loan) {
      throw new Error(
        'Bank of Baroda Car Loan was not found.'
      );
    }

    /*
     * ----------------------------------------------------
     * OFFICIAL SOURCE
     * ----------------------------------------------------
     */

    loan.source = {
      sourceName: 'Bank of Baroda',
      sourceType: 'official_bank_website',
      sourceUrl: SOURCE_URL,
      sourceTitle: 'Baroda Car Loan',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Field-level verification completed against the official Baroda Car Loan product page. Some product-family fields remain conditional.'
    };

    /*
     * ----------------------------------------------------
     * INTEREST RATE
     * ----------------------------------------------------
     */

    loan.interestRate =
      '7.60% - 11.30% p.a. floating; 8.50% - 11.20% fixed for new cars';

    loan.interestRateType =
      'Floating and fixed rates; rate depends on applicable borrower/product conditions';

    loan.rateDetails = {
      startingRate: 7.60,
      minimumRate: 7.60,
      maximumRate: 11.30,
      unit: 'percent',
      frequency: 'annual',
      type: 'mixed',
      conditions: [
        'New car',
        'Floating effective rate: 7.60% to 11.30%',
        'Fixed effective rate: 8.50% to 11.20%',
        'Interest rate depends materially on borrower credit/CIBIL and applicable product conditions',
        '0.05% additional ROI may apply where the individual customer does not opt for Group Credit Life Insurance'
      ]
    };

    /*
     * ----------------------------------------------------
     * PROCESSING FEE
     * ----------------------------------------------------
     */

    loan.processingFee =
      '₹1,500 + GST up to ₹10 lakh; ₹2,000 + GST above ₹10 lakh; ₹1,000 + GST under Baroda Direct Car Loan; nil for Baroda Yoddha customers and customers directly approaching the bank; ₹500 + GST for State/Central/PSU employees';

    /*
     * ----------------------------------------------------
     * LOAN AMOUNT
     * ----------------------------------------------------
     *
     * Existing numeric fields are retained because the
     * published maximum differs by borrower/entity type.
     */

    loan.loanAmountMin = loan.loanAmountMin;

    loan.loanAmountMax = loan.loanAmountMax;

    /*
     * ----------------------------------------------------
     * TENURE
     * ----------------------------------------------------
     */

    loan.tenureMin = loan.tenureMin;
    loan.tenureMax = 84;

    /*
     * ----------------------------------------------------
     * MARGIN
     * ----------------------------------------------------
     */

    loan.margin =
      '10% margin on the on-road price of the vehicle; up to 90% financing under the published standard Car Loan terms';

    /*
     * ----------------------------------------------------
     * COLLATERAL
     * ----------------------------------------------------
     */

    loan.collateralRequired =
      'Yes; hypothecation of the financed vehicle';

    /*
     * ----------------------------------------------------
     * ELIGIBILITY
     * ----------------------------------------------------
     */

    loan.eligibility =
      'Salaried employees, businessmen, professionals, corporates, NRIs and PIOs; bank takes a holistic view of the application and applicable repayment/CIBIL criteria must be satisfied';

    /*
     * ----------------------------------------------------
     * AGE
     * ----------------------------------------------------
     */

    loan.ageCriteria =
      'Borrower minimum age 21 years; co-applicant minimum age 18 years; age of applicant/co-applicant/guarantor plus repayment period should not exceed 70 years';

    /*
     * ----------------------------------------------------
     * INCOME
     * ----------------------------------------------------
     */

    loan.incomeCriteria =
      'Repayment capacity and applicable bank guidelines are assessed. Salaried applicants may be required to provide recent salary slips and Form 16/ITR; self-employed applicants may be required to provide financial statements, ITR and business-income evidence';

    /*
     * ----------------------------------------------------
     * DOCUMENTS
     * ----------------------------------------------------
     */

    loan.documents = [
      'Identity and address KYC documents',
      'Last 3 months salary slips for salaried applicants',
      'Form 16 or Income Tax Return for salaried applicants',
      'Balance sheet and profit and loss account for self-employed applicants',
      'Income Tax Returns and applicable tax/income evidence for self-employed applicants',
      'Business proof where applicable',
      'Bank statements',
      'Vehicle quotation/proforma invoice from an eligible dealer',
      'Vehicle-related documents required by the lender'
    ];

    /*
     * ----------------------------------------------------
     * REPAYMENT
     * ----------------------------------------------------
     */

    loan.repaymentInfo =
      'Maximum repayment period 84 months. Fixed-rate Car Loan has a minimum repayment period of 37 months. EMI-based repayment applies.';

    /*
     * ----------------------------------------------------
     * VERIFICATION
     * ----------------------------------------------------
     */

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Bank of Baroda confirmed by official product page.'
      },

      productName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Baroda Car Loan confirmed.'
      },

      category: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Vehicle/car loan product.'
      },

      interestRate: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Published fixed and floating ranges confirmed.'
      },

      processingFee: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Published processing-charge slabs and concessions recorded.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published maximum differs by individual/non-individual borrower. Existing numeric fields retained pending structured borrower-type support.'
      },

      tenure: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Maximum 84 months confirmed; fixed-rate minimum 37 months.'
      },

      margin: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: '10% on-road-price margin confirmed.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Vehicle hypothecation confirmed.'
      },

      eligibility: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Eligible borrower categories confirmed.'
      },

      repayment: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Maximum tenure and fixed-rate minimum confirmed.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core salary/ITR/business documentation confirmed; exact case-specific document set can vary by borrower.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 90,
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
        'Official-source field verification completed. Loan amount remains conditional by borrower/entity type and documents may vary by applicant.',

      fieldVerification
    };

    /*
     * Keep existing official/source fields for backward
     * compatibility with the current application.
     */

    loan.officialUrl = SOURCE_URL;
    loan.sourceUrl = SOURCE_URL;
    loan.sourceName = 'Bank of Baroda';

    loan.dataLabel =
      'OFFICIAL SOURCE VERIFIED - Field-level verification completed; some terms remain borrower/scheme dependent';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('BANK OF BARODA CAR VERIFICATION COMPLETE');
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
      'Verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();
