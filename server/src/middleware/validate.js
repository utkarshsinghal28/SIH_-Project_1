import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Collects express-validator results into a field -> message map, matching the
 * shape the React forms already consume (`error.details`).
 */
export default function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = {};
  result.array().forEach((issue) => {
    const field = issue.path ?? issue.param;
    if (!errors[field]) errors[field] = issue.msg;
  });

  return next(ApiError.badRequest('Please correct the highlighted fields.', errors));
}
