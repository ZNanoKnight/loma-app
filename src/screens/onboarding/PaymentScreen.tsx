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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type PlanType = 'weekly' | 'monthly' | 'yearly';

export default function PaywallScreen() {
  const navigation = useNavigation<any>();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const isFormValid = password.length >= 6 && 
                     password === confirmPassword && 
                     agreeToTerms;

  const plans = [
    {
      id: 'weekly',
      name: 'Weekly',
      price: '$4.99',
      period: 'per week',
      savings: null,
      trial: '3 days free'
    },
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$9.99',
      period: 'per month',
      savings: 'Save 50%',
      trial: '7 days free'
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$59.99',
      period: 'per year',
      savings: 'Save 70%',
      trial: '14 days free',
      popular: true
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

  const handleSubscribe = () => {
    if (isFormValid) {
      console.log('Subscribe to:', selectedPlan);
      navigation.navigate('MainApp');
    }
  };

  const handleComplete = () => {  // ADD THIS FUNCTION
    if (isFormValid) {
      console.log('Complete subscription:', selectedPlan);
      navigation.navigate('MainApp');
    }
  };

  const handleRestore = () => {
    console.log('Restore purchases');
  };

  const handleSkip = () => {
    navigation.navigate('MainApp');
  };

  return (
    <LinearGradient
      colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
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
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 25,
    lineHeight: 22,
  },
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  planCardActive: {
    backgroundColor: 'white',
    borderColor: 'white',
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
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  planContent: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  planNameActive: {
    color: '#4F46E5',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  planPriceActive: {
    color: '#4F46E5',
  },
  planPeriod: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  planPeriodActive: {
    color: 'rgba(79, 70, 229, 0.7)',
  },
  planSavings: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600',
  },
  planSavingsActive: {
    color: '#10B981',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accountSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  checkboxMark: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  termsLink: {
    color: 'white',
    fontWeight: '600',
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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  completeButton: {
    backgroundColor: 'white',
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  completeButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  completeButtonTextDisabled: {
    color: 'rgba(79, 70, 229, 0.5)',
  },
  securityNote: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 30,
  },
});