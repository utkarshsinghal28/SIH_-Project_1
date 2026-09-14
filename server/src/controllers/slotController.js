import Centre from '../models/Centre.js';
import Slot, { SLOT_STATUS } from '../models/Slot.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

/** GET /api/centres/:centreId/slots */
export const listSlots = asyncHandler(async (req, res) => {
  const { centreId } = req.params;

  if (!(await Centre.exists({ _id: centreId }))) {
    throw ApiError.notFound('Procurement centre not found.');
  }

  const filter = { centre: centreId };
  if (req.query.date) filter.date = req.query.date;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.date = filter.date || {};
    if (req.query.from) filter.date.$gte = req.query.from;
    if (req.query.to) filter.date.$lte = req.query.to;
  }

  const slots = await Slot.find(filter).sort({ date: 1, startTime: 1 });
  return sendSuccess(
    res,
    slots.map((slot) => slot.toJSON()),
  );
});

/** POST /api/admin/centres/:centreId/slots */
export const createSlot = asyncHandler(async (req, res) => {
  const { centreId } = req.params;
  if (!(await Centre.exists({ _id: centreId }))) {
    throw ApiError.notFound('Procurement centre not found.');
  }

  const duplicate = await Slot.exists({
    centre: centreId,
    date: req.body.date,
    startTime: req.body.startTime,
  });
  if (duplicate) {
    throw ApiError.conflict('A slot already starts at this time on this date.');
  }

  const slot = await Slot.create({
    centre: centreId,
    date: req.body.date,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    maxBookings: req.body.maxBookings,
    status: req.body.status || SLOT_STATUS.ACTIVE,
    createdBy: req.user._id,
  });

  return sendSuccess(res, slot.toJSON(), 201);
});

/** PUT /api/admin/slots/:id */
export const updateSlot = asyncHandler(async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) throw ApiError.notFound('Slot not found.');

  // Capacity may not be reduced below the seats already taken.
  if (req.body.maxBookings !== undefined && req.body.maxBookings < slot.bookedCount) {
    throw ApiError.conflict(
      `This slot already has ${slot.bookedCount} booking(s); maximum bookings cannot be lower than that.`,
    );
  }

  ['date', 'startTime', 'endTime', 'maxBookings', 'status'].forEach((field) => {
    if (req.body[field] !== undefined) slot[field] = req.body[field];
  });

  if (slot.endTime <= slot.startTime) {
    throw ApiError.badRequest('Please correct the highlighted fields.', {
      endTime: 'End time must be after the start time.',
    });
  }

  await slot.save();
  return sendSuccess(res, slot.toJSON());
});

/** PATCH /api/admin/slots/:id/status - Active / Full / Closed. */
export const changeSlotStatus = asyncHandler(async (req, res) => {
  const slot = await Slot.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true, runValidators: true },
  );
  if (!slot) throw ApiError.notFound('Slot not found.');
  return sendSuccess(res, slot.toJSON());
});
