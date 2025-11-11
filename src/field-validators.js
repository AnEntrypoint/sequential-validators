import { PATTERNS } from './patterns.js';
import { ValidationResult } from './result.js';

export function isUUID(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('Value must be a string');
  }
  if (!PATTERNS.UUID.test(value)) {
    return ValidationResult.fail('Value is not a valid UUID');
  }
  return ValidationResult.ok(value);
}

export function isEmail(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('Value must be a string');
  }
  if (!PATTERNS.EMAIL.test(value)) {
    return ValidationResult.fail('Value is not a valid email address');
  }
  return ValidationResult.ok(value);
}

export function isRequired(value, fieldName = 'Value') {
  if (value === null || value === undefined || value === '') {
    return ValidationResult.fail(`${fieldName} is required`);
  }
  return ValidationResult.ok(value);
}

export function isString(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('Value must be a string');
  }
  return ValidationResult.ok(value);
}

export function isNumber(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return ValidationResult.fail('Value must be a number');
  }
  return ValidationResult.ok(value);
}

export function isBoolean(value) {
  if (typeof value !== 'boolean') {
    return ValidationResult.fail('Value must be a boolean');
  }
  return ValidationResult.ok(value);
}

export function isArray(value) {
  if (!Array.isArray(value)) {
    return ValidationResult.fail('Value must be an array');
  }
  return ValidationResult.ok(value);
}

export function isObject(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return ValidationResult.fail('Value must be an object');
  }
  return ValidationResult.ok(value);
}

export function isURL(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('Value must be a string');
  }
  if (!PATTERNS.URL.test(value)) {
    return ValidationResult.fail('Value is not a valid URL');
  }
  return ValidationResult.ok(value);
}

export function isIdentifier(value) {
  if (typeof value !== 'string') {
    return ValidationResult.fail('Value must be a string');
  }
  if (!PATTERNS.IDENTIFIER.test(value)) {
    return ValidationResult.fail('Value is not a valid identifier');
  }
  return ValidationResult.ok(value);
}

export function isOneOf(value, allowedValues) {
  if (!allowedValues.includes(value)) {
    return ValidationResult.fail(`Value must be one of: ${allowedValues.join(', ')}`);
  }
  return ValidationResult.ok(value);
}

export function isPort(value) {
  const stringValue = String(value);
  if (!PATTERNS.PORT.test(stringValue)) {
    return ValidationResult.fail('Value is not a valid port number (0-65535)');
  }
  return ValidationResult.ok(value);
}
