/**
 * Services Index
 * Central export point for all services
 */

// Auth
export { AuthService } from './auth/authService';
export { supabase, isSupabaseConfigured, getSupabaseClient } from './auth/supabase';

// Storage
export { SecureStorage, LocalStorage } from './storage';

// API
export { apiClient, handleApiError } from './api/client';

// User
export { UserService } from './user/userService';

// Recipes
export { RecipeService } from './recipes/recipeService';

// Subscription
export { SubscriptionService } from './subscription/subscriptionService';

// Types
export * from './types';
