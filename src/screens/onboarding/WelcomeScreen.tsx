import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Asset } from 'expo-asset';

// Pre-load logo image
const logoImage = require('../../../assets/adaptive-icon.png');
// Resolve asset immediately
Asset.fromModule(logoImage).downloadAsync();

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  // Text fly-in animations (from bottom + fade in over 3 seconds)
  const headlineAnim = useRef(new Animated.Value(100)).current;
  const headlineOpacity = useRef(new Animated.Value(0)).current;
  const subheadlineAnim = useRef(new Animated.Value(100)).current;
  const subheadlineOpacity = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(100)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const signInAnim = useRef(new Animated.Value(100)).current;
  const signInOpacity = useRef(new Animated.Value(0)).current;

  // Rotating text animation
  const rotatingWords = ['nutritious', 'wholesome', 'balanced', 'nourishing', 'clean', 'simple', 'fresh', 'delicious', 'mindful', 'effortless', 'premium'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initial entrance animations
  useEffect(() => {
    // Staggered text fly-in animations
    // Headline
    Animated.parallel([
      Animated.timing(headlineAnim, {
        toValue: 0,
        duration: 3000,
        useNativeDriver: true,
      }),
      Animated.timing(headlineOpacity, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ]).start();

    // Subheadline (slight delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subheadlineAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(subheadlineOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Button (more delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // Sign in row (most delay)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(signInAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(signInOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);
  }, []);

  // Rotating words animation
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
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, []);


  return (
    <View style={styles.container}>
      {/* UI Content */}
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>

        {/* Logo in absolute top right corner */}
        <View style={styles.videoContainer}>
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.centerWrapper}>
            <View style={styles.mainContent}>
              <Animated.View
                style={[
                  styles.headlineContainer,
                  {
                    opacity: headlineOpacity,
                    transform: [{ translateY: headlineAnim }]
                  }
                ]}
              >
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
              </Animated.View>
              <Animated.Text
                style={[
                  styles.subheadline,
                  {
                    opacity: subheadlineOpacity,
                    transform: [{ translateY: subheadlineAnim }]
                  }
                ]}
              >
                Take control of your goals with your 24/7, personalized AI dietician
              </Animated.Text>
            </View>
          </View>

          <View style={styles.buttonSection}>
            <Animated.View
              style={{
                width: '100%',
                opacity: buttonOpacity,
                transform: [{ translateY: buttonAnim }]
              }}
            >
              <TouchableOpacity
                style={styles.button}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AppFeatures')}
              >
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              style={[
                styles.signInRow,
                {
                  opacity: signInOpacity,
                  transform: [{ translateY: signInAnim }]
                }
              ]}
            >
              <Text style={styles.signInText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332', // Dark forest green background (primary)
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
  logoImage: {
    width: 120,
    height: 120,
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
    fontFamily: 'PTSerif-Bold',
    fontSize: 36,
    color: '#FFFFFF',  // White text on dark background
    textAlign: 'left',
    lineHeight: 44,
  },
  rotatingTextContainer: {
    height: 44,
    overflow: 'hidden',
  },
  rotatingText: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 36,
    color: '#FF8C00',  // Orange text for emphasis (tertiary)
    textAlign: 'left',
    lineHeight: 44,
  },
  subheadline: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 18,
    color: '#B7E4C7',  // Light green tint for readability on dark bg
    textAlign: 'left',
    lineHeight: 26,
  },
  buttonSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  button: {
    backgroundColor: '#FF8C00',  // Tertiary orange button
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontFamily: 'Quicksand-Bold',
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
    color: '#74C69D',  // Secondary lighter green
    fontSize: 14,
  },
  signInLink: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',  // White link for contrast
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});