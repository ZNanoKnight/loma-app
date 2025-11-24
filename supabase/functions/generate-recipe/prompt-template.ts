/**
 * AI Prompt Template for Recipe Generation
 * Generates 4 personalized recipe variants based on user preferences
 */

export interface UserPreferences {
  // From user_profiles table
  dietaryRestrictions: string[]; // ['vegetarian', 'vegan', 'keto', 'paleo', 'pescatarian', 'halal', 'kosher']
  allergens: string[]; // ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'shellfish', 'fish']
  cuisinePreferences: string[]; // ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian']
  goals: string[]; // ['Weight Loss', 'Muscle Gain', 'General Health', 'Energy Boost', 'Heart Health']
  equipment: string[]; // ['Oven', 'Stovetop', 'Blender', 'Air Fryer', 'Slow Cooker', 'Instant Pot']
  cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredPrepTime?: number; // in minutes
}

export interface GenerateRecipeRequest {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  user_preferences: UserPreferences;
  custom_request?: string;
}

/**
 * Builds the system prompt for OpenAI
 */
export function buildSystemPrompt(): string {
  return `You are an expert nutritionist and chef specializing in personalized meal planning.
Your task is to generate 4 diverse, delicious, and nutritionally-balanced recipe variants based on the user's specific preferences and dietary needs.

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 4 different recipe variants
2. Each recipe must be complete with all required fields
3. Respect ALL dietary restrictions and allergen constraints
4. Match the specified meal type (breakfast, lunch, dinner, or snack)
5. Consider user's cooking skill level and available equipment
6. Align with user's health goals
7. Incorporate preferred cuisines when possible
8. Provide accurate nutritional information
9. Make recipes practical and achievable

RECIPE DIVERSITY:
- Vary cooking methods (baked, grilled, sautéed, raw, etc.)
- Include different cuisines when appropriate
- Mix simple and more complex options based on skill level
- Offer variety in protein sources, flavors, and textures

NUTRITIONAL ACCURACY:
- Calculate calories, macros, and micronutrients accurately
- Ensure portion sizes are realistic (typically 1-2 servings per recipe)
- Consider user's health goals when balancing nutrition

OUTPUT FORMAT:
Return a valid JSON object with the EXACT structure specified in the schema.
Do not include any text outside the JSON object.
Do not use markdown code blocks.
Return ONLY the JSON object.`;
}

/**
 * Builds the user prompt with personalization
 */
