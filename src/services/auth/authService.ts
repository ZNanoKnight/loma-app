/**
 * Authentication Service
 * Handles user authentication operations with Supabase
 */

import { getSupabaseClient } from './supabase';
import { SecureStorage, LocalStorage } from '../storage';
import { ErrorCode, LomaError, SignUpRequest, SignInRequest, AuthSession } from '../types';

export const AuthService = {
  /**
   * Sign up a new user
   * @param request - Sign up request with email, password, and user data
   */
  async signUp(request: SignUpRequest): Promise<AuthSession> {
    try {
      console.log('[AuthService] signUp called with email:', request.email);
      const supabase = getSupabaseClient();
      console.log('[AuthService] Supabase client obtained');

      // Create user account with Supabase Auth
      console.log('[AuthService] Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email: request.email,
        password: request.password,
        options: {
          data: {
            first_name: request.userData.firstName,
            last_name: request.userData.lastName,
          },
        },
      });

      console.log('[AuthService] Supabase signUp response:', {
        data: !!data,
        error: !!error,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        user: data?.user,
        session: data?.session,
      });

      if (error) {
        console.error('[AuthService] Supabase error:', error);
        // Handle specific Supabase errors
        if (error.message.includes('already registered')) {
          throw new LomaError({
            code: ErrorCode.AUTH_EMAIL_ALREADY_EXISTS,
            message: 'Email already exists',
            userMessage: 'An account with this email already exists.',
            originalError: error,
          });
        }

        if (error.message.includes('Password')) {
          throw new LomaError({
            code: ErrorCode.AUTH_WEAK_PASSWORD,
            message: 'Weak password',
            userMessage: 'Password must be at least 8 characters long.',
            originalError: error,
          });
        }

        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Sign up failed',
          userMessage: 'Failed to create account. Please try again.',
          originalError: error,
        });
      }

      if (!data.user) {
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'No user returned',
          userMessage: 'Failed to create account. Please try again.',
        });
      }

      // If email confirmation is enabled, session will be null
      // In this case, we still return the user info but with empty tokens
      if (!data.session) {
        console.log('[AuthService] No session returned - email confirmation may be required');

        // Return user without session (email confirmation required)
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            emailVerified: !!data.user.email_confirmed_at,
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at || data.user.created_at,
          },
          tokens: {
            accessToken: '',
            refreshToken: '',
            expiresAt: 0,
          },
        };
      }

      // Store tokens securely
      if (data.session.access_token) {
        await SecureStorage.setAccessToken(data.session.access_token);
      }
      if (data.session.refresh_token) {
        await SecureStorage.setRefreshToken(data.session.refresh_token);
      }
      await SecureStorage.setUserId(data.user.id);

      // TODO: Create user profile in database with onboarding data
      // This will be implemented when we create the database schema

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          emailVerified: !!data.user.email_confirmed_at,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at || data.user.created_at,
        },
        tokens: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        },
      };
    } catch (error) {
      if (error instanceof LomaError) {
        throw error;
      }
      throw new LomaError({
        code: ErrorCode.UNKNOWN_ERROR,
        message: 'Sign up failed',
        userMessage: 'An unexpected error occurred. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Sign in an existing user
   * @param request - Sign in request with email and password
   */
  async signIn(request: SignInRequest): Promise<AuthSession> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: request.email,
        password: request.password,
      });

      if (error) {
        // Handle invalid credentials
        if (error.message.includes('Invalid') || error.message.includes('credentials')) {
          throw new LomaError({
            code: ErrorCode.AUTH_INVALID_CREDENTIALS,
            message: 'Invalid credentials',
            userMessage: 'Invalid email or password.',
            originalError: error,
          });
        }

        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Sign in failed',
          userMessage: 'Failed to sign in. Please try again.',
          originalError: error,
        });
      }

      if (!data.user || !data.session) {
        throw new LomaError({
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: 'No user or session returned',
          userMessage: 'Invalid email or password.',
        });
      }

      // Store tokens securely
      await SecureStorage.setAccessToken(data.session.access_token);
      await SecureStorage.setRefreshToken(data.session.refresh_token);
      await SecureStorage.setUserId(data.user.id);

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          emailVerified: !!data.user.email_confirmed_at,
          createdAt: data.user.created_at,
          updatedAt: data.user.updated_at || data.user.created_at,
        },
        tokens: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at || 0,
        },
      };
    } catch (error) {
      if (error instanceof LomaError) {
        throw error;
      }
      throw new LomaError({
        code: ErrorCode.UNKNOWN_ERROR,
        message: 'Sign in failed',
        userMessage: 'An unexpected error occurred. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Supabase sign out error:', error);
        // Continue with local cleanup even if Supabase sign out fails
      }

      // Clear all stored tokens and data
      await SecureStorage.clearAll();
      await LocalStorage.clearAll();
    } catch (error) {
      console.error('Sign out error:', error);
      // Best effort cleanup
      await SecureStorage.clearAll();
      await LocalStorage.clearAll();
    }
  },

  /**
   * Request password reset email
   * @param email - User's email address
   */
  async resetPassword(email: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'lomaapp://reset-password', // Deep link for mobile app
      });

      if (error) {
        throw new LomaError({
          code: ErrorCode.API_ERROR,
          message: 'Password reset failed',
          userMessage: 'Failed to send password reset email. Please try again.',
          originalError: error,
        });
      }
    } catch (error) {
      if (error instanceof LomaError) {
        throw error;
      }
      throw new LomaError({
        code: ErrorCode.UNKNOWN_ERROR,
        message: 'Password reset failed',
        userMessage: 'An unexpected error occurred. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      console.log('[AuthService] getCurrentSession called');
      const supabase = getSupabaseClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      console.log('[AuthService] getSession result:', {
        hasSession: !!session,
        hasError: !!error,
        errorMessage: error?.message,
        userId: session?.user?.id,
      });

      if (error || !session) {
        console.log('[AuthService] No session found or error occurred');
        return null;
      }

      return {
        user: {
          id: session.user.id,
          email: session.user.email!,
          emailVerified: !!session.user.email_confirmed_at,
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at,
        },
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at || 0,
        },
      };
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return !!session;
  },

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      const supabase = getSupabaseClient();

      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession();

      if (error || !session) {
        return null;
      }

      // Update stored tokens
      await SecureStorage.setAccessToken(session.access_token);
      await SecureStorage.setRefreshToken(session.refresh_token);

      return {
        user: {
          id: session.user.id,
          email: session.user.email!,
          emailVerified: !!session.user.email_confirmed_at,
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at,
        },
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at || 0,
        },
      };
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return null;
    }
  },
};
