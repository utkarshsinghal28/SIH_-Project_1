/**
 * Thin, safe wrapper over localStorage.
 *
 * Part 1 keeps the simulated session here. In Part 2 the same keys will hold a
 * real JWT issued by the Express API - the read/write surface does not change.
 */

const PREFIX = 'krishi.';

export const STORAGE_KEYS = {
  SESSION: `${PREFIX}session`,
  MOCK_DB: `${PREFIX}devState`,
};

export function readJSON(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable - ignore */
  }
}
