import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ForceUpdateScreen({ onRetry, onOpenStore }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="cellphone-arrow-down" size={48} color={styles.icon.color} />
        <Text style={styles.title}>مطلوب تحديث التطبيق</Text>
        <Text style={styles.description}>
          لازم تثبّت أحدث إصدار من هَدْي قبل ما تقدر تكمّل استخدام التطبيق.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onRetry} activeOpacity={0.8}>
          <MaterialCommunityIcons name="refresh" size={20} color="#141515" />
          <Text style={styles.primaryButtonText}>إعادة المحاولة</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.storeButton} onPress={onOpenStore} activeOpacity={0.7}>
          <Text style={styles.storeButtonText}>فتح صفحة التطبيق في Google Play</Text>
          <MaterialCommunityIcons name="open-in-new" size={16} color="#76A68D" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#141515',
    paddingHorizontal: 28,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  icon: {
    color: '#76A68D',
  },
  title: {
    color: '#FFFFFF',
    fontFamily: 'Cairo',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },
  description: {
    color: '#B7BEBA',
    fontFamily: 'Cairo',
    fontSize: 15,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
  },
  primaryButton: {
    minHeight: 50,
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#76A68D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#141515',
    fontFamily: 'Cairo',
    fontSize: 15,
    fontWeight: '700',
  },
  storeButton: {
    minHeight: 44,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  storeButtonText: {
    color: '#76A68D',
    fontFamily: 'Cairo',
    fontSize: 13,
  },
});