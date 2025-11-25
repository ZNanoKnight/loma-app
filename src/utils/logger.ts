import { ENV } from '../config/env';

/**
 * Development-only logger utility
 * Logs are only output in development mode to avoid performance issues
 * and information disclosure in production builds
 */

export const logger = {
  /**
   * Log informational messages (only in development)
   */
  log: (...args: any[]) => {
    if (ENV.IS_DEV) {
      console.log(...args);
    }
  },

  /**
   * Log error messages (always shown, but with context in dev)
   */
  error: (...args: any[]) => {
    if (ENV.IS_DEV) {
      console.error(...args);
    } else {
      // In production, still log errors but without potentially sensitive context
      console.error('An error occurred');
    }
  },

  /**
   * Log warning messages (only in development)
   */
  warn: (...args: any[]) => {
    if (ENV.IS_DEV) {
      console.warn(...args);
    }
  },

  /**
   * Log debug messages (only in development)
   */
  debug: (...args: any[]) => {
    if (ENV.IS_DEV) {
      console.debug(...args);
    }
  },
};
