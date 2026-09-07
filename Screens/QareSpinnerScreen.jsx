import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';

import Spinner from '../Components/Spinner';
import { GetRandomQuraa, getRandomSuarOfQare } from '../assets/Apis/quraaApi';
import playTrack from '../Components/playTrack';
import AllColors from '../assets/Colors';

const MAX_ITEMS = 6;

const getImageUrl = (qare) =>
  qare?.img || qare?.imageUrl || null;

const QariSpinnerScreen = () => {
  const [stage, setStage] = useState('qari');

  const [quraa, setQuraa] = useState([]);
  const [loadingQuraa, setLoadingQuraa] = useState(true);

  const [selectedQare, setSelectedQare] = useState(null);

  const [suarOptions, setSuarOptions] = useState([]);
  const [loadingSuar, setLoadingSuar] = useState(false);

  const loadRandomQuraa = useCallback(async () => {
    setLoadingQuraa(true);

    try {
      const result = await GetRandomQuraa();

      if (!Array.isArray(result) || result.length === 0) {
        setQuraa([]);
        Alert.alert('تنبيه', 'مفيش قراء متاحين دلوقتي');
        return;
      }
      const randomQuraa = result.slice(0, MAX_ITEMS);

      setQuraa(randomQuraa);
    } catch (error) {
      console.log('GetRandomQuraa Error:', error);

      setQuraa([]);

      Alert.alert(
        'خطأ',
        'حصلت مشكلة في تحميل القراء'
      );
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

    const fullAudioSrc = `${cleanBaseUrl}${surah?.audioUrl}`;

    playTrack({
      swaraId: surah?.id,
      audioSrc: fullAudioSrc,
      image: getImageUrl(qari),
      SwaraTitle: surah?.title,
      QareTitle: qari?.title,
    });
  }, []);

  // =========================================
  // Qare Selected
  // =========================================
  const handleQareSelected = useCallback(async (qare) => {
    if (!qare) return;

    // ثبت القارئ اللي اختارته العجلة
    setSelectedQare(qare);

    setLoadingSuar(true);

    try {
      const result = await getRandomSuarOfQare(qare.id);
        console.log('Random suar for qare:', result);
      if (!Array.isArray(result) || result.length === 0) {
        setSuarOptions([]);

        Alert.alert(
          'تنبيه',
          'مفيش سور متاحة لهذا القارئ دلوقتي'
        );

        return;
      }

      // ناخد 6 سور فقط
      const randomSuar = result.slice(0, MAX_ITEMS);

      setSuarOptions(randomSuar);

      setStage('surah');
    } catch (error) {
      console.log('getRandomSuarOfQare Error:', error);

      Alert.alert(
        'خطأ',
        'حصلت مشكلة في تحميل سور هذا القارئ'
      );
    } finally {
      setLoadingSuar(false);
    }
  }, []);

  const handleSurahSelected = useCallback(
    (surah) => {
      if (!surah || !selectedQare) return;

      handlePlay(selectedQare, surah);
    },
    [selectedQare, handlePlay]
  );

  const restart = useCallback(async () => {
    setStage('qari');
    setSelectedQare(null);
    setSuarOptions([]);

    await loadRandomQuraa();
  }, [loadRandomQuraa]);

  if (loadingQuraa) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#fff"
        />

        <Text style={styles.loadingText}>
          بنجهز القراء...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.stageTitle}>
        {stage === 'qari'
          ? 'دوّر على القارئ'
          : `دوّر على سورة`}
      </Text>

      {/* Selected Qare */}
      {stage === 'surah' && selectedQare && (
        <Text style={styles.selectedQareText}>
          {selectedQare.title}
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
          items={suarOptions}
          onFinish={handleSurahSelected}
          disabled={false}
        />
      )}

      {stage === 'surah' && (
        <TouchableOpacity
          style={styles.restartButton}
          onPress={restart}
          activeOpacity={0.8}
        >
          <Text style={styles.restartButtonText}>
            دوّر تاني من الأول
          </Text>
        </TouchableOpacity>
      )}

      {loadingSuar && (
        <View style={styles.overlay}>
          <ActivityIndicator
            size="large"
            color="#fff"
          />

          <Text style={styles.loadingText}>
            بنجهز السور...
          </Text>
        </View>
      )}
    </View>
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
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  selectedQareText: {
    color: AllColors.greenColor,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },

  loadingText: {
    color: '#fff',
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

    marginBottom: 24,

    minWidth: 200,

    paddingVertical: 12,

    borderRadius: 30,

    backgroundColor: AllColors.greenColor,

    alignItems: 'center',
  },

  restartButtonText: {
    color: AllColors.whiteColor,

    fontSize: 15,

    fontWeight: '700',
  },
});

export default QariSpinnerScreen;
