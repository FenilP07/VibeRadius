import { Router } from "express";
import {
  createSession,
  deleteSession,
  getMySession,
  joinSession,
  sessionStatusChange,
} from "../controllers/session.controller.js";
import { isHost } from "../middlewares/host.middleware.js";

const sessionRouter = Router();

sessionRouter.post("/create", isHost, createSession);
sessionRouter.get("/my", getMySession);
sessionRouter.post("/join", joinSession);
sessionRouter.delete("/:id/", isHost, deleteSession);
sessionRouter.patch("/:id/status", isHost, sessionStatusChange);

export default sessionRouter;
