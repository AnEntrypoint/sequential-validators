import { test } from 'node:test';
import assert from 'node:assert';
import {
  ValidationResult,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isObject,
  isRequired,
  isEmail,
  isURL,
  isUUID
} from '../src/index.js';

test('ValidationResult - Success and Failure States', async (t) => {
  await t.test('creates successful validation result', () => {
    const result = ValidationResult.ok('value');
    assert.equal(result.isValid, true);
    assert.equal(result.value, 'value');
    assert.equal(result.errors.length, 0);
  });

  await t.test('creates failed validation result', () => {
    const result = ValidationResult.fail('error message');
    assert.equal(result.isValid, false);
    assert.equal(result.errors[0], 'error message');
  });

  await t.test('chains with map on success', () => {
    const result = ValidationResult.ok(5).map(x => x * 2);
    assert.equal(result.isValid, true);
    assert.equal(result.value, 10);
  });

  await t.test('map skips on error', () => {
    const result = ValidationResult.fail('failed').map(x => x * 2);
    assert.equal(result.isValid, false);
  });

  await t.test('chains with flatMap on success', () => {
    const result = ValidationResult.ok(5)
      .flatMap(x => ValidationResult.ok(x * 2));
    assert.equal(result.isValid, true);
    assert.equal(result.value, 10);
  });

  await t.test('flatMap propagates error', () => {
    const result = ValidationResult.fail('error')
      .flatMap(x => ValidationResult.ok(x * 2));
    assert.equal(result.isValid, false);
  });

  await t.test('getOrElse returns value on success', () => {
    const result = ValidationResult.ok('success');
    assert.equal(result.getOr('default'), 'success');
  });

  await t.test('getOrElse returns default on error', () => {
    const result = ValidationResult.fail('error');
    assert.equal(result.getOr('default'), 'default');
  });

  await t.test('getOrThrow returns value on success', () => {
    const result = ValidationResult.ok('success');
    assert.equal(result.getOrThrow(), 'success');
  });

  await t.test('getOrThrow throws on error', () => {
    const result = ValidationResult.fail('error message');
    assert.throws(() => result.getOrThrow(), /Validation failed/);
  });
});

test('String Validation', async (t) => {
  await t.test('validates valid string', () => {
    const result = isString('hello');
    assert.equal(result.isValid, true);
  });

  await t.test('rejects non-string', () => {
    const result = isString(123);
    assert.equal(result.isValid, false);
  });

  await t.test('rejects null', () => {
    const result = isString(null);
    assert.equal(result.isValid, false);
  });

  await t.test('validates empty string', () => {
    const result = isString('');
    assert.equal(result.isValid, true);
  });

  await t.test('validates string with spaces', () => {
    const result = isString('  hello world  ');
    assert.equal(result.isValid, true);
  });
});

test('Number Validation', async (t) => {
  await t.test('validates valid number', () => {
    const result = isNumber(42);
    assert.equal(result.isValid, true);
  });

  await t.test('validates negative number', () => {
    const result = isNumber(-10);
    assert.equal(result.isValid, true);
  });

  await t.test('validates zero', () => {
    const result = isNumber(0);
    assert.equal(result.isValid, true);
  });

  await t.test('validates float', () => {
    const result = isNumber(3.14);
    assert.equal(result.isValid, true);
  });

  await t.test('rejects non-number', () => {
    const result = isNumber('42');
    assert.equal(result.isValid, false);
  });

  await t.test('rejects NaN', () => {
    const result = isNumber(NaN);
    assert.equal(result.isValid, false);
  });

  await t.test('accepts Infinity as number', () => {
    const result = isNumber(Infinity);
    assert.equal(result.isValid, true);
  });
});

test('Boolean Validation', async (t) => {
  await t.test('validates true', () => {
    const result = isBoolean(true);
    assert.equal(result.isValid, true);
  });

  await t.test('validates false', () => {
    const result = isBoolean(false);
    assert.equal(result.isValid, true);
  });

  await t.test('rejects non-boolean truthy values', () => {
    assert.equal(isBoolean(1).isValid, false);
    assert.equal(isBoolean('true').isValid, false);
    assert.equal(isBoolean({}).isValid, false);
  });
});

test('Array Validation', async (t) => {
  await t.test('validates empty array', () => {
    const result = isArray([]);
    assert.equal(result.isValid, true);
  });

  await t.test('validates array of values', () => {
    const result = isArray([1, 2, 3]);
    assert.equal(result.isValid, true);
  });

  await t.test('validates mixed array', () => {
    const result = isArray([1, 'two', true, null]);
    assert.equal(result.isValid, true);
  });

  await t.test('validates nested arrays', () => {
    const result = isArray([[1, 2], [3, 4]]);
    assert.equal(result.isValid, true);
  });

  await t.test('rejects non-array', () => {
    assert.equal(isArray('not array').isValid, false);
    assert.equal(isArray(123).isValid, false);
    assert.equal(isArray({ length: 0 }).isValid, false);
  });
});

