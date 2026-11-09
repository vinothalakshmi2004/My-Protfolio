const bcrypt = require('bcryptjs');
const { matchedData } = require('express-validator');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { signToken } = require('../utils/jwt');

// Used to keep response timing identical whether or not the e-mail exists
const DUMMY_HASH = bcrypt.hashSync('timing-attack-protection', 10);

/**
 * @desc    Admin login -> JWT (7 days)
 * @route   POST /api/auth/login
 * @access  Public (rate-limited: 5 failed attempts / 15 min)
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = matchedData(req, { locations: ['body'] });
  const admin = await Admin.findOne({ email }).select('+password');

  const valid = admin ? await admin.comparePassword(password) : await bcrypt.compare(password, DUMMY_HASH);
  if (!admin || !valid) {
    return errorResponse(res, 'Invalid email or password', 401);
  }

  return successResponse(res, { token: signToken(admin), admin: admin.toPublicJSON() }, 'Login successful');
});

/**
 * @desc    Current admin profile (also used by the dashboard to validate a stored token)
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) =>
  successResponse(res, req.admin.toPublicJSON(), 'Authenticated admin retrieved')
);

/**
 * @desc    Change password (requires the current password). Older tokens stop working;
 *          a fresh token is returned so the current session continues.
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = await Admin.findById(req.admin._id).select('+password');

  if (!(await admin.comparePassword(currentPassword))) {
    return errorResponse(res, 'Current password is incorrect', 400, [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }

  admin.password = newPassword;
  await admin.save(); // pre-save hook hashes it and sets passwordChangedAt

  return successResponse(res, { token: signToken(admin), admin: admin.toPublicJSON() }, 'Password changed successfully');
});

/**
 * @desc    Change login e-mail (requires the current password)
 * @route   POST /api/auth/change-email
 * @access  Private
 */
const changeEmail = asyncHandler(async (req, res) => {
  const { newEmail } = matchedData(req, { locations: ['body'] });
  const admin = await Admin.findById(req.admin._id).select('+password');

  if (!(await admin.comparePassword(req.body.currentPassword))) {
    return errorResponse(res, 'Current password is incorrect', 400, [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ]);
  }
  if (newEmail === admin.email) {
    return errorResponse(res, 'That is already your login e-mail', 400, [
      { field: 'newEmail', message: 'That is already your login e-mail' },
    ]);
  }
  if (await Admin.exists({ email: newEmail, _id: { $ne: admin._id } })) {
    return errorResponse(res, 'That e-mail is already used by another account', 409);
  }

  admin.email = newEmail;
  await admin.save();

  return successResponse(res, { token: signToken(admin), admin: admin.toPublicJSON() }, 'Login e-mail updated successfully');
});

module.exports = { login, getMe, changePassword, changeEmail };
