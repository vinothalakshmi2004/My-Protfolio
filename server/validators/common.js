/**
 * Reusable express-validator chain builders.
 *
 * Every chain is "optional unless required" so the same rules work for both
 * POST (create) and PUT (partial update). Controllers read input exclusively
 * via matchedData(), so any field NOT declared here is silently dropped
 * (whitelisting / mass-assignment protection).
 */
const { body } = require('express-validator');
const { normalizeUrl, isSafeUrl, isSafeFileUrl } = require('../utils/sanitizers');
const { isValidFileId } = require('../config/gridfs');

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/; // "2026-01"
const YEAR_RE = /^(19|20)\d{2}$/; // "2024"
const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
const PHONE_RE = /^[+\d][\d\s\-().]{3,29}$/;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Text field. `required` fields must be present on create and non-empty
 * whenever provided (also on update).
 */
const text = (field, { required = false, isUpdate = false, max = 200, label = field } = {}) => {
  let chain = body(field);
  chain =
    required && !isUpdate
      ? chain.exists({ values: 'null' }).withMessage(`${label} is required`).bail()
      : chain.optional({ values: 'null' });
  chain = chain.isString().withMessage(`${label} must be text`).bail().trim();
  if (required) chain = chain.notEmpty().withMessage(`${label} is required`).bail();
  return chain.isLength({ max }).withMessage(`${label} must be at most ${max} characters`);
};

/** http(s) link (bare domains get "https://" prepended). '' clears the field. */
const url = (field, { label = field, protocols = ['http:', 'https:'] } = {}) =>
  body(field)
    .optional({ values: 'null' })
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .customSanitizer(normalizeUrl)
    .isLength({ max: 500 })
    .withMessage(`${label} is too long`)
    .bail()
    .custom((value) => isSafeUrl(value, protocols))
    .withMessage(`${label} must be a valid URL starting with ${protocols.map((p) => p.replace(':', '')).join(' / ')}`);

const bool = (field, { label = field } = {}) =>
  body(field).optional({ values: 'null' }).isBoolean().withMessage(`${label} must be true or false`).bail().toBoolean();

const int = (field, { label = field, min = 0, max = 100000 } = {}) =>
  body(field)
    .optional({ values: 'null' })
    .isInt({ min, max })
    .withMessage(`${label} must be a whole number between ${min} and ${max}`)
    .bail()
    .toInt();

const oneOf = (field, values, { label = field } = {}) =>
  body(field)
    .optional({ values: 'null' })
    .isIn(values)
    .withMessage(`${label} must be one of: ${values.filter(Boolean).join(', ')}`);

const pattern = (field, regex, message) =>
  body(field)
    .optional({ values: 'null' })
    .isString()
    .withMessage(message)
    .bail()
    .trim()
    .custom((value) => value === '' || regex.test(value))
    .withMessage(message);

const month = (field, { label = field } = {}) => pattern(field, MONTH_RE, `${label} must be in YYYY-MM format`);
const year = (field, { label = field } = {}) => pattern(field, YEAR_RE, `${label} must be a 4-digit year`);
const hexColor = (field, { label = field } = {}) => pattern(field, HEX_COLOR_RE, `${label} must be a hex colour like #7c3aed`);
const phone = (field, { label = field } = {}) => pattern(field, PHONE_RE, `${label} must be a valid phone number`);

/** E-mail ('' allowed unless required). Lower-cased, dots preserved. */
const email = (field, { label = field, required = false } = {}) => {
  let chain = body(field);
  chain = required ? chain.exists({ values: 'falsy' }).withMessage(`${label} is required`).bail() : chain.optional({ values: 'null' });
  return chain
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .trim()
    .toLowerCase()
    .custom((value) => (value === '' && !required) || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
    .withMessage(`${label} must be a valid e-mail address`)
    .isLength({ max: 254 });
};

/** Array of strings: trims items and drops empty ones (e.g. blank feature rows). */
const stringArray = (field, { label = field, maxItems = 50, maxLen = 200 } = {}) =>
  body(field)
    .optional({ values: 'null' })
    .isArray({ max: maxItems })
    .withMessage(`${label} must be a list of at most ${maxItems} items`)
    .bail()
    .custom((arr) => arr.every((item) => typeof item === 'string' && item.trim().length <= maxLen))
    .withMessage(`Each ${label} item must be text up to ${maxLen} characters`)
    .bail()
    .customSanitizer((arr) => arr.map((item) => item.trim()).filter(Boolean));

/** Validates + whitelists one { url, fileId[, contentType] } object. */
const cleanFileRef = (value, label, withContentType) => {
  if (!isPlainObject(value)) throw new Error(`${label} must be an object with url and fileId`);
  const fileId = typeof value.fileId === 'string' ? value.fileId.trim() : '';
  const rawUrl = typeof value.url === 'string' ? value.url.trim() : '';
  if (fileId && !isValidFileId(fileId)) throw new Error(`${label}.fileId is not a valid file id`);
  if (!isSafeFileUrl(rawUrl)) throw new Error(`${label}.url must point to /api/files/<id>`);
  // When a GridFS file is referenced, the URL is always derived from its id (keeps them in sync)
  const clean = { url: fileId ? `/api/files/${fileId}` : rawUrl, fileId };
  if (withContentType) {
    const type = typeof value.contentType === 'string' ? value.contentType.trim() : '';
    if (type && !/^(image\/(webp|jpeg|png)|application\/pdf)$/.test(type)) {
      throw new Error(`${label}.contentType must be an image or application/pdf`);
    }
    clean.contentType = type;
  }
  return clean;
};

const fileRef = (field, { label = field, withContentType = false } = {}) =>
  body(field)
    .optional({ values: 'null' })
    .custom((value) => Boolean(cleanFileRef(value, label, withContentType)))
    .bail()
    .customSanitizer((value) => cleanFileRef(value, label, withContentType));

const fileRefArray = (field, { label = field, maxItems = 20 } = {}) =>
  body(field)
    .optional({ values: 'null' })
    .isArray({ max: maxItems })
    .withMessage(`${label} can contain at most ${maxItems} files`)
    .bail()
    .custom((arr) => arr.every((item, i) => Boolean(cleanFileRef(item, `${label}[${i}]`, false))))
    .bail()
    .customSanitizer((arr) => arr.map((item, i) => cleanFileRef(item, `${label}[${i}]`, false)).filter((f) => f.url));

module.exports = {
  MONTH_RE,
  YEAR_RE,
  isPlainObject,
  text,
  url,
  bool,
  int,
  oneOf,
  month,
  year,
  hexColor,
  phone,
  email,
  stringArray,
  fileRef,
  fileRefArray,
  cleanFileRef,
};
