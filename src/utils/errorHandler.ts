/**
 * Global Error Handler
 * Centralized error handling utilities
 */

import { LomaError, ErrorCode, ErrorMessages } from '../services/types';

/**
 * Handle and log errors consistently
 * @param error - Error to handle
 * @param context - Context where error occurred
 */
export const handleError = (error: unknown, context?: string): LomaError => {
  const prefix = context ? `[${context}]` : '';

  // If it's already a LomaError, just log and return it
  if (error instanceof LomaError) {
    console.error(`${prefix} LomaError:`, {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
      metadata: error.metadata,
    });
    return error;
  }

  // If it's a standard Error, wrap it
  if (error instanceof Error) {
    console.error(`${prefix} Error:`, error.message);
    return new LomaError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      userMessage: ErrorMessages[ErrorCode.UNKNOWN_ERROR],
      originalError: error,
    });
  }

  // Unknown error type
  console.error(`${prefix} Unknown error:`, error);
  return new LomaError({
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'An unknown error occurred',
    userMessage: ErrorMessages[ErrorCode.UNKNOWN_ERROR],
    originalError: error,
  });
};

/**
 * Get user-friendly error message
 * @param error - Error object
 */
export const getUserErrorMessage = (error: unknown): string => {
  if (error instanceof LomaError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return ErrorMessages[ErrorCode.UNKNOWN_ERROR];
  }

  return ErrorMessages[ErrorCode.UNKNOWN_ERROR];
};

/**
 * Check if error is a network error
 * @param error - Error object
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof LomaError) {
    return [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT_ERROR, ErrorCode.NO_INTERNET].includes(
      error.code
    );
  }
  return false;
};

/**
 * Check if error is an auth error
 * @param error - Error object
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof LomaError) {
    return [
      ErrorCode.AUTH_INVALID_CREDENTIALS,
      ErrorCode.AUTH_USER_NOT_FOUND,
      ErrorCode.AUTH_SESSION_EXPIRED,
      ErrorCode.AUTH_UNAUTHORIZED,
    ].includes(error.code);
  }
  return false;
};

/**
 * Log error to monitoring service (Sentry, etc.)
 * @param error - Error to log
 * @param context - Additional context
 *
 * TODO: Integrate with Sentry when it's set up
 */
export const logErrorToMonitoring = (error: unknown, context?: Record<string, any>): void => {
  // For now, just console.error
  // In production, this will send to Sentry
  console.error('Error logged to monitoring:', {
    error: error instanceof Error ? error.message : String(error),
    context,
    timestamp: new Date().toISOString(),
  });

  // TODO: Sentry.captureException(error, { extra: context });
};

/**
 * Create a safe error handler for async operations
 * Useful for wrapping async functions that might throw
 */
export const withErrorHandler = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const lomaError = handleError(error, context);
      logErrorToMonitoring(lomaError, { args });
      throw lomaError;
    }
  }) as T;
};
