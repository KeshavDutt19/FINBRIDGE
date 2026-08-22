import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    age: Number,
    state: String,
    city: String,
    gender: String,
    category: String,
    disabilityStatus: { type: Boolean, default: false },
    educationLevel: String,
    course: String,
    institution: String,
    academicScore: Number,
    yearOfStudy: String,
    annualFamilyIncome: Number,
    employmentStatus: String,
    loanType: String,
    desiredAmount: Number,
    preferredTenure: Number
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    userType: {
      type: String,
      enum: ['student', 'parent', 'professional', 'admin'],
      default: 'student'
    },
    profile: { type: profileSchema, default: {} },
    lastActiveAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export default mongoose.model('User', userSchema);
