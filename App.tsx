import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { UserProvider } from './src/context/UserContext';
import { RecipeProvider } from './src/context/RecipeContext';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator } from 'react-native';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Quicksand-Regular': require('./assets/fonts/Quicksand-Regular.ttf'),
          'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
          'Quicksand-Light': require('./assets/fonts/Quicksand-Light.ttf'),
          'Quicksand-Medium': require('./assets/fonts/Quicksand-Medium.ttf'),
          'Quicksand-SemiBold': require('./assets/fonts/Quicksand-SemiBold.ttf'),
        });
        
        setFontsLoaded(true);
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontsLoaded(true); // Still continue even if fonts fail
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4F46E5' }}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <UserProvider>
      <RecipeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </RecipeProvider>
    </UserProvider>
  );
}