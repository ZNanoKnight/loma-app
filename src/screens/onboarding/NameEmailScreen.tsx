import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

export default function NameEmailScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();  // ADD THIS
  
  const [firstName, setFirstName] = useState(userData.firstName || '');  // MODIFIED
  const [email, setEmail] = useState(userData.email || '');  // MODIFIED

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = firstName.length > 0 && isValidEmail(email);

  const handleContinue = () => {
    if (isFormValid) {
      updateUserData({ firstName, email });  // ADD THIS LINE
      navigation.navigate('PhysicalStats');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
                <View style={[styles.progressFill, { width: '20%' }]} />
              </View>
              <Text style={styles.progressText}>Step 2 of 10</Text>
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
              <Text style={styles.title}>Let's get to know you!</Text>
              <Text style={styles.subtitle}>
                We'll use this to personalize your experience
              </Text>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
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
  title: {
    fontFamily: 'VendSans-Bold',
    fontSize: 32,
    color: '#6B46C1',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'VendSans-Regular',
    fontSize: 16,
    color: '#6B7280',
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
    fontFamily: 'VendSans-Medium',
    color: '#1F2937',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'VendSans-Regular',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
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
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontFamily: 'VendSans-SemiBold',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
});