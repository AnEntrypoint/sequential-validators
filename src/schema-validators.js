import { ValidationResult } from './result.js';

export class SchemaValidator {
  constructor(rules = {}) {
    this.rules = rules;
  }

  addRule(fieldName, validator) {
    this.rules[fieldName] = validator;
    return this;
  }

  validate(data) {
    const errors = [];

    for (const [fieldName, validator] of Object.entries(this.rules)) {
      const value = data[fieldName];
      const result = validator(value);

      if (!result.isValid) {
        errors.push({
          field: fieldName,
          errors: result.errors
        });
      }
    }

    if (errors.length > 0) {
      return ValidationResult.fail(errors);
    }

    return ValidationResult.ok(data);
  }
}

export function validateSchema(data, schema) {
  const validator = new SchemaValidator(schema);
  return validator.validate(data);
}
