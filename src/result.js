export class ValidationResult {
  constructor(isValid, errors = []) {
    this.isValid = isValid;
    this.errors = errors;
  }

  static ok(value) {
    const result = new ValidationResult(true, []);
    result.value = value;
    return result;
  }

  static fail(errors = []) {
    const errorArray = Array.isArray(errors) ? errors : [errors];
    return new ValidationResult(false, errorArray);
  }

  addError(error) {
    this.errors.push(error);
    this.isValid = false;
    return this;
  }

  merge(other) {
    if (!other.isValid) {
      this.isValid = false;
      this.errors.push(...other.errors);
    }
    return this;
  }

  map(fn) {
    if (!this.isValid) return this;
    return ValidationResult.ok(fn(this.value));
  }

  flatMap(fn) {
    if (!this.isValid) return this;
    return fn(this.value);
  }

  getOrThrow() {
    if (!this.isValid) {
      throw new Error(`Validation failed: ${this.errors.join(', ')}`);
    }
    return this.value;
  }

  getOr(defaultValue) {
    return this.isValid ? this.value : defaultValue;
  }
}
