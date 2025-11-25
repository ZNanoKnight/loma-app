import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { AuthService } from '../../services/auth/authService';
import { SubscriptionService } from '../../services/subscription/subscriptionService';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../../services/auth/supabase';
import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';

type PlanType = 'weekly' | 'monthly' | 'yearly';

export default function PaymentCollectionScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(
    (userData.selectedPlan as PlanType) || 'yearly'
  );

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '$3.99',
      period: 'per week',
      savings: null,
      trial: '3 days free',
      munchies: '5 Munchies per week'
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$7.99',
      period: 'per month',
      savings: 'Save 50%',
      trial: '7 days free',
      popular: true,
      munchies: '20 Munchies per month'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$48.99',
      period: 'per year',
      savings: 'Save 70%',
      trial: '14 days free',
      munchies: '240 Munchies per year'
    }
  ];

  // Helper to get price ID based on selected plan
  const getPriceId = (plan: PlanType): string => {
    switch (plan) {
      case 'weekly':
        return ENV.STRIPE_PRICE_ID_WEEKLY;
      case 'monthly':
        return ENV.STRIPE_PRICE_ID_MONTHLY;
      case 'yearly':
        return ENV.STRIPE_PRICE_ID_YEARLY;
      default:
        return ENV.STRIPE_PRICE_ID_MONTHLY;
    }
  };

  const handleCompletePayment = async () => {
    setLoading(true);
    try {
      logger.log('[PaymentCollectionScreen] Starting payment process...');
      logger.log('[PaymentCollectionScreen] UserContext state:', {
        isAuthenticated: userData.isAuthenticated,
        userId: userData.userId,
        email: userData.email,
      });

      // Step 1: Ensure user is authenticated
      logger.log('[PaymentCollectionScreen] Calling AuthService.getCurrentSession()...');
      const session = await AuthService.getCurrentSession();
      logger.log('[PaymentCollectionScreen] Session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasTokens: !!session?.tokens,
        accessToken: session?.tokens?.accessToken ? 'present' : 'missing',
      });

      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      // Step 2: Call Edge Function to create payment intent
      logger.log('[PaymentCollectionScreen] Creating payment intent...');
      const priceId = getPriceId(selectedPlan);
      logger.log('[PaymentCollectionScreen] Request body:', {
        planType: selectedPlan,
        priceId: priceId,
      });

      // Get current Supabase session to ensure auth header is set
      const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession();

      logger.log('[PaymentCollectionScreen] Supabase session check:', {
        hasSupabaseSession: !!supabaseSession,
        sessionError: sessionError,
        accessTokenPrefix: supabaseSession?.access_token?.substring(0, 20),
        accessTokenLength: supabaseSession?.access_token?.length,
      });

      if (!supabaseSession) {
        throw new Error('Supabase session not found. Please log in again.');
      }

      // Call Edge Function using direct fetch (supabase.functions.invoke doesn't send headers correctly)
      logger.log('[PaymentCollectionScreen] Calling edge function with direct fetch...');

      const edgeFunctionUrl = `${ENV.SUPABASE_URL}/functions/v1/create-payment-intent`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseSession.access_token}`,
          'Content-Type': 'application/json',
          'apikey': ENV.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          planType: selectedPlan,
          priceId: priceId,
        }),
      });

      logger.log('[PaymentCollectionScreen] Edge function response status:', response.status);

      const responseData = await response.json();

      logger.log('[PaymentCollectionScreen] Edge function response data:', responseData);

      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to create payment intent';
        logger.error('[PaymentCollectionScreen] Edge function error:', errorMessage);
        throw new Error(errorMessage);
      }

      const paymentData = responseData;

      // Validate clientSecret is present
      if (!paymentData.clientSecret) {
        throw new Error('Payment intent created but no client secret returned');
      }

      // Step 3: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'LOMA',
        paymentIntentClientSecret: paymentData.clientSecret,
        defaultBillingDetails: {
          email: userData.email,
        },
        returnURL: 'lomaapp://payment-complete',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Step 4: Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          Alert.alert(
            'Payment Cancelled',
            'You cancelled the payment. You can try again when ready.',
            [{ text: 'OK' }]
          );
          return;
        }
        throw new Error(presentError.message);
      }

      // Step 5: Payment successful! Update UserContext
      updateUserData({
        selectedPlan,
        hasCompletedOnboarding: true,
        isAuthenticated: true,
      });

      // Step 6: Wait for webhook to allocate tokens, then fetch balance
      logger.log('[PaymentCollectionScreen] Waiting for token allocation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const tokenBalance = await SubscriptionService.getTokenBalance(session.user.id);
        logger.log('[PaymentCollectionScreen] Token balance after payment:', tokenBalance);
      } catch (error) {
        logger.error('[PaymentCollectionScreen] Error fetching token balance:', error);
        // Non-fatal - user can refresh on home screen
      }

      Alert.alert(
        'Welcome to LOMA! 🎉',
        'Your subscription is now active. Let\'s start creating amazing recipes!',
        [
          {
            text: 'Get Started',
            onPress: () => {
              // Navigation will automatically switch to MainTab due to isAuthenticated
            },
          },
        ]
      );
    } catch (error) {
      logger.error('[PaymentCollectionScreen] Payment error:', error);

      let errorMessage = 'Failed to process payment. Please try again.';

      if (error instanceof Error) {
        if (error.message.includes('payment')) {
          errorMessage = 'Payment failed. ' + error.message;
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage, [
        {
          text: 'Try Again',
          style: 'default',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Content */}
          <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>

            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Great! Your email has been confirmed. Now let's complete your subscription to start using LOMA.
            </Text>

            {/* Munchies System Reminder */}
            <View style={styles.tokenSection}>
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenEmoji}>🍪</Text>
                <Text style={styles.tokenTitle}>Your Munchies Await</Text>
              </View>

              <Text style={styles.tokenSubtitle}>
                Once you complete payment, you'll receive your Munchies to start generating personalized recipes!
              </Text>
            </View>

            {/* Plan Selection */}
            <Text style={styles.sectionTitle}>Choose your plan</Text>
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardActive
                  ]}
                  onPress={() => setSelectedPlan(plan.id as PlanType)}
                  activeOpacity={0.8}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <View style={styles.planContent}>
                    <Text style={[
                      styles.planName,
                      selectedPlan === plan.id && styles.planNameActive
                    ]}>
                      {plan.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={[
                        styles.planPrice,
                        selectedPlan === plan.id && styles.planPriceActive
                      ]}>
                        {plan.price}
                      </Text>
                      <Text style={[
                        styles.planPeriod,
                        selectedPlan === plan.id && styles.planPeriodActive
                      ]}>
                        {plan.period}
                      </Text>
                    </View>
                    {plan.savings && (
                      <Text style={[
                        styles.planSavings,
                        selectedPlan === plan.id && styles.planSavingsActive
                      ]}>
                        {plan.savings}
                      </Text>
                    )}
                    <Text style={[
                      styles.planMunchies,
                      selectedPlan === plan.id && styles.planMunchiesActive
                    ]}>
                      {plan.munchies.split(' ').map((word, index) =>
                        word === 'Munchies' ? (
                          <Text key={index} style={styles.planMunchiesHighlight}>{word} </Text>
                        ) : (
                          word + ' '
                        )
                      )}
                    </Text>
                  </View>
                  {selectedPlan === plan.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Features Reminder */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔄</Text>
                <Text style={styles.featureText}>Cancel anytime</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🔒</Text>
                <Text style={styles.featureText}>Secure payment</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⏰</Text>
                <Text style={styles.featureText}>Free trial included</Text>
              </View>
            </View>

            {/* Complete Payment Button */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                loading && styles.completeButtonDisabled
              ]}
              onPress={handleCompletePayment}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.completeButtonText}>
                  Complete Payment & Start Free Trial
                </Text>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <Text style={styles.securityNote}>
              🔒 Secured by Stripe. We never store your payment details.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  content: {
    flex: 1,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    fontSize: 80,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 32,
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
    lineHeight: 22,
    textAlign: 'center',
  },
  tokenSection: {
    marginBottom: 30,
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tokenEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  tokenTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#6B46C1',
  },
  tokenSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#8B5CF6',
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 16,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  planCardActive: {
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 10,
    color: 'white',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  planNameActive: {
    color: '#6B46C1',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 24,
    color: '#1F2937',
  },
  planPriceActive: {
    color: '#6B46C1',
  },
  planPeriod: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  planPeriodActive: {
    color: '#6B46C1',
  },
  planSavings: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  planSavingsActive: {
    color: '#10B981',
  },
  planMunchies: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  planMunchiesActive: {
    color: '#6B46C1',
  },
  planMunchiesHighlight: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontFamily: 'Quicksand-Bold',
    color: 'white',
    fontSize: 14,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  completeButton: {
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
  },
  completeButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  completeButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  securityNote: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
});
