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
    id: '1',
    title: 'Mediterranean Grilled Chicken Bowl',
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
    ingredients: [
      {
        id: '1',
        category: 'Proteins',
        amount: '2',
        unit: 'pieces',
        item: 'Chicken breasts (6 oz each)',
        notes: 'Can substitute with thighs',
        calories: 280
      },
      {
        id: '2',
        category: 'Grains',
        amount: '1',
        unit: 'cup',
        item: 'Quinoa, uncooked',
        calories: 110
      },
      {
        id: '3',
        category: 'Vegetables',
        amount: '2',
        unit: 'cups',
        item: 'Mixed greens',
        calories: 10
      },
      {
        id: '4',
        category: 'Vegetables',
        amount: '1',
        unit: 'medium',
        item: 'Cucumber',
        notes: 'Diced',
        calories: 8
      },
      {
        id: '5',
        category: 'Vegetables',
        amount: '1',
        unit: 'cup',
        item: 'Cherry tomatoes',
        notes: 'Halved',
        calories: 15
      },
      {
        id: '6',
        category: 'Vegetables',
        amount: '1/2',
        unit: 'cup',
        item: 'Red onion',
        notes: 'Thinly sliced',
        calories: 12
      },
      {
        id: '7',
        category: 'Dairy',
        amount: '1/4',
        unit: 'cup',
        item: 'Feta cheese',
        notes: 'Crumbled',
        calories: 40
      },
      {
        id: '8',
        category: 'Pantry',
        amount: '2',
        unit: 'tbsp',
        item: 'Olive oil',
        calories: 60,
        inPantry: true
      },
      {
        id: '9',
        category: 'Pantry',
        amount: '1',
        unit: 'tsp',
        item: 'Dried oregano',
        calories: 0,
        inPantry: true
      },
      {
        id: '10',
        category: 'Pantry',
        amount: '2',
        unit: 'cloves',
        item: 'Garlic',
        notes: 'Minced',
        calories: 5
      },
      {
        id: '11',
        category: 'Pantry',
        amount: '1',
        unit: 'whole',
        item: 'Lemon',
        notes: 'For juice and zest',
        calories: 10
      },
      {
        id: '12',
        category: 'Pantry',
        amount: 'To taste',
        unit: '',
        item: 'Salt and pepper',
        calories: 0,
        inPantry: true
      }
    ],
    instructions: [
      {
        id: '1',
        title: 'Prep Ingredients',
        instruction: 'Season chicken breasts on both sides with oregano, minced garlic, salt, and pepper. Let rest at room temperature while you prepare other ingredients.',
        time: 5,
        tip: 'Pat chicken dry with paper towels for better searing'
      },
      {
        id: '2',
        title: 'Cook Quinoa',
        instruction: 'Bring 2 cups of water to a boil in a medium saucepan. Add 1 cup quinoa, reduce heat to low, cover, and simmer for 15 minutes.',
        time: 15,
        tip: 'Add a pinch of salt to the water for more flavor'
      },
      {
        id: '3',
        title: 'Prepare Vegetables',
        instruction: 'While quinoa cooks, dice cucumber, halve cherry tomatoes, and thinly slice red onion. Place in a large bowl.',
        time: 5
      },
      {
        id: '4',
        title: 'Heat the Pan',
        instruction: 'Heat 1 tablespoon olive oil in a grill pan or skillet over medium-high heat. The pan is ready when a drop of water sizzles.',
        time: 2,
        warning: "Don't let the oil smoke - reduce heat if needed"
      },
      {
        id: '5',
        title: 'Cook Chicken',
        instruction: 'Place seasoned chicken in the hot pan. Cook for 6-7 minutes without moving. Flip and cook another 6-7 minutes.',
        time: 14,
        warning: 'Internal temp should reach 165°F (74°C)'
      },
      {
        id: '6',
        title: 'Rest the Chicken',
        instruction: 'Transfer cooked chicken to a cutting board and let rest for 5 minutes. This allows juices to redistribute.',
        time: 5,
        tip: 'Cover loosely with foil to keep warm'
      },
      {
        id: '7',
        title: 'Dress Vegetables',
        instruction: 'Add remaining olive oil and lemon juice to the bowl of vegetables. Toss to combine. Season with salt and pepper.',
        time: 2
      },
      {
        id: '8',
        title: 'Slice Chicken',
        instruction: 'Slice rested chicken breasts diagonally into 1/2 inch thick slices.',
        time: 2,
        tip: 'Cut against the grain for more tender pieces'
      },
      {
        id: '9',
        title: 'Fluff Quinoa',
        instruction: 'Remove quinoa from heat and let stand 5 minutes. Fluff with a fork.',
        time: 5
      },
      {
        id: '10',
        title: 'Assemble Bowls',
        instruction: 'Divide quinoa between bowls. Top with mixed greens, dressed vegetables, sliced chicken, and crumbled feta. Drizzle any remaining dressing.',
        time: 3,
        tip: 'Warm the bowls for a restaurant-style presentation'
      }
    ],
    equipment: [
      {
        id: '1',
        name: 'Large Skillet or Grill Pan',
        emoji: '🍳',
        essential: true
      },
      {
        id: '2',
        name: 'Medium Saucepan',
        emoji: '🍲',
        essential: true
      },
      {
        id: '3',
        name: 'Cutting Board',
        emoji: '🔪',
        essential: true
      },
      {
        id: '4',
        name: 'Sharp Knife',
        emoji: '🔪',
        essential: true
      },
      {
        id: '5',
        name: 'Mixing Bowl',
        emoji: '🥣',
        essential: true
      },
      {
        id: '6',
        name: 'Measuring Cups',
        emoji: '📏',
        essential: true
      },
      {
        id: '7',
        name: 'Measuring Spoons',
        emoji: '🥄',
        essential: true
      },
      {
        id: '8',
        name: 'Meat Thermometer',
        emoji: '🌡️',
        essential: false,
        alternative: 'Check by cutting into thickest part'
      },
      {
        id: '9',
        name: 'Tongs',
        emoji: '🥢',
        essential: false,
        alternative: 'Use a spatula'
      },
      {
        id: '10',
        name: 'Serving Bowls',
        emoji: '🍽️',
        essential: false
      }
    ],
    tags: ['High Protein', 'Gluten-Free', 'Mediterranean', 'Meal Prep'],
    cookedCount: 3,
    lastCooked: '3 days ago',
    createdDate: 'Jan 15, 2024',
    notes: 'Great for meal prep. Can substitute chicken with tofu for vegetarian option.',
    rating: 4,
    isFavorite: true,
    mealType: 'lunch'
  },
  {
    id: '2',
    title: 'Protein Pancakes',
    description: 'Fluffy high-protein pancakes perfect for a post-workout breakfast',
    emoji: '🥞',
    prepTime: 5,
    cookTime: 15,
    totalTime: 20,
    servings: 2,
    difficulty: 'Easy',
    calories: 320,
    protein: 28,
    carbs: 35,
    fats: 8,
    fiber: 4,
    sugar: 8,
    sodium: 380,
    cholesterol: 185,
    ingredients: [
      { id: '1', category: 'Proteins', amount: '2', unit: 'whole', item: 'Eggs', calories: 140 },
      { id: '2', category: 'Grains', amount: '1', unit: 'cup', item: 'Oat flour', calories: 110 },
      { id: '3', category: 'Dairy', amount: '1/2', unit: 'cup', item: 'Greek yogurt', calories: 70 }
    ],
    instructions: [
      { id: '1', title: 'Mix Batter', instruction: 'Combine all ingredients in a bowl and mix until smooth', time: 3 },
      { id: '2', title: 'Heat Pan', instruction: 'Heat griddle over medium heat', time: 2 },
      { id: '3', title: 'Cook Pancakes', instruction: 'Pour batter and cook until bubbles form, then flip', time: 15 }
    ],
    equipment: [
      { id: '1', name: 'Mixing Bowl', emoji: '🥣', essential: true },
      { id: '2', name: 'Griddle or Pan', emoji: '🍳', essential: true },
      { id: '3', name: 'Spatula', emoji: '🥄', essential: true }
    ],
    tags: ['High Protein', 'Breakfast', 'Quick'],
    cookedCount: 5,
    lastCooked: '1 day ago',
    createdDate: 'Jan 14, 2024',
    rating: 4,
    isFavorite: true,
    mealType: 'breakfast'
  },
  {
    id: '3',
    title: 'Teriyaki Salmon',
    description: 'Glazed salmon with a sweet and savory teriyaki sauce',
    emoji: '🍣',
    prepTime: 10,
    cookTime: 15,
    totalTime: 25,
    servings: 2,
    difficulty: 'Medium',
    calories: 410,
    protein: 38,
    carbs: 22,
    fats: 18,
    fiber: 2,
    sugar: 12,
    sodium: 680,
    cholesterol: 85,
    ingredients: [
      { id: '1', category: 'Proteins', amount: '2', unit: 'fillets', item: 'Salmon (6 oz each)', calories: 340 },
      { id: '2', category: 'Pantry', amount: '1/4', unit: 'cup', item: 'Teriyaki sauce', calories: 60, inPantry: true },
      { id: '3', category: 'Vegetables', amount: '1', unit: 'cup', item: 'Broccoli', calories: 10 }
    ],
    instructions: [
      { id: '1', title: 'Prep Salmon', instruction: 'Pat salmon dry and season lightly', time: 5 },
      { id: '2', title: 'Sear Salmon', instruction: 'Sear salmon skin-side down for 5 minutes', time: 5 },
      { id: '3', title: 'Add Glaze', instruction: 'Flip, add teriyaki sauce, and cook until done', time: 5 }
    ],
    equipment: [
      { id: '1', name: 'Large Skillet', emoji: '🍳', essential: true },
      { id: '2', name: 'Spatula', emoji: '🥄', essential: true }
    ],
    tags: ['High Protein', 'Quick', 'Asian'],
    cookedCount: 2,
    lastCooked: '5 days ago',
    createdDate: 'Jan 13, 2024',
    rating: 5,
    isFavorite: false,
    mealType: 'dinner'
  },
  {
    id: '4',
    title: 'Greek Yogurt Parfait',
    description: 'Layered yogurt with fresh berries and granola',
    emoji: '🍓',
    prepTime: 5,
    cookTime: 0,
    totalTime: 10,
    servings: 1,
    difficulty: 'Easy',
    calories: 250,
    protein: 18,
    carbs: 32,
    fats: 6,
    fiber: 5,
    sugar: 18,
    sodium: 75,
    cholesterol: 10,
    ingredients: [
      { id: '1', category: 'Dairy', amount: '1', unit: 'cup', item: 'Greek yogurt', calories: 140 },
      { id: '2', category: 'Grains', amount: '1/4', unit: 'cup', item: 'Granola', calories: 110 },
      { id: '3', category: 'Vegetables', amount: '1/2', unit: 'cup', item: 'Mixed berries', calories: 40 }
    ],
    instructions: [
      { id: '1', title: 'Layer Ingredients', instruction: 'Layer yogurt, berries, and granola in a glass or bowl', time: 5 },
      { id: '2', title: 'Serve', instruction: 'Top with extra berries and enjoy immediately', time: 1 }
    ],
    equipment: [
      { id: '1', name: 'Bowl or Glass', emoji: '🥣', essential: true }
    ],
    tags: ['Healthy', 'Quick', 'No Cook', 'Snack'],
    cookedCount: 8,
    createdDate: 'Jan 12, 2024',
    isFavorite: false,
    mealType: 'snack'
  },
  {
    id: '5',
    title: 'Beef Stir Fry',
    description: 'Quick and flavorful beef stir fry with crisp vegetables',
    emoji: '🥘',
    prepTime: 15,
    cookTime: 15,
    totalTime: 30,
    servings: 2,
    difficulty: 'Medium',
    calories: 520,
    protein: 45,
    carbs: 28,
    fats: 24,
    fiber: 6,
    sugar: 8,
    sodium: 780,
    cholesterol: 110,
    ingredients: [
      { id: '1', category: 'Proteins', amount: '12', unit: 'oz', item: 'Beef sirloin, sliced thin', calories: 380 },
      { id: '2', category: 'Vegetables', amount: '2', unit: 'cups', item: 'Mixed stir fry vegetables', calories: 50 },
      { id: '3', category: 'Pantry', amount: '3', unit: 'tbsp', item: 'Soy sauce', calories: 30, inPantry: true }
    ],
    instructions: [
      { id: '1', title: 'Prep Ingredients', instruction: 'Slice beef and prepare vegetables', time: 10 },
      { id: '2', title: 'Sear Beef', instruction: 'Cook beef in hot wok until browned', time: 5 },
      { id: '3', title: 'Add Vegetables', instruction: 'Add vegetables and sauce, toss until cooked', time: 5 }
    ],
    equipment: [
      { id: '1', name: 'Wok or Large Pan', emoji: '🍳', essential: true },
      { id: '2', name: 'Sharp Knife', emoji: '🔪', essential: true },
      { id: '3', name: 'Cutting Board', emoji: '🔪', essential: true }
    ],
    tags: ['High Protein', 'Quick', 'Asian'],
    cookedCount: 4,
    lastCooked: '2 days ago',
    createdDate: 'Jan 11, 2024',
    rating: 4,
    isFavorite: true,
    mealType: 'dinner'
  },
  {
    id: '6',
    title: 'Overnight Oats',
    description: 'Prep-ahead breakfast that\'s ready when you wake up',
    emoji: '🥣',
    prepTime: 5,
    cookTime: 0,
    totalTime: 5,
    servings: 1,
    difficulty: 'Easy',
    calories: 280,
    protein: 12,
    carbs: 45,
    fats: 6,
    fiber: 8,
    sugar: 12,
    sodium: 120,
    cholesterol: 5,
    ingredients: [
      { id: '1', category: 'Grains', amount: '1/2', unit: 'cup', item: 'Rolled oats', calories: 150 },
      { id: '2', category: 'Dairy', amount: '1/2', unit: 'cup', item: 'Milk', calories: 60 },
      { id: '3', category: 'Pantry', amount: '1', unit: 'tbsp', item: 'Chia seeds', calories: 60, inPantry: true }
    ],
    instructions: [
      { id: '1', title: 'Mix Ingredients', instruction: 'Combine oats, milk, and chia seeds in a jar', time: 3 },
      { id: '2', title: 'Refrigerate', instruction: 'Refrigerate overnight or at least 4 hours', time: 1 },
      { id: '3', title: 'Serve', instruction: 'Top with your favorite toppings and enjoy', time: 1 }
    ],
    equipment: [
      { id: '1', name: 'Mason Jar or Container', emoji: '🥣', essential: true }
    ],
    tags: ['Meal Prep', 'No Cook', 'Breakfast', 'Healthy'],
    cookedCount: 10,
    createdDate: 'Jan 10, 2024',
    isFavorite: false,
    mealType: 'breakfast'
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
    navigation.navigate('Payment');
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
            <Text style={styles.progressText}>Step 9 of 10</Text>
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
                <Text style={styles.recipeEmoji}>{currentRecipe.emoji}</Text>
              </View>

              {/* Recipe Details */}
              <View style={styles.recipeDetails}>
                <Text style={styles.recipeTitle} numberOfLines={2}>{currentRecipe.title}</Text>
                <Text style={styles.recipeDescription} numberOfLines={3}>{currentRecipe.description}</Text>

                {/* Quick Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statIcon}>⏱️</Text>
                    <Text style={styles.statValue}>{currentRecipe.totalTime}</Text>
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
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Quicksand-Light',
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
    fontFamily: 'Quicksand-Regular',
    color: '#40916C',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
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
    minHeight: 400,
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
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 8,
    height: 30,
  },
  recipeDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
    height: 45,
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
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  macroValue: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#1B4332',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
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
    fontFamily: 'Quicksand-Regular',
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
    backgroundColor: '#1B4332',
  },
  benefitsContainer: {
    marginBottom: 25,
  },
  benefitsTitle: {
    fontFamily: 'Quicksand-Bold',
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
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    color: '#4B5563',
  },
  continueButton: {
    backgroundColor: '#1B4332',
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
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});