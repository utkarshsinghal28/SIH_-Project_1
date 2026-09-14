import Centre, { CENTRE_STATUS } from '../models/Centre.js';
import Slot, { SLOT_STATUS } from '../models/Slot.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds the Mongo filter shared by the public and admin centre listings. */
function buildCentreFilter(query) {
  const filter = {};
  if (query.district) filter.district = query.district;
  if (query.state) filter.state = query.state;
  if (query.status) filter.status = query.status;

  const search = (query.search || '').trim();
  if (search) {
    const re = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: re }, { address: re }, { district: re }];
  }
  return filter;
}

/** GET /api/centres */
export const listCentres = asyncHandler(async (req, res) => {
  const centres = await Centre.find(buildCentreFilter(req.query)).sort({ name: 1 }).lean({
    virtuals: false,
  });

  return sendSuccess(
    res,
    centres.map((centre) => ({ ...centre, id: centre._id.toString(), _id: undefined })),
  );
});

/** GET /api/centres/:id - includes a live summary of slot availability. */
export const getCentre = asyncHandler(async (req, res) => {
  const centre = await Centre.findById(req.params.id);
  if (!centre) throw ApiError.notFound('Procurement centre not found.');

  const [summary] = await Slot.aggregate([
    { $match: { centre: centre._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        open: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', SLOT_STATUS.ACTIVE] },
                  { $lt: ['$bookedCount', '$maxBookings'] },
                ],
              },
              1,
              0,
            ],
          },
        },
        seatsAvailable: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', SLOT_STATUS.ACTIVE] },
                  { $lt: ['$bookedCount', '$maxBookings'] },
                ],
              },
              { $subtract: ['$maxBookings', '$bookedCount'] },
              0,
            ],
          },
        },
      },
    },
  ]);

  return sendSuccess(res, {
    ...centre.toJSON(),
    slotSummary: {
      total: summary?.total ?? 0,
      open: summary?.open ?? 0,
      seatsAvailable: summary?.seatsAvailable ?? 0,
    },
  });
});

/** POST /api/admin/centres */
export const createCentre = asyncHandler(async (req, res) => {
  const centre = await Centre.create({
    name: req.body.name,
    address: req.body.address,
    district: req.body.district,
    state: req.body.state,
    status: req.body.status || CENTRE_STATUS.ACTIVE,
    inchargeName: req.body.inchargeName || '',
    contactPhone: req.body.contactPhone || '',
    commodities: req.body.commodities || [],
    counters: req.body.counters || 1,
    createdBy: req.user._id,
  });

  return sendSuccess(res, centre.toJSON(), 201);
});

/** PUT /api/admin/centres/:id */
export const updateCentre = asyncHandler(async (req, res) => {
  const centre = await Centre.findById(req.params.id);
  if (!centre) throw ApiError.notFound('Procurement centre not found.');

  const fields = [
    'name',
    'address',
    'district',
    'state',
    'status',
    'inchargeName',
    'contactPhone',
    'commodities',
    'counters',
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) centre[field] = req.body[field];
  });

  await centre.save();
  return sendSuccess(res, centre.toJSON());
});

/**
 * PATCH /api/admin/centres/:id/status
 *
 * Soft activation / deactivation. A centre document is never removed, so every
 * historical booking keeps referring to a valid centre.
 */
export const changeCentreStatus = asyncHandler(async (req, res) => {
  const centre = await Centre.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true, runValidators: true },
  );
  if (!centre) throw ApiError.notFound('Procurement centre not found.');
  return sendSuccess(res, centre.toJSON());
});
