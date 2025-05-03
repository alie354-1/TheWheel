/**
 * Custom error types for the Journey Unified system
 * These help with better error handling and more specific error messages
 */

/**
 * Base class for all Journey system errors
 */
export class JourneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JourneyError';
    // This is necessary for proper instanceof checks with custom errors
    Object.setPrototypeOf(this, JourneyError.prototype);
  }
}

/**
 * Error thrown when a step is not found
 */
export class StepNotFoundError extends JourneyError {
  constructor(stepId: string) {
    super(`Step with ID ${stepId} not found`);
    this.name = 'StepNotFoundError';
    Object.setPrototypeOf(this, StepNotFoundError.prototype);
  }
}

/**
 * Error thrown when a phase is not found
 */
export class PhaseNotFoundError extends JourneyError {
  constructor(phaseId: string) {
    super(`Phase with ID ${phaseId} not found`);
    this.name = 'PhaseNotFoundError';
    Object.setPrototypeOf(this, PhaseNotFoundError.prototype);
  }
}

/**
 * Error thrown when a tool is not found
 */
export class ToolNotFoundError extends JourneyError {
  constructor(toolId: string) {
    super(`Tool with ID ${toolId} not found`);
    this.name = 'ToolNotFoundError';
    Object.setPrototypeOf(this, ToolNotFoundError.prototype);
  }
}

/**
 * Error thrown when a database operation fails
 */
export class DatabaseError extends JourneyError {
  public originalError: any;
  
  constructor(operation: string, originalError: any) {
    super(`Database error in ${operation}: ${originalError.message || 'Unknown error'}`);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
}

/**
 * Error thrown when a validation error occurs
 */
export class ValidationError extends JourneyError {
  public validationErrors: Record<string, string>;

  constructor(message: string, validationErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ValidationError';
    this.validationErrors = validationErrors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when an operation is not authorized
 */
export class NotAuthorizedError extends JourneyError {
  constructor(operation: string) {
    super(`Not authorized to perform operation: ${operation}`);
    this.name = 'NotAuthorizedError';
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}

/**
 * Error thrown when a company is not found
 */
export class CompanyNotFoundError extends JourneyError {
  constructor(companyId: string) {
    super(`Company with ID ${companyId} not found`);
    this.name = 'CompanyNotFoundError';
    Object.setPrototypeOf(this, CompanyNotFoundError.prototype);
  }
}

/**
 * Validation utility functions
 */
export const validate = {
  /**
   * Validates that a string is not empty
   */
  notEmpty: (value: string | null | undefined, fieldName: string): string => {
    if (!value) {
      throw new ValidationError(`${fieldName} cannot be empty`, {
        [fieldName]: 'This field is required'
      });
    }
    return value;
  },
  
  /**
   * Validates that a value is a valid UUID
   */
  uuid: (value: string, fieldName: string): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid UUID`, {
        [fieldName]: 'Invalid UUID format'
      });
    }
    return value;
  },
  
  /**
   * Validates that a number is within a range
   */
  range: (value: number, min: number, max: number, fieldName: string): number => {
    if (value < min || value > max) {
      throw new ValidationError(`${fieldName} must be between ${min} and ${max}`, {
        [fieldName]: `Value must be between ${min} and ${max}`
      });
    }
    return value;
  }
};
