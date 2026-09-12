import mongoose from "mongoose";

const communityEvidenceSchema = new mongoose.Schema(
  {
    loanProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoanProduct",
      required: true,
      index: true,
    },

    sourceType: {
      type: String,
      enum: [
        "reddit",
        "youtube",
        "quora",
        "mastodon",
        "forum",
        "article",
      ],
      required: true,
      index: true,
    },

    sourceUrl: {
      type: String,
      required: true,
      trim: true,
    },

    sourceId: {
      type: String,
      default: "",
      trim: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    author: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    rawText: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    collectedAt: {
      type: Date,
      default: Date.now,
    },

    topic: {
      type: String,
      enum: [
        "interest_rate",
        "processing",
        "branch",
        "insurance",
        "sanction",
        "disbursement",
        "documents",
        "collateral",
        "margin",
        "emi",
        "repayment",
        "staff",
        "delay",
        "approval",
        "eligibility",
        "course_eligibility",
        "general",
        "other",
      ],
      default: "other",
      index: true,
    },

    sentiment: {
      type: String,
      enum: ["positive", "negative", "neutral"],
      default: "neutral",
      index: true,
    },

    experienceType: {
      type: String,
      enum: [
        "direct_experience",
        "detailed_discussion",
        "meaningful_question",
        "general_discussion",
        "promotional",
      ],
      default: "general_discussion",
      index: true,
    },

    relevanceScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    qualityScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    freshnessWeight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.7,
    },

    evidenceWeight: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    extractedClaims: {
      type: [String],
      default: [],
    },

    isAccepted: {
      type: Boolean,
      default: false,
      index: true,
    },

    hash: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

communityEvidenceSchema.index({
  loanProductId: 1,
  sourceType: 1,
});

communityEvidenceSchema.index({
  loanProductId: 1,
  topic: 1,
});

communityEvidenceSchema.index({
  loanProductId: 1,
  sentiment: 1,
});

communityEvidenceSchema.index({
  loanProductId: 1,
  experienceType: 1,
});

communityEvidenceSchema.index({
  loanProductId: 1,
  publishedAt: -1,
});

communityEvidenceSchema.index({
  loanProductId: 1,
  evidenceWeight: -1,
});

export default mongoose.model(
  "CommunityEvidence",
  communityEvidenceSchema
);