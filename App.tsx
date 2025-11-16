import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';
import { UserProvider } from './src/context/UserContext';
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
          'VendSans-Regular': require('./assets/fonts/VendSans-Regular.ttf'),
          'VendSans-Bold': require('./assets/fonts/VendSans-Bold.ttf'),
          'VendSans-BoldItalic': require('./assets/fonts/VendSans-BoldItalic.ttf'),
          'VendSans-Italic': require('./assets/fonts/VendSans-Italic.ttf'),
          'VendSans-Light': require('./assets/fonts/VendSans-Light.ttf'),
          'VendSans-LightItalic': require('./assets/fonts/VendSans-LightItalic.ttf'),
          'VendSans-Medium': require('./assets/fonts/VendSans-Medium.ttf'),
          'VendSans-MediumItalic': require('./assets/fonts/VendSans-MediumItalic.ttf'),
          'VendSans-SemiBold': require('./assets/fonts/VendSans-SemiBold.ttf'),
          'VendSans-SemiBoldItalic': require('./assets/fonts/VendSans-SemiBoldItalic.ttf'),
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

  // After fonts are loaded, before returning the app
const originalTextRender = (Text as any).prototype.render;
(Text as any).prototype.render = function(...args: any) {
  const props = { ...this.props };
  if (props.style) {
    props.style = [{ fontFamily: 'VendSans-Regular' }, props.style];
  } else {
    props.style = { fontFamily: 'VendSans-Regular' };
  }
  this.props = props;
  return originalTextRender.call(this, ...args);
};

  return (
    <UserProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}