import { Router } from "express";
import { loginController, signupController } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup",signupController)
authRouter.post("/login",loginController)

export default authRouter;