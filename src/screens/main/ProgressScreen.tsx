import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../../services/auth/authService';
import { ProgressService, ProgressData } from '../../services/progress/progressService';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  const loadProgressData = useCallback(async () => {
    try {
      const session = await AuthService.getCurrentSession();
      if (!session) {
        console.log('[ProgressScreen] No session found');
        setIsLoading(false);
        return;
      }

      // Check if streak needs to be reset (user opened app after missing a day)
      await ProgressService.checkStreakReset(session.user.id);

      // Fetch progress data
      const data = await ProgressService.getUserProgress(session.user.id);
      setProgressData(data);

      // Check for any new achievements to unlock
      const achievementResult = await ProgressService.checkAchievements();
      if (achievementResult?.newAchievements.length) {
        console.log('[ProgressScreen] New achievements unlocked:', achievementResult.newAchievements);
        // Refresh data after unlocking achievements
        const updatedData = await ProgressService.getUserProgress(session.user.id);
        setProgressData(updatedData);
      }
    } catch (error) {
      console.error('[ProgressScreen] Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      loadProgressData();
    }, [loadProgressData])
  );

  // Calculate display values
  const currentStreak = progressData?.stats.currentStreak || 0;
  const bestStreak = progressData?.stats.bestStreak || 0;
  const totalRecipesSaved = progressData?.totalRecipesSaved || 0;
  const recipeCompletions = progressData?.stats.recipeCompletions || 0;
  const totalRecipesGenerated = progressData?.totalRecipesGenerated || 0;
  const unlockedAchievements = progressData?.unlockedAchievements || [];

  // Use total saved recipes for "Recipes Cooked" display
  const hoursSaved = ProgressService.formatHoursSaved(totalRecipesSaved);
  const moneySaved = ProgressService.calculateMoneySaved(recipeCompletions);

  // Get all achievements based on real data
  const allAchievements = [
    // Recipe Generation achievements
    { id: 'recipe_1', icon: '📖', title: 'First Bite', description: 'Generate your first recipe', earned: totalRecipesGenerated >= 1, munchies: 1 },
    { id: 'recipe_5', icon: '📖', title: 'Curious Cook', description: 'Generate 5 recipes', earned: totalRecipesGenerated >= 5, munchies: 1 },
    { id: 'recipe_15', icon: '📖', title: 'Recipe Enthusiast', description: 'Generate 15 recipes', earned: totalRecipesGenerated >= 15, munchies: 1 },
    { id: 'recipe_30', icon: '📖', title: 'Kitchen Adventurer', description: 'Generate 30 recipes', earned: totalRecipesGenerated >= 30, munchies: 2 },
    // Streak achievements (use the higher of current or best streak)
    { id: 'streak_1', icon: '🔥', title: 'Day Starter', description: 'Generate a recipe today', earned: Math.max(currentStreak, bestStreak) >= 1, munchies: 1 },
    { id: 'streak_2', icon: '🔥', title: 'Double Day', description: 'Generate recipes 2 days in a row', earned: Math.max(currentStreak, bestStreak) >= 2, munchies: 1 },
    { id: 'streak_3', icon: '🔥', title: 'Three Day Rush', description: 'Generate recipes 3 days in a row', earned: Math.max(currentStreak, bestStreak) >= 3, munchies: 1 },
    { id: 'streak_7', icon: '🔥', title: 'Week Streak', description: 'Generate recipes 7 days in a row', earned: Math.max(currentStreak, bestStreak) >= 7, munchies: 2 },
  ];

  // Show only first 4 completed achievements (prioritize ones stored in DB)
  const completedAchievements = allAchievements
    .filter(a => unlockedAchievements.includes(a.id) || a.earned)
    .slice(0, 4);

  const handleViewAllAchievements = () => {
    navigation.navigate('AllAchievements');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
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
              <Text style={styles.headerTitle}>Your Progress</Text>
            </View>

            {/* Lifetime Stats */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Lifetime Stats</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{totalRecipesSaved}</Text>
                  <Text style={styles.summaryLabel}>Recipes Saved</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{hoursSaved}</Text>
                  <Text style={styles.summaryLabel}>Time Saved</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>${moneySaved}</Text>
                  <Text style={styles.summaryLabel}>Money Saved</Text>
                </View>
              </View>
            </View>

            {/* Streak Card - Simplified without weekly circles */}
            <View style={styles.streakCard}>
              <Text style={styles.cardTitle}>Streak</Text>
              <Text style={styles.cardSubtitle}>
                Number of days in a row where you generated a recipe
              </Text>
              <View style={styles.streakHeader}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakNumber}>{currentStreak}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakInfo}>
                  <Text style={styles.streakNumber}>{bestStreak}</Text>
                  <Text style={styles.streakLabel}>Best Streak</Text>
                </View>
              </View>
              {currentStreak > 0 && (
                <Text style={styles.streakMessage}>
                  Keep it up! Generate a recipe today to maintain your streak.
                </Text>
              )}
              {currentStreak === 0 && bestStreak > 0 && (
                <Text style={styles.streakMessage}>
                  Your best streak was {bestStreak} day{bestStreak > 1 ? 's' : ''}! Start a new streak today.
                </Text>
              )}
              {currentStreak === 0 && bestStreak === 0 && (
                <Text style={styles.streakMessage}>
                  Generate your first recipe to start a streak!
                </Text>
              )}
            </View>

            {/* Achievements */}
            <View style={styles.achievementsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Achievements</Text>
                <TouchableOpacity onPress={handleViewAllAchievements}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>

              {completedAchievements.length > 0 ? (
                <View style={styles.achievementsGrid}>
                  {completedAchievements.map((achievement) => (
                    <View
                      key={achievement.id}
                      style={styles.achievementItem}
                    >
                      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                      <Text style={styles.achievementTitle}>{achievement.title}</Text>
                      <Text style={styles.achievementMunchies}>+{achievement.munchies} Munchie{achievement.munchies > 1 ? 's' : ''}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noAchievements}>
                  <Text style={styles.noAchievementsText}>
                    Generate your first recipe to unlock achievements!
                  </Text>
                </View>
              )}
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
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: '#1F2937',
    fontFamily: 'Quicksand-Bold',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Quicksand-SemiBold',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    color: '#6B46C1',
    marginBottom: 4,
    fontFamily: 'Quicksand-Bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Quicksand-SemiBold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  streakInfo: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 28,
    color: '#1F2937',
    fontFamily: 'Quicksand-Bold',
  },
  streakLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  streakMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllLink: {
    color: '#6B46C1',
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementItem: {
    width: (width - 80 - 12) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'Quicksand-SemiBold',
  },
  achievementMunchies: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'Quicksand-SemiBold',
  },
  noAchievements: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noAchievementsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
});
