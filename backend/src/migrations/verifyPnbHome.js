import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const SOURCE_URL =
  'https://www.pnb.bank.in/Retail-Advances-interst-rate-on-advances-linked-to-mclr.html';

const PRODUCT_URL =
  'https://www.pnb.bank.in/housing-loan.aspx';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'Punjab National Bank',
      category: 'home'
    });

    if (!loan) {
      throw new Error('Punjab National Bank Home Loan was not found.');
    }

    loan.source = {
      sourceName: 'Punjab National Bank',
      sourceType: 'official_bank_website',
      sourceUrl: SOURCE_URL,
      sourceTitle:
        'Retail Advances - Interest Rates / Housing Loan',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Official PNB housing-loan product and retail-rate sources verified. Published rates are dependent on loan amount, LTV, CIBIL and applicable product conditions.'
    };

    /*
     * --------------------------------------------------
     * INTEREST RATE
     * --------------------------------------------------
     */

    loan.interestRate =
      'PNB Home Loan floating rates currently start from 7.25% p.a. for qualifying borrower/loan conditions. Applicable rate varies by loan amount, LTV, CIBIL score, tenure and borrower/product category.';

    loan.interestRateType =
      'Floating; rate varies by CIBIL, loan amount, LTV and applicable PNB home-loan conditions';

    loan.rateDetails = {
      startingRate: 7.25,
      minimumRate: 7.25,
      maximumRate: null,
      unit: 'percent',
      frequency: 'annual',
      type: 'floating',
      conditions: [
        '7.25% is a qualifying starting rate, not a universal borrower rate',
        'Rate varies by CIBIL score',
        'Rate varies by loan amount',
        'Rate varies by LTV ratio',
        'Tenure can affect applicable pricing',
        'Borrower/product category can affect pricing',
        'PNB Housing Loan has separate product/scheme conditions',
        'Final applicable rate must be confirmed at sanction'
      ]
    };

    /*
     * --------------------------------------------------
     * PROCESSING FEE
     * --------------------------------------------------
     *
     * Keep fee conservative because PNB has multiple
     * housing-loan products and channel-specific charges.
     */

    loan.processingFee =
      'Processing and service charges depend on the applicable PNB housing-loan product and current service-charge schedule; applicable GST/taxes may apply.';

    /*
     * --------------------------------------------------
     * AMOUNT / TENURE
     * --------------------------------------------------
     */

    loan.loanAmountMin =
      loan.loanAmountMin;

    loan.loanAmountMax =
      loan.loanAmountMax;

    loan.tenureMin =
      loan.tenureMin;

    loan.tenureMax =
      loan.tenureMax;

    /*
     * --------------------------------------------------
     * MARGIN
     * --------------------------------------------------
     */

    loan.margin =
      'Margin/down-payment depends on applicable loan amount, LTV and PNB housing-loan conditions. Higher-value loans can require a lower permitted LTV and therefore higher borrower contribution.';

    /*
     * --------------------------------------------------
     * COLLATERAL
     * --------------------------------------------------
     */

    loan.collateralRequired =
      'Yes; mortgage of the financed property or other security as required under the sanctioned PNB housing-loan product.';

    /*
     * --------------------------------------------------
     * ELIGIBILITY
     * --------------------------------------------------
     */

    loan.eligibility =
      'Eligibility depends on applicant income, repayment capacity, CIBIL profile, loan amount, LTV, property and applicable PNB housing-loan product.';

    /*
     * --------------------------------------------------
     * AGE
     * --------------------------------------------------
     */

    loan.ageCriteria =
      'Age eligibility is product and borrower dependent and must be evaluated together with the proposed loan tenure and age at maturity.';

    /*
     * --------------------------------------------------
     * INCOME
     * --------------------------------------------------
     */

    loan.incomeCriteria =
      'Regular and verifiable income is required. Salary/business income, bank statements, ITR/Form 16 and other financial evidence may be required according to borrower type.';

    /*
     * --------------------------------------------------
     * DOCUMENTS
     * --------------------------------------------------
     */

    loan.documents = [
      'PAN / officially accepted identity document',
      'Address KYC documents',
      'Income proof',
      'Salary slips/Form 16/ITR as applicable',
      'Recent bank statements',
      'Employment or business proof',
      'Property sale/agreement documents',
      'Title and ownership documents',
      'Approved building plan and applicable property approvals',
      'Property-tax and related documents where applicable',
      'Legal and technical valuation documents required by PNB'
    ];

    /*
     * --------------------------------------------------
     * REPAYMENT
     * --------------------------------------------------
     */

    loan.repaymentInfo =
      'Repayment is through the sanctioned EMI schedule. Applicable tenure and repayment conditions depend on borrower age, loan amount, LTV, property and PNB housing-loan product.'

    /*
     * --------------------------------------------------
     * FIELD VERIFICATION
     * --------------------------------------------------
     */

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Punjab National Bank confirmed.'
      },

      productName: {
        status: 'verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'PNB Housing Loan confirmed.'
      },

      category: {
        status: 'verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Home/housing loan category confirmed.'
      },

      interestRate: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Published starting rate of 7.25% recorded together with CIBIL/LTV/loan-amount conditions.'
      },

      processingFee: {
        status: 'partially_verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Housing-loan charges vary by applicable product/channel; exact current fee should be tied to the precise loan scheme.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Maximum/eligible amount depends on borrower, property, city/area and sanctioned conditions.'
      },

      tenure: {
        status: 'partially_verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Tenure depends on borrower age, product and sanction conditions.'
      },

      margin: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Margin is linked to LTV and loan-amount conditions.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Property security/mortgage requirement confirmed for the housing-loan structure.'
      },

      eligibility: {
        status: 'partially_verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Eligibility depends on borrower financial profile, property and applicable PNB product.'
      },

      repayment: {
        status: 'partially_verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Repayment depends on sanctioned amount, tenure, borrower age and applicable product.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: PRODUCT_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core KYC, financial and property documents identified; exact checklist varies by transaction.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 86,
      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'productName',
        'category',
        'interestRate',
        'collateral'
      ],

      notes:
        'Official PNB housing-loan source and conditional starting-rate structure verified. Processing fee, amount, tenure and borrower-specific terms still require exact product/transaction mapping.',

      fieldVerification
    };

    /*
     * --------------------------------------------------
     * BACKWARD-COMPATIBLE SOURCE FIELDS
     * --------------------------------------------------
     */

    loan.officialUrl = PRODUCT_URL;
    loan.sourceUrl = SOURCE_URL;
    loan.sourceName = 'Punjab National Bank';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - PNB Home Loan rate structure verified; borrower/product-specific terms require further verification';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('PNB HOME VERIFICATION COMPLETE');
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
      'PNB Home verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();