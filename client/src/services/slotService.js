import api, { isMockMode } from './api.js';
import * as mockApi from '../data/mock/mockApi.js';

/**
 * Slot service.
 *
 * Part 2 endpoints:
 *   GET    /api/centres/:centreId/slots      (?date&status)
 *   POST   /api/admin/centres/:centreId/slots
 *   PUT    /api/admin/slots/:slotId
 *   PATCH  /api/admin/slots/:slotId/close
 */
export async function listSlots(centreId, params = {}) {
  if (isMockMode()) return mockApi.listSlots(centreId, params);
  const { data } = await api.get(`/centres/${centreId}/slots`, { params });
  return data;
}

export async function createSlot(centreId, payload) {
  if (isMockMode()) return mockApi.createSlot(centreId, payload);
  const { data } = await api.post(`/admin/centres/${centreId}/slots`, payload);
  return data;
}

export async function updateSlot(slotId, payload) {
  if (isMockMode()) return mockApi.updateSlot(slotId, payload);
  const { data } = await api.put(`/admin/slots/${slotId}`, payload);
  return data;
}

export async function closeSlot(slotId) {
  if (isMockMode()) return mockApi.closeSlot(slotId);
  const { data } = await api.patch(`/admin/slots/${slotId}/close`);
  return data;
}
