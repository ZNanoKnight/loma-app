import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefineRecipeRequest {
  recipe_id: string;
  refinement_request: string;
  original_recipe: {
    title: string;
    description: string;
    emoji: string;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    prep_time: number;
    cook_time: number;
    total_time: number;
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
}

interface RefinedRecipeResponse {
  recipe: any;
}

/**
 * Parse a numeric value from AI response, handling strings like "25 minutes" or "300 calories"
 */
function parseNumericValue(value: any, defaultValue: number = 0): number {
  if (typeof value === 'number') {
    return Math.round(value);
  }
  if (typeof value === 'string') {
    // Extract the first number from the string
    const match = value.match(/[\d.]+/);
    if (match) {
      return Math.round(parseFloat(match[0]));
    }
  }
  return defaultValue;
}

/**
 * Normalize ingredients from AI response to match database schema
 * AI might use various field names: name/item/ingredient, amount/quantity, etc.
 */
function normalizeIngredients(ingredients: any[]): any[] {
  if (!Array.isArray(ingredients)) return [];
  return ingredients.map((ing) => {
    // Handle string-only ingredients
    if (typeof ing === 'string') {
      return { name: ing, amount: 1, unit: 'unit' };
    }

    // AI might use "quantity" instead of "amount", or combine amount+unit
    const amount = ing.amount ?? ing.quantity ?? 1;
    let parsedAmount = 1;
    let unit = ing.unit || 'unit';

    // If amount is a string like "1 cup", parse it
    if (typeof amount === 'string') {
      const match = amount.match(/^([\d./]+)\s*(.*)$/);
      if (match) {
        // Handle fractions like "1/2"
        if (match[1].includes('/')) {
          const [num, denom] = match[1].split('/');
          parsedAmount = parseFloat(num) / parseFloat(denom);
        } else {
          parsedAmount = parseFloat(match[1]) || 1;
        }
        if (match[2]) unit = match[2].trim() || unit;
      }
    } else {
      parsedAmount = parseNumericValue(amount, 1);
    }

    return {
      name: ing.name || ing.item || ing.ingredient || 'Unknown ingredient',
      amount: parsedAmount,
      unit: unit,
      notes: ing.notes || ing.preparation || undefined,
      category: ing.category || undefined,
      calories: ing.calories || undefined,
    };
  });
}

/**
 * Normalize instructions from AI response to match database schema
 * AI might use various field names: instruction/step/text, step_number/stepNumber, etc.
 */
function normalizeInstructions(instructions: any[]): any[] {
  if (!Array.isArray(instructions)) return [];
  return instructions.map((inst, idx) => {
    // If it's just a string, wrap it
    if (typeof inst === 'string') {
      return { step_number: idx + 1, instruction: inst };
    }
    return {
      step_number: inst.step_number ?? inst.stepNumber ?? inst.number ?? idx + 1,
      instruction: inst.instruction ?? inst.step ?? inst.text ?? inst.description ?? String(inst),
      time_minutes: inst.time_minutes ?? inst.timeMinutes ?? inst.time ?? undefined,
      title: inst.title || undefined,
      tip: inst.tip || undefined,
      warning: inst.warning || undefined,
    };
  });
}

/**
 * Normalize equipment from AI response to match database schema
 * AI might return strings or objects with various field names
 */
function normalizeEquipment(equipment: any[]): any[] {
  if (!Array.isArray(equipment)) return [];
  return equipment.map((eq) => {
    if (typeof eq === 'string') {
      return { name: eq, optional: false };
    }
    return {
      name: eq.name || eq.item || String(eq),
      optional: eq.optional ?? eq.isOptional ?? false,
      emoji: eq.emoji || undefined,
    };
  });
}

/**
 * Sanitize the AI-generated recipe to ensure all fields have correct types
 */
function sanitizeRecipe(recipe: any, originalRecipe: any): any {
  // Normalize arrays to ensure consistent field names
  const normalizedIngredients = normalizeIngredients(recipe.ingredients);
  const normalizedInstructions = normalizeInstructions(recipe.instructions);
  const normalizedEquipment = normalizeEquipment(recipe.equipment);

  console.log(`[refine-recipe] Normalized ${normalizedIngredients.length} ingredients, ${normalizedInstructions.length} instructions, ${normalizedEquipment.length} equipment`);

  return {
    title: recipe.title || originalRecipe.title,
    description: recipe.description || originalRecipe.description,
    emoji: recipe.emoji || originalRecipe.emoji,
    prep_time: parseNumericValue(recipe.prep_time ?? recipe.prepTime, originalRecipe.prep_time),
    cook_time: parseNumericValue(recipe.cook_time ?? recipe.cookTime, originalRecipe.cook_time),
    total_time: parseNumericValue(recipe.total_time ?? recipe.totalTime, originalRecipe.total_time),
    servings: parseNumericValue(recipe.servings, originalRecipe.servings),
    difficulty: recipe.difficulty || originalRecipe.difficulty,
    calories: parseNumericValue(recipe.calories, originalRecipe.calories),
    protein: parseNumericValue(recipe.protein, originalRecipe.protein),
    carbs: parseNumericValue(recipe.carbs, originalRecipe.carbs),
    fats: parseNumericValue(recipe.fats, originalRecipe.fats),
    fiber: parseNumericValue(recipe.fiber, originalRecipe.fiber || 0),
    sugar: parseNumericValue(recipe.sugar, originalRecipe.sugar || 0),
    sodium: parseNumericValue(recipe.sodium, originalRecipe.sodium || 0),
    cholesterol: parseNumericValue(recipe.cholesterol, originalRecipe.cholesterol || 0),
    ingredients: normalizedIngredients.length > 0 ? normalizedIngredients : originalRecipe.ingredients,
    instructions: normalizedInstructions.length > 0 ? normalizedInstructions : originalRecipe.instructions,
    equipment: normalizedEquipment.length > 0 ? normalizedEquipment : (originalRecipe.equipment || []),
    tags: Array.isArray(recipe.tags) ? recipe.tags : (originalRecipe.tags || []),
  };
}

/**
 * Build system prompt for recipe refinement
 */
function buildRefineSystemPrompt(): string {
  return `You are an expert nutritionist and chef specializing in personalized meal modifications.
Your task is to refine an existing recipe based on user feedback while maintaining its core identity and ensuring nutritional balance.

CRITICAL REQUIREMENTS:
1. Return EXACTLY 1 refined recipe (not multiple)
2. The recipe must maintain the same general style/cuisine unless explicitly asked to change
3. Recalculate ALL nutritional information accurately based on ingredient changes
4. Update cooking times if ingredients or methods change
5. Preserve elements the user didn't ask to change
6. Make the recipe practical and achievable
7. Ensure macro-conscious, nutritionally-balanced output
8. ALL numeric fields (prep_time, cook_time, total_time, servings, calories, protein, carbs, fats, fiber, sugar, sodium, cholesterol) MUST be plain integers, NOT strings with units

REFINEMENT GUIDELINES:
- If user asks to swap an ingredient, find appropriate substitutes
- If user asks for more/less of a nutrient, adjust portions and ingredients accordingly
- If user asks to simplify, reduce steps and complex techniques
- If user asks for dietary changes (vegetarian, etc.), make appropriate substitutions
- Always recalculate macros when ingredients change

OUTPUT FORMAT:
Return a valid JSON object with the EXACT structure specified.
Do not include any text outside the JSON object.
Do not use markdown code blocks.
Return ONLY the JSON object with a single "recipe" key containing the refined recipe.

IMPORTANT: Time values must be integers (e.g., 25, not "25 minutes"). Nutrition values must be integers (e.g., 300, not "300 calories").`;
}

/**
 * Build user prompt for recipe refinement
 */
function buildRefineUserPrompt(request: RefineRecipeRequest): string {
  const { original_recipe, refinement_request } = request;

  let prompt = `Please refine the following recipe based on my request.\n\n`;

  prompt += `CURRENT RECIPE:\n`;
  prompt += `Title: ${original_recipe.title}\n`;
  prompt += `Description: ${original_recipe.description}\n`;
  prompt += `Meal Type: ${original_recipe.meal_type}\n`;
  prompt += `Prep Time: ${original_recipe.prep_time} minutes\n`;
  prompt += `Cook Time: ${original_recipe.cook_time} minutes\n`;
  prompt += `Servings: ${original_recipe.servings}\n`;
  prompt += `Difficulty: ${original_recipe.difficulty}\n\n`;

  prompt += `CURRENT NUTRITION (per serving):\n`;
  prompt += `- Calories: ${original_recipe.calories}\n`;
  prompt += `- Protein: ${original_recipe.protein}g\n`;
  prompt += `- Carbs: ${original_recipe.carbs}g\n`;
  prompt += `- Fats: ${original_recipe.fats}g\n`;
  if (original_recipe.fiber) prompt += `- Fiber: ${original_recipe.fiber}g\n`;
  if (original_recipe.sugar) prompt += `- Sugar: ${original_recipe.sugar}g\n`;
  if (original_recipe.sodium) prompt += `- Sodium: ${original_recipe.sodium}mg\n`;
  if (original_recipe.cholesterol) prompt += `- Cholesterol: ${original_recipe.cholesterol}mg\n`;
  prompt += `\n`;

  prompt += `CURRENT INGREDIENTS:\n`;
  original_recipe.ingredients.forEach((ing: any, i: number) => {
    const notes = ing.notes ? ` (${ing.notes})` : '';
    prompt += `${i + 1}. ${ing.amount} ${ing.unit} ${ing.name}${notes}\n`;
  });
  prompt += `\n`;

  prompt += `CURRENT INSTRUCTIONS:\n`;
  original_recipe.instructions.forEach((step: any) => {
    const time = step.time_minutes ? ` (${step.time_minutes} min)` : '';
    prompt += `Step ${step.step_number}: ${step.instruction}${time}\n`;
  });
  prompt += `\n`;

  if (original_recipe.equipment && original_recipe.equipment.length > 0) {
    prompt += `CURRENT EQUIPMENT:\n`;
    original_recipe.equipment.forEach((eq: any) => {
      const optional = eq.optional ? ' (optional)' : '';
      prompt += `- ${eq.name}${optional}\n`;
    });
    prompt += `\n`;
  }

  prompt += `MY REFINEMENT REQUEST:\n${refinement_request}\n\n`;

  prompt += `Please provide a refined version of this recipe that addresses my request. `;
  prompt += `Maintain the meal type as "${original_recipe.meal_type}". `;
  prompt += `Ensure all nutritional values are recalculated accurately based on any ingredient changes.`;

  return prompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    console.log(`[refine-recipe] Request from user: ${user.id}`);

    // Parse request body
    const requestData: RefineRecipeRequest = await req.json();
    const { recipe_id, refinement_request, original_recipe } = requestData;

    if (!recipe_id) {
      throw new Error('recipe_id is required');
    }

    if (!refinement_request || refinement_request.trim().length === 0) {
      throw new Error('refinement_request is required');
    }

    if (!original_recipe) {
      throw new Error('original_recipe is required');
    }

    console.log(`[refine-recipe] Refining recipe ${recipe_id}: "${refinement_request.substring(0, 50)}..."`);

    // Build prompts
    const systemPrompt = buildRefineSystemPrompt();
    const userPrompt = buildRefineUserPrompt(requestData);

    console.log(`[refine-recipe] Prompts built. Calling OpenAI API...`);

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7, // Slightly lower for more consistent refinements
        max_tokens: 2000, // Enough for 1 detailed recipe
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('[refine-recipe] OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log(`[refine-recipe] OpenAI API response received`);

    // Extract usage data for cost calculation
    const usage = openaiData.usage;
    const promptTokens = usage.prompt_tokens;
    const completionTokens = usage.completion_tokens;
    const totalTokens = usage.total_tokens;

    // Calculate cost (GPT-4o-mini pricing)
    const inputCost = (promptTokens / 1_000_000) * 0.15;
    const outputCost = (completionTokens / 1_000_000) * 0.60;
    const estimatedCost = inputCost + outputCost;

    console.log(`[refine-recipe] Token usage: ${totalTokens} tokens, estimated cost: $${estimatedCost.toFixed(6)}`);

    // Parse AI response
    const aiContent = openaiData.choices[0].message.content;
    let recipeResponse: RefinedRecipeResponse;

    try {
      recipeResponse = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('[refine-recipe] Failed to parse AI response:', aiContent);
      throw new Error('AI returned invalid JSON response');
    }

    // Validate response structure
    if (!recipeResponse.recipe) {
      console.error('[refine-recipe] Invalid response structure:', recipeResponse);
      throw new Error('AI response missing recipe object');
    }

    // Sanitize the AI response to ensure correct data types
    const refinedRecipe = sanitizeRecipe(recipeResponse.recipe, original_recipe);
    console.log(`[refine-recipe] Successfully parsed and sanitized refined recipe: ${refinedRecipe.title}`);

    // Store the refined recipe as a NEW recipe in the database
    const { data: insertedRecipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        title: refinedRecipe.title,
        description: refinedRecipe.description,
        emoji: refinedRecipe.emoji,
        meal_type: original_recipe.meal_type, // Preserve meal type
        prep_time: refinedRecipe.prep_time,
        cook_time: refinedRecipe.cook_time,
        total_time: refinedRecipe.total_time,
        servings: refinedRecipe.servings,
        difficulty: refinedRecipe.difficulty,
        calories: refinedRecipe.calories,
        protein: refinedRecipe.protein,
        carbs: refinedRecipe.carbs,
        fats: refinedRecipe.fats,
        fiber: refinedRecipe.fiber,
        sugar: refinedRecipe.sugar,
        sodium: refinedRecipe.sodium,
        cholesterol: refinedRecipe.cholesterol,
        ingredients: refinedRecipe.ingredients,
        instructions: refinedRecipe.instructions,
        equipment: refinedRecipe.equipment,
        tags: refinedRecipe.tags,
        generated_by_user_id: user.id,
        generation_prompt: `Refinement of recipe ${recipe_id}: ${refinement_request}`,
        ai_model: 'gpt-4o-mini',
      })
      .select()
      .single();

    if (recipeError) {
      console.error(`[refine-recipe] Error storing refined recipe:`, recipeError);
      throw new Error(`Failed to store refined recipe: ${recipeError.message}`);
    }

    console.log(`[refine-recipe] Stored refined recipe: ${insertedRecipe.id}`);

    // Link refined recipe to user in user_recipes table (automatically saved)
    const { error: linkError } = await supabase.from('user_recipes').insert({
      user_id: user.id,
      recipe_id: insertedRecipe.id,
      is_favorite: false,
      is_saved: true,
      notes: `Refined from original recipe. Request: ${refinement_request}`,
    });

    if (linkError) {
      console.error(`[refine-recipe] Error linking refined recipe:`, linkError);
      // Non-fatal error - continue
    }

    // Log refinement to generation_logs table
    const { error: logError } = await supabase.from('generation_logs').insert({
      user_id: user.id,
      meal_type: original_recipe.meal_type,
      success: true,
      ai_model: 'gpt-4o-mini',
      estimated_cost: estimatedCost,
      token_count: totalTokens,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    });

    if (logError) {
      console.error('[refine-recipe] Error logging refinement:', logError);
      // Non-fatal error - continue
    }

    console.log(`[refine-recipe] Refinement completed successfully`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        recipe: insertedRecipe,
        metadata: {
          original_recipe_id: recipe_id,
          tokens_used: totalTokens,
          estimated_cost: estimatedCost,
          refinement_time: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[refine-recipe] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
