import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsMainScreen from '../screens/settings/SettingsMainScreen';
import SubscriptionScreen from '../screens/settings/SubscriptionScreen';
import AddSubscriptionScreen from '../screens/settings/AddSubscriptionScreen';
import YourPreferencesScreen from '../screens/settings/YourPreferencesScreen';
import AppPreferencesScreen from '../screens/settings/AppPreferencesScreen';
import SupportScreen from '../screens/settings/SupportScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import FeedbackScreen from '../screens/settings/FeedbackScreen';

const Stack = createStackNavigator();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsMainScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="AddSubscription" component={AddSubscriptionScreen} />
      <Stack.Screen name="YourPreferences" component={YourPreferencesScreen} />
      <Stack.Screen name="AppPreferences" component={AppPreferencesScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
    </Stack.Navigator>
  );
}
