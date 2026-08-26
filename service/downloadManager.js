import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { checkStoragePermission } from './permissionsService';

const DOWNLOADED_TRACKS_KEY = '@quran_player_downloaded_tracks';

// Base directory for storing Quran audio files
const BASE_DIR = Platform.select({
  android: '/storage/emulated/0/QuranPlus/Reciters',
  ios: `${RNFS.DocumentDirectoryPath}/QuranPlus/Reciters`,
});

class DownloadManager {
  constructor() {
    this.downloads = new Map(); // Track ongoing downloads
    this.ensureBaseDirectory();
  }

  async ensureBaseDirectory() {
    try {
      const exists = await RNFS.exists(BASE_DIR);
      if (!exists) {
        await RNFS.mkdir(BASE_DIR);
      }
    } catch (error) {
      console.error('Error creating base directory:', error);
    }
  }

  // Generate local file path for a surah
  getLocalPath(reciterName, surahNumber, fileExtension = 'mp3') {
    const paddedNumber = String(surahNumber).padStart(3, '0');
    return `${BASE_DIR}/${reciterName}/${paddedNumber}.${fileExtension}`;
  }

  // Check if a surah is downloaded
  async isDownloaded(reciterName, surahNumber) {
    try {
      const localPath = this.getLocalPath(reciterName, surahNumber);
      return await RNFS.exists(localPath);
    } catch (error) {
      console.error('Error checking if file exists:', error);
      return false;
    }
  }

  // Download a surah
  async downloadSurah(reciterName, surahNumber, url, onProgress) {
    try {
      // Check permissions first
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        throw new Error('Storage permission denied');
      }

      // Create reciter directory if it doesn't exist
      const reciterDir = `${BASE_DIR}/${reciterName}`;
      await RNFS.mkdir(reciterDir);

      const localPath = this.getLocalPath(reciterName, surahNumber);
      
      // Check if already downloaded
      if (await this.isDownloaded(reciterName, surahNumber)) {
        throw new Error('File already downloaded');
      }

      // Start download
      const downloadId = `${reciterName}_${surahNumber}`;
      
      const download = RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        progress: (response) => {
          const progress = (response.bytesWritten / response.contentLength) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
      });

      this.downloads.set(downloadId, download);

      const result = await download.promise;

      if (result.statusCode === 200) {
        // Save the download info
        await this.saveDownloadedTrackInfo(reciterName, surahNumber, localPath);
        return localPath;
      } else {
        throw new Error(`Download failed with status: ${result.statusCode}`);
      }
    } catch (error) {
      console.error('Error downloading surah:', error);
      throw error;
    } finally {
      this.downloads.delete(`${reciterName}_${surahNumber}`);
    }
  }

  // Cancel an ongoing download
  cancelDownload(reciterName, surahNumber) {
    const downloadId = `${reciterName}_${surahNumber}`;
    const download = this.downloads.get(downloadId);
    if (download) {
      download.promise.cancel();
      this.downloads.delete(downloadId);
    }
  }

  // Save downloaded track info to AsyncStorage
  async saveDownloadedTrackInfo(reciterName, surahNumber, localPath) {
    try {
      const key = `${reciterName}_${surahNumber}`;
      const existingData = await AsyncStorage.getItem(DOWNLOADED_TRACKS_KEY);
      const downloads = existingData ? JSON.parse(existingData) : {};
      
      downloads[key] = {
        reciterName,
        surahNumber,
        localPath,
        downloadDate: new Date().toISOString(),
      };

      await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(downloads));
    } catch (error) {
      console.error('Error saving download info:', error);
    }
  }

  // Get local path for a downloaded surah
  async getDownloadedTrackPath(reciterName, surahNumber) {
    try {
      const key = `${reciterName}_${surahNumber}`;
      const existingData = await AsyncStorage.getItem(DOWNLOADED_TRACKS_KEY);
      const downloads = existingData ? JSON.parse(existingData) : {};
      
      return downloads[key]?.localPath;
    } catch (error) {
      console.error('Error getting download path:', error);
      return null;
    }
  }

  // Delete a downloaded surah
  async deleteSurah(reciterName, surahNumber) {
    try {
      const localPath = await this.getDownloadedTrackPath(reciterName, surahNumber);
      if (localPath) {
        await RNFS.unlink(localPath);
        
        // Remove from AsyncStorage
        const existingData = await AsyncStorage.getItem(DOWNLOADED_TRACKS_KEY);
        const downloads = existingData ? JSON.parse(existingData) : {};
        delete downloads[`${reciterName}_${surahNumber}`];
        await AsyncStorage.setItem(DOWNLOADED_TRACKS_KEY, JSON.stringify(downloads));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting surah:', error);
      return false;
    }
  }
}

export default new DownloadManager();