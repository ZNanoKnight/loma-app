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

interface RecipeSavedScreenProps {
  route?: {
    params?: {
      wasRefined?: boolean;
    };
  };
}

export default function RecipeSavedScreen({ route }: RecipeSavedScreenProps) {
  const navigation = useNavigation<any>();
  const { currentRecipe } = useRecipe();
  const wasRefined = route?.params?.wasRefined || false;

  const handleViewRecipeBook = () => {
    navigation.navigate('RecipesTab', {
      screen: 'RecipeBook'
    });
  };

  const handleStartCooking = () => {
    // Navigate to RecipeDetailScreen so user goes through the full cooking flow
    // (Equipment Checklist -> Ingredients -> Cooking Instructions)
    navigation.navigate('RecipesTab', {
      screen: 'RecipeDetail'
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Celebration Emoji */}
          <Text style={styles.celebrationEmoji}>
            {wasRefined ? '✨' : '🎉'}
          </Text>

          {/* Congratulations Text */}
          <Text style={styles.congratsTitle}>
            {wasRefined ? 'Recipe Refined!' : 'Recipe Saved!'}
          </Text>

          <Text style={styles.congratsSubtitle}>
            {wasRefined
              ? 'Your personalized recipe is ready'
              : 'Your recipe has been added to your collection'
            }
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
            {wasRefined
              ? 'We\'ve customized this recipe just for you. It\'s been saved to your Recipe Book and is ready to cook!'
              : 'Great choice! Your recipe is now saved to your Recipe Book. Ready to start cooking?'
            }
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStartCooking}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Start Cooking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewRecipeBook}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View Recipe Book</Text>
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
    gap: 12,
  },
  primaryButton: {
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
  primaryButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#1B4332',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontFamily: 'Quicksand-Bold',
    color: '#FFFFFF',
    fontSize: 16,
  },
});
