import api, { isMockMode } from './api.js';
import * as mockApi from '../data/mock/mockApi.js';

/**
 * Procurement centre service.
 *
 * Part 2 endpoints:
 *   GET    /api/centres                 (?search&district&state&status)
 *   GET    /api/centres/:id
 *   POST   /api/admin/centres
 *   PUT    /api/admin/centres/:id
 *   PATCH  /api/admin/centres/:id/status   (soft activate / deactivate)
 */
export async function listCentres(params = {}) {
  if (isMockMode()) return mockApi.listCentres(params);
  const { data } = await api.get('/centres', { params });
  return data;
}

export async function getCentre(centreId) {
  if (isMockMode()) return mockApi.getCentre(centreId);
  const { data } = await api.get(`/centres/${centreId}`);
  return data;
}

export async function createCentre(payload) {
  if (isMockMode()) return mockApi.createCentre(payload);
  const { data } = await api.post('/admin/centres', payload);
  return data;
}

export async function updateCentre(centreId, payload) {
  if (isMockMode()) return mockApi.updateCentre(centreId, payload);
  const { data } = await api.put(`/admin/centres/${centreId}`, payload);
  return data;
}

/**
 * Centres are never physically deleted - deactivation is a soft state change so
 * historical bookings keep referring to a valid centre document.
 */
export async function setCentreStatus(centreId, status) {
  if (isMockMode()) return mockApi.setCentreStatus(centreId, status);
  const { data } = await api.patch(`/admin/centres/${centreId}/status`, { status });
  return data;
}
