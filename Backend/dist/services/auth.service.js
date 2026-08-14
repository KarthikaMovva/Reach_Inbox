"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
async function registerUser(data) {
    const existingUser = await prisma_js_1.default.user.findUnique({
        where: {
            email: data.email
        }
    });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    const user = await prisma_js_1.default.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash
        }
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
}
async function loginUser(email, password) {
    const user = await prisma_js_1.default.user.findUnique({
        where: {
            email
        }
    });
    if (!user) {
        throw new Error("Invalid credentials");
    }
    const passwordMatch = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!passwordMatch) {
        throw new Error("Invalid credentials");
    }
    return user;
}
async function getCurrentUser(userId) {
    return prisma_js_1.default.user.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
        }
    });
}
