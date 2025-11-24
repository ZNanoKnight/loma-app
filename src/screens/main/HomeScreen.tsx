import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe } from '../../context/RecipeContext';
import { SubscriptionService } from '../../services/subscription/subscriptionService';
import { AuthService } from '../../services/auth/authService';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();
  const { setCurrentRecipe, getRecipeById } = useRecipe();

  // Use real user data
  const userName = userData.firstName || 'Friend';

  // State variables for recipe generation form
  const [mealType, setMealType] = useState('');
  const [customRequest, setCustomRequest] = useState('');

  // Token balance state
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Fetch token balance on mount and when screen is focused
  useEffect(() => {
    fetchTokenBalance();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTokenBalance();
    }, [])
  );

  const fetchTokenBalance = async () => {
    try {
      setLoadingTokens(true);
      const session = await AuthService.getSession();
      if (session?.user?.id) {
        const balance = await SubscriptionService.getTokenBalance(session.user.id);
        setTokenBalance(balance);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      // Don't show error to user, just use default balance
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleGenerateRecipe = async () => {
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
      Alert.alert(
        "Out of Munchies 🍪",
        "You don't have any Munchies left to generate a recipe. Your balance will refill when your subscription renews, or you can upgrade your plan.",
        [
          { text: "OK", style: "default" },
          {
            text: "Manage Subscription",
            style: "default",
            onPress: () => navigation.navigate('SettingsMain')
          }
        ]
      );
      return;
    }

    setGenerating(true);
    let generatedRecipes: any[] = [];

    try {
      // Step 1: Validate token usage with server
      const session = await AuthService.getSession();
      if (!session?.user?.id) {
        throw new Error('No active session');
      }

      console.log('[HomeScreen] Validating token usage...');
      const validation = await SubscriptionService.validateTokenUsage(session.user.id);

      if (!validation.hasTokens) {
        Alert.alert(
          "Cannot Generate Recipe",
          validation.message || "You don't have enough Munchies available.",
          [{ text: "OK" }]
        );
        await fetchTokenBalance(); // Refresh balance
        return;
      }

      console.log('[HomeScreen] Token validation successful, generating 4 recipes via AI...');

      // Step 2: Generate 4 recipes via AI
      generatedRecipes = await RecipeService.generateRecipe({
        mealType: mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        customRequest: customRequest || undefined,
      });

      console.log(`[HomeScreen] Successfully generated ${generatedRecipes.length} recipes`);

      // Step 3: Deduct token AFTER successful generation
      console.log('[HomeScreen] Deducting 1 token...');
      const deductResult = await SubscriptionService.deductTokens(session.user.id, 1);

      // Step 4: Update local token balance
      setTokenBalance(deductResult.balance);
      console.log(`[HomeScreen] Token deducted. New balance: ${deductResult.balance}`);

      // Step 5: Navigate with generated recipes
      navigation.navigate('RecipeGenerated', {
        recipes: generatedRecipes,
        selectedMealType: mealType,
      });

      // Reset custom request field after successful generation
      setCustomRequest('');
    } catch (error: any) {
      console.error('[HomeScreen] Error generating recipe:', error);

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
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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
                  <ActivityIndicator size="small" color="#6B46C1" />
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
                    <Text style={styles.generateButtonText}>
                      Generating 4 personalized recipes...
                    </Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.generateButtonText,
                    (!isFormValid || tokenBalance === 0) && styles.generateButtonTextDisabled
                  ]}>
                    ✨ Generate 4 Recipes {tokenBalance > 0 && `(${tokenBalance} Munchies left)`}
                  </Text>
                )}
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
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 4,
  },
  subGreeting: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  munchiesCallout: {
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  munchiesTitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#6B46C1',
    marginBottom: 4,
  },
  munchiesSubtext: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 14,
    color: '#8B5CF6',
    lineHeight: 20,
  },
  boldText: {
    fontFamily: 'Quicksand-Bold',
    color: '#6B46C1',
  },
  munchiesLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  munchiesLoadingText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#6B46C1',
    marginLeft: 8,
  },
  outOfTokensText: {
    fontFamily: 'Quicksand-Medium',
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
    fontFamily: 'Quicksand-Bold',
    fontSize: 22,
    color: '#1F2937',
    marginBottom: 20,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: {
    fontFamily: 'Quicksand-SemiBold',
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
    backgroundColor: '#F3F0FF',
    borderColor: '#6B46C1',
  },
  mealTypeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  mealTypeText: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 16,
    color: '#4B5563',
  },
  mealTypeTextActive: {
    fontFamily: 'Quicksand-SemiBold',
    color: '#6B46C1',
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
    backgroundColor: '#6B46C1',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#6B46C1',
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
    fontFamily: 'Quicksand-SemiBold',
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
    fontFamily: 'Quicksand-Medium',
    fontSize: 12,
    color: '#1F2937',
  },
});