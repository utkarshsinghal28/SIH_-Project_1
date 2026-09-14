import api, { isMockMode } from './api.js';
import { STORAGE_KEYS, readJSON } from '../utils/storage.js';
import * as mockApi from '../data/mock/mockApi.js';

/**
 * Auth service.
 *
 * Part 2 endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *
 * Response contract (already honoured by the Part 1 mock layer):
 *   { token: string, user: { id, name, phone, email, role, ... } }
 */
const token = () => readJSON(STORAGE_KEYS.SESSION)?.token ?? null;

export async function register(payload) {
  if (isMockMode()) return mockApi.register(payload);
  const { data } = await api.post('/auth/register', payload);
  return data;
}

/** `role` lets the API distinguish the farmer portal from the admin portal. */
export async function login({ identifier, password, role }) {
  if (isMockMode()) return mockApi.login({ identifier, password, role });
  const { data } = await api.post('/auth/login', { identifier, password, role });
  return data;
}

export async function fetchCurrentUser() {
  if (isMockMode()) return mockApi.me(token());
  const { data } = await api.get('/auth/me');
  return data;
}
