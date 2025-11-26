/**
 * Data Transformation Layer for Recipes
 * Handles conversion between database format (snake_case) and client format (camelCase)
 */

// Database Recipe Interface (matches Supabase schema)
export interface DbRecipe {
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
  ingredients?: any; // JSONB
  instructions?: any; // JSONB
  equipment?: any; // JSONB
  tags?: string[];
  generated_by_user_id?: string;
  generation_prompt?: string;
  ai_model?: string;
  created_at?: string;
  updated_at?: string;
}

// Client Recipe Interface (matches RecipeContext)
export interface ClientRecipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  ingredients: ClientIngredient[];
  instructions: ClientCookingStep[];
  equipment: ClientEquipmentItem[];
  tags: string[];
  cookedCount: number;
  lastCooked?: string;
  createdDate: string;
  notes?: string;
  rating?: number;
  isFavorite: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

// Client-side ingredient format (matches RecipeContext)
export interface ClientIngredient {
  id: string;
  category: string;
  amount: string;
  unit: string;
  item: string;  // This is 'name' in DB, 'item' in client
  notes?: string;
  calories: number;
  inPantry?: boolean;
}

// Client-side cooking step format (matches RecipeContext)
export interface ClientCookingStep {
  id: string;
  title: string;
  instruction: string;
  time?: number;
  tip?: string;
  warning?: string;
}

// Client-side equipment format (matches RecipeContext)
export interface ClientEquipmentItem {
  id: string;
  name: string;
  emoji: string;
  essential: boolean;
  alternative?: string;
}

// Database ingredient format (from Supabase)
export interface DbIngredient {
  name: string;
  amount: number;
  unit: string;
  notes?: string;
  category?: string;
  calories?: number;
}

// Database cooking step format (from Supabase)
export interface DbCookingStep {
  step_number: number;
  instruction: string;
  time_minutes?: number;
  title?: string;
  tip?: string;
  warning?: string;
}

// Database equipment format (from Supabase)
export interface DbEquipmentItem {
  name: string;
  optional?: boolean;
  emoji?: string;
}

/**
 * Transform database recipe (snake_case) to client recipe (camelCase)
 *
 * @param dbRecipe - Recipe from database
 * @param userRecipeData - Optional data from user_recipes table (favorites, ratings, etc.)
 * @returns Client-formatted recipe
 */
export function dbRecipeToClientRecipe(
  dbRecipe: DbRecipe,
  userRecipeData?: {
    is_favorite?: boolean;
    rating?: number;
    notes?: string;
    cooked_count?: number;
    last_cooked?: string;
  }
): ClientRecipe {
  return {
    id: dbRecipe.id,
    title: dbRecipe.title || 'Untitled Recipe',
    description: dbRecipe.description || '',
    emoji: dbRecipe.emoji || '🍽️',
    mealType: dbRecipe.meal_type,
    prepTime: dbRecipe.prep_time || 0,
    cookTime: dbRecipe.cook_time || 0,
    totalTime: dbRecipe.total_time || 0,
    servings: dbRecipe.servings || 1,
    difficulty: dbRecipe.difficulty || 'medium',
    calories: dbRecipe.calories || 0,
    protein: dbRecipe.protein || 0,
    carbs: dbRecipe.carbs || 0,
    fats: dbRecipe.fats || 0,
    fiber: dbRecipe.fiber || 0,
    sugar: dbRecipe.sugar || 0,
    sodium: dbRecipe.sodium || 0,
    cholesterol: dbRecipe.cholesterol || 0,
    ingredients: parseIngredients(dbRecipe.ingredients),
    instructions: parseInstructions(dbRecipe.instructions),
    equipment: parseEquipment(dbRecipe.equipment),
    tags: dbRecipe.tags || [],
    cookedCount: userRecipeData?.cooked_count || 0,
    lastCooked: userRecipeData?.last_cooked,
    createdDate: dbRecipe.created_at || new Date().toISOString(),
    notes: userRecipeData?.notes,
    rating: userRecipeData?.rating,
    isFavorite: userRecipeData?.is_favorite || false,
  };
}

/**
 * Transform client recipe (camelCase) to database recipe (snake_case)
 *
 * @param clientRecipe - Recipe from client/context
 * @returns Database-formatted recipe
 */
