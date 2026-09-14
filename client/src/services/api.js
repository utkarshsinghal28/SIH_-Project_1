import axios from 'axios';
import { STORAGE_KEYS, readJSON, removeKey } from '../utils/storage.js';
import { normaliseAxiosError } from './apiError.js';

/**
 * Central Axios instance.
 *
 * Part 2 target: Node.js + Express REST API (`VITE_API_BASE_URL`), Mongo-backed,
 * JWT bearer authentication. Nothing else in the app talks to Axios directly.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Part 1 runs with the mock layer enabled because no backend exists yet.
 * Flip `VITE_USE_MOCK_API=false` once the Express API from Part 2 is running.
 */
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const isMockMode = () => USE_MOCK_API;

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
