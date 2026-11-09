const rateLimit = require('express-rate-limit');
const { verifyToken, getBearerToken } = require('../utils/jwt');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const limitMessage = (message) => ({ success: false, message });

/** True when the request carries a valid (signature + expiry) admin token. */
const hasValidAdminToken = (req) => {
  const token = getBearerToken(req);
  if (!token) return false;
  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
};

/**
 * General API limiter (per IP): 300 requests / 15 min.
 * Skipped for GridFS file downloads (a page can load many images) and for
 * authenticated admin requests (the dashboard makes many calls while editing).
 */
const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => (req.method === 'GET' && req.path.startsWith('/files/')) || hasValidAdminToken(req),
  message: limitMessage('Too many requests from this IP, please try again after 15 minutes.'),
});

/** Contact form: 5 submissions / 15 min per IP. */
const contactLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage('Too many contact messages sent from this IP. Please try again after 15 minutes.'),
});

/** Login: 5 FAILED attempts / 15 min per IP (successful logins don't count). */
const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage('Too many login attempts. Please try again after 15 minutes.'),
});

/** Password / e-mail change: 10 attempts / 15 min (slows down current-password guessing). */
const sensitiveAuthLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: limitMessage('Too many attempts. Please try again after 15 minutes.'),
});

module.exports = { apiLimiter, contactLimiter, loginLimiter, sensitiveAuthLimiter };