export function buildUserPrompt(request: GenerateRecipeRequest): string {
  const { meal_type, user_preferences, custom_request } = request;

  let prompt = `Generate 4 ${meal_type} recipes with the following requirements:\n\n`;

  // Dietary Restrictions (CRITICAL - must be enforced)
  if (user_preferences.dietaryRestrictions && user_preferences.dietaryRestrictions.length > 0) {
    prompt += `DIETARY RESTRICTIONS (MUST FOLLOW STRICTLY):\n`;
    user_preferences.dietaryRestrictions.forEach(restriction => {
      prompt += `- ${restriction}\n`;
    });
    prompt += '\n';
  }

  // Allergens (CRITICAL - must be excluded)
  if (user_preferences.allergens && user_preferences.allergens.length > 0) {
    prompt += `ALLERGENS TO AVOID (CRITICAL - DO NOT INCLUDE):\n`;
    user_preferences.allergens.forEach(allergen => {
      prompt += `- ${allergen}\n`;
    });
    prompt += '\n';
  }

  // Health Goals
  if (user_preferences.goals && user_preferences.goals.length > 0) {
    prompt += `HEALTH GOALS:\n`;
    user_preferences.goals.forEach(goal => {
      prompt += `- ${goal}\n`;
    });
    prompt += '\n';
  }

  // Cuisine Preferences
  if (user_preferences.cuisinePreferences && user_preferences.cuisinePreferences.length > 0) {
    prompt += `PREFERRED CUISINES (incorporate when appropriate):\n`;
    user_preferences.cuisinePreferences.forEach(cuisine => {
      prompt += `- ${cuisine}\n`;
    });
    prompt += '\n';
  }

  // Available Equipment
  if (user_preferences.equipment && user_preferences.equipment.length > 0) {
    prompt += `AVAILABLE EQUIPMENT:\n`;
    user_preferences.equipment.forEach(item => {
      prompt += `- ${item}\n`;
    });
    prompt += '\n';
  }

  // Cooking Skill Level
  if (user_preferences.cookingSkillLevel) {
    const skillLevel = user_preferences.cookingSkillLevel;
    prompt += `COOKING SKILL LEVEL: ${skillLevel}\n`;
    if (skillLevel === 'beginner') {
      prompt += `- Focus on simple techniques and common ingredients\n`;
      prompt += `- Provide detailed, step-by-step instructions\n`;
      prompt += `- Avoid complex knife skills or advanced techniques\n`;
    } else if (skillLevel === 'intermediate') {
      prompt += `- Include a mix of simple and moderately complex recipes\n`;
      prompt += `- Can include some advanced techniques with guidance\n`;
    } else if (skillLevel === 'advanced') {
      prompt += `- Feel free to include sophisticated techniques and unique ingredients\n`;
      prompt += `- Can suggest more complex flavor profiles and presentations\n`;
    }
    prompt += '\n';
  }

  // Time Constraints
  if (user_preferences.preferredPrepTime) {
    prompt += `PREFERRED PREP TIME: ${user_preferences.preferredPrepTime} minutes or less\n`;
    prompt += `- Optimize for efficiency without sacrificing quality\n\n`;
  }

  // Custom Request
  if (custom_request) {
    prompt += `ADDITIONAL REQUEST:\n${custom_request}\n\n`;
  }

  // Meal Type Specific Guidance
  prompt += `${meal_type.toUpperCase()} SPECIFIC GUIDELINES:\n`;
  switch (meal_type) {
    case 'breakfast':
      prompt += `- Include energizing, nutrient-dense options\n`;
      prompt += `- Consider prep-ahead or quick-cook options\n`;
      prompt += `- Balance protein, healthy fats, and complex carbs\n`;
      break;
    case 'lunch':
      prompt += `- Focus on satisfying, balanced meals\n`;
      prompt += `- Consider portability if needed\n`;
      prompt += `- Avoid overly heavy options that cause afternoon sluggishness\n`;
      break;
    case 'dinner':
      prompt += `- Create complete, satisfying meals\n`;
      prompt += `- Can be more elaborate than other meals\n`;
      prompt += `- Consider family-friendly options\n`;
      break;
    case 'snack':
      prompt += `- Keep portions appropriate for snacking (150-300 calories)\n`;
      prompt += `- Focus on nutrient density\n`;
      prompt += `- Include options that provide sustained energy\n`;
      break;
  }

  prompt += `\nGenerate 4 diverse, delicious recipes that meet ALL of the above requirements.`;

  return prompt;
}

/**
 * JSON Schema for Recipe Response
 * This defines the exact structure OpenAI must return
 */
