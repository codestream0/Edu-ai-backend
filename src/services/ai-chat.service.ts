import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";
import {
  generateAIResponse,
  ChatMessage,
} from "./chat-ai.service";
import { EDU_AI_SYSTEM_PROMPT } from "../config/ai";

interface SendMessageParams {
  userId: string;
  conversationId?: string;
  message: string;
}

interface SendMessageResult {
  conversationId: string;
  userMessage: {
    id: string;
    role: "user";
    content: string;
  };
  assistantMessage: {
    id: string;
    role: "assistant";
    content: string;
  };
}

export const sendMessage = async ({
  userId,
  conversationId,
  message,
}: SendMessageParams): Promise<SendMessageResult> => {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new Error("Message cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  let conversation;

// 1. Create a new conversation

  if (!conversationId) {
    conversation = await Conversation.create({
      user: userId,
      title: trimmedMessage.slice(0, 80),
    });
  } else {
    // 2. Find existing conversation

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new Error("Invalid conversation ID");
    }

    conversation = await Conversation.findOne({
      _id: conversationId,
      user: userId,
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }
  }

  // 3. Save user's message

  const userMessage = await Message.create({
    conversation: conversation._id,
    role: "user",
    content: trimmedMessage,
  });

  // 4. Get conversation history

  const history = await Message.find({
    conversation: conversation._id,
  })
    .sort({ createdAt: 1 })
    .lean();


  // 5. Convert MongoDB messages to AI messages

  const aiMessages: ChatMessage[] = history.map((message) => ({
    role: message.role,
    content: message.content,
  }));


  // 6. Ask the AI
  const aiResponse = await generateAIResponse(
    EDU_AI_SYSTEM_PROMPT,
    aiMessages,
  );

   // 7. Save AI response
  const assistantMessage = await Message.create({
    conversation: conversation._id,
    role: "assistant",
    content: aiResponse,
  });

  // 8. Update conversation timestamp 
  conversation.updatedAt = new Date();
  await conversation.save();

  // 9. Return response
  return {
    conversationId: conversation._id.toString(),

    userMessage: {
      id: userMessage._id.toString(),
      role: "user",
      content: userMessage.content,
    },

    assistantMessage: {
      id: assistantMessage._id.toString(),
      role: "assistant",
      content: assistantMessage.content,
    },
  };
};