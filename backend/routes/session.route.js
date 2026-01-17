import { Router } from "express";
import { createSession } from "../controllers/session.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const sessionRouter = Router();

sessionRouter.post("/create", isLoggedIn, createSession);

export default sessionRouter;
