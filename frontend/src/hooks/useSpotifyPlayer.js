import { useState, useEffect } from "react";
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

  const spotifyConnected = useAuthStore((state) => state.spotifyConnected);

  useEffect(() => {
    if (!spotifyConnected) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    let playerInstance = null;

    window.onSpotifyWebPlaybackSDKReady = async () => {
      try {
        const res = await authService.spotifyToken();
        const token = res.data.accessToken;

        playerInstance = new window.Spotify.Player({
          name: "VibeRadius Player",
          getOAuthToken: (cb) => cb(token),
          volume: 0.5,
        });

        setPlayer(playerInstance);

        playerInstance.addListener("ready", ({ device_id }) => {
          console.log("Ready with Device ID", device_id);
        });

        playerInstance.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
        });

        playerInstance.addListener("initialization_error", ({ message }) => {
          console.error(message);
        });

        playerInstance.addListener("authentication_error", ({ message }) => {
          console.error(message);
        });

        playerInstance.addListener("account_error", ({ message }) => {
          console.error(message);
        });

        await playerInstance.connect();
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

      document.body.removeChild(script);
      window.onSpotifyWebPlaybackSDKReady = null;
    };
  }, [spotifyConnected]);

  useEffect(() => {
    if (!player) return;

    const handleStateChange = (state) => {
      if (!state) return;

      setTrack(state.track_window.current_track);
      setPaused(state.paused);

      player.getCurrentState().then((s) => {
        setActive(!!s);
      });
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
  };
};

export default useSpotifyPlayer;
