/**
 * Error Types
 * Centralized error handling types for the application
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NO_INTERNET = 'NO_INTERNET',

  // Authentication errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS = 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',

  // API errors
  API_ERROR = 'API_ERROR',
  API_VALIDATION_ERROR = 'API_VALIDATION_ERROR',
  API_NOT_FOUND = 'API_NOT_FOUND',
  API_SERVER_ERROR = 'API_SERVER_ERROR',

  // Data errors
  DATA_MIGRATION_ERROR = 'DATA_MIGRATION_ERROR',
  DATA_SYNC_ERROR = 'DATA_SYNC_ERROR',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',

  // Payment errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',

  // AI/Recipe errors
  RECIPE_GENERATION_FAILED = 'RECIPE_GENERATION_FAILED',
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',

  // Storage errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  STORAGE_QUOTA_EXCEEDED = 'STORAGE_QUOTA_EXCEEDED',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string; // User-friendly message to display
  originalError?: Error | unknown;
  statusCode?: number;
  metadata?: Record<string, any>;
}

export class LomaError extends Error implements AppError {
  code: ErrorCode;
  userMessage: string;
  originalError?: Error | unknown;
  statusCode?: number;
  metadata?: Record<string, any>;

  constructor(params: {
    code: ErrorCode;
    message: string;
    userMessage: string;
    originalError?: Error | unknown;
    statusCode?: number;
    metadata?: Record<string, any>;
  }) {
    super(params.message);
    this.name = 'LomaError';
    this.code = params.code;
    this.userMessage = params.userMessage;
    this.originalError = params.originalError;
    this.statusCode = params.statusCode;
    this.metadata = params.metadata;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LomaError);
    }
  }
}

/**
 * User-friendly error messages
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Network
  [ErrorCode.NETWORK_ERROR]: 'Unable to connect. Please check your internet connection.',
  [ErrorCode.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ErrorCode.NO_INTERNET]: 'No internet connection. Please check your network.',

  // Auth
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password.',
  [ErrorCode.AUTH_USER_NOT_FOUND]: 'No account found with this email.',
  [ErrorCode.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ErrorCode.AUTH_WEAK_PASSWORD]: 'Password must be at least 8 characters long.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'You are not authorized to perform this action.',

  // API
  [ErrorCode.API_ERROR]: 'Something went wrong. Please try again.',
  [ErrorCode.API_VALIDATION_ERROR]: 'Invalid data provided. Please check your input.',
  [ErrorCode.API_NOT_FOUND]: 'The requested resource was not found.',
  [ErrorCode.API_SERVER_ERROR]: 'Server error. Please try again later.',

  // Data
  [ErrorCode.DATA_MIGRATION_ERROR]: 'Failed to migrate your data. Please contact support.',
  [ErrorCode.DATA_SYNC_ERROR]: 'Failed to sync your data. Please try again.',
  [ErrorCode.DATA_VALIDATION_ERROR]: 'Invalid data format.',

  // Payment
  [ErrorCode.PAYMENT_FAILED]: 'Payment failed. Please try again or use a different payment method.',
  [ErrorCode.PAYMENT_CANCELLED]: 'Payment was cancelled.',
  [ErrorCode.SUBSCRIPTION_ERROR]: 'Unable to process subscription. Please contact support.',

  // AI/Recipe
  [ErrorCode.RECIPE_GENERATION_FAILED]: 'Failed to generate recipe. Please try again.',
  [ErrorCode.INSUFFICIENT_TOKENS]: "You don't have enough Munchies to generate a recipe.",

  // Storage
  [ErrorCode.STORAGE_ERROR]: 'Failed to save data. Please try again.',
  [ErrorCode.STORAGE_QUOTA_EXCEEDED]: 'Storage limit exceeded. Please free up some space.',

  // Unknown
  [ErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};