export function clientRecipeToDbRecipe(clientRecipe: ClientRecipe): Partial<DbRecipe> {
  return {
    title: clientRecipe.title,
    description: clientRecipe.description,
    emoji: clientRecipe.emoji,
    meal_type: clientRecipe.mealType,
    prep_time: clientRecipe.prepTime,
    cook_time: clientRecipe.cookTime,
    total_time: clientRecipe.totalTime,
    servings: clientRecipe.servings,
    difficulty: clientRecipe.difficulty as 'easy' | 'medium' | 'hard',
    calories: clientRecipe.calories,
    protein: clientRecipe.protein,
    carbs: clientRecipe.carbs,
    fats: clientRecipe.fats,
    fiber: clientRecipe.fiber,
    sugar: clientRecipe.sugar,
    sodium: clientRecipe.sodium,
    cholesterol: clientRecipe.cholesterol,
    ingredients: clientRecipe.ingredients,
    instructions: clientRecipe.instructions,
    equipment: clientRecipe.equipment,
    tags: clientRecipe.tags,
  };
}

/**
 * Parse ingredients from JSONB and transform to client format
 * DB format: { name, amount (number), unit, notes?, category?, calories? }
 * Client format: { id, category, amount (string), unit, item, notes?, calories, inPantry? }
 */
function parseIngredients(ingredients: any): ClientIngredient[] {
  if (!ingredients) return [];

  let parsed: DbIngredient[] = [];

  if (Array.isArray(ingredients)) {
    parsed = ingredients;
  } else if (typeof ingredients === 'string') {
    try {
      parsed = JSON.parse(ingredients);
    } catch (error) {
      console.error('Error parsing ingredients:', error);
      return [];
    }
  }

  // Transform DB format to client format
  return parsed.map((ing, index) => ({
    id: String(index + 1),
    category: ing.category || 'Other',
    amount: String(ing.amount || ''),
    unit: ing.unit || '',
    item: ing.name || '',  // DB uses 'name', client uses 'item'
    notes: ing.notes,
    calories: ing.calories || 0,
    inPantry: false,
  }));
}

/**
 * Parse instructions from JSONB and transform to client format
 * DB format: { step_number, instruction, time_minutes?, title?, tip?, warning? }
 * Client format: { id, title, instruction, time?, tip?, warning? }
 */
function parseInstructions(instructions: any): ClientCookingStep[] {
  if (!instructions) return [];

  let parsed: DbCookingStep[] = [];

  if (Array.isArray(instructions)) {
    parsed = instructions;
  } else if (typeof instructions === 'string') {
    try {
      parsed = JSON.parse(instructions);
    } catch (error) {
      console.error('Error parsing instructions:', error);
      return [];
    }
  }

  // Transform DB format to client format
  return parsed.map((step, index) => ({
    id: String(step.step_number || index + 1),
    title: step.title || `Step ${step.step_number || index + 1}`,
    instruction: step.instruction || '',
    time: step.time_minutes,
    tip: step.tip,
    warning: step.warning,
  }));
}

/**
 * Parse equipment from JSONB and transform to client format
 * DB format: { name, optional?, emoji? }
 * Client format: { id, name, emoji, essential, alternative? }
 */
function parseEquipment(equipment: any): ClientEquipmentItem[] {
  if (!equipment) return [];

  let parsed: DbEquipmentItem[] = [];

  if (Array.isArray(equipment)) {
    parsed = equipment;
  } else if (typeof equipment === 'string') {
    try {
      parsed = JSON.parse(equipment);
    } catch (error) {
      console.error('Error parsing equipment:', error);
      return [];
    }
  }

  // Default emojis for common equipment
  const defaultEmojis: Record<string, string> = {
    'pan': '🍳',
    'skillet': '🍳',
    'pot': '🍲',
    'saucepan': '🍲',
    'bowl': '🥣',
    'knife': '🔪',
    'cutting board': '🔪',
    'spatula': '🥄',
    'spoon': '🥄',
    'whisk': '🥄',
    'oven': '🔥',
    'microwave': '📻',
    'blender': '🧊',
    'mixer': '🎛️',
    'default': '🍽️',
  };

  const getEmoji = (name: string, providedEmoji?: string): string => {
    if (providedEmoji) return providedEmoji;
    const lowerName = name.toLowerCase();
    for (const [key, emoji] of Object.entries(defaultEmojis)) {
      if (lowerName.includes(key)) return emoji;
    }
    return defaultEmojis.default;
  };

  // Transform DB format to client format
  return parsed.map((item, index) => ({
    id: String(index + 1),
    name: item.name || '',
    emoji: getEmoji(item.name || '', item.emoji),
    essential: !item.optional,  // DB uses 'optional', client uses 'essential' (inverted)
  }));
}

