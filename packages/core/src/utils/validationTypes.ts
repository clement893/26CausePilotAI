/**
 * Shared Validation Types
 */

export interface ValidationResult<T = never> {
  valid: boolean;
  error?: string;
  data?: T;
}

export interface SanitizedValidationResult extends ValidationResult {
  sanitized: string;
}
