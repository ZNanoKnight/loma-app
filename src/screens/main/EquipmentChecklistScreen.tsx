import React, { useState, useEffect } from 'react';
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
import { useRecipe, EquipmentItem as RecipeEquipmentItem } from '../../context/RecipeContext';

interface EquipmentItem extends RecipeEquipmentItem {
  checked: boolean;
}

export default function EquipmentChecklistScreen() {
  const navigation = useNavigation<any>();
  const { currentRecipe } = useRecipe();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    if (currentRecipe && currentRecipe.equipment) {
      // Convert recipe equipment to checklist items
      const equipmentWithChecked = currentRecipe.equipment.map(item => ({
        ...item,
        checked: false
      }));
      setEquipment(equipmentWithChecked);
    }
  }, [currentRecipe]);

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
            {currentRecipe && (
              <View style={styles.recipeCard}>
                <Text style={styles.recipeEmoji}>{currentRecipe.emoji}</Text>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeName}>{currentRecipe.title}</Text>
                  <Text style={styles.recipeTime}>⏱️ {currentRecipe.totalTime} minutes total</Text>
                </View>
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
                  equipment.every(i => i.checked) && styles.continueButtonActive
                ]}
                onPress={handleContinue}
                disabled={!equipment.every(i => i.checked)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.continueButtonText,
                  equipment.every(i => i.checked) && styles.continueButtonTextActive
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
    fontFamily: 'Quicksand-Regular',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'Quicksand-Regular',
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
    backgroundColor: '#6B46C1',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  recipeEmoji: {
    fontSize: 32,
    marginRight: 12,
    fontFamily: 'Quicksand-Regular',
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Quicksand-SemiBold',
  },
  recipeTime: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
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
    color: '#1F2937',
    fontFamily: 'Quicksand-SemiBold',
  },
  sectionCount: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Bold',
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 12,
    fontFamily: 'Quicksand-Regular',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-SemiBold',
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
    color: '#6B46C1',
    fontSize: 14,
    fontFamily: 'Quicksand-SemiBold',
  },
  bottomContainer: {
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButtonActive: {
    backgroundColor: '#6B46C1',
  },
  continueButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
  },
  continueButtonTextActive: {
    color: 'white',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontFamily: 'Quicksand-Regular',
  },
});