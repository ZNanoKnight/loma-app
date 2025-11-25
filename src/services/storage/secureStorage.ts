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
      console.log('[SecureStorage] Clearing all secure storage...');

      // Clear legacy tokens
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN).catch(() => {}),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID).catch(() => {}),
      ]);

      // Clear Supabase session (including chunked storage)
      // The Supabase storage key format is: sb-{project-ref}-auth-token
      const supabaseKeys = [
        'sb-rxiaamsmhezlmdbwzmgx-auth-token',
        'sb-rxiaamsmhezlmdbwzmgx-auth-token_chunks',
        'sb-rxiaamsmhezlmdbwzmgx-auth-token_chunk_0',
        'sb-rxiaamsmhezlmdbwzmgx-auth-token_chunk_1',
        'sb-rxiaamsmhezlmdbwzmgx-auth-token_chunk_2',
      ];

      await Promise.all(
        supabaseKeys.map(key => SecureStore.deleteItemAsync(key).catch(() => {}))
      );

      console.log('[SecureStorage] All secure storage cleared');
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

  /**
   * Generic set item (for testing and verification)
   * Handles values larger than 2048 bytes by chunking
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const CHUNK_SIZE = 2048; // SecureStore limit

      // If value is small enough, store directly
      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        // Clean up any existing chunks
        await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
        return;
      }

      // Split into chunks for large values
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.substring(i, i + CHUNK_SIZE));
      }

      // Store each chunk
      await Promise.all(
        chunks.map((chunk, index) =>
          SecureStore.setItemAsync(`${key}_chunk_${index}`, chunk)
        )
      );

      // Store metadata about chunks
      await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());

      console.log(`[SecureStorage] Stored large value in ${chunks.length} chunks for key: ${key}`);
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: `Failed to store ${key}`,
        userMessage: 'Failed to save data securely',
        originalError: error,
      });
    }
  },

  /**
   * Generic get item (for testing and verification)
   * Handles chunked values
   */
  async getItem(key: string): Promise<string | null> {
    try {
      // Try to get chunks metadata first
      const chunksCount = await SecureStore.getItemAsync(`${key}_chunks`);

      if (chunksCount) {
        // Retrieve and reassemble chunks
        const count = parseInt(chunksCount, 10);
        const chunks = await Promise.all(
          Array.from({ length: count }, (_, i) =>
            SecureStore.getItemAsync(`${key}_chunk_${i}`)
          )
        );

        // Check if all chunks were retrieved
        if (chunks.some(chunk => chunk === null)) {
          console.error(`[SecureStorage] Some chunks missing for key: ${key}`);
          return null;
        }

        const value = chunks.join('');
        console.log(`[SecureStorage] Retrieved large value from ${count} chunks for key: ${key}`);
        return value;
      }

      // No chunks, try direct retrieval
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  },

  /**
   * Generic remove item (for testing and verification)
   * Handles chunked values
   */
  async removeItem(key: string): Promise<void> {
    try {
      // Check if this is a chunked value
      const chunksCount = await SecureStore.getItemAsync(`${key}_chunks`);

      if (chunksCount) {
        const count = parseInt(chunksCount, 10);
        // Delete all chunks
        await Promise.all(
          Array.from({ length: count }, (_, i) =>
            SecureStore.deleteItemAsync(`${key}_chunk_${i}`).catch(() => {})
          )
        );
        // Delete chunks metadata
        await SecureStore.deleteItemAsync(`${key}_chunks`).catch(() => {});
        console.log(`[SecureStorage] Removed chunked value for key: ${key}`);
      }

      // Delete the main key
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  },
};
