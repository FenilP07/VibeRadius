import express from 'express';
import { Router } from 'express';
import loginSpotifyController from '../controllers/spotify/auth.spotify.controller.js';
const spotifyAuthRouter = Router();

// attach controller - to do
spotifyAuthRouter.get('/', loginSpotifyController)


export default spotifyAuthRouter;