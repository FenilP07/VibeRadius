import axios from "axios";
import SpotifyToken from "../models/spotifyToken.model.js";
import { APIError } from "../utils/ApiError.js";
import logger from "../utils/logger.js";

export const refreshSpotifyToken = async (userId) => {
  try {
    console.log(`Refreshing token for user: ${userId}`);

    const currentToken = await SpotifyToken.findOne({ userId });

    if (!currentToken) {
      throw new APIError(404, "No Spotify Token Found for this user");
    }

    const { accessToken, refreshToken, expiresAt } = currentToken;

    if (
      expiresAt &&
      new Date(expiresAt) > new Date(Date.now() + 5 * 60 * 1000)
    ) {
      logger.debug(`Token still valid until: ${expiresAt} for user ${userId}`);
      return { accessToken, refreshToken, expiresAt };
    }

    logger.info(`Token expired, refreshing for user ${userId}`);

    const tokenURI =
      process.env.SPOTIFY_TOKEN_URI || "https://accounts.spotify.com/api/token";

    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString();

    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(tokenURI, body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      timeout: 10000,
    });

    const {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: expiresIn,
      scope: newScope,
    } = response.data;

    const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

    const updated = await SpotifyToken.findOneAndUpdate(
      { userId },
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshToken,
        expiresAt: newExpiresAt,
        scope: newScope || currentToken.scope,
        lastRefreshed: new Date(),
      },
      { new: true, upsert: false }
    );

    if (!updated) {
      throw new APIError(500, "Failed to refresh spotify token");
    }

    logger.info(`Spotify token refreshed for ${userId} until ${newExpiresAt}`);

    return {
      accessToken: newAccessToken,
      expiresAt: newExpiresAt,
      scope: newScope || currentToken.scope,
    };
  } catch (error) {
    logger.error("Error in refreshSpotifyToken:", error);
    throw error;
  }
};
