import Booking, { BOOKING_STATUS } from '../models/Booking.js';
import Centre, { CENTRE_STATUS } from '../models/Centre.js';
import Slot, { SLOT_STATUS } from '../models/Slot.js';
import Counter from '../models/Counter.js';
import ApiError from '../utils/ApiError.js';

/** Generates a human-readable, collision-free booking reference. */
async function nextReference() {
  const year = new Date().getFullYear();
  const sequence = await Counter.next(`booking:${year}`);
  return `KP-${year}-${String(1000 + sequence)}`;
}

/**
 * Creates a booking with concurrency-safe capacity enforcement.
 *
 * The capacity check and the seat increment happen inside ONE atomic
 * `findOneAndUpdate`:
 *
 *   { _id, status: ACTIVE, $expr: { $lt: ['$bookedCount', '$maxBookings'] } }
 *   { $inc: { bookedCount: 1 } }
 *
 * MongoDB guarantees that a single document update is atomic, so two concurrent
 * requests can never both pass the `bookedCount < maxBookings` test for the last
 * remaining seat. A slot with capacity 10 therefore yields exactly 10 successful
 * bookings, no matter how many requests arrive simultaneously.
 *
 * This needs no transaction, so it also works on a standalone MongoDB and on the
 * MongoDB Atlas free tier.
 */
export async function createBooking({ farmerId, centreId, slotId }) {
  const centre = await Centre.findById(centreId);
  if (!centre) throw ApiError.notFound('Procurement centre not found.');
  if (centre.status !== CENTRE_STATUS.ACTIVE) {
    throw ApiError.conflict('This procurement centre is not currently operating.');
  }

  // Reject an existing confirmed booking early with a clear message.
  // (The partial unique index below is the authoritative guard against races.)
  const existing = await Booking.findOne({
    farmer: farmerId,
    slot: slotId,
    status: BOOKING_STATUS.CONFIRMED,
  });
  if (existing) throw ApiError.conflict('You already have a confirmed booking for this slot.');

  // ---- atomic seat reservation -------------------------------------------
  const slot = await Slot.findOneAndUpdate(
    {
      _id: slotId,
      centre: centreId,
      status: SLOT_STATUS.ACTIVE,
      $expr: { $lt: ['$bookedCount', '$maxBookings'] },
    },
    { $inc: { bookedCount: 1 } },
    { new: true },
  );

  if (!slot) {
    // Work out precisely why the reservation failed.
    const actual = await Slot.findOne({ _id: slotId, centre: centreId });
    if (!actual) throw ApiError.notFound('The selected slot is no longer available.');
    if (actual.status === SLOT_STATUS.CLOSED) throw ApiError.conflict('This slot is closed.');
    throw ApiError.conflict('This slot just became full. Please choose another slot.');
  }

  // Mark the slot FULL once the final seat is taken.
  if (slot.bookedCount >= slot.maxBookings && slot.status === SLOT_STATUS.ACTIVE) {
    await Slot.updateOne(
      { _id: slot._id, $expr: { $gte: ['$bookedCount', '$maxBookings'] } },
      { $set: { status: SLOT_STATUS.FULL } },
    );
  }

  // ---- create the booking, releasing the seat if anything fails ----------
  try {
    const booking = await Booking.create({
      reference: await nextReference(),
      farmer: farmerId,
      centre: centreId,
      slot: slot._id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: BOOKING_STATUS.CONFIRMED,
    });
    return booking;
  } catch (error) {
    // Compensating update: give the reserved seat back.
    await releaseSeat(slot._id);
    if (error?.code === 11000) {
      throw ApiError.conflict('You already have a confirmed booking for this slot.');
    }
    throw error;
  }
}

/** Returns one seat to a slot and reopens it if it had been marked FULL. */
async function releaseSeat(slotId) {
  await Slot.updateOne({ _id: slotId, bookedCount: { $gt: 0 } }, { $inc: { bookedCount: -1 } });
  await Slot.updateOne(
    {
      _id: slotId,
      status: SLOT_STATUS.FULL,
      $expr: { $lt: ['$bookedCount', '$maxBookings'] },
    },
    { $set: { status: SLOT_STATUS.ACTIVE } },
  );
}

/**
 * Cancels a booking and restores the slot's availability.
 *
 * The status transition itself is an atomic conditional update, so two
 * simultaneous cancel requests cannot both release a seat.
 */
export async function cancelBooking({ bookingId, farmerId = null }) {
  const filter = { _id: bookingId, status: BOOKING_STATUS.CONFIRMED };
  if (farmerId) filter.farmer = farmerId;

  const booking = await Booking.findOneAndUpdate(
    filter,
    { $set: { status: BOOKING_STATUS.CANCELLED, cancelledAt: new Date() } },
    { new: true },
  );

  if (!booking) {
    const existing = await Booking.findById(bookingId);
    if (!existing) throw ApiError.notFound('Booking not found.');
    if (farmerId && String(existing.farmer) !== String(farmerId)) {
      throw ApiError.forbidden('You do not have access to this booking.');
    }
    throw ApiError.conflict('This booking is already cancelled.');
  }

  await releaseSeat(booking.slot);
  return booking;
}

export default { createBooking, cancelBooking };
