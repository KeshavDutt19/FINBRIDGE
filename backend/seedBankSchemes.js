import 'dotenv/config';
import mongoose from 'mongoose';

import BankScheme from './src/models/BankScheme.js';

const bankSchemes = [
  {
    bankName: 'HDFC Bank',

    bankAliases: [
      'hdfc',
      'hdfc bank',
      'hdfc bank limited',
    ],

    schemeTitle: 'HDFC Fixed Deposit',

    category: 'FD',

    description:
      'Illustrative fixed deposit scheme for FINBRIDGE prototype testing.',

    interestRate: '7.00%',

    minAmount: 5000,

    maxAmount: 10000000,

    validity: 'Prototype data',

    tags: [
      'FD',
      'savings',
      'fixed deposit',
    ],

    officialUrl:
      'https://www.hdfcbank.com/',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'HDFC Bank',

    bankAliases: [
      'hdfc',
      'hdfc bank',
    ],

    schemeTitle: 'HDFC Personal Loan',

    category: 'Loans',

    description:
      'Illustrative personal loan product for FINBRIDGE prototype testing.',

    interestRate: '10.50% onwards',

    minAmount: 50000,

    maxAmount: 4000000,

    validity: 'Prototype data',

    tags: [
      'personal loan',
      'loan',
    ],

    officialUrl:
      'https://www.hdfcbank.com/personal-loans',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'State Bank of India',

    bankAliases: [
      'sbi',
      'state bank of india',
    ],

    schemeTitle: 'SBI Education Loan',

    category: 'Loans',

    description:
      'Illustrative education loan product for FINBRIDGE prototype testing.',

    interestRate: '8.15% onwards',

    minAmount: 50000,

    maxAmount: 10000000,

    validity: 'Prototype data',

    tags: [
      'education',
      'student loan',
      'loan',
    ],

    officialUrl:
      'https://sbi.co.in/',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'State Bank of India',

    bankAliases: [
      'sbi',
      'state bank of india',
    ],

    schemeTitle: 'SBI Fixed Deposit',

    category: 'FD',

    description:
      'Illustrative fixed deposit product for FINBRIDGE prototype testing.',

    interestRate: '6.90%',

    minAmount: 1000,

    maxAmount: 10000000,

    validity: 'Prototype data',

    tags: [
      'FD',
      'fixed deposit',
      'savings',
    ],

    officialUrl:
      'https://sbi.co.in/',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'ICICI Bank',

    bankAliases: [
      'icici',
      'icici bank',
      'icici bank limited',
    ],

    schemeTitle: 'ICICI Fixed Deposit',

    category: 'FD',

    description:
      'Illustrative fixed deposit product for FINBRIDGE prototype testing.',

    interestRate: '7.00%',

    minAmount: 2000,

    maxAmount: 10000000,

    validity: 'Prototype data',

    tags: [
      'FD',
      'fixed deposit',
    ],

    officialUrl:
      'https://www.icicibank.com/',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'ICICI Bank',

    bankAliases: [
      'icici',
      'icici bank',
    ],

    schemeTitle: 'ICICI Personal Loan',

    category: 'Loans',

    description:
      'Illustrative personal loan product for FINBRIDGE prototype testing.',

    interestRate: '10.80% onwards',

    minAmount: 50000,

    maxAmount: 5000000,

    validity: 'Prototype data',

    tags: [
      'personal loan',
      'loan',
    ],

    officialUrl:
      'https://www.icicibank.com/personal-banking/loans/personal-loan',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'Axis Bank',

    bankAliases: [
      'axis',
      'axis bank',
    ],

    schemeTitle: 'Axis Fixed Deposit',

    category: 'FD',

    description:
      'Illustrative fixed deposit product for FINBRIDGE prototype testing.',

    interestRate: '6.90%',

    minAmount: 5000,

    maxAmount: 10000000,

    validity: 'Prototype data',

    tags: [
      'FD',
      'fixed deposit',
    ],

    officialUrl:
      'https://www.axisbank.com/',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'Punjab National Bank',

    bankAliases: [
      'pnb',
      'punjab national bank',
    ],

    schemeTitle: 'PNB Education Loan',

    category: 'Loans',

    description:
      'Illustrative education loan product for FINBRIDGE prototype testing.',

    interestRate: '8.25% onwards',

    minAmount: 50000,

    maxAmount: 7500000,

    validity: 'Prototype data',

    tags: [
      'education',
      'student loan',
    ],

    officialUrl:
      'https://www.pnbindia.in/',

    isActive: true,

    verifiedAt: new Date(),
  },

  {
    bankName: 'Bank of Baroda',

    bankAliases: [
      'bob',
      'bank of baroda',
    ],

    schemeTitle: 'Bank of Baroda Home Loan',

    category: 'Loans',

    description:
      'Illustrative home loan product for FINBRIDGE prototype testing.',

    interestRate: '8.40% onwards',

    minAmount: 100000,

    maxAmount: 100000000,

    validity: 'Prototype data',

    tags: [
      'home loan',
      'housing',
      'loan',
    ],

    officialUrl:
      'https://www.bankofbaroda.in/',

    isActive: true,

    verifiedAt: new Date(),
  },
];

async function seedBankSchemes() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log('MongoDB connected.');

    // Remove previous prototype records
    await BankScheme.deleteMany({});

    console.log(
      'Old bank scheme records removed.'
    );

    const inserted =
      await BankScheme.insertMany(
        bankSchemes
      );

    console.log(
      `${inserted.length} bank schemes inserted successfully.`
    );

    await mongoose.disconnect();

    console.log(
      'MongoDB connection closed.'
    );

    process.exit(0);

  } catch (error) {
    console.error(
      'Bank scheme seeding failed:',
      error
    );

    process.exit(1);
  }
}

seedBankSchemes();