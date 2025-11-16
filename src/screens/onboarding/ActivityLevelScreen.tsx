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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';  // ADD THIS

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
    <LinearGradient
      colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
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
                  <View style={styles.optionHeader}>
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
                  </View>
                  <Text style={[
                    styles.optionDetails,
                    selectedLevel === level.id && styles.optionDetailsActive
                  ]}>
                    {level.details}
                  </Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  optionCardActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  optionTitleActive: {
    color: '#4F46E5',
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  optionDescriptionActive: {
    color: 'rgba(79, 70, 229, 0.8)',
  },
  optionDetails: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 40,
    fontStyle: 'italic',
  },
  optionDetailsActive: {
    color: 'rgba(79, 70, 229, 0.7)',
  },
  continueButton: {
    backgroundColor: 'white',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: 'rgba(79, 70, 229, 0.5)',
  },
});