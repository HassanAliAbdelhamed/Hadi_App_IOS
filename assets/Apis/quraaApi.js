const BASE_URL = "https://ayaaplus.runasp.net/api";

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const pickArray = (data, keys = []) => {
  for (const key of keys) {
    const value = data?.[key];

    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.$values)) return value.$values;
  }

  return [];
};

const getFirstDefinedValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ""
  );

const normalizeQare = (item, index) => {
  return {
    id: item.id ?? item.Id ?? `${index}`,
    title:
      item.name ??
      item.title ??
      item.Title ??
      item.Name ??
      "",
    img:
      item.imageUrl ??
      item.img ??
      item.Img ??
      item.ImageUrl ??
      "",
    audioUrl:
      item.audioUrl ??
      item.AudioUrl ??
      "",
    nationalityId:
      item.nationalityId ??
      item.NationalityId,
    nationality:
      item.nationality ??
      item.Nationality ??
      "",
    description:
      item.description ??
      item.Description ??
      "",
  };
};

const normalizeNationality = (item, index) => {
  return {
    id:
      item.id ??
      item.Id ??
      `nat-${index}`,
    title:
      item.title ??
      item.Title ??
      item.name ??
      item.Name ??
      "",
  };
};

const normalizeSuar = (item, index) => {
  return {
    id:
      item.id ??
      item.Id ??
      item.surahId ??
      item.SurahId ??
      index + 1,

    surahNumber:
      item.surahNumber ??
      item.SurahNumber ??
      item.number ??
      item.Number ??
      item.surahNo ??
      item.SurahNo ??
      item.surahId ??
      item.SurahId ??
      item.id ??
      item.Id ??
      index + 1,

    title:
      item.suaraTitle ??
      item.surahTitle ??
      item.title ??
      item.Title ??
      item.name ??
      item.Name ??
      `سورة ${index + 1}`,

    type:
      item.swaraType ??
      item.SwaraType ??
      item.swarType ??
      item.SwarType ??
      item.type ??
      item.Type ??
      "",

    audioUrl:
      item.audioUrl ??
      item.AudioUrl ??
      item.link ??
      item.Link ??
      item.url ??
      item.Url ??
      "",
  };
};

const normalizeRwayah = (item) => {
  const suar = pickArray(item, [
    "suar",
    "Suar",
  ]);

  return {
    id:
      item.id ??
      item.Id ??
      item.rewayahId ??
      item.RewayahId,
    name:
      item.rewayaTitle ??
      item.RewayaTitle ??
      "غير محدد",

    link:
      item.link ??
      item.Link ??
      item.audioSource ??
      item.AudioSource ??
      "",

    suar: suar.map(normalizeSuar),
  };
};

const normalizeQareDetails = (data, qareId) => {
  console.log("Qare details response:", data);

  const rootData =
    data?.qare ??
    data?.qari ??
    data?.data ??
    data?.result ??
    data ??
    {};

  const rwayatList = pickArray(rootData, [
    "rewayat",
    "Rewayat",
  ]);

  return {
    id: qareId,

    title:
      getFirstDefinedValue(
        rootData.qareName,
        rootData.QareName,
        "قارئ غير معروف"
      ),

    nationality:
      getFirstDefinedValue(
        rootData.nationality,
        rootData.Nationality,
        ""
      ),

    img:
      getFirstDefinedValue(
        rootData.imageUrl,
        rootData.ImageUrl,
        rootData.img,
        rootData.Img,
        rootData.image,
        rootData.Image,
        ""
      ),

    Audiosource:
      getFirstDefinedValue(
        rootData.audioSource,
        rootData.AudioSource,
        rootData.audiosource,
        rootData.audioUrl,
        rootData.AudioUrl,
        ""
      ),

    description:
      getFirstDefinedValue(
        rootData.description,
        rootData.Description,
        ""
      ),

    Rwayat: rwayatList.map(normalizeRwayah),

    swar: rwayatList.flatMap((rewayah) => {
      const suar = pickArray(rewayah, [
        "suar",
        "Suar",
      ]);

      return suar.map(normalizeSuar);
    }),
  };
};


