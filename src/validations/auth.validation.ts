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

  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const updateProfileSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name cannot exceed 100 characters"),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 8 characters")
      .max(100, "New password cannot exceed 100 characters"),
  })
  .strict()
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

export const updatePreferencesSchema = z
  .object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    notifications: z
      .object({
        studyReminders: z.boolean().optional(),
        quizResults: z.boolean().optional(),
        productUpdates: z.boolean().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.theme !== undefined ||
      (data.notifications !== undefined &&
        Object.keys(data.notifications).length > 0),
    {
      message: "Provide at least one preference to update",
    },
  );

// export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
