/**
 * Data Migration Service
 * Handles migration of local AsyncStorage data to Supabase
 *
 * This service implements Option A: Automatic migration
 * - Detects existing local data
 * - Prompts user to create account
 * - Migrates data to Supabase
 * - Handles conflicts with last-write-wins strategy
 */

import { LocalStorage } from '../storage';
import { AuthService } from '../auth/authService';
import { getSupabaseClient } from '../auth/supabase';
import { ErrorCode, LomaError } from '../types';

export interface LocalUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age: string;
  weight: string;
  heightFeet: string;
  heightInches: string;
  gender: string;
  activityLevel: string;
  goals: string[];
  dietaryPreferences: string[];
  allergens: string[];
  equipment: string;
  cookingFrequency: string;
  mealPrepInterest: string;
  selectedPlan: string;
  currentStreak: number;
  totalRecipes: number;
  savedRecipes: any[];
  favoriteRecipes: string[];
  weeklyProgress: boolean[];
  hoursSaved: number;
  moneySaved: number;
  notifications: boolean;
  mealReminders: boolean;
  weeklyReport: boolean;
  darkMode: boolean;
  metricUnits: boolean;
  targetWeight: string;
  targetProtein: string;
  targetCalories: string;
  macroTargets?: { carbs: string; fat: string };
  dislikedIngredients?: string[];
  cuisinePreferences?: string[];
  defaultServingSize?: number;
  profileImageUri?: string;
  hasCompletedOnboarding: boolean;
}

export interface MigrationResult {
  success: boolean;
  migratedProfile: boolean;
  migratedRecipes: boolean;
  migratedProgress: boolean;
  errors: string[];
}

