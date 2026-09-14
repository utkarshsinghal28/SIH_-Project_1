import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { login, me, register } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { ROLES } from '../models/User.js';

const router = Router();

/** Slows down credential-stuffing without affecting normal use. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again in a few minutes.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().isLength({ min: 3, max: 120 }).withMessage('Name must be at least 3 characters.'),
    body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number.'),
    body('email').optional({ values: 'falsy' }).trim().isEmail().withMessage('Enter a valid email address.'),
    body('password').isLength({ min: 6, max: 128 }).withMessage('Password must be at least 6 characters.'),
    body('village').trim().notEmpty().withMessage('Village is required.'),
    body('district').trim().notEmpty().withMessage('District is required.'),
    body('state').trim().notEmpty().withMessage('State is required.'),
  ],
  validate,
  register,
);

router.post(
  '/login',
  authLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Mobile number or email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    body('role').optional().isIn(Object.values(ROLES)).withMessage('Unknown role.'),
  ],
  validate,
  login,
);

router.get('/me', protect, me);

export default router;
