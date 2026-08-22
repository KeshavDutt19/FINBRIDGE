import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    provider: String,
    ministry: String,
    description: String,
    category: String,
    educationLevels: [String],
    states: [String],
    eligibleCategories: [String],
    genderEligibility: { type: String, default: 'Any' },
    disabilityEligibility: { type: String, default: 'Any' },
    minPercentage: Number,
    maxFamilyIncome: Number,
    ageLimit: Number,
    benefits: String,
    amount: String,
    duration: String,
    applicationStartDate: Date,
    applicationDeadline: Date,
    requiredDocuments: [String],
    applicationProcedure: [String],
    officialUrl: String,
    sourceUrl: String,
    sourceName: String,
    lastUpdated: Date,
    status: { type: String, default: 'Demo data' },
    eligibilityRules: [String],
    termsAndConditions: String,
    dataLabel: { type: String, default: 'DEMO data - verify on official source' }
  },
  { timestamps: true }
);

scholarshipSchema.index({ title: 1, provider: 1 }, { unique: true });

export default mongoose.model('Scholarship', scholarshipSchema);
