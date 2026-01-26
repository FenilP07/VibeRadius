import {
  FaPlay,
  FaStepForward,
  FaPause,
  FaUsers,
  FaMusic,
  FaQrcode,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { NavbarAdmin } from "../components/admin/NavbarAdmin";
import useAuthStore from "../store/authStore";
import { authService } from "../services/authService";

const SpotifyPlayer = () => {
  //   const token = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN;
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
          getOAuthToken: (cb) => {
            cb(token);
          },
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
      } catch (error) {}
    };

    return () => {
      if (playerInstance) {
        playerInstance.removeListener("ready");
        playerInstance.removeListener("not_ready");
        playerInstance.removeListener("initialization_error");
        playerInstance.removeListener("authentication_error");
        playerInstance.removeListener("account_error");
      }
      document.body.removeChild(script);
      window.onSpotifyWebPlaybackSDKReady = null;
    };
  }, [spotifyConnected]);

  useEffect(() => {
    if (player === null) return;

    const handleStateChange = (state) => {
      if (!state) {
        return;
      }

      setTrack(state.track_window.current_track);
      setPaused(state.paused);

      player.getCurrentState().then((state) => {
        !state ? setActive(false) : setActive(true);
      });
    };

    player.addListener("player_state_changed", handleStateChange);

    const interval = setInterval(() => {
      player.getCurrentState().then((state) => {
        if (state?.duration) {
          const progress = (state.position / state.duration) * 100;
          setPosition(progress);
        } else {
          setPosition(0);
        }
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      player.removeListener("player_state_changed", handleStateChange);
      player.disconnect();
    };
  }, [player]);

  return (
    <div className="min-h-screen bg-surface-bg">
      <NavbarAdmin />

      <main className="max-w-7xl mx-auto p-6 lg:p-10">
        {/* Welcome Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Morning Brew Café
            </h1>
            <p className="text-text-secondary">Session active since 08:00 AM</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-surface border-2 border-primary text-primary px-5 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary-subtle transition-colors">
              <FaQrcode /> View QR Code
            </button>
            <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-medium transition-colors">
              End Session
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-xl shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-xs uppercase tracking-wider">
                  In Queue
                </p>
                <p className="text-3xl font-bold text-primary mt-1">12</p>
              </div>
              <div className="bg-surface p-6 rounded-xl shadow-sm border border-primary-subtle">
                <p className="text-text-muted text-xs uppercase tracking-wider">
                  Listeners
                </p>
                <p className="text-3xl font-bold text-accent mt-1">48</p>
              </div>
            </div>

            {/* Now Playing Card */}
            <div className="bg-accent-dark text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-primary/20 text-primary-light text-[10px] uppercase font-bold px-2 py-1 rounded-full border border-primary/30">
                  Now Playing
                </span>
                <h3 className="text-xl font-bold mt-4 leading-tight">
                  {current_track.name}
                </h3>
                <p className="text-white/70 text-sm">
                  {current_track.artists[0].name} • Requested by Table 4
                </p>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer"
                    onClick={() => {
                      player?.togglePlay();
                    }}
                  >
                    {is_paused ? (
                      <FaPlay className="ml-1" />
                    ) : (
                      <FaPause className="ml-1" />
                    )}
                  </button>
                  <button
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer"
                    onClick={() => {
                      player?.nextTrack();
                    }}
                  >
                    <FaStepForward />
                  </button>
                  <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-1 bg-white rounded-full transition-all"
                      style={{ width: `${position}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>

          {/* Right Column: Live Queue */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-2xl shadow-sm border border-primary-subtle overflow-hidden">
              <div className="p-6 border-b border-primary-subtle flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary">
                  Upcoming Queue
                </h2>
                <span className="text-sm text-primary font-medium">
                  Auto-accept: ON
                </span>
              </div>

              <div className="divide-y divide-primary-subtle">
                {[
                  {
                    title: "Blinding Lights",
                    artist: "The Weeknd",
                    table: "Table 12",
                    time: "2 min ago",
                  },
                  {
                    title: "Espresso",
                    artist: "Sabrina Carpenter",
                    table: "Table 5",
                    time: "5 min ago",
                  },
                  {
                    title: "Heat Waves",
                    artist: "Glass Animals",
                    table: "Bar 2",
                    time: "8 min ago",
                  },
                ].map((song, i) => (
                  <div
                    key={i}
                    className="p-4 hover:bg-surface-alt transition-colors flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 bg-primary-subtle rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <FaMusic />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-primary">
                        {song.title}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {song.artist}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-accent">
                        {song.table}
                      </p>
                      <p className="text-xs text-text-muted">{song.time}</p>
                    </div>
                    <button className="text-text-muted hover:text-error p-2">
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-surface-alt text-center">
                <button className="text-primary font-semibold text-sm hover:underline">
                  View All Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpotifyPlayer;
