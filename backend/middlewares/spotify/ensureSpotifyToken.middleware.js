import { asyncHandler } from "../../utils/asyncHandler.js";
import { refreshSpotifyToken } from "../../services/refreshSpotifyTokenService.js";
import { APIError } from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";

export const ensureSpotifyToken = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user._id) {
    logger.warn("Spotify token requested but no authenticated user");
    throw new APIError(
      401,
      "Authentication required to access Spotify features"
    );
  }

  const userId = req.user._id;
  logger.info(`ensureSpotifyToken - processing for user ${userId}`);

  try {
    const tokenData = await refreshSpotifyToken(userId);

    req.spotifyAccessToken = tokenData.accessToken;
    req.spotifyTokenExpiry = tokenData.expiresAt;

    next();
  } catch (err) {
    logger.error("Failed to ensure Spotify token", {
      userId,
      error: err.message,
    });
    next(err);
  }
});
