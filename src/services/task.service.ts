import Task from "../models/task";
import { createTaskSchema } from "../validations/task.validation";


export const createTask =async (taskData: any)=>{
    const validatedData = createTaskSchema.parse(taskData);
    const { title, description, status, priority, dueDate } = validatedData;

    const newTask = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate
    })

    return newTask;
}