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

type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'low_carb' | 'gluten_free' | 'dairy_free';  // KEEP THIS

export default function DietaryPreferencesScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(userData.dietaryPreferences || []);  // MODIFIED

  const preferences = [
    {
      id: 'none',
      emoji: '🍽️',
      title: 'No Restrictions',
      description: 'I eat everything'
    },
    {
      id: 'vegetarian',
      emoji: '🥬',
      title: 'Vegetarian',
      description: 'No meat or fish'
    },
    {
      id: 'vegan',
      emoji: '🌱',
      title: 'Vegan',
      description: 'No animal products'
    },
    {
      id: 'pescatarian',
      emoji: '🐟',
      title: 'Pescatarian',
      description: 'Fish but no meat'
    },
    {
      id: 'keto',
      emoji: '🥑',
      title: 'Keto',
      description: 'Low-carb, high-fat'
    },
    {
      id: 'paleo',
      emoji: '🍖',
      title: 'Paleo',
      description: 'Whole foods only'
    },
    {
      id: 'mediterranean',
      emoji: '🫒',
      title: 'Mediterranean',
      description: 'Heart-healthy diet'
    },
    {
      id: 'low_carb',
      emoji: '🥩',
      title: 'Low Carb',
      description: 'Reduced carbohydrates'
    },
    {
      id: 'gluten_free',
      emoji: '🌾',
      title: 'Gluten-Free',
      description: 'No gluten products'
    },
    {
      id: 'dairy_free',
      emoji: '🥛',
      title: 'Dairy-Free',
      description: 'No dairy products'
    }
  ];

  const togglePreference = (preferenceId: string) => {
    if (preferenceId === 'none') {
      setSelectedPreferences(['none']);
    } else {
      let newPreferences = selectedPreferences.filter(p => p !== 'none');
      
      if (selectedPreferences.includes(preferenceId)) {
        newPreferences = newPreferences.filter(p => p !== preferenceId);
      } else {
        newPreferences = [...newPreferences, preferenceId];
      }
      
      setSelectedPreferences(newPreferences.length > 0 ? newPreferences : []);
    }
  };

  const handleContinue = () => {
    updateUserData({ dietaryPreferences: selectedPreferences });  // ADD THIS LINE
    navigation.navigate('DietaryRestrictions');
  };

  const handleSkip = () => {
    updateUserData({ dietaryPreferences: [] });  // ADD THIS LINE
    navigation.navigate('DietaryRestrictions');
  };

  // Auto-select "none" if nothing selected
  React.useEffect(() => {
    if (selectedPreferences.length === 0) {
      setSelectedPreferences(['none']);
    }
  }, []);

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
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>Step 6 of 10</Text>
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
            <Text style={styles.title}>Dietary preferences?</Text>
            <Text style={styles.subtitle}>
              Select all that apply. This helps us suggest appropriate recipes.
            </Text>

            {/* Preference Options */}
            <View style={styles.optionsContainer}>
              {preferences.map((pref) => (
                <TouchableOpacity
                  key={pref.id}
                  style={[
                    styles.preferenceCard,
                    selectedPreferences.includes(pref.id as DietaryPreference) && styles.preferenceCardActive
                  ]}
                  onPress={() => togglePreference(pref.id as DietaryPreference)}
                  activeOpacity={0.8}
                >
                  <View style={styles.preferenceContent}>
                    <Text style={styles.preferenceEmoji}>{pref.emoji}</Text>
                    <View style={styles.preferenceTextContainer}>
                      <Text style={[
                        styles.preferenceTitle,
                        selectedPreferences.includes(pref.id as DietaryPreference) && styles.preferenceTitleActive
                      ]}>
                        {pref.title}
                      </Text>
                      <Text style={[
                        styles.preferenceDescription,
                        selectedPreferences.includes(pref.id as DietaryPreference) && styles.preferenceDescriptionActive
                      ]}>
                        {pref.description}
                      </Text>
                    </View>
                  </View>
                  {selectedPreferences.includes(pref.id as DietaryPreference) && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
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
    color: '#1F2937',
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
  preferenceCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceCardActive: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  preferenceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  preferenceTextContainer: {
    flex: 1,
  },
  preferenceTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 17,
    color: '#1F2937',
    marginBottom: 2,
  },
  preferenceTitleActive: {
    color: '#6B46C1',
  },
  preferenceDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  preferenceDescriptionActive: {
    color: '#6B46C1',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontFamily: 'VendSans-Bold',
    color: 'white',
    fontSize: 14,
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
  continueButtonText: {
    fontFamily: 'VendSans-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});