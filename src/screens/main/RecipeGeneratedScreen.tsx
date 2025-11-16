import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';  // ADD THIS

export default function RecipeGeneratorScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Mock recipe data - in production, this would come from AI generation
  const recipe = {
    title: "Mediterranean Grilled Chicken Bowl",
    description: "A protein-packed, flavorful bowl with perfectly seasoned chicken, quinoa, and fresh vegetables",
    image: "🥗",
    prepTime: 15,
    cookTime: 20,
    totalTime: 35,
    servings: 2,
    difficulty: "Easy",
    calories: 485,
    protein: 42,
    carbs: 38,
    fats: 18,
    ingredients: [
      { amount: "2", unit: "pieces", item: "Chicken breasts (6 oz each)" },
      { amount: "1", unit: "cup", item: "Quinoa, uncooked" },
      { amount: "2", unit: "cups", item: "Mixed greens" },
      { amount: "1", unit: "medium", item: "Cucumber, diced" },
      { amount: "1", unit: "cup", item: "Cherry tomatoes, halved" },
      { amount: "1/2", unit: "cup", item: "Red onion, sliced" },
      { amount: "1/4", unit: "cup", item: "Feta cheese, crumbled" },
      { amount: "2", unit: "tbsp", item: "Olive oil" },
      { amount: "1", unit: "tsp", item: "Oregano" },
      { amount: "2", unit: "cloves", item: "Garlic, minced" },
    ],
    tags: ["High Protein", "Gluten-Free", "Mediterranean", "Meal Prep"]
  };

  const handleRegenerate = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      updateUserData({  // ADD THIS - increment recipes generated
        totalRecipes: userData.totalRecipes + 1
      });
      setIsLoading(false);
      // In production, this would fetch new recipe
    }, 1500);
  };

  const handleSaveRecipe = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {  // ADD THIS - save to global state when saving
      const updatedSavedRecipes = [...userData.savedRecipes, recipe];
      updateUserData({ 
        savedRecipes: updatedSavedRecipes 
      });
    }
    // In production, this would also save to database
  };

  const handleStartCooking = () => {
    navigation.navigate('EquipmentChecklist');
  };

  const handleCustomize = () => {
    // Navigate to customization screen or open modal
    console.log('Customize recipe');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
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
              <Text style={styles.headerTitle}>Your Recipe</Text>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveRecipe}
              >
                <Text style={styles.saveIcon}>{isSaved ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>Generating new recipe...</Text>
              </View>
            ) : (
              <>
                {/* Recipe Card */}
                <View style={styles.recipeCard}>
                  {/* Recipe Image */}
                  <View style={styles.imageContainer}>
                    <Text style={styles.recipeEmoji}>{recipe.image}</Text>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
                    </View>
                  </View>

                  {/* Recipe Info */}
                  <View style={styles.recipeInfo}>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <Text style={styles.recipeDescription}>{recipe.description}</Text>

                    {/* Time Stats */}
                    <View style={styles.timeStats}>
                      <View style={styles.timeStat}>
                        <Text style={styles.timeIcon}>⏱️</Text>
                        <View>
                          <Text style={styles.timeValue}>{recipe.prepTime} min</Text>
                          <Text style={styles.timeLabel}>Prep</Text>
                        </View>
                      </View>
                      <View style={styles.timeStat}>
                        <Text style={styles.timeIcon}>🔥</Text>
                        <View>
                          <Text style={styles.timeValue}>{recipe.cookTime} min</Text>
                          <Text style={styles.timeLabel}>Cook</Text>
                        </View>
                      </View>
                      <View style={styles.timeStat}>
                        <Text style={styles.timeIcon}>⏰</Text>
                        <View>
                          <Text style={styles.timeValue}>{recipe.totalTime} min</Text>
                          <Text style={styles.timeLabel}>Total</Text>
                        </View>
                      </View>
                    </View>

                    {/* Macros */}
                    <View style={styles.macrosContainer}>
                      <Text style={styles.macrosTitle}>Nutrition per serving</Text>
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
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsContainer}>
                      {recipe.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Ingredients Preview */}
                    <View style={styles.ingredientsPreview}>
                      <Text style={styles.ingredientsTitle}>
                        Ingredients ({recipe.ingredients.length} items)
                      </Text>
                      <View style={styles.ingredientsList}>
                        {recipe.ingredients.slice(0, 3).map((ing, index) => (
                          <Text key={index} style={styles.ingredientItem}>
                            • {ing.amount} {ing.unit} {ing.item}
                          </Text>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <Text style={styles.moreIngredients}>
                            + {recipe.ingredients.length - 3} more ingredients
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleStartCooking}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.primaryButtonText}>Start Cooking →</Text>
                  </TouchableOpacity>

                  <View style={styles.secondaryButtons}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={handleCustomize}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.secondaryButtonIcon}>✏️</Text>
                      <Text style={styles.secondaryButtonText}>Customize</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={handleRegenerate}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.secondaryButtonIcon}>🔄</Text>
                      <Text style={styles.secondaryButtonText}>Regenerate</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                  <TouchableOpacity style={styles.quickAction}>
                    <Text style={styles.quickActionIcon}>📤</Text>
                    <Text style={styles.quickActionText}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction}>
                    <Text style={styles.quickActionIcon}>🛒</Text>
                    <Text style={styles.quickActionText}>Shop</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction}>
                    <Text style={styles.quickActionIcon}>📅</Text>
                    <Text style={styles.quickActionText}>Plan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickAction}>
                    <Text style={styles.quickActionIcon}>📝</Text>
                    <Text style={styles.quickActionText}>Notes</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIcon: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    height: 180,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  recipeEmoji: {
    fontSize: 80,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  recipeInfo: {
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    fontSize: 20,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  macrosContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  macrosTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '600',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  ingredientsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  ingredientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 6,
  },
  ingredientItem: {
    fontSize: 14,
    color: '#6B7280',
  },
  moreIngredients: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButtons: {
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonIcon: {
    fontSize: 16,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});