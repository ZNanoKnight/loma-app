import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

type Goal = 'weight_loss' | 'muscle_gain' | 'healthy_eating' | 'save_time' | 'save_money' | 'learn_cooking';  // KEEP THIS

export default function GoalsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(userData.goals || []);  // MODIFIED

  const goals = [
    {
      id: 'weight_loss',
      emoji: '⚖️',
      title: 'Lose Weight',
      description: 'Calorie-conscious recipes'
    },
    {
      id: 'muscle_gain',
      emoji: '💪',
      title: 'Build Muscle',
      description: 'High-protein meals'
    },
    {
      id: 'healthy_eating',
      emoji: '🥗',
      title: 'Eat Healthier',
      description: 'Balanced, nutritious meals'
    },
    {
      id: 'save_time',
      emoji: '⏱️',
      title: 'Save Time',
      description: 'Quick & easy recipes'
    },
    {
      id: 'save_money',
      emoji: '💰',
      title: 'Save Money',
      description: 'Budget-friendly meals'
    },
    {
      id: 'learn_cooking',
      emoji: '👨‍🍳',
      title: 'Learn to Cook',
      description: 'Build cooking skills'
    }
  ];

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleContinue = () => {
    updateUserData({ goals: selectedGoals });  // ADD THIS LINE
    navigation.navigate('DietaryPreferences');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.progressText}>Step 5 of 10</Text>
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>What are your goals?</Text>
            <Text style={styles.subtitle}>
              Select at least one goal. We'll tailor your nutrition plan accordingly.
            </Text>

            {/* Goals Options */}
            <View style={styles.optionsContainer}>
              {goals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    selectedGoals.includes(goal.id as Goal) && styles.goalCardActive
                  ]}
                  onPress={() => toggleGoal(goal.id as Goal)}
                  activeOpacity={0.8}
                >
                  <View style={styles.goalContent}>
                    <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                    <View style={styles.goalTextContainer}>
                      <Text style={[
                        styles.goalTitle,
                        selectedGoals.includes(goal.id as Goal) && styles.goalTitleActive
                      ]}>
                        {goal.title}
                      </Text>
                      <Text style={[
                        styles.goalDescription,
                        selectedGoals.includes(goal.id as Goal) && styles.goalDescriptionActive
                      ]}>
                        {goal.description}
                      </Text>
                    </View>
                  </View>
                  {/* Checkmark indicator */}
                  {selectedGoals.includes(goal.id as Goal) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected count indicator */}
            <Text style={styles.selectionIndicator}>
              {selectedGoals.length} {selectedGoals.length === 1 ? 'goal' : 'goals'} selected
            </Text>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                selectedGoals.length === 0 && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={selectedGoals.length === 0}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.continueButtonText,
                selectedGoals.length === 0 && styles.continueButtonTextDisabled
              ]}>
                Continue
              </Text>
            </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Quicksand-Light',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backButtonText: {
    fontFamily: 'Quicksand-Regular',
    color: '#40916C',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 32,
    color: '#1B4332',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  goalCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B4332',
    borderWidth: 2,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  goalTitleActive: {
    color: '#1B4332',
  },
  goalDescription: {
    fontFamily: 'Quicksand-Light',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  goalDescriptionActive: {
    color: '#1B4332',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF8C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontFamily: 'Quicksand-Bold',
    color: 'white',
    fontSize: 14,
  },
  selectionIndicator: {
    fontFamily: 'Quicksand-Light',
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 30,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});