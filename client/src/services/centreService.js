import api, { isMockMode, unwrap } from './api.js';
import * as mockApi from '../data/mock/mockApi.js';

/**
 * Procurement centre service.
 *
 * Live endpoints (Part 2):
 *   GET    /api/centres                      (?search&district&state&status)
 *   GET    /api/centres/:id
 *   POST   /api/admin/centres
 *   PUT    /api/admin/centres/:id
 *   PATCH  /api/admin/centres/:id/status     (soft activate / deactivate)
 */
export async function listCentres(params = {}) {
  if (isMockMode()) return mockApi.listCentres(params);
  return unwrap(await api.get('/centres', { params }));
}

export async function getCentre(centreId) {
  if (isMockMode()) return mockApi.getCentre(centreId);
  return unwrap(await api.get(`/centres/${centreId}`));
}

export async function createCentre(payload) {
  if (isMockMode()) return mockApi.createCentre(payload);
  return unwrap(await api.post('/admin/centres', payload));
}

export async function updateCentre(centreId, payload) {
  if (isMockMode()) return mockApi.updateCentre(centreId, payload);
  return unwrap(await api.put(`/admin/centres/${centreId}`, payload));
}

/**
 * Centres are never physically deleted - deactivation is a soft status change
 * so historical bookings keep referring to a valid centre document.
 */
export async function setCentreStatus(centreId, status) {
  if (isMockMode()) return mockApi.setCentreStatus(centreId, status);
  return unwrap(await api.patch(`/admin/centres/${centreId}/status`, { status }));
}
