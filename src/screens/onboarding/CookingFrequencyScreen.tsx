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
import { useUser } from '../../context/UserContext';  // ADD THIS

type CookingFrequency = 'daily' | 'few_weekly' | 'weekends' | 'occasionally';  // KEEP THIS
type MealPrepInterest = 'yes' | 'no' | 'maybe';  // ADD THIS

export default function CookingFrequencyScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [selectedFrequency, setSelectedFrequency] = useState<CookingFrequency | ''>(userData.cookingFrequency as CookingFrequency || '');  // MODIFIED
  const [mealPrepInterest, setMealPrepInterest] = useState<MealPrepInterest | ''>(userData.mealPrepInterest as MealPrepInterest || '');  // ADD THIS

  const frequencies = [
    {
      id: 'daily',
      emoji: '🔥',
      title: 'Every Day',
      description: "I'm committed to daily cooking"
    },
    {
      id: 'few_weekly',
      emoji: '📅',
      title: 'Few Times a Week',
      description: '3-4 times per week'
    },
    {
      id: 'weekends',
      emoji: '🏖️',
      title: 'Weekends Only',
      description: 'Saturday and Sunday'
    },
    {
      id: 'occasionally',
      emoji: '🌙',
      title: 'Occasionally',
      description: 'When I have time'
    }
  ];

  const mealPrepOptions = [  // ADD THIS ARRAY
    {
      id: 'yes',
      emoji: '✅',
      title: 'Yes, definitely!',
      description: 'I want to prep meals in advance'
    },
    {
      id: 'maybe',
      emoji: '🤔',
      title: 'Maybe',
      description: 'Show me easy prep options'
    },
    {
      id: 'no',
      emoji: '❌',
      title: 'Not interested',
      description: 'I prefer cooking fresh each time'
    }
  ];

  const isFormValid = selectedFrequency !== '' && mealPrepInterest !== '';  // ADD THIS

  const handleContinue = () => {
    if (isFormValid) {
      updateUserData({   // MODIFIED TO SAVE BOTH
        cookingFrequency: selectedFrequency,
        mealPrepInterest: mealPrepInterest
      });
      navigation.navigate('RecipePreview');
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
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
            <Text style={styles.progressText}>Step 8 of 10</Text>
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
            {/* Cooking Frequency Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How often do you cook?</Text>
              <Text style={styles.sectionSubtitle}>
                We'll match recipe complexity to your schedule
              </Text>

              <View style={styles.optionsContainer}>
                {frequencies.map((freq) => (
                  <TouchableOpacity
                    key={freq.id}
                    style={[
                      styles.optionCard,
                      selectedFrequency === freq.id && styles.optionCardActive
                    ]}
                    onPress={() => setSelectedFrequency(freq.id as CookingFrequency)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.optionEmoji}>{freq.emoji}</Text>
                    <View style={styles.optionTextContainer}>
                      <Text style={[
                        styles.optionTitle,
                        selectedFrequency === freq.id && styles.optionTitleActive
                      ]}>
                        {freq.title}
                      </Text>
                      <Text style={[
                        styles.optionDescription,
                        selectedFrequency === freq.id && styles.optionDescriptionActive
                      ]}>
                        {freq.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meal Prep Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interested in meal prep?</Text>
              <Text style={styles.sectionSubtitle}>
                Cook once, eat multiple times
              </Text>

              <View style={styles.mealPrepContainer}>
                {mealPrepOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.mealPrepCard,
                      mealPrepInterest === option.id && styles.mealPrepCardActive
                    ]}
                    onPress={() => setMealPrepInterest(option.id as MealPrepInterest)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.mealPrepEmoji}>{option.emoji}</Text>
                    <Text style={[
                      styles.mealPrepTitle,
                      mealPrepInterest === option.id && styles.mealPrepTitleActive
                    ]}>
                      {option.title}
                    </Text>
                    <Text style={[
                      styles.mealPrepDescription,
                      mealPrepInterest === option.id && styles.mealPrepDescriptionActive
                    ]}>
                      {option.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                !isFormValid && styles.continueButtonDisabled
              ]}
              onPress={handleContinue}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.continueButtonText,
                !isFormValid && styles.continueButtonTextDisabled
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
    backgroundColor: '#6B46C1',
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
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontFamily: 'VendSans-Bold',
    fontSize: 26,
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'VendSans-Regular',
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardActive: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  optionEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  optionTitleActive: {
    color: '#6B46C1',
  },
  optionDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  optionDescriptionActive: {
    color: '#6B46C1',
  },
  mealPrepContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  mealPrepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  mealPrepCardActive: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  mealPrepEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  mealPrepTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  mealPrepTitleActive: {
    color: '#6B46C1',
  },
  mealPrepDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  mealPrepDescriptionActive: {
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
    marginTop: 10,
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontFamily: 'VendSans-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});