import { z } from "zod";

export const createQuizSchema = z.object({
  documentId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid document ID"),
  questionType: z.enum([
    "multiple_choice",
    "true_false",
    "short_answer",
    "mixed",
  ]),
  questionCount: z.number().int().min(5).max(30),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  answerFeedback: z.enum(["immediate", "end"]).default("end"),
});

export const submitQuizSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1),
        answer: z.string().max(5000),
      }),
    )
    .max(30),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;
export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
