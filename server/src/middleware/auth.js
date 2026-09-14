import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';

/**
 * Verifies the bearer JWT and attaches the live user document to `req.user`.
 *
 * The role is re-read from the database on every request rather than trusted
 * from the token payload, so a role change (or deactivation) takes effect
 * immediately without waiting for the token to expire.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication is required. Please sign in.');
  }

  const token = header.slice(7).trim();
  if (!token) throw ApiError.unauthorized('Authentication is required. Please sign in.');

  let payload;
  try {
    payload = verifyToken(token);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Your session has expired. Please sign in again.'
        : 'Invalid authentication token.';
    throw ApiError.unauthorized(message);
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('This account no longer exists.');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated.');

  req.user = user;
  next();
});

/**
 * Role-based access control. Enforced on the server, so changing anything in
 * the browser cannot grant access.
 */
export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('This action requires a different role.'));
    }
    return next();
  };

/** Attaches the user when a token is present, but never rejects the request. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();
  try {
    const payload = verifyToken(header.slice(7).trim());
    const user = await User.findById(payload.sub);
    if (user?.isActive) req.user = user;
  } catch {
    /* ignore - this route is public */
  }
  return next();
});
