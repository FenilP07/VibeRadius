// middleware/ensureSpotifyToken.js
import { asyncHandler } from "../utils/asyncHandler.js";
import { refreshSpotifyToken } from "../../services/refreshSpotifyTokenService.js";
import { APIError } from "../../utils/ApiError.js";
import logger from "../../utils/logger.js";

export const ensureSpotifyToken = asyncHandler(async (req, res, next) => {
  // Fail early and clearly if no authenticated user
  if (!req.user || !req.user._id) {
    logger.warn("Spotify token requested but no authenticated user", {
      path: req.path,
      ip: req.ip,
    });
    throw new APIError(401, "Authentication required to access Spotify features");
  }

  const userId = req.user._id;

  logger.info(`ensureSpotifyToken - processing for user ${userId}`, {
    path: req.path,
  });

  try {
    const tokenData = await refreshSpotifyToken(userId);

    req.spotifyAccessToken = tokenData.accessToken;
    // Optional: add more fields if needed later
    // req.spotify = {
    //   accessToken: tokenData.accessToken,
    //   expiresAt: tokenData.expiresAt,
    //   scope: tokenData.scope,
    // };

    next();
  } catch (err) {
    // Optional: add context before passing to global error handler
    logger.error("Failed to ensure Spotify token", {
      userId,
      error: err.message,
      path: req.path,
    });
    next(err); // let global handler format response
  }
});