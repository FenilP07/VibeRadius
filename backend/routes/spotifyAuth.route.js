import express from "express";
import { Router } from "express";
import loginSpotifyController from "../controllers/spotify/auth.spotify.controller.js";
import handleSpotifyCallback from "../controllers/spotify/callback.spotify.controller.js";
import {isLoggedIn} from "../middlewares/auth.middleware.js"

const spotifyAuthRouter = Router();

spotifyAuthRouter.get("/login", isLoggedIn, loginSpotifyController);

spotifyAuthRouter.get("/callback", isLoggedIn, handleSpotifyCallback);

export default spotifyAuthRouter;