export const RECIPE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    recipes: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        required: [
          'title',
          'description',
          'emoji',
          'prep_time',
          'cook_time',
          'total_time',
          'servings',
          'difficulty',
          'calories',
          'protein',
          'carbs',
          'fats',
          'ingredients',
          'instructions',
        ],
        properties: {
          title: {
            type: 'string',
            description: 'Appetizing recipe title (max 60 characters)',
            maxLength: 60,
          },
          description: {
            type: 'string',
            description: 'Brief, enticing description (max 200 characters)',
            maxLength: 200,
          },
          emoji: {
            type: 'string',
            description: 'Single emoji that represents the dish',
            maxLength: 2,
          },
          prep_time: {
            type: 'number',
            description: 'Preparation time in minutes',
            minimum: 0,
          },
          cook_time: {
            type: 'number',
            description: 'Cooking time in minutes',
            minimum: 0,
          },
          total_time: {
            type: 'number',
            description: 'Total time (prep + cook) in minutes',
            minimum: 0,
          },
          servings: {
            type: 'number',
            description: 'Number of servings',
            minimum: 1,
            maximum: 12,
          },
          difficulty: {
            type: 'string',
            enum: ['easy', 'medium', 'hard'],
            description: 'Recipe difficulty level',
          },
          calories: {
            type: 'number',
            description: 'Calories per serving',
            minimum: 0,
          },
          protein: {
            type: 'number',
            description: 'Protein in grams per serving',
            minimum: 0,
          },
          carbs: {
            type: 'number',
            description: 'Carbohydrates in grams per serving',
            minimum: 0,
          },
          fats: {
            type: 'number',
            description: 'Fats in grams per serving',
            minimum: 0,
          },
          fiber: {
            type: 'number',
            description: 'Fiber in grams per serving (optional)',
            minimum: 0,
          },
          sugar: {
            type: 'number',
            description: 'Sugar in grams per serving (optional)',
            minimum: 0,
          },
          sodium: {
            type: 'number',
            description: 'Sodium in mg per serving (optional)',
            minimum: 0,
          },
          cholesterol: {
            type: 'number',
            description: 'Cholesterol in mg per serving (optional)',
            minimum: 0,
          },
          ingredients: {
            type: 'array',
            description: 'List of ingredients with quantities',
            minItems: 1,
            items: {
              type: 'object',
              required: ['name', 'amount', 'unit'],
              properties: {
                name: {
                  type: 'string',
                  description: 'Ingredient name',
                },
                amount: {
                  type: 'number',
                  description: 'Quantity amount',
                },
                unit: {
                  type: 'string',
                  description: 'Unit of measurement (cup, tbsp, oz, g, etc.)',
                },
                notes: {
                  type: 'string',
                  description: 'Optional notes (e.g., "diced", "fresh")',
                },
              },
            },
          },
          instructions: {
            type: 'array',
            description: 'Step-by-step cooking instructions',
            minItems: 1,
            items: {
              type: 'object',
              required: ['step_number', 'instruction'],
              properties: {
                step_number: {
                  type: 'number',
                  description: 'Step number (1, 2, 3, etc.)',
                },
                instruction: {
                  type: 'string',
                  description: 'Clear, detailed instruction',
                },
                time_minutes: {
                  type: 'number',
                  description: 'Time for this step in minutes (optional)',
                },
              },
            },
          },
          equipment: {
            type: 'array',
            description: 'Required equipment',
            items: {
              type: 'object',
              required: ['name'],
              properties: {
                name: {
                  type: 'string',
                  description: 'Equipment name (e.g., "Oven", "Blender")',
                },
                optional: {
                  type: 'boolean',
                  description: 'Whether this equipment is optional',
                },
              },
            },
          },
          tags: {
            type: 'array',
            description: 'Descriptive tags (e.g., "Quick", "Vegetarian", "Comfort Food")',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  required: ['recipes'],
};

/**
 * Example response structure for reference
 */
export const EXAMPLE_RESPONSE = {
  recipes: [
    {
      title: 'Mediterranean Quinoa Bowl',
      description: 'Protein-packed quinoa bowl with fresh vegetables, chickpeas, and a tangy lemon tahini dressing',
      emoji: '🥗',
      prep_time: 15,
      cook_time: 20,
      total_time: 35,
      servings: 2,
      difficulty: 'easy',
      calories: 420,
      protein: 15,
      carbs: 52,
      fats: 18,
      fiber: 12,
      sugar: 6,
      sodium: 340,
      cholesterol: 0,
      ingredients: [
        { name: 'quinoa', amount: 1, unit: 'cup', notes: 'uncooked' },
        { name: 'chickpeas', amount: 1, unit: 'can', notes: 'drained and rinsed' },
        { name: 'cucumber', amount: 1, unit: 'whole', notes: 'diced' },
        { name: 'cherry tomatoes', amount: 1, unit: 'cup', notes: 'halved' },
        { name: 'red onion', amount: 0.25, unit: 'whole', notes: 'diced' },
        { name: 'tahini', amount: 2, unit: 'tbsp' },
        { name: 'lemon juice', amount: 2, unit: 'tbsp', notes: 'fresh' },
        { name: 'olive oil', amount: 1, unit: 'tbsp' },
        { name: 'garlic', amount: 1, unit: 'clove', notes: 'minced' },
      ],
      instructions: [
        { step_number: 1, instruction: 'Cook quinoa according to package directions. Let cool.', time_minutes: 20 },
        { step_number: 2, instruction: 'While quinoa cooks, dice cucumber, halve tomatoes, and dice red onion.', time_minutes: 10 },
        { step_number: 3, instruction: 'In a small bowl, whisk together tahini, lemon juice, olive oil, minced garlic, and 2 tbsp water until smooth.', time_minutes: 3 },
        { step_number: 4, instruction: 'In a large bowl, combine cooled quinoa, chickpeas, and vegetables.', time_minutes: 2 },
        { step_number: 5, instruction: 'Drizzle with tahini dressing and toss to combine. Serve immediately or chill.', time_minutes: 2 },
      ],
      equipment: [
        { name: 'Pot', optional: false },
        { name: 'Mixing bowls', optional: false },
        { name: 'Knife', optional: false },
        { name: 'Cutting board', optional: false },
      ],
      tags: ['Vegetarian', 'Vegan', 'Mediterranean', 'Healthy', 'Protein-Rich', 'Meal Prep'],
    },
    // ... 3 more recipes
  ],
};
