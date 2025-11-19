import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

type DietaryPreference = 'none' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | 'low_carb' | 'gluten_free' | 'dairy_free';
type Allergen = 'none' | 'dairy' | 'eggs' | 'gluten' | 'nuts' | 'shellfish' | 'soy';

export default function DietaryPreferencesScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();

  // Modal visibility states
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const [showAllergensModal, setShowAllergensModal] = useState(false);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [showCaloriesModal, setShowCaloriesModal] = useState(false);
  const [showDislikedModal, setShowDislikedModal] = useState(false);
  const [showCuisineModal, setShowCuisineModal] = useState(false);
  const [showServingSizeModal, setShowServingSizeModal] = useState(false);

  // Temporary state for modals
  const [tempDietaryPrefs, setTempDietaryPrefs] = useState<string[]>([]);
  const [tempAllergens, setTempAllergens] = useState<string[]>([]);
  const [tempProtein, setTempProtein] = useState('');
  const [tempCarbs, setTempCarbs] = useState('');
  const [tempFat, setTempFat] = useState('');
  const [tempCalories, setTempCalories] = useState('');
  const [tempDislikedIngredient, setTempDislikedIngredient] = useState('');
  const [tempDislikedList, setTempDislikedList] = useState<string[]>([]);
  const [tempCuisinePrefs, setTempCuisinePrefs] = useState<string[]>([]);
  const [tempServingSize, setTempServingSize] = useState('');

  // Dietary preferences data
  const dietaryPreferences = [
    { id: 'none', emoji: '🍽️', title: 'No Restrictions', description: 'I eat everything' },
    { id: 'vegetarian', emoji: '🥬', title: 'Vegetarian', description: 'No meat or fish' },
    { id: 'vegan', emoji: '🌱', title: 'Vegan', description: 'No animal products' },
    { id: 'pescatarian', emoji: '🐟', title: 'Pescatarian', description: 'Fish but no meat' },
    { id: 'keto', emoji: '🥑', title: 'Keto', description: 'Low-carb, high-fat' },
    { id: 'paleo', emoji: '🍖', title: 'Paleo', description: 'Whole foods only' },
    { id: 'mediterranean', emoji: '🫒', title: 'Mediterranean', description: 'Heart-healthy diet' },
    { id: 'low_carb', emoji: '🥩', title: 'Low Carb', description: 'Reduced carbohydrates' },
    { id: 'gluten_free', emoji: '🌾', title: 'Gluten-Free', description: 'No gluten products' },
    { id: 'dairy_free', emoji: '🥛', title: 'Dairy-Free', description: 'No dairy products' }
  ];

  const allergenOptions = [
    { id: 'none', emoji: '✓', title: 'No Allergies' },
    { id: 'dairy', emoji: '🥛', title: 'Dairy' },
    { id: 'eggs', emoji: '🥚', title: 'Eggs' },
    { id: 'gluten', emoji: '🌾', title: 'Gluten' },
    { id: 'nuts', emoji: '🥜', title: 'Nuts' },
    { id: 'shellfish', emoji: '🦐', title: 'Shellfish' },
    { id: 'soy', emoji: '🌱', title: 'Soy' }
  ];

  const cuisineOptions = [
    { id: 'italian', emoji: '🍝', title: 'Italian' },
    { id: 'mexican', emoji: '🌮', title: 'Mexican' },
    { id: 'asian', emoji: '🍜', title: 'Asian' },
    { id: 'mediterranean', emoji: '🫒', title: 'Mediterranean' },
    { id: 'american', emoji: '🍔', title: 'American' },
    { id: 'indian', emoji: '🍛', title: 'Indian' },
    { id: 'chinese', emoji: '🥡', title: 'Chinese' },
    { id: 'japanese', emoji: '🍱', title: 'Japanese' },
    { id: 'thai', emoji: '🥘', title: 'Thai' },
    { id: 'french', emoji: '🥖', title: 'French' }
  ];

  // Handler functions for opening modals
  const openDietaryModal = () => {
    setTempDietaryPrefs(userData.dietaryPreferences || []);
    setShowDietaryModal(true);
  };

  const openAllergensModal = () => {
    setTempAllergens(userData.allergens || []);
    setShowAllergensModal(true);
  };

  const openMacroModal = () => {
    setTempProtein(userData.targetProtein || '');
    setTempCarbs(userData.macroTargets?.carbs || '');
    setTempFat(userData.macroTargets?.fat || '');
    setShowMacroModal(true);
  };

  const openCaloriesModal = () => {
    setTempCalories(userData.targetCalories || '');
    setShowCaloriesModal(true);
  };

  const openDislikedModal = () => {
    setTempDislikedList(userData.dislikedIngredients || []);
    setTempDislikedIngredient('');
    setShowDislikedModal(true);
  };

  const openCuisineModal = () => {
    setTempCuisinePrefs(userData.cuisinePreferences || []);
    setShowCuisineModal(true);
  };

  const openServingSizeModal = () => {
    setTempServingSize(userData.defaultServingSize?.toString() || '2');
    setShowServingSizeModal(true);
  };

  // Toggle functions for multi-select
  const toggleDietaryPref = (prefId: string) => {
    if (prefId === 'none') {
      setTempDietaryPrefs(['none']);
    } else {
      let newPrefs = tempDietaryPrefs.filter(p => p !== 'none');
      if (tempDietaryPrefs.includes(prefId)) {
        newPrefs = newPrefs.filter(p => p !== prefId);
      } else {
        newPrefs = [...newPrefs, prefId];
      }
      setTempDietaryPrefs(newPrefs.length > 0 ? newPrefs : []);
    }
  };

  const toggleAllergen = (allergenId: string) => {
    if (allergenId === 'none') {
      setTempAllergens(['none']);
    } else {
      let newAllergens = tempAllergens.filter(a => a !== 'none');
      if (tempAllergens.includes(allergenId)) {
        newAllergens = newAllergens.filter(a => a !== allergenId);
      } else {
        newAllergens = [...newAllergens, allergenId];
      }
      setTempAllergens(newAllergens.length > 0 ? newAllergens : ['none']);
    }
  };

  const toggleCuisine = (cuisineId: string) => {
    if (tempCuisinePrefs.includes(cuisineId)) {
      setTempCuisinePrefs(tempCuisinePrefs.filter(c => c !== cuisineId));
    } else {
      setTempCuisinePrefs([...tempCuisinePrefs, cuisineId]);
    }
  };

  const addDislikedIngredient = () => {
    if (tempDislikedIngredient.trim()) {
      setTempDislikedList([...tempDislikedList, tempDislikedIngredient.trim()]);
      setTempDislikedIngredient('');
    }
  };

  const removeDislikedIngredient = (ingredient: string) => {
    setTempDislikedList(tempDislikedList.filter(i => i !== ingredient));
  };

  // Save functions
  const saveDietaryPreferences = () => {
    updateUserData({ dietaryPreferences: tempDietaryPrefs });
    setShowDietaryModal(false);
  };

  const saveAllergens = () => {
    updateUserData({ allergens: tempAllergens });
    setShowAllergensModal(false);
  };

  const saveMacros = () => {
    updateUserData({
      targetProtein: tempProtein,
      macroTargets: { carbs: tempCarbs, fat: tempFat }
    });
    setShowMacroModal(false);
  };

  const saveCalories = () => {
    updateUserData({ targetCalories: tempCalories });
    setShowCaloriesModal(false);
  };

  const saveDislikedIngredients = () => {
    updateUserData({ dislikedIngredients: tempDislikedList });
    setShowDislikedModal(false);
  };

  const saveCuisinePreferences = () => {
    updateUserData({ cuisinePreferences: tempCuisinePrefs });
    setShowCuisineModal(false);
  };

  const saveServingSize = () => {
    updateUserData({ defaultServingSize: parseInt(tempServingSize) || 2 });
    setShowServingSizeModal(false);
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
              <Text style={styles.headerTitle}>Dietary Preferences</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Settings Content */}
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingRow} onPress={openDietaryModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Dietary Preferences</Text>
                  <Text style={styles.settingDescription}>
                    {userData.dietaryPreferences?.join(', ') || 'None selected'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={openAllergensModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Allergens</Text>
                  <Text style={styles.settingDescription}>
                    {userData.allergens?.join(', ') || 'None selected'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={openMacroModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Macro Targets</Text>
                  <Text style={styles.settingDescription}>
                    {userData.targetProtein && userData.macroTargets?.carbs && userData.macroTargets?.fat
                      ? `Protein: ${userData.targetProtein}g, Carbs: ${userData.macroTargets.carbs}g, Fat: ${userData.macroTargets.fat}g`
                      : 'Set your daily protein, carbs, and fat targets'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={openCaloriesModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Calorie Goals</Text>
                  <Text style={styles.settingDescription}>
                    {userData.targetCalories ? `${userData.targetCalories} calories/day` : 'Not set'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={openDislikedModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Disliked Ingredients</Text>
                  <Text style={styles.settingDescription}>
                    {userData.dislikedIngredients && userData.dislikedIngredients.length > 0
                      ? userData.dislikedIngredients.join(', ')
                      : 'Ingredients you\'d prefer to avoid in recipes'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={openCuisineModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Cuisine Preferences</Text>
                  <Text style={styles.settingDescription}>
                    {userData.cuisinePreferences && userData.cuisinePreferences.length > 0
                      ? userData.cuisinePreferences.join(', ')
                      : 'Your favorite types of cuisine'}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={openServingSizeModal}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Default Serving Size</Text>
                  <Text style={styles.settingDescription}>
                    {userData.defaultServingSize || 2}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Dietary Preferences Modal */}
        <Modal
          visible={showDietaryModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDietaryModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDietaryModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Dietary Preferences</Text>
                    <TouchableOpacity onPress={() => setShowDietaryModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll}>
                    {dietaryPreferences.map((pref) => (
                      <TouchableOpacity
                        key={pref.id}
                        style={[
                          styles.modalOption,
                          tempDietaryPrefs.includes(pref.id) && styles.modalOptionSelected
                        ]}
                        onPress={() => toggleDietaryPref(pref.id)}
                      >
                        <Text style={styles.modalOptionEmoji}>{pref.emoji}</Text>
                        <View style={styles.modalOptionText}>
                          <Text style={[
                            styles.modalOptionTitle,
                            tempDietaryPrefs.includes(pref.id) && styles.modalOptionTitleSelected
                          ]}>
                            {pref.title}
                          </Text>
                          <Text style={styles.modalOptionDescription}>{pref.description}</Text>
                        </View>
                        {tempDietaryPrefs.includes(pref.id) && (
                          <View style={styles.modalCheckmark}>
                            <Text style={styles.modalCheckmarkText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveDietaryPreferences}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Allergens Modal */}
        <Modal
          visible={showAllergensModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAllergensModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowAllergensModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Allergens</Text>
                    <TouchableOpacity onPress={() => setShowAllergensModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll}>
                    <View style={styles.allergenGrid}>
                      {allergenOptions.map((allergen) => (
                        <TouchableOpacity
                          key={allergen.id}
                          style={[
                            styles.allergenChip,
                            tempAllergens.includes(allergen.id) && styles.allergenChipSelected
                          ]}
                          onPress={() => toggleAllergen(allergen.id)}
                        >
                          <Text style={styles.allergenChipEmoji}>{allergen.emoji}</Text>
                          <Text style={[
                            styles.allergenChipText,
                            tempAllergens.includes(allergen.id) && styles.allergenChipTextSelected
                          ]}>
                            {allergen.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveAllergens}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Macro Targets Modal */}
        <Modal
          visible={showMacroModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowMacroModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowMacroModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Macro Targets</Text>
                    <TouchableOpacity onPress={() => setShowMacroModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalInputContainer}>
                    <Text style={styles.inputLabel}>Protein (grams)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempProtein}
                      onChangeText={setTempProtein}
                      keyboardType="numeric"
                      placeholder="e.g., 150"
                    />

                    <Text style={styles.inputLabel}>Carbs (grams)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempCarbs}
                      onChangeText={setTempCarbs}
                      keyboardType="numeric"
                      placeholder="e.g., 200"
                    />

                    <Text style={styles.inputLabel}>Fat (grams)</Text>
                    <TextInput
                      style={styles.input}
                      value={tempFat}
                      onChangeText={setTempFat}
                      keyboardType="numeric"
                      placeholder="e.g., 50"
                    />
                  </ScrollView>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveMacros}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Calorie Goals Modal */}
        <Modal
          visible={showCaloriesModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowCaloriesModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCaloriesModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Calorie Goals</Text>
                    <TouchableOpacity onPress={() => setShowCaloriesModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalInputContainer}>
                    <Text style={styles.inputLabel}>Daily Calorie Target</Text>
                    <TextInput
                      style={styles.input}
                      value={tempCalories}
                      onChangeText={setTempCalories}
                      keyboardType="numeric"
                      placeholder="e.g., 2000"
                    />
                  </ScrollView>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveCalories}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Disliked Ingredients Modal */}
        <Modal
          visible={showDislikedModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowDislikedModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDislikedModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Disliked Ingredients</Text>
                    <TouchableOpacity onPress={() => setShowDislikedModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalInputContainer}>
                    <Text style={styles.inputLabel}>Add an ingredient</Text>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={[styles.input, styles.inputFlex]}
                        value={tempDislikedIngredient}
                        onChangeText={setTempDislikedIngredient}
                        placeholder="e.g., cilantro"
                        onSubmitEditing={addDislikedIngredient}
                      />
                      <TouchableOpacity style={styles.addButton} onPress={addDislikedIngredient}>
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.ingredientList}>
                      {tempDislikedList.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientItem}>
                          <Text style={styles.ingredientText}>{ingredient}</Text>
                          <TouchableOpacity onPress={() => removeDislikedIngredient(ingredient)}>
                            <Text style={styles.removeButton}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveDislikedIngredients}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Cuisine Preferences Modal */}
        <Modal
          visible={showCuisineModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowCuisineModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowCuisineModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Cuisine Preferences</Text>
                    <TouchableOpacity onPress={() => setShowCuisineModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll}>
                    <View style={styles.cuisineGrid}>
                      {cuisineOptions.map((cuisine) => (
                        <TouchableOpacity
                          key={cuisine.id}
                          style={[
                            styles.cuisineChip,
                            tempCuisinePrefs.includes(cuisine.id) && styles.cuisineChipSelected
                          ]}
                          onPress={() => toggleCuisine(cuisine.id)}
                        >
                          <Text style={styles.cuisineChipEmoji}>{cuisine.emoji}</Text>
                          <Text style={[
                            styles.cuisineChipText,
                            tempCuisinePrefs.includes(cuisine.id) && styles.cuisineChipTextSelected
                          ]}>
                            {cuisine.title}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveCuisinePreferences}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Serving Size Modal */}
        <Modal
          visible={showServingSizeModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowServingSizeModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowServingSizeModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContent}
                >
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Default Serving Size</Text>
                    <TouchableOpacity onPress={() => setShowServingSizeModal(false)}>
                      <Text style={styles.modalClose}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalInputContainer}>
                    <Text style={styles.inputLabel}>Number of servings</Text>
                    <TextInput
                      style={styles.input}
                      value={tempServingSize}
                      onChangeText={setTempServingSize}
                      keyboardType="numeric"
                      placeholder="e.g., 2"
                    />
                  </ScrollView>

                  <TouchableOpacity style={styles.modalSaveButton} onPress={saveServingSize}>
                    <Text style={styles.modalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </KeyboardAvoidingView>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
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
  placeholder: {
    width: 40,
  },
  settingsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'VendSans-Medium',
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    fontFamily: 'VendSans-Regular',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'VendSans-Bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 28,
    color: '#9CA3AF',
    fontFamily: 'VendSans-Regular',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  modalOptionEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontFamily: 'VendSans-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  modalOptionTitleSelected: {
    color: '#6B46C1',
  },
  modalOptionDescription: {
    fontSize: 13,
    fontFamily: 'VendSans-Regular',
    color: '#6B7280',
  },
  modalCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCheckmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'VendSans-Bold',
  },
  modalSaveButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  modalSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'VendSans-SemiBold',
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  allergenChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 8,
  },
  allergenChipSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  allergenChipEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  allergenChipText: {
    fontSize: 14,
    fontFamily: 'VendSans-Medium',
    color: '#1F2937',
  },
  allergenChipTextSelected: {
    color: '#6B46C1',
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cuisineChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginRight: 8,
  },
  cuisineChipSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  cuisineChipEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  cuisineChipText: {
    fontSize: 14,
    fontFamily: 'VendSans-Medium',
    color: '#1F2937',
  },
  cuisineChipTextSelected: {
    color: '#6B46C1',
  },
  modalInputContainer: {
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: 'VendSans-Medium',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'VendSans-Regular',
    color: '#1F2937',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputFlex: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'VendSans-SemiBold',
  },
  ingredientList: {
    marginTop: 16,
    maxHeight: 200,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 15,
    fontFamily: 'VendSans-Regular',
    color: '#1F2937',
  },
  removeButton: {
    fontSize: 20,
    color: '#EF4444',
    fontFamily: 'VendSans-Regular',
  },
});
