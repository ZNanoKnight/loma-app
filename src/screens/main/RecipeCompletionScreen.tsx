import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRecipe } from '../../context/RecipeContext';

export default function RecipeCompletionScreen() {
  const navigation = useNavigation<any>();
  const { currentRecipe } = useRecipe();

  const handleContinue = () => {
    navigation.navigate('RecipesTab', {
      screen: 'RecipeBook'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Celebration Emoji */}
          <Text style={styles.celebrationEmoji}>🎉</Text>

          {/* Congratulations Text */}
          <Text style={styles.congratsTitle}>
            Congratulations!
          </Text>

          <Text style={styles.congratsSubtitle}>
            You've successfully completed your recipe
          </Text>

          {/* Recipe Name */}
          {currentRecipe && (
            <View style={styles.recipeNameContainer}>
              <Text style={styles.recipeEmoji}>{currentRecipe.emoji}</Text>
              <Text style={styles.recipeName}>{currentRecipe.title}</Text>
            </View>
          )}

          {/* Success Message */}
          <Text style={styles.successMessage}>
            Your cooking skills are getting better with every meal!
            This recipe has been saved to your Recipe Book.
          </Text>
        </View>

        {/* Continue Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B4332',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  congratsTitle: {
    fontFamily: 'PTSerif-Bold',
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  congratsSubtitle: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 18,
    color: '#B7E4C7',
    textAlign: 'center',
    marginBottom: 32,
  },
  recipeNameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  recipeEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  recipeName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 16,
    color: '#B7E4C7',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    fontSize: 18,
  },
});
