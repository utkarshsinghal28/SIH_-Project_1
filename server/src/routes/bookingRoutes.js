import { Router } from 'express';
import { body, param } from 'express-validator';
import { cancel, create, getOne, listMine } from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../models/User.js';

const router = Router();

// Booking is a farmer-only capability, enforced server-side.
router.use(protect, authorize(ROLES.FARMER));

router.post(
  '/',
  [
    body('centreId').isMongoId().withMessage('A valid procurement centre is required.'),
    body('slotId').isMongoId().withMessage('A valid slot is required.'),
  ],
  validate,
  create,
);

router.get('/my', listMine);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid booking id.')],
  validate,
  getOne,
);

router.patch(
  '/:id/cancel',
  [param('id').isMongoId().withMessage('Invalid booking id.')],
  validate,
  cancel,
);

export default router;
