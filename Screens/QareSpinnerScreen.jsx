import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';

import Spinner from '../Components/Spinner';
import { GetRandomQuraa, getRandomSuarOfQare } from '../assets/Apis/quraaApi';
import playTrack from '../Components/playTrack';
import AllColors from '../assets/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAX_ITEMS = 6;

const getImageUrl = (qare) =>
  qare?.img || qare?.imageUrl || null;

const QariSpinnerScreen = () => {
  const [stage, setStage] = useState('qari');

  const [quraa, setQuraa] = useState([]);
  const [loadingQuraa, setLoadingQuraa] = useState(true);

  const [selectedQare, setSelectedQare] = useState(null);
  const [selectedSurah, setSelectedSurah] = useState(null);

  const [suarOptions, setSuarOptions] = useState([]);
  const [loadingSuar, setLoadingSuar] = useState(false);

  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [surahSpinKey, setSurahSpinKey] = useState(0);

  const loadRandomQuraa = useCallback(async () => {
    setLoadingQuraa(true);

    try {
      const result = await GetRandomQuraa();

      if (!Array.isArray(result) || result.length === 0) {
        setQuraa([]);
        Alert.alert('تنبيه', 'لا يوجد قراء متاحون حالياً');
        return;
      }

      setQuraa(result.slice(0, MAX_ITEMS));
    } catch (error) {
      console.log('GetRandomQuraa Error:', error);
      setQuraa([]);
      Alert.alert('خطأ', 'حدثت مشكلة أثناء تحميل القراء');
    } finally {
      setLoadingQuraa(false);
    }
  }, []);

  useEffect(() => {
    loadRandomQuraa();
  }, [loadRandomQuraa]);

  const handlePlay = useCallback((qari, surah) => {
    if (!qari || !surah) return;

    const baseUrl =
      qari?.audioUrl ||
      qari?.AudioSource ||
      qari?.audioSource ||
      '';

    if (!baseUrl) {
      Alert.alert('خطأ', 'رابط الصوت غير متوفر');
      return;
    }

    const cleanBaseUrl = baseUrl.endsWith('/')
      ? baseUrl
      : `${baseUrl}/`;

    const fullAudioSrc = `${surah?.audioUrl}`;

    console.log('Playing Track:', {
      swaraId: surah?.id,
      audioSrc: fullAudioSrc,
    });
    playTrack({
      swaraId: surah?.id,
      audioSrc: fullAudioSrc,
      image: getImageUrl(qari),
      SwaraTitle: surah?.title,
      QareTitle: qari?.title,
    });
  }, []);

  const handleQareSelected = useCallback(async (qare) => {
    if (!qare) return;

    setSelectedQare(qare);
    setSelectedSurah(null);
    setLoadingSuar(true);

    try {
      const result = await getRandomSuarOfQare(qare.id);

      if (!Array.isArray(result) || result.length === 0) {
        setSuarOptions([]);
        Alert.alert('تنبيه', 'لا توجد سور متاحة لهذا القارئ حالياً');
        return;
      }

      setSuarOptions(result.slice(0, MAX_ITEMS));
      setSurahSpinKey((key) => key + 1);
      setStage('surah');
    } catch (error) {
      console.log('getRandomSuarOfQare Error:', error);
      Alert.alert('خطأ', 'حدثت مشكلة أثناء تحميل سور هذا القارئ');
    } finally {
      setLoadingSuar(false);
    }
  }, []);

  const handleSurahSelected = useCallback((surah) => {
    if (!surah || !selectedQare) return;

    setSelectedSurah(surah);
    setResultModalVisible(true);
  }, [selectedQare]);

  const handleConfirmPlay = useCallback(() => {
    setResultModalVisible(false);
    handlePlay(selectedQare, selectedSurah);
    restart();
  }, [selectedQare, selectedSurah, handlePlay]);

  const handleRespinSurah = useCallback(() => {
    setResultModalVisible(false);
    setSelectedSurah(null);
    setSurahSpinKey((key) => key + 1);
  }, []);

  const restart = useCallback(async () => {
    setResultModalVisible(false);
    setStage('qari');
    setSelectedQare(null);
    setSelectedSurah(null);
    setSuarOptions([]);
    await loadRandomQuraa();
  }, [loadRandomQuraa]);

  if (loadingQuraa) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>جاري تحضير القراء...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AllColors.BlackBackgroundColor }}>
      <View style={styles.container}>
        <Text style={styles.stageTitle}>
          {stage === 'qari' ? 'إختيار القارئ' : 'إختيار السورة'}
        </Text>

        {stage === 'surah' && selectedQare && (
          <Text style={styles.selectedQareText}>
            القارئ : {selectedQare.title}
          </Text>
        )}

        {stage === 'qari' && quraa.length > 0 && (
          <Spinner
            items={quraa}
            onFinish={handleQareSelected}
            disabled={loadingSuar}
          />
        )}

        {stage === 'surah' && suarOptions.length > 0 && (
          <Spinner
            key={surahSpinKey}
            items={suarOptions}
            onFinish={handleSurahSelected}
            disabled={resultModalVisible}
          />
        )}

        {stage === 'surah' && (
          <TouchableOpacity
            style={styles.restartButton}
            onPress={restart}
            activeOpacity={0.8}
          >
            <Text style={styles.restartButtonText}>
              البحث مجدداً من البداية
            </Text>
          </TouchableOpacity>
        )}

        {loadingSuar && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>جاري تحضير السور...</Text>
          </View>
        )}

        <Modal
          animationType="fade"
          transparent
          visible={resultModalVisible}
          onRequestClose={() => setResultModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalQareText}>
               <Text style={styles.modalSurahText}> {selectedQare?.title}</Text>
              </Text>

              <Text style={styles.modalQareText}>
                <Text style={styles.modalSurahText}>{selectedSurah?.title}</Text>
              </Text>

              <Text style={styles.modalQuestion}>
                هل تريد تشغيل هذه السورة أم تغييرها؟
              </Text>

              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleConfirmPlay}
                activeOpacity={0.8}
              >
                <Text style={styles.modalPrimaryButtonText}>
                  تشغيل الآن
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={handleRespinSurah}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSecondaryButtonText}>
                  تغيير السورة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalLinkButton}
                onPress={restart}
                activeOpacity={0.8}
              >
                <Text style={styles.modalLinkButtonText}>
                  إعادة من البداية
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141515',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141515',
  },

  stageTitle: {
    color: '#fff',
    fontFamily: 'Cairo',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
  },

  selectedQareText: {
    color: AllColors.greenColor,
    fontFamily: 'Cairo',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },

  loadingText: {
    color: '#fff',
    fontFamily: 'Cairo',
    marginTop: 12,
    fontSize: 14,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  restartButton: {
    alignSelf: 'center',
    marginBottom: 100,
    minWidth: 200,
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: AllColors.greenColor,
    alignItems: 'center',
  },

  restartButtonText: {
    color: AllColors.whiteColor,
    fontFamily: 'Cairo',
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '85%',
    backgroundColor: '#212523',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: AllColors.greenColor,
  },

  modalTitle: {
    color: AllColors.greenColor,
    fontFamily: 'Cairo',
    fontSize: 18,
    marginBottom: 12,
  },

  modalQareText: {
    color: '#fff',
    fontFamily: 'Cairo',
    fontSize: 16,
    textAlign: 'center',
  },

  modalSurahText: {
    color: '#FFD700',
    fontFamily: 'Cairo',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },

  modalQuestion: {
    color: '#B0BEC5',
    fontFamily: 'Cairo',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },

  modalPrimaryButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: AllColors.greenColor,
    alignItems: 'center',
    marginBottom: 10,
  },

  modalPrimaryButtonText: {
    color: AllColors.whiteColor,
    fontFamily: 'Cairo',
    fontSize: 15,
  },

  modalSecondaryButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 30,
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
    marginBottom: 10,
  },

  modalSecondaryButtonText: {
    color: '#fff',
    fontFamily: 'Cairo',
    fontSize: 15,
  },

  modalLinkButton: {
    paddingVertical: 8,
  },

  modalLinkButtonText: {
    color: AllColors.greenColor,
    fontFamily: 'Cairo',
    fontSize: 14,
  },
});

export default QariSpinnerScreen;