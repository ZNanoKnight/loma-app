import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // Account for padding and gap

export default function RecipeGeneratedScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  // Mock meal options - in production, these would come from AI generation
  const mealOptions = [
    {
      id: '1',
      title: 'Mediterranean Chicken Bowl',
      emoji: '🥗',
      calories: 485,
      protein: 42,
      carbs: 38,
      fats: 18,
    },
    {
      id: '2',
      title: 'Teriyaki Salmon Rice',
      emoji: '🍣',
      calories: 520,
      protein: 38,
      carbs: 45,
      fats: 20,
    },
    {
      id: '3',
      title: 'Veggie Stir-Fry Bowl',
      emoji: '🥘',
      calories: 380,
      protein: 15,
      carbs: 52,
      fats: 14,
    },
    {
      id: '4',
      title: 'Grilled Steak Plate',
      emoji: '🥩',
      calories: 550,
      protein: 48,
      carbs: 32,
      fats: 24,
    },
  ];

  const handleMealSelect = (mealId: string) => {
    setSelectedMealId(mealId);
  };

  const handleSelectMeal = () => {
    if (selectedMealId) {
      // Navigate to the Recipe Review screen
      navigation.navigate('RecipeReview');
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
    borderColor: '#6B46C1',
    backgroundColor: '#F3F0FF',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
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
    fontFamily: 'Quicksand-SemiBold',
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
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: '#9CA3AF',
  },
  macroValue: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#6B46C1',
  },
  selectButton: {
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
  selectButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  selectButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
  },
  selectButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
