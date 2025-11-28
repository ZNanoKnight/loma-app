import React, { useState } from 'react';
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
import { SubscriptionService } from '../../services/subscription/subscriptionService';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../../services/auth/supabase';
import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';

type PlanType = 'weekly' | 'monthly' | 'yearly';

export default function AddSubscriptionScreen() {
  const navigation = useNavigation<any>();
  const { updateUserData } = useUser();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '$3.99',
      period: 'per week',
      costPerRecipe: '~$0.80 per recipe',
      munchies: '5 Munchies per week'
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$7.99',
      period: 'per month',
      costPerRecipe: '~$0.40 per recipe',
      popular: true,
      munchies: '20 Munchies per month'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$48.99',
      period: 'per year',
      costPerRecipe: '~$0.20 per recipe',
      munchies: '240 Munchies per year'
    }
  ];

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

  const handleStartSubscription = async () => {
    setLoading(true);
    try {
      logger.log('[AddSubscriptionScreen] Starting subscription process...');

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      const priceId = getPriceId(selectedPlan);

      logger.log('[AddSubscriptionScreen] Creating payment intent...');
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        'create-payment-intent',
        {
          body: {
            planType: selectedPlan,
            priceId: priceId,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (paymentError || !paymentData) {
        throw new Error(paymentError?.message || 'Failed to create payment intent');
      }

      if (!paymentData.clientSecret) {
        throw new Error('Payment intent created but no client secret returned');
      }

      // Determine if this is a SetupIntent (for trials) or PaymentIntent (immediate charge)
      // SetupIntent secrets start with 'seti_', PaymentIntent secrets start with 'pi_'
      const isSetupIntent = paymentData.clientSecret.startsWith('seti_');
      logger.log('[AddSubscriptionScreen] Initializing payment sheet...', isSetupIntent ? 'SetupIntent' : 'PaymentIntent');

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'LOMA',
        ...(isSetupIntent
          ? { setupIntentClientSecret: paymentData.clientSecret }
          : { paymentIntentClientSecret: paymentData.clientSecret }
        ),
        defaultBillingDetails: {
          email: session.user.email,
        },
        returnURL: 'lomaapp://payment-complete',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      logger.log('[AddSubscriptionScreen] Presenting payment sheet...');
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

      // Payment successful!
      updateUserData({
        selectedPlan,
        hasCompletedOnboarding: true,
      });

      // Wait for webhook to allocate tokens
      logger.log('[AddSubscriptionScreen] Waiting for token allocation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const tokenBalance = await SubscriptionService.getTokenBalance(session.user.id);
        logger.log('[AddSubscriptionScreen] Token balance after payment:', tokenBalance);
      } catch (tokenError) {
        logger.error('[AddSubscriptionScreen] Error fetching token balance:', tokenError);
      }

      Alert.alert(
        'Subscription Started! 🎉',
        'Your subscription is now active. You can now generate personalized recipes!',
        [
          {
            text: 'Great!',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      logger.error('[AddSubscriptionScreen] Error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to start subscription. Please try again.',
        [{ text: 'OK' }]
      );
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Start Subscription</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Title */}
          <View style={styles.content}>
            <Text style={styles.title}>Choose your plan</Text>
            <Text style={styles.subtitle}>
              Start your 7-day free trial and get access to personalized recipes
            </Text>

            {/* Plan Selection */}
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected
                  ]}
                  onPress={() => setSelectedPlan(plan.id as PlanType)}
                  activeOpacity={0.7}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <View style={[
                    styles.planRadio,
                    selectedPlan === plan.id && styles.planRadioSelected
                  ]}>
                    {selectedPlan === plan.id && (
                      <View style={styles.planRadioInner} />
                    )}
                  </View>
                  <View style={styles.planContent}>
                    <Text style={[
                      styles.planName,
                      selectedPlan === plan.id && styles.planNameSelected
                    ]}>
                      {plan.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={[
                        styles.planPrice,
                        selectedPlan === plan.id && styles.planPriceSelected
                      ]}>
                        {plan.price}
                      </Text>
                      <Text style={styles.planPeriod}>
                        {plan.period}
                      </Text>
                    </View>
                    <Text style={styles.planCostPerRecipe}>
                      {plan.costPerRecipe}
                    </Text>
                    <Text style={styles.planMunchies}>
                      {plan.munchies.split(' ').map((word, index) =>
                        word === 'Munchies' ? (
                          <Text key={index} style={styles.planMunchiesHighlight}>{word} </Text>
                        ) : (
                          word + ' '
                        )
                      )}
                    </Text>
                  </View>
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
                <Text style={styles.featureText}>7-day free trial</Text>
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              style={[
                styles.startButton,
                loading && styles.startButtonDisabled
              ]}
              onPress={handleStartSubscription}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.startButtonText}>
                  Start Free Trial
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#1F2937',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    color: '#1B4332',
    fontFamily: 'Quicksand-Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  plansContainer: {
    marginBottom: 24,
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
  planCardSelected: {
    borderColor: '#1B4332',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
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
  planRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioSelected: {
    borderColor: '#1B4332',
  },
  planRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1B4332',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 4,
  },
  planNameSelected: {
    color: '#1B4332',
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
  planPriceSelected: {
    color: '#1B4332',
  },
  planPeriod: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  planCostPerRecipe: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  planMunchies: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  planMunchiesHighlight: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  featureText: {
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#6B7280',
  },
  startButton: {
    backgroundColor: '#10B981',
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
  startButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  securityNote: {
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
});
