import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define types for our user data
interface UserData {
  // Onboarding data
  firstName: string;
  email: string;
  age: string;
  weight: string;
  heightFeet: string;
  heightInches: string;
  gender: string;
  activityLevel: string;
  goals: string[];
  dietaryPreferences: string[];
  allergens: string[];
  equipment: string;
  cookingFrequency: string;
  mealPrepInterest: string;
  
  // App data
  currentStreak: number;
  totalRecipes: number;
  savedRecipes: any[];
  favoriteRecipes: string[];
  weeklyProgress: boolean[];
  
  // Settings
  notifications: boolean;
  mealReminders: boolean;
  weeklyReport: boolean;
  darkMode: boolean;
  metricUnits: boolean;
  
  // Profile
  targetWeight: string;
  targetProtein: string;
  targetCalories: string;
}

interface UserContextType {
  userData: UserData;
  updateUserData: (updates: Partial<UserData>) => void;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialUserData: UserData = {
  // Onboarding
  firstName: '',
  email: '',
  age: '',
  weight: '',
  heightFeet: '',
  heightInches: '',
  gender: '',
  activityLevel: '',
  goals: [],
  dietaryPreferences: [],
  allergens: [],
  equipment: 'basic',
  cookingFrequency: '',
  mealPrepInterest: '',
  
  // App data
  currentStreak: 0,
  totalRecipes: 0,
  savedRecipes: [],
  favoriteRecipes: [],
  weeklyProgress: [false, false, false, false, false, false, false],
  
  // Settings
  notifications: true,
  mealReminders: true,
  weeklyReport: true,
  darkMode: false,
  metricUnits: false,
  
  // Profile
  targetWeight: '',
  targetProtein: '50',
  targetCalories: '2000',
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(initialUserData);

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updates }));
  };

  const clearUserData = () => {
    setUserData(initialUserData);
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData, clearUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}