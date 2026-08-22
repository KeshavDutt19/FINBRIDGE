import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['scholarship', 'loan'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: String, default: 'Demo Application Saved' },
    personal: Object,
    employment: Object,
    loan: Object,
    educationLoan: Object,
    homeLoan: Object,
    carLoan: Object,
    documents: [{ name: String, fileName: String, uploaded: Boolean }],
    disclaimerAccepted: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('Application', applicationSchema);
