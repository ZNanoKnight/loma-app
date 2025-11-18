import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';

type PlanType = 'weekly' | 'monthly' | 'yearly';

export default function PaywallScreen() {
  const navigation = useNavigation<any>();
  const { userData, updateUserData } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [email, setEmail] = useState(userData.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = isValidEmail(email) &&
                     password.length >= 6 &&
                     password === confirmPassword &&
                     agreeToTerms;

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

  const handleComplete = () => {
    if (isFormValid) {
      // Mark onboarding as complete
      // The RootNavigator will automatically re-render and show MainApp
      updateUserData({
        email,
        selectedPlan,
        password,
        hasCompletedOnboarding: true
      });
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

            {/* Plan Selection */}
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

            {/* Account Creation */}
            <View style={styles.accountSection}>
              <Text style={styles.sectionTitle}>Create your account</Text>

              <View style={styles.inputContainer}>
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
              </View>

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
                !isFormValid && styles.completeButtonDisabled
              ]}
              onPress={handleComplete}
              disabled={!isFormValid}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.completeButtonText,
                !isFormValid && styles.completeButtonTextDisabled
              ]}>
                Start Free Trial
              </Text>
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
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Medium',
    color: '#6B46C1',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'VendSans-Bold',
    fontSize: 32,
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'VendSans-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 25,
    lineHeight: 22,
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
    fontFamily: 'VendSans-Bold',
    fontSize: 10,
    color: 'white',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontFamily: 'VendSans-SemiBold',
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
    fontFamily: 'VendSans-Bold',
    fontSize: 24,
    color: '#1F2937',
  },
  planPriceActive: {
    color: '#6B46C1',
  },
  planPeriod: {
    fontFamily: 'VendSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  planPeriodActive: {
    color: '#6B46C1',
  },
  planSavings: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
  },
  planSavingsActive: {
    color: '#10B981',
  },
  planMunchies: {
    fontFamily: 'VendSans-Regular',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  planMunchiesActive: {
    color: '#6B46C1',
  },
  planMunchiesHighlight: {
    fontFamily: 'VendSans-SemiBold',
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
    fontFamily: 'VendSans-Bold',
    color: 'white',
    fontSize: 14,
  },
  accountSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 20,
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'VendSans-Medium',
    color: '#1F2937',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  termsText: {
    fontFamily: 'VendSans-Regular',
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: 'VendSans-SemiBold',
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
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
  completeButtonTextDisabled: {
    color: '#9CA3AF',
  },
  securityNote: {
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Bold',
    fontSize: 22,
    color: '#1F2937',
  },
  tokenSubtitle: {
    fontFamily: 'VendSans-Regular',
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
    fontFamily: 'VendSans-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  tokenText: {
    fontFamily: 'VendSans-Regular',
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    flex: 1,
  },
  tokenHighlight: {
    fontFamily: 'VendSans-Bold',
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
    fontFamily: 'VendSans-Medium',
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
    flex: 1,
  },
});