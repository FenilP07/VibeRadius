import { Router } from "express";

import {
  createSession,
  deleteSession,
  getDashboardData,
  getMySession,
  joinSession,
  sessionStatusChange,
} from "../controllers/session.controller.js";
import { isHost } from "../middlewares/host.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const sessionRouter = Router();

sessionRouter.post("/create", isLoggedIn, isHost, createSession);
sessionRouter.get("/my", isLoggedIn, isHost, getMySession);
sessionRouter.get("/dashboard", isLoggedIn, isHost, getDashboardData);
sessionRouter.post("/join", joinSession);
sessionRouter.delete("/:sessionId/", isLoggedIn, isHost, deleteSession);
sessionRouter.patch("/:sessionId/status", isLoggedIn, isHost, sessionStatusChange);

export default sessionRouter;
