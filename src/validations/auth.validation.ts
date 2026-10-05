import { z } from "zod";

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "password must be atleast 6 character")
    .max(100, "character must not exceed 100 character"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("please provide a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "password must be atleast 6 character")
    .max(100, "character must not exceed 100 character"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .trim()
    .toLowerCase(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});