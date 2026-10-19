import TrackPlayer, { Capability } from "react-native-track-player";
import {
  beginPlaybackGeneration,
  enqueueUpcomingSurahs,
} from "../service/surahPlayback";

let isPlayerSetup = false;

async function ensurePlayerOptions() {
  if (isPlayerSetup) {
    return;
  }

  try {
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      alwaysPauseOnInterruption: true,
      android: {
        appKilledPlaybackBehavior: "continue-playback",
      },
    });
    isPlayerSetup = true;
  } catch (e) {
    console.warn("Error updating player options:", e.message);
  }
}

export default async function playTrack({
  swaraId,
  qareId,
  rwayahId,
  rwayahName,
  surahNumber,
  audioBaseUrl,
  audioSrc,
  image,
  SwaraTitle,
  QareTitle,
}) {
  try {
    if (!audioSrc || swaraId == null) {
      console.warn("Cannot play track without an audio URL and surah ID");
      return;
    }

    const generation = beginPlaybackGeneration();
    await ensurePlayerOptions();

    const currentTrack = {
      id: swaraId,
      qId: qareId,
      rwayahId,
      rwayahName,
      surahNumber: surahNumber ?? swaraId,
      audioBaseUrl,
      url: audioSrc,
      title: SwaraTitle,
      artist: QareTitle,
      artwork: image,
    };

    await TrackPlayer.reset();
    await TrackPlayer.add([currentTrack]);
    await TrackPlayer.play();
    console.log("Playing track:", SwaraTitle);

    if (qareId != null) {
      enqueueUpcomingSurahs(currentTrack, generation).catch((error) => {
        console.warn("Error queueing upcoming Surahs:", error.message);
      });
    }
  } catch (e) {
    console.warn("Error playing audio:", e.message);
  }
}
