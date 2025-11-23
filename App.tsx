import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { UserProvider } from './src/context/UserContext';
import { RecipeProvider } from './src/context/RecipeContext';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { ENV } from './src/config/env';
import ErrorBoundary from './src/components/ErrorBoundary';
import { StripeProvider } from '@stripe/stripe-react-native';

// Initialize Sentry for error tracking
if (ENV.SENTRY_DSN) {
  Sentry.init({
    dsn: ENV.SENTRY_DSN,

    // Environment configuration
    environment: ENV.NODE_ENV,
    debug: ENV.IS_DEV,
    enabled: !!ENV.SENTRY_DSN,

    // Send user context with errors
    sendDefaultPii: true,

    // Enable Logs
    enableLogs: true,

    // Performance monitoring
    tracesSampleRate: ENV.IS_DEV ? 1.0 : 0.2, // 100% in dev, 20% in prod
    enableInExpoDevelopment: true,

    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Integrations
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],

    // Breadcrumbs for better error context
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive data from breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.message?.includes('password')) {
        return null; // Don't send breadcrumbs with passwords
      }
      return breadcrumb;
    },

    // Filter out sensitive errors
    beforeSend(event, hint) {
      // Don't send errors in development if you prefer
      // if (ENV.IS_DEV) return null;

      // Filter out sensitive data from error messages
      if (event.message?.includes('password')) {
        event.message = event.message.replace(/password=\S+/gi, 'password=[FILTERED]');
      }

      return event;
    },

    // Enable Spotlight in development for debugging
    spotlight: __DEV__,
  });

  console.log('✅ Sentry initialized successfully');
} else {
  console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
}

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Quicksand-Regular': require('./assets/fonts/Quicksand-Regular.ttf'),
          'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
          'Quicksand-Light': require('./assets/fonts/Quicksand-Light.ttf'),
          'Quicksand-Medium': require('./assets/fonts/Quicksand-Medium.ttf'),
          'Quicksand-SemiBold': require('./assets/fonts/Quicksand-SemiBold.ttf'),
        });
        
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Still continue even if fonts fail
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4F46E5' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StripeProvider
        publishableKey={ENV.STRIPE_PUBLISHABLE_KEY || ''}
        merchantIdentifier="merchant.com.znanoknight.lomaapp"
      >
        <UserProvider>
          <RecipeProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </RecipeProvider>
        </UserProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
});