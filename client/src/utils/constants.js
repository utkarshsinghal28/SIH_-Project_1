/** Application-wide constants (no data, no mocks - just vocabulary). */

export const APP_NAME = 'Krishi Procurement Platform';
export const APP_TAGLINE = 'Smarter Procurement. Less Waiting.';

export const ROLES = {
  FARMER: 'FARMER',
  ADMIN: 'ADMIN',
};

export const CENTRE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
};

export const SLOT_STATUS = {
  ACTIVE: 'ACTIVE',
  FULL: 'FULL',
  CLOSED: 'CLOSED',
};

/**
 * Booking statuses.
 *
 * Only CONFIRMED and CANCELLED are reachable in Part 1.
 * The remaining values are the forward-looking operational state machine that
 * Part 2 (persistence) and Part 3 (real-time queue) will drive. They are listed
 * here so the UI can already render them consistently, but nothing in Part 1
 * transitions a booking into them.
 */
export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  CHECKED_IN: 'CHECKED_IN',
  WAITING: 'WAITING',
  PROCESSING: 'PROCESSING',
  PROCUREMENT_COMPLETED: 'PROCUREMENT_COMPLETED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
};

export const BOOKING_STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'Checked In',
  WAITING: 'Waiting',
  PROCESSING: 'Processing',
  PROCUREMENT_COMPLETED: 'Procurement Completed',
  PAYMENT_PENDING: 'Payment Pending',
  PAYMENT_COMPLETED: 'Payment Completed',
};

/** Statuses a farmer/admin can actually reach in Part 1. */
export const AVAILABLE_BOOKING_STATUSES = [
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.CANCELLED,
];

/** Reserved for Part 3 - shown in the UI as "planned", never as live data. */
export const FUTURE_BOOKING_STATUSES = [
  BOOKING_STATUS.CHECKED_IN,
  BOOKING_STATUS.WAITING,
  BOOKING_STATUS.PROCESSING,
  BOOKING_STATUS.PROCUREMENT_COMPLETED,
  BOOKING_STATUS.PAYMENT_PENDING,
  BOOKING_STATUS.PAYMENT_COMPLETED,
];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];
