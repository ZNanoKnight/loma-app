import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { AuthService } from '../../services/auth/authService';
import { UserService } from '../../services/user/userService';
import { SubscriptionService } from '../../services/subscription/subscriptionService';
import { LomaError, ErrorCode } from '../../services/types';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../../services/auth/supabase';
import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';

type PlanType = 'weekly' | 'monthly' | 'yearly';

export default function PaywallScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  // Default to monthly plan (most popular) - cards are now informational only
  const selectedPlan: PlanType = 'monthly';
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = isValidEmail(email) &&
                     password.length >= 8 &&
                     password === confirmPassword &&
                     agreeToTerms;

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

  const features = [
    {
      emoji: '🤖',
      title: 'AI Recipe Generation',
      description: 'Unlimited personalized recipes'
    },
    {
      emoji: '📊',
      title: 'Progress Tracking',
      description: 'Detailed analytics & insights'
    },
    {
      emoji: '🛒',
      title: 'Smart Shopping Lists',
      description: 'Automated grocery planning'
    },
    {
      emoji: '👨‍🍳',
      title: 'Step-by-Step Guidance',
      description: 'Cooking mode with timers'
    },
    {
      emoji: '💪',
      title: 'Macro Tracking',
      description: 'Hit your nutrition goals'
    },
    {
      emoji: '📱',
      title: 'Meal Planning',
      description: 'Weekly meal schedules'
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

  const handleComplete = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      // Debug: Log environment and user data
      logger.log('[PaymentScreen] Starting signup process...');
      logger.log('[PaymentScreen] Email:', email);
      logger.log('[PaymentScreen] User data available:', {
        hasFirstName: !!userData.firstName,
        hasLastName: !!userData.lastName,
        hasAge: !!userData.age,
        hasGender: !!userData.gender,
      });

      // Step 1: Create Supabase auth account
      // Note: We don't pre-check if email exists - we let the signup fail naturally
      // and catch the "already registered" error. This avoids sending unnecessary emails.
      logger.log('[PaymentScreen] Creating Supabase auth account...');
      const authSession = await AuthService.signUp({
        email: email.trim().toLowerCase(),
        password,
        userData: {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          age: userData.age?.toString() || '',
          weight: userData.weight?.toString() || '',
          heightFeet: userData.heightFeet?.toString() || '',
          heightInches: userData.heightInches?.toString() || '',
          gender: userData.gender || '',
          activityLevel: userData.activityLevel || '',
          goals: userData.goals || [],
          dietaryPreferences: userData.dietaryPreferences || [],
          allergens: userData.allergens || [],
          equipment: userData.equipment || '',
          cookingFrequency: userData.cookingFrequency || '',
        },
      });

      logger.log('[PaymentScreen] Auth session created:', {
        userId: authSession.user.id,
        email: authSession.user.email,
        hasToken: !!authSession.tokens.accessToken,
      });

      // Save selected plan to UserContext BEFORE email confirmation
      // This ensures we remember the plan when user returns after verifying email
      updateUserData({
        selectedPlan,
        email: email.trim().toLowerCase(),
      });

      // Check if email confirmation is required (no session/token returned)
      const requiresEmailConfirmation = !authSession.tokens.accessToken;

      // Small delay to ensure auth.users record is committed in database
      // This prevents race condition where profile function checks before user exists
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Create user profile in database with onboarding data
      logger.log('[PaymentScreen] Creating user profile...');
      await UserService.createUserProfile(authSession.user.id, {
        user_id: authSession.user.id,
        first_name: userData.firstName || '',
        last_name: userData.lastName || '',
        age: userData.age,
        weight: userData.weight,
        height_feet: userData.heightFeet,
        height_inches: userData.heightInches,
        gender: userData.gender,
        activity_level: userData.activityLevel,
        goals: userData.goals,
        dietary_preferences: userData.dietaryPreferences,
        allergens: userData.allergens,
        equipment: userData.equipment,
        cooking_frequency: userData.cookingFrequency,
        default_serving_size: userData.defaultServingSize || 1,
        metric_units: false,
        has_completed_onboarding: false, // Will be set to true after payment/confirmation
      });
      logger.log('[PaymentScreen] User profile created successfully');

      // If email confirmation is required, navigate to confirmation screen
      if (requiresEmailConfirmation) {
        logger.log('[PaymentScreen] Email confirmation required - navigating to confirmation screen');

        // Navigate to email confirmation screen instead of showing alert
        navigation.navigate('EmailConfirmation', { email: email.trim().toLowerCase() });
        return;
      }

      // Step 3: Call Edge Function to create payment intent
      logger.log('[PaymentScreen] Creating payment intent...');
      const priceId = getPriceId(selectedPlan);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session');
      }

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

      // Validate clientSecret is present
      if (!paymentData.clientSecret) {
        throw new Error('Payment intent created but no client secret returned');
      }

      // Step 4: Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'LOMA',
        paymentIntentClientSecret: paymentData.clientSecret,
        defaultBillingDetails: {
          email: email.trim().toLowerCase(),
        },
        returnURL: 'lomaapp://payment-complete',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Step 5: Present payment sheet
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

      // Step 6: Payment successful! Update UserContext
      updateUserData({
        email: authSession.user.email || email,
        selectedPlan,
        hasCompletedOnboarding: true,
        isAuthenticated: true,
      });

      // Step 7: Wait for webhook to allocate tokens, then fetch balance
      // Webhook typically processes within 2-3 seconds
      logger.log('[PaymentScreen] Waiting for token allocation...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const tokenBalance = await SubscriptionService.getTokenBalance(authSession.user.id);
        logger.log('[PaymentScreen] Token balance after payment:', tokenBalance);
      } catch (error) {
        logger.error('[PaymentScreen] Error fetching token balance:', error);
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

      // Note: Tokens will be allocated via webhook when Stripe confirms the subscription
    } catch (error) {
      let errorMessage = 'Failed to complete signup. Please try again.';
      let isEmailExists = false;

      // Check for email already exists error first
      if (error instanceof LomaError) {
        isEmailExists = error.code === ErrorCode.AUTH_EMAIL_ALREADY_EXISTS;
        errorMessage = error.userMessage || errorMessage;
      } else if (error instanceof Error) {
        if (error.message.includes('already registered') ||
            error.message.includes('User already registered')) {
          isEmailExists = true;
          errorMessage = 'This email is already registered.';
        }
      }

      // Only log errors that are NOT expected (email exists is expected/handled gracefully)
      if (!isEmailExists) {
        logger.error('Signup/Payment error:', error);
        if (error instanceof LomaError) {
          logger.error('LomaError details:', {
            code: error.code,
            message: error.message,
            userMessage: error.userMessage,
            originalError: error.originalError,
          });
        }
      } else {
        logger.log('[PaymentScreen] Email already exists - showing login prompt');
      }

      // Handle remaining error types
      if (!isEmailExists && error instanceof Error) {
        if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 8 characters long.';
        } else if (error.message.includes('payment')) {
          errorMessage = 'Payment failed. ' + error.message;
        } else {
          errorMessage = error.message;
        }
      }

      // Special handling for existing email - offer to navigate to login
      if (isEmailExists) {
        const userEmail = email.trim().toLowerCase();
        Alert.alert(
          'Account Already Exists',
          `An account with ${userEmail} already exists. Would you like to sign in instead?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Sign In',
              style: 'default',
              onPress: () => {
                logger.log('[PaymentScreen] Navigating to Login with email:', userEmail);
                // Use reset to ensure clean navigation to Login screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login', params: { email: userEmail } }],
                });
              },
            },
          ]
        );
        return; // Exit early - don't show additional error alerts
      } else {
        Alert.alert('Error', errorMessage, [
          {
            text: 'Try Again',
            style: 'default',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>Step 10 of 10</Text>
          </View>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>Start your journey</Text>
            <Text style={styles.subtitle}>
              Choose your plan and create your account
            </Text>

            {/* Munchies System Explanation */}
            <View style={styles.tokenSection}>
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenEmoji}>🍪</Text>
                <Text style={styles.tokenTitle}>How Munchies Work</Text>
              </View>

              <Text style={styles.tokenSubtitle}>
                Munchies are the currency you use on Loma to generate personalized recipes
              </Text>

              <View style={styles.tokenCard}>
                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>1</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    Each <Text style={styles.tokenHighlight}>munchie</Text> allows you to generate one personalized recipe
                  </Text>
                </View>

                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>2</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    Munchies are added to your account based on your plan
                  </Text>
                </View>

                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>3</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    All generated recipes are saved to your Recipe Book permanently
                  </Text>
                </View>
              </View>

              <View style={styles.tokenBenefitBox}>
                <Text style={styles.tokenBenefitIcon}>✨</Text>
                <Text style={styles.tokenBenefitText}>
                  Higher tier plans include more munchies and additional premium features
                </Text>
              </View>
            </View>

            {/* Subscription Tiers */}
            <View style={styles.plansContainer}>
              <Text style={styles.plansSectionTitle}>Subscription tiers</Text>
              {plans.map((plan) => (
                <View
                  key={plan.id}
                  style={styles.planCard}
                >
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  <View style={styles.planContent}>
                    <Text style={styles.planName}>
                      {plan.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.planPrice}>
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
                </View>
              ))}
            </View>

            {/* Account Creation */}
            <View style={styles.accountSection}>
              <Text style={styles.sectionTitle}>Create your account</Text>

              {/* <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View> */}

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  passwordRules="minlength: 8;"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                />
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity 
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.checkbox,
                  agreeToTerms && styles.checkboxActive
                ]}>
                  {agreeToTerms && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
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

            {/* Complete Button */}
            <TouchableOpacity
              style={[
                styles.completeButton,
                (!isFormValid || loading) && styles.completeButtonDisabled
              ]}
              onPress={handleComplete}
              disabled={!isFormValid || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[
                  styles.completeButtonText,
                  !isFormValid && styles.completeButtonTextDisabled
                ]}>
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
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backButtonText: {
    fontFamily: 'Quicksand-Medium',
    color: '#6B46C1',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 32,
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 25,
    lineHeight: 22,
  },
  plansContainer: {
    marginBottom: 30,
  },
  plansSectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 24,
    color: '#1F2937',
  },
  planPeriod: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  planCostPerRecipe: {
    fontFamily: 'Quicksand-SemiBold',
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
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',
  },
  accountSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Quicksand-Medium',
    color: '#1F2937',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Quicksand-Regular',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  checkboxMark: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  termsText: {
    fontFamily: 'Quicksand-Regular',
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',
    textDecorationLine: 'underline',
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
  completeButtonTextDisabled: {
    color: '#9CA3AF',
  },
  securityNote: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  tokenSection: {
    marginBottom: 30,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  tokenTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 22,
    color: '#1F2937',
  },
  tokenSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  tokenCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tokenBulletText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  tokenText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    flex: 1,
  },
  tokenHighlight: {
    fontFamily: 'Quicksand-Bold',
    color: '#6B46C1',
  },
  tokenBenefitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  tokenBenefitIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tokenBenefitText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    flex: 1,
  },
});