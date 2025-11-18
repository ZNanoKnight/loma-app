import React, { useState } from 'react';
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
import { useUser } from '../../context/UserContext';  // ADD THIS

const { width } = Dimensions.get('window');

type TimeRange = 'week' | 'month' | 'year';

export default function ProgressScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();  // ADD THIS
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');

  // Use real data from global state where available
  const currentWeight = parseFloat(userData.weight) || 175;
  const monthlyWeightData = [
    { week: 'Week 1', value: currentWeight },
    { week: 'Week 2', value: currentWeight - 0.5 },
    { week: 'Week 3', value: currentWeight - 1.2 },
    { week: 'Week 4', value: currentWeight - 1.8 },
  ];

  // Calculate min/max for proper scaling
  const weightValues = monthlyWeightData.map(point => point.value);
  const maxWeight = Math.max(...weightValues);
  const minWeight = Math.min(...weightValues);
  const weightRange = maxWeight - minWeight || 5; // Use a minimum range of 5 to avoid division issues

  const stats = {
    currentStreak: userData.currentStreak,  // MODIFIED - real data
    longestStreak: 14,  // Keep as mock for now (would need separate tracking)
    totalRecipes: userData.totalRecipes,  // MODIFIED - real data
    caloriesAvg: parseInt(userData.targetCalories) || 485,  // MODIFIED - use target
    proteinAvg: parseInt(userData.targetProtein) || 38,  // MODIFIED - use target
    carbsAvg: 42,  // Keep as mock
    fatsAvg: 18,  // Keep as mock
    weeklyGoal: 5,
    weeklyComplete: userData.weeklyProgress.filter(day => day).length,  // MODIFIED - count true days
    monthlyWeight: monthlyWeightData
  };

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekProgress = userData.weeklyProgress;  // MODIFIED - use real weekly progress
  
  const achievements = [
    { id: '1', icon: '🔥', title: '7 Day Streak', description: 'Cook for a week', earned: userData.currentStreak >= 7, date: 'Jan 15' },  // MODIFIED
    { id: '2', icon: '👨‍🍳', title: 'Master Chef', description: '50 recipes cooked', earned: userData.totalRecipes >= 50, progress: userData.totalRecipes, total: 50 },  // MODIFIED
    { id: '3', icon: '💪', title: 'Protein Pro', description: 'Hit protein goals 7 days', earned: true, date: 'Jan 10' },
    { id: '4', icon: '🎯', title: 'Goal Getter', description: 'Complete weekly goals 4 times', earned: false, progress: 3, total: 4 },
  ];

  const goals = [
    { id: '1', type: 'Weight Loss', current: parseFloat(userData.weight) || 173.2, target: parseFloat(userData.targetWeight) || 170, unit: 'lbs', progress: 68 },  // MODIFIED
    { id: '2', type: 'Protein Daily', current: parseInt(userData.targetProtein) || 38, target: 45, unit: 'g', progress: 84 },  // MODIFIED
    { id: '3', type: 'Cook Frequency', current: userData.weeklyProgress.filter(day => day).length, target: 5, unit: '/week', progress: 80 },  // MODIFIED
  ];

  const handleWeeklyCheckIn = () => {
    navigation.navigate('WeeklyCheckIn');
  };

  const renderProgressBar = (progress: number) => (
    <View style={styles.progressBar}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
  );

  const renderMacroRing = (value: number, max: number, color: string) => {
    const percentage = (value / max) * 100;
    const strokeDasharray = `${percentage} ${100 - percentage}`;
    
    return (
      <View style={styles.macroRing}>
        <View style={[styles.macroRingFill, { 
          backgroundColor: color,
          opacity: 0.2 
        }]} />
        <View style={styles.macroValue}>
          <Text style={styles.macroNumber}>{value}</Text>
          <Text style={styles.macroUnit}>g</Text>
        </View>
      </View>
    );
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
              <TouchableOpacity 
                style={styles.checkInButton}
                onPress={handleWeeklyCheckIn}
              >
                <Text style={styles.checkInText}>Weekly Check-in</Text>
              </TouchableOpacity>
            </View>

            {/* Streak Card */}
            <View style={styles.streakCard}>
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

            {/* Time Range Selector */}
            <View style={styles.rangeSelector}>
              {(['week', 'month', 'year'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.rangeButton,
                    selectedRange === range && styles.rangeButtonActive
                  ]}
                  onPress={() => setSelectedRange(range)}
                >
                  <Text style={[
                    styles.rangeText,
                    selectedRange === range && styles.rangeTextActive
                  ]}>
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nutrition Overview */}
            <View style={styles.nutritionCard}>
              <Text style={styles.cardTitle}>Average Daily Nutrition</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionEmoji}>🔥</Text>
                  <Text style={styles.nutritionValue}>{stats.caloriesAvg}</Text>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionEmoji}>💪</Text>
                  <Text style={styles.nutritionValue}>{stats.proteinAvg}g</Text>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionEmoji}>🍞</Text>
                  <Text style={styles.nutritionValue}>{stats.carbsAvg}g</Text>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionEmoji}>🥑</Text>
                  <Text style={styles.nutritionValue}>{stats.fatsAvg}g</Text>
                  <Text style={styles.nutritionLabel}>Fats</Text>
                </View>
              </View>
            </View>

            {/* Goals Progress */}
            <View style={styles.goalsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Active Goals</Text>
                <TouchableOpacity>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              </View>
              
              {goals.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalType}>{goal.type}</Text>
                    <Text style={styles.goalProgress}>
                      {goal.current} / {goal.target} {goal.unit}
                    </Text>
                  </View>
                  {renderProgressBar(goal.progress)}
                  <Text style={styles.goalPercentage}>{goal.progress}% complete</Text>
                </View>
              ))}
            </View>

            {/* Weight Trend */}
            <View style={styles.trendCard}>
              <Text style={styles.cardTitle}>Weight Trend</Text>
              <View style={styles.trendChart}>
                {stats.monthlyWeight.map((point, index) => {
                  // Calculate bar height: higher weight = taller bar (relative to the range)
                  // Use a more subtle scaling: 60% to 100% (40% range instead of 80%)
                  // This makes visual differences noticeable but not overly dramatic
                  const normalizedValue = (point.value - minWeight) / weightRange;
                  const barHeightPercentage = 60 + (normalizedValue * 40); // Scale from 60% to 100%

                  return (
                    <View key={index} style={styles.trendPoint}>
                      <View style={styles.trendBar}>
                        <View
                          style={[
                            styles.trendBarFill,
                            { height: `${barHeightPercentage}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.trendValue}>{point.value.toFixed(1)}</Text>
                      <Text style={styles.trendLabel}>{point.week}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.trendSummary}>
                <Text style={styles.trendChange}>
                  {currentWeight - monthlyWeightData[3].value >= 0 ? '↓' : '↑'} {Math.abs(currentWeight - monthlyWeightData[3].value).toFixed(1)} lbs
                </Text>
                <Text style={styles.trendPeriod}>this month</Text>
              </View>
            </View>

            {/* Achievements */}
            <View style={styles.achievementsCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Achievements</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.achievementsGrid}>
                {achievements.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    style={[
                      styles.achievementItem,
                      !achievement.earned && styles.achievementItemLocked
                    ]}
                  >
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    {achievement.earned ? (
                      <Text style={styles.achievementDate}>{achievement.date}</Text>
                    ) : (
                      <View style={styles.achievementProgress}>
                        <View style={styles.achievementProgressBar}>
                          <View 
                            style={[
                              styles.achievementProgressFill,
                              { width: `${(achievement.progress! / achievement.total!) * 100}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.achievementProgressText}>
                          {achievement.progress}/{achievement.total}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stats Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Lifetime Stats</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{stats.totalRecipes}</Text>
                  <Text style={styles.summaryLabel}>Recipes Cooked</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>126</Text>
                  <Text style={styles.summaryLabel}>Hours Saved</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>$420</Text>
                  <Text style={styles.summaryLabel}>Money Saved</Text>
                </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    color: 'white',
    fontFamily: 'VendSans-Bold',
  },
  checkInButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  checkInText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'VendSans-SemiBold',
  },
  streakCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 16,
    fontFamily: 'VendSans-Regular',
  },
  streakInfo: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 28,
    color: '#1F2937',
    fontFamily: 'VendSans-Bold',
  },
  streakLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Bold',
  },
  dayLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  dayLabelActive: {
    color: '#10B981',
    fontFamily: 'VendSans-SemiBold',
  },
  streakMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: 'white',
  },
  rangeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'VendSans-Medium',
  },
  rangeTextActive: {
    color: '#6B46C1',
  },
  nutritionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionEmoji: {
    fontSize: 24,
    marginBottom: 8,
    fontFamily: 'VendSans-Regular',
  },
  nutritionValue: {
    fontSize: 18,
    color: '#6B46C1',
    marginBottom: 4,
    fontFamily: 'VendSans-Bold',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  goalsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editLink: {
    color: '#6B46C1',
    fontSize: 14,
    fontFamily: 'VendSans-Medium',
  },
  goalItem: {
    marginBottom: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalType: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'VendSans-SemiBold',
  },
  goalProgress: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 4,
  },
  goalPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  trendCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 16,
  },
  trendPoint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  trendBar: {
    width: 40,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 4,
    justifyContent: 'flex-end',
  },
  trendBarFill: {
    backgroundColor: '#FF8C00',
    borderRadius: 4,
  },
  trendValue: {
    fontSize: 12,
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: 'VendSans-SemiBold',
  },
  trendLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  trendSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  trendChange: {
    fontSize: 20,
    color: '#10B981',
    fontFamily: 'VendSans-Bold',
  },
  trendPeriod: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  achievementsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  viewAllLink: {
    color: '#6B46C1',
    fontSize: 14,
    fontFamily: 'VendSans-Medium',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementItem: {
    width: (width - 64) / 2,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
    fontFamily: 'VendSans-Regular',
  },
  achievementTitle: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: 'VendSans-SemiBold',
  },
  achievementDate: {
    fontSize: 12,
    color: '#10B981',
    fontFamily: 'VendSans-Regular',
  },
  achievementProgress: {
    width: '100%',
    alignItems: 'center',
  },
  achievementProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  achievementProgressText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-SemiBold',
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
    color: '#FF8C00',
    marginBottom: 4,
    fontFamily: 'VendSans-Bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  macroRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroRingFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  macroValue: {
    alignItems: 'center',
  },
  macroNumber: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: 'VendSans-Bold',
  },
  macroUnit: {
    fontSize: 10,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
});