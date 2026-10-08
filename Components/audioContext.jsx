// context/audioContext.js
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import TrackPlayer, {
  useProgress,
  State,
  usePlaybackState,
  Event,
  useTrackPlayerEvents,
} from "react-native-track-player";
import { getSwarByQare } from "../assets/Apis/quraaApi";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [playerReady, setPlayerReady] = useState(false);
  const playbackState = usePlaybackState();
  const [currentInfo, setCurrentInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const progress = useProgress();
  const setupAttempted = useRef(false);
  const playerSetupTimeout = useRef(null);
  const nextTrackInProgress = useRef(false);

  const updateCurrentInfo = useCallback((track) => {
    if (!track) return;

    setCurrentInfo({
      id: track.id,
      qareID: track.qId,
      rwayahID: track.rwayahId,
      title: track.title,
      image: track.artwork,
      qaree: track.artist,
    });
  }, []);

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
          await TrackPlayer.reset();
          setPlayerReady(true);
          return;
          } catch (_e) {
          // Player not setup yet, continue with setup
        }

        // Setup player
        await TrackPlayer.setupPlayer({ waitForBuffer: true }).catch(err => {
          console.log("Setup error (continuing anyway):", err.message);
        });

        // Playback is session-only; downloaded files and favorites are separate storage.
        await TrackPlayer.reset();

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

  useTrackPlayerEvents(
  [Event.PlaybackActiveTrackChanged],
  async (event) => {
    if (event.index != null) {
      try {
        const track = await TrackPlayer.getTrack(event.index);

        if (track) {
          updateCurrentInfo(track);
        }
      } catch (e) {
        console.warn("Error fetching track:", e.message);
      }
    }
  }, [updateCurrentInfo]);

  useTrackPlayerEvents(
    [Event.PlaybackQueueEnded],
    async (event) => {
      if (nextTrackInProgress.current) return;
      nextTrackInProgress.current = true;

      try {
        const activeTrack = await TrackPlayer.getActiveTrack()
          || (event.track != null ? await TrackPlayer.getTrack(event.track) : null);
        const qareId = activeTrack?.qId;
        const currentNumber = Number(activeTrack?.surahNumber);

        if (qareId == null || !Number.isInteger(currentNumber)) return;

        const qare = await getSwarByQare(qareId);
        const rewayah = qare?.Rwayat?.find((item) => (
          activeTrack.rwayahId != null && String(item.id) === String(activeTrack.rwayahId)
        )) || qare?.Rwayat?.find((item) => (
          activeTrack.rwayahName && item.name === activeTrack.rwayahName
        )) || qare?.Rwayat?.[0];

        const orderedSuar = [...(rewayah?.suar || [])]
          .filter((item) => Number.isInteger(Number(item.surahNumber)))
          .sort((left, right) => Number(left.surahNumber) - Number(right.surahNumber));

        if (orderedSuar.length === 0) return;

        const nextNumbers = Array.from({ length: 114 }, (_, index) => (
          ((currentNumber + index) % 114) + 1
        ));
        const nextSurah = nextNumbers
          .map((number) => orderedSuar.find((item) => Number(item.surahNumber) === number))
          .find((item) => item && (item.audioUrl || rewayah.link || qare?.Audiosource));

        if (!nextSurah) return;

        const rawAudioUrl = nextSurah.audioUrl || "";
        const baseUrl = rewayah.link || qare?.Audiosource || "";
        const audioUrl = rawAudioUrl.startsWith("http")
          ? rawAudioUrl
          : baseUrl
            ? `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}${rawAudioUrl || String(nextSurah.surahNumber).padStart(3, "0") + ".mp3"}`
            : "";

        if (!audioUrl) return;

        await TrackPlayer.reset();
        await TrackPlayer.add([{
          id: nextSurah.id,
          qId: qare.id,
          rwayahId: rewayah.id,
          rwayahName: rewayah.name,
          surahNumber: nextSurah.surahNumber,
          audioBaseUrl: baseUrl,
          url: audioUrl,
          title: nextSurah.title,
          artist: qare.title,
          artwork: qare.img,
        }]);
        await TrackPlayer.play();

        const nextPlaybackState = await TrackPlayer.getPlaybackState();
        if (nextPlaybackState?.state !== State.Playing) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          await TrackPlayer.play();
        }
      } catch (error) {
        console.warn("Error starting next Surah:", error.message);
      } finally {
        nextTrackInProgress.current = false;
      }
    }
  );

  // Fetch current track info when player is ready
  useEffect(() => {
    if (!playerReady) return;

    const fetchTrack = async () => {
      try {
        // RNTP v5: use getActiveTrack() instead of deprecated getCurrentTrack()
        const track = await TrackPlayer.getActiveTrack();
        if (track) {
          updateCurrentInfo(track);
        }
      } catch (e) {
        console.warn("Error fetching current track:", e.message);
      }
    };

    fetchTrack();
  }, [playerReady, updateCurrentInfo]);

  const togglePlayPause = useCallback(async () => {
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
  }, [playbackState?.state]);

  const seekTo = useCallback(async (value) => {
    try {
      await TrackPlayer.seekTo(value);
    } catch (e) {
      console.warn("Error seeking:", e.message);
    }
  }, []);

  const isPlaying = playbackState?.state === State.Playing;
  const contextValue = useMemo(() => ({
    isPlaying,
    togglePlayPause,
    currentAudio: currentInfo !== null,
    currentInfo,
    position: progress.position,
    duration: progress.duration,
    seekTo,
    isExpanded,
    setIsExpanded,
  }), [
    isPlaying,
    togglePlayPause,
    currentInfo,
    progress.position,
    progress.duration,
    seekTo,
    isExpanded,
  ]);

  return (
    <AudioContext.Provider value={contextValue}>
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
