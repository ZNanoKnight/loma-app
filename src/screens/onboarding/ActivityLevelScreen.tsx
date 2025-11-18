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

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';  // KEEP THIS

export default function ActivityLevelScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [selectedLevel, setSelectedLevel] = useState<ActivityLevel | ''>(userData.activityLevel as ActivityLevel || '');  // MODIFIED

  const activityLevels = [
    {
      id: 'sedentary',
      emoji: '🪑',
      title: 'Sedentary',
      description: 'Little or no exercise',  // BOTH properties
      details: 'Little or no exercise',      // BOTH properties
      multiplier: 1.2
    },
    {
      id: 'light',
      emoji: '🚶',
      title: 'Lightly Active',
      description: 'Exercise 1-3 days/week',  // BOTH properties
      details: 'Exercise 1-3 days/week',      // BOTH properties
      multiplier: 1.375
    },
    {
      id: 'moderate',
      emoji: '🏃',
      title: 'Moderately Active',
      description: 'Exercise 3-5 days/week',  // BOTH properties
      details: 'Exercise 3-5 days/week',      // BOTH properties
      multiplier: 1.55
    },
    {
      id: 'very',
      emoji: '💪',
      title: 'Very Active',
      description: 'Exercise 6-7 days/week',  // BOTH properties
      details: 'Exercise 6-7 days/week',      // BOTH properties
      multiplier: 1.725
    },
    {
      id: 'extra',
      emoji: '🔥',
      title: 'Extra Active',
      description: 'Physical job or training twice/day',  // BOTH properties
      details: 'Physical job or training twice/day',      // BOTH properties
      multiplier: 1.9
    }
  ];

  const handleContinue = () => {
    if (selectedLevel) {
      updateUserData({ activityLevel: selectedLevel });  // ADD THIS LINE
      navigation.navigate('Goals');
    }
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
              <View style={[styles.progressFill, { width: '40%' }]} />
            </View>
            <Text style={styles.progressText}>Step 4 of 10</Text>
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
            <Text style={styles.title}>How active are you?</Text>
            <Text style={styles.subtitle}>
              This helps us calculate your daily calorie needs
            </Text>

            {/* Activity Level Options */}
            <View style={styles.optionsContainer}>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionCard,
                    selectedLevel === level.id && styles.optionCardActive
                  ]}
                  onPress={() => setSelectedLevel(level.id as ActivityLevel)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.optionEmoji}>{level.emoji}</Text>
                  <View style={styles.optionTextContainer}>
                    <Text style={[
                      styles.optionTitle,
                      selectedLevel === level.id && styles.optionTitleActive
                    ]}>
                      {level.title}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      selectedLevel === level.id && styles.optionDescriptionActive
                    ]}>
                      {level.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedLevel && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!selectedLevel}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.continueButtonText,
                !selectedLevel && styles.continueButtonTextDisabled
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
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Medium',
    color: '#6B46C1',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'VendSans-Bold',
    fontSize: 32,
    color: '#6B46C1',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'VendSans-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 2,
  },
  optionTitleActive: {
    color: '#6B46C1',
  },
  optionDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  optionDescriptionActive: {
    color: '#6B46C1',
  },
  continueButton: {
    backgroundColor: '#6B46C1',
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
    fontFamily: 'VendSans-SemiBold',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});