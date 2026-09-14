import mongoose from 'mongoose';

export const CENTRE_STATUS = { ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' };

const centreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    district: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: Object.values(CENTRE_STATUS),
      default: CENTRE_STATUS.ACTIVE,
      index: true,
    },

    inchargeName: { type: String, trim: true, default: '' },
    contactPhone: { type: String, trim: true, default: '' },
    commodities: { type: [String], default: [] },
    counters: { type: Number, min: 1, max: 50, default: 1 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
  },
);

centreSchema.index({ name: 'text', address: 'text', district: 'text' });

/**
 * Centres are never physically deleted. Deactivation is a soft status change so
 * historical bookings keep pointing at a valid centre document.
 */
centreSchema.methods.deactivate = function deactivate() {
  this.status = CENTRE_STATUS.INACTIVE;
  return this.save();
};

export default mongoose.model('Centre', centreSchema);
