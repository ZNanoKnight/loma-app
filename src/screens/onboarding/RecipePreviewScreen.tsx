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

export default function RecipePreviewScreen() {
  const navigation = useNavigation<any>();
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);

  const sampleRecipes = [
    {
      title: "Grilled Chicken & Quinoa Bowl",
      emoji: "🍗",
      image: "🍗",
      description: "A protein-packed meal with perfectly grilled chicken, fluffy quinoa, and fresh vegetables",
      time: 25,
      calories: 420,
      protein: 38,
      carbs: 35,  // ADD THIS
      fats: 12,   // ADD THIS
      difficulty: "Easy",
      ingredients: [
        "Chicken breast",
        "Quinoa", 
        "Mixed vegetables",
        "Olive oil",
        "Lemon",
        "Garlic"
      ]
    },
    {
      title: "Protein-Packed Breakfast",
      emoji: "🍳",
      image: "🍳",
      description: "Start your day right with this balanced breakfast full of protein and nutrients",
      time: 15,
      calories: 350,
      protein: 28,
      carbs: 30,  // ADD THIS
      fats: 15,   // ADD THIS
      difficulty: "Easy",
      ingredients: [
        "Eggs",
        "Greek yogurt",
        "Berries",
        "Whole grain toast",
        "Avocado",
        "Spinach"
      ]
    },
    {
      title: "Salmon Teriyaki Stir-Fry",
      emoji: "🍣",
      image: "🍣",
      description: "Delicious Asian-inspired salmon with crispy vegetables in a sweet teriyaki glaze",
      time: 20,
      calories: 385,
      protein: 32,
      carbs: 28,  // ADD THIS
      fats: 18,   // ADD THIS
      difficulty: "Medium",
      ingredients: [
        "Salmon fillet",
        "Broccoli",
        "Brown rice",
        "Soy sauce",
        "Ginger",
        "Sesame seeds"
      ]
    }
  ];

  const currentRecipe = sampleRecipes[currentRecipeIndex];

  const handleNext = () => {
    if (currentRecipeIndex < sampleRecipes.length - 1) {
      setCurrentRecipeIndex(currentRecipeIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentRecipeIndex > 0) {
      setCurrentRecipeIndex(currentRecipeIndex - 1);
    }
  };

  const handleContinue = () => {
    navigation.navigate('AppFeatures');
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
              <View style={[styles.progressFill, { width: '90%' }]} />
            </View>
            <Text style={styles.progressText}>Step 9 of 11</Text>
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
            <Text style={styles.title}>Your personalized recipes</Text>
            <Text style={styles.subtitle}>
              Here's a preview of what Loma will create for you daily
            </Text>

            {/* Recipe Card */}
            <View style={styles.recipeCard}>
              {/* Recipe Image Placeholder */}
              <View style={styles.recipeImageContainer}>
                <Text style={styles.recipeEmoji}>{currentRecipe.image}</Text>
              </View>

              {/* Recipe Details */}
              <View style={styles.recipeDetails}>
                <Text style={styles.recipeTitle}>{currentRecipe.title}</Text>
                <Text style={styles.recipeDescription}>{currentRecipe.description}</Text>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <Text style={styles.statValue}>{currentRecipe.time}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>🔥</Text>
                    <Text style={styles.statValue}>{currentRecipe.calories} cal</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>📊</Text>
                    <Text style={styles.statValue}>{currentRecipe.difficulty}</Text>
                  </View>
                </View>

                {/* Macros */}
                <View style={styles.macrosContainer}>
                  <View style={styles.macro}>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroValue}>{currentRecipe.protein}g</Text>
                  </View>
                  <View style={styles.macro}>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroValue}>{currentRecipe.carbs}g</Text>
                  </View>
                  <View style={styles.macro}>
                    <Text style={styles.macroLabel}>Fats</Text>
                    <Text style={styles.macroValue}>{currentRecipe.fats}g</Text>
                  </View>
                </View>
              </View>

              {/* Navigation Arrows */}
              <View style={styles.navigationContainer}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={handlePrevious}
                  activeOpacity={0.7}
                >
                  <Text style={styles.navButtonText}>←</Text>
                </TouchableOpacity>
                
                <View style={styles.dotsContainer}>
                  {sampleRecipes.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentRecipeIndex && styles.dotActive
                      ]}
                    />
                  ))}
                </View>
                
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={handleNext}
                  activeOpacity={0.7}
                >
                  <Text style={styles.navButtonText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Benefits List */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you'll get:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Daily personalized recipes</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Automatic grocery lists</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Step-by-step instructions</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✓</Text>
                <Text style={styles.benefitText}>Macro tracking</Text>
              </View>
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
  title: {
    fontFamily: 'VendSans-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'VendSans-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 25,
    lineHeight: 22,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  recipeImageContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipeEmoji: {
    fontSize: 60,
  },
  recipeDetails: {
    marginBottom: 16,
  },
  recipeTitle: {
    fontFamily: 'VendSans-Bold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
  },
  recipeDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 16,
  },
  statValue: {
    fontFamily: 'VendSans-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  macro: {
    alignItems: 'center',
  },
  macroLabel: {
    fontFamily: 'VendSans-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  macroValue: {
    fontFamily: 'VendSans-Bold',
    fontSize: 18,
    color: '#6B46C1',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontFamily: 'VendSans-Regular',
    fontSize: 20,
    color: '#4B5563',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#6B46C1',
  },
  benefitsContainer: {
    marginBottom: 25,
  },
  benefitsTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 10,
  },
  benefitText: {
    fontFamily: 'VendSans-Regular',
    fontSize: 15,
    color: '#4B5563',
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