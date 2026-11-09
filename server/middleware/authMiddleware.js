const Admin = require('../models/Admin');
const { errorResponse } = require('../utils/apiResponse');
const { verifyToken, getBearerToken } = require('../utils/jwt');

/**
 * protect — requires a valid "Authorization: Bearer <jwt>" header.
 * Rejects expired tokens, tokens for deleted admins, and tokens issued
 * before the admin's last password change. Attaches req.admin on success.
 */
const protect = async (req, res, next) => {
  const token = getBearerToken(req);
  if (!token) {
    return errorResponse(res, 'Not authorized. Please log in.', 401);
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Not authorized. Invalid token.';
    return errorResponse(res, message, 401);
  }

  try {
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return errorResponse(res, 'Not authorized. Account no longer exists.', 401);
    }
    if (admin.changedPasswordAfter(decoded.iat)) {
      return errorResponse(res, 'Password was changed. Please log in again.', 401);
    }
    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { protect };
