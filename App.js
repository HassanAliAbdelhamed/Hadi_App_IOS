import React, { useEffect } from 'react';
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
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { I18nManager} from 'react-native';


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
        name="المفضلة"
        component={FavoriteScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) =>
            focused ? (
              <AntDesign name="heart" size={26} color={color} />
            ) : (
              <AntDesign name="hearto" size={26} color={color} />
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
        name="الرئسية"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="headphones" size={28} color={color} />
          ),
        }}
      />

    </Tabs.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }, []);
  const [Fonts] = useFonts({
    Cairo: require('./assets/fonts/Cairo.ttf'),
    Noto: require('./assets/fonts/NotoNast.ttf'),
  });

  if (!Fonts) {
    return null;
  }

  return (
    <AudioProvider>
      {/* SafeAreaView يغطي كل الشاشة بخلفية داكنة */}
      <SafeAreaView style={styles.container}>
        {/* شريط الحالة بخط أبيض فوق خلفية داكنة */}
        <StatusBar barStyle="light-content" backgroundColor="#1b1f23" translucent={false} />

        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen  name="TabBar" component={TabBar} options={{ headerShown: false }} />
            <Stack.Screen name="qarePage" component={QarePage} options={{ headerShown: false }} />
          </Stack.Navigator>
          <MiniPlayer />
        </NavigationContainer>
      </SafeAreaView>
    </AudioProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1b1f23', // نفس لون خلفية التاب بار
  },
});
