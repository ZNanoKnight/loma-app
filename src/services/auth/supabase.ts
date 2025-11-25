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
          console.log('[Supabase Storage] getItem called with key:', key);
          // Supabase uses keys like 'sb-{project-ref}-auth-token'
          if (key.includes('auth-token')) {
            const session = await SecureStorage.getItem(key);
            console.log('[Supabase Storage] Retrieved session:', session ? 'present' : 'null');
            return session;
          }
          return null;
        },
        setItem: async (key: string, value: string) => {
          console.log('[Supabase Storage] setItem called with key:', key);
          console.log('[Supabase Storage] Value length:', value?.length || 0);
          // Store the full session object
          if (key.includes('auth-token')) {
            await SecureStorage.setItem(key, value);
            console.log('[Supabase Storage] Session stored successfully');
          }
        },
        removeItem: async (key: string) => {
          console.log('[Supabase Storage] removeItem called with key:', key);
          if (key.includes('auth-token')) {
            await SecureStorage.removeItem(key);
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
