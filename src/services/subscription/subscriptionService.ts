/**
 * Subscription Service
 * Handles subscription and token management
 */

import { getSupabaseClient } from '../auth/supabase';
import { ErrorCode, LomaError } from '../types';

export interface Subscription {
  user_id: string;
  plan: 'weekly' | 'monthly' | 'yearly';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  tokens_balance: number;
  tokens_used: number;
  tokens_total: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenValidation {
  hasTokens: boolean;
  balance: number;
  status: string;
  currentPeriodEnd?: string;
  message: string;
}

export interface TokenDeductionResult {
  success: boolean;
  balance: number;
  used: number;
  deducted: number;
}

export const SubscriptionService = {
  /**
   * Get user's current subscription status
   * @param userId - User ID
   */
  async getSubscription(userId: string): Promise<Subscription | null> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data as Subscription;
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.SUBSCRIPTION_ERROR,
        message: 'Failed to get subscription',
        userMessage: 'Failed to load subscription info. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Get user's token balance
   * @param userId - User ID
   */
  async getTokenBalance(userId: string): Promise<number> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('subscriptions')
        .select('tokens_balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data?.tokens_balance || 0;
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to get token balance',
        userMessage: 'Failed to load token balance. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Validate if user can use tokens (server-side validation)
   * @param userId - User ID
   */
  async validateTokenUsage(userId: string): Promise<TokenValidation> {
    try {
      const supabase = getSupabaseClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke(
        'validate-token-usage',
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        throw error;
      }

      return data as TokenValidation;
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to validate token usage',
        userMessage: 'Failed to check token availability. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Deduct tokens (called when generating a recipe)
   * Uses server-side Edge Function for security
   * @param userId - User ID
   * @param amount - Number of tokens to deduct
   */
  async deductTokens(userId: string, amount: number = 1): Promise<TokenDeductionResult> {
    try {
      const supabase = getSupabaseClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke(
        'deduct-token',
        {
          body: { amount },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error || !data) {
        throw error || new Error('Failed to deduct tokens');
      }

      if (!data.success) {
        throw new Error(data.error || 'Token deduction failed');
      }

      return data as TokenDeductionResult;
    } catch (error: any) {
      // Check for specific error cases
      if (error.message?.includes('Insufficient tokens')) {
        throw new LomaError({
          code: ErrorCode.INSUFFICIENT_TOKENS,
          message: 'Insufficient tokens',
          userMessage: "You don't have enough Munchies to generate a recipe. Your subscription will renew soon, or you can upgrade your plan.",
          originalError: error,
        });
      }

      if (error.message?.includes('not active')) {
        throw new LomaError({
          code: ErrorCode.SUBSCRIPTION_ERROR,
          message: 'Subscription not active',
          userMessage: 'Your subscription is not active. Please update your payment method or subscribe again.',
          originalError: error,
        });
      }

      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to deduct tokens',
        userMessage: 'Failed to deduct Munchies. Please try again.',
        originalError: error,
      });
    }
  },

  /**
   * Add tokens to user balance (typically called by webhooks after payment)
   * @param userId - User ID
   * @param amount - Number of tokens to add
   */
  async addTokens(userId: string, amount: number): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('subscriptions')
        .select('tokens_balance, tokens_total')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          tokens_balance: (data.tokens_balance || 0) + amount,
          tokens_total: (data.tokens_total || 0) + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.API_ERROR,
        message: 'Failed to add tokens',
        userMessage: 'Failed to add tokens. Please contact support.',
        originalError: error,
      });
    }
  },

  /**
   * Update subscription status
   * @param userId - User ID
   * @param status - New subscription status
   */
  async updateSubscriptionStatus(
    userId: string,
    status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.SUBSCRIPTION_ERROR,
        message: 'Failed to update subscription status',
        userMessage: 'Failed to update subscription. Please contact support.',
        originalError: error,
      });
    }
  },

  /**
   * Cancel subscription (marks for cancellation at period end)
   * @param userId - User ID
   */
  async cancelSubscription(userId: string): Promise<void> {
    try {
      const supabase = getSupabaseClient();

      // Get current subscription to get Stripe subscription ID
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id, stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (fetchError || !subscription) {
        throw fetchError || new Error('Subscription not found');
      }

      if (!subscription.stripe_subscription_id) {
        throw new Error('No Stripe subscription found');
      }

      // Note: Actual cancellation should be done via Stripe API or Customer Portal
      // For now, we'll just update the status in the database
      // The webhook will handle the actual cancellation status update

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        throw updateError;
      }
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.SUBSCRIPTION_ERROR,
        message: 'Failed to cancel subscription',
        userMessage: 'Failed to cancel subscription. Please contact support.',
        originalError: error,
      });
    }
  },

  /**
   * Check if user can generate a recipe (has active subscription and tokens)
   * @param userId - User ID
   */
  async canGenerateRecipe(userId: string): Promise<boolean> {
    try {
      const validation = await this.validateTokenUsage(userId);
      return validation.hasTokens;
    } catch (error) {
      console.error('Error checking if user can generate recipe:', error);
      return false;
    }
  },

  /**
   * Get Stripe Customer Portal URL
   * @param userId - User ID
   * @param returnUrl - URL to return to after managing subscription
   */
  async getCustomerPortalUrl(userId: string, returnUrl: string = 'lomaapp://settings'): Promise<string> {
    try {
      const supabase = getSupabaseClient();

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke(
        'create-portal-session',
        {
          body: { returnUrl },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error || !data?.url) {
        throw error || new Error('Failed to create portal session');
      }

      return data.url;
    } catch (error) {
      throw new LomaError({
        code: ErrorCode.SUBSCRIPTION_ERROR,
        message: 'Failed to get customer portal URL',
        userMessage: 'Failed to open subscription management. Please try again.',
        originalError: error,
      });
    }
  },
};
