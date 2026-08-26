// Alternative audio sources for each reciter
const alternativeAudioSources = {
  1: [ // أبو بكر الشاطري
    'https://server16.mp3quran.net/shatri/',
    'https://server7.mp3quran.net/shatri/',
    'https://download.quranicaudio.com/quran/abu_bakr_ash-shaatree/'
  ],
  37: [ // سعد الغامدي
    'https://server7.mp3quran.net/s_gmd/',
    'https://server11.mp3quran.net/s_gmd/',
    'https://download.quranicaudio.com/quran/sa3d_al-ghaamidi/'
  ],
  94: [ // مشاري العفاسي
    'https://server8.mp3quran.net/afs/',
    'https://server12.mp3quran.net/afs/',
    'https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/'
  ],
  75: [ // ماهر المعيقلي
    'https://server12.mp3quran.net/maher/',
    'https://server8.mp3quran.net/maher/',
    'https://download.quranicaudio.com/quran/maher_al_muaiqly/'
  ]
};

// Helper to format surah number to 3 digits (e.g., 1 -> 001)
export const formatSurahNumber = (number) => {
  return number.toString().padStart(3, '0');
};

// Get all available audio sources for a qare
export const getAudioSources = (qareId, suraNumber) => {
  const formattedSura = formatSurahNumber(suraNumber);
  const alternatives = alternativeAudioSources[qareId] || [];
  
  return alternatives.map(baseUrl => `${baseUrl}${formattedSura}.mp3`);
};

export default alternativeAudioSources;