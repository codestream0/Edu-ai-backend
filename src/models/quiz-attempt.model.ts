import { Schema, model, models } from "mongoose";

const submittedAnswerSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: "",
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    pointsAwarded: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const quizAttemptSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    answers: {
      type: [submittedAnswerSchema],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const QuizAttemptModel =
  models.QuizAttempt || model("QuizAttempt", quizAttemptSchema);

export default QuizAttemptModel;
