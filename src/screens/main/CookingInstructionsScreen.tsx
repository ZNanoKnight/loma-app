import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe, CookingStep } from '../../context/RecipeContext';

const { width } = Dimensions.get('window');

export default function CookingInstructionsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  const { currentRecipe } = useRecipe();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const steps: CookingStep[] = currentRecipe?.instructions || [
    {
      id: '1',
      title: 'Prep Ingredients',
      instruction: 'Season chicken breasts on both sides with oregano, minced garlic, salt, and pepper. Let rest at room temperature while you prepare other ingredients.',
      time: 5,
      tip: 'Pat chicken dry with paper towels for better searing'
    },
    {
      id: '2',
      title: 'Cook Quinoa',
      instruction: 'Bring 2 cups of water to a boil in a medium saucepan. Add 1 cup quinoa, reduce heat to low, cover, and simmer for 15 minutes.',
      time: 15,
      tip: 'Add a pinch of salt to the water for more flavor'
    },
    {
      id: '3',
      title: 'Prepare Vegetables',
      instruction: 'While quinoa cooks, dice cucumber, halve cherry tomatoes, and thinly slice red onion. Place in a large bowl.',
      time: 5
    },
    {
      id: '4',
      title: 'Heat the Pan',
      instruction: 'Heat 1 tablespoon olive oil in a grill pan or skillet over medium-high heat. The pan is ready when a drop of water sizzles.',
      time: 2,
      warning: 'Don\'t let the oil smoke - reduce heat if needed'
    },
    {
      id: '5',
      title: 'Cook Chicken',
      instruction: 'Place seasoned chicken in the hot pan. Cook for 6-7 minutes without moving. Flip and cook another 6-7 minutes.',
      time: 14,
      warning: 'Internal temp should reach 165°F (74°C)'
    },
    {
      id: '6',
      title: 'Rest the Chicken',
      instruction: 'Transfer cooked chicken to a cutting board and let rest for 5 minutes. This allows juices to redistribute.',
      time: 5,
      tip: 'Cover loosely with foil to keep warm'
    },
    {
      id: '7',
      title: 'Dress Vegetables',
      instruction: 'Add remaining olive oil and lemon juice to the bowl of vegetables. Toss to combine. Season with salt and pepper.',
      time: 2
    },
    {
      id: '8',
      title: 'Slice Chicken',
      instruction: 'Slice rested chicken breasts diagonally into 1/2 inch thick slices.',
      time: 2,
      tip: 'Cut against the grain for more tender pieces'
    },
    {
      id: '9',
      title: 'Fluff Quinoa',
      instruction: 'Remove quinoa from heat and let stand 5 minutes. Fluff with a fork.',
      time: 5
    },
    {
      id: '10',
      title: 'Assemble Bowls',
      instruction: 'Divide quinoa between bowls. Top with mixed greens, dressed vegetables, sliced chicken, and crumbled feta. Drizzle any remaining dressing.',
      time: 3,
      tip: 'Warm the bowls for a restaurant-style presentation'
    }
  ];

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep];
  const totalTime = steps.reduce((acc, step) => acc + (step.time || 0), 0);
  const elapsedTime = steps.slice(0, currentStep).reduce((acc, step) => acc + (step.time || 0), 0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer !== null && !isPaused && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setActiveTimer(null);
            // Play notification sound in production
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer, timerSeconds, isPaused]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
      setActiveTimer(null);
      setTimerSeconds(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setActiveTimer(null);
      setTimerSeconds(0);
    }
  };

  const handleStartTimer = () => {
    if (currentStepData.time) {
      setActiveTimer(currentStep);
      setTimerSeconds(currentStepData.time * 60);
      setIsPaused(false);
    }
  };

  const handleComplete = () => {
    // Update streak and recipe count when completing cooking  // MODIFIED
    updateUserData({ 
      currentStreak: userData.currentStreak + 1,
      totalRecipes: userData.totalRecipes + 1
    });
    navigation.navigate('Home');
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    setActiveTimer(null);
    setTimerSeconds(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Cooking Mode</Text>
              <Text style={styles.headerSubtitle}>
                {elapsedTime} of {totalTime} min
              </Text>
            </View>
            <TouchableOpacity style={styles.voiceButton}>
              <Text style={styles.voiceIcon}>🔊</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Step {currentStep + 1} of {totalSteps}
            </Text>
          </View>

          {/* Timer Section */}
          {currentStepData.time && (
            <View style={styles.timerSection}>
              {activeTimer === null ? (
                <TouchableOpacity
                  style={styles.startTimerButton}
                  onPress={handleStartTimer}
                >
                  <Text style={styles.timerIcon}>⏱️</Text>
                  <Text style={styles.startTimerText}>
                    Start {currentStepData.time} min timer
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.activeTimerContainer}>
                  <Text style={styles.timerDisplay}>{formatTime(timerSeconds)}</Text>
                  <View style={styles.timerControls}>
                    <TouchableOpacity
                      style={styles.timerControlButton}
                      onPress={() => setIsPaused(!isPaused)}
                    >
                      <Text style={styles.timerControlText}>
                        {isPaused ? '▶️' : '⏸️'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.timerControlButton}
                      onPress={() => setActiveTimer(null)}
                    >
                      <Text style={styles.timerControlText}>⏹️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Main Step Card */}
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
                </View>
                <Text style={styles.stepTitle}>{currentStepData.title}</Text>
              </View>

              <Text style={styles.instruction}>
                {currentStepData.instruction}
              </Text>

              {currentStepData.tip && (
                <View style={styles.tipContainer}>
                  <Text style={styles.tipIcon}>💡</Text>
                  <Text style={styles.tipText}>{currentStepData.tip}</Text>
                </View>
              )}

              {currentStepData.warning && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>{currentStepData.warning}</Text>
                </View>
              )}
            </View>

            {/* Step Overview */}
            <View style={styles.stepOverview}>
              <Text style={styles.overviewTitle}>All Steps</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.stepDots}>
                  {steps.map((step, index) => (
                    <TouchableOpacity
                      key={step.id}
                      style={[
                        styles.stepDot,
                        index === currentStep && styles.stepDotActive,
                        completedSteps.includes(index) && styles.stepDotCompleted
                      ]}
                      onPress={() => jumpToStep(index)}
                    >
                      {completedSteps.includes(index) ? (
                        <Text style={styles.stepDotCheck}>✓</Text>
                      ) : (
                        <Text style={[
                          styles.stepDotNumber,
                          index === currentStep && styles.stepDotNumberActive
                        ]}>
                          {index + 1}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          {/* Navigation Controls */}
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={handlePrevious}
              disabled={currentStep === 0}
            >
              <Text style={styles.navIcon}>←</Text>
              <Text style={styles.navText}>Previous</Text>
            </TouchableOpacity>

            {currentStep === totalSteps - 1 ? (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleComplete}
              >
                <Text style={styles.completeIcon}>✓</Text>
                <Text style={styles.completeText}>Complete</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNext}
              >
                <Text style={styles.navText}>Next</Text>
                <Text style={styles.navIcon}>→</Text>
              </TouchableOpacity>
            )}
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'VendSans-Regular',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontFamily: 'VendSans-Regular',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceIcon: {
    fontSize: 20,
    fontFamily: 'VendSans-Regular',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'VendSans-Regular',
  },
  timerSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  startTimerButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timerIcon: {
    fontSize: 20,
    fontFamily: 'VendSans-Regular',
  },
  startTimerText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  activeTimerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 48,
    color: 'white',
    marginBottom: 12,
    fontFamily: 'VendSans-Bold',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 20,
  },
  timerControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerControlText: {
    fontSize: 20,
    fontFamily: 'VendSans-Regular',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#1F2937',
    fontSize: 18,
    fontFamily: 'VendSans-Bold',
  },
  stepTitle: {
    fontSize: 22,
    color: '#1F2937',
    flex: 1,
    fontFamily: 'VendSans-Bold',
  },
  instruction: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'VendSans-Regular',
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'VendSans-Regular',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6B46C1',
    lineHeight: 20,
    fontFamily: 'VendSans-Regular',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
    fontFamily: 'VendSans-Regular',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontFamily: 'VendSans-Regular',
  },
  stepOverview: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    fontFamily: 'VendSans-SemiBold',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 12,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: 'white',
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  stepDotNumber: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  stepDotNumberActive: {
    color: '#6B46C1',
  },
  stepDotCheck: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'VendSans-Bold',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navIcon: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'VendSans-Regular',
  },
  navText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  completeIcon: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'VendSans-Regular',
  },
  completeText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
});