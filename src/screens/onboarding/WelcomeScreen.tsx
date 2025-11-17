import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Keyboard
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { LogoSvg } from '../../assets/Logo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useUser } from '../../context/UserContext';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { updateUserData } = useUser();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInStep, setSignInStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordInputRef = useRef<TextInput>(null);

  // Setup video player
  const videoSource = require('../../../assets/videos/welcome-background.mp4');
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const handleSignIn = async () => {
    // TODO: Implement actual authentication with database
    // Example implementation when backend is ready:
    /*
    try {
      // Validate input
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }

      // Call authentication API
      const response = await fetch('YOUR_API_ENDPOINT/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors
        alert(data.message || 'Invalid email or password');
        return;
      }

      // Store authentication token
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userId', data.userId);

      // Update user context with authenticated user data
      updateUserData({
        email: data.user.email,
        firstName: data.user.firstName,
        // ... other user data from API
      });

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });

    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during sign in. Please try again.');
    }
    */

    // TEMPORARY: For now, just navigate to main app for testing
    console.log('Sign in with:', email, password);
    Keyboard.dismiss();
    setShowSignInModal(false);

    // Mark onboarding as completed and update user data
    updateUserData({
      email: email.trim().toLowerCase(),
      hasCompletedOnboarding: true,
    });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    if (email.trim() && isValidEmail(email)) {
      setSignInStep('password');
    }
  };

  const handleBackToEmail = () => {
    setSignInStep('email');
    setPassword('');
  };

  const handleModalClose = () => {
    setShowSignInModal(false);
    setSignInStep('email');
    setEmail('');
    setPassword('');
  };

  return (
    <View style={styles.container}>
      {/* Layer 1: Background Video */}
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Layer 2: Dark Purple Gradient Overlay */}
      <LinearGradient
        colors={[
          'rgba(79, 70, 229, 0.75)',
          'rgba(45, 27, 105, 0.80)',
          'rgba(26, 15, 61, 0.85)'
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Layer 3: UI Content */}
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <SvgXml
            xml={LogoSvg}
            width={160}
            height={160}
          />
        </View>
        
        <View style={styles.content}>
          <View style={styles.centerWrapper}>
            <View style={styles.mainContent}>
              <Text style={styles.headline}>
                Loma does the work for you
              </Text>
              <Text style={styles.subheadline}>
                Take control of your goals with your 24/7, personalized AI dietician
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('NameEmail')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
            
            <View style={styles.signInRow}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => setShowSignInModal(true)}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {/* Sign In Modal */}
      <Modal
        visible={showSignInModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleModalClose}
          />
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity activeOpacity={1}>
              <LinearGradient
                colors={['#6B46C1', '#342671']}
                style={styles.modalContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {signInStep === 'email' ? (
                  <>
                    <Text style={styles.modalTitle}>Welcome Back</Text>
                    <Text style={styles.modalSubtitle}>Enter your email to continue</Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleEmailSubmit}
                        autoFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.modalButton, (!email.trim() || !isValidEmail(email)) && styles.modalButtonDisabled]}
                      activeOpacity={0.8}
                      onPress={handleEmailSubmit}
                      disabled={!email.trim() || !isValidEmail(email)}
                    >
                      <Text style={styles.modalButtonText}>Continue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleModalClose}
                    >
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBackToEmail}
                    >
                      <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Enter Password</Text>
                    <Text style={styles.modalSubtitle}>{email}</Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.inputLabel}>Password</Text>
                      <TextInput
                        ref={passwordInputRef}
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        textContentType="password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={handleSignIn}
                        autoFocus
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.forgotPasswordButton}
                      onPress={() => console.log('Forgot password')}
                    >
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalButton, !password && styles.modalButtonDisabled]}
                      activeOpacity={0.8}
                      onPress={handleSignIn}
                      disabled={!password}
                    >
                      <Text style={styles.modalButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={handleModalClose}
                    >
                      <Text style={styles.closeButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0F3D', // Fallback color while video loads
  },
  safeArea: {
    flex: 1,
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  mainContent: {
    alignItems: 'flex-end',
    paddingLeft: 20,
    paddingRight: 10,
  },
  headline: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
    marginBottom: 20,
    lineHeight: 44,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subheadline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'right',
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  signInText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  signInLink: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  modalContent: {
    width: width - 48,
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  forgotPasswordButton: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});