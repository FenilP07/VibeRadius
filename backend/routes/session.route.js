import { Router } from "express";
import {
  createSession,
  getMySession,
} from "../controllers/session.controller.js";
import { isHost } from "../middlewares/host.middleware.js";

const sessionRouter = Router();

sessionRouter.post("/create", isHost, createSession);
sessionRouter.get("/my", getMySession);

export default sessionRouter;
