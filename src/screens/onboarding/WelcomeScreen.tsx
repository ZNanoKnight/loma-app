import React, { useState, useRef, useEffect } from 'react';
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
  Keyboard,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();
  const { updateUserData, userData } = useUser();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [signInStep, setSignInStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const passwordInputRef = useRef<TextInput>(null);

  // Video player for bouncing fruits
  const videoSource = require('../../../assets/iconography/BouncingFruits.mp4');
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.play();
  });

  // Rotating text animation
  const rotatingWords = ['nutritious', 'wholesome', 'balanced', 'nourishing', 'clean', 'simple', 'fresh', 'delicious', 'mindful', 'effortless'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Animate current word sliding up and out
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        // Move to next word
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
        // Reset position for new word to slide in from bottom
        slideAnim.setValue(50);
        // Animate new word sliding up to center
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, 4000); // Change word every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSignIn = async () => {
    // Local authentication - validate credentials against stored data
    try {
      // Validate input
      if (!email || !password) {
        setErrorMessage('Please enter both email and password');
        return;
      }

      // Check if email matches stored email
      const storedEmail = userData.email.toLowerCase();
      const enteredEmail = email.trim().toLowerCase();

      if (enteredEmail !== storedEmail) {
        setErrorMessage('Email not found. Please check your email or create an account.');
        return;
      }

      // Check if password matches stored password
      if (password !== userData.password) {
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      // Authentication successful
      console.log('Sign in successful:', email);
      Keyboard.dismiss();
      setShowSignInModal(false);
      setErrorMessage('');

      // Set user as authenticated
      // All other data is already stored in userData, we just need to mark them as authenticated
      updateUserData({
        isAuthenticated: true,
      });

    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred during sign in. Please try again.');
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = () => {
    if (email.trim() && isValidEmail(email)) {
      setErrorMessage('');
      setSignInStep('password');
    }
  };

  const handleBackToEmail = () => {
    setSignInStep('email');
    setPassword('');
    setErrorMessage('');
  };

  const handleModalClose = () => {
    setShowSignInModal(false);
    setSignInStep('email');
    setEmail('');
    setPassword('');
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      {/* UI Content */}
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>

        {/* Video in absolute top right corner */}
        <View style={styles.videoContainer}>
          <View style={styles.videoPlaceholder}>
            <Text style={styles.placeholderText}>Art Placeholder</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.centerWrapper}>
            <View style={styles.mainContent}>
              <View style={styles.headlineContainer}>
                <Text style={styles.headline}>Loma meals are</Text>
                <View style={styles.rotatingTextContainer}>
                  <Animated.Text
                    style={[
                      styles.rotatingText,
                      { transform: [{ translateY: slideAnim }] }
                    ]}
                  >
                    {rotatingWords[currentWordIndex]}
                  </Animated.Text>
                </View>
              </View>
              <Text style={styles.subheadline}>
                Take control of your goals with your 24/7, personalized AI dietician
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('AppFeatures')}
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

                    {errorMessage ? (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMessage}</Text>
                      </View>
                    ) : null}

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
    backgroundColor: '#FEFEFE', // White/Bone background
  },
  safeArea: {
    flex: 1,
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
  videoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  videoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B46C1',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#6B46C1',
    textAlign: 'center',
  },
  mainContent: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
  },
  headlineContainer: {
    marginBottom: 20,
    overflow: 'hidden',
  },
  headline: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 36,
    color: '#6B46C1',  // Purple text
    textAlign: 'left',
    lineHeight: 44,
  },
  rotatingTextContainer: {
    height: 44,
    overflow: 'hidden',
  },
  rotatingText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 36,
    color: '#FF8C00',  // Orange text for emphasis
    textAlign: 'left',
    lineHeight: 44,
  },
  subheadline: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 18,
    color: '#4B5563',  // Dark gray text
    textAlign: 'left',
    lineHeight: 26,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  button: {
    backgroundColor: '#6B46C1',  // Purple button
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#FFFFFF',  // White text
    fontSize: 18,
    textAlign: 'center',
  },
  signInRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  signInText: {
    fontFamily: 'Quicksand-Regular',
    color: '#6B7280',  // Gray text
    fontSize: 14,
  },
  signInLink: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',  // Purple link
    fontSize: 14,
    textDecorationLine: 'underline',
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
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Medium',
    color: 'white',
    fontSize: 16,
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
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',
    fontSize: 18,
    textAlign: 'center',
  },
  forgotPasswordButton: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontFamily: 'Quicksand-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'Quicksand-SemiBold',
    color: 'white',
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorText: {
    fontFamily: 'Quicksand-Medium',
    color: '#FEE2E2',
    fontSize: 14,
    textAlign: 'center',
  },
});