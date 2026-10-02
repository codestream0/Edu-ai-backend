import { Response } from "express";
import mongoose from "mongoose";

import type { AuthRequest } from "../middleware/auth.middleware";
import QuizModel from "../models/quiz.model";
import QuizAttemptModel from "../models/quiz-attempt.model";
import {
  createQuizSchema,
  submitQuizSchema,
} from "../validations/quiz.validation";
import { generateQuiz, gradeAnswer } from "../services/quiz.service";

export async function createQuizController(req: AuthRequest, res: Response) {
  try {
    const parsed = createQuizSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz configuration",
        errors: parsed.error.flatten(),
      });
    }

    const quiz = await generateQuiz(req.user!.userId, parsed.data);

    return res.status(201).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: {
        id: quiz._id,
        title: quiz.title,
        sourceDocument: quiz.sourceDocument,
        questionType: quiz.questionType,
        questionCount: quiz.questionCount,
        difficulty: quiz.difficulty,
        answerFeedback: quiz.answerFeedback,
        questions: quiz.questions.map(
          (question: {
            questionId: string;
            type: string;
            question: string;
            options: string[];
            points: number;
          }) => ({
            questionId: question.questionId,
            type: question.type,
            question: question.question,
            options: question.options,
            points: question.points,
          }),
        ),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "DOCUMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Document not found.",
        });
      }

      if (error.message === "DOCUMENT_NOT_PROCESSED") {
        return res.status(400).json({
          success: false,
          message:
            "Wait for document processing to finish before creating a quiz.",
        });
      }

      if (error.message === "DOCUMENT_TEXT_MISSING") {
        return res.status(400).json({
          success: false,
          message: "No extracted text is available for this document.",
        });
      }
    }

    console.error("Create quiz error:", error);

    return res.status(502).json({
      success: false,
      message: "Failed to generate quiz. Please try again.",
    });
  }
}

export async function getQuizzesController(req: AuthRequest, res: Response) {
  try {
    const quizzes = await QuizModel.find({
      owner: req.user!.userId,
    })
      .select("-questions.correctAnswer -questions.acceptedAnswers")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve quizzes.",
    });
  }
}

export async function getQuizByIdController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const quiz = await QuizModel.findOne({
      _id: id,
      owner: req.user!.userId,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const safeQuestions = quiz.questions.map(
      (question: {
        questionId: any;
        type: any;
        question: any;
        options: any;
        points: any;
      }) => ({
        questionId: question.questionId,
        type: question.type,
        question: question.question,
        options: question.options,
        points: question.points,
      }),
    );

    return res.status(200).json({
      success: true,
      quiz: {
        id: quiz._id,
        title: quiz.title,
        sourceDocument: quiz.sourceDocument,
        questionType: quiz.questionType,
        questionCount: quiz.questionCount,
        difficulty: quiz.difficulty,
        answerFeedback: quiz.answerFeedback,
        questions: safeQuestions,
      },
    });
  } catch (error) {
    console.error("Get quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve quiz.",
    });
  }
}

