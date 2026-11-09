/**
 * AuthContext — admin session state for the dashboard.
 *
 *  status: 'checking'      a stored token is being validated with GET /auth/me
 *          'authenticated' token valid, `admin` loaded
 *          'anonymous'     no/invalid token -> ProtectedRoute redirects to /admin/login
 *
 * Auto-logout happens when: any API call returns 401 (expired/revoked token),
 * the JWT's `exp` time passes while the tab is open, or the user clicks "Log out".
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { tokenStorage, getTokenExpiry, setUnauthorizedHandler } from '../../lib/apiClient';
import { authApi } from '../../services/adminApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => tokenStorage.get());
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'checking' : 'anonymous'));
  const expiryTimer = useRef(null);

  /** Clears the session. `reason` (optional) is shown as a toast. */
  const logout = useCallback((reason) => {
    tokenStorage.clear();
    setToken(null);
    setAdmin(null);
    setStatus('anonymous');
    if (reason) toast.error(reason, { id: 'session' });
  }, []);

  /** Stores a token (+ admin) after login or a credential change. */
  const applySession = useCallback(({ token: newToken, admin: newAdmin }) => {
    tokenStorage.set(newToken);
    setToken(newToken);
    setAdmin(newAdmin);
    setStatus('authenticated');
  }, []);

  /** POST /auth/login — throws the axios error on failure (LoginPage shows it). */
  const login = useCallback(
    async (email, password) => {
      const session = await authApi.login(email, password);
      applySession(session);
      return session.admin;
    },
    [applySession]
  );

  // Any 401 from adminClient -> log out with the server's message
  useEffect(() => {
    setUnauthorizedHandler((message) => logout(message || 'Your session has expired. Please log in again.'));
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Validate a stored token once on load
  useEffect(() => {
    if (status !== 'checking') return undefined;
    let cancelled = false;
    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setAdmin(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) logout();
      });
    return () => {
      cancelled = true;
    };
  }, [status, logout]);

  // Log out exactly when the JWT expires (if the tab stays open)
  useEffect(() => {
    clearTimeout(expiryTimer.current);
    const expiresAt = token ? getTokenExpiry(token) : null;
    if (!expiresAt) return undefined;
    const msLeft = expiresAt - Date.now();
    if (msLeft <= 0) {
      logout('Your session has expired. Please log in again.');
      return undefined;
    }
    // setTimeout max is ~24.8 days; tokens last 7 days
    expiryTimer.current = setTimeout(() => logout('Your session has expired. Please log in again.'), Math.min(msLeft, 2 ** 31 - 1));
    return () => clearTimeout(expiryTimer.current);
  }, [token, logout]);

  const value = useMemo(
    () => ({ status, admin, isAuthenticated: status === 'authenticated', login, logout, applySession }),
    [status, admin, login, logout, applySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Hook: { status, admin, isAuthenticated, login(email, pw), logout(reason?), applySession({token, admin}) } */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
