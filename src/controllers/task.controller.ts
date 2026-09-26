import Task from "../models/task";
import { createTask} from "../services/task.service";
import { Request, Response } from "express";

export const createTaskController = async (req: Request, res: Response) => {
    try {
        const task = await createTask(req.body);

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task,
        });
    }
    catch (error) {
        console.error("Create task error:", error);
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong",
        });

    }

}   




export const getAllTasks = async () => {
    const tasks = await Task.find();
    return tasks;
}


export const getTaskById = async (taskId: string) => {
    const task = await Task.findById(taskId);
    if (!task) {
        throw new Error("Task not found");
    }
    return task;
}