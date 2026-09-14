import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = { FARMER: 'FARMER', ADMIN: 'ADMIN' };

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.FARMER, index: true },

    // Farmer fields
    village: { type: String, trim: true, default: '' },
    district: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },

    // Admin field
    designation: { type: String, trim: true, default: '' },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

// A non-empty email must be unique; empty emails are allowed and not indexed.
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string', $ne: '' } } },
);

/** Hashes a plain-text password with bcrypt (10 salt rounds). */
userSchema.statics.hashPassword = function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
