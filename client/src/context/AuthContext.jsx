import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService.js';
import { STORAGE_KEYS, readJSON, removeKey, writeJSON } from '../utils/storage.js';
import { ROLES } from '../utils/constants.js';
import { isMockMode } from '../services/api.js';

/**
 * Authentication state for the whole SPA.
 *
 * `token` is a real JWT issued by the Express API and is sent as a bearer token
 * on every request (see services/api.js).
 *
 * The route guards built on this context are navigation UX only. Real
 * authorisation is enforced by the server on every protected endpoint, so
 * tampering with this state in the browser grants no access to data.
 */
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [initialising, setInitialising] = useState(true);

  // Restore an existing development session on first paint.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const session = readJSON(STORAGE_KEYS.SESSION);
      if (!session?.token) {
        if (!cancelled) setInitialising(false);
        return;
      }

      setToken(session.token);
      try {
        const { user: currentUser } = await authService.fetchCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch {
        removeKey(STORAGE_KEYS.SESSION);
        if (!cancelled) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setInitialising(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback((session) => {
    writeJSON(STORAGE_KEYS.SESSION, { token: session.token, role: session.user.role });
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const login = useCallback(
    async ({ identifier, password, role }) => {
      const session = await authService.login({ identifier, password, role });
      return persistSession(session);
    },
    [persistSession],
  );

  const registerFarmer = useCallback(
    async (payload) => {
      const session = await authService.register(payload);
      return persistSession(session);
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    removeKey(STORAGE_KEYS.SESSION);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initialising,
      isAuthenticated: Boolean(user),
      isFarmer: user?.role === ROLES.FARMER,
      isAdmin: user?.role === ROLES.ADMIN,
      /** True while the app is running against the Part 1 mock layer. */
      usingMockBackend: isMockMode(),
      login,
      registerFarmer,
      logout,
    }),
    [user, token, initialising, login, registerFarmer, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
