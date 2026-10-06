import mongoose from "mongoose";
import { Conversation } from "../models/conversation.model";
import { Message } from "../models/message.model";

export const getUserConversations = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }
  return Conversation.find({ user: userId }).sort({ updatedAt: -1 }).lean();
};

export const getConversation = async (
  userId: string,
  conversationId: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversation ID");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    user: userId,
  }).lean();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    conversation,
    messages,
  };
};

export const deleteConversation = async(
    userId:string,
    conversationId:string,
)=>{
    
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid userID");
    }

    if(!mongoose.Types.ObjectId.isValid(conversationId)){
        throw new Error("Invalid conversation ID")
    }
    const conversation = await Conversation.findByIdAndDelete({
        _id: conversationId,
        user: userId,
    });
    if(!conversation){
        throw new Error("conversation not found");
    }
    await Message.deleteMany({
        conversation: conversationId,
    })
    return conversation;
}
