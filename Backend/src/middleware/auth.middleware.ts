import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Authorization header required"
            });
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            return res.status(401).json({
                error: "Invalid authorization format"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        );

        if (
            typeof decoded !== "object" ||
            !("userId" in decoded)
        ) {
            return res.status(401).json({
                error: "Invalid token"
            });
        }

        req.userId = decoded.userId as string;

        next();
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}