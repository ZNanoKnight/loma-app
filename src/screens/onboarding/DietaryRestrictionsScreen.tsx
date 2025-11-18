import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';  // ADD THIS

type Allergen = 'dairy' | 'eggs' | 'peanuts' | 'tree_nuts' | 'soy' | 'wheat' | 'shellfish' | 'sesame' | 'gluten';
type Equipment = 'minimal' | 'basic' | 'full';

export default function DietaryRestrictionsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();

  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    userData.allergens && userData.allergens.length > 0 ? userData.allergens : []
  );
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>((userData.equipment as Equipment) || 'basic');

  const allergens = [
    {
      id: 'soy',
      emoji: '🌱',
      title: 'Soy',
    },
    {
      id: 'eggs',
      emoji: '🥚',
      title: 'Eggs',
    },
    {
      id: 'dairy',
      emoji: '🥛',
      title: 'Dairy',
    },
    {
      id: 'wheat',
      emoji: '🌾',
      title: 'Wheat',
    },
    {
      id: 'gluten',
      emoji: '🍞',
      title: 'Gluten',
    },
    {
      id: 'sesame',
      emoji: '🫘',
      title: 'Sesame',
    },
    {
      id: 'peanuts',
      emoji: '🥜',
      title: 'Peanuts',
    },
    {
      id: 'tree_nuts',
      emoji: '🌰',
      title: 'Tree Nuts',
    },
    {
      id: 'shellfish',
      emoji: '🦐',
      title: 'Shellfish',
    }
  ];

  const equipment = [
    {
      id: 'minimal',
      emoji: '🍳',
      title: 'Minimal',
      description: 'Microwave, Toaster, Kettle, Basic Utensils',
      prefix: null,
      tierName: null
    },
    {
      id: 'basic',
      emoji: '👨‍🍳',
      title: 'Basic',
      description: 'Stove, Oven, Pots & Pans, Baking Sheets',
      prefix: 'Everything in',
      tierName: 'Minimal'
    },
    {
      id: 'full',
      emoji: '🔪',
      title: 'Full Kitchen',
      description: 'Food Processor, Blender, Instant Pot, Air Fryer',
      prefix: 'Everything in',
      tierName: 'Basic'
    }
  ];

  const toggleAllergen = (allergenId: string) => {
    if (selectedRestrictions.includes(allergenId)) {
      setSelectedRestrictions(selectedRestrictions.filter(a => a !== allergenId));
    } else {
      setSelectedRestrictions([...selectedRestrictions, allergenId]);
    }
  };

  const handleContinue = () => {
    updateUserData({
      allergens: selectedRestrictions,
      equipment: selectedEquipment
    });
    navigation.navigate('CookingFrequency');
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
              <View style={[styles.progressFill, { width: '70%' }]} />
            </View>
            <Text style={styles.progressText}>Step 7 of 10</Text>
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
            {/* Allergies Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Any allergies?</Text>
              <Text style={styles.sectionSubtitle}>
                We'll avoid these in all recipes
              </Text>

              <View style={styles.allergenGrid}>
                {allergens.map((allergen) => (
                  <TouchableOpacity
                    key={allergen.id}
                    style={[
                      styles.allergenCard,
                      selectedRestrictions.includes(allergen.id as Allergen) && styles.allergenCardActive
                    ]}
                    onPress={() => toggleAllergen(allergen.id as Allergen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.allergenEmoji}>{allergen.emoji}</Text>
                    <Text style={[
                      styles.allergenTitle,
                      selectedRestrictions.includes(allergen.id as Allergen) && styles.allergenTitleActive
                    ]}>
                      {allergen.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Kitchen Equipment Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kitchen equipment?</Text>
              <Text style={styles.sectionSubtitle}>
                We'll match recipes to your setup
              </Text>

              <View style={styles.equipmentContainer}>
                {equipment.map((equip) => (
                  <TouchableOpacity
                    key={equip.id}
                    style={[
                      styles.equipmentCard,
                      selectedEquipment === equip.id && styles.equipmentCardActive
                    ]}
                    onPress={() => setSelectedEquipment(equip.id as Equipment)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.equipmentEmoji}>{equip.emoji}</Text>
                    <View style={styles.equipmentTextContainer}>
                      <Text style={[
                        styles.equipmentTitle,
                        selectedEquipment === equip.id && styles.equipmentTitleActive
                      ]}>
                        {equip.title}
                      </Text>
                      <Text style={[
                        styles.equipmentDescription,
                        selectedEquipment === equip.id && styles.equipmentDescriptionActive
                      ]}>
                        {equip.prefix && equip.tierName && (
                          <>
                            {equip.prefix}{' '}
                            <Text style={[
                              styles.equipmentTierName,
                              selectedEquipment === equip.id && styles.equipmentTierNameActive
                            ]}>
                              {equip.tierName}
                            </Text>
                            {', plus:'}{'\n'}
                          </>
                        )}
                        {equip.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
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
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Medium',
    color: '#6B46C1',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontFamily: 'VendSans-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'VendSans-Regular',
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
  },
  allergenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  allergenCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginRight: 10,
  },
  allergenCardActive: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  allergenEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  allergenTitle: {
    fontFamily: 'VendSans-Medium',
    fontSize: 15,
    color: '#1F2937',
  },
  allergenTitleActive: {
    color: '#6B46C1',
  },
  equipmentContainer: {
    marginBottom: 10,
  },
  equipmentCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipmentCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  equipmentEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  equipmentTextContainer: {
    flex: 1,
  },
  equipmentTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  equipmentTitleActive: {
    color: '#6B46C1',
  },
  equipmentDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  equipmentDescriptionActive: {
    color: '#6B46C1',
  },
  equipmentTierName: {
    fontFamily: 'VendSans-SemiBold',
    color: '#6B46C1',
  },
  equipmentTierNameActive: {
    color: '#6B46C1',
  },
  continueButton: {
    backgroundColor: '#6B46C1',
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
    marginTop: 10,
  },
  continueButtonText: {
    fontFamily: 'VendSans-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});