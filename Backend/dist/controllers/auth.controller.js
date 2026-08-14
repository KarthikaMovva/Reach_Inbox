"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerController = registerController;
exports.loginController = loginController;
exports.getMeController = getMeController;
const auth_service_js_1 = require("../services/auth.service.js");
const jwt_js_1 = require("../utils/jwt.js");
async function registerController(req, res) {
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
        const user = await (0, auth_service_js_1.registerUser)({
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
async function loginController(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: "email and password are required"
            });
        }
        const user = await (0, auth_service_js_1.loginUser)(email, password);
        const token = (0, jwt_js_1.generateToken)(user.id);
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
async function getMeController(req, res) {
    try {
        if (!req.userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }
        const user = await (0, auth_service_js_1.getCurrentUser)(req.userId);
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
