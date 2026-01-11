import { searchTrackController } from "../controllers/spotify/searchTrack.controller.js";
import { Router } from "express";


const spotifyRouter = Router();

spotifyRouter.post("/search", searchTrackController);


export default spotifyRouter;