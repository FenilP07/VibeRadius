import { Router } from "express";
import { createSession } from "../controllers/session.controller.js";

const sessionRouter = Router();

sessionRouter.post("/create", createSession);

export default sessionRouter;
