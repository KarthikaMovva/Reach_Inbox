import { registerUser, loginUser, getCurrentUser } from "../services/auth.service.js";
import { generateToken } from "../utils/jwt.js";
export async function registerController(req, res) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                error: "name, email and password are required"
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters"
            });
        }
        const user = await registerUser({
            name,
            email,
            password
        });
        return res.status(201).json(user);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "User already exists") {
            return res.status(409).json({
                error: "User already exists"
            });
        }
        return res.status(500).json({
            error: "Failed to register user"
        });
    }
}
export async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: "email and password are required"
            });
        }
        const user = await loginUser(email, password);
        const token = generateToken(user.id);
        return res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Invalid credentials") {
            return res.status(401).json({
                error: "Invalid credentials"
            });
        }
        return res.status(500).json({
            error: "Failed to login"
        });
    }
}
export async function getMeController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const user = await getCurrentUser(req.userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        return res.json(user);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch current user"
        });
    }
}
