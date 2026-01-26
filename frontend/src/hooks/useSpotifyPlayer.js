import { useState, useEffect, useCallback, useRef } from "react";
import useAuthStore from "../store/authStore";
import { authService } from "../services/authService";

const useSpotifyPlayer = () => {
  const [player, setPlayer] = useState(null);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState({
    name: "Loading...",
    artists: [{ name: "Loading..." }],
    album: { images: [{ url: "" }] },
  });
  const [position, setPosition] = useState(0);
  const [deviceId, setDeviceId] = useState(null);

  const spotifyConnected = useAuthStore((state) => state.spotifyConnected);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const setSpotifyConnected = useAuthStore(
    (state) => state.setSpotifyConnected
  );

  const tokenRef = useRef(null);
  const scriptRef = useRef(null);

  // Function to get fresh token
  const getToken = useCallback(async () => {
    try {
      const res = await authService.spotifyToken();
      console.log("🔍 Token Response:", res.data);
      console.log(
        "🔍 Access Token (first 30 chars):",
        res.data.access_token?.substring(0, 30)
      );
      console.log("🔍 Token expires at:", res.data.expires_at);
      tokenRef.current = res.data.access_token;
      return res.data.access_token;
    } catch (error) {
      console.error("❌ Failed to get Spotify token:", error);
      console.error("❌ Error response:", error.response?.data);
      console.error("Failed to get Spotify token:", error);
      setSpotifyConnected(false);
      return null;
    }
  }, [setSpotifyConnected]);

  // Transfer playback function
  const transferPlayback = useCallback(async (device_id) => {
    try {
      const token = tokenRef.current;
      if (!token) return;

      const response = await fetch("https://api.spotify.com/v1/me/player", {
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

      if (response.ok) {
        console.log("✅ Playback transferred to VibeRadius");
      } else if (response.status === 403) {
        console.warn(
          "⚠️ Missing scope: user-modify-playback-state. Please reconnect Spotify."
        );
      }
    } catch (error) {
      console.error("Failed to transfer playback:", error);
    }
  }, []);

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !spotifyConnected) {
      console.log("⏳ Waiting for auth...", {
        isInitializing,
        isAuthenticated,
        spotifyConnected,
      });
      return;
    }

    // Check if script already exists
    if (!scriptRef.current) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    let playerInstance = null;

    window.onSpotifyWebPlaybackSDKReady = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        playerInstance = new window.Spotify.Player({
          name: "VibeRadius Player",
          getOAuthToken: async (cb) => {
            const freshToken = await getToken();
            if (freshToken) {
              cb(freshToken);
            }
          },
          volume: 0.5,
        });

        setPlayer(playerInstance);

        playerInstance.addListener("ready", ({ device_id }) => {
          console.log("✅ Ready with Device ID", device_id);
          setDeviceId(device_id);
          transferPlayback(device_id);
        });

        playerInstance.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
          setDeviceId(null);
        });

        playerInstance.addListener("initialization_error", ({ message }) => {
          console.error("❌ Initialization error:", message);
        });

        playerInstance.addListener(
          "authentication_error",
          async ({ message }) => {
            console.error("❌ Authentication error:", message);
            const newToken = await getToken();
            if (!newToken) {
              setSpotifyConnected(false);
            }
          }
        );

        playerInstance.addListener("account_error", ({ message }) => {
          console.error("❌ Account error:", message);
          setSpotifyConnected(false);
        });

        const success = await playerInstance.connect();
        if (success) {
          console.log("🎵 Spotify Player connected successfully!");
        }
      } catch (error) {
        console.error("Spotify init failed", error);
      }
    };

    return () => {
      if (playerInstance) {
        playerInstance.removeListener("ready");
        playerInstance.removeListener("not_ready");
        playerInstance.removeListener("initialization_error");
        playerInstance.removeListener("authentication_error");
        playerInstance.removeListener("account_error");
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
  ]); // ADD isAuthenticated, isInitializing

  useEffect(() => {
    if (!player) return;

    const handleStateChange = (state) => {
      if (!state) {
        setActive(false);
        return;
      }

      setTrack(state.track_window.current_track);
      setPaused(state.paused);
      setActive(true);
    };

    player.addListener("player_state_changed", handleStateChange);

    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (state?.duration) {
          setPosition((state.position / state.duration) * 100);
        } else {
          setPosition(0);
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      player.removeListener("player_state_changed", handleStateChange);
    };
  }, [player]);

  return {
    player,
    is_paused,
    is_active,
    current_track,
    position,
    deviceId,
  };
};

export default useSpotifyPlayer;
