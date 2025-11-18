import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AppFeaturesScreen() {
  const navigation = useNavigation<any>();

  const features = [
    {
      emoji: '🤖',
      title: 'AI-Powered Recipe Generation',
      description: 'Get personalized recipes tailored to your goals, preferences, and dietary restrictions'
    },
    {
      emoji: '🛒',
      title: 'Smart Shopping Lists',
      description: 'Automatically generated grocery lists with all ingredients you need'
    },
    {
      emoji: '👨‍🍳',
      title: 'Step-by-Step Cooking',
      description: 'Easy-to-follow instructions with timers and cooking guidance'
    },
    {
      emoji: '📊',
      title: 'Macro & Progress Tracking',
      description: 'Track your nutrition, calories, and progress toward your goals'
    },
    {
      emoji: '📱',
      title: 'Meal Planning',
      description: 'Plan your weekly meals and stay organized with your nutrition'
    },
    {
      emoji: '⭐',
      title: 'Recipe Book',
      description: 'Save and organize your favorite recipes for easy access'
    }
  ];

  const handleContinue = () => {
    navigation.navigate('Payment');
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
              <View style={[styles.progressFill, { width: '91%' }]} />
            </View>
            <Text style={styles.progressText}>Step 10 of 11</Text>
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
            <Text style={styles.title}>Welcome to Loma</Text>
            <Text style={styles.subtitle}>
              Your AI-powered cooking companion for achieving your health goals
            </Text>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={styles.featureIconContainer}>
                    <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Token System Explanation */}
            <View style={styles.tokenSection}>
              <View style={styles.tokenHeader}>
                <Text style={styles.tokenEmoji}>🪙</Text>
                <Text style={styles.tokenTitle}>How Tokens Work</Text>
              </View>

              <View style={styles.tokenCard}>
                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>1</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    Each <Text style={styles.tokenHighlight}>token</Text> allows you to generate one personalized recipe
                  </Text>
                </View>

                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>2</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    Your subscription includes tokens that refresh based on your plan
                  </Text>
                </View>

                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>3</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    Generate unlimited recipes within your token allowance
                  </Text>
                </View>

                <View style={styles.tokenItem}>
                  <View style={styles.tokenBullet}>
                    <Text style={styles.tokenBulletText}>4</Text>
                  </View>
                  <Text style={styles.tokenText}>
                    All generated recipes are saved to your Recipe Book forever
                  </Text>
                </View>
              </View>

              <View style={styles.tokenBenefitBox}>
                <Text style={styles.tokenBenefitIcon}>✨</Text>
                <Text style={styles.tokenBenefitText}>
                  Higher tier plans include more tokens and additional premium features
                </Text>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                Choose Your Plan
              </Text>
            </TouchableOpacity>
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
    backgroundColor: '#6B46C1',
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
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
    justifyContent: 'center',
  },
  featureTitle: {
    fontFamily: 'VendSans-SemiBold',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: 'VendSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
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
    alignItems: 'flex-start',
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
    marginTop: 2,
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
  continueButton: {
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
    marginBottom: 30,
  },
  continueButtonText: {
    fontFamily: 'VendSans-SemiBold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
