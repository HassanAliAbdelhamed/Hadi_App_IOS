import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  I18nManager,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AllColors from "../assets/Colors";
import {
  canScheduleExactAlarms,
  clearNotificationTime,
  formatNotificationTimeLabel,
  getPushToken,
  getStoredDailyReminderMessage,
  getStoredNotificationTime,
  openExactAlarmSettings,
  registerDeviceNotification,
  saveLocalDailyReminderSettings,
} from "../service/notificationService";

const CLOCK_SIZE = 280;
const CENTER = CLOCK_SIZE / 2;
const LABEL_SIZE = 40;
const LABEL_RADIUS = 106;
const HAND_LENGTH = LABEL_RADIUS - LABEL_SIZE / 2 + 2;
const NUMBERS = Array.from({ length: 12 }, (_, i) => i);

// Digital time box sizing (hour and minute boxes share the exact same size)
const SEGMENT_WIDTH = 84;
const SEGMENT_HEIGHT = 72;
const DIGIT_FONT_SIZE = 40;

// Rows that must read left-to-right visually (clock digits) even when the app is RTL
const LTR_ROW = I18nManager.isRTL ? "row-reverse" : "row";

const pad = (n) => String(n).padStart(2, "0");

const getHourFromTime = (timeString) => {
  if (!timeString) return 7;
  const [h] = timeString.split(":");
  const parsed = Number(h);
  return Number.isNaN(parsed) ? 7 : parsed;
};

const getMinuteFromTime = (timeString) => {
  if (!timeString) return 0;
  const [, m] = timeString.split(":");
  const parsed = Number(m);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 59 ? parsed : 0;
};

// Position on the clock face for a given angle (degrees, 0 = top, clockwise)
const polar = (deg, radius) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CENTER + Math.sin(rad) * radius,
    y: CENTER - Math.cos(rad) * radius,
  };
};

// A hand that rotates around the clock center.
const Hand = ({ angle, length, thickness, color }) => (
  <View
    pointerEvents="none"
    style={[styles.handContainer, { transform: [{ rotate: `${angle}deg` }] }]}
  >
    <View
      style={{
        position: "absolute",
        left: CENTER - thickness / 2,
        top: CENTER - length,
        width: thickness,
        height: length,
        borderRadius: thickness,
        backgroundColor: color,
      }}
    />
  </View>
);

