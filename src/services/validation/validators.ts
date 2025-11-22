/**
 * Validation Utilities
 * Helper functions for validating data with Zod schemas
 */

import { z } from 'zod';
import { ErrorCode, LomaError } from '../types';

/**
 * Validate data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param context - Context for error messages
 * @returns Validated data
 * @throws LomaError if validation fails
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown,
  context?: string
): z.infer<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);

      throw new LomaError({
        code: ErrorCode.DATA_VALIDATION_ERROR,
        message: `Validation failed${context ? ` for ${context}` : ''}: ${errorMessages.join(', ')}`,
        userMessage: 'Invalid data provided. Please check your input.',
        originalError: error,
        metadata: {
          validationErrors: error.errors,
        },
      });
    }

    throw new LomaError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: 'Validation failed with unknown error',
      userMessage: 'An error occurred while validating data.',
      originalError: error,
    });
  }
}

/**
 * Safely validate data without throwing
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Object with success flag and data or error
 */
export function safeValidate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Validate and sanitize email
 * @param email - Email to validate
 * @returns Sanitized email (lowercase, trimmed)
 */
export function validateEmail(email: string): string {
  const EmailSchema = z.string().email('Invalid email address');

  try {
    const validated = EmailSchema.parse(email.trim().toLowerCase());
    return validated;
  } catch (error) {
    throw new LomaError({
      code: ErrorCode.DATA_VALIDATION_ERROR,
      message: 'Invalid email address',
      userMessage: 'Please enter a valid email address.',
      originalError: error,
    });
  }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns true if valid
 */
export function validatePassword(password: string): boolean {
  const PasswordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');

  try {
    PasswordSchema.parse(password);
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => err.message).join(', ');
      throw new LomaError({
        code: ErrorCode.AUTH_WEAK_PASSWORD,
        message: messages,
        userMessage: messages,
        originalError: error,
      });
    }
    throw error;
  }
}

/**
 * Validate UUID
 * @param id - ID to validate
 * @param fieldName - Name of the field for error messages
 * @returns Valid UUID
 */
export function validateUUID(id: string, fieldName: string = 'ID'): string {
  const UUIDSchema = z.string().uuid();

  try {
    return UUIDSchema.parse(id);
  } catch (error) {
    throw new LomaError({
      code: ErrorCode.DATA_VALIDATION_ERROR,
      message: `Invalid ${fieldName}`,
      userMessage: `Invalid ${fieldName} format.`,
      originalError: error,
    });
  }
}

/**
 * Validate array is not empty
 * @param array - Array to validate
 * @param fieldName - Name of the field for error messages
 */
export function validateNotEmpty<T>(array: T[], fieldName: string): void {
  if (!array || array.length === 0) {
    throw new LomaError({
      code: ErrorCode.DATA_VALIDATION_ERROR,
      message: `${fieldName} cannot be empty`,
      userMessage: `Please provide at least one ${fieldName.toLowerCase()}.`,
    });
  }
}

/**
 * Validate number is within range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Name of the field for error messages
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): void {
  if (value < min || value > max) {
    throw new LomaError({
      code: ErrorCode.DATA_VALIDATION_ERROR,
      message: `${fieldName} must be between ${min} and ${max}`,
      userMessage: `${fieldName} must be between ${min} and ${max}.`,
    });
  }
}

/**
 * Parse and validate JSON
 * @param jsonString - JSON string to parse
 * @param context - Context for error messages
 */
export function parseJSON<T = any>(jsonString: string, context?: string): T {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new LomaError({
      code: ErrorCode.DATA_VALIDATION_ERROR,
      message: `Invalid JSON${context ? ` for ${context}` : ''}`,
      userMessage: 'Invalid data format.',
      originalError: error,
    });
  }
}

/**
 * Sanitize string input (trim, remove extra whitespace)
 * @param input - String to sanitize
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Validate API response structure
 * @param response - Response to validate
 * @param dataSchema - Schema for the data field
 */
export function validateApiResponse<T extends z.ZodType>(
  response: unknown,
  dataSchema: T
): z.infer<T> {
  const ApiResponseSchema = z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
      })
      .optional(),
  });

  const validated = validate(ApiResponseSchema, response, 'API response');

  if (!validated.success && validated.error) {
    throw new LomaError({
      code: ErrorCode.API_ERROR,
      message: validated.error.message,
      userMessage: validated.error.message,
      statusCode: parseInt(validated.error.code) || undefined,
    });
  }

  if (!validated.data) {
    throw new LomaError({
      code: ErrorCode.API_ERROR,
      message: 'No data in successful response',
      userMessage: 'Invalid response from server.',
    });
  }

  return validated.data;
}
