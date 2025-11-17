import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';  // ADD THIS

export default function PhysicalStatsScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [age, setAge] = useState(userData.age || '');  // MODIFIED
  const [weight, setWeight] = useState(userData.weight || '');  // MODIFIED
  const [heightFeet, setHeightFeet] = useState(userData.heightFeet || '');  // MODIFIED
  const [heightInches, setHeightInches] = useState(userData.heightInches || '');  // MODIFIED
  const [selectedGender, setSelectedGender] = useState(userData.gender || '');  // MODIFIED
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

  const isFormValid = 
    age.length > 0 && 
    weight.length > 0 && 
    selectedGender.length > 0;

  const handleContinue = () => {
    if (isFormValid) {
      updateUserData({   // ADD THIS BLOCK
        age, 
        weight, 
        heightFeet, 
        heightInches,
        gender: selectedGender 
      });
      navigation.navigate('ActivityLevel');
    }
  };

  return (
    <LinearGradient
      colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '30%' }]} />
              </View>
              <Text style={styles.progressText}>Step 3 of 10</Text>
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
              <Text style={styles.title}>Tell us about yourself</Text>
              <Text style={styles.subtitle}>
                This helps us calculate your nutritional needs
              </Text>

              {/* Form */}
              <View style={styles.form}>
                {/* Gender Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Gender</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        selectedGender === 'male' && styles.genderButtonActive
                      ]}
                      onPress={() => setSelectedGender('male')}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        selectedGender === 'male' && styles.genderButtonTextActive
                      ]}>
                        Male
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        selectedGender === 'female' && styles.genderButtonActive
                      ]}
                      onPress={() => setSelectedGender('female')}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        selectedGender === 'female' && styles.genderButtonTextActive
                      ]}>
                        Female
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        selectedGender === 'other' && styles.genderButtonActive
                      ]}
                      onPress={() => setSelectedGender('other')}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        selectedGender === 'other' && styles.genderButtonTextActive
                      ]}>
                        Other
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Age */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="Enter your age"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>

                {/* Height */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Height</Text>
                  <View style={styles.heightContainer}>
                    <View style={styles.heightInputWrapper}>
                      <TextInput
                        style={[styles.input, styles.heightInput]}
                        value={heightFeet}
                        onChangeText={setHeightFeet}
                        placeholder="5"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        keyboardType="number-pad"
                        maxLength={1}
                      />
                      <Text style={styles.heightUnit}>ft</Text>
                    </View>
                    <View style={styles.heightInputWrapper}>
                      <TextInput
                        style={[styles.input, styles.heightInput]}
                        value={heightInches}
                        onChangeText={setHeightInches}
                        placeholder="10"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        keyboardType="number-pad"
                        maxLength={2}
                      />
                      <Text style={styles.heightUnit}>in</Text>
                    </View>
                  </View>
                </View>

                {/* Weight */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Weight (lbs)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="Enter your weight"
                    placeholderTextColor="rgba(255, 255, 255, 0.4)"
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !isFormValid && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={!isFormValid}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.continueButtonText,
                  !isFormValid && styles.continueButtonTextDisabled
                ]}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  genderButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#4F46E5',
  },
  heightContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  heightInputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heightInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  heightUnit: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginLeft: 8,
  },
  continueButton: {
    backgroundColor: 'white',
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
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: 'rgba(79, 70, 229, 0.5)',
  },
});