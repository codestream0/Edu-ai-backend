import {sendAiMessageController} from "../controllers/ai-chat.controller";
import {Router} from "express";
import {authMiddleware} from "../middleware/auth.middleware";

const chatRouter = Router();

chatRouter.post("/chat", authMiddleware, sendAiMessageController);

export default chatRouter;