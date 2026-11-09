const jwt = require('jsonwebtoken');

const DEV_FALLBACK_SECRET = 'dev_only_insecure_secret_change_me';
let warned = false;

/**
 * Returns the JWT secret. In production a real JWT_SECRET is mandatory —
 * we refuse to sign/verify tokens with a guessable default.
 */
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (16+ characters) in production');
  }
  if (!warned) {
    console.warn('[Auth] JWT_SECRET missing or too short — using an insecure development secret.');
    warned = true;
  }
  return secret || DEV_FALLBACK_SECRET;
};

/** Signs an admin session token (default expiry 7 days). */
const signToken = (admin) =>
  jwt.sign({ id: String(admin._id), role: admin.role }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** Verifies a token and returns its payload (throws on invalid/expired). */
const verifyToken = (token) => jwt.verify(token, getJwtSecret());

/** Extracts the Bearer token from an Authorization header (or null). */
const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() || null : null;
};

module.exports = { getJwtSecret, signToken, verifyToken, getBearerToken };
