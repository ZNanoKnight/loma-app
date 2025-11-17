import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecipeBookScreen from '../screens/main/RecipeBookScreen';
import RecipeDetailScreen from '../screens/main/RecipeDetailScreen';
import EquipmentChecklistScreen from '../screens/main/EquipmentChecklistScreen';
import IngredientsListScreen from '../screens/main/IngredientsListScreen';
import CookingInstructionsScreen from '../screens/main/CookingInstructionsScreen';

const Stack = createStackNavigator();

export default function RecipeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecipeBook" component={RecipeBookScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="EquipmentChecklist" component={EquipmentChecklistScreen} />
      <Stack.Screen name="IngredientsList" component={IngredientsListScreen} />
      <Stack.Screen name="CookingInstructions" component={CookingInstructionsScreen} />
      <Stack.Screen name="Home" component={RecipeBookScreen} />
    </Stack.Navigator>
  );
}