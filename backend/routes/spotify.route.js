// routes/spotify.js
import { searchTrackController } from "../controllers/spotify/searchTrack.controller.js";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { refreshSpotifyToken } from "../services/refreshSpotifyTokenService.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import SpotifyToken from "../models/spotifyToken.model.js";
import { ensureSpotifyToken } from "../middlewares/spotify/ensureSpotifyToken.middleware.js";

const spotifyRouter = Router();

spotifyRouter.get("/search", searchTrackController);

spotifyRouter.get(
  "/test-spotify-token",
  isLoggedIn,
  ensureSpotifyToken,
  asyncHandler(async (req, res) => {
    res.json({
      message: "Token fresh",
      userId: req.user._id,
      hasToken: !!req.spotifyAccessToken,
    });
  })
);

spotifyRouter.get(
  "/status",
  isLoggedIn,
  asyncHandler(async (req, res) => {
    const token = await SpotifyToken.findOne({ userId: req.user._id });

    res.json({
      connected: !!token?.refreshToken,
    });
  })
);

spotifyRouter.get(
  "/token",
  isLoggedIn,
  ensureSpotifyToken,
  asyncHandler(async (req, res) => {
    res.json({
      access_token: req.spotifyAccessToken,
      expires_at: req.spotifyTokenExpiry,
      token_type: "Bearer",
    });
  })
);

export default spotifyRouter;
