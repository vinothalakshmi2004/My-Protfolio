const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Sends a 400 with { field, message } entries if any express-validator chain failed.
 * Submitted values are intentionally not echoed back (could contain passwords).
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true }).map((err) => ({
    field: err.path || err.param || '_body',
    message: err.msg,
  }));
  return errorResponse(res, errors[0]?.message || 'Validation failed. Please check your inputs.', 400, errors);
};

/** Helper: rules(chains) -> [...chains, validate] */
const rules = (chains) => [...chains, validate];

module.exports = { validate, rules };
