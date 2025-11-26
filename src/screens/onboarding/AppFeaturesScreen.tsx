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

  const handleContinue = () => {
    navigation.navigate('NameEmail');
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
              <View style={[styles.progressFill, { width: '10%' }]} />
            </View>
            <Text style={styles.progressText}>Step 1 of 10</Text>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Welcome')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>
              Welcome to <Text style={styles.titleHighlight}>Loma</Text>
            </Text>
            <Text style={styles.subtitle}>
              Your AI-powered cooking companion. Here's how it works:
            </Text>

            {/* Section 1: Recipe Generation */}
            <View style={styles.featureSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>✨</Text>
                </View>
                <Text style={styles.sectionTitle}>Recipe Generation</Text>
              </View>

              <View style={styles.featureCard}>
                {/* Step 1: Munchies */}
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Use Your Munchies</Text>
                    <Text style={styles.stepDescription}>
                      Each recipe generation costs one <Text style={styles.highlight}>Munchie</Text> - our in-app currency. You receive Munchies based on your subscription plan.
                    </Text>
                  </View>
                </View>

                {/* Step 2: Customize */}
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Tell Us What You Want</Text>
                    <Text style={styles.stepDescription}>
                      Select your meal type (breakfast, lunch, dinner, or snack) and add any special requests - from "extra spicy" to "use chicken thighs".
                    </Text>
                  </View>
                </View>

                {/* Step 3: Choose */}
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Pick Your Favorite</Text>
                    <Text style={styles.stepDescription}>
                      Our AI generates <Text style={styles.highlight}>4 unique recipes</Text> tailored to your preferences. Preview each one and choose your favorite.
                    </Text>
                  </View>
                </View>

                {/* Step 4: Refine */}
                <View style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Refine If You'd Like</Text>
                    <Text style={styles.stepDescription}>
                      Not quite perfect? You get one free refinement to tweak the recipe before saving it to your book.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Munchies Explanation Card */}
            <View style={styles.munchiesCard}>
              <View style={styles.munchiesHeader}>
                <Text style={styles.munchiesEmoji}>🍪</Text>
                <View style={styles.munchiesHeaderText}>
                  <Text style={styles.munchiesTitle}>How Munchies Work</Text>
                  <Text style={styles.munchiesSubtitle}>Your recipe generation currency</Text>
                </View>
              </View>
              <View style={styles.munchiesDivider} />
              <View style={styles.munchiesInfo}>
                <View style={styles.munchiesInfoItem}>
                  <Text style={styles.munchiesBullet}>•</Text>
                  <Text style={styles.munchiesInfoText}>
                    <Text style={styles.munchiesBold}>1 Munchie = 1 Recipe Generation</Text>
                  </Text>
                </View>
                <View style={styles.munchiesInfoItem}>
                  <Text style={styles.munchiesBullet}>•</Text>
                  <Text style={styles.munchiesInfoText}>
                    Munchies refresh with each subscription renewal
                  </Text>
                </View>
                <View style={styles.munchiesInfoItem}>
                  <Text style={styles.munchiesBullet}>•</Text>
                  <Text style={styles.munchiesInfoText}>
                    Higher tiers = more Munchies per period
                  </Text>
                </View>
              </View>
            </View>

            {/* Section 2: Recipe Book */}
            <View style={styles.featureSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>📖</Text>
                </View>
                <Text style={styles.sectionTitle}>Recipe Book</Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureDescription}>
                  All your generated recipes are saved permanently to your personal recipe book. Each recipe includes:
                </Text>

                <View style={styles.recipeFeaturesList}>
                  <View style={styles.recipeFeatureItem}>
                    <View style={styles.recipeFeatureIcon}>
                      <Text style={styles.recipeFeatureEmoji}>🍳</Text>
                    </View>
                    <View style={styles.recipeFeatureContent}>
                      <Text style={styles.recipeFeatureTitle}>Equipment Checklist</Text>
                      <Text style={styles.recipeFeatureText}>Know exactly what tools you'll need before you start</Text>
                    </View>
                  </View>

                  <View style={styles.recipeFeatureItem}>
                    <View style={styles.recipeFeatureIcon}>
                      <Text style={styles.recipeFeatureEmoji}>🥕</Text>
                    </View>
                    <View style={styles.recipeFeatureContent}>
                      <Text style={styles.recipeFeatureTitle}>Ingredient List</Text>
                      <Text style={styles.recipeFeatureText}>Complete shopping list with precise quantities</Text>
                    </View>
                  </View>

                  <View style={styles.recipeFeatureItem}>
                    <View style={styles.recipeFeatureIcon}>
                      <Text style={styles.recipeFeatureEmoji}>👨‍🍳</Text>
                    </View>
                    <View style={styles.recipeFeatureContent}>
                      <Text style={styles.recipeFeatureTitle}>Step-by-Step Instructions</Text>
                      <Text style={styles.recipeFeatureText}>Easy-to-follow cooking guidance from start to finish</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Section 3: Achievements */}
            <View style={styles.featureSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Text style={styles.sectionIcon}>🏆</Text>
                </View>
                <Text style={styles.sectionTitle}>Achievements</Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureDescription}>
                  Track your cooking journey and celebrate milestones! Earn achievements as you:
                </Text>

                <View style={styles.achievementsList}>
                  <View style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementEmoji}>🎯</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>First Steps</Text>
                      <Text style={styles.achievementText}>Generate your first recipes</Text>
                    </View>
                  </View>

                  <View style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementEmoji}>📚</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>Recipe Collector</Text>
                      <Text style={styles.achievementText}>Build your recipe collection</Text>
                    </View>
                  </View>

                  <View style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementEmoji}>⭐</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>Variety Seeker</Text>
                      <Text style={styles.achievementText}>Explore different meal types</Text>
                    </View>
                  </View>

                  <View style={styles.achievementItem}>
                    <View style={styles.achievementIcon}>
                      <Text style={styles.achievementEmoji}>🔥</Text>
                    </View>
                    <View style={styles.achievementContent}>
                      <Text style={styles.achievementTitle}>On Fire</Text>
                      <Text style={styles.achievementText}>Maintain cooking streaks</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                Let's Get Started
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
    backgroundColor: '#FF8C00',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Quicksand-Light',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    fontFamily: 'Quicksand-Regular',
    color: '#40916C',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 32,
    color: '#1F2937',
    marginBottom: 8,
  },
  titleHighlight: {
    color: '#1B4332',
  },
  subtitle: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  // Feature Section Styles
  featureSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D8F3DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: '#1F2937',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureDescription: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  // Step Items (for Recipe Generation)
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1B4332',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 13,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontFamily: 'Quicksand-Light',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  highlight: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
  },
  // Munchies Card
  munchiesCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  munchiesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  munchiesEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  munchiesHeaderText: {
    flex: 1,
  },
  munchiesTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: '#92400E',
  },
  munchiesSubtitle: {
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#B45309',
  },
  munchiesDivider: {
    height: 1,
    backgroundColor: '#F59E0B',
    marginVertical: 12,
    opacity: 0.4,
  },
  munchiesInfo: {
    gap: 8,
  },
  munchiesInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  munchiesBullet: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#92400E',
    marginRight: 8,
    marginTop: -1,
  },
  munchiesInfoText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  munchiesBold: {
    fontFamily: 'Quicksand-Bold',
  },
  // Recipe Book Features
  recipeFeaturesList: {
    gap: 12,
  },
  recipeFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recipeFeatureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D8F3DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recipeFeatureEmoji: {
    fontSize: 18,
  },
  recipeFeatureContent: {
    flex: 1,
    paddingTop: 2,
  },
  recipeFeatureTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  recipeFeatureText: {
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  // Achievements
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D8F3DC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementEmoji: {
    fontSize: 18,
  },
  achievementContent: {
    flex: 1,
    paddingTop: 2,
  },
  achievementTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  achievementText: {
    fontFamily: 'Quicksand-Light',
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  // Continue Button
  continueButton: {
    backgroundColor: '#1B4332',
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
    marginTop: 8,
    marginBottom: 30,
  },
  continueButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
  },
});