export default function NotificationSetupScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  // Classic 3-button nav: inset is ~48dp (lifts footer above the buttons).
  // Gesture nav: inset is ~0-24dp (footer stays compact).
  const footerBottomPadding = 16 + insets.bottom;

  const isFromSettings = route?.params?.fromSettings === true;
  const [selectedTime, setSelectedTime] = useState("07:00:00");
  const [mode, setMode] = useState("hour"); // "hour" -> then "minute"
  const [reminderMessage, setReminderMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const hour = useMemo(() => getHourFromTime(selectedTime), [selectedTime]);
  const minute = useMemo(() => getMinuteFromTime(selectedTime), [selectedTime]);
  const isPM = hour >= 12;
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const isMinuteMode = mode === "minute";

  // Refs so the PanResponder (created once) always sees the latest values
  const hourRef = useRef(hour);
  hourRef.current = hour;
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    let active = true;

    if (Platform.OS !== "android") {
      setTokenLoading(false);
      return () => {
        active = false;
      };
    }

    getPushToken()
      .then((token) => {
        if (active) setDeviceToken(token);
      })
      .catch((error) => {
        console.warn("Failed to get notification permission or FCM token:", error);
      })
      .finally(() => {
        if (active) setTokenLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const loadSavedTime = async () => {
      const [savedTime, savedMessage] = await Promise.all([
        getStoredNotificationTime(),
        getStoredDailyReminderMessage(),
      ]);
      if (savedTime) {
        const savedHour = getHourFromTime(savedTime);
        const savedMinute = getMinuteFromTime(savedTime);
        setSelectedTime(`${pad(savedHour)}:${pad(savedMinute)}:00`);
      }
      setReminderMessage(savedMessage);
    };
    loadSavedTime();
  }, []);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Functional updates so these are safe to call from the PanResponder
  const setHourValue = (nextHour) =>
    setSelectedTime((prev) => `${pad(nextHour)}:${pad(getMinuteFromTime(prev))}:00`);

  const setMinuteValue = (nextMinute) =>
    setSelectedTime((prev) => `${pad(getHourFromTime(prev))}:${pad(nextMinute)}:00`);

  const applyTouch = (x, y) => {
    const dx = x - CENTER;
    const dy = y - CENTER;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    if (modeRef.current === "hour") {
      const picked = Math.round(deg / 30) % 12; // 0..11
      setHourValue(picked + (hourRef.current >= 12 ? 12 : 0));
    } else {
      const picked = Math.round(deg / 6) % 60; // 0..59
      setMinuteValue(picked);
    }
  };

  // After the hour is chosen (finger lifted) move on to the minutes
  const handleRelease = () => {
    if (modeRef.current === "hour") {
      setMode("minute");
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) =>
        applyTouch(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) =>
        applyTouch(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderRelease: handleRelease,
      onPanResponderTerminate: handleRelease,
    })
  ).current;

  const togglePeriod = (pm) => {
    if (pm === isPM) return;
    setHourValue(pm ? hour + 12 : hour - 12);
  };

  const handAngle = isMinuteMode ? minute * 6 : (hour % 12) * 30;
  const bubblePos = polar(handAngle, LABEL_RADIUS);
  // In minute mode, a minute that is not a multiple of 5 has no number under the
  // hand, so the bubble shows the exact minute instead.
  const bubbleShowsValue = isMinuteMode && minute % 5 !== 0;

  const currentLabel = useMemo(
    () => (selectedTime ? formatNotificationTimeLabel(selectedTime) : "غير محدد"),
    [selectedTime]
  );

  const nowLabel = useMemo(() => {
    const h = now.getHours();
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${pad(h12)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${h >= 12 ? "م" : "ص"}`;
  }, [now]);

  const finish = () => {
    if (isFromSettings) {
      navigation.goBack();
      return;
    }
    navigation.replace("TabBar");
  };

  const handleSave = async () => {
    setLoading(true);
    let localReminderSaved = false;
    try {
      const localSettings = await saveLocalDailyReminderSettings(
        `${pad(hour)}:${pad(minute)}:00`,
        reminderMessage
      );
      localReminderSaved = true;
      setSelectedTime(localSettings.notificationTime);

      if (Platform.OS === "android") {
        const token = deviceToken || await getPushToken();
        await registerDeviceNotification(localSettings.notificationTime, token);
      }

      const exactAlarmsAllowed = await canScheduleExactAlarms();
      if (!exactAlarmsAllowed) {
        Alert.alert(
          "تفعيل التذكير في الوقت المحدد",
          "ليصلك التذكير يومياً حتى لو كان التطبيق مغلقاً، فعّل إذن المنبهات والتذكيرات لهذا التطبيق.",
          [
            { text: "لاحقاً", style: "cancel", onPress: finish },
            {
              text: "فتح الإعدادات",
              onPress: async () => {
                await openExactAlarmSettings();
                finish();
              },
            },
          ]
        );
        return;
      }

      finish();
    } catch (error) {
      console.warn("Failed to save daily notification time:", error);
      Alert.alert(
        "تنبيه",
        localReminderSaved
          ? "تم حفظ التذكير المحلي، لكن تعذرت مزامنة التسجيل مع الخادم. تحقق من الاتصال وحاول مرة أخرى."
          : "تعذر جدولة التذكير على هذا الجهاز. تحقق من تفعيل إذن الإشعارات ثم حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await clearNotificationTime();
      if (Platform.OS === "android" && deviceToken) {
        await registerDeviceNotification(null, deviceToken);
      }
      finish();
    } catch (error) {
      console.warn("Failed to register device while skipping reminder:", error);
      Alert.alert("تنبيه", "تعذر تسجيل الجهاز. تحقق من الاتصال وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  const tickCount = isMinuteMode ? 60 : 12;
  const tickStep = 360 / tickCount;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {isFromSettings ? "تغيير وقت التذكير اليومي" : "اختر وقت تذكيرك اليومي"}
        </Text>

        <Text style={styles.subtitle}>
          {isFromSettings
            ? "اختر الساعة على الساعة ثم الدقائق لتعديل موعد التذكير اليومي."
            : "اختر الساعة ثم الدقائق التي تريد أن يتذكرك فيها التطبيق يوميًا لتلاوة القرآن."}
        </Text>

        {Platform.OS === "android" && !deviceToken && !tokenLoading && (
          <Text style={styles.permissionStatus}>
            فعّل إذن الإشعارات ثم اضغط حفظ لتسجيل جهازك.
          </Text>
        )}

        {/* Hour / minute display with AM/PM. Tap a box to switch what the clock edits. */}
        <View style={styles.digitalRow}>
          <View style={styles.periodCol} />

          <View style={styles.digitalTime}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("minute")}
              style={[styles.segment, isMinuteMode && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, isMinuteMode && styles.segmentTextActive]}>
                {pad(minute)}
              </Text>
            </TouchableOpacity>

            <View style={styles.separatorWrap}>
              <Text style={styles.timeSeparator}>:</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setMode("hour")}
              style={[styles.segment, !isMinuteMode && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, !isMinuteMode && styles.segmentTextActive]}>
                {pad(hour12)}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.periodCol}>
            <TouchableOpacity
              onPress={() => togglePeriod(false)}
              style={[styles.periodBtn, !isPM && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, !isPM && styles.periodTextActive]}>ص</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => togglePeriod(true)}
              style={[styles.periodBtn, isPM && styles.periodBtnActive]}
            >
              <Text style={[styles.periodText, isPM && styles.periodTextActive]}>م</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.selectedLabel}>
          التذكير: <Text style={styles.selectedTime}>{currentLabel}</Text>
        </Text>

        <View style={styles.messageField}>
          <Text style={styles.messageLabel}>رسالة التذكير</Text>
          <TextInput
            accessibilityLabel="رسالة التذكير اليومي"
            style={styles.messageInput}
            value={reminderMessage}
            onChangeText={setReminderMessage}
            placeholder="اكتب الرسالة التي تريد ظهورها في التذكير"
            placeholderTextColor="#7d8280"
            maxLength={180}
            multiline
            textAlign="right"
            textAlignVertical="top"
          />
        </View>

        {/* Analog clock (hours first, then minutes) */}
        <View style={styles.clockWrap}>
          <View style={styles.clockFace}>
            {Array.from({ length: tickCount }, (_, i) => {
              const isMajor = !isMinuteMode || i % 5 === 0;
              return (
                <View
                  key={`tick-${mode}-${i}`}
                  pointerEvents="none"
                  style={[styles.handContainer, { transform: [{ rotate: `${i * tickStep}deg` }] }]}
                >
                  <View
                    style={{
                      position: "absolute",
                      left: CENTER - (isMajor ? 1.5 : 0.75),
                      top: 6,
                      width: isMajor ? 3 : 1.5,
                      height: isMajor ? 10 : 5,
                      backgroundColor: isMajor ? "#6b706f" : "#444948",
                    }}
                  />
                </View>
              );
            })}

            {/* Numbers: 1..12 for hours, 00..55 for minutes */}
            {NUMBERS.map((i) => {
              const pos = polar(i * 30, LABEL_RADIUS);
              const value = isMinuteMode ? pad(i * 5) : String(i === 0 ? 12 : i);
              const isSelected = isMinuteMode
                ? minute === i * 5
                : (i === 0 ? 12 : i) === hour12;
              return (
                <View
                  key={`num-${mode}-${i}`}
                  pointerEvents="none"
                  style={[
                    styles.numberDot,
                    { left: pos.x - LABEL_SIZE / 2, top: pos.y - LABEL_SIZE / 2 },
                  ]}
                >
                  <Text style={[styles.numberLabel, isSelected && styles.numberLabelSelected]}>
                    {value}
                  </Text>
                </View>
              );
            })}

            <Hand
              angle={handAngle}
              length={HAND_LENGTH}
              thickness={isMinuteMode ? 3 : 5}
              color={AllColors.greenColor}
            />

            {/* Selection bubble at the end of the hand */}
            <View
              pointerEvents="none"
              style={[
                styles.bubble,
                {
                  left: bubblePos.x - LABEL_SIZE / 2,
                  top: bubblePos.y - LABEL_SIZE / 2,
                },
                bubbleShowsValue ? styles.bubbleSolid : styles.bubbleSoft,
              ]}
            >
              {bubbleShowsValue && <Text style={styles.bubbleText}>{pad(minute)}</Text>}
            </View>

            <View pointerEvents="none" style={styles.clockCenter} />

            {/* Touch layer */}
            <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
          </View>

          {/* Border ring drawn on top so it does not shift the clock's coordinate system */}
          <View pointerEvents="none" style={styles.clockRing} />
        </View>

        <Text style={styles.nowText}>الوقت الآن: {nowLabel}</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerBottomPadding }]}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading
              ? "جارٍ الحفظ..."
              : isFromSettings
              ? "حفظ التغيير"
              : "حفظ الوقت"}
          </Text>
        </TouchableOpacity>
        {!isFromSettings && (
          <TouchableOpacity
            style={styles.skipButton}
            activeOpacity={0.8}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>تخطي</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: AllColors.BlackBackgroundColor, direction: "ltr" },
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 16, alignItems: "center" },
  title: { alignSelf: "stretch", writingDirection: "rtl", color: AllColors.whiteColor, fontFamily: "Cairo", fontSize: 26, textAlign: "center", marginBottom: 8 },
  subtitle: { alignSelf: "stretch", writingDirection: "rtl", color: "#b7b9b7", fontFamily: "Cairo", fontSize: 15, lineHeight: 24, textAlign: "center", marginBottom: 14 },

  digitalRow: { flexDirection: LTR_ROW, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 8 },
  digitalTime: { flexDirection: LTR_ROW, alignItems: "center", justifyContent: "center" },

  // Hour and minute boxes: identical fixed size, content centered both ways
  segment: {
    width: SEGMENT_WIDTH,
    height: SEGMENT_HEIGHT,
    backgroundColor: "#1f2223",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: "rgba(118, 166, 141, 0.22)" },
  segmentText: {
    color: "#b7b9b7",
    fontFamily: "Cairo",
    fontSize: DIGIT_FONT_SIZE,
    lineHeight: SEGMENT_HEIGHT,
    height: SEGMENT_HEIGHT,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    fontVariant: ["tabular-nums"],
  },
  segmentTextActive: { color: AllColors.greenColor },

  // Colon sits exactly in the vertical middle of the boxes
  separatorWrap: { height: SEGMENT_HEIGHT, width: 22, alignItems: "center", justifyContent: "center" },
  timeSeparator: {
    color: AllColors.greenColor,
    fontFamily: "Cairo",
    fontSize: 36,
    lineHeight: 40,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: -6,
  },

  periodCol: { width: 56, marginHorizontal: 8 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#2b2f2f", marginVertical: 2, alignItems: "center" },
  periodBtnActive: { backgroundColor: "rgba(118, 166, 141, 0.22)", borderColor: AllColors.greenColor },
  periodText: { color: "#b7b9b7", fontFamily: "Cairo", fontSize: 14 },
  periodTextActive: { color: AllColors.greenColor, fontWeight: "700" },

  stepText: { alignSelf: "stretch", writingDirection: "rtl", color: AllColors.greenColor, fontFamily: "Cairo", fontSize: 14, textAlign: "center", marginBottom: 4 },
  selectedLabel: { alignSelf: "stretch", writingDirection: "rtl", color: "#b7b9b7", fontFamily: "Cairo", fontSize: 13, textAlign: "center" },
  selectedTime: { color: AllColors.greenColor, fontFamily: "Cairo", fontSize: 15 },
  messageField: { alignSelf: "stretch", marginTop: 12, marginBottom: 2 },
  messageLabel: { textAlign: "right", color: AllColors.whiteColor, fontFamily: "Cairo", fontSize: 14, marginBottom: 4 },
  messageInput: {
    minHeight: 64,
    maxHeight: 96,
    borderWidth: 1,
    borderColor: "#303536",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: AllColors.whiteColor,
    backgroundColor: "#1f2223",
    fontFamily: "Cairo",
    fontSize: 14,
    writingDirection: "rtl",
  },

  clockWrap: { alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 12, width: CLOCK_SIZE, height: CLOCK_SIZE },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    backgroundColor: "#171919",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    overflow: "hidden",
  },
  clockRing: {
    position: "absolute",
    left: 0,
    top: 0,
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    borderWidth: 4,
    borderColor: "#2b2f2f",
  },
  handContainer: { position: "absolute", left: 0, top: 0, width: CLOCK_SIZE, height: CLOCK_SIZE },
  clockCenter: {
    position: "absolute",
    left: CENTER - 8,
    top: CENTER - 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AllColors.greenColor,
    borderWidth: 3,
    borderColor: "#171919",
  },
  bubble: {
    position: "absolute",
    width: LABEL_SIZE,
    height: LABEL_SIZE,
    borderRadius: LABEL_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  bubbleSoft: { backgroundColor: AllColors.greenColor, opacity: 0.3 },
  bubbleSolid: { backgroundColor: AllColors.greenColor },
  bubbleText: {
    color: AllColors.blackColor,
    fontFamily: "Cairo",
    fontSize: 14,
    fontWeight: "700",
    includeFontPadding: false,
    textAlign: "center",
  },
  numberDot: { position: "absolute", width: LABEL_SIZE, height: LABEL_SIZE, alignItems: "center", justifyContent: "center" },
  numberLabel: { color: "#dfe7df", fontFamily: "Cairo", fontSize: 15 },
  numberLabelSelected: { color: AllColors.greenColor, fontWeight: "700" },

  nowText: { alignSelf: "stretch", writingDirection: "rtl", color: "#7d8280", fontFamily: "Cairo", fontSize: 13, textAlign: "center" },
  permissionStatus: { color: "#d5b779", fontFamily: "Cairo", fontSize: 13, textAlign: "center", marginBottom: 8 },

  // paddingBottom is applied at runtime: 16 + the system bottom inset
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#171919",
    borderTopWidth: 1,
    borderTopColor: "#262a2a",
  },
  skipButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#272a2a", alignItems: "center" },
  skipButtonText: { color: AllColors.whiteColor, fontFamily: "Cairo", fontSize: 15 },
  saveButton: { flex: 2, paddingVertical: 14, borderRadius: 12, backgroundColor: AllColors.greenColor, alignItems: "center" },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: AllColors.blackColor, fontFamily: "Cairo", fontSize: 15, fontWeight: "700" },
});
