/**
 * Secure Storage Service
 * Wrapper around expo-secure-store for storing sensitive data like tokens
 */

import * as SecureStore from 'expo-secure-store';
import { ErrorCode, LomaError } from '../types';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'loma_access_token',
  REFRESH_TOKEN: 'loma_refresh_token',
  USER_ID: 'loma_user_id',
} as const;

export const SecureStorage = {
  /**
   * Store access token securely
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: 'Failed to store access token',
        userMessage: 'Failed to save authentication data',
        originalError: error,
      });
    }
  },

  /**
   * Retrieve access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  },

  /**
   * Store refresh token securely
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: 'Failed to store refresh token',
        userMessage: 'Failed to save authentication data',
        originalError: error,
      });
    }
  },

  /**
   * Retrieve refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to retrieve refresh token:', error);
      return null;
    }
  },

  /**
   * Store user ID
   */
  async setUserId(userId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: 'Failed to store user ID',
        userMessage: 'Failed to save user data',
        originalError: error,
      });
    }
  },

  /**
   * Retrieve user ID
   */
  async getUserId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Failed to retrieve user ID:', error);
      return null;
    }
  },

  /**
   * Clear all secure storage (logout)
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID),
      ]);
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      // Don't throw here - clearing should be best effort
    }
  },

  /**
   * Check if user has stored tokens (is potentially logged in)
   */
  async hasStoredSession(): Promise<boolean> {
    try {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      return !!accessToken;
    } catch (error) {
      console.error('Failed to check for stored session:', error);
      return false;
    }
  },
};
