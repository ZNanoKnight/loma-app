/**
 * API Client
 * Base axios instance with interceptors for all API requests
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../../config/env';
import { ErrorCode, LomaError } from '../types';
import { SecureStorage } from '../storage';

/**
 * Create base axios instance
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    timeout: ENV.API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  /**
   * Request interceptor - Add auth token to requests
   */
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // Add access token if available
      const accessToken = await SecureStorage.getAccessToken();
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      // Log request in development
      if (ENV.IS_DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  /**
   * Response interceptor - Handle errors globally
   */
  client.interceptors.response.use(
    (response) => {
      // Log response in development
      if (ENV.IS_DEV) {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
      }
      return response;
    },
    async (error: AxiosError) => {
      // Handle network errors
      if (!error.response) {
        throw new LomaError({
          code: ErrorCode.NETWORK_ERROR,
          message: 'Network error occurred',
          userMessage: 'Unable to connect. Please check your internet connection.',
          originalError: error,
        });
      }

      const { status, data } = error.response;

      // Handle timeout
      if (error.code === 'ECONNABORTED') {
        throw new LomaError({
          code: ErrorCode.TIMEOUT_ERROR,
          message: 'Request timeout',
          userMessage: 'Request timed out. Please try again.',
          originalError: error,
          statusCode: status,
        });
      }

      // Handle specific HTTP status codes
      switch (status) {
        case 401:
          // Unauthorized - session expired or invalid token
          throw new LomaError({
            code: ErrorCode.AUTH_SESSION_EXPIRED,
            message: 'Authentication failed',
            userMessage: 'Your session has expired. Please sign in again.',
            originalError: error,
            statusCode: status,
          });

        case 403:
          throw new LomaError({
            code: ErrorCode.AUTH_UNAUTHORIZED,
            message: 'Forbidden',
            userMessage: 'You are not authorized to perform this action.',
            originalError: error,
            statusCode: status,
          });

        case 404:
          throw new LomaError({
            code: ErrorCode.API_NOT_FOUND,
            message: 'Resource not found',
            userMessage: 'The requested resource was not found.',
            originalError: error,
            statusCode: status,
          });

        case 422:
          throw new LomaError({
            code: ErrorCode.API_VALIDATION_ERROR,
            message: 'Validation error',
            userMessage: 'Invalid data provided. Please check your input.',
            originalError: error,
            statusCode: status,
            metadata: data,
          });

        case 500:
        case 502:
        case 503:
          throw new LomaError({
            code: ErrorCode.API_SERVER_ERROR,
            message: 'Server error',
            userMessage: 'Server error. Please try again later.',
            originalError: error,
            statusCode: status,
          });

        default:
          throw new LomaError({
            code: ErrorCode.API_ERROR,
            message: `API error: ${status}`,
            userMessage: 'Something went wrong. Please try again.',
            originalError: error,
            statusCode: status,
            metadata: data,
          });
      }
    }
  );

  return client;
};

/**
 * Default API client instance
 */
export const apiClient = createApiClient();

/**
 * Helper function to handle API errors consistently
 */
export const handleApiError = (error: unknown): never => {
  if (error instanceof LomaError) {
    throw error;
  }

  if (error instanceof Error) {
    throw new LomaError({
      code: ErrorCode.UNKNOWN_ERROR,
      message: error.message,
      userMessage: 'An unexpected error occurred. Please try again.',
      originalError: error,
    });
  }

  throw new LomaError({
    code: ErrorCode.UNKNOWN_ERROR,
    message: 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    originalError: error,
  });
};
