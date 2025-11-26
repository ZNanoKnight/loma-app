import React, { createContext, useState, useContext, ReactNode } from 'react';

// Recipe-related types
export interface EquipmentItem {
  id: string;
  name: string;
  emoji: string;
  essential: boolean;
  alternative?: string;
}

export interface Ingredient {
  id: string;
  category: string;
  amount: string;
  unit: string;
  item: string;
  notes?: string;
  calories: number;
  inPantry?: boolean;
}

export interface CookingStep {
  id: string;
  title: string;
  instruction: string;
  time?: number;
  tip?: string;
  warning?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  emoji: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
  ingredients: Ingredient[];
  instructions: CookingStep[];
  equipment: EquipmentItem[];
  tags: string[];
  cookedCount: number;
  lastCooked?: string;
  createdDate: string;
  notes?: string;
  rating?: number;
  isFavorite: boolean;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface RecipeContextType {
  // Current recipe being viewed/cooked (set before navigating to detail screens)
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe | null) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  // Current recipe state - used during cooking flow
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);

  return (
    <RecipeContext.Provider
      value={{
        currentRecipe,
        setCurrentRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipe() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipe must be used within a RecipeProvider');
  }
  return context;
}
