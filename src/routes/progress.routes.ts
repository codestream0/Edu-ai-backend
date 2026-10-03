
import { Router } from "express";
import { getProgress } from "../controllers/progress.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const progressRouter = Router();

progressRouter.get("/get-progress", authMiddleware, getProgress);

export default progressRouter;