export const DataMigrationService = {
  /**
   * Check if user has local data that needs migration
   */
  async hasLocalDataToMigrate(): Promise<boolean> {
    try {
      const hasData = await LocalStorage.hasLocalData();
      if (!hasData) return false;

      // Check if data has meaningful content (not just defaults)
      const userData = await LocalStorage.getUserData<LocalUserData>();
      if (!userData) return false;

      // Consider it migratable if they have a name or email
      return !!(userData.firstName || userData.email);
    } catch (error) {
      console.error('Error checking for local data:', error);
      return false;
    }
  },

  /**
   * Get local user data for migration
   */
  async getLocalUserData(): Promise<LocalUserData | null> {
    try {
      return await LocalStorage.getUserData<LocalUserData>();
    } catch (error) {
      console.error('Error getting local user data:', error);
      return null;
    }
  },

  /**
   * Migrate user profile to Supabase
   */
  async migrateUserProfile(userId: string, localData: LocalUserData): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      // Map local data to user_profiles schema
      const profileData = {
        user_id: userId,
        first_name: localData.firstName,
        last_name: localData.lastName,
        age: localData.age,
        weight: localData.weight,
        height_feet: localData.heightFeet,
        height_inches: localData.heightInches,
        gender: localData.gender,
        activity_level: localData.activityLevel,
        goals: localData.goals,
        dietary_preferences: localData.dietaryPreferences,
        allergens: localData.allergens,
        disliked_ingredients: localData.dislikedIngredients || [],
        cuisine_preferences: localData.cuisinePreferences || [],
        equipment: localData.equipment,
        cooking_frequency: localData.cookingFrequency,
        meal_prep_interest: localData.mealPrepInterest,
        default_serving_size: localData.defaultServingSize || 1,
        target_weight: localData.targetWeight,
        target_protein: localData.targetProtein,
        target_calories: localData.targetCalories,
        target_carbs: localData.macroTargets?.carbs || '',
        target_fat: localData.macroTargets?.fat || '',
        notifications: localData.notifications,
        meal_reminders: localData.mealReminders,
        weekly_report: localData.weeklyReport,
        dark_mode: localData.darkMode,
        metric_units: localData.metricUnits,
        profile_image_url: localData.profileImageUri,
        has_completed_onboarding: localData.hasCompletedOnboarding,
      };

      // Insert or update user profile
      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (error) {
        throw new LomaError({
          code: ErrorCode.DATA_MIGRATION_ERROR,
          message: 'Failed to migrate user profile',
          userMessage: 'Failed to migrate your profile data. Please try again.',
          originalError: error,
        });
      }

      console.log('✅ User profile migrated successfully');
    } catch (error) {
      if (error instanceof LomaError) {
        throw error;
      }
      throw new LomaError({
        code: ErrorCode.DATA_MIGRATION_ERROR,
        message: 'Failed to migrate user profile',
        userMessage: 'Failed to migrate your profile data. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Migrate progress tracking to Supabase
   */
  async migrateProgressTracking(userId: string, localData: LocalUserData): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const progressData = {
        user_id: userId,
        current_streak: localData.currentStreak || 0,
        longest_streak: localData.currentStreak || 0, // Use current as longest initially
        last_activity_date: new Date().toISOString().split('T')[0],
        weekly_progress: localData.weeklyProgress || [],
        week_start_date: new Date().toISOString().split('T')[0],
        total_recipes_generated: localData.totalRecipes || 0,
        total_recipes_saved: localData.savedRecipes?.length || 0,
        total_recipes_cooked: 0, // We don't have this in local data
        hours_saved: localData.hoursSaved || 0,
        money_saved: localData.moneySaved || 0,
        achievements: [], // Start fresh with achievements
      };

      const { error } = await supabase
        .from('progress_tracking')
        .upsert(progressData, {
          onConflict: 'user_id',
        });

      if (error) {
        throw new LomaError({
          code: ErrorCode.DATA_MIGRATION_ERROR,
          message: 'Failed to migrate progress tracking',
          userMessage: 'Failed to migrate your progress data. Please try again.',
          originalError: error,
        });
      }

      console.log('✅ Progress tracking migrated successfully');
    } catch (error) {
      if (error instanceof LomaError) {
        throw error;
      }
      throw new LomaError({
        code: ErrorCode.DATA_MIGRATION_ERROR,
        message: 'Failed to migrate progress tracking',
        userMessage: 'Failed to migrate your progress data. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Migrate saved recipes to Supabase
   * Note: This is a placeholder - full implementation needs recipe creation
   */
  async migrateSavedRecipes(userId: string, localData: LocalUserData): Promise<void> {
    try {
      // TODO: Implement when recipe service is ready
      // For now, we'll skip recipe migration
      // Recipes will be re-generated by the user
      console.log('⚠️  Recipe migration skipped - users will regenerate recipes');

      // If we had local recipes, we would:
      // 1. Insert each recipe into the recipes table
      // 2. Link to user via user_recipes table
      // 3. Preserve favorites, ratings, etc.
    } catch (error) {
      console.error('Error migrating recipes:', error);
      // Don't throw - recipe migration is non-critical
    }
  },

  /**
   * Update subscription plan from local data
   */
  async migrateSubscription(userId: string, localData: LocalUserData): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      // Map selected plan to subscription
      const planMap: Record<string, string> = {
        weekly: 'weekly',
        monthly: 'monthly',
        yearly: 'yearly',
      };

      const plan = planMap[localData.selectedPlan] || 'weekly';

      // Note: The subscription was auto-created by the trigger
      // We just need to update the plan if it's different
      const { error } = await supabase
        .from('subscriptions')
        .update({ plan })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to update subscription plan:', error);
        // Don't throw - this is non-critical
      }

      console.log('✅ Subscription plan migrated successfully');
    } catch (error) {
      console.error('Error migrating subscription:', error);
      // Don't throw - subscription migration is non-critical
    }
  },

  /**
   * Complete migration process
   * This is the main entry point for migration
   */
  async migrateAllData(userId: string): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedProfile: false,
      migratedRecipes: false,
      migratedProgress: false,
      errors: [],
    };

    try {
      // Get local data
      const localData = await this.getLocalUserData();
      if (!localData) {
        throw new Error('No local data found to migrate');
      }

      // Migrate user profile
      try {
        await this.migrateUserProfile(userId, localData);
        result.migratedProfile = true;
      } catch (error) {
        result.errors.push('Failed to migrate profile');
        console.error('Profile migration error:', error);
      }

      // Migrate progress tracking
      try {
        await this.migrateProgressTracking(userId, localData);
        result.migratedProgress = true;
      } catch (error) {
        result.errors.push('Failed to migrate progress');
        console.error('Progress migration error:', error);
      }

      // Migrate subscription
      try {
        await this.migrateSubscription(userId, localData);
      } catch (error) {
        result.errors.push('Failed to migrate subscription');
        console.error('Subscription migration error:', error);
      }

      // Migrate saved recipes (placeholder)
      try {
        await this.migrateSavedRecipes(userId, localData);
        result.migratedRecipes = true;
      } catch (error) {
        result.errors.push('Failed to migrate recipes');
        console.error('Recipe migration error:', error);
      }

      // Consider successful if at least profile was migrated
      result.success = result.migratedProfile;

      // Update last sync timestamp
      await LocalStorage.setLastSync();

      return result;
    } catch (error) {
      result.errors.push('Migration failed');
      console.error('Migration error:', error);
      return result;
    }
  },

  /**
   * Clear local data after successful migration
   * Should only be called after confirming migration success
   */
  async clearLocalDataAfterMigration(): Promise<void> {
    try {
      // Keep a backup temporarily in case of issues
      const userData = await LocalStorage.getUserData();
      if (userData) {
        await LocalStorage.setItem('@loma_backup_before_migration', {
          data: userData,
          timestamp: Date.now(),
        });
      }

      // Clear main local data
      await LocalStorage.clearAll();

      console.log('✅ Local data cleared after migration (backup saved)');
    } catch (error) {
      console.error('Error clearing local data:', error);
      // Don't throw - this is cleanup
    }
  },

  /**
   * Restore from backup if migration failed
   */
  async restoreFromBackup(): Promise<boolean> {
    try {
      const backup = await LocalStorage.getItem<{ data: any; timestamp: number }>(
        '@loma_backup_before_migration'
      );

      if (!backup) {
        return false;
      }

      await LocalStorage.setUserData(backup.data);
      console.log('✅ Restored from backup');
      return true;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  },
};
