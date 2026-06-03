/**
 * Custom error classes for better error handling
 */

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RateLimitError extends Error {
  public readonly resetAt: number;

  constructor(message: string, resetAt: number) {
    super(message);
    this.name = 'RateLimitError';
    this.resetAt = resetAt;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends Error {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    this.originalError = originalError;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends Error {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class RepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Type guard to check if error is a known custom error
 */
export function isCustomError(
  error: unknown
): error is
  | AuthenticationError
  | RateLimitError
  | NetworkError
  | ValidationError
  | RepositoryError
  | ConfigurationError {
  return (
    error instanceof AuthenticationError ||
    error instanceof RateLimitError ||
    error instanceof NetworkError ||
    error instanceof ValidationError ||
    error instanceof RepositoryError ||
    error instanceof ConfigurationError
  );
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}
