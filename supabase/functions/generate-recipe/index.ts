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
    const userPreferences: UserPreferences = {
      dietaryRestrictions: profile.dietary_restrictions || [],
      allergens: profile.allergens || [],
      cuisinePreferences: profile.cuisine_preferences || [],
      goals: profile.goals || [],
      equipment: profile.equipment || [],
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

    // Store recipes in database
    const storedRecipes = [];

    for (let i = 0; i < recipeResponse.recipes.length; i++) {
      const recipe = recipeResponse.recipes[i];

      // Insert recipe into recipes table
      const { data: insertedRecipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          title: recipe.title,
          description: recipe.description,
          emoji: recipe.emoji,
          meal_type: meal_type,
          prep_time: recipe.prep_time,
          cook_time: recipe.cook_time,
          total_time: recipe.total_time,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fats: recipe.fats,
          fiber: recipe.fiber,
          sugar: recipe.sugar,
          sodium: recipe.sodium,
          cholesterol: recipe.cholesterol,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          equipment: recipe.equipment,
          tags: recipe.tags,
          generated_by_user_id: user.id,
          ai_model: 'gpt-4o-mini',
        })
        .select()
        .single();

      if (recipeError) {
        console.error(`[generate-recipe] Error storing recipe ${i + 1}:`, recipeError);
        throw new Error(`Failed to store recipe: ${recipeError.message}`);
      }

      console.log(`[generate-recipe] Stored recipe ${i + 1}: ${recipe.title}`);

      // Link recipe to user in user_recipes table
      const { error: linkError } = await supabase.from('user_recipes').insert({
        user_id: user.id,
        recipe_id: insertedRecipe.id,
        is_favorite: false,
      });

      if (linkError) {
        console.error(`[generate-recipe] Error linking recipe ${i + 1}:`, linkError);
        // Non-fatal error - continue
      }

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
