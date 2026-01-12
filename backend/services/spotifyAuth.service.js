// services/spotifyAuth.service.js

import axios from "axios";

export async function refreshSpotifyToken(refreshToken) {
    const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        process.env.SPOTIFY_CLIENT_ID +
                        ":" +
                        process.env.SPOTIFY_CLIENT_SECRET
                    ).toString("base64")
            }
        }
    );

    return response.data; // new access_token, maybe new refresh_token
}
