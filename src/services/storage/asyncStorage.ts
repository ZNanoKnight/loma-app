/**
 * Async Storage Service
 * Wrapper around AsyncStorage for caching and offline support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ErrorCode, LomaError } from '../types';

const STORAGE_KEYS = {
  USER_DATA: '@loma_user_data',
  RECIPES: '@loma_recipes',
  USER_PREFERENCES: '@loma_user_preferences',
  LAST_SYNC: '@loma_last_sync',
} as const;

export const LocalStorage = {
  /**
   * Store user data for offline access
   */
  async setUserData(userData: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: 'Failed to store user data',
        userMessage: 'Failed to save your data locally',
        originalError: error,
      });
    }
  },

  /**
   * Retrieve user data
   */
  async getUserData<T = any>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  },

  /**
   * Store recipes for offline access
   */
  async setRecipes(recipes: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: 'Failed to store recipes',
        userMessage: 'Failed to save recipes locally',
        originalError: error,
      });
    }
  },

  /**
   * Retrieve recipes
   */
  async getRecipes<T = any>(): Promise<T[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve recipes:', error);
      return null;
    }
  },

  /**
   * Store user preferences
   */
  async setUserPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: 'Failed to store preferences',
        userMessage: 'Failed to save your preferences',
        originalError: error,
      });
    }
  },

  /**
   * Retrieve user preferences
   */
  async getUserPreferences<T = any>(): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve preferences:', error);
      return null;
    }
  },

  /**
   * Update last sync timestamp
   */
  async setLastSync(timestamp: number = Date.now()): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Failed to update last sync timestamp:', error);
    }
  },

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<number | null> {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? parseInt(timestamp, 10) : null;
    } catch (error) {
      console.error('Failed to retrieve last sync timestamp:', error);
      return null;
    }
  },

  /**
   * Clear all local storage (logout/reset)
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.RECIPES,
        STORAGE_KEYS.USER_PREFERENCES,
        STORAGE_KEYS.LAST_SYNC,
      ]);
    } catch (error) {
      console.error('Failed to clear local storage:', error);
      // Don't throw - clearing should be best effort
    }
  },

  /**
   * Check if user has local data (for migration detection)
   */
  async hasLocalData(): Promise<boolean> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return !!userData;
    } catch (error) {
      console.error('Failed to check for local data:', error);
      return false;
    }
  },

  /**
   * Generic get item
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  },

  /**
   * Generic set item
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.STORAGE_ERROR,
        message: `Failed to store ${key}`,
        userMessage: 'Failed to save data',
        originalError: error,
      });
    }
  },

  /**
   * Generic remove item
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
    }
  },
};
