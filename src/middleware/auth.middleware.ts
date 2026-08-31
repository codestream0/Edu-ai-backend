import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt"


export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const token = authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token missing",
            });
        }

        const decoded = verifyAccessToken(token);

        req.user = {
            userId: decoded.userId,
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};