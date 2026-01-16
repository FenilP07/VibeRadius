import express from 'express';
import { Router } from 'express';
import loginSpotifyController from '../controllers/spotify/auth.spotify.controller.js';
import handleSpotifyCallback from '../controllers/spotify/callback.spotify.controller.js';

const spotifyAuthRouter = Router();

spotifyAuthRouter.get('/login', loginSpotifyController);

spotifyAuthRouter.get('/callback', handleSpotifyCallback);



export default spotifyAuthRouter;