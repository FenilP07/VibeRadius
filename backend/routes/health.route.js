import { Router } from "express";
import { healthCheck } from "../controllers/health.controllers.js";
const healthRouter = Router();

healthRouter.get("/", healthCheck);

export default healthRouter;