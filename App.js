import 'react-native-reanimated';

import React, { useEffect, useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './Screens/HomePage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QarePage from './Bracsh Screens/qarePage';
import { useFonts } from 'expo-font';
import RadioScreen from './Screens/radioScreen';
import { AudioProvider } from './Components/audioContext';
import MiniPlayer from './Components/MiniPlayer';
import ErrorBoundary from './Components/ErrorBoundary';
import { Linking, Platform, StatusBar, SafeAreaView, StyleSheet, View, I18nManager } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import QuraaScreen from './Screens/QuraaScreen';
import FortuneWheelIcon from './Components/NavbarIcons/FortuneWheelIcon';
import AllColors from './assets/Colors';
import QariSpinnerScreen from './Screens/QareSpinnerScreen';
import SettingsScreen from './Screens/SettingsScreen';
import PrivacyPolicyScreen from './Screens/PrivacyPolicyScreen';
import NotificationSetupScreen from './Screens/NotificationSetupScreen';
import NotificationTestPage from './Screens/NotificationTestPage';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureNotificationListeners, registerExistingNotificationIfEnabled } from './service/notificationService';
import * as Application from 'expo-application';
import ForceUpdateScreen from './Components/ForceUpdateScreen';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.hassanali2.quranplus';

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
  const insets = useSafeAreaInsets();

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
          height: 65 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
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
        // component={NotificationTest}
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
  const [initialRoute, setInitialRoute] = useState('loading');
  const [updateRequired, setUpdateRequired] = useState(false);
  const splashHidden = React.useRef(false);

  const retryRequiredUpdate = async () => {
    try {
      const { default: SpInAppUpdates, IAUUpdateKind } = require('sp-react-native-in-app-updates');
      const inAppUpdates = new SpInAppUpdates();
      await inAppUpdates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
    } catch (error) {
      console.warn('Failed to start the required Google Play update:', error);
    }
  };

  const openPlayStore = async () => {
    try {
      await Linking.openURL(PLAY_STORE_URL);
    } catch (error) {
      console.warn('Failed to open the Google Play listing:', error);
    }
  };

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrapApp = async () => {
      try {
        if (Platform.OS === 'android') {
          try {
            const { default: SpInAppUpdates, IAUUpdateKind } = require('sp-react-native-in-app-updates');
            const inAppUpdates = new SpInAppUpdates();
            const currentVersionCode = String(
              Application.nativeBuildVersion ?? Application.nativeApplicationVersion ?? '1'
            );
            const update = await inAppUpdates.checkNeedsUpdate({ curVersion: currentVersionCode });

            if (update.shouldUpdate) {
              if (active) setUpdateRequired(true);
              try {
                await inAppUpdates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
              } catch (error) {
                console.warn('Required Google Play update was not completed:', error);
              }
              return;
            }
          } catch (error) {
            console.warn('Could not check Google Play for app updates:', error);
          }
        }

        // const setupDone = await AsyncStorage.getItem('notificationSetupComplete');
        const setupDone = await AsyncStorage.getItem('notificationSetupComplete');

        if (active) {
          if (setupDone === 'true') {
            await registerExistingNotificationIfEnabled();
            setInitialRoute('TabBar');
            return;
          }

          setInitialRoute('NotificationSetup');
        }
      } catch (error) {
        console.warn('Failed to bootstrap notification setup:', error);
        if (active) {
          setInitialRoute('NotificationSetup');
        }
      }
    };

    bootstrapApp();

    const unsubscribe = configureNotificationListeners();

    return () => {
      active = false;
      unsubscribe();
    };
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

  if (updateRequired) {
    return <ForceUpdateScreen onRetry={retryRequiredUpdate} onOpenStore={openPlayStore} />;
  }

  if (!appReady || initialRoute === 'loading') {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SafeAreaView style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor="#1b1f23"
            translucent={false}
          />

          <AudioProvider>
            <NavigationContainer>
              <Stack.Navigator initialRouteName={initialRoute === 'loading' ? 'NotificationSetup' : initialRoute}>
                <Stack.Screen
                  name="NotificationSetup"
                  component={NotificationSetupScreen}
                  options={{ headerShown: false }}
                />

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

                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="NotificationTestPage"
                  component={NotificationTestPage}
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="PrivacyPolicy"
                  component={PrivacyPolicyScreen}
                  options={{ headerShown: false }}
                />
              </Stack.Navigator>

              <MiniPlayer />
            </NavigationContainer>
          </AudioProvider>
        </SafeAreaView>
      </ErrorBoundary>
    </SafeAreaProvider>
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