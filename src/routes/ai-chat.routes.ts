import {sendAiMessageController,} from "../controllers/ai-chat.controller";
import {deleteConversationController,getConversationController,getUserConversationsController} from "../controllers/ai-conversation.controller"
import {Router} from "express";
import {authMiddleware} from "../middleware/auth.middleware";

const chatRouter = Router();

chatRouter.post("/chat", authMiddleware, sendAiMessageController);
chatRouter.get("/conversations",authMiddleware,getUserConversationsController);
chatRouter.get("/conversations/:conversationId",authMiddleware,getConversationController);
chatRouter.delete("/conversations/:conversationId",authMiddleware,deleteConversationController)


export default chatRouter;