import mongoose, { Document, Schema, Types } from "mongoose";

export type messageRole = "user" | "assistant";

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  role: messageRole;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
