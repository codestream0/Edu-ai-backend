
import type {  Response, NextFunction } from "express";
import { getStudyProgress } from "../services/progress.service";
import { AuthRequest } from "../middleware/auth.middleware";

export async function getProgress(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    
    const ownerId = req.user?.userId;

    if (!ownerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const progress = await getStudyProgress(ownerId);
    console.log("Progress Data:", progress);
    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    next(error);
  }
}
