import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  getUserById,
  getUserByEmail,
  getSocketToken,
} from "../controllers/user.contorller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// Public routes (NO authentication required)
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh-token", refreshAccessToken);

// Protected routes (authentication required)
authRouter.post("/logout", isLoggedIn, logoutUser);
authRouter.get("/verify-token", isLoggedIn, getCurrentUser);
authRouter.get("/socket-token", isLoggedIn, getSocketToken);
authRouter.get("/email/:email", isLoggedIn, getUserByEmail);
authRouter.get("/:id", isLoggedIn, getUserById);
// authRouter.delete("/:id", isLoggedIn, deleteUser);

export default authRouter;
