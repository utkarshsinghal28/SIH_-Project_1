import api, { isMockMode, unwrap } from './api.js';
import * as mockApi from '../data/mock/mockApi.js';
import { STORAGE_KEYS, readJSON } from '../utils/storage.js';

/**
 * Booking service.
 *
 * Live endpoints (Part 2):
 *   POST   /api/bookings                          { centreId, slotId }
 *   GET    /api/bookings/my
 *   GET    /api/bookings/:id
 *   PATCH  /api/bookings/:id/cancel
 *   GET    /api/admin/bookings                    (?centreId&status&date&search)
 *   GET    /api/admin/centres/:centreId/bookings
 *   GET    /api/admin/stats
 *
 * Slot capacity is enforced atomically by the server, so a full slot is
 * rejected with HTTP 409 even when many farmers book at the same instant.
 */
const token = () => readJSON(STORAGE_KEYS.SESSION)?.token ?? null;

export async function createBooking({ centreId, slotId }) {
  if (isMockMode()) return mockApi.createBooking(token(), { centreId, slotId });
  return unwrap(await api.post('/bookings', { centreId, slotId }));
}

export async function listMyBookings() {
  if (isMockMode()) return mockApi.myBookings(token());
  return unwrap(await api.get('/bookings/my'));
}

export async function getBooking(bookingId) {
  if (isMockMode()) return mockApi.getBooking(token(), bookingId);
  return unwrap(await api.get(`/bookings/${bookingId}`));
}

export async function cancelBooking(bookingId) {
  if (isMockMode()) return mockApi.cancelBooking(token(), bookingId);
  return unwrap(await api.patch(`/bookings/${bookingId}/cancel`));
}

export async function listAllBookings(params = {}) {
  if (isMockMode()) return mockApi.adminBookings(params);
  return unwrap(await api.get('/admin/bookings', { params }));
}

export async function listCentreBookings(centreId, params = {}) {
  if (isMockMode()) return mockApi.adminBookings({ ...params, centreId });
  return unwrap(await api.get(`/admin/centres/${centreId}/bookings`, { params }));
}

export async function fetchAdminStats() {
  if (isMockMode()) return mockApi.adminStats();
  return unwrap(await api.get('/admin/stats'));
}
