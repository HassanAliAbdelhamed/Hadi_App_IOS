import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  I18nManager,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AllColors from "../assets/Colors";
import {
  clearNotificationTime,
  formatNotificationTimeLabel,
  getPushToken,
  getStoredNotificationTime,
  registerDeviceNotification,
} from "../service/notificationService";

const CLOCK_SIZE = 280;
const CENTER = CLOCK_SIZE / 2;
const LABEL_SIZE = 40;
const LABEL_RADIUS = 106;
const HOUR_HAND = 85;
const NUMBERS = Array.from({ length: 12 }, (_, i) => i);

// Rows that must read left-to-right visually (clock digits) even when the app is RTL
const LTR_ROW = I18nManager.isRTL ? "row-reverse" : "row";

const pad = (n) => String(n).padStart(2, "0");

// Only the hour matters now; minutes are always 00
const getHourFromTime = (timeString) => {
  if (!timeString) return 7;
  const [h] = timeString.split(":");
  const parsed = Number(h);
  return Number.isNaN(parsed) ? 7 : parsed;
};

// A hand that rotates around the clock center.
const Hand = ({ angle, length, thickness, color, showBubble }) => (
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
    {showBubble && (
      <View
        style={{
          position: "absolute",
          left: CENTER - LABEL_SIZE / 2,
          top: CENTER - length - LABEL_SIZE / 2 + 6,
          width: LABEL_SIZE,
          height: LABEL_SIZE,
          borderRadius: LABEL_SIZE / 2,
          backgroundColor: color,
          opacity: 0.3,
        }}
      />
    )}
  </View>
);

