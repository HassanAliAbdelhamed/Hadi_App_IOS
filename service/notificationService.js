import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const DAILY_NOTIFICATION_TIME_KEY = "dailyNotificationTime";
const NOTIFICATION_SETUP_COMPLETE_KEY = "notificationSetupComplete";
const INSTALLATION_ID_KEY = "notificationInstallationId";
const API_BASE_URL = "https://ayaaplus.runasp.net";

export function getNotificationTimeOptions() {
  const options = [];

  for (let hour = 0; hour < 24; hour += 1) {
    [0, 30].forEach((minute) => {
      const paddedHour = String(hour).padStart(2, "0");
      const paddedMinute = String(minute).padStart(2, "0");
      const value = `${paddedHour}:${paddedMinute}:00`;
      const label = new Date(`2000-01-01T${value}`).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      options.push({ value, label });
    });
  }

  return options;
}

export function formatNotificationTimeLabel(timeValue) {
  if (!timeValue) {
    return "غير محدد";
  }

  try {
    const normalized = timeValue.includes(":") && timeValue.split(":").length === 2
      ? `${timeValue}:00`
      : timeValue;

    return new Date(`2000-01-01T${normalized}`).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return timeValue;
  }
}

export async function getStoredNotificationTime() {
  return AsyncStorage.getItem(DAILY_NOTIFICATION_TIME_KEY);
}

export async function setNotificationSetupComplete(isComplete) {
  await AsyncStorage.setItem(
    NOTIFICATION_SETUP_COMPLETE_KEY,
    isComplete ? "true" : "false"
  );
}

export async function clearNotificationTime() {
  await AsyncStorage.removeItem(DAILY_NOTIFICATION_TIME_KEY);
  await setNotificationSetupComplete(true);
}

export async function getOrCreateInstallationId() {
  let installationId = await AsyncStorage.getItem(INSTALLATION_ID_KEY);

  if (!installationId) {
    const deviceName = Device.modelName || Device.osName || "android";
    installationId = `${deviceName}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}`;
    await AsyncStorage.setItem(INSTALLATION_ID_KEY, installationId);
  }

  return installationId;
}

export async function requestNotificationPermission() {
  if (!Device.isDevice) {
    throw new Error("Notifications require a physical device");
  }

  if (Device.osName === "Android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Daily reminders",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    throw new Error("Notification permission was not granted");
  }

  return true;
}

export async function getPushToken() {
  await requestNotificationPermission();

  const result = await Notifications.getDevicePushTokenAsync();
  const token = result?.data;

  if (!token) {
    throw new Error("Failed to create device push token for this device");
  }

  return token;
}

export async function registerDeviceNotification(notificationTime, deviceToken) {
  if (!notificationTime && !deviceToken) {
    await AsyncStorage.setItem(DAILY_NOTIFICATION_TIME_KEY, "");
    await setNotificationSetupComplete(true);
    return { skipped: true };
  }

  const installationId = await getOrCreateInstallationId();
  const token = deviceToken || await getPushToken();
  const timeZoneId = Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Cairo";
  const body = {
    installationId,
    fcmToken: token,
    notificationTime: notificationTime || null,
    timeZoneId,
    notifiedAt: null,
  };

  const response = await fetch(`${API_BASE_URL}/api/Notification/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to register device for daily notifications");
  }

  await AsyncStorage.setItem(DAILY_NOTIFICATION_TIME_KEY, notificationTime || "");
  await setNotificationSetupComplete(true);

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : { registered: true };
}

export async function updateNotifiedAtOnServer() {
  const installationId = await getOrCreateInstallationId();
  const notifiedAt = new Date().toISOString();

  const response = await fetch(
    `${API_BASE_URL}/api/Notification/update-notified-at?installationId=${encodeURIComponent(
      installationId
    )}&notifiedAt=${encodeURIComponent(notifiedAt)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to update notifiedAt");
  }

  return response.json();
}

export async function registerExistingNotificationIfEnabled() {
  const notificationTime = await getStoredNotificationTime();

  if (!notificationTime) {
    return false;
  }

  try {
    await registerDeviceNotification(notificationTime);
    return true;
  } catch (error) {
    console.warn("Daily notification registration failed:", error);
    return false;
  }
}

export function configureNotificationListeners() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const receivedListener = Notifications.addNotificationReceivedListener(async () => {
    try {
      await updateNotifiedAtOnServer();
    } catch (error) {
      console.warn("Failed to sync NotifiedAt after push received:", error);
    }
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(async () => {
    try {
      await updateNotifiedAtOnServer();
    } catch (error) {
      console.warn("Failed to sync NotifiedAt after notification response:", error);
    }
  });

  return () => {
    receivedListener.remove();
    responseListener.remove();
  };
}