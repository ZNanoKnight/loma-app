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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useRecipe, CookingStep } from '../../context/RecipeContext';
import { AuthService } from '../../services/auth/authService';
import { ProgressService } from '../../services/progress/progressService';

const { width } = Dimensions.get('window');

export default function CookingInstructionsScreen() {
  const navigation = useNavigation<any>();
  const { currentRecipe } = useRecipe();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Get steps from current recipe - no fallback to mock data
  const steps: CookingStep[] = currentRecipe?.instructions && currentRecipe.instructions.length > 0
    ? currentRecipe.instructions.filter(step => step !== null && step !== undefined)
    : [];

  // Show error state if no recipe or no instructions
  if (!currentRecipe || steps.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🍳</Text>
            <Text style={{ color: '#1F2937', fontSize: 18, textAlign: 'center', fontFamily: 'Quicksand-Bold' }}>
              No recipe loaded
            </Text>
            <Text style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 8, fontFamily: 'Quicksand-Regular' }}>
              Please select a recipe from your Recipe Book first.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 20, backgroundColor: '#1B4332', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
            >
              <Text style={{ color: 'white', fontFamily: 'Quicksand-Bold' }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = steps[currentStep] || steps[0];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Record recipe completion in Supabase
    try {
      const session = await AuthService.getCurrentSession();
      if (session) {
        await ProgressService.recordRecipeCompletion(session.user.id);
        // Check for newly unlocked achievements
        await ProgressService.checkAchievements();
      }
    } catch (error) {
      console.error('[CookingInstructionsScreen] Error recording completion:', error);
    }
    navigation.navigate('RecipeCompletion');
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
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
            </View>
            <View style={styles.placeholder} />
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
                <Text style={styles.stepTitle}>{currentStepData.title || `Step ${currentStep + 1}`}</Text>
              </View>

              <Text style={styles.instruction}>
                {currentStepData.instruction || ''}
              </Text>

              {currentStepData.tip ? (
                <View style={styles.tipContainer}>
                  <Text style={styles.tipIcon}>💡</Text>
                  <Text style={styles.tipText}>{currentStepData.tip}</Text>
                </View>
              ) : null}

              {currentStepData.warning ? (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.warningText}>{currentStepData.warning}</Text>
                </View>
              ) : null}
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
    color: '#1F2937',
    fontSize: 20,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1B4332',
    fontFamily: 'Quicksand-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Quicksand-Light',
  },
  placeholder: {
    width: 40,
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
    backgroundColor: '#1B4332',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepCard: {
    backgroundColor: '#E8F5E9',
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
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
  },
  stepTitle: {
    fontSize: 22,
    color: '#1F2937',
    flex: 1,
    fontFamily: 'Quicksand-Bold',
  },
  instruction: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
    fontFamily: 'Quicksand-Regular',
  },
  tipContainer: {
    flexDirection: 'row',
    backgroundColor: '#D8F3DC',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#1B4332',
    lineHeight: 20,
    fontFamily: 'Quicksand-Regular',
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
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    fontFamily: 'Quicksand-Regular',
  },
  stepOverview: {
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'Quicksand-Bold',
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
    backgroundColor: '#1B4332',
  },
  stepDotCompleted: {
    backgroundColor: '#40916C',
  },
  stepDotNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Bold',
  },
  stepDotNumberActive: {
    color: 'white',
  },
  stepDotCheck: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 90,
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
    color: '#6B7280',
  },
  navText: {
    fontSize: 16,
    color: '#6B7280',
    fontFamily: 'Quicksand-Bold',
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#40916C',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  completeIcon: {
    fontSize: 18,
    color: 'white',
  },
  completeText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Quicksand-Bold',
  },
});