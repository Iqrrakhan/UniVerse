const { z } = require('zod');

/**
 * Express middleware factory: validates req.body against a Zod schema.
 * Returns 400 with structured errors if validation fails.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  req.validated = result.data;
  next();
};

/**
 * Validates req.params against a Zod schema.
 */
const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ message: 'Invalid parameters', errors });
  }
  req.validatedParams = result.data;
  next();
};

/**
 * Validates req.query against a Zod schema.
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({ message: 'Invalid query parameters', errors });
  }
  req.validatedQuery = result.data;
  next();
};

module.exports = { validate, validateParams, validateQuery };
