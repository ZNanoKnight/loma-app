import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/main/HomeScreen';
import RecipeGeneratedScreen from '../screens/main/RecipeGeneratedScreen';
import EquipmentChecklistScreen from '../screens/main/EquipmentChecklistScreen';
import IngredientsListScreen from '../screens/main/IngredientsListScreen';
import CookingInstructionsScreen from '../screens/main/CookingInstructionsScreen';

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RecipeGenerated" component={RecipeGeneratedScreen} />
      <Stack.Screen name="EquipmentChecklist" component={EquipmentChecklistScreen} />
      <Stack.Screen name="IngredientsList" component={IngredientsListScreen} />
      <Stack.Screen name="CookingInstructions" component={CookingInstructionsScreen} />
    </Stack.Navigator>
  );
}