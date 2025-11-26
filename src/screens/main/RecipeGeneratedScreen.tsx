import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe } from '../../context/RecipeContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // Account for padding and gap

type RecipeGeneratedScreenRouteProp = RouteProp<
  {
    RecipeGenerated: {
      recipes: any[];
      selectedMealType: string;
    };
  },
  'RecipeGenerated'
>;

export default function RecipeGeneratedScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RecipeGeneratedScreenRouteProp>();
  const { userData } = useUser();
  const { setCurrentRecipe } = useRecipe();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  // Get AI-generated recipes from navigation params
  const { recipes = [], selectedMealType = '' } = route.params || {};

  // Validate we have recipes
  if (!recipes || recipes.length === 0) {
    Alert.alert(
      'No Recipes',
      'No recipes were generated. Please try again.',
      [
        {
          text: 'Go Back',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }

  // Transform recipes to display format
  const mealOptions = recipes.map((recipe) => ({
    id: recipe.id,
    title: recipe.title,
    emoji: recipe.emoji || '🍽️',
    calories: Math.round(recipe.calories || 0),
    protein: Math.round(recipe.protein || 0),
    carbs: Math.round(recipe.carbs || 0),
    fats: Math.round(recipe.fats || 0),
    fullRecipe: recipe, // Store full recipe for selection
  }));

  const handleMealSelect = (mealId: string) => {
    setSelectedMealId(mealId);
  };

  const handleSelectMeal = () => {
    if (selectedMealId) {
      // Find the selected recipe
      const selected = mealOptions.find((meal) => meal.id === selectedMealId);
      if (selected && selected.fullRecipe) {
        // Set current recipe in context
        setCurrentRecipe(selected.fullRecipe);

        // Navigate to the Recipe Review screen
        navigation.navigate('RecipeReview', {
          recipe: selected.fullRecipe,
        });
      }
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
            <Text style={styles.headerTitle}>Choose Your Meal</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Based on your preferences, here are 4 personalized meal options
          </Text>

          {/* 2x2 Grid of Meal Options */}
          <View style={styles.gridContainer}>
            {mealOptions.map((meal) => (
              <TouchableOpacity
                key={meal.id}
                style={[
                  styles.mealCard,
                  selectedMealId === meal.id && styles.mealCardSelected
                ]}
                onPress={() => handleMealSelect(meal.id)}
                activeOpacity={0.7}
              >
                {/* Selection Indicator */}
                {selectedMealId === meal.id && (
                  <View style={styles.selectionIndicator}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                )}

                {/* Meal Emoji */}
                <Text style={styles.mealEmoji}>{meal.emoji}</Text>

                {/* Meal Title */}
                <Text style={styles.mealTitle} numberOfLines={2}>
                  {meal.title}
                </Text>

                {/* Macros */}
                <View style={styles.macrosContainer}>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>Cal</Text>
                    <Text style={styles.macroValue}>{meal.calories}</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>P</Text>
                    <Text style={styles.macroValue}>{meal.protein}g</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>C</Text>
                    <Text style={styles.macroValue}>{meal.carbs}g</Text>
                  </View>
                  <View style={styles.macroRow}>
                    <Text style={styles.macroLabel}>F</Text>
                    <Text style={styles.macroValue}>{meal.fats}g</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Select Meal Button */}
          <TouchableOpacity
            style={[
              styles.selectButton,
              !selectedMealId && styles.selectButtonDisabled
            ]}
            onPress={handleSelectMeal}
            disabled={!selectedMealId}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.selectButtonText,
              !selectedMealId && styles.selectButtonTextDisabled
            ]}>
              Select Meal
            </Text>
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
    marginBottom: 16,
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
  },
  headerTitle: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 20,
    color: '#1B4332',
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  mealCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealCardSelected: {
    borderColor: '#1B4332',
    backgroundColor: '#E8F5E9',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  mealEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  mealTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    height: 36,
    lineHeight: 18,
  },
  macrosContainer: {
    width: '100%',
    gap: 6,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroLabel: {
    fontFamily: 'Quicksand-Light',
    fontSize: 11,
    color: '#9CA3AF',
  },
  macroValue: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#1B4332',
  },
  selectButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1B4332',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  selectButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  selectButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 18,
  },
  selectButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
