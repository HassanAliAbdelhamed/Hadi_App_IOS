import TrackPlayer, { Capability } from "react-native-track-player";

let isPlayerSetup = false;

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

    if (!isPlayerSetup) {
      try {
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
            Capability.SeekTo, // Required for the slider in MiniPlayer to work
          ],
          compactCapabilities: [Capability.Play, Capability.Pause],
          alwaysPauseOnInterruption: true,
          android: {
            appKilledPlaybackBehavior: "stop-playback",
          },
        });
        isPlayerSetup = true;
      } catch (e) {
        console.warn("Error updating player options:", e.message);
      }
    }

    await TrackPlayer.reset();
    await TrackPlayer.add([
      {
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
      },
    ]);
    await TrackPlayer.play();
    console.log("Playing track:", SwaraTitle);
  } catch (e) {
    console.warn("Error playing audio:", e.message);
  }
}
