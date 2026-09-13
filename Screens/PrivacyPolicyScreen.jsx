import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AllColors from "../assets/Colors";

const PRIVACY_POLICY_URL = "";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  const openPolicy = async () => {
    if (!PRIVACY_POLICY_URL) return;
    if (await Linking.canOpenURL(PRIVACY_POLICY_URL)) {
      await Linking.openURL(PRIVACY_POLICY_URL);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={24} color={AllColors.whiteColor} />
        </TouchableOpacity>
        <Text style={styles.title}>سياسة الخصوصية</Text>
      </View>
      <Text style={styles.message}>
        سيتم نشر سياسة الخصوصية هنا عند إضافة الرابط الرسمي للتطبيق.
      </Text>
      {!!PRIVACY_POLICY_URL && (
        <TouchableOpacity style={styles.button} onPress={openPolicy}>
          <Text style={styles.buttonText}>فتح سياسة الخصوصية</Text>
        </TouchableOpacity>
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
  backButton: { padding: 8 },
  title: {
    flex: 1,
    color: AllColors.whiteColor,
    fontFamily: "Cairo",
    fontSize: 22,
    textAlign: "center",
    marginRight: 36,
  },
  message: {
    color: "#c7caca",
    fontFamily: "Cairo",
    fontSize: 16,
    lineHeight: 28,
    textAlign: "right",
  },
  button: {
    alignSelf: "flex-end",
    backgroundColor: AllColors.greenColor,
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  buttonText: { color: "white", fontFamily: "Cairo" },
});
