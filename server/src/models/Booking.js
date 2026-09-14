import mongoose from 'mongoose';

/**
 * Only CONFIRMED and CANCELLED are reachable in Part 2.
 * The remaining values are the Part 3 operational state machine. They are
 * declared here so the enum does not need a migration later, but no Part 2 code
 * path transitions a booking into them.
 */
export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  // --- Part 3 (not reachable yet) ---
  CHECKED_IN: 'CHECKED_IN',
  WAITING: 'WAITING',
  PROCESSING: 'PROCESSING',
  PROCUREMENT_COMPLETED: 'PROCUREMENT_COMPLETED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
};

export const ACTIVE_BOOKING_STATUSES = [BOOKING_STATUS.CONFIRMED];

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, uppercase: true, trim: true },

    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    centre: { type: mongoose.Schema.Types.ObjectId, ref: 'Centre', required: true, index: true },
    slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true, index: true },

    // Denormalised for fast listing/filtering without joining the slot.
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.CONFIRMED,
      index: true,
    },
    cancelledAt: { type: Date, default: null },
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

/**
 * A farmer may hold at most ONE confirmed booking per slot.
 * Partial unique index: cancelled bookings are excluded, so a farmer can
 * re-book the same slot after cancelling.
 */
bookingSchema.index(
  { farmer: 1, slot: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ACTIVE_BOOKING_STATUSES } },
    name: 'uniq_active_booking_per_farmer_slot',
  },
);

bookingSchema.index({ centre: 1, date: 1 });

export default mongoose.model('Booking', bookingSchema);
