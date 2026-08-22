import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../db.js';
import User from '../models/User.js';
import Scholarship from '../models/Scholarship.js';
import LoanProduct from '../models/LoanProduct.js';
import SyncLog from '../models/SyncLog.js';
import { scholarshipSeed, loanSeed } from './seedData.js';
import { normalizeScholarship, normalizeLoan } from '../services/ingestion/normalize.js';

dotenv.config();

async function run() {
  await connectDB();
  await Scholarship.deleteMany({});
  await LoanProduct.deleteMany({});
  await SyncLog.deleteMany({});
  await Scholarship.insertMany(scholarshipSeed.map(normalizeScholarship));
  await LoanProduct.insertMany(loanSeed.map(normalizeLoan));

  const passwordHash = await bcrypt.hash('password123', 12);
  await User.updateOne(
    { email: 'demo@finbridge.dev' },
    {
      $set: {
        name: 'Aarav Demo',
        email: 'demo@finbridge.dev',
        phone: '9999999999',
        userType: 'student',
        passwordHash,
        profile: {
          age: 21,
          state: 'Maharashtra',
          city: 'Pune',
          gender: 'Female',
          category: 'SC',
          disabilityStatus: false,
          educationLevel: 'Undergraduate',
          course: 'B.Tech Computer Science',
          institution: 'Demo Institute of Technology',
          academicScore: 82,
          yearOfStudy: '2',
          annualFamilyIncome: 220000,
          employmentStatus: 'Student',
          loanType: 'education',
          desiredAmount: 800000,
          preferredTenure: 84
        }
      }
    },
    { upsert: true }
  );

  const adminHash = await bcrypt.hash('admin123', 12);
  await User.updateOne(
    { email: 'admin@finbridge.dev' },
    { $set: { name: 'FinBridge Admin', email: 'admin@finbridge.dev', phone: '9999999998', userType: 'admin', passwordHash: adminHash } },
    { upsert: true }
  );

  console.log('Seeded FinBridge verified data snapshot.');
  process.exit(0);
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
