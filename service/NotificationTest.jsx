import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function NotificationTest() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("NotificationTest component mounted");
    registerForPushNotifications();
  }, []);

  async function registerForPushNotifications() {
    setLoading(true);
    setError("");
    setToken("");

    try {
      if (!Device.isDevice) {
        throw new Error("Use a physical Android device to get an FCM token.");
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();

        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        throw new Error("Notification permission was denied.");
      }

      const deviceToken = await Notifications.getDevicePushTokenAsync();

      setToken(deviceToken.data);
      console.log("FCM TOKEN:", deviceToken.data);
    } catch (registrationError) {
      const message =
        registrationError instanceof Error
          ? registrationError.message
          : String(registrationError);

      setError(message);
      console.error("FCM token registration failed:", registrationError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FCM token test</Text>
      <Text style={styles.description}>
        Register this device and copy its token for your backend.
      </Text>

      {loading ? (
        <View style={styles.messageRow}>
          <ActivityIndicator color="#76A68D" />
          <Text style={styles.message}>Requesting device token...</Text>
        </View>
      ) : token ? (
        <View style={styles.result}>
          <Text style={styles.successTitle}>FCM token</Text>
          <Text selectable style={styles.token}>
            {token}
          </Text>
        </View>
      ) : (
        <View style={styles.result}>
          <Text style={styles.errorTitle}>Could not get FCM token</Text>
          <Text selectable style={styles.errorMessage}>{error}</Text>
        </View>
      )}

      {!loading && (
        <Pressable
          accessibilityRole="button"
          onPress={registerForPushNotifications}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#141515",
  },
  title: {
    color: "#F4F4F0",
    fontSize: 24,
    fontWeight: "700",
  },
  description: {
    color: "#B9C0BB",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 24,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  message: {
    color: "#D8DDD9",
    fontSize: 15,
  },
  result: {
    borderLeftWidth: 3,
    borderLeftColor: "#76A68D",
    paddingLeft: 14,
  },
  successTitle: {
    color: "#9CC5AD",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  token: {
    color: "#F4F4F0",
    fontSize: 14,
    lineHeight: 21,
  },
  errorTitle: {
    color: "#F0A49B",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorMessage: {
    color: "#F4F4F0",
    fontSize: 14,
    lineHeight: 21,
  },
  button: {
    alignSelf: "flex-start",
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#76A68D",
    borderRadius: 6,
  },
  buttonText: {
    color: "#141515",
    fontSize: 15,
    fontWeight: "600",
  },
});