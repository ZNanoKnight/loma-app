import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { LogoSvg } from '../../assets/Logo';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  // Setup video player
  const videoSource = require('../../../assets/videos/welcome-background.mp4');
  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

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
              <TouchableOpacity>
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
});