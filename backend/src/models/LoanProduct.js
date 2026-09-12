import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      default: ''
    },

    sourceType: {
      type: String,
      enum: [
        'official_bank_website',
        'official_bank_pdf',
        'government_source',
        'regulatory_source',
        'other'
      ],
      default: 'official_bank_website'
    },

    sourceUrl: {
      type: String,
      default: ''
    },

    sourceTitle: {
      type: String,
      default: ''
    },

    lastVerified: {
      type: Date,
      default: null
    },

    verificationStatus: {
      type: String,
      enum: [
        'unverified',
        'partially_verified',
        'verified'
      ],
      default: 'unverified'
    },

    verificationNotes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const rateDetailsSchema = new mongoose.Schema(
  {
    startingRate: {
      type: Number,
      default: null
    },

    minimumRate: {
      type: Number,
      default: null
    },

    maximumRate: {
      type: Number,
      default: null
    },

    unit: {
      type: String,
      default: 'percent'
    },

    frequency: {
      type: String,
      default: 'annual'
    },

    type: {
      type: String,
      enum: [
        'floating',
        'fixed',
        'mixed',
        'scheme_dependent',
        'unknown'
      ],
      default: 'unknown'
    },

    conditions: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const fieldVerificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'verified',
        'partially_verified',
        'unverified',
        'not_available_from_source'
      ],
      default: 'unverified'
    },

    sourceUrl: {
      type: String,
      default: ''
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    overallStatus: {
      type: String,
      enum: [
        'unverified',
        'partially_verified',
        'verified'
      ],
      default: 'unverified'
    },

    verificationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    verifiedFields: {
      type: [String],
      default: []
    },

    notes: {
      type: String,
      default: ''
    },

    fieldVerification: {
      bankName: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      productName: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      category: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      interestRate: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      processingFee: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      loanAmount: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      tenure: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      margin: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      collateral: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      eligibility: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      repayment: {
        type: fieldVerificationSchema,
        default: () => ({})
      },

      documents: {
        type: fieldVerificationSchema,
        default: () => ({})
      }
    }
  },
  { _id: false }
);

const loanProductSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ['car', 'education', 'home'],
      required: true
    },

    productName: {
      type: String,
      required: true
    },

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

    dataLabel: {
      type: String,
      default: 'DEMO data - verify current rate with official lender'
    },

    // ------------------------------------------------
    // OFFICIAL SOURCE VERIFICATION
    // ------------------------------------------------

    source: {
      type: sourceSchema,
      default: () => ({})
    },

    verification: {
      type: verificationSchema,
      default: () => ({})
    },

    // ------------------------------------------------
    // STRUCTURED RATE INFORMATION
    // ------------------------------------------------

    rateDetails: {
      type: rateDetailsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

loanProductSchema.index(
  {
    bankName: 1,
    category: 1,
    productName: 1
  },
  {
    unique: true
  }
);

export default mongoose.model('LoanProduct', loanProductSchema);