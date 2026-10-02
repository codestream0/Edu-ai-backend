
import { Router } from "express";
import {
  createQuizController,
  getQuizzesController,
  getQuizByIdController,
  submitQuizController,
  getQuizResultsController,
} from "../controllers/quiz.contoller";
import { authMiddleware } from "../middleware/auth.middleware";

const quizRouter = Router();

quizRouter.use(authMiddleware);

quizRouter.post("/", createQuizController);
quizRouter.get("/", getQuizzesController);

quizRouter.get("/results/:id", getQuizResultsController);
quizRouter.get("/:id", getQuizByIdController);
quizRouter.post("/:id/submit", submitQuizController);

export default quizRouter;