export default function NotificationSetupScreen({ navigation, route }) {
  const isFromSettings = route?.params?.fromSettings === true;
  const [selectedTime, setSelectedTime] = useState("07:00:00");
  const [loading, setLoading] = useState(false);
  const [deviceToken, setDeviceToken] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const hour = useMemo(() => getHourFromTime(selectedTime), [selectedTime]);
  const isPM = hour >= 12;
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  // Ref so the PanResponder always sees the latest value
  const hourRef = useRef(hour);
  hourRef.current = hour;

  useEffect(() => {
    let active = true;

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
      const savedTime = await getStoredNotificationTime();
      if (savedTime) {
        // Normalize: keep only the hour, minutes are always 00
        setSelectedTime(`${pad(getHourFromTime(savedTime))}:00:00`);
      }
    };
    loadSavedTime();
  }, []);

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTime = (nextHour) => {
    setSelectedTime(`${pad(nextHour)}:00:00`);
  };

  const applyTouch = (x, y) => {
    const dx = x - CENTER;
    const dy = y - CENTER;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;

    const picked = Math.round(deg / 30) % 12; // 0..11
    updateTime(picked + (hourRef.current >= 12 ? 12 : 0));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) =>
        applyTouch(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e) =>
        applyTouch(e.nativeEvent.locationX, e.nativeEvent.locationY),
    })
  ).current;

  const togglePeriod = (pm) => {
    if (pm === isPM) return;
    updateTime(pm ? hour + 12 : hour - 12);
  };

  const hourAngle = (hour % 12) * 30;

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
    if (!selectedTime) {
      Alert.alert("تنبيه", "يرجى اختيار وقت للتذكير اليومي.");
      return;
    }

    setLoading(true);
    try {
      const token = deviceToken || (await getPushToken());
      await registerDeviceNotification(selectedTime, token);
      finish();
    } catch (error) {
      console.warn("Failed to save daily notification time:", error);
      Alert.alert(
        "تنبيه",
        "تعذر تسجيل الإشعارات على الخادم. تحقق من الاتصال والسماح بالإشعارات ثم حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      if (deviceToken) {
        await registerDeviceNotification(null, deviceToken);
      } else {
        await clearNotificationTime();
      }
      finish();
    } catch (error) {
      console.warn("Failed to register device while skipping reminder:", error);
      Alert.alert("تنبيه", "تعذر تسجيل الجهاز. تحقق من الاتصال وحاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isFromSettings ? "تغيير وقت التذكير اليومي" : "اختر وقت تذكيرك اليومي"}
        </Text>

        <Text style={styles.subtitle}>
          {isFromSettings
            ? "حرّك العقرب لتعديل الساعة التي تود تلقي التذكير فيها كل يوم."
            : "حرّك العقرب لاختيار الساعة التي تريد أن يتذكرك فيها التطبيق كل يوم لتلاوة القرآن."}
        </Text>

        {!deviceToken && !tokenLoading && (
          <Text style={styles.permissionStatus}>
            فعّل إذن الإشعارات ثم اضغط حفظ لتسجيل جهازك.
          </Text>
        )}

        {/* Digital display: hour only + AM/PM */}
        <View style={styles.digitalRow}>
          <View style={styles.periodCol} />

          <View style={styles.digitalTime}>
            <View style={[styles.segment, styles.segmentActive]}>
              <Text style={[styles.segmentText, styles.segmentTextActive]}>
                {pad(hour12)}
              </Text>
            </View>
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

        {/* Analog clock */}
        <View style={styles.clockWrap}>
          <View style={styles.clockFace}>
            {/* Hour tick marks */}
            {Array.from({ length: 12 }, (_, i) => (
              <View
                key={`tick-${i}`}
                pointerEvents="none"
                style={[styles.handContainer, { transform: [{ rotate: `${i * 30}deg` }] }]}
              >
                <View
                  style={{
                    position: "absolute",
                    left: CENTER - 1.5,
                    top: 6,
                    width: 3,
                    height: 10,
                    backgroundColor: "#6b706f",
                  }}
                />
              </View>
            ))}

            {/* Hour numbers */}
            {NUMBERS.map((i) => {
              const angle = (i * 30 - 90) * (Math.PI / 180);
              const x = CENTER + Math.cos(angle) * LABEL_RADIUS - LABEL_SIZE / 2;
              const y = CENTER + Math.sin(angle) * LABEL_RADIUS - LABEL_SIZE / 2;
              const value = i === 0 ? 12 : i;
              const isSelected = value === hour12;
              return (
                <View
                  key={`num-${i}`}
                  pointerEvents="none"
                  style={[styles.numberDot, { left: x, top: y }]}
                >
                  <Text style={[styles.numberLabel, isSelected && styles.numberLabelSelected]}>
                    {value}
                  </Text>
                </View>
              );
            })}

            <Hand
              angle={hourAngle}
              length={HOUR_HAND}
              thickness={5}
              color={AllColors.greenColor}
              showBubble
            />
            <View pointerEvents="none" style={styles.clockCenter} />

            {/* Touch layer */}
            <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers} />
          </View>
        </View>

        <Text style={styles.nowText}>الوقت الآن: {nowLabel}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={loading || tokenLoading}
        >
          <Text style={styles.saveButtonText}>
            {tokenLoading
              ? "جارٍ طلب الإذن..."
              : loading
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
            disabled={loading || tokenLoading}
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
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30, paddingBottom: 16, alignItems: "center" },
  title: { alignSelf: "stretch", writingDirection: "rtl", color: AllColors.whiteColor, fontFamily: "Cairo", fontSize: 26, textAlign: "center", marginBottom: 8 },
  subtitle: { alignSelf: "stretch", writingDirection: "rtl", color: "#b7b9b7", fontFamily: "Cairo", fontSize: 15, lineHeight: 24, textAlign: "center", marginBottom: 14 },

  digitalRow: { flexDirection: LTR_ROW, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 6 },
  digitalTime: { flexDirection: LTR_ROW, alignItems: "center" },
  segment: { backgroundColor: "#1f2223", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, minWidth: 76, alignItems: "center" },
  segmentActive: { backgroundColor: "rgba(118, 166, 141, 0.22)" },
  segmentText: { color: "#b7b9b7", fontFamily: "Cairo", fontSize: 40 },
  segmentTextActive: { color: AllColors.greenColor },
  periodCol: { width: 56, marginHorizontal: 8 },
  periodBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: "#2b2f2f", marginVertical: 2, alignItems: "center" },
  periodBtnActive: { backgroundColor: "rgba(118, 166, 141, 0.22)", borderColor: AllColors.greenColor },
  periodText: { color: "#b7b9b7", fontFamily: "Cairo", fontSize: 14 },
  periodTextActive: { color: AllColors.greenColor, fontWeight: "700" },

  selectedLabel: { alignSelf: "stretch", writingDirection: "rtl", color: "#b7b9b7", fontFamily: "Cairo", fontSize: 13, textAlign: "center" },
  selectedTime: { color: AllColors.greenColor, fontFamily: "Cairo", fontSize: 15 },

  clockWrap: { alignSelf: "center", alignItems: "center", justifyContent: "center", marginTop: 16, marginBottom: 12 },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    borderWidth: 4,
    borderColor: "#2b2f2f",
    backgroundColor: "#171919",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    overflow: "hidden",
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
  numberDot: { position: "absolute", width: LABEL_SIZE, height: LABEL_SIZE, alignItems: "center", justifyContent: "center" },
  numberLabel: { color: "#dfe7df", fontFamily: "Cairo", fontSize: 15 },
  numberLabelSelected: { color: AllColors.greenColor, fontWeight: "700" },

  nowText: { alignSelf: "stretch", writingDirection: "rtl", color: "#7d8280", fontFamily: "Cairo", fontSize: 13, textAlign: "center" },
  permissionStatus: { color: "#d5b779", fontFamily: "Cairo", fontSize: 13, textAlign: "center", marginBottom: 8 },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
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