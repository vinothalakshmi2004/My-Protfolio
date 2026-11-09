/**
 * Strips MongoDB operator keys ("$gt", "$where", ...) and dotted keys from
 * request bodies and query strings to prevent NoSQL operator injection.
 * (Lightweight replacement for express-mongo-sanitize.)
 */
const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value);

const scrub = (value) => {
  if (Array.isArray(value)) return value.map(scrub);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
      .map(([key, val]) => [key, scrub(val)])
  );
};

const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = scrub(req.body);
  // req.query is a getter in Express 5 but a plain object in Express 4 — mutate in place
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) delete req.query[key];
      else if (typeof req.query[key] === 'object') req.query[key] = String(req.query[key]);
    });
  }
  next();
};

module.exports = { sanitizeRequest };
