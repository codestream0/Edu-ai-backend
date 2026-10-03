import mongoose, { Schema, model, models } from "mongoose";

export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export type QuizQuestion = {
  questionId: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  acceptedAnswers: string[];
  explanation: string;
  points: number;
};

const quizQuestionSchema = new Schema<QuizQuestion>(
  {
    questionId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["multiple_choice", "true_false", "short_answer"],
    },
    question: { type: String, required: true },
    options: { type: [String], default: [] },
    correctAnswer: { type: String, required: true },
    acceptedAnswers: { type: [String], default: [], select: false },
    explanation: { type: String, required: true },
    points: { type: Number, default: 1, min: 1 },
  },

  { _id: false },
);

const quizSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sourceDocument: {
      type: Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["multiple_choice", "true_false", "short_answer", "mixed"],
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 5,
      max: 30,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "medium",
    },
    answerFeedback: {
      type: String,
      enum: ["immediate", "end"],
      default: "end",
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: (questions: QuizQuestion[]) =>
          questions.length >= 5 && questions.length <= 30,
        message: "A quiz must contain between 5 and 30 questions.",
      },
    },
  },
  { timestamps: true },
);

export type QuizDocument = mongoose.InferSchemaType<typeof quizSchema>;

const QuizModel = models.Quiz || model<QuizDocument>("Quiz", quizSchema);

export default QuizModel;
