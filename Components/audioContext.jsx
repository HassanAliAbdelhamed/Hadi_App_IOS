// context/audioContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import TrackPlayer, {
  useProgress,
  State,
  usePlaybackState,
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [playerReady, setPlayerReady] = useState(false);
  const playbackState = usePlaybackState();
  const [currentInfo, setCurrentInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useProgress();
  const setupAttempted = useRef(false);
  const playerSetupTimeout = useRef(null);

  // Initialize TrackPlayer
  useEffect(() => {
    if (setupAttempted.current) return;
    setupAttempted.current = true;

    const setupPlayer = async () => {
      try {
        console.log("Initializing TrackPlayer...");

        // Try to get current track — if it works, player is already setup
        // NOTE: RNTP v5 uses getActiveTrack() instead of deprecated getCurrentTrack()
        try {
          await TrackPlayer.getActiveTrack();
          console.log("TrackPlayer already initialized");
          setPlayerReady(true);
          return;
        } catch (e) {
          // Player not setup yet, continue with setup
        }

        // Setup player
        await TrackPlayer.setupPlayer({ waitForBuffer: true }).catch(err => {
          console.log("Setup error (continuing anyway):", err.message);
        });

        console.log("TrackPlayer initialized");
        setPlayerReady(true);
      } catch (e) {
        console.warn("Error initializing TrackPlayer:", e.message);
        // Set ready anyway to prevent app freeze
        setPlayerReady(true);
      }
    };

    // Don't wait for setup — run in background
    setupPlayer();

    // Force ready after 3 seconds max — always call setPlayerReady(true)
    playerSetupTimeout.current = setTimeout(() => {
      console.log("Player setup timeout - forcing ready state");
      setPlayerReady(true);
    }, 3000);

    return () => {
      if (playerSetupTimeout.current) {
        clearTimeout(playerSetupTimeout.current);
      }
    };
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackTrackChanged && event.nextTrack != null) {
      try {
        const track = await TrackPlayer.getTrack(event.nextTrack);
        if (track) {
          setCurrentInfo({
            id: track.id,
            qareID: track.qId,
            title: track.title,
            image: track.artwork,
            qaree: track.artist,
          });
        }
      } catch (e) {
        console.warn("Error fetching track:", e.message);
      }
    }
  });

  // Fetch current track info when player is ready
  useEffect(() => {
    if (!playerReady) return;

    const fetchTrack = async () => {
      try {
        // RNTP v5: use getActiveTrack() instead of deprecated getCurrentTrack()
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
          setCurrentInfo({
            id: track.id,
            qareID: track.qId,
            title: track.title,
            image: track.artwork,
            qaree: track.artist,
          });
        }
      } catch (e) {
        console.warn("Error fetching current track:", e.message);
      }
    };

    fetchTrack();
  }, [playerReady]);

  const togglePlayPause = async () => {
    try {
      // Use playbackState from hook instead of deprecated TrackPlayer.getState()
      if (playbackState?.state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (e) {
      console.warn("Error toggling play/pause:", e.message);
    }
  };

  const seekTo = async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (e) {
      console.warn("Error seeking:", e.message);
    }
  };

  const isPlaying = playbackState?.state === State.Playing;

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        togglePlayPause,
        currentAudio: currentInfo !== null,
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

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    console.warn("useAudio must be used within AudioProvider");
    return {
      isPlaying: false,
      togglePlayPause: () => { },
      currentAudio: false,
      currentInfo: null,
      position: 0,
      duration: 0,
      seekTo: () => { },
      isExpanded: false,
      setIsExpanded: () => { },
    };
  }
  return context;
};
