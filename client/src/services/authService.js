import api, { isMockMode, unwrap } from './api.js';
import * as mockApi from '../data/mock/mockApi.js';
import { STORAGE_KEYS, readJSON } from '../utils/storage.js';

/**
 * Auth service.
 *
 * Live endpoints (Part 2 - Express + MongoDB):
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   GET  /api/auth/me
 *
 * Response contract: { token: string, user: { id, name, phone, email, role, ... } }
 */
const token = () => readJSON(STORAGE_KEYS.SESSION)?.token ?? null;

export async function register(payload) {
  if (isMockMode()) return mockApi.register(payload);
  return unwrap(await api.post('/auth/register', payload));
}

/** `role` selects the portal (FARMER / ADMIN); the server enforces the match. */
export async function login({ identifier, password, role }) {
  if (isMockMode()) return mockApi.login({ identifier, password, role });
  return unwrap(await api.post('/auth/login', { identifier, password, role }));
}

export async function fetchCurrentUser() {
  if (isMockMode()) return mockApi.me(token());
  return unwrap(await api.get('/auth/me'));
}
