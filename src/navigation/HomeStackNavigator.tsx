import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/main/HomeScreen';
import RecipeGeneratedScreen from '../screens/main/RecipeGeneratedScreen';
import RecipeReviewScreen from '../screens/main/RecipeReviewScreen';
import RecipeSavedScreen from '../screens/main/RecipeSavedScreen';
import EquipmentChecklistScreen from '../screens/main/EquipmentChecklistScreen';
import IngredientsListScreen from '../screens/main/IngredientsListScreen';
import CookingInstructionsScreen from '../screens/main/CookingInstructionsScreen';
import RecipeCompletionScreen from '../screens/main/RecipeCompletionScreen';

const Stack = createStackNavigator();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="RecipeGenerated" component={RecipeGeneratedScreen} />
      <Stack.Screen name="RecipeReview" component={RecipeReviewScreen} />
      <Stack.Screen name="RecipeSaved" component={RecipeSavedScreen} />
      <Stack.Screen name="EquipmentChecklist" component={EquipmentChecklistScreen} />
      <Stack.Screen name="IngredientsList" component={IngredientsListScreen} />
      <Stack.Screen name="CookingInstructions" component={CookingInstructionsScreen} />
      <Stack.Screen name="RecipeCompletion" component={RecipeCompletionScreen} />
    </Stack.Navigator>
  );
}