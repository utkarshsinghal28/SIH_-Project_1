import Booking from '../models/Booking.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as bookingService from '../services/bookingService.js';

const POPULATE = [
  { path: 'centre', select: 'name address district state' },
  { path: 'farmer', select: 'name phone village district state' },
];

/**
 * Flattens populated refs into the shape the React client renders, so no page
 * has to know about Mongo document nesting.
 */
export function present(booking) {
  const json = booking.toJSON ? booking.toJSON() : booking;
  const centre = json.centre && typeof json.centre === 'object' ? json.centre : null;
  const farmer = json.farmer && typeof json.farmer === 'object' ? json.farmer : null;

  return {
    id: json.id,
    reference: json.reference,
    status: json.status,
    date: json.date,
    startTime: json.startTime,
    endTime: json.endTime,
    createdAt: json.createdAt,
    cancelledAt: json.cancelledAt,

    centreId: centre ? centre.id : String(json.centre),
    centreName: centre?.name ?? '',
    centreAddress: centre?.address ?? '',
    centreDistrict: centre?.district ?? '',
    centreState: centre?.state ?? '',

    farmerId: farmer ? farmer.id : String(json.farmer),
    farmerName: farmer?.name ?? '',
    farmerPhone: farmer?.phone ?? '',
    farmerVillage: farmer?.village ?? '',

    slotId: String(json.slot),
  };
}

/** POST /api/bookings */
export const create = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({
    farmerId: req.user._id,
    centreId: req.body.centreId,
    slotId: req.body.slotId,
  });

  await booking.populate(POPULATE);
  return sendSuccess(res, present(booking), 201);
});

/** GET /api/bookings/my */
export const listMine = asyncHandler(async (req, res) => {
  const filter = { farmer: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const bookings = await Booking.find(filter).populate(POPULATE).sort({ createdAt: -1 });
  return sendSuccess(res, bookings.map(present));
});

/** GET /api/bookings/:id - a farmer may only read their own booking. */
export const getOne = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(POPULATE);
  if (!booking) throw ApiError.notFound('Booking not found.');

  const ownerId = booking.farmer?.id ?? String(booking.farmer);
  if (String(ownerId) !== String(req.user._id)) {
    throw ApiError.forbidden('You do not have access to this booking.');
  }

  return sendSuccess(res, present(booking));
});

/** PATCH /api/bookings/:id/cancel */
export const cancel = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking({
    bookingId: req.params.id,
    farmerId: req.user._id,
  });

  await booking.populate(POPULATE);
  return sendSuccess(res, present(booking));
});
