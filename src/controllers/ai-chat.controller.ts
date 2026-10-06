import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { sendMessageSchema } from "../validations/ai-chat.validation";
import { sendMessage } from "../services/ai-chat.service";

export const sendAiMessageController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const parsed = sendMessageSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
        errors: parsed.error.flatten(),
      });
    }

    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const sentMessageResult = await sendMessage({
      userId: req.user.userId,
      conversationId: parsed.data.conversationId,
      message: parsed.data.message,
    });
    return res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      data: sentMessageResult,
    });
  } catch (error) {
    console.error("Error in sendAiMessageController:", error);

    if (error instanceof Error) {
      if (error.message === "Conversation not found") {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      if (error.message === "Invalid conversation ID") {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
      }

      if (error.message === "Invalid user ID") {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (error.message === "Message cannot be empty") {
        return res.status(400).json({
          success: false,
          message: "Message cannot be empty",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate AI response",
    });
  }
};
