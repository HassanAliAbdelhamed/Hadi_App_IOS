import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const DAILY_NOTIFICATION_TIME_KEY = "dailyNotificationTime";
const DAILY_NOTIFICATION_MESSAGE_KEY = "dailyNotificationMessage";
const NOTIFICATION_SETUP_COMPLETE_KEY = "notificationSetupComplete";
const INSTALLATION_ID_KEY = "notificationInstallationId";
const DAILY_REMINDER_NOTIFICATION_ID = "dailyReminderNotification";
const DAILY_REMINDER_CHANNEL_ID = "daily-reminder";
const LOCAL_DAILY_REMINDER_SOURCE = "local-daily-reminder";
const DEFAULT_DAILY_REMINDER_MESSAGE = "حان وقت الإستماع للقرآن الكريم";
const API_BASE_URL = "https://ayaaplus.runasp.net";

export function parseDailyReminderTime(timeValue) {
  if (!timeValue) {
    return null;
  }

  const normalized = String(timeValue).trim();
  const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}

export async function ensureDailyReminderChannel() {
  if (Device.osName !== "Android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_CHANNEL_ID, {
    name: "تذكير اليومي",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function scheduleDailyReminder(
  hour,
  minute,
  message = DEFAULT_DAILY_REMINDER_MESSAGE
) {
  const normalizedHour = Number(hour);
  const normalizedMinute = Number(minute);

  if (
    !Number.isInteger(normalizedHour) ||
    !Number.isInteger(normalizedMinute) ||
    normalizedHour < 0 ||
    normalizedHour > 23 ||
    normalizedMinute < 0 ||
    normalizedMinute > 59
  ) {
    throw new Error("Invalid daily reminder time");
  }

  await requestNotificationPermission();
  await ensureDailyReminderChannel();

  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_NOTIFICATION_ID,
    content: {
      title: "تذكير يومي",
      body: message.trim() || DEFAULT_DAILY_REMINDER_MESSAGE,
      sound: "default",
      data: {
        source: LOCAL_DAILY_REMINDER_SOURCE,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: normalizedHour,
      minute: normalizedMinute,
      channelId: DAILY_REMINDER_CHANNEL_ID,
    },
  });

  return DAILY_REMINDER_NOTIFICATION_ID;
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_NOTIFICATION_ID);
}

export async function rescheduleDailyReminder(hour, minute) {
  const message = await getStoredDailyReminderMessage();
  return scheduleDailyReminder(hour, minute, message);
}

export async function syncDailyReminderSettings() {
  const notificationTime = await getStoredNotificationTime();

  if (!notificationTime) {
    await cancelDailyReminder();
    return false;
  }

  const parsedTime = parseDailyReminderTime(notificationTime);

  if (!parsedTime) {
    await cancelDailyReminder();
    return false;
  }

  try {
    const message = await getStoredDailyReminderMessage();
    await scheduleDailyReminder(parsedTime.hour, parsedTime.minute, message);
    return true;
  } catch (error) {
    console.warn("Failed to sync local daily reminder settings:", error);
    return false;
  }
}

export async function getStoredDailyReminderMessage() {
  const message = await AsyncStorage.getItem(DAILY_NOTIFICATION_MESSAGE_KEY);
  return message || DEFAULT_DAILY_REMINDER_MESSAGE;
}

export async function saveLocalDailyReminderSettings(notificationTime, message) {
  const parsedTime = parseDailyReminderTime(notificationTime);

  if (!parsedTime) {
    throw new Error("Invalid daily reminder time");
  }

  const normalizedTime = `${String(parsedTime.hour).padStart(2, "0")}:${String(
    parsedTime.minute
  ).padStart(2, "0")}:00`;
  const normalizedMessage = String(message || "").trim() || DEFAULT_DAILY_REMINDER_MESSAGE;

  await AsyncStorage.multiSet([
    [DAILY_NOTIFICATION_TIME_KEY, normalizedTime],
    [DAILY_NOTIFICATION_MESSAGE_KEY, normalizedMessage],
  ]);
  await setNotificationSetupComplete(true);
  await scheduleDailyReminder(parsedTime.hour, parsedTime.minute, normalizedMessage);

  return { notificationTime: normalizedTime, message: normalizedMessage };
}

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
  await cancelDailyReminder();
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
  if (!Device.isDevice) {
    throw new Error("Push tokens require a physical device");
  }

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
    await cancelDailyReminder();
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
  if (!notificationTime) {
    await cancelDailyReminder();
  }

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
    await cancelDailyReminder();
    return false;
  }

  const localReminderScheduled = await syncDailyReminderSettings();

  try {
    await registerDeviceNotification(notificationTime);
  } catch (error) {
    console.warn("Daily notification backend registration failed:", error);
  }

  return localReminderScheduled;
}

export function configureNotificationListeners() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const isLocalDailyReminder = (notification) =>
    notification?.request?.content?.data?.source === LOCAL_DAILY_REMINDER_SOURCE;

  const receivedListener = Notifications.addNotificationReceivedListener(async (notification) => {
    if (isLocalDailyReminder(notification)) {
      return;
    }

    try {
      await updateNotifiedAtOnServer();
    } catch (error) {
      console.warn("Failed to sync NotifiedAt after push received:", error);
    }
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(async (notification) => {
    if (isLocalDailyReminder(notification)) {
      return;
    }

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