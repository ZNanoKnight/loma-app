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
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthService } from '../../services/auth/authService';
import { UserService } from '../../services/user/userService';
import { useUser } from '../../context/UserContext';
import { LomaError } from '../../services/types';

export default function LoginScreen({ route }: any) {
  const navigation = useNavigation<any>();
  const { updateUserData } = useUser();

  // Pre-fill email if passed from navigation params (e.g., from PaymentScreen)
  const prefillEmail = route?.params?.email || '';

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = isValidEmail(email) && password.length >= 8;

  const handleLogin = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      // Sign in with Supabase
      const authSession = await AuthService.signIn({
        email: email.trim().toLowerCase(),
        password,
      });

      // Get user profile from database
      const profile = await UserService.getUserProfile(authSession.user.id);

      if (!profile) {
        throw new Error('Profile not found');
      }

      // Update UserContext with profile data
      updateUserData({
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: authSession.user.email || email,
        age: profile.age,
        weight: profile.weight,
        heightFeet: profile.height_feet,
        heightInches: profile.height_inches,
        gender: profile.gender,
        activityLevel: profile.activity_level,
        goals: profile.goals || [],
        dietaryPreferences: profile.dietary_preferences || [],
        allergens: profile.allergens || [],
        equipment: profile.equipment,
        cookingFrequency: profile.cooking_frequency,
        mealPrepInterest: profile.meal_prep_interest,
        targetWeight: profile.target_weight,
        targetProtein: profile.target_protein,
        targetCalories: profile.target_calories,
        dislikedIngredients: profile.disliked_ingredients || [],
        cuisinePreferences: profile.cuisine_preferences || [],
        defaultServingSize: profile.default_serving_size || 1,
        profileImageUri: profile.profile_image_url,
        notifications: profile.notifications ?? true,
        mealReminders: profile.meal_reminders ?? true,
        weeklyReport: profile.weekly_report ?? true,
        darkMode: profile.dark_mode ?? false,
        metricUnits: profile.metric_units ?? false,
        hasCompletedOnboarding: profile.has_completed_onboarding ?? false,
        isAuthenticated: true,
      });

      // Navigation will automatically switch to MainTab due to isAuthenticated
    } catch (error) {
      console.error('Login error:', error);

      let errorMessage = 'Failed to sign in. Please try again.';

      if (error instanceof LomaError) {
        errorMessage = error.userMessage || errorMessage;
      } else if (error instanceof Error) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email before logging in.';
        } else if (error.message.includes('Profile not found')) {
          errorMessage = 'Account setup incomplete. Please contact support.';
        }
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Welcome'); // Start onboarding flow
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your healthy eating journey
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.showPasswordButton}
                  >
                    <Text style={styles.showPasswordText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                (!isFormValid || loading) && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={loading}>
                <Text style={styles.signUpLink}>Sign Up</Text>
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
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  showPasswordButton: {
    paddingHorizontal: 16,
  },
  showPasswordText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signUpLink: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});