// Get All Quraa
export const getAllQuraa = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Quraa/All`
    );

    if (!response.ok) {
      throw new Error("فشل تحميل القراء");
    }

    const data = await response.json();

    return extractArray(data).map(normalizeQare);
  } catch (error) {
    console.log(
      "Error fetching all quraa:",
      error.message
    );

    throw error;
  }
};


// Get All Quraa that read all suar
export const getQuraaReadAllSuar = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Quraa/ReadAllSurahs`
    );

    if (!response.ok) {
      throw new Error("فشل تحميل القراء");
    }

    const data = await response.json();

    return extractArray(data).map(normalizeQare);
  } catch (error) {
    console.log(
      "Error fetching quraa:",
      error.message
    );

    throw error;
  }
};

// Get Quraa By Nationality
export const getMostListenedQuraa = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Quraa/MostListened`
    );

    if (!response.ok) {
      throw new Error(
        "فشل تحميل القراء الاكثر استماعا"
      );
    }

    const data = await response.json();

    return extractArray(data).map(normalizeQare);
  } catch (error) {
    console.log(
      "Error fetching quraa by nationality:",
      error.message
    );

    throw error;
  }
};

// Get Quraa By Nationality
export const getQuraaByNationality = async (
  nationalityId
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/Quraa/Nationality/${nationalityId}`
    );

    if (!response.ok) {
      throw new Error(
        "فشل تحميل القراء حسب الجنسية"
      );
    }

    const data = await response.json();

    return extractArray(data).map(normalizeQare);
  } catch (error) {
    console.log(
      "Error fetching quraa by nationality:",
      error.message
    );

    throw error;
  }
};


// Get All Nationalities
export const getAllNationalities = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Nationality/All`
    );

    if (!response.ok) {
      throw new Error("فشل تحميل الجنسيات");
    }

    const data = await response.json();

    return extractArray(data).map(
      normalizeNationality
    );
  } catch (error) {
    console.log(
      "Error fetching nationalities:",
      error.message
    );

    throw error;
  }
};


// Today Recitation
export const getTodayRecitation = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Swar/Today`
    );

    if (!response.ok) {
      throw new Error(
        "فشل تحميل تلاوة اليوم"
      );
    }

    const data = await response.json();

    return {
      qareId: data.qareId,
      surahId: data.surahId,
      qareName: data.qareName,
      surahName: data.surahName,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
    };
  } catch (error) {
    console.log(
      "Error fetching today recitation:",
      error.message
    );

    return null;
  }
};


// All suar
export const getAllsuar = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Swar/AllSuar`
    );

    if (!response.ok) {
      throw new Error("فشل تحميل السور");
    }

    const data = await response.json();

    return extractArray(data).map(normalizeSuar);
  } catch (error) {
    console.log(
      "Error fetching all suar:",
      error.message
    );

    throw error;
  }
};


// Random suar of qare
export const getRandomSuarOfQare = async (
  qareId
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/Swar/Random/${qareId}`
    );

    if (!response.ok) {
      throw new Error(
        "فشل تحميل السور العشوائية للقارئ"
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(
      "Error fetching random suar of qare:",
      error.message
    );

    throw error;
  }
};


// Random Quraa
export const GetRandomQuraa = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}/Quraa/RandomQuraa`
    );

    if (!response.ok) {
      throw new Error(
        "فشل تحميل قارئ عشوائي"
      );
    }

    const data = await response.json();

    const list = extractArray(data);

    if (list.length > 0) {
      return list.map(normalizeQare);
    }

    if (
      data &&
      (data.id ?? data.Id) !== undefined
    ) {
      return [
        normalizeQare(data, 0)
      ];
    }

    return [];
  } catch (error) {
    console.log(
      "Error fetching random quraa:",
      error.message
    );

    throw error;
  }
};


// Get qare profile + rewayat + suar
export const getSwarByQare = async (
  qareId
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/Swar/${qareId}`
    );

    if (!response.ok) {
      throw new Error(
        "فشل تحميل بيانات القارئ"
      );
    }

    const data = await response.json();

    return normalizeQareDetails(
      data,
      qareId
    );
  } catch (error) {
    console.log(
      "Error fetching qare details:",
      error.message
    );

    throw error;
  }
};
