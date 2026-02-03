import { useState, useEffect, useCallback, useRef } from "react";
import useAuthStore from "../store/authStore";
import useLiveSessionStore from "../store/liveSessionStore";
import { authService } from "../services/authService";

let globalPlayer = null;
let globalDeviceId = null;
let globalReady = false;
let sdkLoading = false;
let sdkLoaded = false;

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

  const sessionTrack = useLiveSessionStore((state) => state.currentTrack);
  const isPlaying = useLiveSessionStore((state) => state.isPlaying);

  const tokenRef = useRef(null);

  const getToken = useCallback(async () => {
    try {
      const res = await authService.spotifyToken();
      tokenRef.current = res.data.access_token;
      return res.data.access_token;
    } catch (error) {
      console.error("Spotify token failed", error);
      setSpotifyConnected(false);
      return null;
    }
  }, [setSpotifyConnected]);

  const transferPlayback = useCallback(
    async (device_id) => {
      try {
        const token = await getToken();
        if (!token) return;

        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        });

        console.log("✅ Playback transferred");
      } catch (err) {
        console.warn("Playback transfer failed", err);
      }
    },
    [getToken]
  );

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
      if (globalPlayer) return;

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

      playerInstance.addListener("ready", async ({ device_id }) => {
        console.log("✅ Player ready", device_id);

        globalPlayer = playerInstance;
        globalDeviceId = device_id;

        setPlayer(playerInstance);
        setDeviceId(device_id);

        await transferPlayback(device_id);
        await new Promise((res) => setTimeout(res, 400));

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

      playerInstance.addListener("account_error", () => {
        setSpotifyConnected(false);
      });

      playerInstance.addListener("player_state_changed", (state) => {
        if (!state) {
          setActive(false);
          return;
        }
        setPaused(state.paused);
        setActive(true);
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

  useEffect(() => {
    if (!player || !deviceId || !isReady || !sessionTrack?.uri) return;

    let cancelled = false;

    const playTrack = async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      try {
        await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [sessionTrack.uri] }),
          }
        );
      } catch (err) {
        console.warn("Spotify play error", err);
      }
    };

    playTrack();

    return () => {
      cancelled = true;
    };
  }, [sessionTrack?.id, deviceId, player, isReady, getToken]);

  useEffect(() => {
    if (!player || !deviceId || !isReady) return;

    const syncPlayback = async () => {
      const token = await getToken();
      if (!token) return;

      const endpoint = isPlaying ? "play" : "pause";

      try {
        await fetch(
          `https://api.spotify.com/v1/me/player/${endpoint}?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.warn("Spotify sync error", err);
      }
    };

    syncPlayback();
  }, [isPlaying, deviceId, player, isReady, getToken]);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(async () => {
      const state = await player.getCurrentState();
      if (state?.duration) {
        setPosition((state.position / state.duration) * 100);
      } else {
        setPosition(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player]);

  useEffect(() => {
    return () => {
      setPlayer(null);
      setPaused(false);
      setActive(false);
      setPosition(0);
      setDeviceId(globalDeviceId);
      setIsReady(globalReady);
    };
  }, []);

  return { player, is_paused, is_active, position, deviceId, isReady };
};

export default useSpotifyPlayer;
