import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  changeCentreStatus,
  createCentre,
  updateCentre,
} from '../controllers/centreController.js';
import { changeSlotStatus, createSlot, updateSlot } from '../controllers/slotController.js';
import { listAllBookings, listCentreBookings, stats } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../models/User.js';
import { CENTRE_STATUS } from '../models/Centre.js';
import { SLOT_STATUS } from '../models/Slot.js';

const router = Router();

// Every route below requires a valid JWT belonging to an ADMIN.
router.use(protect, authorize(ROLES.ADMIN));

/* ------------------------------------------------------------- centres */

const centreBody = [
  body('name').trim().isLength({ min: 3, max: 160 }).withMessage('Centre name is required.'),
  body('address').trim().isLength({ min: 3, max: 300 }).withMessage('Address is required.'),
  body('district').trim().notEmpty().withMessage('District is required.'),
  body('state').trim().notEmpty().withMessage('State is required.'),
  body('status').optional().isIn(Object.values(CENTRE_STATUS)).withMessage('Invalid status.'),
];

router.post('/centres', centreBody, validate, createCentre);

router.put(
  '/centres/:id',
  [param('id').isMongoId().withMessage('Invalid centre id.'), ...centreBody],
  validate,
  updateCentre,
);

router.patch(
  '/centres/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid centre id.'),
    body('status').isIn(Object.values(CENTRE_STATUS)).withMessage('Status must be ACTIVE or INACTIVE.'),
  ],
  validate,
  changeCentreStatus,
);

/* --------------------------------------------------------------- slots */

const slotBody = [
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Date must be YYYY-MM-DD.'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Start time must be HH:MM.'),
  body('endTime')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('End time must be HH:MM.')
    .bail()
    .custom((value, { req }) => {
      if (req.body.startTime && value <= req.body.startTime) {
        throw new Error('End time must be after the start time.');
      }
      return true;
    }),
  body('maxBookings')
    .isInt({ min: 1, max: 500 })
    .withMessage('Maximum bookings must be between 1 and 500.')
    .toInt(),
  body('status').optional().isIn(Object.values(SLOT_STATUS)).withMessage('Invalid slot status.'),
];

router.post(
  '/centres/:centreId/slots',
  [param('centreId').isMongoId().withMessage('Invalid centre id.'), ...slotBody],
  validate,
  createSlot,
);

router.put(
  '/slots/:id',
  [param('id').isMongoId().withMessage('Invalid slot id.'), ...slotBody],
  validate,
  updateSlot,
);

router.patch(
  '/slots/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid slot id.'),
    body('status')
      .isIn(Object.values(SLOT_STATUS))
      .withMessage('Status must be ACTIVE, FULL or CLOSED.'),
  ],
  validate,
  changeSlotStatus,
);

/* ------------------------------------------------------------ bookings */

router.get('/bookings', listAllBookings);

router.get(
  '/centres/:centreId/bookings',
  [param('centreId').isMongoId().withMessage('Invalid centre id.')],
  validate,
  listCentreBookings,
);

router.get('/stats', stats);

export default router;
