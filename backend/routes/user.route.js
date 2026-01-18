import { registerUser, loginUser, logoutUser, getUserById, getUserByEmail, deleteUser } from "../controllers/user.contorller.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/logout", logoutUser);
authRouter.get("/:id", getUserById);
authRouter.get("/email/:email", getUserByEmail);
authRouter.delete("/:id", deleteUser);
export default authRouter;