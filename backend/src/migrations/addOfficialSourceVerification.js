import 'dotenv/config';
import mongoose from 'mongoose';

import { connectDB } from '../db.js';
import LoanProduct from '../models/LoanProduct.js';
import officialLoanSources from '../config/officialLoanSources.js';

async function runMigration() {
  try {
    await connectDB();

    const loans = await LoanProduct.find({});

    console.log(`Found ${loans.length} loan products.`);

    if (loans.length !== 9) {
      console.warn(
        `WARNING: Expected 9 loan products, but found ${loans.length}.`
      );
    }

    let updated = 0;
    let skipped = 0;

    for (const loan of loans) {
      const key = `${loan.bankName}|${loan.category}`;

      const source = officialLoanSources[key];

      if (!source) {
        console.warn(
          `NO SOURCE MAPPING: ${loan.bankName} | ${loan.category}`
        );

        skipped++;
        continue;
      }

      loan.source = {
        sourceName: source.sourceName,
        sourceType: source.sourceType,
        sourceUrl: source.sourceUrl,
        sourceTitle: source.sourceTitle,
        lastVerified: null,
        verificationStatus: 'unverified',
        verificationNotes:
          'Official source identified. Field-level verification pending.'
      };

      loan.verification = {
        overallStatus: 'unverified',
        verificationScore: 0,
        verifiedAt: null,
        verifiedFields: [],
        notes:
          'Official source mapped. Product fields have not yet been fully verified.'
      };

      loan.rateDetails = {
        startingRate: null,
        minimumRate: null,
        maximumRate: null,
        unit: 'percent',
        frequency: 'annual',
        type: 'unknown',
        conditions: []
      };

      await loan.save();

      updated++;

      console.log(
        `SOURCE MAPPED: ${loan.bankName} | ${loan.productName}`
      );
    }

    console.log('\n========================================');
    console.log('OFFICIAL SOURCE MIGRATION COMPLETE');
    console.log('========================================');
    console.log(`Updated: ${updated}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error('Migration failed:', error);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();