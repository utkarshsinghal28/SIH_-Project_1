import User, { ROLES } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { signToken } from '../utils/token.js';

/** POST /api/auth/register - self-registration is farmers only. */
export const register = asyncHandler(async (req, res) => {
  const { name, phone, email, password, village, district, state } = req.body;

  if (await User.exists({ phone })) {
    throw ApiError.conflict('An account with this mobile number already exists.', {
      phone: 'This mobile number is already registered.',
    });
  }

  const normalisedEmail = (email || '').trim().toLowerCase();
  if (normalisedEmail && (await User.exists({ email: normalisedEmail }))) {
    throw new ApiError(409, 'An account with this email already exists.', {
      email: 'This email is already registered.',
    });
  }

  const user = await User.create({
    name,
    phone,
    email: normalisedEmail,
    passwordHash: await User.hashPassword(password),
    role: ROLES.FARMER,
    village,
    district,
    state,
  });

  return sendSuccess(res, { token: signToken(user), user: user.toJSON() }, 201);
});

/**
 * POST /api/auth/login
 * `identifier` is a mobile number or an email address. `role` selects the
 * portal (farmer vs admin) so an admin cannot be signed in through the farmer
 * screens and vice versa.
 */
export const login = asyncHandler(async (req, res) => {
  const { identifier, password, role } = req.body;
  const key = String(identifier).trim().toLowerCase();

  const query = { $or: [{ phone: key }, { email: key }] };
  if (role) query.role = role;

  const user = await User.findOne(query).select('+passwordHash');

  const genericMessage =
    role === ROLES.ADMIN
      ? 'Invalid official email or password.'
      : 'Invalid mobile number or password.';

  // Identical error + bcrypt comparison either way, so the response does not
  // reveal whether the account exists.
  if (!user) {
    await User.hashPassword(password);
    throw ApiError.unauthorized(genericMessage);
  }

  if (!(await user.comparePassword(password))) throw ApiError.unauthorized(genericMessage);
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated.');

  return sendSuccess(res, { token: signToken(user), user: user.toJSON() });
});

/** GET /api/auth/me */
export const me = asyncHandler(async (req, res) => sendSuccess(res, { user: req.user.toJSON() }));
