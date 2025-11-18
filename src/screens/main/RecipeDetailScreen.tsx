import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe } from '../../context/RecipeContext';

export default function RecipeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userData, updateUserData } = useUser();
  const { currentRecipe, setCurrentRecipe, getRecipeById, updateRecipe } = useRecipe();

  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'nutrition'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);

  // Get recipe from navigation params or current recipe
  const recipeId = route.params?.recipeId;
  const recipe = recipeId ? getRecipeById(recipeId) : currentRecipe;

  useEffect(() => {
    if (recipe) {
      setCurrentRecipe(recipe);
      setIsFavorite(recipe.isFavorite);
      setRating(recipe.rating || 0);
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 18 }}>Recipe not found</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                <Text style={{ color: 'white', textDecorationLine: 'underline' }}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        
      </View>
    );
  }

  const handleStartCooking = () => {
    if (!recipe) return;
    // Track when user starts cooking a recipe
    updateUserData({
      totalRecipes: userData.totalRecipes + 1
    });
    navigation.navigate('EquipmentChecklist');
  };

  const handleRateRecipe = (newRating: number) => {
    if (!recipe) return;
    setRating(newRating);
    updateRecipe(recipe.id, { rating: newRating });
    setTimeout(() => setShowRatingModal(false), 500);
  };

  const handleToggleFavorite = () => {
    if (!recipe) return;
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    updateRecipe(recipe.id, { isFavorite: newFavoriteStatus });
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
              <Text style={styles.headerTitle}>Recipe Details</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleToggleFavorite}
                >
                  <Text style={styles.actionIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionIcon}>📤</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recipe Card */}
            <View style={styles.recipeCard}>
              {/* Recipe Header */}
              <View style={styles.recipeHeader}>
                <View style={styles.imageContainer}>
                  <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeDescription}>{recipe.description}</Text>
                  
                  {/* Quick Stats */}
                  <View style={styles.quickStats}>
                    <View style={styles.quickStat}>
                      <Text style={styles.quickStatIcon}>⏱️</Text>
                      <Text style={styles.quickStatText}>{recipe.totalTime} min</Text>
                    </View>
                    <View style={styles.quickStat}>
                      <Text style={styles.quickStatIcon}>👥</Text>
                      <Text style={styles.quickStatText}>{recipe.servings} servings</Text>
                    </View>
                    <View style={styles.quickStat}>
                      <Text style={styles.quickStatIcon}>📊</Text>
                      <Text style={styles.quickStatText}>{recipe.difficulty}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Rating and History */}
              <View style={styles.historySection}>
                <TouchableOpacity 
                  style={styles.ratingContainer}
                  onPress={() => setShowRatingModal(true)}
                >
                  <View style={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text key={star} style={styles.star}>
                        {star <= rating ? '⭐' : '☆'}
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.ratingText}>Tap to rate</Text>
                </TouchableOpacity>
                
                <View style={styles.historyStats}>
                  <Text style={styles.historyText}>
                    Cooked {recipe.cookedCount} times{recipe.lastCooked ? ` • Last: ${recipe.lastCooked}` : ''}
                  </Text>
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
                  onPress={() => setActiveTab('overview')}
                >
                  <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                    Overview
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]}
                  onPress={() => setActiveTab('ingredients')}
                >
                  <Text style={[styles.tabText, activeTab === 'ingredients' && styles.tabTextActive]}>
                    Ingredients
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'nutrition' && styles.tabActive]}
                  onPress={() => setActiveTab('nutrition')}
                >
                  <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>
                    Nutrition
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <View style={styles.tabContent}>
                {activeTab === 'overview' && (
                  <View style={styles.overviewContent}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {recipe.instructions.map((step, index) => (
                      <View key={step.id} style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                          <Text style={styles.instructionNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.instructionText}>{step.instruction}</Text>
                      </View>
                    ))}
                    
                    {recipe.notes && (
                      <>
                        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Chef's Notes</Text>
                        <Text style={styles.notesText}>{recipe.notes}</Text>
                      </>
                    )}

                    <View style={styles.tagsContainer}>
                      {recipe.tags.map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {activeTab === 'ingredients' && (
                  <View style={styles.ingredientsContent}>
                    <Text style={styles.sectionTitle}>
                      Ingredients for {recipe.servings} servings
                    </Text>
                    {recipe.ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <View style={styles.ingredientMain}>
                          <Text style={styles.ingredientAmount}>
                            {ingredient.amount} {ingredient.unit}
                          </Text>
                          <Text style={styles.ingredientName}>{ingredient.item}</Text>
                        </View>
                        {ingredient.calories > 0 && (
                          <Text style={styles.ingredientCalories}>{ingredient.calories} cal</Text>
                        )}
                      </View>
                    ))}
                    
                    <TouchableOpacity style={styles.addToListButton}>
                      <Text style={styles.addToListIcon}>🛒</Text>
                      <Text style={styles.addToListText}>Add to Shopping List</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === 'nutrition' && (
                  <View style={styles.nutritionContent}>
                    <Text style={styles.sectionTitle}>Nutrition Facts</Text>
                    <Text style={styles.servingSizeText}>Per serving</Text>
                    
                    <View style={styles.mainMacros}>
                      <View style={styles.mainMacro}>
                        <Text style={styles.mainMacroValue}>{recipe.calories}</Text>
                        <Text style={styles.mainMacroLabel}>Calories</Text>
                      </View>
                      <View style={styles.mainMacro}>
                        <Text style={styles.mainMacroValue}>{recipe.protein}g</Text>
                        <Text style={styles.mainMacroLabel}>Protein</Text>
                      </View>
                      <View style={styles.mainMacro}>
                        <Text style={styles.mainMacroValue}>{recipe.carbs}g</Text>
                        <Text style={styles.mainMacroLabel}>Carbs</Text>
                      </View>
                      <View style={styles.mainMacro}>
                        <Text style={styles.mainMacroValue}>{recipe.fats}g</Text>
                        <Text style={styles.mainMacroLabel}>Fats</Text>
                      </View>
                    </View>

                    <View style={styles.detailedNutrition}>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Fiber</Text>
                        <Text style={styles.nutritionValue}>{recipe.fiber}g</Text>
                      </View>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Sugar</Text>
                        <Text style={styles.nutritionValue}>{recipe.sugar}g</Text>
                      </View>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Sodium</Text>
                        <Text style={styles.nutritionValue}>{recipe.sodium}mg</Text>
                      </View>
                      <View style={styles.nutritionRow}>
                        <Text style={styles.nutritionLabel}>Cholesterol</Text>
                        <Text style={styles.nutritionValue}>{recipe.cholesterol}mg</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Start Cooking Button */}
              <TouchableOpacity
                style={styles.startCookingButton}
                onPress={handleStartCooking}
                activeOpacity={0.8}
              >
                <Text style={styles.startCookingText}>Start Cooking →</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.secondaryActionButton}>
                <Text style={styles.secondaryActionIcon}>✏️</Text>
                <Text style={styles.secondaryActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryActionButton}>
                <Text style={styles.secondaryActionIcon}>📅</Text>
                <Text style={styles.secondaryActionText}>Schedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryActionButton}>
                <Text style={styles.secondaryActionIcon}>🗑️</Text>
                <Text style={styles.secondaryActionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRatingModal(false)}
        >
          <View style={styles.ratingModal}>
            <Text style={styles.ratingModalTitle}>Rate this recipe</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRateRecipe(star)}
                >
                  <Text style={styles.ratingStar}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
    color: '#1F2937',
    fontSize: 24,
    fontFamily: 'VendSans-Regular',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
    fontFamily: 'VendSans-Regular',
  },
  recipeCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  recipeHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recipeEmoji: {
    fontSize: 40,
    fontFamily: 'VendSans-Regular',
  },
  titleContainer: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 6,
    fontFamily: 'VendSans-Bold',
  },
  recipeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
    fontFamily: 'VendSans-Regular',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 16,
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickStatIcon: {
    fontSize: 12,
    fontFamily: 'VendSans-Regular',
  },
  quickStatText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  star: {
    fontSize: 16,
    marginRight: 2,
    fontFamily: 'VendSans-Regular',
  },
  ratingText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  historyStats: {
    flexDirection: 'row',
  },
  historyText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6B46C1',
  },
  tabText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Medium',
  },
  tabTextActive: {
    color: '#6B46C1',
  },
  tabContent: {
    minHeight: 200,
    marginBottom: 20,
  },
  overviewContent: {},
  sectionTitle: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    fontFamily: 'VendSans-SemiBold',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    color: '#6B46C1',
    fontFamily: 'VendSans-SemiBold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: 'VendSans-Regular',
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontStyle: 'italic',
    fontFamily: 'VendSans-Regular',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6B46C1',
    fontFamily: 'VendSans-Medium',
  },
  ingredientsContent: {},
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  ingredientMain: {
    flex: 1,
  },
  ingredientAmount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
    fontFamily: 'VendSans-Regular',
  },
  ingredientName: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'VendSans-Regular',
  },
  ingredientCalories: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  addToListButton: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  addToListIcon: {
    fontSize: 16,
    fontFamily: 'VendSans-Regular',
  },
  addToListText: {
    fontSize: 14,
    color: '#6B46C1',
    fontFamily: 'VendSans-SemiBold',
  },
  nutritionContent: {},
  servingSizeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
    fontFamily: 'VendSans-Regular',
  },
  mainMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  mainMacro: {
    alignItems: 'center',
  },
  mainMacroValue: {
    fontSize: 20,
    color: '#6B46C1',
    marginBottom: 4,
    fontFamily: 'VendSans-Bold',
  },
  mainMacroLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  detailedNutrition: {},
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'VendSans-Regular',
  },
  nutritionValue: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'VendSans-Medium',
  },
  startCookingButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  startCookingText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  secondaryActionButton: {
    alignItems: 'center',
  },
  secondaryActionIcon: {
    fontSize: 20,
    marginBottom: 4,
    fontFamily: 'VendSans-Regular',
  },
  secondaryActionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'VendSans-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  ratingModalTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingStar: {
    fontSize: 32,
    fontFamily: 'VendSans-Regular',
  },
});