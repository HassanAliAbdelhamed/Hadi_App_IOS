import TrackPlayer, { State } from "react-native-track-player";
import { getSwarByQare } from "../assets/Apis/quraaApi";

let playGeneration = 0;
let nextTrackInProgress = false;

const padSurahFileName = (surahNumber) =>
  `${String(surahNumber).padStart(3, "0")}.mp3`;

export function beginPlaybackGeneration() {
  playGeneration += 1;
  return playGeneration;
}

function isCurrentGeneration(generation) {
  return generation == null || generation === playGeneration;
}

function findRewayah(qare, track) {
  return (
    qare?.Rwayat?.find(
      (item) => track?.rwayahId != null && String(item.id) === String(track.rwayahId)
    ) ||
    qare?.Rwayat?.find(
      (item) => track?.rwayahName && item.name === track.rwayahName
    ) ||
    qare?.Rwayat?.[0]
  );
}

function getOrderedSuar(rewayah) {
  return [...(rewayah?.suar || [])]
    .filter((item) => Number.isInteger(Number(item.surahNumber)))
    .sort((left, right) => Number(left.surahNumber) - Number(right.surahNumber));
}

export function resolveSurahAudioUrl(surah, rewayah, qare) {
  const rawAudioUrl = surah?.audioUrl || "";
  const baseUrl = rewayah?.link || qare?.Audiosource || "";

  if (rawAudioUrl.startsWith("http")) {
    return rawAudioUrl;
  }

  if (!baseUrl) {
    return rawAudioUrl;
  }

  const fileName = rawAudioUrl || padSurahFileName(surah?.surahNumber);
  return `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}${fileName}`;
}

export function toPlayerTrack(qare, rewayah, surah) {
  const baseUrl = rewayah?.link || qare?.Audiosource || "";

  return {
    id: surah.id,
    qId: qare.id,
    rwayahId: rewayah?.id,
    rwayahName: rewayah?.name,
    surahNumber: surah.surahNumber,
    audioBaseUrl: baseUrl,
    url: resolveSurahAudioUrl(surah, rewayah, qare),
    title: surah.title,
    artist: qare.title,
    artwork: qare.img,
  };
}

function nextSurahNumbers(currentNumber) {
  return Array.from({ length: 113 }, (_, index) => (
    ((currentNumber + index) % 114) + 1
  ));
}

function buildUpcomingTracks(qare, rewayah, currentNumber) {
  const orderedSuar = getOrderedSuar(rewayah);

  return nextSurahNumbers(currentNumber)
    .map((number) => orderedSuar.find((item) => Number(item.surahNumber) === number))
    .filter((item) => item && (item.audioUrl || rewayah?.link || qare?.Audiosource))
    .map((surah) => toPlayerTrack(qare, rewayah, surah))
    .filter((track) => Boolean(track.url));
}

async function loadQareQueueContext(track) {
  const qareId = track?.qId;
  const currentNumber = Number(track?.surahNumber);

  if (qareId == null || !Number.isInteger(currentNumber)) {
    return null;
  }

  const qare = await getSwarByQare(qareId);
  const rewayah = findRewayah(qare, track);

  if (!qare || !rewayah) {
    return null;
  }

  return { qare, rewayah, currentNumber };
}

export async function enqueueUpcomingSurahs(currentTrack, generation) {
  if (!currentTrack?.qId) {
    return;
  }

  const context = await loadQareQueueContext(currentTrack);
  if (!context || !isCurrentGeneration(generation)) {
    return;
  }

  const upcomingTracks = buildUpcomingTracks(
    context.qare,
    context.rewayah,
    context.currentNumber
  );

  if (!upcomingTracks.length || !isCurrentGeneration(generation)) {
    return;
  }

  await TrackPlayer.add(upcomingTracks);
}

async function startTracks(tracks, generation) {
  if (!tracks.length || !isCurrentGeneration(generation)) {
    return;
  }

  await TrackPlayer.reset();
  if (!isCurrentGeneration(generation)) {
    return;
  }

  await TrackPlayer.add(tracks);
  await TrackPlayer.play();

  const nextPlaybackState = await TrackPlayer.getPlaybackState();
  if (nextPlaybackState?.state !== State.Playing) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    await TrackPlayer.play();
  }
}

export async function playFollowingSurah(endedEvent) {
  if (nextTrackInProgress) {
    return;
  }

  nextTrackInProgress = true;
  const generation = beginPlaybackGeneration();

  try {
    const queue = await TrackPlayer.getQueue();
    const activeTrack =
      (await TrackPlayer.getActiveTrack()) ||
      (endedEvent?.track != null ? await TrackPlayer.getTrack(endedEvent.track) : null) ||
      queue[queue.length - 1];

    if (!activeTrack?.qId) {
      return;
    }

    const context = await loadQareQueueContext(activeTrack);
    if (!context || !isCurrentGeneration(generation)) {
      return;
    }

    const upcomingTracks = buildUpcomingTracks(
      context.qare,
      context.rewayah,
      context.currentNumber
    );

    await startTracks(upcomingTracks, generation);
  } catch (error) {
    console.warn("Error starting next Surah:", error.message);
  } finally {
    nextTrackInProgress = false;
  }
}
