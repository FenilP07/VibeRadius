import { registerUser, loginUser, logoutUser, getUserById, getCurrentUser,getUserByEmail, deleteUser } from "../controllers/user.contorller.js";
import { Router } from "express";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);

authRouter.get("/verify-token",isLoggedIn,getCurrentUser)

authRouter.get("/email/:email", getUserByEmail);

authRouter.get("/:id", getUserById);
authRouter.delete("/:id", deleteUser);

export default authRouter;