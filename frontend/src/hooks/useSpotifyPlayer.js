import { useState, useEffect, useCallback, useRef } from "react";
import useAuthStore from "../store/authStore";
import useLiveSessionStore from "../store/liveSessionStore";
import { authService } from "../services/authService";

let globalPlayer = null;
let globalDeviceId = null;
let globalReady = false;
let sdkLoading = false;
let sdkLoaded = false;

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

  // --- Get fresh Spotify token ---
  const getToken = useCallback(async () => {
    try {
      console.log("Fetching Spotify token...");
      const res = await authService.spotifyToken();
      tokenRef.current = res.data.access_token;
      return res.data.access_token;
    } catch (error) {
      console.error("Spotify token failed", error);
      setSpotifyConnected(false);
      return null;
    }
  }, [setSpotifyConnected]);

  // --- Transfer playback to this device safely ---
  const transferPlayback = useCallback(
    async (device_id) => {
      const token = await getToken();
      if (!token) return;

      try {
        // Get available devices
        console.log("Checking available devices for transfer...");
        const devicesRes = await fetch(
          "https://api.spotify.com/v1/me/player/devices",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const devicesData = await devicesRes.json();
        const availableDevice = devicesData.devices.find(
          (d) => d.id === device_id
        );

        if (!availableDevice) {
          console.warn(
            "VibeRadius device not available yet (not in /devices list)"
          );
          return;
        }

        console.log("Device id for transfer:", device_id);
        // Transfer playback
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        });
        console.log("✅ Playback transferred to device:", availableDevice.name);
      } catch (err) {
        console.warn("Playback transfer failed", err);
      }
    },
    [getToken]
  );

  // --- Initialize Spotify SDK and player ---
  useEffect(() => {
    console.log("Initializing Spotify Player...");
    if (isInitializing || !isAuthenticated || !spotifyConnected) return;

    console.log("Spotify auth ready, setting up player...");
    if (globalPlayer && globalDeviceId) {
      setPlayer(globalPlayer);
      setDeviceId(globalDeviceId);
      setIsReady(globalReady);
      return;
    }

    console.log("Loading Spotify SDK...");
    if (!sdkLoading && !sdkLoaded) {
      sdkLoading = true;
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    console.log("Spotify Player setup complete");
    const initializePlayer = async () => {
      if (globalPlayer) return;
      console.log("Creating new Spotify Player instance...");
      const token = await getToken();
      if (!token) return;

      const playerInstance = new window.Spotify.Player({
        name: "VibeRadius Player",
        getOAuthToken: async (cb) => {
          const freshToken = await getToken();
          if (freshToken) cb(freshToken);
        },
        volume: 0.5,
      });

      if(!playerInstance) {
        console.error("Failed to create Spotify Player instance");
        return;
      }
      
      console.log("Spotify Player instance created:", playerInstance);

      playerInstance.addListener("ready", async ({ device_id }) => {
        console.log("✅ Player ready", device_id);
        globalPlayer = playerInstance;
        globalDeviceId = device_id;
        setPlayer(playerInstance);
        setDeviceId(device_id);

        await transferPlayback(device_id, false);
        globalReady = true;
        setIsReady(true);
      });

      playerInstance.addListener("not_ready", () => {
        globalReady = false;
        setIsReady(false);
      });

      playerInstance.addListener("authentication_error", async () => {
        const newToken = await getToken();
        if (!newToken) setSpotifyConnected(false);
      });

      playerInstance.addListener("account_error", () =>
        setSpotifyConnected(false)
      );

      playerInstance.addListener("player_state_changed", (state) => {
        if (!state) {
          setActive(false);
          return;
        }

        // setPaused(state.paused);
        const currentId = state.track_window?.current_track?.id;
        console.log("Current track ID:", currentId, "Position:");
        if (currentId && lastTrackIdRef.current !== currentId) {
          lastTrackIdRef.current = currentId;
          endedFiredRef.current = false;
        }

        const ended =
          state.paused === true &&
          state.position === 0 &&
          currentId &&
          lastTrackIdRef.current === currentId;

          console.log("Track ended condition:", ended)

        if (ended && !endedFiredRef.current) {
          endedFiredRef.current = true;
          window.__onSpotifyTrackEnded?.();
        }

        playerInstance.getCurrentState().then((currentState) => {
          !currentState ? setActive(false) : setActive(true);
        });
      });

      await playerInstance.connect();
    };

    if (window.Spotify) {
      sdkLoaded = true;
      initializePlayer();
    } else {
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
