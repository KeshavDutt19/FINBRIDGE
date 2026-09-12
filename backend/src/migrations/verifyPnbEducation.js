import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';

const SOURCE_URL =
  'https://www.pnb.bank.in/Retail-Advances-interst-rate-on-advances-linked-to-mclr.html';

const VERIFIED_AT = new Date();

async function runVerification() {
  try {
    await connectDB();

    const loan = await LoanProduct.findOne({
      bankName: 'Punjab National Bank',
      category: 'education'
    });

    if (!loan) {
      throw new Error('Punjab National Bank Education Loan was not found.');
    }

    loan.source = {
      sourceName: 'Punjab National Bank',
      sourceType: 'official_bank_website',
      sourceUrl: SOURCE_URL,
      sourceTitle: 'Retail Advances - Interest Rates / Education Loans',
      lastVerified: VERIFIED_AT,
      verificationStatus: 'partially_verified',
      verificationNotes:
        'Official PNB education-loan pricing verified. The FinBridge record remains partially verified because PNB education products and pricing conditions vary by scheme, collateral, borrower category and loan amount.'
    };

    loan.interestRate =
      'PNB education-loan rates are scheme and borrower dependent. The current official retail-rate table includes PNB Saraswati pricing starting at 8.10% p.a. for qualifying conditions, with other education-loan rates varying by collateral, loan amount, borrower category and applicable scheme.';

    loan.interestRateType =
      'Floating/scheme-dependent; rate varies by applicable PNB education-loan scheme and borrower conditions';

    loan.rateDetails = {
      startingRate: 8.10,
      minimumRate: 8.10,
      maximumRate: null,
      unit: 'percent',
      frequency: 'annual',
      type: 'scheme_dependent',
      conditions: [
        'PNB Saraswati is a specific education-loan scheme',
        'Published rate depends on the applicable scheme',
        'Rate varies with collateral/security conditions',
        'Rate can vary according to loan amount',
        'Borrower/student category can affect pricing',
        'Female-student concessions may apply under applicable schemes',
        'Study in India and study abroad conditions can differ',
        'CGFSEL-eligible education loans may have separate conditions'
      ]
    };

    loan.processingFee =
      'Processing charges depend on the applicable PNB education-loan scheme; domestic-study and overseas-study charges can differ and applicable taxes may apply.';

    loan.loanAmountMin = loan.loanAmountMin;
    loan.loanAmountMax = loan.loanAmountMax;

    loan.tenureMin = loan.tenureMin;
    loan.tenureMax = loan.tenureMax;

    loan.margin =
      'Margin depends on the applicable education-loan scheme. Standard published structures include nil margin up to specified thresholds and higher margins for larger loans or study-abroad cases.';

    loan.collateralRequired =
      'Collateral requirement depends on the applicable scheme and sanctioned loan amount. Eligible collateral-free CGFSEL structures may apply up to scheme limits; higher exposures can require tangible collateral/security.';

    loan.eligibility =
      'Eligibility depends on recognised institution/course, student academic/admission status, co-borrower profile, repayment capacity and applicable PNB education-loan scheme.';

    loan.ageCriteria =
      'Age requirements depend on the applicable PNB education-loan scheme and student/co-borrower structure.';

    loan.incomeCriteria =
      'Parent/co-borrower repayment capacity and verifiable income are assessed according to the applicable PNB scheme. Salary/business income, ITR and bank statements may be required.';

    loan.documents = [
      'Student KYC documents',
      'Parent/co-borrower KYC documents',
      'Admission/offer letter',
      'Course and institution details',
      'Fee structure / fee demand letter',
      'Academic records',
      'Income proof of parent/co-borrower',
      'Bank statements',
      'ITR/Form 16 or business-income records as applicable',
      'Collateral/title documents where required',
      'Additional scheme-specific documents'
    ];

    loan.repaymentInfo =
      'Repayment follows the sanctioned PNB education-loan scheme. Moratorium and repayment tenure depend on the applicable course, scheme and sanction conditions.';

    const fieldVerification = {
      bankName: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes: 'Punjab National Bank confirmed.'
      },

      productName: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Official PNB education-loan schemes are confirmed, but the existing record combines multiple products.'
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
          'Current official PNB education-loan pricing framework and PNB Saraswati starting rate recorded.'
      },

      processingFee: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Fee treatment is scheme dependent and requires exact scheme selection for a final product-level fee.'
      },

      loanAmount: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Existing generic amount fields combine multiple PNB education-loan routes.'
      },

      tenure: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Repayment tenure depends on the applicable education-loan scheme.'
      },

      margin: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Margin varies by loan amount, study destination and applicable scheme.'
      },

      collateral: {
        status: 'verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Collateral-free and collateral-backed education-loan structures are reflected in the published schemes.'
      },

      eligibility: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Institution, course, borrower and scheme conditions must be tied to the exact loan route.'
      },

      repayment: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Moratorium and repayment period vary by education-loan scheme.'
      },

      documents: {
        status: 'partially_verified',
        sourceUrl: SOURCE_URL,
        verifiedAt: VERIFIED_AT,
        notes:
          'Core admission, KYC, income and security documentation identified; exact checklist depends on scheme.'
      }
    };

    loan.verification = {
      overallStatus: 'partially_verified',
      verificationScore: 84,
      verifiedAt: VERIFIED_AT,

      verifiedFields: [
        'bankName',
        'category',
        'interestRate',
        'collateral'
      ],

      notes:
        'Official PNB education-loan rate framework verified. Product-level fee, amount, tenure and eligibility remain scheme dependent.',

      fieldVerification
    };

    loan.officialUrl = SOURCE_URL;
    loan.sourceUrl = SOURCE_URL;
    loan.sourceName = 'Punjab National Bank';

    loan.dataLabel =
      'OFFICIAL SOURCE PARTIALLY VERIFIED - PNB education-loan pricing verified; exact scheme-specific terms require further separation';

    loan.lastUpdated = VERIFIED_AT;

    await loan.save();

    console.log('\n========================================');
    console.log('PNB EDUCATION VERIFICATION COMPLETE');
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
      'PNB Education verification migration failed:',
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runVerification();