/**
 * Recipe Service
 * Handles recipe CRUD operations and AI generation
 */

import { getSupabaseClient } from '../auth/supabase';
import { ErrorCode, LomaError } from '../types';

/**
 * Recipe interface matching database schema
 */
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  ingredients: any; // JSONB
  instructions: any; // JSONB
  equipment?: any; // JSONB
  tags?: string[];
  generated_by_user_id?: string;
  generation_prompt?: string;
  ai_model?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * UserRecipe interface - junction table
 */
export interface UserRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  is_favorite: boolean;
  is_saved: boolean;
  rating?: number;
  notes?: string;
  cooked_count: number;
  last_cooked_at?: string;
  saved_at: string;
  updated_at: string;
  recipes?: Recipe; // Joined recipe data
}

export const RecipeService = {
  /**
   * Generate a new recipe using AI
   * @param preferences - User preferences and meal type
   *
   * TODO: Implement in Phase 3
   */
  async generateRecipe(preferences: any): Promise<Recipe> {
    try {
      // TODO: Call Supabase Edge Function that calls OpenAI API
      // const { data, error } = await supabase.functions.invoke('generate-recipe', {
      //   body: { preferences },
      // });

      throw new Error('Not implemented - AI integration planned for Phase 3');
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.RECIPE_GENERATION_FAILED,
        message: 'Failed to generate recipe',
        userMessage: 'Failed to generate recipe. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Get user's saved recipes with full recipe details
   * @param userId - User ID
   */
  async getUserRecipes(userId: string): Promise<UserRecipe[]> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('user_recipes')
        .select(`
          *,
          recipes (*)
        `)
        .eq('user_id', userId)
        .eq('is_saved', true)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return (data || []) as UserRecipe[];
    } catch (error) {
      console.error('RecipeService.getUserRecipes error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to get recipes',
        userMessage: 'Failed to load your recipes. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Get user's favorite recipes
   * @param userId - User ID
   */
  async getFavoriteRecipes(userId: string): Promise<UserRecipe[]> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('user_recipes')
        .select(`
          *,
          recipes (*)
        `)
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      return (data || []) as UserRecipe[];
    } catch (error) {
      console.error('RecipeService.getFavoriteRecipes error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to get favorite recipes',
        userMessage: 'Failed to load your favorite recipes. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Get a single recipe by ID
   * @param recipeId - Recipe ID
   */
  async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Recipe;
    } catch (error) {
      console.error('RecipeService.getRecipeById error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to get recipe',
        userMessage: 'Failed to load recipe. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Save a recipe to user's collection
   * @param userId - User ID
   * @param recipeId - Recipe ID
   */
  async saveRecipe(userId: string, recipeId: string): Promise<UserRecipe> {
    try {
      const supabase = getSupabaseClient();

      // Check if already saved
      const { data: existing } = await supabase
        .from('user_recipes')
        .select('*')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single();

      if (existing) {
        // Update to mark as saved if was previously unsaved
        const { data, error } = await supabase
          .from('user_recipes')
          .update({ is_saved: true })
          .eq('user_id', userId)
          .eq('recipe_id', recipeId)
          .select()
          .single();

        if (error) throw error;
        return data as UserRecipe;
      }

      // Insert new save
      const { data, error } = await supabase
        .from('user_recipes')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
          is_saved: true,
          is_favorite: false,
          cooked_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      return data as UserRecipe;
    } catch (error) {
      console.error('RecipeService.saveRecipe error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to save recipe',
        userMessage: 'Failed to save recipe. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Remove a recipe from user's saved collection
   * @param userId - User ID
   * @param recipeId - Recipe ID
   */
  async unsaveRecipe(userId: string, recipeId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      // Mark as unsaved instead of deleting (preserve history)
      const { error } = await supabase
        .from('user_recipes')
        .update({ is_saved: false })
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('RecipeService.unsaveRecipe error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to unsave recipe',
        userMessage: 'Failed to remove recipe. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Delete a recipe from user's collection (hard delete)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   */
  async deleteRecipe(userId: string, recipeId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('user_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('RecipeService.deleteRecipe error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to delete recipe',
        userMessage: 'Failed to delete recipe. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Toggle favorite status
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @param isFavorite - New favorite status
   */
  async toggleFavorite(
    userId: string,
    recipeId: string,
    isFavorite: boolean
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase
        .from('user_recipes')
        .update({ is_favorite: isFavorite })
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('RecipeService.toggleFavorite error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to update favorite status',
        userMessage: 'Failed to update favorite. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Update recipe rating and notes
   * @param userId - User ID
   * @param recipeId - Recipe ID
   * @param rating - Rating (1-5)
   * @param notes - User notes
   */
  async updateRecipeRating(
    userId: string,
    recipeId: string,
    rating?: number,
    notes?: string
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const updates: any = {};
      if (rating !== undefined) updates.rating = rating;
      if (notes !== undefined) updates.notes = notes;

      const { error } = await supabase
        .from('user_recipes')
        .update(updates)
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('RecipeService.updateRecipeRating error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to update recipe rating',
        userMessage: 'Failed to update rating. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Mark recipe as cooked (increment count and update timestamp)
   * @param userId - User ID
   * @param recipeId - Recipe ID
   */
  async markAsCooked(userId: string, recipeId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      // Get current cooked count
      const { data: current } = await supabase
        .from('user_recipes')
        .select('cooked_count')
        .eq('user_id', userId)
        .eq('recipe_id', recipeId)
        .single();

      const newCount = (current?.cooked_count || 0) + 1;

      const { error } = await supabase
        .from('user_recipes')
        .update({
          cooked_count: newCount,
          last_cooked_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('RecipeService.markAsCooked error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to mark recipe as cooked',
        userMessage: 'Failed to update cooking status. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Update recipe details (for user-generated recipes)
   * @param recipeId - Recipe ID
   * @param updates - Recipe updates
   */
  async updateRecipe(recipeId: string, updates: Partial<Recipe>): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      // Remove fields that shouldn't be updated
      const { id, created_at, updated_at, ...updateData } = updates as any;

      const { error } = await supabase
        .from('recipes')
        .update(updateData)
        .eq('id', recipeId);

      if (error) throw error;
    } catch (error) {
      console.error('RecipeService.updateRecipe error:', error);
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to update recipe',
        userMessage: 'Failed to update recipe. Please try again.',
        originalError: error,
      });
    }
  },
};
