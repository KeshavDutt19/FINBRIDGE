import mongoose from 'mongoose';

const bankSchemeSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    bankAliases: {
      type: [String],
      default: [],
    },

    schemeTitle: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        'FD',
        'Savings',
        'Loans',
        'Credit Card',
        'Offers',
      ],
      required: true,
    },

    description: {
      type: String,
      default: '',
    },

    interestRate: {
      type: String,
      default: '',
    },

    minAmount: {
      type: Number,
      default: null,
    },

    maxAmount: {
      type: Number,
      default: null,
    },

    validity: {
      type: String,
      default: '',
    },

    tags: {
      type: [String],
      default: [],
    },

    officialUrl: {
      type: String,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  'BankScheme',
  bankSchemeSchema
);