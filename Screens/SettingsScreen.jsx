import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AllColors from "../assets/Colors";

const FACEBOOK_URL = "";

const openExternalUrl = async (url) => {
  if (!url) return;
  const supported = await Linking.canOpenURL(url);
  if (supported) await Linking.openURL(url);
};

export default function SettingsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={24} color={AllColors.whiteColor} />
        </TouchableOpacity>
        <Text style={styles.title}>الإعدادات</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عام</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("PrivacyPolicy")}
        >
          <MaterialIcons name="privacy-tip" size={24} color={AllColors.greenColor} />
          <Text style={styles.rowText}>سياسة الخصوصية</Text>
          <Ionicons name="chevron-back" size={20} color="#777" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, !FACEBOOK_URL && styles.disabledRow]}
          onPress={() => openExternalUrl(FACEBOOK_URL)}
          disabled={!FACEBOOK_URL}
        >
          <Ionicons name="logo-facebook" size={24} color={AllColors.greenColor} />
          <Text style={styles.rowText}>الدعم</Text>
          <Ionicons name="chevron-back" size={20} color="#777" />
        </TouchableOpacity>
      </View>

      {!FACEBOOK_URL && (
        <Text style={styles.note}>سيتم إضافة صفحة الدعم قريباً</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AllColors.BlackBackgroundColor,
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    color: AllColors.whiteColor,
    fontFamily: "Cairo",
    fontSize: 22,
    textAlign: "center",
    marginRight: 36,
  },
  section: {
    backgroundColor: "#1f2223",
    borderRadius: 14,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: AllColors.greenColor,
    fontFamily: "Cairo",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: "right",
  },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#303536",
    gap: 12,
  },
  disabledRow: {
    opacity: 0.65,
  },
  rowText: {
    flex: 1,
    color: AllColors.whiteColor,
    fontFamily: "Cairo",
    fontSize: 16,
    textAlign: "right",
  },
  note: {
    color: "#888",
    fontFamily: "Cairo",
    fontSize: 12,
    marginTop: 12,
    textAlign: "right",
  },
});
