/**
 * User Service
 * Handles user profile operations with Supabase backend
 */

import { getSupabaseClient } from '../auth/supabase';
import { ErrorCode, LomaError } from '../types';

/**
 * User Profile interface matching database schema
 */
export interface UserProfile {
  id?: string;
  user_id: string;

  // Personal information
  first_name: string;
  last_name: string;
  age?: string;
  weight?: string;
  height_feet?: string;
  height_inches?: string;
  gender?: string;

  // Activity and goals
  activity_level?: string;
  goals?: string[];

  // Dietary information
  dietary_preferences?: string[];
  allergens?: string[];
  disliked_ingredients?: string[];
  cuisine_preferences?: string[];

  // Cooking information
  equipment?: string;
  cooking_frequency?: string;
  meal_prep_interest?: string;
  default_serving_size?: number;

  // Nutrition targets
  target_weight?: string;
  target_protein?: string;
  target_calories?: string;
  target_carbs?: string;
  target_fat?: string;

  // Settings
  notifications?: boolean;
  meal_reminders?: boolean;
  weekly_report?: boolean;
  dark_mode?: boolean;
  metric_units?: boolean;

  // Profile
  profile_image_url?: string;

  // Metadata
  has_completed_onboarding?: boolean;
  created_at?: string;
  updated_at?: string;
}

export const UserService = {
  /**
   * Get user profile data from Supabase
   * @param userId - User ID from auth.users
   * @returns User profile data or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('UserService.getUserProfile error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to get user profile',
        userMessage: 'Failed to load your profile. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Update user profile in Supabase
   * @param userId - User ID
   * @param updates - Partial profile updates
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const supabase = getSupabaseClient();

      // Remove fields that shouldn't be updated
      const { id, user_id, created_at, updated_at, ...updateData } = updates as any;

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data as UserProfile;
    } catch (error) {
      console.error('UserService.updateUserProfile error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to update user profile',
        userMessage: 'Failed to update your profile. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Create user profile after successful registration
   * Uses secure Postgres function to bypass RLS during email confirmation flow
   * @param userId - User ID from auth.users
   * @param profileData - Initial profile data from onboarding
   */
  async createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const supabase = getSupabaseClient();

      // Call the secure function instead of direct INSERT
      // This bypasses RLS policy which blocks inserts during email confirmation flow
      const { data, error } = await supabase.rpc('create_user_profile', {
        p_user_id: userId,
        p_profile_data: profileData,
      });

      if (error) {
        // Handle duplicate profile error
        if (error.message?.includes('Profile already exists')) {
          throw new LomaError({
            code: ErrorCode.API_ERROR,
            message: 'Profile already exists',
            userMessage: 'A profile already exists for this account.',
            originalError: error,
          });
        }
        throw error;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('UserService.createUserProfile error:', error);

      if (error instanceof LomaError) {
        throw error;
      }

      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to create user profile',
        userMessage: 'Failed to create your profile. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Delete user profile
   * @param userId - User ID
   */
  async deleteUserProfile(userId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('UserService.deleteUserProfile error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to delete user profile',
        userMessage: 'Failed to delete your profile. Please try again.',
        originalError: error,
      });
    }
  },
};
