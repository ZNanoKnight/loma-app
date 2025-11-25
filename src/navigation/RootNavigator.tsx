import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Linking from 'expo-linking';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useUser } from '../context/UserContext';
import { AuthService } from '../services/auth/authService';
import { UserService } from '../services/user/userService';
import { getSupabaseClient } from '../services/auth/supabase';
import { DataMigrationService } from '../services/migration/dataMigration';
import { logger } from '../utils/logger';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { userData, updateUserData, isLoading: contextLoading } = useUser();
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [pendingPaymentNavigation, setPendingPaymentNavigation] = useState(false);

  // Check for existing Supabase session on mount
  useEffect(() => {
    checkSession();
    const cleanup = setupAuthListener();

    // Return cleanup function to unsubscribe on unmount
    return cleanup;
  }, []);

  // Handle deep links for email confirmation
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      logger.log('[RootNavigator] Deep link received:', url);

      const { path, queryParams } = Linking.parse(url);

      if (path === 'auth/confirm') {
        const token = queryParams?.token as string;
        const type = queryParams?.type as string;

        if (token && type === 'signup') {
          try {
            logger.log('[RootNavigator] Verifying email with token...');

            // Verify the email with the token
            const { data, error } = await getSupabaseClient().auth.verifyOtp({
              token_hash: token,
              type: 'signup',
            });

            if (error) throw error;

            if (data.session) {
              logger.log('[RootNavigator] Email verified successfully!');

              // Email confirmed! Load user profile
              const profile = await UserService.getUserProfile(data.user.id);

              if (profile) {
                updateUserData({
                  firstName: profile.first_name,
                  lastName: profile.last_name,
                  email: data.user.email || '',
                  hasCompletedOnboarding: profile.has_completed_onboarding ?? false,
                  isAuthenticated: true,
                });

                // Check if user has completed payment (onboarding)
                if (!profile.has_completed_onboarding) {
                  // User verified email but hasn't paid yet
                  logger.log('[RootNavigator] Email verified, payment pending...');
                  setPendingPaymentNavigation(true);

                  Alert.alert(
                    'Email Verified! 🎉',
                    'Your email has been confirmed. Now let\'s complete your subscription to start using LOMA.',
                    [{ text: 'Continue' }]
                  );
                } else {
                  // User already completed payment - just show success
                  Alert.alert(
                    'Email Verified! 🎉',
                    'Your email has been confirmed. Welcome back to LOMA!',
                    [{ text: 'Get Started' }]
                  );
                }
              }
            }
          } catch (error) {
            logger.error('[RootNavigator] Email confirmation error:', error);
            Alert.alert(
              'Verification Failed',
              'Failed to verify your email. Please try again or contact support.',
              [{ text: 'OK' }]
            );
          }
        }
      }
    };

    // Get initial URL (if app was opened from email link)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  const checkSession = async () => {
    try {
      // Check for local data that needs migration
      const needsMigration = await DataMigrationService.hasLocalDataToMigrate();
      setHasLocalData(needsMigration);

      // Check for existing Supabase session
      const session = await AuthService.getCurrentSession();

      if (session) {
        // Load user profile from database
        const profile = await UserService.getUserProfile(session.user.id);

        if (profile) {
          // Update context with profile data
          updateUserData({
            firstName: profile.first_name,
            lastName: profile.last_name,
            email: session.user.email || '',
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
        }
      }
    } catch (error) {
      console.error('Session check error:', error);
      // If session check fails, user will see login screen
    } finally {
      setSessionLoading(false);
    }
  };

  const setupAuthListener = () => {
    const supabase = getSupabaseClient();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_OUT') {
          // Clear user data and show login
          updateUserData({
            isAuthenticated: false,
            hasCompletedOnboarding: false,
          });
        } else if (event === 'SIGNED_IN' && session) {
          // Reload user profile
          try {
            const profile = await UserService.getUserProfile(session.user.id);
            if (profile) {
              updateUserData({
                firstName: profile.first_name,
                lastName: profile.last_name,
                email: session.user.email || '',
                hasCompletedOnboarding: profile.has_completed_onboarding ?? false,
                isAuthenticated: true,
              });
            }
          } catch (error) {
            console.error('Error loading profile on sign in:', error);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  };

  // Show loading screen while checking authentication status
  if (contextLoading || sessionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4F46E5' }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
          Loading your account...
        </Text>
      </View>
    );
  }

  // Determine which navigator to show based on auth and onboarding status
  const shouldShowPaymentCollection = userData.isAuthenticated && !userData.hasCompletedOnboarding && pendingPaymentNavigation;
  const shouldShowMainApp = userData.isAuthenticated && userData.hasCompletedOnboarding;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {shouldShowMainApp ? (
        <Stack.Screen name="MainApp" component={MainTabNavigator} />
      ) : shouldShowPaymentCollection ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingNavigator}
          initialParams={{ screen: 'PaymentCollection' }}
        />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
    </Stack.Navigator>
  );
}