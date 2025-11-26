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
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe } from '../../context/RecipeContext';
import { AuthService } from '../../services/auth/authService';
import { RecipeService } from '../../services/recipes/recipeService';

export default function RecipeReviewScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  const { currentRecipe, setCurrentRecipe } = useRecipe();
  const [refinementRequest, setRefinementRequest] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Use recipe from context (set by RecipeGeneratedScreen)
  const recipe = currentRecipe || {
    id: '',
    title: 'No Recipe Selected',
    description: 'Please select a recipe first',
    emoji: '🍽️',
    prepTime: 0,
    cookTime: 0,
    totalTime: 0,
    servings: 1,
    difficulty: 'Easy',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    mealType: 'dinner' as const,
    ingredients: [],
    instructions: [],
    equipment: [],
    tags: [],
  };

  const handleSaveToRecipeBook = async () => {
    if (!recipe.id) {
      Alert.alert('Error', 'No recipe selected. Please go back and select a recipe.');
      return;
    }

    setIsSaving(true);

    try {
      // Get current session for user ID
      const session = await AuthService.getCurrentSession();
      if (!session) {
        Alert.alert('Error', 'Please sign in to save recipes.');
        setIsSaving(false);
        return;
      }

      // Save recipe to Supabase (creates user_recipes entry)
      await RecipeService.saveRecipe(session.user.id, recipe.id);

      console.log('[RecipeReviewScreen] Recipe saved successfully:', recipe.id);

      // Update local user data for stats
      updateUserData({
        totalRecipes: userData.totalRecipes + 1,
      });

      // Navigate to Recipe Saved congratulations screen
      navigation.navigate('RecipeSaved', { wasRefined: false });
    } catch (error) {
      console.error('[RecipeReviewScreen] Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefineRecipe = async () => {
    if (!recipe.id) {
      Alert.alert('Error', 'No recipe selected. Please go back and select a recipe.');
      return;
    }

    if (!refinementRequest.trim()) {
      Alert.alert('Error', 'Please describe what changes you would like to make.');
      return;
    }

    setIsRefining(true);

    try {
      // Get current session for user ID
      const session = await AuthService.getCurrentSession();
      if (!session) {
        Alert.alert('Error', 'Please sign in to refine recipes.');
        setIsRefining(false);
        return;
      }

      console.log('[RecipeReviewScreen] Refining recipe:', recipe.id);

      // Call the refine recipe service
      const refinedRecipe = await RecipeService.refineRecipe({
        recipeId: recipe.id,
        refinementRequest: refinementRequest.trim(),
        originalRecipe: {
          title: recipe.title,
          description: recipe.description,
          emoji: recipe.emoji,
          mealType: recipe.mealType,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          totalTime: recipe.totalTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          calories: recipe.calories,
          protein: recipe.protein,
          carbs: recipe.carbs,
          fats: recipe.fats,
          fiber: recipe.fiber,
          sugar: recipe.sugar,
          sodium: recipe.sodium,
          cholesterol: recipe.cholesterol,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          equipment: recipe.equipment,
          tags: recipe.tags,
        },
      });

      console.log('[RecipeReviewScreen] Recipe refined successfully:', refinedRecipe.id);

      // Update the current recipe in context with the refined version
      setCurrentRecipe(refinedRecipe as any);

      // Clear the refinement request
      setRefinementRequest('');

      // Update local user data for stats
      updateUserData({
        totalRecipes: userData.totalRecipes + 1,
      });

      // Navigate to Recipe Saved congratulations screen
      navigation.navigate('RecipeSaved', { wasRefined: true });
    } catch (error: any) {
      console.error('[RecipeReviewScreen] Error refining recipe:', error);
      Alert.alert(
        'Refinement Failed',
        error?.userMessage || 'Failed to refine recipe. Please try again.'
      );
    } finally {
      setIsRefining(false);
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

            {/* Refinement Section */}
            <View style={styles.refinementSection}>
              <Text style={styles.sectionTitle}>Refine This Recipe</Text>
              <Text style={styles.refinementSubtitle}>
                Want to make changes? Describe what you'd like to modify and we'll update the recipe for you - no Munchies required!
              </Text>
              <TextInput
                style={styles.refinementInput}
                value={refinementRequest}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setRefinementRequest(text);
                  }
                }}
                placeholder="e.g., 'Make it vegetarian', 'Reduce carbs', 'Use chicken thighs instead', 'Add more protein'"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                textAlignVertical="top"
                editable={!isRefining}
              />
              <Text style={styles.characterCount}>
                {refinementRequest.length}/500 characters
              </Text>

              {/* Refine Button */}
              <TouchableOpacity
                style={[
                  styles.refineButton,
                  (!refinementRequest.trim() || isRefining) && styles.refineButtonDisabled
                ]}
                onPress={handleRefineRecipe}
                activeOpacity={0.8}
                disabled={!refinementRequest.trim() || isRefining}
              >
                {isRefining ? (
                  <View style={styles.refiningContainer}>
                    <ActivityIndicator color="#6B46C1" size="small" />
                    <Text style={styles.refiningText}>Refining recipe...</Text>
                  </View>
                ) : (
                  <Text style={styles.refineButtonText}>Refine Recipe</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, (isSaving || isRefining) && styles.saveButtonDisabled]}
            onPress={handleSaveToRecipeBook}
            activeOpacity={0.8}
            disabled={isSaving || isRefining}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save to Recipe Book</Text>
            )}
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
  refinementSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  refinementSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  refinementInput: {
    fontFamily: 'Quicksand-Regular',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  refineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#6B46C1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  refineButtonDisabled: {
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  refineButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',
    fontSize: 16,
  },
  refiningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refiningText: {
    fontFamily: 'Quicksand-Medium',
    color: '#6B46C1',
    fontSize: 14,
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
});
