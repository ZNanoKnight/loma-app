import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameEmailScreen from '../screens/onboarding/NameEmailScreen';
import PhysicalStatsScreen from '../screens/onboarding/PhysicalStatsScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import GoalsScreen from '../screens/onboarding/GoalsScreen';
import DietaryPreferencesScreen from '../screens/onboarding/DietaryPreferencesScreen';
import DietaryRestrictionsScreen from '../screens/onboarding/DietaryRestrictionsScreen';
import CookingFrequencyScreen from '../screens/onboarding/CookingFrequencyScreen';
import RecipePreviewScreen from '../screens/onboarding/RecipePreviewScreen';
import AppFeaturesScreen from '../screens/onboarding/AppFeaturesScreen';
import PaymentScreen from '../screens/onboarding/PaymentScreen';
import PaymentCollectionScreen from '../screens/onboarding/PaymentCollectionScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import EmailConfirmationScreen from '../screens/auth/EmailConfirmationScreen';

const Stack = createStackNavigator();

export default function OnboardingNavigator({ route }: any) {
  // Check if we should start at PaymentCollection (after email verification)
  const initialRoute = route?.params?.screen || 'Welcome';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#4F46E5' }
      }}
      initialRouteName={initialRoute}
    >
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmationScreen} />
      <Stack.Screen name="PaymentCollection" component={PaymentCollectionScreen} />

      {/* Onboarding Screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="NameEmail" component={NameEmailScreen} />
      <Stack.Screen name="PhysicalStats" component={PhysicalStatsScreen} />
      <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="DietaryPreferences" component={DietaryPreferencesScreen} />
      <Stack.Screen name="DietaryRestrictions" component={DietaryRestrictionsScreen} />
      <Stack.Screen name="CookingFrequency" component={CookingFrequencyScreen} />
      <Stack.Screen name="RecipePreview" component={RecipePreviewScreen} />
      <Stack.Screen name="AppFeatures" component={AppFeaturesScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}