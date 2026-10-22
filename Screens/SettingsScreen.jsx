import React, { useCallback, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import AllColors from "../assets/Colors";
import { formatNotificationTimeLabel, getStoredNotificationTime } from "../service/notificationService";

const openExternalUrl = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("خطأ", "لا يمكن فتح الرابط");
    }
  } catch {
    Alert.alert("خطأ", "حدث خطأ أثناء فتح الرابط");
  }
};

const SettingRow = ({
  icon,
  iconType = "ionicons",
  title,
  subtitle,
  onPress,
  showArrow = true,
}) => {
  const IconComponent =
    iconType === "material" ? MaterialIcons : Ionicons;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <IconComponent
          name={icon}
          size={22}
          color={AllColors.greenColor}
        />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowText}>{title}</Text>

        {subtitle && (
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        )}
      </View>

      {showArrow && (
        <Ionicons
          name="chevron-back"
          size={20}
          color="#777"
        />
      )}
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notificationTime, setNotificationTime] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadNotificationTime = async () => {
        const savedTime = await getStoredNotificationTime();
        if (active) setNotificationTime(savedTime || null);
      };

      loadNotificationTime();
      return () => {
        active = false;
      };
    }, [])
  );

  const appVersion =
    Constants.expoConfig?.version || "1.0.0";

  const shareApp = async () => {
    // يمكن استبدال الرابط برابط التطبيق على Google Play
    const appUrl =
      "https://play.google.com/store/apps/details?id=com.hassanali2.quranplus";

    const message = `أنصحك بتجربة تطبيق هَدْي:\n${appUrl}`;

    try {
      await Linking.openURL(
        `whatsapp://send?text=${encodeURIComponent(message)}`
      );
    } catch {
      Alert.alert(
        "مشاركة التطبيق",
        "يمكنك مشاركة رابط التطبيق من خلال الرابط الموجود في متجر Google Play."
      );
    }
  };

  const rateApp = async () => {
    const playStoreUrl =
      "https://play.google.com/store/apps/details?id=com.hassanali2.quranplus";

    await openExternalUrl(playStoreUrl);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color={AllColors.whiteColor}
          />
        </TouchableOpacity>

        <Text style={styles.title}>الإعدادات</Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* التطبيق */}
      <Text style={styles.sectionTitle}>التطبيق</Text>

      <View style={styles.section}>
        
        <SettingRow
          icon="alarm-outline"
          title="وقت التذكير اليومي"
          subtitle={
            notificationTime
              ? formatNotificationTimeLabel(notificationTime)
              : "غير محدد"
          }
          onPress={() => navigation.navigate("NotificationSetup", { fromSettings: true })}
        />

        <SettingRow
          icon="share-social-outline"
          title="مشاركة التطبيق"
          subtitle="شارك التطبيق مع أصدقائك"
          onPress={shareApp}
        />

        <SettingRow
          icon="star-outline"
          title="تقييم التطبيق"
          subtitle="ساعدنا بتقييم التطبيق على Google Play"
          onPress={rateApp}
        />

        <SettingRow
          icon="information-circle-outline"
          title="عن التطبيق"
          subtitle={`الإصدار ${appVersion}`}
        />

      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          هَدْي
        </Text>

        <Text style={styles.footerVersion}>
          الإصدار {appVersion}
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    direction: "rtl",
    backgroundColor: AllColors.BlackBackgroundColor,
    paddingHorizontal: 16,
    paddingTop: 30,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    flex: 1,
    color: AllColors.whiteColor,
    fontFamily: "Cairo",
    fontSize: 22,
    textAlign: "center",
  },

  headerSpacer: {
    width: 40,
  },

  /* Sections */
  sectionTitle: {
    color: AllColors.greenColor,
    fontFamily: "Cairo",
    fontSize: 14,
    textAlign: "right",
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 6,
  },

  section: {
    backgroundColor: "#1f2223",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 18,
  },

  /* Rows */
  row: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#303536",
  },

  rowContent: {
    flex: 1,
    alignItems: "flex-end",
    marginStart: 12,
  },

  rowText: {
    color: AllColors.whiteColor,
    fontFamily: "Cairo",
    fontSize: 16,
    textAlign: "right",
  },

  rowSubtitle: {
    color: "#85898a",
    fontFamily: "Cairo",
    fontSize: 11,
    marginTop: 2,
    textAlign: "right",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(118, 166, 141, 0.10)",
    justifyContent: "center",
    alignItems: "center",
  },

  /* Footer */
  footer: {
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 24,
  },

  footerText: {
    color: "#777",
    fontFamily: "Cairo",
    fontSize: 13,
  },

  footerVersion: {
    color: "#555",
    fontFamily: "Cairo",
    fontSize: 11,
    marginTop: 2,
  },
});
