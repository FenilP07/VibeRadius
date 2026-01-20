import { searchTrackController } from "../controllers/spotify/searchTrack.controller.js";
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { refreshSpotifyToken } from "../services/refreshSpotifyTokenService.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const spotifyRouter = Router();

spotifyRouter.get("/search", searchTrackController);

spotifyRouter.get(
  '/test-spotify-token',
  isLoggedIn,               
  refreshSpotifyToken,
  asyncHandler(async (req, res) => {
    res.json({ message: "Token fresh", userId: req.user._id });
  })
);


export default spotifyRouter;