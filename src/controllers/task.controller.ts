import { AuthRequest } from "../middleware/auth.middleware";
import Task from "../models/task.model";
import { createTask } from "../services/task.service";
import { Response } from "express";

export const createTaskController = async (req: AuthRequest, res: Response) => {
  try {
    const task = await createTask(req.body, req.user!.userId);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await Task.find({ owner: req.user!.userId });
    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user!.userId,
    });
    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, task });
  } catch (error) {
    console.error("Get task by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch task" });
  }
};
