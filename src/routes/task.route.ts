import { Router } from "express";
import { createTaskController, getAllTasks, getTaskById } from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const taskRouter = Router();

taskRouter.post("/",authMiddleware,createTaskController)
taskRouter.get("/",authMiddleware,getAllTasks)
taskRouter.get("/:id", authMiddleware,getTaskById);

export default taskRouter;