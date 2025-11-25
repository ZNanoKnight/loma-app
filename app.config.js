// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  expo: {
    name: 'loma-app',
    slug: 'loma-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    scheme: 'lomaapp',
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.znanoknight.lomaapp',
      associatedDomains: ['applinks:yourdomain.com', 'applinks:www.yourdomain.com'],
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'lomaapp',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'yourdomain.com',
              pathPrefix: '/auth',
            },
            {
              scheme: 'https',
              host: 'www.yourdomain.com',
              pathPrefix: '/auth',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-font', 'expo-video'],
    extra: {
      eas: {
        projectId: '8f1b3b83-f096-4970-b1d3-028162cb968c',
      },
      // Environment variables exposed to the app
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      apiTimeout: process.env.API_TIMEOUT || '30000',
      openaiApiKey: process.env.OPENAI_API_KEY,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      stripePriceIdWeekly: process.env.STRIPE_PRICE_ID_WEEKLY,
      stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY,
      stripePriceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY,
      sentryDsn: process.env.SENTRY_DSN,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
  },
};
