import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useRecipe, Ingredient as RecipeIngredient } from '../../context/RecipeContext';

interface Ingredient extends RecipeIngredient {
  checked: boolean;
}

export default function IngredientsListScreen() {
  const navigation = useNavigation<any>();
  const { currentRecipe } = useRecipe();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (currentRecipe && currentRecipe.ingredients) {
      // Convert recipe ingredients to checklist items
      const ingredientsWithChecked = currentRecipe.ingredients.map(item => ({
        ...item,
        checked: false
      }));
      setIngredients(ingredientsWithChecked);
    }
  }, [currentRecipe]);

  // Group ingredients by category
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!acc[ingredient.category]) {
      acc[ingredient.category] = [];
    }
    acc[ingredient.category].push(ingredient);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const categoryEmojis: Record<string, string> = {
    'Proteins': '🍖',
    'Grains': '🌾',
    'Vegetables': '🥬',
    'Dairy': '🧀'
  };

  const checkedCount = ingredients.filter(i => i.checked).length;
  const totalCount = ingredients.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const toggleIngredient = (id: string) => {
    setIngredients(ingredients.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const checkAll = () => {
    setIngredients(ingredients.map(item => ({ ...item, checked: true })));
  };

  const handleStartCooking = () => {
    navigation.navigate('CookingInstructions');
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
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Ingredients</Text>
                <Text style={styles.headerSubtitle}>Step 2 of 3</Text>
              </View>
              <View style={styles.placeholder} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {checkedCount} of {totalCount} ingredients ready
              </Text>
            </View>

            {/* Ingredients by Category */}
            {Object.entries(groupedIngredients).map(([category, items]) => (
              <View key={category} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryEmoji}>{categoryEmojis[category]}</Text>
                  <Text style={styles.categoryTitle}>{category}</Text>
                  <Text style={styles.categoryCount}>
                    {items.filter(i => i.checked).length}/{items.length}
                  </Text>
                </View>
                
                {items.map((ingredient) => (
                  <TouchableOpacity
                    key={ingredient.id}
                    style={styles.ingredientItem}
                    onPress={() => toggleIngredient(ingredient.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.ingredientLeft}>
                      <View style={[styles.checkbox, ingredient.checked && styles.checkboxChecked]}>
                        {ingredient.checked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.ingredientInfo}>
                        <View style={styles.ingredientMain}>
                          <Text style={[styles.amount, ingredient.checked && styles.textChecked]}>
                            {ingredient.amount} {ingredient.unit}
                          </Text>
                          <Text style={[styles.ingredientName, ingredient.checked && styles.textChecked]}>
                            {ingredient.item}
                          </Text>
                        </View>
                        {ingredient.notes && (
                          <Text style={[styles.ingredientNote, ingredient.checked && styles.textChecked]}>
                            {ingredient.notes}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.checkAllButton}
                onPress={checkAll}
              >
                <Text style={styles.checkAllText}>✓ Check All</Text>
              </TouchableOpacity>
            </View>

            {/* Continue Button */}
            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  ingredients.every(i => i.checked) && styles.continueButtonActive
                ]}
                onPress={handleStartCooking}
                disabled={!ingredients.every(i => i.checked)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.continueButtonText,
                  ingredients.every(i => i.checked) && styles.continueButtonTextActive
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1B4332',
    fontFamily: 'Quicksand-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Quicksand-Light',
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1B4332',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-Bold',
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  ingredientItem: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#40916C',
    borderColor: '#40916C',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientMain: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  amount: {
    fontSize: 14,
    color: '#1B4332',
    fontFamily: 'Quicksand-Bold',
  },
  ingredientName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    fontFamily: 'Quicksand-Regular',
  },
  ingredientNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
    fontFamily: 'Quicksand-Light',
  },
  textChecked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  checkAllButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkAllText: {
    color: '#1B4332',
    fontSize: 14,
    fontFamily: 'Quicksand-Bold',
  },
  bottomContainer: {
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonActive: {
    backgroundColor: '#1B4332',
  },
  continueButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'Quicksand-Bold',
  },
  continueButtonTextActive: {
    color: 'white',
  },
});