test('Object Validation', async (t) => {
  await t.test('validates empty object', () => {
    const result = isObject({});
    assert.equal(result.isValid, true);
  });

  await t.test('validates object with properties', () => {
    const result = isObject({ a: 1, b: 'two', c: true });
    assert.equal(result.isValid, true);
  });

  await t.test('validates nested object', () => {
    const result = isObject({
      user: { name: 'John', age: 30 },
      settings: { theme: 'dark' }
    });
    assert.equal(result.isValid, true);
  });

  await t.test('rejects non-object', () => {
    assert.equal(isObject('string').isValid, false);
    assert.equal(isObject(123).isValid, false);
    assert.equal(isObject(null).isValid, false);
    assert.equal(isObject([1, 2, 3]).isValid, false);
  });
});

test('Required Validation', async (t) => {
  await t.test('passes for non-null/undefined value', () => {
    const result = isRequired('value');
    assert.equal(result.isValid, true);
  });

  await t.test('passes for falsy values (0, false) but rejects empty string', () => {
    assert.equal(isRequired(0).isValid, true);
    assert.equal(isRequired(false).isValid, true);
    assert.equal(isRequired('').isValid, false);
  });

  await t.test('rejects null', () => {
    const result = isRequired(null);
    assert.equal(result.isValid, false);
  });

  await t.test('rejects undefined', () => {
    const result = isRequired(undefined);
    assert.equal(result.isValid, false);
  });
});

test('Format Validators', async (t) => {
  await t.test('validates email format', () => {
    assert.equal(isEmail('user@example.com').isValid, true);
    assert.equal(isEmail('invalid-email').isValid, false);
  });

  await t.test('validates URL format', () => {
    assert.equal(isURL('https://example.com').isValid, true);
    assert.equal(isURL('http://example.com').isValid, true);
    assert.equal(isURL('not-a-url').isValid, false);
  });

  await t.test('validates UUID format', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    assert.equal(isUUID(uuid).isValid, true);
    assert.equal(isUUID('not-a-uuid').isValid, false);
  });
});

test('Validator Composition', async (t) => {
  await t.test('combines validators with AND logic', () => {
    const isPositive = (val) => val > 0
      ? ValidationResult.ok(val)
      : ValidationResult.fail('not positive');
    const isLessThan100 = (val) => val < 100
      ? ValidationResult.ok(val)
      : ValidationResult.fail('too large');

    const validator = (val) =>
      isNumber(val)
        .flatMap(isPositive)
        .flatMap(isLessThan100);

    assert.equal(validator(50).isValid, true);
    assert.equal(validator(-5).isValid, false);
    assert.equal(validator(150).isValid, false);
  });

  await t.test('chains multiple validations', () => {
    const validateEmail = (val) =>
      isString(val)
        .flatMap(v => v.includes('@')
          ? ValidationResult.ok(v)
          : ValidationResult.fail('invalid email'));

    assert.equal(validateEmail('user@example.com').isValid, true);
    assert.equal(validateEmail('invalid-email').isValid, false);
    assert.equal(validateEmail(123).isValid, false);
  });
});

test('Error Handling', async (t) => {
  await t.test('provides error messages', () => {
    const result = isString(123);
    assert.equal(result.isValid, false);
    assert.ok(result.errors.length > 0);
  });

  await t.test('preserves error through map operations', () => {
    const result = ValidationResult.fail('original error')
      .map(() => 'never executes');
    assert.equal(result.isValid, false);
    assert.equal(result.errors[0], 'original error');
  });

  await t.test('merges multiple validations', () => {
    const result1 = isString(123);
    const result2 = isNumber('abc');
    result1.merge(result2);
    assert.equal(result1.isValid, false);
    assert.ok(result1.errors.length >= 2);
  });
});

test('Validator Reusability', async (t) => {
  await t.test('can reuse same validator multiple times', () => {
    const validator = (val) => isNumber(val);

    const result1 = validator(10);
    const result2 = validator(20);
    const result3 = validator('invalid');

    assert.equal(result1.isValid, true);
    assert.equal(result2.isValid, true);
    assert.equal(result3.isValid, false);
  });

  await t.test('supports validator composition', () => {
    const isPositive = (val) => isNumber(val)
      .flatMap(v => v > 0
        ? ValidationResult.ok(v)
        : ValidationResult.fail('must be positive'));

    const results = [5, -3, 10, -1].map(isPositive);

    assert.equal(results[0].isValid, true);
    assert.equal(results[1].isValid, false);
    assert.equal(results[2].isValid, true);
    assert.equal(results[3].isValid, false);
  });
});
