import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecipeBookScreen from '../screens/main/RecipeBookScreen';
import RecipeDetailScreen from '../screens/main/RecipeDetailScreen';

const Stack = createStackNavigator();

export default function RecipeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipeBook" component={RecipeBookScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
    </Stack.Navigator>
  );
}