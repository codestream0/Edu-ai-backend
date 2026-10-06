import { Response } from "express";
// import { Conversation } from "../models/conversation.model";
import mongoose from "mongoose";
import {
  deleteConversation,
  getConversation,
  getUserConversations,
} from "../services/ai-conversation.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const getUserConversationsController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversations = await getUserConversations(req.user.userId);
    res.status(200).json({
      success: true,
      message: " conversations retrieved successfully",
      data: conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    if (error instanceof Error && error.message === "Invalid user ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

export async function getConversationController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const result = await getConversation(req.user.userId, conversationId);
    console.log("req.params:", req.params);
    console.log("conversationId:", conversationId);
    console.log("is valid:", mongoose.Types.ObjectId.isValid(conversationId));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get conversation error:", error);

    if (error instanceof Error) {
      if (error.message === "Invalid user ID") {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (error.message === "Invalid conversation ID") {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
      }

      if (error.message === "Conversation not found") {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
    });
  }
}

export async function deleteConversationController(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const conversationId = Array.isArray(req.params.conversationId)
      ? req.params.conversationId[0]
      : req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    await deleteConversation(req.user.userId, conversationId);

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Delete conversation error:", error);

    if (error instanceof Error) {
      if (error.message === "Invalid user ID") {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      if (error.message === "Invalid conversation ID") {
        return res.status(400).json({
          success: false,
          message: "Invalid conversation ID",
        });
      }

      if (error.message === "Conversation not found") {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
    });
  }
}
