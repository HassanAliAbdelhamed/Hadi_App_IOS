// context/audioContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import TrackPlayer, {
  useProgress,
  State,
  usePlaybackState,
} from "react-native-track-player";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const playbackState = usePlaybackState();
  const [currentInfo, setCurrentInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useProgress();

  useEffect(() => {
    const getTrack = async () => {
      const id = await TrackPlayer.getCurrentTrack();
      if (id !== null) {
        const track = await TrackPlayer.getTrack(id);
        setCurrentInfo({
          id:track.qareID,
          qareID:track.qId,
          title: track.title,
          image: track.artwork,
          qaree: track.artist,
        });
      }
    };
    getTrack();
  }, [progress.position]);

  const togglePlayPause = async () => {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const seekTo = async (value) => {
    await TrackPlayer.seekTo(value);
  };
  const isPlaying = playbackState.state == "playing" ? true : false;
  //   console.log(isPlaying)
  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        togglePlayPause,
        currentAudio: true, // dummy check
        currentInfo,
        position: progress.position,
        duration: progress.duration,
        seekTo,
        isExpanded,
        setIsExpanded,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
