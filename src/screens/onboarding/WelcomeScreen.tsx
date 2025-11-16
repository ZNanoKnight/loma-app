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

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <LinearGradient
      colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>L</Text>
          </View>
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
  logoContainer: {
    position: 'absolute',
    top: 60,
    left: 30,
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
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