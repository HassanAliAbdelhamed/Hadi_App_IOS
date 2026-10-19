import TrackPlayer, { Event } from 'react-native-track-player';
import { playFollowingSurah } from './service/surahPlayback';

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

    const handleNext = async () => {
      try {
        await TrackPlayer.skipToNext();
      } catch (_e) {
        await playFollowingSurah({});
      }
    };

    const handlePrevious = async () => {
      try {
        await TrackPlayer.skipToPrevious();
      } catch (_e) {
        await TrackPlayer.seekTo(0);
      }
    };

    TrackPlayer.addEventListener(Event.RemotePlay, handlePlay);
    TrackPlayer.addEventListener(Event.RemotePause, handlePause);
    TrackPlayer.addEventListener(Event.RemoteStop, handleStop);
    TrackPlayer.addEventListener(Event.RemoteNext, handleNext);
    TrackPlayer.addEventListener(Event.RemotePrevious, handlePrevious);
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
      await playFollowingSurah(event);
    });

    console.log('Playback service setup complete');
    return Promise.resolve();
  } catch (e) {
    console.warn('Error setting up playback service:', e.message);
    return Promise.resolve();
  }
}

export default services;
