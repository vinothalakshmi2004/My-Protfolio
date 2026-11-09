/**
 * Axios clients + helpers shared by the landing page and the admin dashboard.
 *
 *  publicClient -> unauthenticated calls (landing page)
 *  adminClient  -> attaches the admin JWT; any 401 clears the token and
 *                  triggers the registered "unauthorized" handler (auto logout)
 */
import axios from 'axios';

/** REST API base URL, e.g. "http://localhost:5000/api" (set VITE_API_URL per environment). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

/**
 * Origin of the API, e.g. "http://localhost:5000" or "https://my-api.onrender.com".
 * Uploaded files are served by the API at `${API_ORIGIN}/api/files/<id>`, so this
 * works in dev and production as long as VITE_API_URL is correct.
 */
export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
})();

/**
 * Builds the absolute URL for a stored file reference.
 *   fileUrl('/api/files/abc')                   -> 'http://localhost:5000/api/files/abc'
 *   fileUrl('/api/files/abc', { download: 1 })  -> '...?download=1' (forces a download)
 *   fileUrl('/favicon.svg')                     -> '/favicon.svg' (static client asset)
 */
export const fileUrl = (url, { download = false } = {}) => {
  if (!url) return '';
  const absolute = url.startsWith('/api/') ? `${API_ORIGIN}${url}` : url;
  return download ? `${absolute}${absolute.includes('?') ? '&' : '?'}download=1` : absolute;
};

// ------------------------------------------------------------------ token storage
const TOKEN_KEY = 'portfolio_admin_token';

/**
 * The admin JWT lives in localStorage (the API is on another domain, so httpOnly
 * cookies would be blocked as third-party cookies). It is only ever sent to the
 * API, is cleared on logout / 401 / expiry, and expires server-side after 7 days.
 */
export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable (private mode) — session-only login */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

/** Reads the `exp` claim (ms) from a JWT without verifying it (the server verifies). */
export const getTokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

// ------------------------------------------------------------------ clients
/** Public client — generous timeout because free hosting (Render) can cold-start slowly. */
export const publicClient = axios.create({ baseURL: API_BASE_URL, timeout: 60000 });

/** Admin client — sends "Authorization: Bearer <token>". */
export const adminClient = axios.create({ baseURL: API_BASE_URL, timeout: 30000 });

adminClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let unauthorizedHandler = null;
/** Registers the callback run on any 401 (AuthContext uses it to log out + redirect). */
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // `skipAuthRedirect` is set on the login call (a wrong password is not a session expiry)
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      tokenStorage.clear();
      unauthorizedHandler?.(error.response?.data?.message);
    }
    return Promise.reject(error);
  }
);

// ------------------------------------------------------------------ error helpers
/** Best human-readable message for an axios error. */
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (!error?.response) return error?.message === 'canceled' ? 'Request cancelled' : 'Cannot reach the server. Check your connection.';
  return error.response.data?.message || fallback;
};

/** Server validation errors as { fieldPath: message } (for react-hook-form setError). */
export const getFieldErrors = (error) =>
  Object.fromEntries((error?.response?.data?.errors || []).map((e) => [e.field, e.message]));

/** Unwraps the standard { success, message, data } API envelope. */
export const unwrap = (response) => response.data?.data;
