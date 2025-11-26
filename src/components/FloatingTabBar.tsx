import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigationState } from '@react-navigation/native';

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  // Get the current route name from the nested navigator
  const currentRoute = useNavigationState(navState => {
    if (!navState) return null;

    // Get the active tab
    const activeTab = navState.routes[navState.index];

    // If the tab has a nested state (stack navigator), get the active screen
    if (activeTab.state) {
      const nestedState = activeTab.state as any;
      if (nestedState.routes && nestedState.index !== undefined) {
        const activeScreen = nestedState.routes[nestedState.index];
        return activeScreen.name;
      }
    }

    // If no nested state, we're on the initial screen of the stack
    // Map tab names to their initial screen names
    const tabToInitialScreen: Record<string, string> = {
      'HomeTab': 'Home',
      'RecipesTab': 'RecipeBook',
      'ProgressTab': 'Progress',
      'SettingsTab': 'SettingsMain'
    };

    return tabToInitialScreen[activeTab.name] || null;
  });

  // List of screens where tab bar should be visible
  const screensWithTabBar = ['Home', 'RecipeBook', 'Progress', 'SettingsMain'];

  // Hide tab bar if not on one of the main screens
  if (!currentRoute || !screensWithTabBar.includes(currentRoute)) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!event.defaultPrevented) {
              // Always reset to initial screen when tapping a tab
              // This ensures Home tab goes to HomeScreen, not RecipeReviewScreen etc.
              const tabToInitialScreen: Record<string, string> = {
                'HomeTab': 'Home',
                'RecipesTab': 'RecipeBook',
                'ProgressTab': 'Progress',
                'SettingsTab': 'SettingsMain'
              };

              const initialScreen = tabToInitialScreen[route.name];
              if (initialScreen) {
                navigation.navigate(route.name, { screen: initialScreen });
              } else {
                navigation.navigate(route.name);
              }
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tabButtonInner,
                isFocused && styles.tabButtonActive
              ]}>
                {options.tabBarIcon && options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                  size: 24,
                })}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {label as string}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(167, 139, 250, 0.95)', // Semi-transparent light purple
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tabButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 60,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(107, 70, 193, 0.4)',
  },
  tabLabel: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Quicksand-SemiBold',
  },
});
