import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();

  const stats = {
    currentStreak: userData.currentStreak,
    longestStreak: 14, // Keep as mock for now (would need separate tracking)
    totalRecipes: userData.totalRecipes,
    hoursSaved: userData.hoursSaved,
    moneySaved: userData.moneySaved,
    weeklyGoal: 5,
    weeklyComplete: userData.weeklyProgress.filter(day => day).length,
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekProgress = userData.weeklyProgress;

  // Get all achievements based on user data
  const allAchievements = [
    // Recipe Explorer
    { id: 'recipe_1', icon: '📖', title: 'First Bite', description: 'Generate your first recipe', earned: userData.totalRecipes >= 1, munchies: 1 },
    { id: 'recipe_5', icon: '📖', title: 'Curious Cook', description: 'Generate 5 recipes', earned: userData.totalRecipes >= 5, munchies: 1 },
    { id: 'recipe_15', icon: '📖', title: 'Recipe Enthusiast', description: 'Generate 15 recipes', earned: userData.totalRecipes >= 15, munchies: 1 },
    { id: 'recipe_30', icon: '📖', title: 'Kitchen Adventurer', description: 'Generate 30 recipes', earned: userData.totalRecipes >= 30, munchies: 2 },
    // Streak Master
    { id: 'streak_1', icon: '🔥', title: 'Day Starter', description: 'Generate a recipe today', earned: userData.currentStreak >= 1, munchies: 1 },
    { id: 'streak_2', icon: '🔥', title: 'Double Day', description: 'Generate recipes 2 days in a row', earned: userData.currentStreak >= 2, munchies: 1 },
    { id: 'streak_3', icon: '🔥', title: 'Three Day Rush', description: 'Generate recipes 3 days in a row', earned: userData.currentStreak >= 3, munchies: 1 },
    { id: 'streak_7', icon: '🔥', title: 'Week Streak', description: 'Generate recipes 7 days in a row', earned: userData.currentStreak >= 7, munchies: 2 },
  ];

  // Show only first 4 completed achievements
  const completedAchievements = allAchievements.filter(a => a.earned).slice(0, 4);

  const handleViewAllAchievements = () => {
    navigation.navigate('AllAchievements');
  };

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

            {/* Lifetime Stats - NOW AT TOP */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Lifetime Stats</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{stats.totalRecipes}</Text>
                  <Text style={styles.summaryLabel}>Recipes Cooked</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{stats.hoursSaved}</Text>
                  <Text style={styles.summaryLabel}>Hours Saved</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>${stats.moneySaved}</Text>
                  <Text style={styles.summaryLabel}>Money Saved</Text>
                </View>
              </View>
            </View>

            {/* Streak Card - NOW IN BOX FORMAT */}
            <View style={styles.streakCard}>
              <Text style={styles.cardTitle}>Streak</Text>
              <Text style={styles.cardSubtitle}>
                Number of days in a row where you generated a recipe
              </Text>
              <View style={styles.streakHeader}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
                  <Text style={styles.streakLabel}>Day Streak</Text>
                </View>
                <View style={styles.streakDivider} />
                <View style={styles.streakInfo}>
                  <Text style={styles.streakNumber}>{stats.longestStreak}</Text>
                  <Text style={styles.streakLabel}>Best Streak</Text>
                </View>
              </View>

              {/* Week Grid */}
              <View style={styles.weekGrid}>
                {weekDays.map((day, index) => (
                  <View key={index} style={styles.dayColumn}>
                    <View style={[
                      styles.dayCircle,
                      weekProgress[index] && styles.dayCircleActive
                    ]}>
                      {weekProgress[index] && <Text style={styles.dayCheck}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.dayLabel,
                      weekProgress[index] && styles.dayLabelActive
                    ]}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.streakMessage}>
                {stats.weeklyComplete} of {stats.weeklyGoal} days this week
              </Text>
            </View>

            {/* Achievements */}
            <View style={styles.achievementsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Achievements</Text>
                <TouchableOpacity onPress={handleViewAllAchievements}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.achievementsGrid}>
                {completedAchievements.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    style={styles.achievementItem}
                  >
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementMunchies}>+{achievement.munchies} Munchie{achievement.munchies > 1 ? 's' : ''}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 16,
    fontFamily: 'Quicksand-Regular',
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
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayCircleActive: {
    backgroundColor: '#10B981',
  },
  dayCheck: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
  },
  dayLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Regular',
  },
  dayLabelActive: {
    color: '#10B981',
    fontFamily: 'Quicksand-SemiBold',
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
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
    fontFamily: 'Quicksand-Regular',
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
});
