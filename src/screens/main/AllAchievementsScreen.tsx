import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../../services/auth/authService';
import { ProgressService, ProgressData } from '../../services/progress/progressService';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  target: number;
  munchies: number;
  earned: boolean;
}

export default function AllAchievementsScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  const loadProgressData = useCallback(async () => {
    try {
      const session = await AuthService.getCurrentSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const data = await ProgressService.getUserProgress(session.user.id);
      setProgressData(data);
    } catch (error) {
      console.error('[AllAchievementsScreen] Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadProgressData();
    }, [loadProgressData])
  );

  // Get data values
  const totalRecipesGenerated = progressData?.totalRecipesGenerated || 0;
  const currentStreak = progressData?.stats.currentStreak || 0;
  const bestStreak = progressData?.stats.bestStreak || 0;
  const recipeCompletions = progressData?.stats.recipeCompletions || 0;
  const unlockedAchievements = progressData?.unlockedAchievements || [];

  // Use the higher of current or best streak for streak achievements
  const effectiveStreak = Math.max(currentStreak, bestStreak);

  // Recipe Explorer achievements
  const recipeExplorerAchievements: Achievement[] = [
    { id: 'recipe_1', icon: '📖', title: 'First Bite', description: 'Generate your first recipe', target: 1, munchies: 1, earned: unlockedAchievements.includes('recipe_1') || totalRecipesGenerated >= 1 },
    { id: 'recipe_5', icon: '📖', title: 'Curious Cook', description: 'Generate 5 recipes', target: 5, munchies: 1, earned: unlockedAchievements.includes('recipe_5') || totalRecipesGenerated >= 5 },
    { id: 'recipe_15', icon: '📖', title: 'Recipe Enthusiast', description: 'Generate 15 recipes', target: 15, munchies: 1, earned: unlockedAchievements.includes('recipe_15') || totalRecipesGenerated >= 15 },
    { id: 'recipe_30', icon: '📖', title: 'Kitchen Adventurer', description: 'Generate 30 recipes', target: 30, munchies: 2, earned: unlockedAchievements.includes('recipe_30') || totalRecipesGenerated >= 30 },
    { id: 'recipe_50', icon: '📖', title: 'Recipe Collector', description: 'Generate 50 recipes', target: 50, munchies: 2, earned: unlockedAchievements.includes('recipe_50') || totalRecipesGenerated >= 50 },
    { id: 'recipe_75', icon: '📖', title: 'Culinary Explorer', description: 'Generate 75 recipes', target: 75, munchies: 2, earned: unlockedAchievements.includes('recipe_75') || totalRecipesGenerated >= 75 },
    { id: 'recipe_100', icon: '📖', title: 'Recipe Master', description: 'Generate 100 recipes', target: 100, munchies: 3, earned: unlockedAchievements.includes('recipe_100') || totalRecipesGenerated >= 100 },
    { id: 'recipe_150', icon: '📖', title: 'Kitchen Wizard', description: 'Generate 150 recipes', target: 150, munchies: 3, earned: unlockedAchievements.includes('recipe_150') || totalRecipesGenerated >= 150 },
    { id: 'recipe_250', icon: '📖', title: 'Recipe Genius', description: 'Generate 250 recipes', target: 250, munchies: 3, earned: unlockedAchievements.includes('recipe_250') || totalRecipesGenerated >= 250 },
    { id: 'recipe_500', icon: '📖', title: 'Loma Legend', description: 'Generate 500 recipes', target: 500, munchies: 3, earned: unlockedAchievements.includes('recipe_500') || totalRecipesGenerated >= 500 },
  ];

  // Streak Master achievements
  const streakMasterAchievements: Achievement[] = [
    { id: 'streak_1', icon: '🔥', title: 'Day Starter', description: 'Generate a recipe today', target: 1, munchies: 1, earned: unlockedAchievements.includes('streak_1') || effectiveStreak >= 1 },
    { id: 'streak_2', icon: '🔥', title: 'Double Day', description: 'Generate recipes 2 days in a row', target: 2, munchies: 1, earned: unlockedAchievements.includes('streak_2') || effectiveStreak >= 2 },
    { id: 'streak_3', icon: '🔥', title: 'Three Day Rush', description: 'Generate recipes 3 days in a row', target: 3, munchies: 1, earned: unlockedAchievements.includes('streak_3') || effectiveStreak >= 3 },
    { id: 'streak_5', icon: '🔥', title: 'Five Day Focus', description: 'Generate recipes 5 days in a row', target: 5, munchies: 2, earned: unlockedAchievements.includes('streak_5') || effectiveStreak >= 5 },
    { id: 'streak_7', icon: '🔥', title: 'Week Streak', description: 'Generate recipes 7 days in a row', target: 7, munchies: 2, earned: unlockedAchievements.includes('streak_7') || effectiveStreak >= 7 },
    { id: 'streak_10', icon: '🔥', title: 'Ten Day Titan', description: 'Generate recipes 10 days in a row', target: 10, munchies: 2, earned: unlockedAchievements.includes('streak_10') || effectiveStreak >= 10 },
    { id: 'streak_14', icon: '🔥', title: 'Two Week Wonder', description: 'Generate recipes 14 days in a row', target: 14, munchies: 3, earned: unlockedAchievements.includes('streak_14') || effectiveStreak >= 14 },
    { id: 'streak_20', icon: '🔥', title: 'Twenty Day Champion', description: 'Generate recipes 20 days in a row', target: 20, munchies: 3, earned: unlockedAchievements.includes('streak_20') || effectiveStreak >= 20 },
    { id: 'streak_30', icon: '🔥', title: 'Monthly Streak', description: 'Generate recipes 30 days in a row', target: 30, munchies: 3, earned: unlockedAchievements.includes('streak_30') || effectiveStreak >= 30 },
    { id: 'streak_60', icon: '🔥', title: 'Unstoppable', description: 'Generate recipes 60 days in a row', target: 60, munchies: 3, earned: unlockedAchievements.includes('streak_60') || effectiveStreak >= 60 },
  ];

  // Kitchen Conqueror achievements (for cooked recipes)
  const kitchenConquerorAchievements: Achievement[] = [
    { id: 'cooked_1', icon: '👨‍🍳', title: 'First Meal Made', description: 'Cook your first Loma recipe', target: 1, munchies: 1, earned: unlockedAchievements.includes('cooked_1') || recipeCompletions >= 1 },
    { id: 'cooked_3', icon: '👨‍🍳', title: 'Getting Started', description: 'Cook 3 Loma recipes', target: 3, munchies: 1, earned: unlockedAchievements.includes('cooked_3') || recipeCompletions >= 3 },
    { id: 'cooked_10', icon: '👨‍🍳', title: 'Home Chef', description: 'Cook 10 Loma recipes', target: 10, munchies: 1, earned: unlockedAchievements.includes('cooked_10') || recipeCompletions >= 10 },
    { id: 'cooked_20', icon: '👨‍🍳', title: 'Kitchen Regular', description: 'Cook 20 Loma recipes', target: 20, munchies: 2, earned: unlockedAchievements.includes('cooked_20') || recipeCompletions >= 20 },
    { id: 'cooked_35', icon: '👨‍🍳', title: 'Meal Master', description: 'Cook 35 Loma recipes', target: 35, munchies: 2, earned: unlockedAchievements.includes('cooked_35') || recipeCompletions >= 35 },
    { id: 'cooked_50', icon: '👨‍🍳', title: 'Cooking Champion', description: 'Cook 50 Loma recipes', target: 50, munchies: 2, earned: unlockedAchievements.includes('cooked_50') || recipeCompletions >= 50 },
    { id: 'cooked_75', icon: '👨‍🍳', title: 'Culinary Expert', description: 'Cook 75 Loma recipes', target: 75, munchies: 3, earned: unlockedAchievements.includes('cooked_75') || recipeCompletions >= 75 },
    { id: 'cooked_100', icon: '👨‍🍳', title: 'Kitchen Veteran', description: 'Cook 100 Loma recipes', target: 100, munchies: 3, earned: unlockedAchievements.includes('cooked_100') || recipeCompletions >= 100 },
    { id: 'cooked_150', icon: '👨‍🍳', title: 'Master Chef', description: 'Cook 150 Loma recipes', target: 150, munchies: 3, earned: unlockedAchievements.includes('cooked_150') || recipeCompletions >= 150 },
    { id: 'cooked_250', icon: '👨‍🍳', title: 'Loma Chef Legend', description: 'Cook 250 Loma recipes', target: 250, munchies: 3, earned: unlockedAchievements.includes('cooked_250') || recipeCompletions >= 250 },
  ];

  const renderAchievement = (achievement: Achievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        !achievement.earned && styles.achievementCardLocked
      ]}
    >
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <View style={styles.achievementContent}>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
      </View>
      <View style={styles.achievementReward}>
        {achievement.earned ? (
          <View style={styles.earnedBadge}>
            <Text style={styles.earnedText}>Earned</Text>
          </View>
        ) : (
          <Text style={styles.munchiesText}>
            +{achievement.munchies} Munchie{achievement.munchies > 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B4332" />
            <Text style={styles.loadingText}>Loading achievements...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>All Achievements</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Recipe Explorer */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>📖</Text>
              <Text style={styles.categoryTitle}>Recipe Explorer</Text>
            </View>
            <Text style={styles.categorySubtitle}>Recipe Generation Count ({totalRecipesGenerated} generated)</Text>
            {recipeExplorerAchievements.map(renderAchievement)}
          </View>

          {/* Streak Master */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>🔥</Text>
              <Text style={styles.categoryTitle}>Streak Master</Text>
            </View>
            <Text style={styles.categorySubtitle}>
              Consecutive Days (Current: {currentStreak}, Best: {bestStreak})
            </Text>
            {streakMasterAchievements.map(renderAchievement)}
          </View>

          {/* Kitchen Conqueror */}
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>👨‍🍳</Text>
              <Text style={styles.categoryTitle}>Kitchen Conqueror</Text>
            </View>
            <Text style={styles.categorySubtitle}>Cooking Completions ({recipeCompletions} cooked)</Text>
            {kitchenConquerorAchievements.map(renderAchievement)}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#1F2937',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    color: '#1B4332',
    fontFamily: 'PTSerif-Bold',
  },
  placeholder: {
    width: 40,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 20,
    color: '#1F2937',
    fontFamily: 'Quicksand-Bold',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    marginLeft: 32,
    fontFamily: 'Quicksand-Regular',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Quicksand-Bold',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  achievementReward: {
    alignItems: 'flex-end',
  },
  earnedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  earnedText: {
    fontSize: 13,
    color: '#40916C',
    fontFamily: 'Quicksand-Bold',
  },
  munchiesText: {
    fontSize: 13,
    color: '#1B4332',
    fontFamily: 'Quicksand-Bold',
  },
});
