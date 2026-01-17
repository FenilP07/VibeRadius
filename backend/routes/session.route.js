import { Router } from "express";
import { createSession } from "../controllers/session.controller.js";
import { isHost } from "../middlewares/host.middleware.js";

const sessionRouter = Router();

sessionRouter.post("/create", isHost, createSession);

export default sessionRouter;
