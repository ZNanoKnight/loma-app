import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

export default function YourPreferencesScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();

  // Modal visibility states
  const [showPhysicalStatsModal, setShowPhysicalStatsModal] = useState(false);
  const [showActivityLevelModal, setShowActivityLevelModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [showDietaryPrefsModal, setShowDietaryPrefsModal] = useState(false);
  const [showAllergensModal, setShowAllergensModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showCookingFrequencyModal, setShowCookingFrequencyModal] = useState(false);

  // Temporary state for modals
  const [tempGender, setTempGender] = useState('');
  const [tempAge, setTempAge] = useState('');
  const [tempHeightFeet, setTempHeightFeet] = useState('');
  const [tempHeightInches, setTempHeightInches] = useState('');
  const [tempWeight, setTempWeight] = useState('');
  const [tempActivityLevel, setTempActivityLevel] = useState('');
  const [tempGoals, setTempGoals] = useState<string[]>([]);
  const [tempDietaryPrefs, setTempDietaryPrefs] = useState<string[]>([]);
  const [tempAllergens, setTempAllergens] = useState<string[]>([]);
  const [tempEquipment, setTempEquipment] = useState('');
  const [tempCookingFrequency, setTempCookingFrequency] = useState('');

  // Data options
  const activityLevels = [
    { id: 'sedentary', emoji: '🪑', title: 'Sedentary', description: 'Little or no exercise' },
    { id: 'lightly_active', emoji: '🚶', title: 'Lightly Active', description: 'Exercise 1-3 days/week' },
    { id: 'moderately_active', emoji: '🏃', title: 'Moderately Active', description: 'Exercise 3-5 days/week' },
    { id: 'very_active', emoji: '💪', title: 'Very Active', description: 'Exercise 6-7 days/week' },
    { id: 'extra_active', emoji: '🔥', title: 'Extra Active', description: 'Physical job or training twice/day' }
  ];

  const goals = [
    { id: 'weight_loss', emoji: '⚖️', title: 'Weight Loss', description: 'Calorie-conscious recipes' },
    { id: 'build_muscle', emoji: '💪', title: 'Build Muscle', description: 'High-protein meals' },
    { id: 'eat_healthier', emoji: '🥗', title: 'Eat Healthier', description: 'Balanced, nutritious meals' },
    { id: 'save_time', emoji: '⏱️', title: 'Save Time', description: 'Quick & easy recipes' },
    { id: 'save_money', emoji: '💰', title: 'Save Money', description: 'Budget-friendly meals' },
    { id: 'learn_to_cook', emoji: '👨‍🍳', title: 'Learn to Cook', description: 'Build cooking skills' }
  ];

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
    { id: 'soy', emoji: '🌱', title: 'Soy' },
    { id: 'eggs', emoji: '🥚', title: 'Eggs' },
    { id: 'dairy', emoji: '🥛', title: 'Dairy' },
    { id: 'wheat', emoji: '🌾', title: 'Wheat' },
    { id: 'gluten', emoji: '🌾', title: 'Gluten' },
    { id: 'sesame', emoji: '🌰', title: 'Sesame' },
    { id: 'peanuts', emoji: '🥜', title: 'Peanuts' },
    { id: 'tree_nuts', emoji: '🌰', title: 'Tree Nuts' },
    { id: 'shellfish', emoji: '🦐', title: 'Shellfish' }
  ];

  const equipmentOptions = [
    { id: 'minimal', emoji: '🍳', title: 'Minimal', description: 'Microwave, Toaster, Kettle, Basic Utensils' },
    { id: 'basic', emoji: '👨‍🍳', title: 'Basic', description: 'Stove, Oven, Pots & Pans, Baking Sheets' },
    { id: 'full', emoji: '🔪', title: 'Full Kitchen', description: 'Food Processor, Blender, Instant Pot, Air Fryer' }
  ];

  const cookingFrequencyOptions = [
    { id: 'daily', emoji: '🔥', title: 'Every Day', description: "I'm committed to daily cooking" },
    { id: 'few_times', emoji: '📅', title: 'Few Times a Week', description: '3-4 times per week' },
    { id: 'weekends', emoji: '🏖️', title: 'Weekends Only', description: 'Saturday and Sunday' },
    { id: 'occasionally', emoji: '🌙', title: 'Occasionally', description: 'When I have time' }
  ];

  // Handler functions for opening modals
  const openPhysicalStatsModal = () => {
    setTempGender(userData.gender || '');
    setTempAge(userData.age || '');
    setTempHeightFeet(userData.heightFeet || '');
    setTempHeightInches(userData.heightInches || '');
    setTempWeight(userData.weight || '');
    setShowPhysicalStatsModal(true);
  };

  const openActivityLevelModal = () => {
    setTempActivityLevel(userData.activityLevel || '');
    setShowActivityLevelModal(true);
  };

  const openGoalsModal = () => {
    setTempGoals(userData.goals || []);
    setShowGoalsModal(true);
  };

  const openDietaryPrefsModal = () => {
    setTempDietaryPrefs(userData.dietaryPreferences || []);
    setShowDietaryPrefsModal(true);
  };

  const openAllergensModal = () => {
    setTempAllergens(userData.allergens || []);
    setShowAllergensModal(true);
  };

  const openEquipmentModal = () => {
    setTempEquipment(userData.equipment || '');
    setShowEquipmentModal(true);
  };

  const openCookingFrequencyModal = () => {
    setTempCookingFrequency(userData.cookingFrequency || '');
    setShowCookingFrequencyModal(true);
  };

  // Toggle functions for multi-select
  const toggleGoal = (goalId: string) => {
    if (tempGoals.includes(goalId)) {
      setTempGoals(tempGoals.filter(g => g !== goalId));
    } else {
      setTempGoals([...tempGoals, goalId]);
    }
  };

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
    if (tempAllergens.includes(allergenId)) {
      setTempAllergens(tempAllergens.filter(a => a !== allergenId));
    } else {
      setTempAllergens([...tempAllergens, allergenId]);
    }
  };

  // Save functions
  const savePhysicalStats = () => {
    updateUserData({
      gender: tempGender,
      age: tempAge,
      heightFeet: tempHeightFeet,
      heightInches: tempHeightInches,
      weight: tempWeight
    });
    setShowPhysicalStatsModal(false);
  };

  const saveActivityLevel = () => {
    updateUserData({ activityLevel: tempActivityLevel });
    setShowActivityLevelModal(false);
  };

  const saveGoals = () => {
    updateUserData({ goals: tempGoals });
    setShowGoalsModal(false);
  };

  const saveDietaryPrefs = () => {
    updateUserData({ dietaryPreferences: tempDietaryPrefs });
    setShowDietaryPrefsModal(false);
  };

  const saveAllergens = () => {
    updateUserData({ allergens: tempAllergens });
    setShowAllergensModal(false);
  };

  const saveEquipment = () => {
    updateUserData({ equipment: tempEquipment });
    setShowEquipmentModal(false);
  };

  const saveCookingFrequency = () => {
    updateUserData({ cookingFrequency: tempCookingFrequency });
    setShowCookingFrequencyModal(false);
  };

  // Helper functions for display
  const getPhysicalStatsSummary = () => {
    const parts: string[] = [];
    if (userData.gender) parts.push(userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1));
    if (userData.age) parts.push(`${userData.age} yrs`);
    if (userData.heightFeet && userData.heightInches) parts.push(`${userData.heightFeet}'${userData.heightInches}"`);
    if (userData.weight) parts.push(`${userData.weight} lbs`);
    return parts.length > 0 ? parts.join(' • ') : 'Not set';
  };

  const getActivityLevelDisplay = () => {
    const level = activityLevels.find(l => l.id === userData.activityLevel);
    return level ? level.title : 'Not set';
  };

  const getGoalsDisplay = () => {
    if (!userData.goals || userData.goals.length === 0) return 'None selected';
    const goalTitles = userData.goals.map(gId => goals.find(g => g.id === gId)?.title).filter(Boolean);
    return goalTitles.join(', ');
  };

  const getDietaryPrefsDisplay = () => {
    if (!userData.dietaryPreferences || userData.dietaryPreferences.length === 0) return 'None selected';
    const prefTitles = userData.dietaryPreferences.map(pId => dietaryPreferences.find(p => p.id === pId)?.title).filter(Boolean);
    return prefTitles.join(', ');
  };

  const getAllergensDisplay = () => {
    if (!userData.allergens || userData.allergens.length === 0) return 'None';
    const allergenTitles = userData.allergens.map(aId => allergenOptions.find(a => a.id === aId)?.title).filter(Boolean);
    return allergenTitles.join(', ');
  };

  const getEquipmentDisplay = () => {
    const eq = equipmentOptions.find(e => e.id === userData.equipment);
    return eq ? eq.title : 'Not set';
  };

  const getCookingFrequencyDisplay = () => {
    const freq = cookingFrequencyOptions.find(f => f.id === userData.cookingFrequency);
    return freq ? freq.title : 'Not set';
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
            <Text style={styles.headerTitle}>Your Preferences</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Settings Content */}
          <View style={styles.settingsContainer}>
            {/* Physical Stats */}
            <TouchableOpacity style={styles.settingRow} onPress={openPhysicalStatsModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Physical Stats</Text>
                <Text style={styles.settingDescription}>
                  {getPhysicalStatsSummary()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Activity Level */}
            <TouchableOpacity style={styles.settingRow} onPress={openActivityLevelModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Activity Level</Text>
                <Text style={styles.settingDescription}>
                  {getActivityLevelDisplay()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Goals */}
            <TouchableOpacity style={styles.settingRow} onPress={openGoalsModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Goals</Text>
                <Text style={styles.settingDescription}>
                  {getGoalsDisplay()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Dietary Preferences */}
            <TouchableOpacity style={styles.settingRow} onPress={openDietaryPrefsModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Dietary Preferences</Text>
                <Text style={styles.settingDescription}>
                  {getDietaryPrefsDisplay()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Allergies */}
            <TouchableOpacity style={styles.settingRow} onPress={openAllergensModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Allergies</Text>
                <Text style={styles.settingDescription}>
                  {getAllergensDisplay()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Kitchen Equipment */}
            <TouchableOpacity style={styles.settingRow} onPress={openEquipmentModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Kitchen Equipment</Text>
                <Text style={styles.settingDescription}>
                  {getEquipmentDisplay()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* Cooking Frequency */}
            <TouchableOpacity style={[styles.settingRow, styles.settingRowLast]} onPress={openCookingFrequencyModal}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Cooking Frequency</Text>
                <Text style={styles.settingDescription}>
                  {getCookingFrequencyDisplay()}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Physical Stats Modal */}
      <Modal
        visible={showPhysicalStatsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowPhysicalStatsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPhysicalStatsModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Physical Stats</Text>
                  <TouchableOpacity onPress={() => setShowPhysicalStatsModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalInputContainer}>
                  <Text style={styles.inputLabel}>Gender</Text>
                  <View style={styles.genderButtons}>
                    {['male', 'female', 'other'].map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        style={[
                          styles.genderButton,
                          tempGender === gender && styles.genderButtonSelected
                        ]}
                        onPress={() => setTempGender(gender)}
                      >
                        <Text style={[
                          styles.genderButtonText,
                          tempGender === gender && styles.genderButtonTextSelected
                        ]}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={tempAge}
                    onChangeText={setTempAge}
                    keyboardType="numeric"
                    placeholder="e.g., 30"
                    maxLength={3}
                  />

                  <Text style={styles.inputLabel}>Height</Text>
                  <View style={styles.heightInputs}>
                    <View style={styles.heightInputGroup}>
                      <TextInput
                        style={[styles.input, styles.heightInput]}
                        value={tempHeightFeet}
                        onChangeText={setTempHeightFeet}
                        keyboardType="numeric"
                        placeholder="5"
                        maxLength={1}
                      />
                      <Text style={styles.heightLabel}>feet</Text>
                    </View>
                    <View style={styles.heightInputGroup}>
                      <TextInput
                        style={[styles.input, styles.heightInput]}
                        value={tempHeightInches}
                        onChangeText={setTempHeightInches}
                        keyboardType="numeric"
                        placeholder="10"
                        maxLength={2}
                      />
                      <Text style={styles.heightLabel}>inches</Text>
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>Weight (lbs)</Text>
                  <TextInput
                    style={styles.input}
                    value={tempWeight}
                    onChangeText={setTempWeight}
                    keyboardType="numeric"
                    placeholder="e.g., 150"
                    maxLength={3}
                  />
                </ScrollView>

                <TouchableOpacity style={styles.modalSaveButton} onPress={savePhysicalStats}>
                  <Text style={styles.modalSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Activity Level Modal */}
      <Modal
        visible={showActivityLevelModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowActivityLevelModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowActivityLevelModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Activity Level</Text>
                  <TouchableOpacity onPress={() => setShowActivityLevelModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {activityLevels.map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      style={[
                        styles.modalOption,
                        tempActivityLevel === level.id && styles.modalOptionSelected
                      ]}
                      onPress={() => setTempActivityLevel(level.id)}
                    >
                      <Text style={styles.modalOptionEmoji}>{level.emoji}</Text>
                      <View style={styles.modalOptionText}>
                        <Text style={[
                          styles.modalOptionTitle,
                          tempActivityLevel === level.id && styles.modalOptionTitleSelected
                        ]}>
                          {level.title}
                        </Text>
                        <Text style={styles.modalOptionDescription}>{level.description}</Text>
                      </View>
                      {tempActivityLevel === level.id && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.modalSaveButton} onPress={saveActivityLevel}>
                  <Text style={styles.modalSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Goals Modal */}
      <Modal
        visible={showGoalsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowGoalsModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Goals</Text>
                  <TouchableOpacity onPress={() => setShowGoalsModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {goals.map((goal) => (
                    <TouchableOpacity
                      key={goal.id}
                      style={[
                        styles.modalOption,
                        tempGoals.includes(goal.id) && styles.modalOptionSelected
                      ]}
                      onPress={() => toggleGoal(goal.id)}
                    >
                      <Text style={styles.modalOptionEmoji}>{goal.emoji}</Text>
                      <View style={styles.modalOptionText}>
                        <Text style={[
                          styles.modalOptionTitle,
                          tempGoals.includes(goal.id) && styles.modalOptionTitleSelected
                        ]}>
                          {goal.title}
                        </Text>
                        <Text style={styles.modalOptionDescription}>{goal.description}</Text>
                      </View>
                      {tempGoals.includes(goal.id) && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.modalSaveButton} onPress={saveGoals}>
                  <Text style={styles.modalSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Dietary Preferences Modal */}
      <Modal
        visible={showDietaryPrefsModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDietaryPrefsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDietaryPrefsModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Dietary Preferences</Text>
                  <TouchableOpacity onPress={() => setShowDietaryPrefsModal(false)}>
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

                <TouchableOpacity style={styles.modalSaveButton} onPress={saveDietaryPrefs}>
                  <Text style={styles.modalSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Allergies Modal */}
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
                  <Text style={styles.modalTitle}>Allergies</Text>
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

      {/* Kitchen Equipment Modal */}
      <Modal
        visible={showEquipmentModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEquipmentModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowEquipmentModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Kitchen Equipment</Text>
                  <TouchableOpacity onPress={() => setShowEquipmentModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {equipmentOptions.map((eq) => (
                    <TouchableOpacity
                      key={eq.id}
                      style={[
                        styles.modalOption,
                        tempEquipment === eq.id && styles.modalOptionSelected
                      ]}
                      onPress={() => setTempEquipment(eq.id)}
                    >
                      <Text style={styles.modalOptionEmoji}>{eq.emoji}</Text>
                      <View style={styles.modalOptionText}>
                        <Text style={[
                          styles.modalOptionTitle,
                          tempEquipment === eq.id && styles.modalOptionTitleSelected
                        ]}>
                          {eq.title}
                        </Text>
                        <Text style={styles.modalOptionDescription}>{eq.description}</Text>
                      </View>
                      {tempEquipment === eq.id && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.modalSaveButton} onPress={saveEquipment}>
                  <Text style={styles.modalSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Cooking Frequency Modal */}
      <Modal
        visible={showCookingFrequencyModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCookingFrequencyModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCookingFrequencyModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Cooking Frequency</Text>
                  <TouchableOpacity onPress={() => setShowCookingFrequencyModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {cookingFrequencyOptions.map((freq) => (
                    <TouchableOpacity
                      key={freq.id}
                      style={[
                        styles.modalOption,
                        tempCookingFrequency === freq.id && styles.modalOptionSelected
                      ]}
                      onPress={() => setTempCookingFrequency(freq.id)}
                    >
                      <Text style={styles.modalOptionEmoji}>{freq.emoji}</Text>
                      <View style={styles.modalOptionText}>
                        <Text style={[
                          styles.modalOptionTitle,
                          tempCookingFrequency === freq.id && styles.modalOptionTitleSelected
                        ]}>
                          {freq.title}
                        </Text>
                        <Text style={styles.modalOptionDescription}>{freq.description}</Text>
                      </View>
                      {tempCookingFrequency === freq.id && (
                        <View style={styles.modalCheckmark}>
                          <Text style={styles.modalCheckmarkText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity style={styles.modalSaveButton} onPress={saveCookingFrequency}>
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
    fontFamily: 'Quicksand-Regular',
  },
  headerTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontFamily: 'Quicksand-SemiBold',
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
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'Quicksand-Medium',
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    fontFamily: 'Quicksand-Regular',
  },
  chevron: {
    fontSize: 18,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 28,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-SemiBold',
    color: '#1F2937',
    marginBottom: 2,
  },
  modalOptionTitleSelected: {
    color: '#6B46C1',
  },
  modalOptionDescription: {
    fontSize: 13,
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Bold',
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
    fontFamily: 'Quicksand-SemiBold',
  },
  modalInputContainer: {
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: 'Quicksand-Medium',
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
    fontFamily: 'Quicksand-Regular',
    color: '#1F2937',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  genderButtonText: {
    fontSize: 14,
    fontFamily: 'Quicksand-Medium',
    color: '#1F2937',
  },
  genderButtonTextSelected: {
    color: '#6B46C1',
    fontFamily: 'Quicksand-SemiBold',
  },
  heightInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  heightInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heightInput: {
    flex: 1,
  },
  heightLabel: {
    fontSize: 14,
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
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
    fontFamily: 'Quicksand-Medium',
    color: '#1F2937',
  },
  allergenChipTextSelected: {
    color: '#6B46C1',
  },
});
