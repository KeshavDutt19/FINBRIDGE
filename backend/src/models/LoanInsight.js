import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ['reddit', 'quora'],
      required: true
    },

    title: {
      type: String,
      default: ''
    },

    url: {
      type: String,
      required: true
    },

    snippet: {
      type: String,
      default: ''
    },

    publishedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const loanInsightSchema =
  new mongoose.Schema(
    {
      loanProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoanProduct'
      },

      bank: {
        type: String,
        required: true
      },

      category: {
        type: String,
        required: true
      },

      loanName: {
        type: String,
        default: ''
      },

      pros: {
        type: [String],
        default: []
      },

      cons: {
        type: [String],
        default: []
      },

      conclusion: {
        type: String,
        default: ''
      },

      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },

      communityStats: {
        totalSources: {
          type: Number,
          default: 0
        },

        reddit: {
          type: Number,
          default: 0
        },

        quora: {
          type: Number,
          default: 0
        },

        positiveSignals: {
          type: Number,
          default: 0
        },

        negativeSignals: {
          type: Number,
          default: 0
        }
      },

      themes: {
        type: [
          {
            key: String,
            label: String,
            positive: Number,
            negative: Number,
            mentions: Number
          }
        ],
        default: []
      },

      sources: {
        type: [sourceSchema],
        default: []
      },

      generatedAt: {
        type: Date,
        default: Date.now
      },

      expiresAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

loanInsightSchema.index(
  { loanProductId: 1 },
  {
    unique: true,
    sparse: true
  }
);

export default mongoose.model(
  'LoanInsight',
  loanInsightSchema
);