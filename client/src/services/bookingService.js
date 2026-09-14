import api, { isMockMode } from './api.js';
import { STORAGE_KEYS, readJSON } from '../utils/storage.js';
import * as mockApi from '../data/mock/mockApi.js';

/**
 * Booking service.
 *
 * Part 2 endpoints:
 *   POST   /api/bookings                       { centreId, slotId }
 *   GET    /api/bookings/my
 *   GET    /api/bookings/:id
 *   PATCH  /api/bookings/:id/cancel
 *   GET    /api/admin/bookings                 (?centreId&status&date&search)
 *   GET    /api/admin/centres/:centreId/bookings
 *
 * Concurrency-safe seat reservation (atomic slot capacity decrement) is a
 * Part 2 backend concern - the client only issues the request.
 */
const token = () => readJSON(STORAGE_KEYS.SESSION)?.token ?? null;

export async function createBooking({ centreId, slotId }) {
  if (isMockMode()) return mockApi.createBooking(token(), { centreId, slotId });
  const { data } = await api.post('/bookings', { centreId, slotId });
  return data;
}

export async function listMyBookings() {
  if (isMockMode()) return mockApi.myBookings(token());
  const { data } = await api.get('/bookings/my');
  return data;
}

export async function getBooking(bookingId) {
  if (isMockMode()) return mockApi.getBooking(token(), bookingId);
  const { data } = await api.get(`/bookings/${bookingId}`);
  return data;
}

export async function cancelBooking(bookingId) {
  if (isMockMode()) return mockApi.cancelBooking(token(), bookingId);
  const { data } = await api.patch(`/bookings/${bookingId}/cancel`);
  return data;
}

export async function listAllBookings(params = {}) {
  if (isMockMode()) return mockApi.adminBookings(params);
  const { data } = await api.get('/admin/bookings', { params });
  return data;
}

export async function listCentreBookings(centreId, params = {}) {
  if (isMockMode()) return mockApi.adminBookings({ ...params, centreId });
  const { data } = await api.get(`/admin/centres/${centreId}/bookings`, { params });
  return data;
}

export async function fetchAdminStats() {
  if (isMockMode()) return mockApi.adminStats();
  const { data } = await api.get('/admin/stats');
  return data;
}
