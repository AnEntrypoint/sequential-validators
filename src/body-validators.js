import { throwValidationError } from '@sequential/error-handling';
import { isRequired, isArray } from './field-validators.js';
import { ValidationResult } from './result.js';

export function validateBodyFields(body, fields) {
  const missing = [];
  for (const field of fields) {
    if (!body[field]) missing.push(field);
  }
  if (missing.length > 0) {
    throwValidationError(missing[0], `${missing.join(', ')} required`);
  }
  return body;
}

export function validateBodyArray(body, field) {
  const value = body[field];
  const result = isArray(value);
  if (!result.isValid) {
    throwValidationError(field, `${field} array is required and cannot be empty`);
  }
  if (result.value.length === 0) {
    throwValidationError(field, `${field} array cannot be empty`);
  }
  return value;
}

export function validateBodyFieldExists(body, field, errorMessage) {
  if (!body[field]) {
    throwValidationError(field, errorMessage || `${field} is required`);
  }
  return body[field];
}

export function requireBodyField(body, field) {
  const value = body[field];
  if (value === undefined || value === null || value === '') {
    throwValidationError(field, `${field} is required`);
  }
  return value;
}

export function validateBodyMultiple(body, schema) {
  const errors = [];
  for (const [field, config] of Object.entries(schema)) {
    const value = body[field];
    if (config.required && !value) {
      errors.push(`${field}: ${config.message || 'required'}`);
    }
    if (value && config.type) {
      if (config.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field}: must be array`);
      }
    }
  }
  if (errors.length > 0) {
    throwValidationError('validation', errors.join('; '));
  }
  return body;
}

export function createBodyValidator(schema) {
  return (req, res, next) => {
    try {
      validateBodyMultiple(req.body, schema);
      next();
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}
