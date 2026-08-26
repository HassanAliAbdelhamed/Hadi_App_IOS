import TrackPlayer, { Event } from 'react-native-track-player';

async function services() {
  try {
    console.log('Setting up playback service...');
    
    const handlePlay = async () => {
      try {
        await TrackPlayer.play();
      } catch (e) {
        console.warn('Error playing:', e.message);
      }
    };

    const handlePause = async () => {
      try {
        await TrackPlayer.pause();
      } catch (e) {
        console.warn('Error pausing:', e.message);
      }
    };

    const handleStop = async () => {
      try {
        await TrackPlayer.stop();
      } catch (e) {
        console.warn('Error stopping:', e.message);
      }
    };

    TrackPlayer.addEventListener(Event.RemotePlay, handlePlay);
    TrackPlayer.addEventListener(Event.RemotePause, handlePause);
    TrackPlayer.addEventListener(Event.RemoteStop, handleStop);

    console.log('Playback service setup complete');
    return Promise.resolve();
  } catch (e) {
    console.warn('Error setting up playback service:', e.message);
    return Promise.resolve(); // Don't throw - let app continue
  }
}

export default services;