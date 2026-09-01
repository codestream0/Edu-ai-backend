import { Router } from "express";
import { loginController, signupController,getMe, refreshToken, logout } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/signup",signupController)
authRouter.post("/login",loginController)
authRouter.post("/refresh-token",refreshToken)
authRouter.post("/logout",logout)
authRouter.get("/me",authMiddleware,getMe)

export default authRouter;