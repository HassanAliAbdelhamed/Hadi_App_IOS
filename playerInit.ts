// playerInit.ts
import TrackPlayer, { Capability } from 'react-native-track-player';

let isPlayerSetup = false;

export async function setupIfNeeded() {
  if (isPlayerSetup) return;

  const currentState = await TrackPlayer.getState();
  if (currentState === 'none') {
    console.log("🎧 Setting up TrackPlayer...");
    await TrackPlayer.setupPlayer({ waitForBuffer: true });

    await TrackPlayer.updateOptions({
    //   stopWithApp: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });

    console.log("✅ TrackPlayer setup complete.");
  }

  isPlayerSetup = true;
}
