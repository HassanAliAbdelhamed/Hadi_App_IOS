import { Platform, PermissionsAndroid } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

const STORAGE_PERMISSIONS = Platform.select({
  android: [
    Platform.Version >= 33
      ? [
          PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
          PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          PERMISSIONS.ANDROID.READ_MEDIA_VIDEO,
        ]
      : [
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ],
  ].flat(),
  ios: [PERMISSIONS.IOS.MEDIA_LIBRARY],
});

export const checkStoragePermission = async () => {
  try {
    // For Android 11 (API level 30) and above, check MANAGE_EXTERNAL_STORAGE
    if (Platform.OS === 'android' && Platform.Version >= 30) {
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE
      );
      if (!hasPermission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.MANAGE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'App needs access to storage to download and save Quran audio files',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    // For other cases, check platform-specific permissions
    const results = await Promise.all(
      STORAGE_PERMISSIONS.map(permission => check(permission))
    );

    // If any permission is not granted, request them all
    if (results.includes(RESULTS.DENIED)) {
      const grantResults = await Promise.all(
        STORAGE_PERMISSIONS.map(permission => request(permission))
      );
      return !grantResults.includes(RESULTS.DENIED) && 
             !grantResults.includes(RESULTS.BLOCKED);
    }

    return true;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};