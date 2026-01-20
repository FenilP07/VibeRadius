import {
  registerUser,
  loginUser,
  logoutUser,
  getUserById,
  getCurrentUser,
  getUserByEmail,
  deleteUser,
  refreshAccessToken,
} from "../controllers/user.contorller.js";
import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const authRouter = Router();

// Public routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/refresh-token", refreshAccessToken);

// Protected routes
authRouter.post("/logout", isLoggedIn, logoutUser);
authRouter.get("/verify-token", isLoggedIn, getCurrentUser);

authRouter.get("/email/:email", isLoggedIn, getUserByEmail);
authRouter.get("/:id", isLoggedIn, getUserById);
// authRouter.delete("/:id", isLoggedIn, deleteUser);

export default authRouter;
