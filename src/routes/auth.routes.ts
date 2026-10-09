import { Router } from "express";
import {
  loginController,
  signupController,
  getMe,
  refreshToken,
  logout,
  forgotPasswordController,
  resetPasswordController,
  changePasswordController,
  getPreferencesController,
  updatePreferencesController,
  updateProfileController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.post("/forgot-password", forgotPasswordController);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/reset-password", resetPasswordController);
authRouter.post("/logout", logout);
authRouter.patch("/profile", authMiddleware,updateProfileController);
authRouter.patch("/change-password",authMiddleware,changePasswordController);
authRouter.get("/preferences",authMiddleware,getPreferencesController);
authRouter.patch("/preferences",authMiddleware,updatePreferencesController)
authRouter.get("/me", authMiddleware, getMe);

export default authRouter;
