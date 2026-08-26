// IMPORTANT: react-native-reanimated must be the very first import in App.js
import 'react-native-reanimated';

import React, { useEffect, useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Screens/HomePage';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import QarePage from './Bracsh Screens/qarePage';
import { useFonts } from 'expo-font';
import RadioScreen from './Screens/radioScreen';
import FavoriteScreen from './Screens/FavoriteScreen';
import { AudioProvider } from './Components/audioContext';
import MiniPlayer from './Components/MiniPlayer';
import ErrorBoundary from './Components/ErrorBoundary';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Maintain the splash screen visible while we fetch resources
// Wrapped in try/catch because in bare React Native CLI this can fail
// if the native module isn't ready yet
try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    console.log('Splash screen already hidden or not available');
  });
} catch (e) {
  console.log('SplashScreen native module not available:', e.message);
}

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabBar() {
  return (
    <Tabs.Navigator
      initialRouteName="الرئسية"
      screenOptions={{
        tabBarActiveTintColor: '#639c6d',
        headerPressColor: '#000',
        tabBarStyle: {
          borderColor: 'transparent',
          borderWidth: 1,
          borderRadius: 2,
          backgroundColor: '#1b1f23',
        },
      }}
    >

      <Tabs.Screen
        name="الرئسية"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="headphones" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="الإزاعة"
        component={RadioScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="radio" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="المفضلة"
        component={FavoriteScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <AntDesign name="heart" size={26} color={color} />
            ) : (
              <AntDesign name="heart" size={26} color={color} />
            ),
        }}
      />


    </Tabs.Navigator>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const splashHidden = React.useRef(false);

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Cairo: require('./assets/fonts/Cairo.ttf'),
    Noto: require('./assets/fonts/NotoNast.ttf'),
  });

  // Handle hiding splash screen
  const hideSplash = useCallback(async () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    try {
      console.log('Hiding splash screen');
      await SplashScreen.hideAsync();
      console.log('Splash screen hidden');
    } catch (e) {
      // This is expected to fail in some bare CLI configurations — safe to ignore
      console.log('SplashScreen.hideAsync not available:', e.message);
    }
    // Always mark app as ready, even if hideAsync() threw
    setAppReady(true);
  }, []);

  // Hide splash when fonts are loaded or if there's an error
  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('Fonts ready - Loaded:', fontsLoaded, 'Error:', fontError);
      hideSplash();
    }
  }, [fontsLoaded, fontError, hideSplash]);

  // Fallback timeout to force show app after 3 seconds regardless
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log('Timeout reached, forcing app to show');
      hideSplash();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [hideSplash]);

  if (!appReady) {
    return null;
  }

  return (
        <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#1b1f23"
          translucent={false}
        />

        <AudioProvider>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen
                name="TabBar"
                component={TabBar}
                options={{ headerShown: false }}
              />

              <Stack.Screen
                name="qarePage"
                component={QarePage}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>

            <MiniPlayer />
          </NavigationContainer>
        </AudioProvider>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1f23',
  },
});
