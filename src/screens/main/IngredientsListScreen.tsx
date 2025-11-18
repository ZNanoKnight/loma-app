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
  const [servings, setServings] = useState(2);
  const [baseServings, setBaseServings] = useState(2);
  const servingMultiplier = servings / baseServings;

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (currentRecipe && currentRecipe.ingredients) {
      // Convert recipe ingredients to checklist items
      const ingredientsWithChecked = currentRecipe.ingredients.map(item => ({
        ...item,
        checked: false
      }));
      setIngredients(ingredientsWithChecked);
      setBaseServings(currentRecipe.servings);
      setServings(currentRecipe.servings);
    }
  }, [currentRecipe]);

  const [showPantryItems, setShowPantryItems] = useState(true);

  // Group ingredients by category
  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    if (!showPantryItems && ingredient.inPantry) return acc;
    
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
    'Dairy': '🧀',
    'Pantry': '🏺'
  };

  const checkedCount = ingredients.filter(i => i.checked).length;
  const totalCount = showPantryItems ? ingredients.length : ingredients.filter(i => !i.inPantry).length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const toggleIngredient = (id: string) => {
    setIngredients(ingredients.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const adjustAmount = (amount: string): string => {
    if (amount === 'To taste') return amount;
    
    // Parse fractions
    const fractionMap: Record<string, number> = {
      '1/4': 0.25,
      '1/2': 0.5,
      '3/4': 0.75,
      '1/3': 0.33,
      '2/3': 0.67
    };
    
    let numericAmount = fractionMap[amount] || parseFloat(amount);
    if (isNaN(numericAmount)) return amount;
    
    const adjusted = numericAmount * servingMultiplier;
    
    // Convert back to fractions for common values
    if (adjusted === 0.25) return '1/4';
    if (adjusted === 0.5) return '1/2';
    if (adjusted === 0.75) return '3/4';
    if (adjusted === 0.33) return '1/3';
    if (adjusted === 0.67) return '2/3';
    
    return adjusted % 1 === 0 ? adjusted.toString() : adjusted.toFixed(1);
  };

  const handleStartCooking = () => {
    navigation.navigate('CookingInstructions');
  };

  const handleAddToCart = () => {
    // In production, this would add items to shopping cart
    console.log('Adding to shopping cart...');
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
              <TouchableOpacity style={styles.cartButton}>
                <Text style={styles.cartIcon}>🛒</Text>
              </TouchableOpacity>
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

            {/* Servings Adjuster */}
            <View style={styles.servingsCard}>
              <Text style={styles.servingsLabel}>Servings</Text>
              <View style={styles.servingsControl}>
                <TouchableOpacity
                  style={styles.servingButton}
                  onPress={() => setServings(Math.max(1, servings - 1))}
                >
                  <Text style={styles.servingButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.servingCount}>{servings}</Text>
                <TouchableOpacity
                  style={styles.servingButton}
                  onPress={() => setServings(servings + 1)}
                >
                  <Text style={styles.servingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              {servings !== baseServings && (
                <Text style={styles.servingNote}>
                  Amounts adjusted from original {baseServings} servings
                </Text>
              )}
            </View>

            {/* Pantry Toggle */}
            <View style={styles.pantryToggle}>
              <TouchableOpacity
                style={styles.pantryToggleButton}
                onPress={() => setShowPantryItems(!showPantryItems)}
              >
                <View style={[styles.toggleSwitch, showPantryItems && styles.toggleSwitchActive]}>
                  <View style={[styles.toggleCircle, showPantryItems && styles.toggleCircleActive]} />
                </View>
                <Text style={styles.pantryToggleText}>
                  {showPantryItems ? 'Showing pantry items' : 'Hiding pantry items'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.pantryNote}>
                {ingredients.filter(i => i.inPantry).length} pantry staples
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
                    style={[
                      styles.ingredientItem,
                      ingredient.inPantry && styles.ingredientItemPantry
                    ]}
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
                            {adjustAmount(ingredient.amount)} {ingredient.unit}
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
                    {ingredient.inPantry && (
                      <View style={styles.pantryBadge}>
                        <Text style={styles.pantryBadgeText}>Pantry</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Shopping Actions */}
            <View style={styles.shoppingActions}>
              <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                <Text style={styles.addToCartIcon}>🛒</Text>
                <Text style={styles.addToCartText}>Add to Shopping List</Text>
              </TouchableOpacity>
              
              <View style={styles.shoppingOptions}>
                <TouchableOpacity style={styles.shopOption}>
                  <Text style={styles.shopOptionIcon}>📱</Text>
                  <Text style={styles.shopOptionText}>Instacart</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shopOption}>
                  <Text style={styles.shopOptionIcon}>📦</Text>
                  <Text style={styles.shopOptionText}>Amazon</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Continue Button */}
            <View style={styles.bottomContainer}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleStartCooking}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Start Cooking →</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.skipButton} onPress={handleStartCooking}>
                <Text style={styles.skipText}>I have everything</Text>
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
    fontFamily: 'VendSans-Regular',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    fontFamily: 'VendSans-Regular',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartIcon: {
    fontSize: 20,
    fontFamily: 'VendSans-Regular',
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
    backgroundColor: 'white',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'VendSans-Regular',
  },
  servingsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingsLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'VendSans-SemiBold',
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  servingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingButtonText: {
    fontSize: 20,
    color: '#6B46C1',
    fontFamily: 'VendSans-SemiBold',
  },
  servingCount: {
    fontSize: 18,
    color: '#1F2937',
    minWidth: 30,
    textAlign: 'center',
    fontFamily: 'VendSans-SemiBold',
  },
  servingNote: {
    position: 'absolute',
    bottom: -20,
    left: 16,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    fontFamily: 'VendSans-Regular',
  },
  pantryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  pantryToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#10B981',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  toggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  pantryToggleText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'VendSans-Regular',
  },
  pantryNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Regular',
  },
  categoryTitle: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    fontFamily: 'VendSans-SemiBold',
  },
  categoryCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'VendSans-Regular',
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
  ingredientItemPantry: {
    backgroundColor: '#FEF3C7',
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
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'VendSans-Bold',
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
    color: '#6B46C1',
    fontFamily: 'VendSans-SemiBold',
  },
  ingredientName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    fontFamily: 'VendSans-Regular',
  },
  ingredientNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
    fontFamily: 'VendSans-Regular',
  },
  textChecked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  pantryBadge: {
    backgroundColor: '#FDE047',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pantryBadgeText: {
    fontSize: 11,
    color: '#713F12',
    fontFamily: 'VendSans-SemiBold',
  },
  shoppingActions: {
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addToCartIcon: {
    fontSize: 20,
    fontFamily: 'VendSans-Regular',
  },
  addToCartText: {
    fontSize: 16,
    color: '#6B46C1',
    fontFamily: 'VendSans-SemiBold',
  },
  shoppingOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  shopOption: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shopOptionIcon: {
    fontSize: 16,
    fontFamily: 'VendSans-Regular',
  },
  shopOptionText: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'VendSans-Medium',
  },
  bottomContainer: {
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontFamily: 'VendSans-Regular',
  },
});