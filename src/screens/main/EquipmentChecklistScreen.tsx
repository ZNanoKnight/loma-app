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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

interface EquipmentItem {
  id: string;
  name: string;
  emoji: string;
  essential: boolean;
  alternative?: string;
  checked: boolean;
}

export default function EquipmentChecklistScreen() {
  const navigation = useNavigation<any>();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([
    {
      id: '1',
      name: 'Large Skillet or Grill Pan',
      emoji: '🍳',
      essential: true,
      checked: false
    },
    {
      id: '2',
      name: 'Medium Saucepan',
      emoji: '🍲',
      essential: true,
      checked: false
    },
    {
      id: '3',
      name: 'Cutting Board',
      emoji: '🔪',
      essential: true,
      checked: false
    },
    {
      id: '4',
      name: 'Sharp Knife',
      emoji: '🔪',
      essential: true,
      checked: false
    },
    {
      id: '5',
      name: 'Mixing Bowl',
      emoji: '🥣',
      essential: true,
      checked: false
    },
    {
      id: '6',
      name: 'Measuring Cups',
      emoji: '📏',
      essential: true,
      checked: false
    },
    {
      id: '7',
      name: 'Measuring Spoons',
      emoji: '🥄',
      essential: true,
      checked: false
    },
    {
      id: '8',
      name: 'Meat Thermometer',
      emoji: '🌡️',
      essential: false,
      alternative: 'Check by cutting into thickest part',
      checked: false
    },
    {
      id: '9',
      name: 'Tongs',
      emoji: '🥢',
      essential: false,
      alternative: 'Use a spatula',
      checked: false
    },
    {
      id: '10',
      name: 'Serving Bowls',
      emoji: '🍽️',
      essential: false,
      checked: false
    }
  ]);

  const [showTips, setShowTips] = useState(true);

  const essentialItems = equipment.filter(item => item.essential);
  const optionalItems = equipment.filter(item => !item.essential);
  const checkedCount = equipment.filter(item => item.checked).length;
  const progress = (checkedCount / equipment.length) * 100;

  const toggleItem = (id: string) => {
    setEquipment(equipment.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const checkAll = () => {
    setEquipment(equipment.map(item => ({ ...item, checked: true })));
  };

  const handleContinue = () => {
    navigation.navigate('IngredientsList');
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
              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>Equipment Checklist</Text>
                <Text style={styles.headerSubtitle}>Step 1 of 3</Text>
              </View>
              <View style={styles.placeholder} />
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {checkedCount} of {equipment.length} items ready
              </Text>
            </View>

            {/* Recipe Info Card */}
            <View style={styles.recipeCard}>
              <Text style={styles.recipeEmoji}>🥗</Text>
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>Mediterranean Chicken Bowl</Text>
                <Text style={styles.recipeTime}>⏱️ 35 minutes total</Text>
              </View>
            </View>

            {/* Tips Section */}
            {showTips && (
              <View style={styles.tipsCard}>
                <View style={styles.tipsHeader}>
                  <Text style={styles.tipsIcon}>💡</Text>
                  <Text style={styles.tipsTitle}>Prep Tips</Text>
                  <TouchableOpacity onPress={() => setShowTips(false)}>
                    <Text style={styles.dismissText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tipsText}>
                  • Gather all equipment before starting{'\n'}
                  • Ensure your grill pan is completely dry{'\n'}
                  • Have paper towels ready for patting chicken dry
                </Text>
              </View>
            )}

            {/* Essential Equipment */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Essential Equipment</Text>
                <Text style={styles.sectionCount}>{essentialItems.filter(i => i.checked).length}/{essentialItems.length}</Text>
              </View>
              
              {essentialItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.equipmentItem}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                      {item.checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                      {item.name}
                    </Text>
                  </View>
                  {item.checked && (
                    <View style={styles.checkedBadge}>
                      <Text style={styles.checkedText}>Ready</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Optional Equipment */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Optional Equipment</Text>
                <Text style={styles.sectionCount}>{optionalItems.filter(i => i.checked).length}/{optionalItems.length}</Text>
              </View>
              
              {optionalItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.equipmentItem}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
                      {item.checked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                    <View style={styles.itemTextContainer}>
                      <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                        {item.name}
                      </Text>
                      {item.alternative && !item.checked && (
                        <Text style={styles.alternativeText}>
                          Or: {item.alternative}
                        </Text>
                      )}
                    </View>
                  </View>
                  {item.checked && (
                    <View style={styles.checkedBadge}>
                      <Text style={styles.checkedText}>Ready</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

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
                  essentialItems.every(i => i.checked) && styles.continueButtonActive
                ]}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>
                  {essentialItems.every(i => i.checked) 
                    ? 'Continue to Ingredients →' 
                    : `Check ${essentialItems.filter(i => !i.checked).length} essential items`}
                </Text>
              </TouchableOpacity>
              
              {!essentialItems.every(i => i.checked) && (
                <TouchableOpacity 
                  style={styles.skipButton}
                  onPress={handleContinue}
                >
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              )}
            </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 24,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  recipeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  recipeTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tipsCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  tipsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  dismissText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  tipsText: {
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  sectionCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  equipmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontWeight: 'bold',
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#1F2937',
  },
  itemNameChecked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  alternativeText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  checkedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  checkedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  checkAllButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkAllText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomContainer: {
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonActive: {
    backgroundColor: 'white',
  },
  continueButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});