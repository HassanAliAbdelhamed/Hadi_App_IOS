const BASE_URL = "http://ayaaplus.runasp.net/api";

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.$values)) return data.$values;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

const normalizeQare = (item, index) => {
  const rawId = item.id ?? item.Id;
  return {
    id: rawId ? `${rawId}` : `qare-${index}`,
    title: item.name ?? item.title ?? item.Title ?? item.Name,
    img: item.imageUrl ?? item.img ?? item.Img ?? item.ImageUrl,
    audioUrl: item.audioUrl ?? item.AudioUrl,
    nationalityId: item.nationalityId ?? item.NationalityId,
    nationality: item.nationality ?? item.Nationality,
    description: item.description ?? item.Description,
  };
};

const normalizeNationality = (item, index) => {
  const rawId = item.id ?? item.Id;
  return {
    id: rawId ? `${rawId}` : `nat-${index}`,
    title:
      item.title ??
      item.Title ??
      item.name ??
      item.Name,
  };
};

const normalizeSuar = (item) => {
  // console.log("Normalizing suar item:", item);
  return {
    id: item.id ?? item.Id,
    title: item.title ?? item.Title,
    type: item.SwaraType ?? item.swaraType,
    audioUrl: item.audioUrl ?? item.AudioUrl,
  };
};

// Get All Quraa
export const getAllQuraa = async () => {
  try {
    const response = await fetch(`${BASE_URL}/Quraa/All`);

    if (!response.ok) {
      throw new Error("فشل تحميل القراء");
    }

    const data = await response.json();

    return extractArray(data).map(normalizeQare);
  } catch (error) {
    console.log("Error fetching all quraa:", error.message);
    throw error;
  }
};

// Get All Quraa that read all suar
export const getQuraaReadAllSuar = async () => {
  try {
    const response = await fetch(`${BASE_URL}/Quraa/ReadAllSurahs`);

    if (!response.ok) {
      throw new Error("فشل تحميل القراء");
    }

    const data = await response.json();

    return extractArray(data).map(normalizeQare);
  } catch (error) {
    console.log("Error fetching all quraa:", error.message);
    throw error;
  }
};

// Get Quraa By Nationality
export const getQuraaByNationality = async (nationalityId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/Quraa/Nationality/${nationalityId}`
    );

    if (!response.ok) {
      throw new Error("فشل تحميل القراء حسب الجنسية");
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
    const response = await fetch(`${BASE_URL}/Nationality/All`);

    if (!response.ok) {
      throw new Error("فشل تحميل الجنسيات");
    }

    const data = await response.json();

    return extractArray(data).map(normalizeNationality);
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
      throw new Error("فشل تحميل تلاوة اليوم");
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
    const response = await fetch(`${BASE_URL}/Swar/AllSuar`);

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

export const getRandomSuarOfQare = async (qareId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/Swar/Random/1`
    );

    if (!response.ok) {
      throw new Error("فشل تحميل السور العشوائية للقارئ");
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

export const GetRandomQuraa = async () => {
  try {
    const response = await fetch(`${BASE_URL}/Quraa/RandomQuraa`);

    if (!response.ok) {
      throw new Error("فشل تحميل قارئ عشوائي");
    }

    const data = await response.json();

    const list = extractArray(data);
    if (list.length > 0) {
      return list.map(normalizeQare);
    }

    if (data && (data.id ?? data.Id) !== undefined) {
      return [normalizeQare(data, 0)];
    }

    return [];
  } catch (error) {
    console.log("Error fetching random quraa:", error.message);
    throw error;
  }
};