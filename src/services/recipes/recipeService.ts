/**
 * Recipe Service
 * Handles recipe CRUD operations and AI generation
 */

import { getSupabaseClient } from '../auth/supabase';
import { ErrorCode, LomaError } from '../types';
import { validateRecipeGeneration } from '../../validation/recipeValidation';
import { logger } from '../../utils/logger';

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
   * Generate 4 new recipes using AI
   * @param request - Generation request with meal type and optional custom request
   * @returns Array of 4 generated recipes
   */
  async generateRecipe(request: {
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    customRequest?: string;
  }): Promise<Recipe[]> {
    try {
      // Validate and sanitize input
      const validatedInput = validateRecipeGeneration(request);

      const supabase = getSupabaseClient();

      logger.log('[RecipeService] Generating recipes via AI:', validatedInput);

      // Call generate-recipe Edge Function
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: {
          meal_type: validatedInput.mealType,
          custom_request: validatedInput.customRequest,
        },
      });

      if (error) {
        logger.error('[RecipeService] Edge Function error:', error);
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Recipe generation failed',
          userMessage: 'Unable to generate recipes. Please try again.',
          originalError: error,
        });
      }

      if (!data || !data.success) {
        logger.error('[RecipeService] Edge Function returned unsuccessful response:', data);
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Recipe generation failed',
          userMessage: data?.error || 'Unable to generate recipes. Please try again.',
        });
      }

      if (!data.recipes || !Array.isArray(data.recipes) || data.recipes.length !== 4) {
        logger.error('[RecipeService] Invalid recipe count:', data.recipes?.length);
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Invalid recipe response',
          userMessage: 'Received invalid recipes. Please try again.',
        });
      }

      logger.log(
        `[RecipeService] Successfully generated ${data.recipes.length} recipes`,
        `Tokens: ${data.metadata?.tokens_used}, Cost: $${data.metadata?.estimated_cost}`
      );

      // Transform database recipes to client format
      const { dbRecipeToClientRecipe } = await import('./recipeTransformers');
      const recipes = data.recipes.map((dbRecipe: any) =>
        dbRecipeToClientRecipe(dbRecipe, {
          is_favorite: false,
          cooked_count: 0,
        })
      );

      return recipes;
    } catch (error) {
      console.error('[RecipeService] generateRecipe error:', error);

      // If it's already a LomaError, rethrow it
      if (error instanceof LomaError) {
        throw error;
      }

      // Otherwise, wrap it
      throw new LomaError({
        code: ErrorCode.RECIPE_GENERATION_FAILED,
        message: 'Failed to generate recipes',
        userMessage: 'Failed to generate recipes. Please try again.',
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

  /**
   * Refine an existing recipe using AI based on user feedback
   * Does NOT consume a Munchie - free refinement
   * @param request - Refinement request with recipe details and user feedback
   * @returns The refined recipe (already saved to database)
   */
  async refineRecipe(request: {
    recipeId: string;
    refinementRequest: string;
    originalRecipe: {
      title: string;
      description: string;
      emoji: string;
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      prepTime: number;
      cookTime: number;
      totalTime: number;
      servings: number;
      difficulty: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      fiber?: number;
      sugar?: number;
      sodium?: number;
      cholesterol?: number;
      ingredients: any[];
      instructions: any[];
      equipment?: any[];
      tags?: string[];
    };
  }): Promise<any> {
    try {
      const supabase = getSupabaseClient();

      logger.log('[RecipeService] Refining recipe:', request.recipeId);

      // Call refine-recipe Edge Function
      const { data, error } = await supabase.functions.invoke('refine-recipe', {
        body: {
          recipe_id: request.recipeId,
          refinement_request: request.refinementRequest,
          original_recipe: {
            title: request.originalRecipe.title,
            description: request.originalRecipe.description,
            emoji: request.originalRecipe.emoji,
            meal_type: request.originalRecipe.mealType,
            prep_time: request.originalRecipe.prepTime,
            cook_time: request.originalRecipe.cookTime,
            total_time: request.originalRecipe.totalTime,
            servings: request.originalRecipe.servings,
            difficulty: request.originalRecipe.difficulty,
            calories: request.originalRecipe.calories,
            protein: request.originalRecipe.protein,
            carbs: request.originalRecipe.carbs,
            fats: request.originalRecipe.fats,
            fiber: request.originalRecipe.fiber,
            sugar: request.originalRecipe.sugar,
            sodium: request.originalRecipe.sodium,
            cholesterol: request.originalRecipe.cholesterol,
            ingredients: request.originalRecipe.ingredients,
            instructions: request.originalRecipe.instructions,
            equipment: request.originalRecipe.equipment,
            tags: request.originalRecipe.tags,
          },
        },
      });

      if (error) {
        logger.error('[RecipeService] Edge Function error:', error);
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Recipe refinement failed',
          userMessage: 'Unable to refine recipe. Please try again.',
          originalError: error,
        });
      }

      if (!data || !data.success) {
        logger.error('[RecipeService] Edge Function returned unsuccessful response:', data);
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Recipe refinement failed',
          userMessage: data?.error || 'Unable to refine recipe. Please try again.',
        });
      }

      if (!data.recipe) {
        logger.error('[RecipeService] No recipe in response:', data);
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Invalid refinement response',
          userMessage: 'Received invalid refined recipe. Please try again.',
        });
      }

      logger.log(
        `[RecipeService] Successfully refined recipe`,
        `New ID: ${data.recipe.id}, Tokens: ${data.metadata?.tokens_used}`
      );

      // Transform database recipe to client format
      const { dbRecipeToClientRecipe } = await import('./recipeTransformers');
      const refinedRecipe = dbRecipeToClientRecipe(data.recipe, {
        is_favorite: false,
        cooked_count: 0,
      });

      return refinedRecipe;
    } catch (error) {
      console.error('[RecipeService] refineRecipe error:', error);

      // If it's already a LomaError, rethrow it
      if (error instanceof LomaError) {
        throw error;
      }

      // Otherwise, wrap it
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to refine recipe',
        userMessage: 'Failed to refine recipe. Please try again.',
        originalError: error,
      });
    }
  },
};
