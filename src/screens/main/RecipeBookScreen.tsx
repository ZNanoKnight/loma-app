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
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../context/UserContext';
import { useRecipe } from '../../context/RecipeContext';

type FilterType = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';
type SortType = 'recent' | 'favorite' | 'quickest' | 'protein';

export default function RecipeBookScreen() {
  const navigation = useNavigation<any>();
  const { userData } = useUser();
  const { recipes: contextRecipes, updateRecipe, setCurrentRecipe, isLoading } = useRecipe();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedSort, setSelectedSort] = useState<SortType>('recent');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Use recipes from context (RecipeContext already provides mock data if empty)
  const recipes = contextRecipes;

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

  // Toggle favorite status
  const toggleFavorite = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      updateRecipe(recipeId, { isFavorite: !recipe.isFavorite });
    }
  };

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
          return a.totalTime - b.totalTime;
        case 'protein':
          return b.protein - a.protein;
        default: // recent
          return b.createdDate.localeCompare(a.createdDate);
      }
    });

  const renderRecipeCard = ({ item }: { item: typeof recipes[0] }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => {
        setCurrentRecipe(item);
        navigation.navigate('RecipeDetail', { recipeId: item.id });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.recipeImageContainer}>
        <Text style={styles.recipeEmoji}>{item.emoji}</Text>
        <TouchableOpacity
          style={styles.favoriteIndicator}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.favoriteIcon}>
            {item.isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={1}>
          {item.title}
        </Text>
        
        <View style={styles.recipeStats}>
          <View style={styles.stat}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statText}>{item.totalTime}m</Text>
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>Loading recipes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
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
      <View style={styles.filterWrapper}>
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
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerTitle: {
    fontSize: 32,
    color: '#000000',
    marginBottom: 4,
    fontFamily: 'Quicksand-Bold',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStatText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  headerStatDivider: {
    marginHorizontal: 8,
    color: '#9CA3AF',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    fontFamily: 'Quicksand-Regular',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Quicksand-Regular',
  },
  clearIcon: {
    fontSize: 16,
    color: '#9CA3AF',
    fontFamily: 'Quicksand-Regular',
  },
  filterWrapper: {
    height: 50,
    marginBottom: 10,
  },
  filterContainer: {
    flexGrow: 0,
  },
  filterContent: {
    paddingLeft: 20,
    paddingRight: 10,
    alignItems: 'center',
    height: 50,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: 6,
    fontFamily: 'Quicksand-Regular',
  },
  filterText: {
    fontSize: 14,
    color: '#1F2937',
    fontFamily: 'Quicksand-Medium',
  },
  filterTextActive: {
    color: 'white',
  },
  sortContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
    position: 'relative',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortIcon: {
    fontSize: 14,
    marginRight: 6,
    fontFamily: 'Quicksand-Regular',
  },
  sortText: {
    fontSize: 13,
    color: '#1F2937',
    fontFamily: 'Quicksand-Regular',
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
    fontFamily: 'Quicksand-Regular',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  sortOptionTextActive: {
    color: '#6B46C1',
    fontFamily: 'Quicksand-SemiBold',
  },
  recipeList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    fontFamily: 'Quicksand-Regular',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favoriteIcon: {
    fontSize: 16,
    fontFamily: 'Quicksand-Regular',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Quicksand-SemiBold',
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
    fontFamily: 'Quicksand-Regular',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Quicksand-Regular',
  },
  cookedCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'Quicksand-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
    fontFamily: 'Quicksand-Regular',
  },
  emptyTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'Quicksand-SemiBold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
});