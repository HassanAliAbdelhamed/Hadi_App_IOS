// IMPORTANT: react-native-reanimated must be the very first import in App.js
import 'react-native-reanimated';

import React, { useEffect, useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Screens/HomePage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import QarePage from './Bracsh Screens/qarePage';
import { useFonts } from 'expo-font';
import RadioScreen from './Screens/radioScreen';
import FavoriteScreen from './Screens/FavoriteScreen';
import { AudioProvider } from './Components/audioContext';
import MiniPlayer from './Components/MiniPlayer';
import ErrorBoundary from './Components/ErrorBoundary';
import { StatusBar, SafeAreaView, StyleSheet, View, Platform, I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import QuraaScreen from './Screens/QuraaScreen';
import RandomPickerScreen from './Screens/RandomPickerScreen';
import FortuneWheelIcon from './Components/NavbarIcons/FortuneWheelIcon';
import AllColors from './assets/Colors';
import QariSpinnerScreen from './Screens/QareSpinnerScreen';

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
        tabBarActiveTintColor: '#76A68D',
        headerPressColor: '#000',
        tabBarStyle: {
          borderColor: 'transparent',
          borderWidth: 1,
          backgroundColor: '#0d0d0d',
          height: 65,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="الرئسية"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MaterialCommunityIcons name="home" size={26} color={color} />
            ) : (
              <MaterialCommunityIcons name="home-outline" size={26} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="القرآء"
        component={QuraaScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <MaterialCommunityIcons name="microphone" size={26} color={color} />
            ) : (
              <MaterialCommunityIcons name="microphone-outline" size={26} color={color} />
            ),
        }}
      />

      <Tabs.Screen
        name="عجلة الحظ"
        component={QariSpinnerScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.customWheelButton, focused && styles.activeWheelButton]}>
              <FortuneWheelIcon focused={focused} />
            </View>
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

      {/* <Tabs.Screen
        name="المفضلة"
        component={FavoriteScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <FontAwesome name="heart" size={26} color={color} />
            ) : (
              <FontAwesome name="heart-o" size={26} color={color} />
            ),
        }}
      /> */}
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

  const hideSplash = useCallback(async () => {
    if (splashHidden.current) return;
    splashHidden.current = true;
    try {
      console.log('Hiding splash screen');
      await SplashScreen.hideAsync();
      console.log('Splash screen hidden');
    } catch (e) {
      console.log('SplashScreen.hideAsync not available:', e.message);
    }
    setAppReady(true);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('Fonts ready - Loaded:', fontsLoaded, 'Error:', fontError);
      hideSplash();
    }
  }, [fontsLoaded, fontError, hideSplash]);

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
  customWheelButton: {
    width: 45,
    height: 4,
    borderRadius: 30,
    backgroundColor: '#1e242b',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  activeWheelButton: {
    backgroundColor: AllColors.greenColor,
  },
});