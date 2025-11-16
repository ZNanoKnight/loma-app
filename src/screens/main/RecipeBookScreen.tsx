import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';  // ADD THIS

type FilterType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
type SortType = 'recent' | 'favorite' | 'quickest' | 'protein';

interface Recipe {
  id: string;
  title: string;
  emoji: string;
  time: number;
  calories: number;
  protein: number;
  isFavorite: boolean;
  mealType: FilterType;
  createdAt: string;
  rating?: number;
  cookedCount: number;
}

export default function RecipeBookScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();  // ADD THIS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('recent');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Use saved recipes from global state, or fall back to mock data
  const [recipes] = useState<Recipe[]>(userData.savedRecipes.length > 0 ? userData.savedRecipes : [  // MODIFIED
    {
      id: '1',
      title: 'Mediterranean Chicken Bowl',
      emoji: '🥗',
      time: 35,
      calories: 485,
      protein: 42,
      isFavorite: true,
      mealType: 'lunch',
      createdAt: '2024-01-15',
      rating: 5,
      cookedCount: 3
    },
    {
      id: '2',
      title: 'Protein Pancakes',
      emoji: '🥞',
      time: 20,
      calories: 320,
      protein: 28,
      isFavorite: true,
      mealType: 'breakfast',
      createdAt: '2024-01-14',
      rating: 4,
      cookedCount: 5
    },
    {
      id: '3',
      title: 'Teriyaki Salmon',
      emoji: '🍣',
      time: 25,
      calories: 410,
      protein: 38,
      isFavorite: false,
      mealType: 'dinner',
      createdAt: '2024-01-13',
      rating: 5,
      cookedCount: 2
    },
    {
      id: '4',
      title: 'Greek Yogurt Parfait',
      emoji: '🍓',
      time: 10,
      calories: 250,
      protein: 18,
      isFavorite: false,
      mealType: 'snack',
      createdAt: '2024-01-12',
      cookedCount: 8
    },
    {
      id: '5',
      title: 'Beef Stir Fry',
      emoji: '🥘',
      time: 30,
      calories: 520,
      protein: 45,
      isFavorite: true,
      mealType: 'dinner',
      createdAt: '2024-01-11',
      rating: 4,
      cookedCount: 4
    },
    {
      id: '6',
      title: 'Overnight Oats',
      emoji: '🥣',
      time: 5,
      calories: 280,
      protein: 12,
      isFavorite: false,
      mealType: 'breakfast',
      createdAt: '2024-01-10',
      cookedCount: 10
    }
  ]);

  const filters = [
    { id: 'all', label: 'All', emoji: '📚' },
    { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
    { id: 'lunch', label: 'Lunch', emoji: '☀️' },
    { id: 'dinner', label: 'Dinner', emoji: '🌙' },
    { id: 'snack', label: 'Snack', emoji: '🍎' }
  ];

  const sortOptions = [
    { id: 'recent', label: 'Most Recent', icon: '📅' },
    { id: 'favorite', label: 'Favorites', icon: '❤️' },
    { id: 'quickest', label: 'Quickest', icon: '⚡' },
    { id: 'protein', label: 'High Protein', icon: '💪' }
  ];

  // Filter and sort recipes
  const filteredRecipes = recipes
    .filter(recipe => {
      if (selectedFilter !== 'all' && recipe.mealType !== selectedFilter) return false;
      if (searchQuery && !recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (selectedSort) {
        case 'favorite':
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        case 'quickest':
          return a.time - b.time;
        case 'protein':
          return b.protein - a.protein;
        default: // recent
          return b.createdAt.localeCompare(a.createdAt);
      }
    });

  const renderRecipeCard = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail')}
      activeOpacity={0.8}
    >
      <View style={styles.recipeImageContainer}>
        <Text style={styles.recipeEmoji}>{item.emoji}</Text>
        {item.isFavorite && (
          <View style={styles.favoriteIndicator}>
            <Text style={styles.favoriteIcon}>❤️</Text>
          </View>
        )}
      </View>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={1}>
          {item.title}
        </Text>
        
        <View style={styles.recipeStats}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statText}>{item.time}m</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statText}>{item.calories}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statText}>{item.protein}g</Text>
          </View>
        </View>

        {item.cookedCount > 0 && (
          <Text style={styles.cookedCount}>
            Cooked {item.cookedCount} {item.cookedCount === 1 ? 'time' : 'times'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#2D1B69', '#1A0F3D']}
        style={styles.gradient}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Recipe Book</Text>
            <View style={styles.headerStats}>
              <Text style={styles.headerStatText}>{recipes.length} recipes</Text>
              <Text style={styles.headerStatDivider}>•</Text>
              <Text style={styles.headerStatText}>
                {recipes.filter(r => r.isFavorite).length} favorites
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search recipes..."
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
            contentContainerStyle={styles.filterContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive
                ]}
                onPress={() => setSelectedFilter(filter.id as FilterType)}
              >
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Options */}
          <View style={styles.sortContainer}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortOptions(!showSortOptions)}
            >
              <Text style={styles.sortIcon}>↕️</Text>
              <Text style={styles.sortText}>
                {sortOptions.find(s => s.id === selectedSort)?.label}
              </Text>
            </TouchableOpacity>

            {showSortOptions && (
              <View style={styles.sortDropdown}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.sortOption}
                    onPress={() => {
                      setSelectedSort(option.id as SortType);
                      setShowSortOptions(false);
                    }}
                  >
                    <Text style={styles.sortOptionIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.sortOptionText,
                      selectedSort === option.id && styles.sortOptionTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Recipe List */}
          <FlatList
            data={filteredRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.recipeRow}
            contentContainerStyle={styles.recipeList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📭</Text>
                <Text style={styles.emptyTitle}>No recipes found</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery 
                    ? 'Try adjusting your search' 
                    : 'Generate your first recipe to get started'}
                </Text>
              </View>
            }
          />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  headerStatDivider: {
    marginHorizontal: 8,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  clearIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterTabActive: {
    backgroundColor: 'white',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  filterTextActive: {
    color: '#4F46E5',
  },
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sortIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sortText: {
    fontSize: 13,
    color: 'white',
  },
  sortDropdown: {
    position: 'absolute',
    top: 35,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortOptionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortOptionTextActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  recipeList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    width: '48%',
    overflow: 'hidden',
  },
  recipeImageContainer: {
    height: 120,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  recipeEmoji: {
    fontSize: 48,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cookedCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});