## Overview
Loma is an AI-powered recipe and meal planning mobile application built with React Native and Expo. The app features a comprehensive 11-screen onboarding flow, personalized recipe generation, meal tracking, progress monitoring, and a complete cooking experience with step-by-step instructions. The app uses global state management for user data persistence and includes a token-based recipe generation system.

## Tech Stack
Language: TypeScript 5.x
Framework: React Native 0.81.x with Expo SDK 54
Navigation: React Navigation 7 (@react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs)
State Management: React Context API (custom UserContext) with AsyncStorage persistence
UI Components:

expo-linear-gradient (gradient backgrounds)
Custom components (no external UI library)

Fonts: Custom VendSans font family (10 weights)
Key Dependencies:

@react-native-async-storage/async-storage (state persistence)
expo-font (custom font loading)
expo-splash-screen (loading screen management)
react-native-safe-area-context
react-native-screens
react-native-gesture-handler
react-native-reanimated

## Project Structure
loma-app/
├── App.tsx                    # Root component with font loading and UserProvider
├── assets/
│   └── fonts/                 # VendSans font files (all weights)
├── src/
│   ├── components/
│   │   └── Text.tsx          # Global text component with custom font
│   ├── context/
│   │   └── UserContext.tsx   # Global state management for user data
│   ├── navigation/
│   │   ├── RootNavigator.tsx           # Top-level navigator
│   │   ├── OnboardingNavigator.tsx     # 11-screen onboarding flow
│   │   ├── MainTabNavigator.tsx        # Bottom tab navigation
│   │   ├── HomeStackNavigator.tsx      # Home tab stack
│   │   ├── RecipeStackNavigator.tsx    # Recipe book tab stack
│   │   └── ProgressStackNavigator.tsx  # Progress tab stack
│   └── screens/
│       ├── onboarding/        # 11 onboarding screens
│       │   ├── WelcomeScreen.tsx
│       │   ├── NameEmailScreen.tsx
│       │   ├── PhysicalStatsScreen.tsx
│       │   ├── ActivityLevelScreen.tsx
│       │   ├── GoalsScreen.tsx
│       │   ├── DietaryPreferencesScreen.tsx
│       │   ├── DietaryRestrictionsScreen.tsx
│       │   ├── CookingFrequencyScreen.tsx
│       │   ├── RecipePreviewScreen.tsx
│       │   ├── AppFeaturesScreen.tsx
│       │   └── PaymentScreen.tsx (PaywallScreen)
│       └── main/              # 10 main app screens
│           ├── HomeScreen.tsx
│           ├── RecipeGeneratedScreen.tsx
│           ├── RecipeBookScreen.tsx
│           ├── RecipeDetailScreen.tsx
│           ├── EquipmentChecklistScreen.tsx
│           ├── IngredientsListScreen.tsx
│           ├── CookingInstructionsScreen.tsx
│           ├── ProgressScreen.tsx
│           ├── WeeklyCheckInScreen.tsx
│           └── SettingsScreen.tsx

## Commands

Start development server: npm start
Run on iOS: npm run ios
Run on Android: npm run android
Install dependencies: npm install
Install Expo dependencies: npx expo install [package-name]
Clear cache: npx expo start -c

Git Commands

Stage changes: git add .
Commit: git commit -m "message"
Push to GitHub: git push
Check status: git status

## Design System

### Color Palette
- **Primary**: White (#FFFFFF, #FEFEFE)
- **Secondary**: Purple (#6B46C1)
- **Tertiary**: Orange (#F59E0B)

### Color Usage Rules
- **Backgrounds**: White (#FEFEFE)
- **Main Text**: Black (#000000, #1F2937)
- **Secondary Text**: Gray (#6B7280, #9CA3AF)
- **Additional Info**: Orange (#F59E0B) - Use sparingly for highlights
- **Buttons**:
  - Purple background (#6B46C1) with white text
  - White background with purple text (#6B46C1)
  - Always maintain high contrast for accessibility
- **Cards & Elements**: White with subtle shadows for depth

## Coding Standards
Style Conventions

Components: PascalCase (e.g., HomeScreen, RecipeBookScreen)
Files: Match component names exactly (e.g., HomeScreen.tsx)
Functions: camelCase with handle prefix for events (e.g., handleContinue, handleSaveRecipe)
State variables: camelCase with set prefix for setters (e.g., [userName, setUserName])
Interfaces: PascalCase with descriptive names (e.g., UserData, Recipe)

Component Structure
typescriptimport React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

export default function ScreenName() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  // Component logic
  return <View>...</View>;
}

const styles = StyleSheet.create({
  // Styles at bottom of file
});
Navigation Patterns

Stack navigators for each tab
Navigate using: navigation.navigate('ScreenName')
Pass data: navigation.navigate('ScreenName', { param: value })
Go back: navigation.goBack()

## Context
Global State (UserContext)
The app uses React Context for global state management with the following data structure:
typescriptUserData {
  // User Profile
  firstName: string
  email: string
  age: string
  weight: string
  heightFeet: string
  heightInches: string
  gender: 'male' | 'female' | 'other'

  // Preferences
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very' | 'extra'
  goals: string[]
  dietaryPreferences: string[]
  allergens: string[]
  equipment: string
  cookingFrequency: string
  mealPrepInterest: string
  
  // Targets
  targetWeight: string
  targetCalories: string
  targetProtein: string
  
  // Progress Tracking
  currentStreak: number
  totalRecipes: number
  savedRecipes: any[]
  favoriteRecipes: string[]
  weeklyProgress: boolean[] // 7 days
  
  // Settings
  notifications: boolean
  mealReminders: boolean
  weeklyReport: boolean
  darkMode: boolean
  metricUnits: boolean
}

Business Logic

Onboarding Flow: Users must complete all 11 onboarding screens before accessing the main app
Token System: Users receive tokens based on their subscription plan. Each token allows the generation of one personalized recipe. Generated recipes are saved permanently in the user's Recipe Book regardless of token usage.
Recipe Generation: Mock AI-generated recipes based on user preferences (would connect to actual AI API in production)
Cooking Flow: Equipment checklist → Ingredients list → Step-by-step instructions
Progress Tracking: Weekly check-ins, streak counting, and achievement system
State Persistence: All user data stored in Context (would sync with backend in production)

Important Constraints

No external UI libraries: All components are custom-built
Gradient backgrounds: Purple gradient theme (#6B46C1 to #342671) throughout
Custom font: VendSans font family applied globally
Mock data: Currently using mock recipes and data (ready for API integration)
Navigation structure: Fixed tab structure with nested stack navigators
Platform: Designed for mobile (iOS/Android) via Expo

Known Navigation Routes

Onboarding: Welcome → NameEmail → PhysicalStats → ActivityLevel → Goals → DietaryPreferences → DietaryRestrictions → CookingFrequency → RecipePreview → AppFeatures → Payment
Main App: Home → RecipeGenerated → EquipmentChecklist → IngredientsList → CookingInstructions
Recipe Book: RecipeBook → RecipeDetail
Progress: Progress → WeeklyCheckIn
Settings: Direct screen (no stack)

GitHub Repository

URL: https://github.com/ZNanoKnight/loma-app
Main branch: main
Public repository