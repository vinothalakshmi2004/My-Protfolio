/**
 * Small, dependency-free sanitising helpers shared by validators and controllers.
 */

/** Escapes a user string so it can be used safely inside a RegExp. */
const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Escapes HTML special characters (used in the notification e-mail template). */
const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** "My Cool Project!" -> "my-cool-project" */
const slugify = (value = '') =>
  String(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

/**
 * Normalises a user-entered link:
 *   ''                      -> ''
 *   'github.com/me'         -> 'https://github.com/me'
 *   'mailto:a@b.com'        -> unchanged
 * Validation (isSafeUrl) runs afterwards and rejects anything unsafe.
 */
const normalizeUrl = (value) => {
  if (value === undefined || value === null) return value;
  const trimmed = String(value).trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  // Looks like a bare domain ("example.com/path") -> assume https
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};

/**
 * True for '' or an absolute URL whose protocol is in `protocols`.
 * Blocks javascript:, data:, vbscript:, protocol-relative URLs, etc.
 */
const isSafeUrl = (value, protocols = ['http:', 'https:']) => {
  if (value === '' || value === undefined || value === null) return true;
  try {
    const parsed = new URL(String(value));
    if (!protocols.includes(parsed.protocol)) return false;
    if (parsed.protocol.startsWith('http') && !parsed.hostname) return false;
    return true;
  } catch {
    return false;
  }
};

/**
 * True for values allowed in a file reference `url`:
 *   ''                         (no file)
 *   '/api/files/<24-hex id>'   (GridFS file served by this API)
 *   '/some-static-asset.svg'   (static asset shipped with the client, e.g. default favicon)
 */
const isSafeFileUrl = (value) => {
  if (value === '' || value === undefined || value === null) return true;
  const str = String(value);
  if (str.startsWith('//')) return false;
  return /^\/api\/files\/[a-f0-9]{24}$/i.test(str) || /^\/[\w\-./]+$/.test(str);
};

module.exports = {
  escapeRegex,
  escapeHtml,
  slugify,
  normalizeUrl,
  isSafeUrl,
  isSafeFileUrl,
};
