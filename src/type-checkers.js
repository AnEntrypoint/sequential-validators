export function isType(value, type) {
  if (type === 'null') return value === null;
  if (type === 'undefined') return value === undefined;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  return typeof value === type;
}

export function assertType(value, type, message) {
  if (!isType(value, type)) {
    throw new TypeError(message || `Expected ${type} but got ${getType(value)}`);
  }
  return value;
}

export function hasProperty(obj, prop) {
  return obj !== null && typeof obj === 'object' && prop in obj;
}

export function hasProperties(obj, props) {
  if (obj === null || typeof obj !== 'object') {
    return false;
  }
  return props.every(prop => prop in obj);
}

export function isInstanceOf(value, constructor) {
  try {
    return value instanceof constructor;
  } catch (e) {
    return false;
  }
}

export function getType(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'Date';
  if (value instanceof RegExp) return 'RegExp';
  if (value instanceof Error) return 'Error';
  return typeof value;
}
