import mongoose, { Document, Schema, Types } from "mongoose";
export interface IConversation extends Document {
  user: Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
      trim: true,
      default: "new conversation",
      maxlength: 120,
    },
  },
  {
    timestamps: true,
  },
);

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema,
);