import mongoose from 'mongoose';

const loanProductSchema = new mongoose.Schema(
  {
    bankName: { type: String, required: true },
    category: { type: String, enum: ['car', 'education', 'home'], required: true },
    productName: { type: String, required: true },
    description: String,
    interestRate: String,
    interestRateType: String,
    processingFee: String,
    loanAmountMin: Number,
    loanAmountMax: Number,
    tenureMin: Number,
    tenureMax: Number,
    margin: String,
    collateralRequired: String,
    eligibility: String,
    ageCriteria: String,
    incomeCriteria: String,
    documents: [String],
    subsidy: String,
    subsidyDetails: String,
    specialBenefits: [String],
    repaymentInfo: String,
    applicationProcedure: [String],
    officialUrl: String,
    sourceUrl: String,
    sourceName: String,
    lastUpdated: Date,
    disclaimer: String,
    dataLabel: { type: String, default: 'DEMO data - verify current rate with official lender' }
  },
  { timestamps: true }
);

loanProductSchema.index({ bankName: 1, category: 1, productName: 1 }, { unique: true });

export default mongoose.model('LoanProduct', loanProductSchema);
