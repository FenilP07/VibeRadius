import { searchTrackController } from "../controllers/spotify/searchTrack.controller.js";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { refreshSpotifyToken } from "../services/refreshSpotifyTokenService.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import SpotifyToken from "../models/spotifyToken.model.js";

const spotifyRouter = Router();

spotifyRouter.get("/search", searchTrackController);

spotifyRouter.get(
  "/test-spotify-token",
  isLoggedIn,
  refreshSpotifyToken,
  asyncHandler(async (req, res) => {
    res.json({ message: "Token fresh", userId: req.user._id });
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

export default spotifyRouter;
