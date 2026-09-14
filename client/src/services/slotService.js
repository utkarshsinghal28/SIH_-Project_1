import api, { isMockMode, unwrap } from './api.js';
import * as mockApi from '../data/mock/mockApi.js';
import { SLOT_STATUS } from '../utils/constants.js';

/**
 * Slot service.
 *
 * Live endpoints (Part 2):
 *   GET    /api/centres/:centreId/slots       (?date&status)
 *   POST   /api/admin/centres/:centreId/slots
 *   PUT    /api/admin/slots/:id
 *   PATCH  /api/admin/slots/:id/status
 */
export async function listSlots(centreId, params = {}) {
  if (isMockMode()) return mockApi.listSlots(centreId, params);
  return unwrap(await api.get(`/centres/${centreId}/slots`, { params }));
}

export async function createSlot(centreId, payload) {
  if (isMockMode()) return mockApi.createSlot(centreId, payload);
  return unwrap(await api.post(`/admin/centres/${centreId}/slots`, payload));
}

export async function updateSlot(slotId, payload) {
  if (isMockMode()) return mockApi.updateSlot(slotId, payload);
  return unwrap(await api.put(`/admin/slots/${slotId}`, payload));
}

export async function setSlotStatus(slotId, status) {
  if (isMockMode()) return mockApi.setSlotStatus(slotId, status);
  return unwrap(await api.patch(`/admin/slots/${slotId}/status`, { status }));
}

/** Convenience wrapper used by the "Close slot" action. */
export function closeSlot(slotId) {
  return setSlotStatus(slotId, SLOT_STATUS.CLOSED);
}