/**
 * Validate recipe structure
 *
 * @param recipe - Recipe object to validate
 * @returns true if valid, false otherwise
 */
export function validateRecipe(recipe: any): boolean {
  if (!recipe) return false;

  // Required fields
  const requiredFields = [
    'id',
    'title',
    'mealType',
    'ingredients',
    'instructions',
  ];

  for (const field of requiredFields) {
    if (!(field in recipe)) {
      console.error(`Recipe missing required field: ${field}`);
      return false;
    }
  }

  // Validate meal type
  const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  if (!validMealTypes.includes(recipe.mealType)) {
    console.error(`Invalid meal type: ${recipe.mealType}`);
    return false;
  }

  // Validate ingredients array
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    console.error('Recipe must have at least one ingredient');
    return false;
  }

  // Validate instructions array
  if (!Array.isArray(recipe.instructions) || recipe.instructions.length === 0) {
    console.error('Recipe must have at least one instruction');
    return false;
  }

  // Validate numeric fields are non-negative
  const numericFields = [
    'prepTime',
    'cookTime',
    'totalTime',
    'servings',
    'calories',
    'protein',
    'carbs',
    'fats',
  ];

  for (const field of numericFields) {
    if (field in recipe && typeof recipe[field] === 'number' && recipe[field] < 0) {
      console.error(`Invalid ${field}: ${recipe[field]} (must be non-negative)`);
      return false;
    }
  }

  return true;
}

/**
 * Validate ingredient structure
 */
export function validateIngredient(ingredient: any): boolean {
  if (!ingredient) return false;

  const requiredFields = ['name', 'amount', 'unit'];
  for (const field of requiredFields) {
    if (!(field in ingredient)) {
      console.error(`Ingredient missing required field: ${field}`);
      return false;
    }
  }

  if (typeof ingredient.amount !== 'number' || ingredient.amount <= 0) {
    console.error(`Invalid ingredient amount: ${ingredient.amount}`);
    return false;
  }

  return true;
}

/**
 * Validate instruction structure
 */
export function validateInstruction(instruction: any): boolean {
  if (!instruction) return false;

  const requiredFields = ['step_number', 'instruction'];
  for (const field of requiredFields) {
    if (!(field in instruction)) {
      console.error(`Instruction missing required field: ${field}`);
      return false;
    }
  }

  if (typeof instruction.step_number !== 'number' || instruction.step_number < 1) {
    console.error(`Invalid step number: ${instruction.step_number}`);
    return false;
  }

  if (typeof instruction.instruction !== 'string' || instruction.instruction.trim() === '') {
    console.error('Instruction text cannot be empty');
    return false;
  }

  return true;
}

/**
 * Batch transform multiple database recipes to client recipes
 */
export function batchDbRecipesToClientRecipes(
  dbRecipes: DbRecipe[],
  userRecipesMap?: Map<string, any>
): ClientRecipe[] {
  return dbRecipes.map(dbRecipe => {
    const userRecipeData = userRecipesMap?.get(dbRecipe.id);
    return dbRecipeToClientRecipe(dbRecipe, userRecipeData);
  });
}

/**
 * Calculate total time if not provided
 */
export function calculateTotalTime(prepTime: number, cookTime: number): number {
  return (prepTime || 0) + (cookTime || 0);
}

/**
 * Format recipe for display (helper function)
 */
export function formatRecipeForDisplay(recipe: ClientRecipe): {
  title: string;
  subtitle: string;
  timeLabel: string;
  caloriesLabel: string;
  difficultyLabel: string;
} {
  return {
    title: recipe.title,
    subtitle: recipe.description,
    timeLabel: `${recipe.totalTime} min`,
    caloriesLabel: `${recipe.calories} cal`,
    difficultyLabel: recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1),
  };
}

/**
 * Extract recipe summary for preview
 */
export function getRecipeSummary(recipe: ClientRecipe): {
  totalTime: number;
  calories: number;
  protein: number;
  ingredientCount: number;
  stepCount: number;
} {
  return {
    totalTime: recipe.totalTime,
    calories: recipe.calories,
    protein: recipe.protein,
    ingredientCount: recipe.ingredients.length,
    stepCount: recipe.instructions.length,
  };
}
