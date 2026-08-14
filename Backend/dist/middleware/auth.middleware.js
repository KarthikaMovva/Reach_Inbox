"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
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
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return res.status(500).json({
                error: "JWT_SECRET is not configured"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded !== "object" ||
            decoded === null ||
            !("userId" in decoded) ||
            typeof decoded.userId !== "string") {
            return res.status(401).json({
                error: "Invalid token"
            });
        }
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}
