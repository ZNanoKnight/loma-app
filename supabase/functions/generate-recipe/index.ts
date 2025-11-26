import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import {
  buildSystemPrompt,
  buildUserPrompt,
  RECIPE_RESPONSE_SCHEMA,
  type GenerateRecipeRequest,
  type UserPreferences,
} from './prompt-template.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecipeResponse {
  recipes: any[];
}

interface GenerationLog {
  user_id: string;
  meal_type: string;
  success: boolean;
  error_message?: string;
  ai_model: string;
  estimated_cost: number;
  token_count: number;
  prompt_tokens: number;
  completion_tokens: number;
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

    console.log(`[generate-recipe] Request from user: ${user.id}`);

    // Parse request body
    const requestData: GenerateRecipeRequest = await req.json();
    const { meal_type, custom_request } = requestData;

    if (!meal_type) {
      throw new Error('meal_type is required');
    }

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal_type)) {
      throw new Error('Invalid meal_type. Must be: breakfast, lunch, dinner, or snack');
    }

    console.log(`[generate-recipe] Generating ${meal_type} recipes`);

    // Fetch user profile to get preferences
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('[generate-recipe] Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    console.log(`[generate-recipe] User profile fetched successfully`);

    // Build user preferences from profile
    // Ensure all array fields are actually arrays (database might return null or non-array values)
    const ensureArray = (value: any): string[] => {
      if (Array.isArray(value)) return value;
      if (value === null || value === undefined) return [];
      return [];
    };

    const userPreferences: UserPreferences = {
      dietaryRestrictions: ensureArray(profile.dietary_restrictions),
      allergens: ensureArray(profile.allergens),
      cuisinePreferences: [], // Deprecated - no longer stored in database
      goals: ensureArray(profile.goals),
      equipment: ensureArray(profile.equipment),
      cookingSkillLevel: profile.cooking_skill_level || 'intermediate',
      preferredPrepTime: profile.preferred_prep_time,
    };

    // Build prompts
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt({
      meal_type,
      user_preferences: userPreferences,
      custom_request,
    });

    console.log(`[generate-recipe] Prompts built. Calling OpenAI API...`);

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
        temperature: 0.8, // Slightly creative for variety
        max_tokens: 4000, // Enough for 4 detailed recipes
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('[generate-recipe] OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status} ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log(`[generate-recipe] OpenAI API response received`);

    // Extract usage data for cost calculation
    const usage = openaiData.usage;
    const promptTokens = usage.prompt_tokens;
    const completionTokens = usage.completion_tokens;
    const totalTokens = usage.total_tokens;

    // Calculate cost (GPT-4o-mini pricing)
    // Input: $0.15 per 1M tokens
    // Output: $0.60 per 1M tokens
    const inputCost = (promptTokens / 1_000_000) * 0.15;
    const outputCost = (completionTokens / 1_000_000) * 0.60;
    const estimatedCost = inputCost + outputCost;

    console.log(`[generate-recipe] Token usage: ${totalTokens} tokens, estimated cost: $${estimatedCost.toFixed(6)}`);

    // Parse AI response
    const aiContent = openaiData.choices[0].message.content;
    let recipeResponse: RecipeResponse;

    try {
      recipeResponse = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('[generate-recipe] Failed to parse AI response:', aiContent);
      throw new Error('AI returned invalid JSON response');
    }

    // Validate response structure
    if (!recipeResponse.recipes || !Array.isArray(recipeResponse.recipes)) {
      console.error('[generate-recipe] Invalid response structure:', recipeResponse);
      throw new Error('AI response missing recipes array');
    }

    if (recipeResponse.recipes.length !== 4) {
      console.error(`[generate-recipe] Expected 4 recipes, got ${recipeResponse.recipes.length}`);
      throw new Error(`AI returned ${recipeResponse.recipes.length} recipes instead of 4`);
    }

    console.log(`[generate-recipe] Successfully parsed ${recipeResponse.recipes.length} recipes`);

    // Debug: Log the first recipe structure from AI
    console.log(`[generate-recipe] AI recipe structure sample:`, JSON.stringify(recipeResponse.recipes[0], null, 2));

    // Helper function to parse numeric values from AI response
    // AI might return "5 minutes" instead of 5, or strings instead of numbers
    const parseNumber = (value: any, defaultValue: number = 0): number => {
      if (typeof value === 'number') return Math.round(value);
      if (typeof value === 'string') {
        // Extract first number from string (e.g., "5 minutes" -> 5)
        const match = value.match(/[\d.]+/);
        if (match) return Math.round(parseFloat(match[0]));
      }
      return defaultValue;
    };

    // Helper to normalize ingredients from AI response
    const normalizeIngredients = (ingredients: any[]): any[] => {
      if (!Array.isArray(ingredients)) return [];
      return ingredients.map((ing, idx) => {
        // Handle various formats AI might return
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
          parsedAmount = parseNumber(amount, 1);
        }

        return {
          name: ing.name || ing.ingredient || 'Unknown ingredient',
          amount: parsedAmount,
          unit: unit,
          notes: ing.notes || ing.preparation || undefined,
        };
      });
    };

    // Helper to normalize instructions from AI response
    const normalizeInstructions = (instructions: any[]): any[] => {
      if (!Array.isArray(instructions)) return [];
      return instructions.map((inst, idx) => {
        // If it's just a string, wrap it
        if (typeof inst === 'string') {
          return { step_number: idx + 1, instruction: inst };
        }
        return {
          step_number: inst.step_number ?? inst.stepNumber ?? idx + 1,
          instruction: inst.instruction ?? inst.step ?? inst.text ?? String(inst),
          time_minutes: inst.time_minutes ?? inst.timeMinutes ?? undefined,
        };
      });
    };

    // Helper to normalize equipment from AI response
    const normalizeEquipment = (equipment: any[]): any[] => {
      if (!Array.isArray(equipment)) return [];
      return equipment.map((eq) => {
        if (typeof eq === 'string') {
          return { name: eq, optional: false };
        }
        return {
          name: eq.name || String(eq),
          optional: eq.optional ?? false,
        };
      });
    };

    // Store recipes in database
    const storedRecipes = [];

    for (let i = 0; i < recipeResponse.recipes.length; i++) {
      const recipe = recipeResponse.recipes[i];

      // Sanitize numeric fields from AI response
      // Try both snake_case and camelCase field names
      const sanitizedRecipe = {
        title: String(recipe.title || 'Untitled Recipe').slice(0, 60),
        description: String(recipe.description || '').slice(0, 200),
        emoji: String(recipe.emoji || '🍽️').slice(0, 4),
        meal_type: meal_type,
        prep_time: parseNumber(recipe.prep_time ?? recipe.prepTime),
        cook_time: parseNumber(recipe.cook_time ?? recipe.cookTime),
        total_time: parseNumber(recipe.total_time ?? recipe.totalTime),
        servings: parseNumber(recipe.servings, 1),
        difficulty: String(recipe.difficulty || 'medium'),
        calories: parseNumber(recipe.calories),
        protein: parseNumber(recipe.protein),
        carbs: parseNumber(recipe.carbs),
        fats: parseNumber(recipe.fats),
        fiber: parseNumber(recipe.fiber),
        sugar: parseNumber(recipe.sugar),
        sodium: parseNumber(recipe.sodium),
        cholesterol: parseNumber(recipe.cholesterol),
        ingredients: normalizeIngredients(recipe.ingredients),
        instructions: normalizeInstructions(recipe.instructions),
        equipment: normalizeEquipment(recipe.equipment),
        tags: Array.isArray(recipe.tags) ? recipe.tags : [],
        generated_by_user_id: user.id,
        ai_model: 'gpt-4o-mini',
      };

      // Debug: Log sanitized recipe
      console.log(`[generate-recipe] Sanitized recipe ${i + 1}:`, JSON.stringify({
        title: sanitizedRecipe.title,
        prep_time: sanitizedRecipe.prep_time,
        calories: sanitizedRecipe.calories,
        ingredientCount: sanitizedRecipe.ingredients.length,
        instructionCount: sanitizedRecipe.instructions.length,
      }));

      // Insert recipe into recipes table
      const { data: insertedRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert(sanitizedRecipe)
        .select()
        .single();

      if (recipeError) {
        console.error(`[generate-recipe] Error storing recipe ${i + 1}:`, recipeError);
        throw new Error(`Failed to store recipe: ${recipeError.message}`);
      }

      console.log(`[generate-recipe] Stored recipe ${i + 1}: ${recipe.title}`);

      // Note: We do NOT add to user_recipes here.
      // Recipes are only added to user_recipes when the user explicitly saves them
      // via the "Save to Recipe Book" button on RecipeReviewScreen.
      // This prevents all 4 generated options from appearing in the user's Recipe Book.

      storedRecipes.push(insertedRecipe);
    }

    console.log(`[generate-recipe] All ${storedRecipes.length} recipes stored successfully`);

    // Log generation to generation_logs table for cost monitoring
    const generationLog: GenerationLog = {
      user_id: user.id,
      meal_type: meal_type,
      success: true,
      ai_model: 'gpt-4o-mini',
      estimated_cost: estimatedCost,
      token_count: totalTokens,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
    };

    const { error: logError } = await supabase.from('generation_logs').insert(generationLog);

    if (logError) {
      console.error('[generate-recipe] Error logging generation:', logError);
      // Non-fatal error - continue
    }

    console.log(`[generate-recipe] Generation logged successfully`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        recipes: storedRecipes,
        metadata: {
          tokens_used: totalTokens,
          estimated_cost: estimatedCost,
          generation_time: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[generate-recipe] Error:', error);

    // Log failed generation attempt
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const {
          data: { user },
        } = await supabase.auth.getUser(token);

        if (user) {
          const requestData = await req.json();
          const meal_type = requestData?.meal_type || 'unknown';

          await supabase.from('generation_logs').insert({
            user_id: user.id,
            meal_type: meal_type,
            success: false,
            error_message: error.message || 'Unknown error',
            ai_model: 'gpt-4o-mini',
            estimated_cost: 0,
            token_count: 0,
            prompt_tokens: 0,
            completion_tokens: 0,
          });
        }
      }
    } catch (logError) {
      console.error('[generate-recipe] Error logging failure:', logError);
    }

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
