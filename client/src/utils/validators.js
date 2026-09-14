/**
 * Client-side form validation.
 *
 * NOTE: this is UX validation only. Authoritative validation lives in the
 * Express API added in Part 2 - never treat these checks as security.
 */

const PHONE_RE = /^[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isBlank = (value) => !value || String(value).trim().length === 0;

export function validateFarmerRegistration(values) {
  const errors = {};

  if (isBlank(values.name)) errors.name = 'Full name is required.';
  else if (values.name.trim().length < 3) errors.name = 'Name must be at least 3 characters.';

  if (isBlank(values.phone)) errors.phone = 'Mobile number is required.';
  else if (!PHONE_RE.test(values.phone.trim()))
    errors.phone = 'Enter a valid 10-digit Indian mobile number.';

  if (!isBlank(values.email) && !EMAIL_RE.test(values.email.trim()))
    errors.email = 'Enter a valid email address, or leave it empty.';

  if (isBlank(values.password)) errors.password = 'Password is required.';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters.';

  if (isBlank(values.confirmPassword)) errors.confirmPassword = 'Please re-enter your password.';
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Passwords do not match.';

  if (isBlank(values.village)) errors.village = 'Village is required.';
  if (isBlank(values.district)) errors.district = 'District is required.';
  if (isBlank(values.state)) errors.state = 'State is required.';

  return errors;
}

export function validateFarmerLogin(values) {
  const errors = {};
  if (isBlank(values.phone)) errors.phone = 'Mobile number is required.';
  else if (!PHONE_RE.test(values.phone.trim()))
    errors.phone = 'Enter a valid 10-digit mobile number.';
  if (isBlank(values.password)) errors.password = 'Password is required.';
  return errors;
}

export function validateAdminLogin(values) {
  const errors = {};
  if (isBlank(values.email)) errors.email = 'Official email is required.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (isBlank(values.password)) errors.password = 'Password is required.';
  return errors;
}

export function validateCentre(values) {
  const errors = {};
  if (isBlank(values.name)) errors.name = 'Centre name is required.';
  if (isBlank(values.address)) errors.address = 'Address is required.';
  if (isBlank(values.district)) errors.district = 'District is required.';
  if (isBlank(values.state)) errors.state = 'State is required.';
  if (isBlank(values.status)) errors.status = 'Status is required.';
  return errors;
}

export function validateSlot(values) {
  const errors = {};
  if (isBlank(values.date)) errors.date = 'Date is required.';
  if (isBlank(values.startTime)) errors.startTime = 'Start time is required.';
  if (isBlank(values.endTime)) errors.endTime = 'End time is required.';
  if (!isBlank(values.startTime) && !isBlank(values.endTime) && values.endTime <= values.startTime)
    errors.endTime = 'End time must be after the start time.';

  const max = Number(values.maxBookings);
  if (isBlank(values.maxBookings)) errors.maxBookings = 'Maximum bookings is required.';
  else if (!Number.isInteger(max) || max < 1) errors.maxBookings = 'Enter a whole number of 1 or more.';
  else if (max > 500) errors.maxBookings = 'Maximum bookings cannot exceed 500.';

  if (isBlank(values.status)) errors.status = 'Status is required.';
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
