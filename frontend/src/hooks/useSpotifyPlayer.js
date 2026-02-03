import { useState, useEffect, useCallback, useRef } from "react";
import useAuthStore from "../store/authStore";
import useLiveSessionStore from "../store/liveSessionStore";
import { authService } from "../services/authService";

const useSpotifyPlayer = () => {
  const [player, setPlayer] = useState(null);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [position, setPosition] = useState(0);
  const [deviceId, setDeviceId] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const spotifyConnected = useAuthStore((state) => state.spotifyConnected);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setSpotifyConnected = useAuthStore(
    (state) => state.setSpotifyConnected
  );

  const sessionTrack = useLiveSessionStore((state) => state.currentTrack);
  const isPlaying = useLiveSessionStore((state) => state.isPlaying);

  const tokenRef = useRef(null);
  const scriptRef = useRef(null);

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
          body: JSON.stringify({
            device_ids: [device_id],
            play: false,
          }),
        });

        console.log("✅ Playback transferred");
      } catch (err) {
        console.error("Playback transfer failed", err);
      }
    },
    [getToken]
  );

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !spotifyConnected) return;

    if (!scriptRef.current) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    let playerInstance = null;

    window.onSpotifyWebPlaybackSDKReady = async () => {
      const token = await getToken();
      if (!token) return;

      playerInstance = new window.Spotify.Player({
        name: "VibeRadius Player",
        getOAuthToken: async (cb) => {
          const freshToken = await getToken();
          if (freshToken) cb(freshToken);
        },
        volume: 0.5,
      });

      setPlayer(playerInstance);

      playerInstance.addListener("ready", ({ device_id }) => {
        console.log("✅ Player ready", device_id);
        setDeviceId(device_id);
        transferPlayback(device_id);

        setIsReady(true);
      });

      playerInstance.addListener("not_ready", () => {
        setDeviceId(null);
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

    return () => {
      if (playerInstance) {
        playerInstance.disconnect();
      }
      window.onSpotifyWebPlaybackSDKReady = null;
    };
  }, [
    spotifyConnected,
    isAuthenticated,
    isInitializing,
    getToken,
    setSpotifyConnected,
    transferPlayback,
  ]);

  useEffect(() => {
    if (!player || !deviceId || !sessionTrack?.uri) return;

    let cancelled = false;

    const playTrack = async () => {
      const token = await getToken();
      if (!token || cancelled) return;

      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: [sessionTrack.uri],
          }),
        }
      );
    };

    playTrack();

    return () => {
      cancelled = true;
    };
  }, [sessionTrack?.id, deviceId, player, getToken]);

  useEffect(() => {
    if (!player || !deviceId) return;

    const syncPlayback = async () => {
      const token = await getToken();
      if (!token) return;

      const endpoint = isPlaying ? "play" : "pause";

      await fetch(
        `https://api.spotify.com/v1/me/player/${endpoint}?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    };

    syncPlayback();
  }, [isPlaying, deviceId, player, getToken]);

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

  return {
    player,
    is_paused,
    is_active,
    position,
    deviceId,
    isReady
  };
};

export default useSpotifyPlayer;
