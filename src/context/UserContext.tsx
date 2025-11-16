import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Onboarding status
  hasCompletedOnboarding: boolean;
}

interface UserContextType {
  userData: UserData;
  updateUserData: (updates: Partial<UserData>) => void;
  clearUserData: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = '@loma_user_data';

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

  // Onboarding status
  hasCompletedOnboarding: false,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    loadUserData();
  }, []);

  // Save user data to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveUserData();
    }
  }, [userData, isLoading]);

  const loadUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updates }));
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUserData(initialUserData);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData, clearUserData, isLoading }}>
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