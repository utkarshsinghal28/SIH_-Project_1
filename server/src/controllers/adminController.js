import Booking from '../models/Booking.js';
import Centre from '../models/Centre.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getDashboardStats } from '../services/statsService.js';
import { present } from './bookingController.js';

const POPULATE = [
  { path: 'centre', select: 'name address district state' },
  { path: 'farmer', select: 'name phone village district state' },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Shared query builder for the admin booking listings. */
async function queryBookings(query, centreId = null) {
  const filter = {};
  if (centreId) filter.centre = centreId;
  else if (query.centreId) filter.centre = query.centreId;
  if (query.status) filter.status = query.status;
  if (query.date) filter.date = query.date;

  let bookings = await Booking.find(filter).populate(POPULATE).sort({ createdAt: -1 }).limit(500);

  // Reference / farmer name / phone search runs after population.
  const search = (query.search || '').trim();
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    bookings = bookings.filter(
      (booking) =>
        re.test(booking.reference) ||
        re.test(booking.farmer?.name ?? '') ||
        re.test(booking.farmer?.phone ?? ''),
    );
  }

  return bookings.map(present);
}

/** GET /api/admin/bookings */
export const listAllBookings = asyncHandler(async (req, res) =>
  sendSuccess(res, await queryBookings(req.query)),
);

/** GET /api/admin/centres/:centreId/bookings */
export const listCentreBookings = asyncHandler(async (req, res) => {
  const { centreId } = req.params;
  if (!(await Centre.exists({ _id: centreId }))) {
    throw ApiError.notFound('Procurement centre not found.');
  }
  return sendSuccess(res, await queryBookings(req.query, centreId));
});

/** GET /api/admin/stats */
export const stats = asyncHandler(async (_req, res) => sendSuccess(res, await getDashboardStats()));
