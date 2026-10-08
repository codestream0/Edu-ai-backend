import { Request, Response } from "express";
import {
  login,
  refreshAccessToken,
  signup,
  forgotPassword,
  resetPassword,
} from "../services/auth.service";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation";
import { ZodError } from "zod";
import { AuthRequest } from "../middleware/auth.middleware";
import User from "../models/user.model";
// import { generateAceessToken, verifyRefreshToken } from "../utils/jwt";

export const signupController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await signup(req.body);

    const {
      refreshToken,
      accessToken,
      id,
      fullName,
      email,
      createdAt,
    } = result;

    // Store refresh token securely in an httpOnly cookie.
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",

      user: {
        _id: id,
        fullName,
        email,
        createdAt,
      },

      accessToken,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    console.error("Signup error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const loginController = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await login(req.body);

    const {
      refreshToken,
      accessToken,
      id,
      fullName,
      email,
      createdAt,
    } = result;


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      user: {
        _id: id,
        fullName,
        email,
        createdAt,
      },
      accessToken,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    console.error("login error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "refresh token is not found",
      });
    }

    const accessToken = await refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await forgotPassword(email);

    return res.status(200).json({
      success: true,
      result,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Something went wrong.",
    });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(token, password);

    return res.status(200).json({
      success: true,
      result,
      message: "Password reset successfully",
    });
  } catch (error: any) {
    if (error?.name === "ZodError") {
      return res.status(400).json({
        message: error.issues[0]?.message || "Invalid request",
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid or expired password reset token"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
};