export async function submitQuizController(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID.",
      });
    }

    const parsed = submitQuizSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid answers.",
        errors: parsed.error.flatten(),
      });
    }

    const quiz = await QuizModel.findOne({
      _id: id,
      owner: req.user!.userId,
    }).select("+questions.correctAnswer +questions.acceptedAnswers");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const expectedIds = new Set(
      quiz.questions.map(
        (question: { questionId: any }) => question.questionId,
      ),
    );

    const submittedIds = parsed.data.answers.map((answer) => answer.questionId);

    if (
      new Set(submittedIds).size !== submittedIds.length ||
      submittedIds.some((questionId) => !expectedIds.has(questionId))
    ) {
      return res.status(400).json({
        success: false,
        message: "Answers contain duplicate or invalid question IDs.",
      });
    }

    const answersById = new Map(
      parsed.data.answers.map((answer) => [answer.questionId, answer.answer]),
    );

    let score = 0;
    const totalPoints = quiz.questions.reduce(
      (total: any, question: { points: any }) => total + question.points,
      0,
    );

    const gradedAnswers = quiz.questions.map(
      (question: {
        questionId: string;
        type: any;
        correctAnswer: any;
        acceptedAnswers: any;
        points: any;
      }) => {
        const submittedAnswer = answersById.get(question.questionId) ?? "";

        const isCorrect = gradeAnswer(
          {
            type: question.type,
            correctAnswer: question.correctAnswer,
            acceptedAnswers: question.acceptedAnswers,
          },
          submittedAnswer,
        );

        const pointsAwarded = isCorrect ? question.points : 0;
        score += pointsAwarded;

        return {
          questionId: question.questionId,
          answer: submittedAnswer,
          isCorrect,
          pointsAwarded,
        };
      },
    );

    const percentage = Math.round((score / totalPoints) * 100);

    const attempt = await QuizAttemptModel.create({
      owner: req.user!.userId,
      quiz: quiz._id,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage,
    });

    const answerMap = new Map<
      string,
      {
        questionId: string;
        answer: unknown;
        isCorrect: boolean;
        pointsAwarded: number;
      }
    >(
      gradedAnswers.map(
        (answer: {
          questionId: string;
          answer: unknown;
          isCorrect: boolean;
          pointsAwarded: number;
        }) => [answer.questionId, answer],
      ),
    );

    const review = quiz.questions.map(
      (question: {
        questionId: string;
        question: any;
        type: any;
        options: any;
        correctAnswer: any;
        explanation: any;
        points: any;
      }) => {
        const submitted = answerMap.get(question.questionId)!;

        return {
          questionId: question.questionId,
          question: question.question,
          type: question.type,
          options: question.options,
          submittedAnswer: submitted.answer,
          correctAnswer: question.correctAnswer,
          isCorrect: submitted.isCorrect,
          explanation: question.explanation,
          pointsAwarded: submitted.pointsAwarded,
          points: question.points,
        };
      },
    );

    return res.status(201).json({
      success: true,
      message: "Quiz submitted successfully",
      result: {
        attemptId: attempt._id,
        score,
        totalPoints,
        percentage,
        correctCount: gradedAnswers.filter(
          (answer: { isCorrect: any }) => answer.isCorrect,
        ).length,
        questionCount: quiz.questions.length,
        review: quiz.answerFeedback === "end" ? review : undefined,
      },
    });
  } catch (error) {
    console.error("Submit quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit quiz.",
    });
  }
}

export async function getQuizResultsController(
  req: AuthRequest,
  res: Response,
) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID.",
      });
    }

    const attempt = await QuizAttemptModel.findOne({
      _id: id,
      owner: req.user!.userId,
    }).lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found.",
      });
    }

    const quiz = await QuizModel.findOne({
      _id: attempt.quiz,
      owner: req.user!.userId,
    }).select("+questions.correctAnswer +questions.acceptedAnswers");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found.",
      });
    }

    const answerMap = new Map<string, any>(
      attempt.answers.map((answer: { questionId: any }) => [
        String(answer.questionId),
        answer,
      ]),
    );

    const review = quiz.questions.map(
      (question: {
        questionId: unknown;
        question: any;
        type: any;
        options: any;
        correctAnswer: any;
        explanation: any;
        points: any;
      }) => {
        const submitted = answerMap.get(String(question.questionId));

        return {
          questionId: question.questionId,
          question: question.question,
          type: question.type,
          options: question.options,
          submittedAnswer: submitted?.answer ?? "",
          correctAnswer: question.correctAnswer,
          isCorrect: submitted?.isCorrect ?? false,
          explanation: question.explanation,
          pointsAwarded: submitted?.pointsAwarded ?? 0,
          points: question.points,
        };
      },
    );

    return res.status(200).json({
      success: true,
      result: {
        attemptId: attempt._id,
        quizId: quiz._id,
        title: quiz.title,
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        completedAt: attempt.completedAt,
        review,
      },
    });
  } catch (error) {
    console.error("Get quiz results error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve quiz results.",
    });
  }
}
