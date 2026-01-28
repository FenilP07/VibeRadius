

const useSpotifyWebPlayback = () => {
    const token = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN;
    const [player, setPlayer] = useState(null);
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [current_track, setTrack] = useState({
        name: "Loading...",
        artists: [{ name: "Loading..." }],
        album: { images: [{ url: "" }] }
    });
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = import.meta.env.VITE_SPOTIFY_SDK_URL;
        script.async = true;

        document.body.appendChild(script);

        let playerInstance = null;

        window.onSpotifyWebPlaybackSDKReady = async () => {
            playerInstance = new window.Spotify.Player({
                name: "VibeRadius Player",
                getOAuthToken: cb => { cb(token); },
                volume: 0.5
            });

            setPlayer(playerInstance);

            playerInstance.addListener("ready", ({ device_id }) => {
                console.log("Ready with Device ID", device_id);
            });

            playerInstance.addListener("not_ready", ({ device_id }) => {
                console.log("Device ID has gone offline", device_id);
            });

            playerInstance.addListener("initialization_error", ({ message }) => {
                console.error(message)
            })

            playerInstance.addListener("authentication_error", ({ message }) => {
                console.error(message);
            })

            playerInstance.addListener("account_error", ({ message }) => {
                console.error(message);
            })

            playerInstance.connect();
        }

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
        }
    }, []);

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
        }
    }, [player]);
}