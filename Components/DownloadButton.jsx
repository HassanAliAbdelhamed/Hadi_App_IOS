import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import DownloadManager from '../service/downloadManager';

export const DownloadButton = ({ reciterName, surahNumber, audioUrl, onComplete }) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Check initial download status
  const checkDownloadStatus = useCallback(async () => {
    const downloaded = await DownloadManager.isDownloaded(reciterName, surahNumber);
    setIsDownloaded(downloaded);
  }, [reciterName, surahNumber]);

  React.useEffect(() => {
    checkDownloadStatus();
  }, [checkDownloadStatus]);

  const handleDownload = async () => {
    if (isDownloaded) {
      // Show delete confirmation
      Alert.alert(
        'Delete Surah',
        'Are you sure you want to delete this surah from offline storage?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const deleted = await DownloadManager.deleteSurah(reciterName, surahNumber);
              if (deleted) {
                setIsDownloaded(false);
              } else {
                Alert.alert('Error', 'Failed to delete the surah');
              }
            },
          },
        ]
      );
      return;
    }

    try {
      setDownloading(true);
      await DownloadManager.downloadSurah(
        reciterName,
        surahNumber,
        audioUrl,
        (progress) => {
          setProgress(Math.round(progress));
        }
      );
      setIsDownloaded(true);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      if (error.message !== 'File already downloaded') {
        Alert.alert('Download Error', error.message || 'Failed to download surah');
      }
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  if (downloading) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.downloading]}
        onPress={() => DownloadManager.cancelDownload(reciterName, surahNumber)}
      >
        <ActivityIndicator size="small" color="#fff" />
        <Text style={styles.progressText}>{progress}%</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, isDownloaded ? styles.downloaded : null]}
      onPress={handleDownload}
    >
      <Text style={styles.buttonText}>
        {isDownloaded ? 'Downloaded' : 'Download'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloading: {
    backgroundColor: '#FFA000',
  },
  downloaded: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});