import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import { isProduction } from '../config/env.js';

export function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/** Central error translator - the single place that formats an error response. */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';
  let errors = err.errors || null;

  // Mongoose schema validation
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Please correct the highlighted fields.';
    errors = Object.fromEntries(
      Object.entries(err.errors).map(([field, issue]) => [field, issue.message]),
    );
  }

  // Malformed ObjectId
  if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for "${err.path}".`;
  }

  // Duplicate key
  if (err?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    if (field === 'phone') message = 'An account with this mobile number already exists.';
    else if (field === 'email') message = 'An account with this email already exists.';
    else message = 'This record already exists.';
    if (field) errors = { [field]: message };
  }

  if (statusCode >= 500 && !isProduction()) {
    console.error('[error]', err);
  } else if (statusCode >= 500) {
    console.error('[error]', err.message);
  }

  const body = { success: false, message };
  if (errors) body.errors = errors;
  if (!isProduction() && statusCode >= 500) body.stack = err.stack;

  res.status(statusCode).json(body);
}
