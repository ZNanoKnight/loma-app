/**
 * Global Error Handler
 * Centralized error handling utilities
 */

import * as Sentry from '@sentry/react-native';
import { LomaError, ErrorCode, ErrorMessages } from '../services/types';
import { ENV } from '../config/env';

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
 * Log error to monitoring service (Sentry)
 * @param error - Error to log
 * @param context - Additional context
 */
export const logErrorToMonitoring = (error: unknown, context?: Record<string, any>): void => {
  // Always log to console
  console.error('Error logged to monitoring:', {
    error: error instanceof Error ? error.message : String(error),
    context,
    timestamp: new Date().toISOString(),
  });

  // Send to Sentry if configured
  if (ENV.SENTRY_DSN) {
    try {
      // Set severity level based on error type
      const level: Sentry.SeverityLevel = isNetworkError(error)
        ? 'warning'
        : isAuthError(error)
        ? 'info'
        : 'error';

      // Capture exception with context
      Sentry.captureException(error, {
        level,
        extra: {
          ...context,
          timestamp: new Date().toISOString(),
        },
        tags: {
          errorType: error instanceof LomaError ? error.code : 'unknown',
          context: context?.context || 'unknown',
        },
        fingerprint: [
          // Group similar errors together
          error instanceof LomaError ? error.code : 'unknown',
          context?.context || 'default',
        ],
      });
    } catch (sentryError) {
      // Don't let Sentry errors break the app
      console.error('Failed to log error to Sentry:', sentryError);
    }
  }
};

/**
 * Set user context for error tracking
 * Call this after user logs in to associate errors with specific users
 * @param userId - User's unique ID
 * @param email - User's email (optional)
 * @param username - User's username/name (optional)
 */
export const setUserContext = (
  userId: string,
  email?: string,
  username?: string
): void => {
  if (ENV.SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email: email,
      username: username,
    });
  }
};

/**
 * Clear user context (call on logout)
 */
export const clearUserContext = (): void => {
  if (ENV.SENTRY_DSN) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb for debugging
 * Breadcrumbs help trace user actions leading to an error
 * @param message - Breadcrumb message
 * @param category - Category (navigation, user-action, etc.)
 * @param level - Severity level
 * @param data - Additional data
 */
export const addBreadcrumb = (
  message: string,
  category: string = 'custom',
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void => {
  if (ENV.SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }
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
