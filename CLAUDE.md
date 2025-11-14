# Sequential Validators

## Project Overview
Validation utilities library (`tasker-validators`) for the sequential-ecosystem, providing field validators, schema validation, and type checking with functional, composable patterns.

**Tech Stack:** ES6 Modules (type: "module"), pure JavaScript, no dependencies
**Entry Point:** `src/index.js`

---

## Architecture

### Module Structure
```
src/
├── index.js              # Main export aggregator
├── result.js             # ValidationResult monad
├── field-validators.js   # Field-level validators (isUUID, isEmail, etc.)
├── schema-validators.js  # Object schema validation
├── type-checkers.js      # Low-level type utilities
└── patterns.js           # Regex patterns for validation
```

### Export Strategy
Modular exports via `package.json` exports field:
- `.` → Main bundle (all utilities)
- `./patterns` → Just regex patterns
- `./result` → ValidationResult class
- `./field-validators` → Field validators only
- `./schema-validators` → Schema validation only
- `./type-checkers` → Type utilities only

---

## Core Concepts

### ValidationResult Monad
Functional error handling pattern replacing try/catch:

**Structure:**
- `isValid: boolean` - Validation state
- `errors: string[]` - Error messages
- `value?: any` - Valid value (when isValid=true)

**Static Constructors:**
- `ValidationResult.ok(value)` - Success with value
- `ValidationResult.fail(errors)` - Failure with errors

**Methods:**
- `addError(error)` - Add error, mark invalid
- `merge(other)` - Combine validation results
- `map(fn)` - Transform valid value (functor)
- `flatMap(fn)` - Chain validators (monad)
- `getOrThrow()` - Unwrap or throw
- `getOr(default)` - Unwrap with fallback

**Usage Pattern:**
```javascript
isEmail(value)
  .flatMap(isRequired)
  .map(str => str.toLowerCase())
  .getOrThrow();
```

---

## Module Breakdown

### 1. Field Validators (`field-validators.js`)
All return `ValidationResult<T>`. Validators are pure functions.

**Type Validators:**
- `isString(value)` - String check
- `isNumber(value)` - Number check (excludes NaN)
- `isBoolean(value)` - Boolean check
- `isArray(value)` - Array check
- `isObject(value)` - Plain object (excludes null, arrays)

**Format Validators:**
- `isUUID(value)` - UUID v4 format
- `isEmail(value)` - Email format (basic)
- `isURL(value)` - HTTP/HTTPS URL
- `isIdentifier(value)` - Valid JS identifier
- `isPort(value)` - Port number 0-65535

**Constraint Validators:**
- `isRequired(value, fieldName?)` - Non-null/undefined/empty string
- `isOneOf(value, allowedValues)` - Enum validation

### 2. Schema Validators (`schema-validators.js`)

**SchemaValidator Class:**
```javascript
const validator = new SchemaValidator({
  email: isEmail,
  age: isNumber
});
validator.validate(data); // Returns ValidationResult
```

**Functional Helper:**
```javascript
validateSchema(data, { email: isEmail, age: isNumber });
```

**Error Format:**
```javascript
{
  isValid: false,
  errors: [
    { field: 'email', errors: ['Value is not a valid email'] },
    { field: 'age', errors: ['Value must be a number'] }
  ]
}
```

### 3. Type Checkers (`type-checkers.js`)
Low-level utilities (non-Result returning):

- `isType(value, type)` - Check type string ('array', 'object', 'null', etc.)
- `assertType(value, type, message?)` - Throw if wrong type
- `hasProperty(obj, prop)` - Check single property
- `hasProperties(obj, props[])` - Check multiple properties
- `isInstanceOf(value, constructor)` - Safe instanceof
- `getType(value)` - Get detailed type string

### 4. Patterns (`patterns.js`)
Exported `PATTERNS` object with regex:

- `UUID` - UUID format (case-insensitive)
- `EMAIL` - Basic email validation
- `URL` - HTTP/HTTPS URLs
- `IDENTIFIER` - Valid JS/programming identifiers
- `SLUG` - URL-friendly slugs
- `JSON_STRING` - JSON object/array detection
- `ISO_DATETIME` - ISO 8601 datetime
- `PORT` - Port number range

