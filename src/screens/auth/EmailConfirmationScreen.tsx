import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../services/auth/supabase';
import { logger } from '../../utils/logger';
import { useUser } from '../../context/UserContext';

export default function EmailConfirmationScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { updateUserData } = useUser();
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const email = route.params?.email || '';

  const handleResendEmail = async () => {
    if (resending) return;

    setResending(true);
    try {
      logger.log('[EmailConfirmationScreen] Resending confirmation email to:', email);

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;

      Alert.alert(
        'Email Sent',
        "We've sent another confirmation email. Please check your inbox.",
        [{ text: 'OK' }]
      );
    } catch (error) {
      logger.error('[EmailConfirmationScreen] Error resending email:', error);
      Alert.alert(
        'Error',
        'Failed to resend confirmation email. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (verifying) return;

    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-digit code.', [{ text: 'OK' }]);
      return;
    }

    setVerifying(true);
    try {
      logger.log('[EmailConfirmationScreen] Verifying OTP code');

      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: 'signup',
      });

      if (error) throw error;

      if (data.user && data.session) {
        logger.log('[EmailConfirmationScreen] Email verified successfully');

        // Supabase automatically stores the session via custom storage
        // Just update UserContext with authentication state
        updateUserData({
          isAuthenticated: true,
          userId: data.user.id,
          email: data.user.email || email,
        });

        logger.log('[EmailConfirmationScreen] UserContext updated with session');

        Alert.alert(
          'Email Verified! 🎉',
          'Your email has been verified. You can now complete your payment.',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to payment collection screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding', params: { screen: 'PaymentCollection' } }],
                });
              },
            },
          ]
        );
      }
    } catch (error: any) {
      logger.error('[EmailConfirmationScreen] Error verifying OTP:', error);
      Alert.alert(
        'Verification Failed',
        error.message || 'Invalid or expired code. Please try again or request a new code.',
        [{ text: 'OK' }]
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Check Your Email</Text>

          {/* Message */}
          <Text style={styles.message}>
            We've sent a 6-digit verification code to{'\n'}
            <Text style={styles.email}>{email}</Text>
          </Text>

          <Text style={styles.instructions}>
            Enter the code below to verify your account and complete your signup.
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpInput}
              placeholder="000000"
              placeholderTextColor="#D1D5DB"
              value={otpCode}
              onChangeText={setOtpCode}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textAlign="center"
            />
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, (!otpCode || otpCode.length !== 6) && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={verifying || !otpCode || otpCode.length !== 6}
          >
            {verifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Code</Text>
            )}
          </TouchableOpacity>

          {/* Resend Button */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResendEmail}
            disabled={resending}
          >
            {resending ? (
              <ActivityIndicator color="#1B4332" />
            ) : (
              <Text style={styles.resendButtonText}>Resend Code</Text>
            )}
          </TouchableOpacity>

          {/* Go to Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleGoToLogin}>
            <Text style={styles.loginButtonText}>Back to Login</Text>
          </TouchableOpacity>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Didn't receive the email? Check your spam folder or try resending.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 28,
    color: '#1B4332',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  email: {
    fontFamily: 'Quicksand-Bold',
    color: '#40916C',
  },
  instructions: {
    fontFamily: 'Quicksand-Light',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  otpContainer: {
    width: '100%',
    marginBottom: 24,
  },
  otpInput: {
    fontFamily: 'Quicksand-Bold',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 20,
    fontSize: 32,
    color: '#111827',
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: '#1B4332',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
  },
  verifyButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  resendButton: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#1B4332',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 52,
    justifyContent: 'center',
  },
  resendButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#1B4332',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
  helpText: {
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
