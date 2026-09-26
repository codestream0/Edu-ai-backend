import {z} from "zod"


export const createTaskSchema = z.object({
    title: z.string().trim().min(2,"must be greater than 2 character"),
    description: z.string().trim(),
    status: z.enum(["pending","in-progress","completed"]),
    priority:z.enum(["low","medium","high"]),
    dueDate:z.date().optional(),
})