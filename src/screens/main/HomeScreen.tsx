import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe } from '../../context/RecipeContext';
import { SubscriptionService } from '../../services/subscription/subscriptionService';
import { AuthService } from '../../services/auth/authService';
import { RecipeService } from '../../services/recipes/recipeService';
import { ENV } from '../../config/env';
import { logger } from '../../utils/logger';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();
  const { setCurrentRecipe } = useRecipe();

  // Use real user data
  const userName = userData.firstName || 'Friend';

  // State variables for recipe generation form
  const [mealType, setMealType] = useState('');
  const [customRequest, setCustomRequest] = useState('');

  // Token balance state
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Rate limiting state
  const [lastGenerationTime, setLastGenerationTime] = useState<number>(0);
  const RATE_LIMIT_MS = 10000; // 10 seconds between generations

  // Loading modal state
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Out of Munchies modal state
  const [showOutOfMunchiesModal, setShowOutOfMunchiesModal] = useState(false);

  // Ref for ScrollView to scroll to input when focused
  const scrollViewRef = useRef<ScrollView>(null);

  // Fun loading messages to cycle through
  const loadingMessages = [
    { emoji: '👨‍🍳', text: 'Our AI chef is getting creative...' },
    { emoji: '📖', text: 'Browsing through thousands of recipes...' },
    { emoji: '🥗', text: 'Balancing your macros perfectly...' },
    { emoji: '✨', text: 'Adding a sprinkle of magic...' },
    { emoji: '🔥', text: 'Heating up some delicious ideas...' },
    { emoji: '🎯', text: 'Matching your preferences...' },
    { emoji: '🍳', text: 'Almost ready to serve...' },
  ];

  // Rotate animation for the emoji
  useEffect(() => {
    if (showLoadingModal) {
      const spin = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();

      // Cycle through messages every 8 seconds
      const messageInterval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 8000);

      return () => {
        spin.stop();
        clearInterval(messageInterval);
        spinValue.setValue(0);
      };
    }
  }, [showLoadingModal]);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Fetch token balance on mount and when screen is focused
  useEffect(() => {
    fetchTokenBalance();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTokenBalance();
    }, [])
  );

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTokenBalance();
    setRefreshing(false);
  };

  const fetchTokenBalance = async () => {
    try {
      setLoadingTokens(true);
      const session = await AuthService.getCurrentSession();
      if (session?.user?.id) {
        const balance = await SubscriptionService.getTokenBalance(session.user.id);
        setTokenBalance(balance);
      }
    } catch (error) {
      logger.error('Error fetching token balance:', error);
      // Don't show error to user, just use default balance
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleGenerateRecipe = async () => {
    // Rate limiting check
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGenerationTime;
    if (timeSinceLastGeneration < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - timeSinceLastGeneration) / 1000);
      Alert.alert(
        'Please Wait',
        `To ensure the best quality recipes, please wait ${remainingSeconds} more seconds before generating again.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate that meal type is selected
    if (!mealType) {
      Alert.alert(
        'Meal Type Required',
        'Please select a meal type (Breakfast, Lunch, Dinner, or Snack) before generating.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check token balance before generating
    if (tokenBalance === 0) {
      setShowOutOfMunchiesModal(true);
      return;
    }

    setGenerating(true);
    setShowLoadingModal(true);
    setLoadingMessageIndex(0);
    let generatedRecipes: any[] = [];

    try {
      // Step 1: Validate token usage with server
      const session = await AuthService.getCurrentSession();
      if (!session?.user?.id) {
        throw new Error('No active session');
      }

      logger.log('[HomeScreen] Validating token usage...');
      const validation = await SubscriptionService.validateTokenUsage(session.user.id);

      if (!validation.hasTokens) {
        setShowLoadingModal(false);
        Alert.alert(
          "Cannot Generate Recipe",
          validation.message || "You don't have enough Munchies available.",
          [{ text: "OK" }]
        );
        await fetchTokenBalance(); // Refresh balance
        return;
      }

      logger.log('[HomeScreen] Token validation successful, generating 4 recipes via AI...');

      // Step 2: Generate 4 recipes via AI
      generatedRecipes = await RecipeService.generateRecipe({
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        customRequest: customRequest || undefined,
      });

      logger.log(`[HomeScreen] Successfully generated ${generatedRecipes.length} recipes`);

      // Step 3: Deduct token AFTER successful generation
      logger.log('[HomeScreen] Deducting 1 token...');
      const deductResult = await SubscriptionService.deductTokens(session.user.id, 1);

      // Step 4: Update local token balance and rate limit timestamp
      setTokenBalance(deductResult.balance);
      setLastGenerationTime(Date.now());
      logger.log(`[HomeScreen] Token deducted. New balance: ${deductResult.balance}`);

      // Step 5: Close modal and navigate with generated recipes
      setShowLoadingModal(false);
      navigation.navigate('RecipeGenerated', {
        recipes: generatedRecipes,
        selectedMealType: mealType,
      });

      // Reset custom request field after successful generation
      setCustomRequest('');
    } catch (error: any) {
      logger.error('[HomeScreen] Error generating recipe:', error);
      setShowLoadingModal(false);

      // CRITICAL: If error occurred, token was NOT deducted
      // Show error with free retry option
      Alert.alert(
        'Generation Failed',
        error.userMessage || 'Failed to generate recipes. Please try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Retry',
            style: 'default',
            onPress: () => handleGenerateRecipe(), // Free retry
          },
        ]
      );

      // Refresh token balance to ensure UI is in sync
      await fetchTokenBalance();
    } finally {
      setGenerating(false);
    }
  };

  // Check if form is valid for button enable/disable
  const isFormValid = mealType !== '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#1B4332"
                colors={['#1B4332']}
              />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>How's it going, {userName}!</Text>
                <Text style={styles.subGreeting}>What are we cooking today?</Text>
              </View>
            </View>

            {/* Munchies Callout Box */}
            <View style={styles.munchiesCallout}>
              {loadingTokens ? (
                <View style={styles.munchiesLoading}>
                  <ActivityIndicator size="small" color="#1B4332" />
                  <Text style={styles.munchiesLoadingText}>Loading Munchies...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.munchiesTitle}>
                    🍪 You have {tokenBalance} Munchies!
                  </Text>
                  <Text style={styles.munchiesSubtext}>
                    Each recipe costs <Text style={styles.boldText}>1 Munchie</Text>.{'\n'}
                    {tokenBalance > 0 ? (
                      <>You can generate <Text style={styles.boldText}>{tokenBalance} meals</Text> total.</>
                    ) : (
                      <Text style={styles.outOfTokensText}>Your balance will refill when your subscription renews.</Text>
                    )}
                  </Text>
                </>
              )}
            </View>

            {/* Recipe Generator Card */}
            <View style={styles.generatorCard}>
              <Text style={styles.cardTitle}>Generate Recipe</Text>
              
              {/* Meal Type Selection */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Meal Type</Text>
                <View style={styles.mealTypeContainer}>
                  {[
                    { type: 'breakfast', emoji: '🥞', label: 'Breakfast' },
                    { type: 'lunch', emoji: '🥗', label: 'Lunch' },
                    { type: 'dinner', emoji: '🍽️', label: 'Dinner' },
                    { type: 'snack', emoji: '🍪', label: 'Snack' }
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.mealTypeCard,
                        mealType === item.type && styles.mealTypeCardActive
                      ]}
                      onPress={() => setMealType(item.type)}
                    >
                      <Text style={styles.mealTypeEmoji}>{item.emoji}</Text>
                      <Text style={[
                        styles.mealTypeText,
                        mealType === item.type && styles.mealTypeTextActive
                      ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Custom Request */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Special Requests (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={customRequest}
                  onChangeText={setCustomRequest}
                  placeholder="e.g., 'Extra spicy' or 'Use chicken thighs'"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  onFocus={() => {
                    // Scroll to make the input visible above the keyboard
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[
                  styles.generateButton,
                  (!isFormValid || generating || tokenBalance === 0) && styles.generateButtonDisabled
                ]}
                onPress={handleGenerateRecipe}
                disabled={!isFormValid || generating || tokenBalance === 0}
                activeOpacity={0.8}
              >
                {generating ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text style={styles.generateButtonText}>Generating...</Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.generateButtonText,
                    (!isFormValid || tokenBalance === 0) && styles.generateButtonTextDisabled
                  ]}>
                    ✨ Generate Recipe
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>

        {/* Loading Modal */}
        <Modal
          visible={showLoadingModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Animated Emoji */}
              <Animated.Text
                style={[
                  styles.modalEmoji,
                  { transform: [{ rotate: spinInterpolate }] },
                ]}
              >
                {loadingMessages[loadingMessageIndex].emoji}
              </Animated.Text>

              {/* Title */}
              <Text style={styles.modalTitle}>Creating Your Recipes</Text>

              {/* Dynamic Message */}
              <Text style={styles.modalMessage}>
                {loadingMessages[loadingMessageIndex].text}
              </Text>

              {/* Progress Indicator */}
              <View style={styles.modalProgressContainer}>
                <ActivityIndicator size="small" color="#1B4332" />
                <Text style={styles.modalProgressText}>
                  This usually takes about 60 seconds
                </Text>
              </View>

              {/* Fun Tip */}
              <View style={styles.modalTipContainer}>
                <Text style={styles.modalTipLabel}>Did you know?</Text>
                <Text style={styles.modalTipText}>
                  Our AI considers your dietary preferences, skill level, and available equipment to craft the perfect recipes just for you!
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Out of Munchies Modal */}
        <Modal
          visible={showOutOfMunchiesModal}
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
          onRequestClose={() => setShowOutOfMunchiesModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.outOfMunchiesModalContent}>
              {/* Cookie Emoji */}
              <Text style={styles.outOfMunchiesEmoji}>🍪</Text>

              {/* Title */}
              <Text style={styles.outOfMunchiesTitle}>Out of Munchies!</Text>

              {/* Message */}
              <Text style={styles.outOfMunchiesMessage}>
                You've used all your Munchies for this period. But don't worry - you have options!
              </Text>

              {/* Info Box */}
              <View style={styles.outOfMunchiesInfoBox}>
                <Text style={styles.outOfMunchiesInfoTitle}>How to get more Munchies:</Text>
                <View style={styles.outOfMunchiesInfoItem}>
                  <Text style={styles.outOfMunchiesInfoBullet}>1</Text>
                  <Text style={styles.outOfMunchiesInfoText}>
                    <Text style={styles.outOfMunchiesInfoBold}>Wait for renewal</Text> - Your balance refills automatically when your subscription renews
                  </Text>
                </View>
                <View style={styles.outOfMunchiesInfoItem}>
                  <Text style={styles.outOfMunchiesInfoBullet}>2</Text>
                  <Text style={styles.outOfMunchiesInfoText}>
                    <Text style={styles.outOfMunchiesInfoBold}>Upgrade your plan</Text> - Higher tiers include more Munchies per period
                  </Text>
                </View>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={styles.outOfMunchiesPrimaryButton}
                onPress={() => {
                  setShowOutOfMunchiesModal(false);
                  navigation.navigate('Subscription');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.outOfMunchiesPrimaryButtonText}>Manage Subscription</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.outOfMunchiesSecondaryButton}
                onPress={() => setShowOutOfMunchiesModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.outOfMunchiesSecondaryButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  greeting: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 28,
    color: '#1B4332',
    marginBottom: 4,
  },
  subGreeting: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  munchiesCallout: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  munchiesTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#1B4332',
    marginBottom: 4,
  },
  munchiesSubtext: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#40916C',
    lineHeight: 20,
  },
  boldText: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
  },
  munchiesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  munchiesLoadingText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#1B4332',
    marginLeft: 8,
  },
  outOfTokensText: {
    fontFamily: 'Quicksand-Regular',
    color: '#DC2626',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  generatorCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 22,
    color: '#1F2937',
    marginBottom: 20,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  mealTypeContainer: {
    gap: 12,
  },
  mealTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  mealTypeCardActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1B4332',
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  mealTypeText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#4B5563',
  },
  mealTypeTextActive: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
  },
  servingsInput: {
    fontFamily: 'Quicksand-Regular',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },
  textInput: {
    fontFamily: 'Quicksand-Regular',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1B4332',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: 'white',
    fontSize: 18,
  },
  generateButtonTextDisabled: {
    color: '#9CA3AF',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 12,
    color: '#1F2937',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#1B4332',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  modalEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#1B4332',
    textAlign: 'center',
    marginBottom: 24,
    minHeight: 24,
  },
  modalProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  modalProgressText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
  },
  modalTipContainer: {
    backgroundColor: '#FEFCE8',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  modalTipLabel: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#CA8A04',
    marginBottom: 4,
  },
  modalTipText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#713F12',
    lineHeight: 18,
  },
  // Out of Munchies Modal Styles
  outOfMunchiesModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  outOfMunchiesEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  outOfMunchiesTitle: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 26,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  outOfMunchiesMessage: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  outOfMunchiesInfoBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B7E4C7',
  },
  outOfMunchiesInfoTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#1B4332',
    marginBottom: 12,
  },
  outOfMunchiesInfoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  outOfMunchiesInfoBullet: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#1B4332',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    marginRight: 10,
    marginTop: 2,
  },
  outOfMunchiesInfoText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
    lineHeight: 18,
  },
  outOfMunchiesInfoBold: {
    fontFamily: 'Quicksand-Bold',
    color: '#1F2937',
  },
  outOfMunchiesPrimaryButton: {
    backgroundColor: '#1B4332',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#1B4332',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  outOfMunchiesPrimaryButtonText: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  outOfMunchiesSecondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  outOfMunchiesSecondaryButtonText: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
});