/**
 * Validation Schemas
 * Zod schemas for runtime validation of data
 */

import { z } from 'zod';

// ============================================================================
// USER PROFILE SCHEMAS
// ============================================================================

export const UserProfileSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  age: z.string().optional(),
  weight: z.string().optional(),
  height_feet: z.string().optional(),
  height_inches: z.string().optional(),
  gender: z.string().optional(),
  activity_level: z.string().optional(),
  goals: z.array(z.string()).default([]),
  dietary_preferences: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  disliked_ingredients: z.array(z.string()).default([]),
  cuisine_preferences: z.array(z.string()).default([]),
  equipment: z.string().optional(),
  cooking_frequency: z.string().optional(),
  meal_prep_interest: z.string().optional(),
  default_serving_size: z.number().int().positive().default(1),
  target_weight: z.string().optional(),
  target_protein: z.string().optional(),
  target_calories: z.string().optional(),
  target_carbs: z.string().optional(),
  target_fat: z.string().optional(),
  notifications: z.boolean().default(true),
  meal_reminders: z.boolean().default(true),
  weekly_report: z.boolean().default(true),
  dark_mode: z.boolean().default(false),
  metric_units: z.boolean().default(false),
  profile_image_url: z.string().url().optional().nullable(),
  has_completed_onboarding: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const SignUpRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  userData: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    age: z.string().optional(),
    weight: z.string().optional(),
    heightFeet: z.string().optional(),
    heightInches: z.string().optional(),
    gender: z.string().optional(),
    activityLevel: z.string().optional(),
    goals: z.array(z.string()).default([]),
    dietaryPreferences: z.array(z.string()).default([]),
    allergens: z.array(z.string()).default([]),
    equipment: z.string().optional(),
    cookingFrequency: z.string().optional(),
    mealPrepInterest: z.string().optional(),
  }),
});

export const SignInRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ============================================================================
// RECIPE SCHEMAS
// ============================================================================

export const IngredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().min(1, 'Amount is required'),
  unit: z.string().min(1, 'Unit is required'),
});

export const InstructionSchema = z.object({
  step: z.number().int().positive(),
  description: z.string().min(1, 'Instruction description is required'),
  time: z.number().int().nonnegative().optional(), // in minutes
});

export const EquipmentItemSchema = z.object({
  name: z.string().min(1, 'Equipment name is required'),
  required: z.boolean().default(true),
});

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Recipe title is required'),
  description: z.string().optional(),
  emoji: z.string().optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  prep_time: z.number().int().nonnegative().optional(),
  cook_time: z.number().int().nonnegative().optional(),
  total_time: z.number().int().nonnegative().optional(),
  servings: z.number().int().positive().default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  calories: z.number().int().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbs: z.number().nonnegative().optional(),
  fats: z.number().nonnegative().optional(),
  fiber: z.number().nonnegative().optional(),
  sugar: z.number().nonnegative().optional(),
  sodium: z.number().nonnegative().optional(),
  cholesterol: z.number().nonnegative().optional(),
  ingredients: z.array(IngredientSchema).min(1, 'At least one ingredient is required'),
  instructions: z.array(InstructionSchema).min(1, 'At least one instruction is required'),
  equipment: z.array(EquipmentItemSchema).optional(),
  tags: z.array(z.string()).default([]),
  generated_by_user_id: z.string().uuid().optional(),
  generation_prompt: z.string().optional(),
  ai_model: z.string().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type Instruction = z.infer<typeof InstructionSchema>;
export type EquipmentItem = z.infer<typeof EquipmentItemSchema>;

// ============================================================================
// USER RECIPE SCHEMAS
// ============================================================================

export const UserRecipeSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  recipe_id: z.string().uuid(),
  is_favorite: z.boolean().default(false),
  is_saved: z.boolean().default(true),
  rating: z.number().int().min(1).max(5).optional(),
  notes: z.string().optional(),
  cooked_count: z.number().int().nonnegative().default(0),
  last_cooked_at: z.string().datetime().optional().nullable(),
  saved_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type UserRecipe = z.infer<typeof UserRecipeSchema>;

// ============================================================================
// SUBSCRIPTION SCHEMAS
// ============================================================================

export const SubscriptionSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  plan: z.enum(['weekly', 'monthly', 'yearly']),
  status: z.enum(['active', 'cancelled', 'expired', 'past_due']),
  tokens_balance: z.number().int().nonnegative().default(0),
  tokens_used: z.number().int().nonnegative().default(0),
  tokens_total: z.number().int().nonnegative().default(0),
  stripe_customer_id: z.string().optional().nullable(),
  stripe_subscription_id: z.string().optional().nullable(),
  stripe_price_id: z.string().optional().nullable(),
  current_period_start: z.string().datetime().optional().nullable(),
  current_period_end: z.string().datetime().optional().nullable(),
  cancel_at_period_end: z.boolean().default(false),
  cancelled_at: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

// ============================================================================
// PROGRESS TRACKING SCHEMAS
// ============================================================================

export const ProgressTrackingSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  current_streak: z.number().int().nonnegative().default(0),
  longest_streak: z.number().int().nonnegative().default(0),
  last_activity_date: z.string().optional().nullable(),
  weekly_progress: z.array(z.boolean()).default([]),
  week_start_date: z.string().optional().nullable(),
  total_recipes_generated: z.number().int().nonnegative().default(0),
  total_recipes_saved: z.number().int().nonnegative().default(0),
  total_recipes_cooked: z.number().int().nonnegative().default(0),
  hours_saved: z.number().nonnegative().default(0),
  money_saved: z.number().nonnegative().default(0),
  achievements: z.array(z.any()).default([]), // Flexible for now
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type ProgressTracking = z.infer<typeof ProgressTrackingSchema>;

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        details: z.any().optional(),
      })
      .optional(),
    metadata: z
      .object({
        timestamp: z.string().datetime(),
        requestId: z.string().optional(),
      })
      .optional(),
  });

// ============================================================================
// RECIPE GENERATION REQUEST SCHEMA
// ============================================================================

export const RecipeGenerationRequestSchema = z.object({
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  customRequest: z.string().optional(),
  servings: z.number().int().positive().default(1),
  userPreferences: z
    .object({
      dietaryRestrictions: z.array(z.string()).default([]),
      allergens: z.array(z.string()).default([]),
      cuisinePreferences: z.array(z.string()).default([]),
      goals: z.array(z.string()).default([]),
      equipment: z.string().optional(),
      targetCalories: z.string().optional(),
      targetProtein: z.string().optional(),
    })
    .optional(),
});

export type RecipeGenerationRequest = z.infer<typeof RecipeGenerationRequestSchema>;
