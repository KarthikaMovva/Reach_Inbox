import jwt from "jsonwebtoken";
export function authMiddleware(req, res, next) {
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
        const decoded = jwt.verify(token, JWT_SECRET);
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
