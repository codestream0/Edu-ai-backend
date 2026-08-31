import { Request, Response } from "express";
import { signup } from "../services/auth.service";
import { success, ZodError } from "zod";


export const signupController = async (
    req:Request,
    res:Response
)=>{
    try {
        const user = await signup(req.body)

        res.status(201).json({
            success:true,
            message:"Account created successfully",
            user,
        })

    } catch (error) {
        if(error instanceof ZodError){
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
            return;
        }
        console.error("Signup error:", error);

        res.status(400).json({
        success: false,
        message:
            error instanceof Error
            ? error.message
            : "Something went wrong",
        });
    }

}