import mongoose from 'mongoose';

const syncLogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['scholarships', 'loans'], required: true },
    status: { type: String, enum: ['success', 'partial', 'failed'], required: true },
    newCount: { type: Number, default: 0 },
    updatedCount: { type: Number, default: 0 },
    failedSources: [{ sourceName: String, reason: String }],
    startedAt: Date,
    finishedAt: Date,
    message: String
  },
  { timestamps: true }
);

export default mongoose.model('SyncLog', syncLogSchema);
