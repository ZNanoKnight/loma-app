import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput  // ADD THIS
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';  // ADD THIS

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();  // ADD THIS
  
  // Use real user data
  const userName = userData.firstName || 'Friend';  // MODIFIED
  const todayRecipes = userData.totalRecipes;  // MODIFIED
  const weekStreak = userData.currentStreak;  // MODIFIED
  
  // Add missing state variables that your JSX expects
  const [mealType, setMealType] = useState('');  // ADD THIS
  const [cookTime, setCookTime] = useState('');  // ADD THIS
  const [servings, setServings] = useState('');  // ADD THIS
  const [customRequest, setCustomRequest] = useState('');  // ADD THIS

  const recentRecipes = [
    { id: '1', name: 'Grilled Chicken Salad', emoji: '🥗', time: '25 min', calories: 320 },
    { id: '2', name: 'Protein Smoothie', emoji: '🥤', time: '5 min', calories: 280 },
    { id: '3', name: 'Quinoa Bowl', emoji: '🍚', time: '30 min', calories: 400 },
  ];

  const motivationalQuotes = [
    "Every meal is a chance to nourish your body!",
    "Small changes lead to big results!",
    "You're building healthy habits that last!",
    "Cooking is self-care in action!",
    "Your journey to health starts in the kitchen!"
  ];

  const [currentQuote] = useState(
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  );

  const handleGenerateRecipe = () => {  // ADD THIS FUNCTION
    navigation.navigate('RecipeGenerated');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>Good afternoon, {userName}!</Text>
                <Text style={styles.subGreeting}>What are we cooking today?</Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Text style={styles.notificationIcon}>🔔</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🍳</Text>
                <Text style={styles.statNumber}>{todayRecipes}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statNumber}>{weekStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>📊</Text>
                <Text style={styles.statNumber}>92%</Text>
                <Text style={styles.statLabel}>Goal Met</Text>
              </View>
            </View>

            {/* Recipe Generator Card */}
            <View style={styles.generatorCard}>
              <Text style={styles.cardTitle}>Generate Recipe</Text>
              
              {/* Meal Type Selection */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Meal Type</Text>
                <View style={styles.optionButtons}>
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.optionButton,
                        mealType === type && styles.optionButtonActive
                      ]}
                      onPress={() => setMealType(type)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        mealType === type && styles.optionButtonTextActive
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Cook Time Selection */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Cook Time</Text>
                <View style={styles.optionButtons}>
                  {(['15', '30', '45', '60'] as const).map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.optionButton,
                        cookTime === time && styles.optionButtonActive
                      ]}
                      onPress={() => setCookTime(time)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        cookTime === time && styles.optionButtonTextActive
                      ]}>
                        {time} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Servings Selection */}
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>Servings</Text>
                <View style={styles.optionButtons}>
                  {(['1', '2', '4'] as const).map((serving) => (
                    <TouchableOpacity
                      key={serving}
                      style={[
                        styles.optionButton,
                        styles.servingButton,
                        servings === serving && styles.optionButtonActive
                      ]}
                      onPress={() => setServings(serving)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        servings === serving && styles.optionButtonTextActive
                      ]}>
                        {serving}
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
                style={styles.generateButton}
                onPress={handleGenerateRecipe}
                activeOpacity={0.8}
              >
                <Text style={styles.generateButtonText}>✨ Generate Recipe</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  optionSection: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 10,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  servingButton: {
    flex: 0,
    paddingHorizontal: 24,
  },
  optionButtonActive: {
    backgroundColor: '#4F46E5',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  optionButtonTextActive: {
    color: 'white',
  },
  textInput: {
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
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
});