import { z } from "zod";

export const sendMessageSchema = z.object({
  conversationId: z
    .string()
    .trim()
    .optional(),

  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(10000, "Message is too long"),
});