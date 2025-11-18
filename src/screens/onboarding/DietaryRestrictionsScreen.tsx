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

type Allergen = 'none' | 'dairy' | 'eggs' | 'gluten' | 'nuts' | 'shellfish' | 'soy';  // KEEP THIS
type Equipment = 'full' | 'basic' | 'minimal';  // KEEP THIS

export default function DietaryRestrictionsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>(
    userData.allergens && userData.allergens.length > 0 ? userData.allergens : ['none']
  );
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>((userData.equipment as Equipment) || 'basic');  // MODIFIED
  const [customRestriction, setCustomRestriction] = useState('');

  const allergens = [
    {
      id: 'none',
      emoji: '✓',
      title: 'No Allergies',
    },
    {
      id: 'dairy',
      emoji: '🥛',
      title: 'Dairy',
    },
    {
      id: 'eggs',
      emoji: '🥚',
      title: 'Eggs',
    },
    {
      id: 'gluten',
      emoji: '🌾',
      title: 'Gluten',
    },
    {
      id: 'nuts',
      emoji: '🥜',
      title: 'Nuts',
    },
    {
      id: 'shellfish',
      emoji: '🦐',
      title: 'Shellfish',
    },
    {
      id: 'soy',
      emoji: '🌱',
      title: 'Soy',
    }
  ];

  const equipment = [
    {
      id: 'minimal',
      emoji: '🍳',
      title: 'Minimal',
      description: 'Microwave, basic utensils'
    },
    {
      id: 'basic',
      emoji: '👨‍🍳',
      title: 'Basic',
      description: 'Stove, oven, standard cookware'
    },
    {
      id: 'full',
      emoji: '👨‍🍳',
      title: 'Full Kitchen',
      description: 'All appliances including specialty items'
    }
  ];

  const toggleAllergen = (allergenId: string) => {
    if (allergenId === 'none') {
      setSelectedRestrictions(['none']);
    } else {
      let newRestrictions = selectedRestrictions.filter(a => a !== 'none');
      
      if (selectedRestrictions.includes(allergenId)) {
        newRestrictions = newRestrictions.filter(a => a !== allergenId);
      } else {
        newRestrictions = [...newRestrictions, allergenId];
      }
      
      setSelectedRestrictions(newRestrictions.length > 0 ? newRestrictions : ['none']);
    }
  };

  const selectEquipment = (equipmentId: Equipment) => {
    setSelectedEquipment(equipmentId);
  };

  const addCustomRestriction = () => {
    if (customRestriction.trim()) {
      const newRestrictions = selectedRestrictions.filter(a => a !== 'none');
      setSelectedRestrictions([...newRestrictions, customRestriction.trim()]);
      setCustomRestriction('');
    }
  };

  const removeCustomRestriction = (restriction: string) => {
    const newRestrictions = selectedRestrictions.filter(r => r !== restriction);
    setSelectedRestrictions(newRestrictions.length > 0 ? newRestrictions : ['none']);
  };

  const handleContinue = () => {
    updateUserData({   // ADD THIS BLOCK
      allergens: selectedRestrictions,
      equipment: selectedEquipment
    });
    navigation.navigate('CookingFrequency');
  };

  const handleSkip = () => {
    updateUserData({   // ADD THIS BLOCK
      allergens: ['none'],
      equipment: 'basic'
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
            <Text style={styles.progressText}>Step 7 of 11</Text>
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
                      {equip.description}
                    </Text>
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
    backgroundColor: '#6B46C1',
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
    flexDirection: 'row',
    gap: 10,
  },
  equipmentCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  equipmentCardActive: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  equipmentEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  equipmentTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  equipmentTitleActive: {
    color: '#6B46C1',
  },
  equipmentDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  equipmentDescriptionActive: {
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