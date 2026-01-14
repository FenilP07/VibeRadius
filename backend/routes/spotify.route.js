import { searchTrackController } from "../controllers/spotify/searchTrack.controller.js";
import { Router } from "express";


const spotifyRouter = Router();

spotifyRouter.get("/search", searchTrackController);


export default spotifyRouter;