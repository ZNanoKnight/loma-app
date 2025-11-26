import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/auth/authService';
import { UserService } from '../services/user/userService';

// Define types for our user data
interface UserData {
  // Onboarding data
  firstName: string;
  lastName: string;
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
  selectedPlan: string;

  // App data
  currentStreak: number;
  totalRecipes: number;
  savedRecipes: any[];
  favoriteRecipes: string[];
  weeklyProgress: boolean[];
  hoursSaved: number;
  moneySaved: number;

  // Settings
  metricUnits: boolean;

  // Profile
  defaultServingSize?: number;
  profileImageUri?: string; // Temporary storage for profile photo URI
  // NOTE: In production, this would be replaced with a URL to the uploaded image from the backend
  // The URI is just a file path string, so it's lightweight and won't impact performance

  // Onboarding status
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
}

interface UserContextType {
  userData: UserData;
  updateUserData: (updates: Partial<UserData>) => void;
  clearUserData: () => void;
  signOut: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = '@loma_user_data';

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialUserData: UserData = {
  // Onboarding
  firstName: '',
  lastName: '',
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
  selectedPlan: '',

  // App data
  currentStreak: 0,
  totalRecipes: 0,
  savedRecipes: [],
  favoriteRecipes: [],
  weeklyProgress: [false, false, false, false, false, false, false],
  hoursSaved: 0,
  moneySaved: 0,

  // Settings
  metricUnits: false,

  // Profile
  defaultServingSize: 2,
  profileImageUri: undefined,

  // Onboarding status
  hasCompletedOnboarding: false,
  isAuthenticated: false,
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
    setUserData(prev => {
      const newData = { ...prev, ...updates };

      // Sync to Supabase if authenticated (debounced)
      if (newData.isAuthenticated) {
        syncToSupabase(newData);
      }

      return newData;
    });
  };

  // Debounced sync to Supabase
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncToSupabase = async (data: UserData) => {
    // Clear previous timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce by 1 second to avoid too many updates
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const session = await AuthService.getCurrentSession();
        if (!session) {
          console.log('[UserContext] No session - skipping sync');
          return;
        }

        // Only sync if user has completed onboarding AND is authenticated
        // This prevents syncing during onboarding before profile is created
        if (!data.hasCompletedOnboarding || !data.isAuthenticated) {
          console.log('[UserContext] Skipping sync - onboarding not complete or not authenticated', {
            hasCompletedOnboarding: data.hasCompletedOnboarding,
            isAuthenticated: data.isAuthenticated,
          });
          return;
        }

        console.log('[UserContext] Syncing profile to Supabase for user:', session.user.id);

        // Map UserContext data to UserProfile format
        await UserService.updateUserProfile(session.user.id, {
          user_id: session.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          age: data.age,
          weight: data.weight,
          height_feet: data.heightFeet,
          height_inches: data.heightInches,
          gender: data.gender,
          activity_level: data.activityLevel,
          goals: data.goals,
          dietary_preferences: data.dietaryPreferences,
          allergens: data.allergens,
          equipment: data.equipment,
          cooking_frequency: data.cookingFrequency,
          default_serving_size: data.defaultServingSize,
          profile_image_url: data.profileImageUri,
          metric_units: data.metricUnits,
          has_completed_onboarding: data.hasCompletedOnboarding,
        });

        console.log('Profile synced to Supabase');
      } catch (error) {
        console.error('Error syncing to Supabase:', error);
        // Silent fail - local data is still saved
      }
    }, 1000);
  };

  const clearUserData = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUserData(initialUserData);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const signOut = () => {
    setUserData(prev => ({ ...prev, isAuthenticated: false }));
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData, clearUserData, signOut, isLoading }}>
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