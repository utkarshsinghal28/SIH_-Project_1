import axios from 'axios';
import { STORAGE_KEYS, readJSON, removeKey } from '../utils/storage.js';
import { normaliseAxiosError } from './apiError.js';

/**
 * Central Axios instance.
 *
 * Part 2 target: Node.js + Express REST API (`VITE_API_BASE_URL`), Mongo-backed,
 * JWT bearer authentication. Nothing else in the app talks to Axios directly.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * The real Express + MongoDB API (Part 2) is now the default data source.
 *
 * The Part 1 mock layer is retained only as an offline fallback for frontend
 * work without a running backend: set `VITE_USE_MOCK_API=true` to re-enable it.
 */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const isMockMode = () => USE_MOCK_API;

/**
 * Unwraps the API envelope `{ success: true, data }` used by every endpoint.
 */
export const unwrap = (response) => response?.data?.data ?? response?.data;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const session = readJSON(STORAGE_KEYS.SESSION);
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      removeKey(STORAGE_KEYS.SESSION);
    }
    return Promise.reject(normaliseAxiosError(error));
  },
);

export default api;
