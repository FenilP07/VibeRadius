import { useState, useEffect, useCallback, useRef } from "react";
import useAuthStore from "../store/authStore";
import useLiveSessionStore from "../store/liveSessionStore";
import { authService } from "../services/authService";

// TODO: Remove global player state and rely on React state instead, but this was added to work around an issue where the Spotify player would disconnect when the hook re-initialized (e.g. on page refresh or navigation). This way we can keep the same player instance alive across the app. We should eventually refactor to a more robust solution, possibly using a context provider for the Spotify player.
let globalPlayer = null;
let globalDeviceId = null;
let globalReady = false;
let sdkLoading = false;
let sdkLoaded = false;
let isInitializingPlayer = false;

export const resetSpotifyPlayer = () => {
  if (globalPlayer) {
    globalPlayer.disconnect();
  }
  globalPlayer = null;
  globalDeviceId = null;
  globalReady = false;
};

const useSpotifyPlayer = () => {
  const [player, setPlayer] = useState(globalPlayer);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [position, setPosition] = useState(0);
  const [deviceId, setDeviceId] = useState(globalDeviceId);
  const [isReady, setIsReady] = useState(globalReady);

  const spotifyConnected = useAuthStore((state) => state.spotifyConnected);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setSpotifyConnected = useAuthStore(
    (state) => state.setSpotifyConnected
  );
  const { setCurrentTrack } = useLiveSessionStore();

  const tokenRef = useRef(null);
  const endedFiredRef = useRef(false);
  const lastTrackIdRef = useRef(null);
  const tokenPromiseRef = useRef(null);

  // --- Get fresh Spotify token ---
  const getToken = useCallback(async () => {
    if(tokenRef.current) return tokenRef.current; // Return cached token if it's still valid

    if(tokenPromiseRef.current) {
      return await tokenPromiseRef.current; // Wait for ongoing token refresh if it exists
    }

    tokenPromiseRef.current = (async () => {
      try {
        const response = await authService.spotifyToken();
        const token = response.data.access_token;
        tokenRef.current = token;
        console.log("Obtained new Spotify token");
        return token;
      } catch (err) {
        console.error("Spotify token failed", err);
        setSpotifyConnected(false);
        return null;
      } finally {
        tokenPromiseRef.current = null; // Clear the promise ref after completion
      }
    })();

    return await tokenPromiseRef.current;
  }, [setSpotifyConnected]);

  // --- Transfer playback to this device safely ---
  const transferPlayback = useCallback(
    async (device_id, retries = 5) => {
      const token = await getToken();
      if (!token || !player) return;

      try {
        await player.setVolume(0.5);

        console.log("Device id for transfer:", device_id);
        // Transfer playback
        const response = await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [device_id], play: true }),
        });

        if (response.status === 404 && retries > 0) {
          console.warn(`Device not found for transfer, retrying... (${retries} left)`)
          const nextDelay = (6 - retries) * 1000; // Exponential backoff: 1s, 2s, 3s, 4s
          setTimeout(() => transferPlayback(device_id, retries - 1), nextDelay);
        } else if (response.ok) {
          console.log("✅ Playback transferred!!");
        }
      } catch (err) {
        console.warn("Playback transfer failed", err);
      }
    },
    [getToken, player]
  );

  // --- Initialize Spotify SDK and player ---
  useEffect(() => {
    if (isInitializing || !isAuthenticated || !spotifyConnected) return;

    if (globalPlayer && globalDeviceId) {
      setPlayer(globalPlayer);
      setDeviceId(globalDeviceId);
      setIsReady(globalReady);
      return;
    }

    if (!sdkLoading && !sdkLoaded) {
      sdkLoading = true;
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const initializePlayer = async () => {
      if (globalPlayer || isInitializingPlayer) return;

      isInitializingPlayer = true;

      try {
        const playerInstance = new window.Spotify.Player({
          name: "VibeRadius Player",
          getOAuthToken: async (cb) => {
            const token = await getToken();
            cb(token);
          },
          volume: 0.5,
        });

        playerInstance.addListener("ready", async ({ device_id }) => {
          console.log("✅ Player ready", device_id);
          globalPlayer = playerInstance;
          globalDeviceId = device_id;
          globalReady = true;

          setPlayer(playerInstance);
          setDeviceId(device_id);
          setIsReady(true);

          setTimeout(() => {
            transferPlayback(device_id);
          }, 2000);

          isInitializingPlayer = false;
        });

        playerInstance.addListener("not_ready", () => {
          globalReady = false;
          setIsReady(false);
        });

        playerInstance.addListener("account_error", () =>
          setSpotifyConnected(false)
        );

        playerInstance.addListener("player_state_changed", (state) => {
          if (!state) {
            setActive(false);
            return;
          }

          setPaused(state.paused);
          const currentId = state.track_window?.current_track?.id;
          if (currentId && lastTrackIdRef.current !== currentId) {
            lastTrackIdRef.current = currentId;
            endedFiredRef.current = false;
          }

          const ended =
            state.paused === true &&
            state.position === 0 &&
            currentId &&
            lastTrackIdRef.current === currentId;

          if (ended && !endedFiredRef.current) {
            endedFiredRef.current = true;
            window.__onSpotifyTrackEnded?.();
          }

          playerInstance.getCurrentState().then((currentState) => {
            !currentState ? setActive(false) : setActive(true);
          });
        });

        const handleLoadError = () => {
          isInitializingPlayer = false;
          globalPlayer = null;
        };

        playerInstance.addListener("initialization_error", handleLoadError);
        playerInstance.addListener("authentication_error", handleLoadError);

        await playerInstance.connect();
      } catch (error) {
        console.error("Player connection error", error);
      }
    };

    if (window.Spotify) {
      sdkLoaded = true;
      initializePlayer();
    } else if (!window.onSpotifyWebPlaybackSDKReady) {
      window.onSpotifyWebPlaybackSDKReady = () => {
        sdkLoaded = true;
        initializePlayer();
      };
    }
  }, [
    spotifyConnected,
    isAuthenticated,
    isInitializing,
    getToken,
    setSpotifyConnected,
    transferPlayback,
  ]);

  const playTrack = useCallback(
    async (uri, { position_ms = 0 } = {}) => {
      const token = await getToken();
      if (!token || !deviceId || !uri) return;

      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [uri],
            position_ms,
          }),
        }
      );
    },
    [getToken, deviceId]
  );

  // --- Play/Pause/Next helpers ---

  const play = async () => {
    if (!player || !deviceId || is_paused === false) return;
    try {
      console.log("Attempting to play...");
      await player.resume();
    } catch (err) {
      console.warn("Play error", err);
    }
  };

  const pause = async () => {
    if (!player || !deviceId) return;
    try {
      console.log("Attempting to pause...");
      await player.pause();
    } catch (err) {
      console.warn("Pause error", err);
    }
  };

  const nextTrack = async () => {
    if (!player || !deviceId) return;
    try {
      await player.nextTrack();
    } catch (err) {
      console.warn("Next track error", err);
    }
  };

  // --- Track playback position ---
  useEffect(() => {
    if (!player) return;
    const interval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state?.duration) {
        setPosition((state.position / state.duration) * 100);
      } else setPosition(0);
    }, 2000);

    return () => clearInterval(interval);
  }, [player]);

  return {
    player,
    is_paused,
    is_active,
    position,
    deviceId,
    isReady,
    playTrack,
    play,
    pause,
    nextTrack,
    transferPlayback,
  };
};

export default useSpotifyPlayer;
