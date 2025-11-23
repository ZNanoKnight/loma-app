import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

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
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signInLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
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
});