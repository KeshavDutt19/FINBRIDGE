import mongoose from 'mongoose';

const searchCacheSchema =
  new mongoose.Schema(
    {
      queryHash: {
        type: String,
        required: true,
        unique: true
      },

      query: {
        type: String,
        required: true
      },

      source: {
        type: String,
        required: true
      },

      results: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
      },

      fetchedAt: {
        type: Date,
        default: Date.now,
        index: true
      },

      expiresAt: {
        type: Date,
        required: true,
        index: true
      }
    },
    {
      timestamps: true
    }
  );

export default mongoose.model(
  'SearchCache',
  searchCacheSchema
);
