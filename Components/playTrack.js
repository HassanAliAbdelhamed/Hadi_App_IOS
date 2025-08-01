import TrackPlayer, { Capability } from "react-native-track-player";
let isPlayerSetup = false
export default async function playTrack({
  swaraId,
  qareId,
  audioSrc,
  image,
  SwaraTitle,
  QareTitle,
}) {
  try {
    if (!isPlayerSetup) {
      await TrackPlayer.setupPlayer({
        waitForBuffer: true,
      });

      await TrackPlayer.updateOptions({
        capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
        compactCapabilities: [Capability.Play, Capability.Pause],
        alwaysPauseOnInterruption: true,
      });
    }
    isPlayerSetup = true; 
    await TrackPlayer.reset()
    await TrackPlayer.add([
      {
        id: swaraId,
        qId:qareId,
        url: audioSrc,
        title: SwaraTitle,
        artist: QareTitle,
        artwork: image,
      },
    ]);
    await TrackPlayer.play()
  } catch(e) {
    console.log("error In Audio" , e);
  }
}
