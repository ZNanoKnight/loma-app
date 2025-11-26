import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProgressScreen from '../screens/main/ProgressScreen';
import AllAchievementsScreen from '../screens/main/AllAchievementsScreen';

const Stack = createStackNavigator();

export default function ProgressStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="AllAchievements" component={AllAchievementsScreen} />
    </Stack.Navigator>
  );
}