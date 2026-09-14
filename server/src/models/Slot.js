import mongoose from 'mongoose';

export const SLOT_STATUS = { ACTIVE: 'ACTIVE', FULL: 'FULL', CLOSED: 'CLOSED' };

const slotSchema = new mongoose.Schema(
  {
    centre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Centre',
      required: true,
      index: true,
    },
    /** Stored as an ISO calendar date string (YYYY-MM-DD) - timezone free. */
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'],
    },
    startTime: { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'Use HH:MM.'] },
    endTime: { type: String, required: true, match: [/^\d{2}:\d{2}$/, 'Use HH:MM.'] },

    maxBookings: { type: Number, required: true, min: 1, max: 500 },
    /** Number of seats currently held by CONFIRMED bookings. */
    bookedCount: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: Object.values(SLOT_STATUS),
      default: SLOT_STATUS.ACTIVE,
      index: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        ret.centreId = ret.centre?.toString?.() ?? ret.centre;
        delete ret._id;
        delete ret.centre;
        return ret;
      },
    },
  },
);

// One slot per centre / date / start time.
slotSchema.index({ centre: 1, date: 1, startTime: 1 }, { unique: true });
slotSchema.index({ centre: 1, date: 1 });

slotSchema.virtual('availableSeats').get(function availableSeats() {
  return Math.max(0, this.maxBookings - this.bookedCount);
});

export default mongoose.model('Slot', slotSchema);
