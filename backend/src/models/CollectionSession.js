import mongoose from "mongoose";

const collectionSessionSchema = new mongoose.Schema(
  {
    loanProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
      index: true,
    },

    bank: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    finishedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "running",
        "completed",
        "failed",
      ],
      default: "running",
      index: true,
    },

    queriesRun: {
      type: Number,
      default: 0,
    },

    resultsFound: {
      type: Number,
      default: 0,
    },

    resultsAccepted: {
      type: Number,
      default: 0,
    },

    duplicatesRemoved: {
      type: Number,
      default: 0,
    },

    lowQualityRemoved: {
      type: Number,
      default: 0,
    },

    errorsCount: {
      type: Number,
      default: 0,
    },

    redditResults: {
      type: Number,
      default: 0,
    },

    youtubeResults: {
      type: Number,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

collectionSessionSchema.index({
  loanProductId: 1,
  startedAt: -1,
});

export default mongoose.model(
  "CollectionSession",
  collectionSessionSchema
);