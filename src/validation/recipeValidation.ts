import { z } from 'zod';

/**
 * Validation schemas for recipe generation
 */

export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack'], {
  errorMap: () => ({ message: 'Please select a valid meal type' }),
});

export const recipeGenerationSchema = z.object({
  mealType: mealTypeSchema,
  customRequest: z
    .string()
    .max(500, 'Custom request must be less than 500 characters')
    .optional()
    .transform((val) => val?.trim()),
});

export type RecipeGenerationInput = z.infer<typeof recipeGenerationSchema>;

/**
 * Validate recipe generation input and sanitize strings
 */
export function validateRecipeGeneration(input: unknown): RecipeGenerationInput {
  return recipeGenerationSchema.parse(input);
}

/**
 * Safe validation that returns success/error instead of throwing
 */
export function safeValidateRecipeGeneration(input: unknown) {
  return recipeGenerationSchema.safeParse(input);
}
