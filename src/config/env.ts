import Constants from 'expo-constants';

/**
 * Environment configuration
 * Access environment variables via Expo Constants
 */

const extra = Constants.expoConfig?.extra || {};

export const ENV = {
  // Supabase
  SUPABASE_URL: extra.supabaseUrl as string,
  SUPABASE_ANON_KEY: extra.supabaseAnonKey as string,

  // API
  API_TIMEOUT: parseInt(extra.apiTimeout as string, 10) || 30000,

  // OpenAI (Phase 3)
  OPENAI_API_KEY: extra.openaiApiKey as string,

  // Stripe (Phase 2)
  STRIPE_PUBLISHABLE_KEY: extra.stripePublishableKey as string,

  // Sentry
  SENTRY_DSN: extra.sentryDsn as string,

  // Environment
  NODE_ENV: (extra.nodeEnv as string) || 'development',
  IS_DEV: (extra.nodeEnv as string) === 'development',
  IS_PROD: (extra.nodeEnv as string) === 'production',
};

/**
 * Validate that required environment variables are set
 * Call this during app initialization
 */
export const validateEnv = (): void => {
  const requiredVars = {
    SUPABASE_URL: ENV.SUPABASE_URL,
    SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.'
    );
  }
};

/**
 * Check if optional environment variables are set
 */
export const checkOptionalEnv = (): void => {
  if (!ENV.OPENAI_API_KEY) {
    console.log('ℹ️  OPENAI_API_KEY not set (required for Phase 3 - AI Recipe Generation)');
  }

  if (!ENV.STRIPE_PUBLISHABLE_KEY) {
    console.log('ℹ️  STRIPE_PUBLISHABLE_KEY not set (required for Phase 2 - Payments)');
  }

  if (!ENV.SENTRY_DSN) {
    console.log('ℹ️  SENTRY_DSN not set (error tracking disabled)');
  }
};
