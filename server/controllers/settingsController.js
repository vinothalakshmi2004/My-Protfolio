const { matchedData } = require('express-validator');
const SiteSettings = require('../models/SiteSettings');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/apiResponse');
const { cleanupReplacedFiles } = require('../utils/fileRefs');
const { findFileById } = require('../config/gridfs');

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date);

/**
 * Turns { contact: { email: 'x' } } into { 'contact.email': 'x' } so a partial
 * update only touches the fields that were sent (a plain $set of `contact`
 * would wipe phone/location). File refs ({ url, fileId }) and arrays are
 * replaced as a whole.
 */
const flattenForSet = (obj, prefix = '', out = {}) => {
  Object.entries(obj).forEach(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    const isFileRef = isPlainObject(value) && 'fileId' in value;
    if (isPlainObject(value) && !isFileRef) flattenForSet(value, path, out);
    else out[path] = value;
  });
  return out;
};

/** Shapes settings for public consumption: hides phone, hidden socials and internals. */
const toPublicSettings = (settingsDoc) => {
  const s = settingsDoc.toObject();
  delete s.singletonKey;
  delete s.__v;
  if (!s.contact?.showPhonePublicly && s.contact) s.contact.phone = '';
  s.socialLinks = (s.socialLinks || []).filter((link) => link.visible !== false);
  return s;
};

/**
 * @desc    Public site settings (phone hidden unless showPhonePublicly)
 * @route   GET /api/settings
 * @access  Public
 */
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.findSettings(); // read-only: a public GET never creates documents
  return successResponse(res, toPublicSettings(settings), 'Settings retrieved');
});

/**
 * @desc    Full settings for the admin editor
 * @route   GET /api/admin/settings
 * @access  Private
 */
const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings();
  return successResponse(res, settings, 'Admin settings retrieved');
});

/**
 * @desc    Partial update of site settings. Replaced or removed files
 *          (profile image, resume, favicon, OG image, ...) are deleted from GridFS.
 * @route   PUT /api/settings
 * @access  Private
 */
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSettings();
  const before = settings.toObject();
  const updates = matchedData(req, { locations: ['body'], includeOptionals: false });

  // Resume bookkeeping: stamp updatedAt + store the size when a new file is attached
  if (updates.resume) {
    if (updates.resume.fileId && updates.resume.fileId !== before.resume?.fileId) {
      const file = await findFileById(updates.resume.fileId);
      updates.resume.size = file?.length || 0;
      updates.resume.updatedAt = new Date();
    } else if (!updates.resume.fileId) {
      updates.resume = { url: '', fileId: '', fileName: '', size: 0, updatedAt: new Date() };
    } else {
      // Same file, maybe renamed -> keep size/updatedAt
      updates.resume.size = before.resume?.size || 0;
      updates.resume.updatedAt = before.resume?.updatedAt;
    }
  }

  const flat = flattenForSet(updates);
  Object.entries(flat).forEach(([path, value]) => settings.set(path, value));
  await settings.save(); // validators + sectionOrder normalisation

  await cleanupReplacedFiles(before, settings.toObject());
  return successResponse(res, settings, 'Site settings updated successfully');
});

module.exports = { getPublicSettings, getAdminSettings, updateSettings, flattenForSet, toPublicSettings };
