/**
 * Supabase Client
 * Initialized Supabase client for authentication and database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from '../../config/env';
import { SecureStorage } from '../storage';

/**
 * Create and configure Supabase client
 */
const createSupabaseClient = (): SupabaseClient | null => {
  // Check if environment variables are set
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    console.warn('⚠️  Supabase credentials not configured. Auth and database features will not work.');
    return null;
  }

  const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
    auth: {
      // Use secure storage for session persistence
      storage: {
        getItem: async (key: string) => {
          if (key === 'supabase.auth.token') {
            return await SecureStorage.getAccessToken();
          }
          return null;
        },
        setItem: async (key: string, value: string) => {
          if (key === 'supabase.auth.token') {
            await SecureStorage.setAccessToken(value);
          }
        },
        removeItem: async (key: string) => {
          if (key === 'supabase.auth.token') {
            await SecureStorage.clearAll();
          }
        },
      },
      // Auto refresh token
      autoRefreshToken: true,
      // Persist session
      persistSession: true,
      // Detect session in URL (for email verification, password reset)
      detectSessionInUrl: false,
    },
  });

  return supabase;
};

/**
 * Supabase client instance
 * This will be null if credentials are not configured
 */
export const supabase = createSupabaseClient();

/**
 * Helper to check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

/**
 * Helper to get Supabase client (throws if not configured)
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Please add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.'
    );
  }
  return supabase;
};
