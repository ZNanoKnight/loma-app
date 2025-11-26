import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Achievement definitions with their requirements and rewards
const ACHIEVEMENTS = {
  // Recipe Generation achievements
  recipe_1: { type: 'recipes', target: 1, munchies: 1, title: 'First Bite' },
  recipe_5: { type: 'recipes', target: 5, munchies: 1, title: 'Curious Cook' },
  recipe_15: { type: 'recipes', target: 15, munchies: 1, title: 'Recipe Enthusiast' },
  recipe_30: { type: 'recipes', target: 30, munchies: 2, title: 'Kitchen Adventurer' },
  recipe_50: { type: 'recipes', target: 50, munchies: 2, title: 'Recipe Collector' },
  recipe_75: { type: 'recipes', target: 75, munchies: 2, title: 'Culinary Explorer' },
  recipe_100: { type: 'recipes', target: 100, munchies: 3, title: 'Recipe Master' },
  recipe_150: { type: 'recipes', target: 150, munchies: 3, title: 'Kitchen Wizard' },
  recipe_250: { type: 'recipes', target: 250, munchies: 3, title: 'Recipe Genius' },
  recipe_500: { type: 'recipes', target: 500, munchies: 3, title: 'Loma Legend' },

  // Streak achievements
  streak_1: { type: 'streak', target: 1, munchies: 1, title: 'Day Starter' },
  streak_2: { type: 'streak', target: 2, munchies: 1, title: 'Double Day' },
  streak_3: { type: 'streak', target: 3, munchies: 1, title: 'Three Day Rush' },
  streak_5: { type: 'streak', target: 5, munchies: 2, title: 'Five Day Focus' },
  streak_7: { type: 'streak', target: 7, munchies: 2, title: 'Week Streak' },
  streak_10: { type: 'streak', target: 10, munchies: 2, title: 'Ten Day Titan' },
  streak_14: { type: 'streak', target: 14, munchies: 3, title: 'Two Week Wonder' },
  streak_20: { type: 'streak', target: 20, munchies: 3, title: 'Twenty Day Champion' },
  streak_30: { type: 'streak', target: 30, munchies: 3, title: 'Monthly Streak' },
  streak_60: { type: 'streak', target: 60, munchies: 3, title: 'Unstoppable' },

  // Cooking completion achievements
  cooked_1: { type: 'cooked', target: 1, munchies: 1, title: 'First Meal Made' },
  cooked_3: { type: 'cooked', target: 3, munchies: 1, title: 'Getting Started' },
  cooked_10: { type: 'cooked', target: 10, munchies: 1, title: 'Home Chef' },
  cooked_20: { type: 'cooked', target: 20, munchies: 2, title: 'Kitchen Regular' },
  cooked_35: { type: 'cooked', target: 35, munchies: 2, title: 'Meal Master' },
  cooked_50: { type: 'cooked', target: 50, munchies: 2, title: 'Cooking Champion' },
  cooked_75: { type: 'cooked', target: 75, munchies: 3, title: 'Culinary Expert' },
  cooked_100: { type: 'cooked', target: 100, munchies: 3, title: 'Kitchen Veteran' },
  cooked_150: { type: 'cooked', target: 150, munchies: 3, title: 'Master Chef' },
  cooked_250: { type: 'cooked', target: 250, munchies: 3, title: 'Loma Chef Legend' },
} as const;

type AchievementId = keyof typeof ACHIEVEMENTS;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check for Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the JWT token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized: ' + (authError?.message || 'Invalid token'))
    }

    // Get user stats
    const { data: userStats } = await supabaseAdmin
      .from('user_stats')
      .select('current_streak, best_streak, recipe_completions')
      .eq('user_id', user.id)
      .single()

    // Get total recipes generated (count from generation_logs)
    const { count: totalRecipes } = await supabaseAdmin
      .from('generation_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('success', true)

    // Get already unlocked achievements
    const { data: unlockedAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id)

    const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || [])

    // Calculate current values
    const currentStreak = userStats?.current_streak || 0
    const bestStreak = userStats?.best_streak || 0
    const recipeCompletions = userStats?.recipe_completions || 0
    const recipesGenerated = totalRecipes || 0

    // Use the higher of current or best streak for achievements
    const effectiveStreak = Math.max(currentStreak, bestStreak)

    // Check which achievements should be unlocked
    const newlyUnlocked: { id: AchievementId; munchies: number; title: string }[] = []

    for (const [achievementId, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip if already unlocked
      if (unlockedIds.has(achievementId)) {
        continue
      }

      let earned = false
      switch (achievement.type) {
        case 'recipes':
          earned = recipesGenerated >= achievement.target
          break
        case 'streak':
          earned = effectiveStreak >= achievement.target
          break
        case 'cooked':
          earned = recipeCompletions >= achievement.target
          break
      }

      if (earned) {
        newlyUnlocked.push({
          id: achievementId as AchievementId,
          munchies: achievement.munchies,
          title: achievement.title,
        })
      }
    }

    // If no new achievements, return early
    if (newlyUnlocked.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          newAchievements: [],
          totalMunchiesAwarded: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Insert new achievements
    const achievementInserts = newlyUnlocked.map(a => ({
      user_id: user.id,
      achievement_id: a.id,
      munchies_awarded: a.munchies,
    }))

    const { error: insertError } = await supabaseAdmin
      .from('user_achievements')
      .insert(achievementInserts)

    if (insertError) {
      console.error('Error inserting achievements:', insertError)
      throw new Error('Failed to save achievements')
    }

    // Calculate total munchies to award
    const totalMunchies = newlyUnlocked.reduce((sum, a) => sum + a.munchies, 0)

    // Award munchies (add to tokens_balance)
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('tokens_balance')
      .eq('user_id', user.id)
      .single()

    if (subError || !subscription) {
      console.error('Error getting subscription:', subError)
      // Don't fail the whole request, achievements are still saved
    } else {
      const { error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          tokens_balance: subscription.tokens_balance + totalMunchies,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Error updating tokens:', updateError)
      }
    }

    console.log(`User ${user.id} unlocked ${newlyUnlocked.length} achievements, awarded ${totalMunchies} munchies`)

    return new Response(
      JSON.stringify({
        success: true,
        newAchievements: newlyUnlocked.map(a => ({
          id: a.id,
          title: a.title,
          munchies: a.munchies,
        })),
        totalMunchiesAwarded: totalMunchies,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in check-achievements:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
