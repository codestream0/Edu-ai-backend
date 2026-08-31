import { z } from "zod"

export const signupSchema = z.object({
    fullName: z.string().trim().min(2,"Full name must be at least 2 characters").max(100,"Full name cannot exceed 100 characters"),
    email:z.string().trim().email("Please provide a valid email address").toLowerCase(),
    password:z.string().min(6,"password must be atleast 6 character").max(100,"character must not exceed 100"),

})