---

## Development Guidelines

### Adding New Validators

**Field Validator Pattern:**
```javascript
export function isNewValidator(value) {
  if (typeof value !== 'expectedType') {
    return ValidationResult.fail('Type error message');
  }
  if (!validationLogic(value)) {
    return ValidationResult.fail('Validation error message');
  }
  return ValidationResult.ok(value);
}
```

**Key Principles:**
1. Always return `ValidationResult`
2. Check types first, then format/constraints
3. Descriptive error messages
4. Pure functions (no side effects)
5. Export from module and `index.js`

### Adding Patterns
Add to `PATTERNS` object in `patterns.js`:
```javascript
export const PATTERNS = {
  NEW_PATTERN: /regex-here/
};
```

### Composing Validators
Use `flatMap` to chain:
```javascript
function validateUser(data) {
  return isObject(data)
    .flatMap(() => validateSchema(data, {
      email: isEmail,
      name: (v) => isRequired(v, 'name').flatMap(isString)
    }));
}
```

---

## Testing
**Test Command:** `npm test` (runs `tests/test-base.js`)
**Note:** Test directory not yet implemented

### Test Pattern (when implementing):
```javascript
import { isEmail, ValidationResult } from 'tasker-validators';

// Test valid case
const validResult = isEmail('test@example.com');
assert(validResult.isValid === true);
assert(validResult.value === 'test@example.com');

// Test invalid case
const invalidResult = isEmail('not-an-email');
assert(invalidResult.isValid === false);
assert(invalidResult.errors.length > 0);
```

---

## Conventions

### Code Style
- ES6 modules (`import`/`export`)
- Camelcase naming
- Pure functions preferred
- Explicit returns
- Minimal abstraction

### Error Messages
- Clear, actionable messages
- Format: `"Value [specific problem]"` or `"[FieldName] is required"`
- No stack traces in ValidationResult errors

### Type Philosophy
- JavaScript primitives + common types
- No external type system (no TypeScript)
- Runtime validation only
- ValidationResult for safe error handling

### Naming Conventions
- Validators: `is*` prefix (isEmail, isUUID)
- Type checkers: `is*`, `has*`, `get*` prefixes
- Schema functions: `validate*` prefix
- Classes: PascalCase (ValidationResult, SchemaValidator)

---

## Common Patterns

### Validator Composition
```javascript
const emailValidator = (value) =>
  isRequired(value, 'email')
    .flatMap(isString)
    .flatMap(isEmail);
```

### Custom Schema Rules
```javascript
const userSchema = {
  email: isEmail,
  age: (v) => isNumber(v).flatMap(age =>
    age >= 18 ? ValidationResult.ok(age) : ValidationResult.fail('Must be 18+')
  )
};
```

### Error Handling
```javascript
// Option 1: Try/catch
try {
  const valid = isEmail(input).getOrThrow();
} catch (e) {
  console.error(e.message);
}

// Option 2: Default value
const email = isEmail(input).getOr('default@example.com');

// Option 3: Check isValid
const result = isEmail(input);
if (!result.isValid) {
  console.error(result.errors);
}
```

### Partial Validation
```javascript
// Validate subset of fields
const partialValidator = new SchemaValidator({
  email: isEmail
});
partialValidator.validate({ email: 'test@test.com', extra: 'ignored' });
```

---

## Key Files Reference

- **src/index.js:1-25** - All public exports
- **src/result.js:1-52** - ValidationResult implementation
- **src/field-validators.js:4-99** - All field validators
- **src/schema-validators.js:3-39** - Schema validation logic
- **src/type-checkers.js:1-43** - Type utility functions
- **src/patterns.js:1-10** - Regex pattern definitions

---

## Future Considerations

**Potential Additions:**
- Async validators for API calls
- Array item validation helpers
- Nested schema validation
- Custom error message overrides
- Validator middleware/plugins
- Performance benchmarks
- TypeScript definitions (`.d.ts`)

**Not in Scope:**
- External dependencies
- Framework-specific integrations
- Complex validation DSL
- Automatic type coercion
