import { supabase } from '../auth/supabase';
import { AuthService } from '../auth/authService';
import { ENV } from '../../config/env';

export interface UserStats {
  currentStreak: number;
  bestStreak: number;
  lastGenerationDate: string | null;
  recipeCompletions: number;
}

export interface UserAchievement {
  achievementId: string;
  munchiesAwarded: number;
  unlockedAt: string;
}

export interface ProgressData {
  stats: UserStats;
  totalRecipesGenerated: number;
  totalRecipesSaved: number;
  unlockedAchievements: string[];
}

export interface NewAchievement {
  id: string;
  title: string;
  munchies: number;
}

export interface CheckAchievementsResult {
  success: boolean;
  newAchievements: NewAchievement[];
  totalMunchiesAwarded: number;
}

export class ProgressService {
  /**
   * Get user progress data from Supabase
   */
  static async getUserProgress(userId: string): Promise<ProgressData | null> {
    try {
      // Fetch user stats
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      // If no stats exist yet, create default record
      let userStats: UserStats;
      if (statsError && statsError.code === 'PGRST116') {
        // No record found, will use defaults
        userStats = {
          currentStreak: 0,
          bestStreak: 0,
          lastGenerationDate: null,
          recipeCompletions: 0,
        };
      } else if (statsError) {
        console.error('[ProgressService] Error fetching stats:', statsError);
        throw statsError;
      } else {
        userStats = {
          currentStreak: stats.current_streak,
          bestStreak: stats.best_streak,
          lastGenerationDate: stats.last_generation_date,
          recipeCompletions: stats.recipe_completions,
        };
      }

      // Count total recipes generated (from generation_logs)
      const { count: totalGenerated, error: genError } = await supabase
        .from('generation_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('success', true);

      if (genError) {
        console.error('[ProgressService] Error counting generations:', genError);
      }

      // Count saved recipes (from user_recipes)
      const { count: totalSaved, error: savedError } = await supabase
        .from('user_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (savedError) {
        console.error('[ProgressService] Error counting saved recipes:', savedError);
      }

      // Get unlocked achievements
      const { data: achievements, error: achError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId);

      if (achError) {
        console.error('[ProgressService] Error fetching achievements:', achError);
      }

      return {
        stats: userStats,
        totalRecipesGenerated: totalGenerated || 0,
        totalRecipesSaved: totalSaved || 0,
        unlockedAchievements: achievements?.map(a => a.achievement_id) || [],
      };
    } catch (error) {
      console.error('[ProgressService] Error getting user progress:', error);
      return null;
    }
  }

  /**
   * Record a recipe completion (user finished cooking flow)
   */
  static async recordRecipeCompletion(userId: string): Promise<boolean> {
    try {
      // First check if user_stats record exists
      const { data: existing, error: checkError } = await supabase
        .from('user_stats')
        .select('recipe_completions')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // No record exists, create one with 1 completion
        const { error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            recipe_completions: 1,
            current_streak: 0,
            best_streak: 0,
          });

        if (insertError) {
          console.error('[ProgressService] Error creating stats:', insertError);
          return false;
        }
      } else if (checkError) {
        console.error('[ProgressService] Error checking stats:', checkError);
        return false;
      } else {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_stats')
          .update({
            recipe_completions: (existing?.recipe_completions || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('[ProgressService] Error updating completions:', updateError);
          return false;
        }
      }

      console.log('[ProgressService] Recipe completion recorded for user:', userId);
      return true;
    } catch (error) {
      console.error('[ProgressService] Error recording completion:', error);
      return false;
    }
  }

  /**
   * Check and unlock any new achievements, awarding Munchies
   */
  static async checkAchievements(): Promise<CheckAchievementsResult | null> {
    try {
      const session = await AuthService.getCurrentSession();
      if (!session) {
        console.error('[ProgressService] No session for checking achievements');
        return null;
      }

      const url = `${ENV.SUPABASE_URL}/functions/v1/check-achievements`;
      const accessToken = session.tokens?.accessToken;

      if (!accessToken) {
        console.error('[ProgressService] No access token available');
        return null;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'apikey': ENV.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[ProgressService] Achievement check failed:', data.error || data);
        return null;
      }

      return data as CheckAchievementsResult;
    } catch (error) {
      console.error('[ProgressService] Error checking achievements:', error);
      return null;
    }
  }

  /**
   * Check if user's streak needs to be reset (call on app open)
   */
  static async checkStreakReset(userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('check_streak_reset', {
        p_user_id: userId,
      });

      if (error) {
        console.error('[ProgressService] Error checking streak reset:', error);
      }
    } catch (error) {
      console.error('[ProgressService] Error in streak reset check:', error);
    }
  }

  /**
   * Format hours saved for display (e.g., "2h 30min")
   */
  static formatHoursSaved(recipeCount: number): string {
    const totalMinutes = recipeCount * 15; // 15 minutes saved per recipe
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}min`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }

  /**
   * Calculate money saved (rough estimate based on eating out)
   */
  static calculateMoneySaved(recipeCompletions: number): number {
    // $25 saved per recipe completion vs eating out
    return recipeCompletions * 25;
  }
}
