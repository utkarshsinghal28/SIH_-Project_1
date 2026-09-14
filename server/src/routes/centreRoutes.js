import { Router } from 'express';
import { param, query } from 'express-validator';
import { getCentre, listCentres } from '../controllers/centreController.js';
import { listSlots } from '../controllers/slotController.js';
import validate from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { CENTRE_STATUS } from '../models/Centre.js';
import { SLOT_STATUS } from '../models/Slot.js';

const router = Router();

// Centre discovery is readable without a session so the directory can be
// browsed before registering; a token is used when present.
router.get(
  '/',
  optionalAuth,
  [
    query('status').optional().isIn(Object.values(CENTRE_STATUS)),
    query('search').optional().isLength({ max: 120 }),
  ],
  validate,
  listCentres,
);

router.get(
  '/:id',
  optionalAuth,
  [param('id').isMongoId().withMessage('Invalid centre id.')],
  validate,
  getCentre,
);

router.get(
  '/:centreId/slots',
  optionalAuth,
  [
    param('centreId').isMongoId().withMessage('Invalid centre id.'),
    query('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Use YYYY-MM-DD.'),
    query('status').optional().isIn(Object.values(SLOT_STATUS)),
  ],
  validate,
  listSlots,
);

export default router;
