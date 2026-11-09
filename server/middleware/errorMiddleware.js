const multer = require('multer');
const { errorResponse } = require('../utils/apiResponse');

/** 404 handler for unknown routes. */
const notFound = (req, res) => errorResponse(res, `Route not found - ${req.originalUrl}`, 404);

/**
 * Central error handler — converts known error types into the standard
 * { success: false, message, errors? } JSON shape with a sensible status.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Multer upload errors (file too large, unexpected field, ...)
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `File is too large. Max ${process.env.MAX_IMAGE_MB || 5}MB for images and ${process.env.MAX_PDF_MB || 10}MB for PDFs.`
        : err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Unexpected file field. Send the file in a field named "file".'
          : `Upload error: ${err.message}`;
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = err.kind === 'ObjectId' ? 404 : 400;
    message = err.kind === 'ObjectId' ? 'Resource not found' : `Invalid value for ${err.path}`;
  }

  // Duplicate key (unique index)
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    message = `An item with the same ${fields.join(', ') || 'value'} already exists`;
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((val) => ({ field: val.path, message: val.message }));
  }

  if (statusCode >= 500 && process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }
  // Never leak internals of unexpected errors in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
