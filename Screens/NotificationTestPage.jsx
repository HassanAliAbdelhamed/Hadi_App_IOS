import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AllColors from '../assets/Colors';

export default function NotificationTestPage({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = async () => {
    setLoading(true);
    setError('');
    setToken('');

    try {
      if (!Device.isDevice) {
        throw new Error('Use a physical Android device to get a push token.');
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        throw new Error('Notification permission was not granted');
      }

      const deviceToken = await Notifications.getDevicePushTokenAsync();
      const pushToken = deviceToken?.data;

      if (!pushToken) {
        throw new Error('Device push token not returned');
      }

      setToken(pushToken);
    } catch (registrationError) {
      const message =
        registrationError instanceof Error
          ? registrationError.message
          : String(registrationError);

      setError(message);
      console.error('Device token fetch failed:', registrationError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notification Test</Text>
      <Text style={styles.description}>
        This page fetches the real device token used by Firebase/FCM, not the Expo token.
      </Text>

      {loading ? (
        <View style={styles.messageRow}>
          <ActivityIndicator color={AllColors.greenColor} />
          <Text style={styles.message}>Getting device token...</Text>
        </View>
      ) : token ? (
        <View style={styles.result}>
          <Text style={styles.successTitle}>Device token</Text>
          <Text selectable style={styles.token}>{token}</Text>
        </View>
      ) : (
        <View style={styles.result}>
          <Text style={styles.errorTitle}>Could not get token</Text>
          <Text selectable style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          if (token) {
            Alert.alert('Token', token);
            return;
          }
          fetchToken();
        }}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{token ? 'Show token' : 'Try again'}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={[styles.button, styles.backButton]}
      >
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#141515',
  },
  title: {
    color: '#F4F4F0',
    fontSize: 24,
    fontWeight: '700',
  },
  description: {
    color: '#B9C0BB',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  message: {
    color: '#D8DDD9',
    fontSize: 15,
  },
  result: {
    borderLeftWidth: 3,
    borderLeftColor: AllColors.greenColor,
    paddingLeft: 14,
    marginBottom: 20,
  },
  successTitle: {
    color: '#9CC5AD',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  token: {
    color: '#F4F4F0',
    fontSize: 14,
    lineHeight: 21,
  },
  errorTitle: {
    color: '#F0A49B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    color: '#F4F4F0',
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: AllColors.greenColor,
    borderRadius: 8,
  },
  backButton: {
    backgroundColor: '#3b4240',
    marginTop: 8,
  },
  buttonText: {
    color: '#141515',
    fontSize: 15,
    fontWeight: '600',
  },
});
