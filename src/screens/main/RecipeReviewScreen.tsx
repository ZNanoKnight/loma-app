import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

export default function RecipeReviewScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  const [notes, setNotes] = useState('');

  // Mock recipe data - in production, this would come from the previous screen
  const recipe = {
    id: '1',
    title: 'Mediterranean Chicken Bowl',
    description: 'A protein-packed, flavorful bowl with perfectly seasoned chicken, quinoa, and fresh vegetables',
    emoji: '🥗',
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 2,
    difficulty: 'Easy',
    calories: 485,
    protein: 42,
    carbs: 38,
    fats: 18,
    fiber: 8,
    sugar: 6,
    sodium: 580,
    cholesterol: 95,
  };

  const handleSaveToRecipeBook = () => {
    // Add the recipe to the user's saved recipes
    const recipeToSave = {
      ...recipe,
      notes: notes.trim(),
      savedAt: new Date().toISOString(),
    };

    const updatedSavedRecipes = [...userData.savedRecipes, recipeToSave];

    updateUserData({
      savedRecipes: updatedSavedRecipes,
      totalRecipes: userData.totalRecipes + 1,
    });

    // Navigate to Recipe Book in the Recipes tab
    navigation.navigate('RecipesTab', {
      screen: 'RecipeBook',
      params: { newRecipe: recipeToSave }
    });
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Review Recipe</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Recipe Card */}
          <View style={styles.recipeCard}>
            {/* Emoji */}
            <View style={styles.emojiContainer}>
              <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
            </View>

            {/* Recipe Title & Description */}
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>

            {/* Time Information */}
            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>⏱️</Text>
                <View>
                  <Text style={styles.timeValue}>{recipe.prepTime} min</Text>
                  <Text style={styles.timeLabel}>Prep</Text>
                </View>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>🔥</Text>
                <View>
                  <Text style={styles.timeValue}>{recipe.cookTime} min</Text>
                  <Text style={styles.timeLabel}>Cook</Text>
                </View>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeIcon}>⏰</Text>
                <View>
                  <Text style={styles.timeValue}>{recipe.totalTime} min</Text>
                  <Text style={styles.timeLabel}>Total</Text>
                </View>
              </View>
            </View>

            {/* Macros Section */}
            <View style={styles.macrosSection}>
              <Text style={styles.sectionTitle}>Nutrition per serving</Text>
              <View style={styles.macrosGrid}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{recipe.calories}</Text>
                  <Text style={styles.macroLabel}>Calories</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{recipe.protein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{recipe.carbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{recipe.fats}g</Text>
                  <Text style={styles.macroLabel}>Fats</Text>
                </View>
              </View>

              {/* Additional Macros */}
              <View style={styles.additionalMacros}>
                <View style={styles.additionalMacroRow}>
                  <Text style={styles.additionalMacroLabel}>Fiber</Text>
                  <Text style={styles.additionalMacroValue}>{recipe.fiber}g</Text>
                </View>
                <View style={styles.additionalMacroRow}>
                  <Text style={styles.additionalMacroLabel}>Sugar</Text>
                  <Text style={styles.additionalMacroValue}>{recipe.sugar}g</Text>
                </View>
                <View style={styles.additionalMacroRow}>
                  <Text style={styles.additionalMacroLabel}>Sodium</Text>
                  <Text style={styles.additionalMacroValue}>{recipe.sodium}mg</Text>
                </View>
                <View style={styles.additionalMacroRow}>
                  <Text style={styles.additionalMacroLabel}>Cholesterol</Text>
                  <Text style={styles.additionalMacroValue}>{recipe.cholesterol}mg</Text>
                </View>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Personal Notes (Optional)</Text>
              <Text style={styles.notesSubtitle}>
                Add any modifications, substitutions, or reminders
              </Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={(text) => {
                  if (text.length <= 1000) {
                    setNotes(text);
                  }
                }}
                placeholder="e.g., 'Use chicken thighs instead of breasts' or 'Add extra garlic'"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {notes.length}/1000 characters
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveToRecipeBook}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save to Recipe Book</Text>
          </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontFamily: 'Quicksand-Regular',
    color: '#1F2937',
    fontSize: 24,
  },
  headerTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  recipeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recipeEmoji: {
    fontSize: 80,
  },
  recipeTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 26,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  recipeDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    fontSize: 24,
  },
  timeValue: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#1F2937',
  },
  timeLabel: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  macrosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: '#6B46C1',
    marginBottom: 4,
  },
  macroLabel: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  additionalMacros: {
    gap: 12,
  },
  additionalMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  additionalMacroLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  additionalMacroValue: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  notesSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  notesInput: {
    fontFamily: 'Quicksand-Regular',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
  },
});
