"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSenders = getAllSenders;
exports.getSenderById = getSenderById;
exports.createSender = createSender;
exports.updateSender = updateSender;
exports.deleteSender = deleteSender;
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
async function getAllSenders(userId) {
    return prisma_js_1.default.sender.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "asc"
        }
    });
}
async function getSenderById(id, userId) {
    return prisma_js_1.default.sender.findFirst({
        where: {
            id,
            userId
        }
    });
}
async function createSender(data, userId) {
    return prisma_js_1.default.sender.create({
        data: {
            name: data.name,
            email: data.email,
            userId
        }
    });
}
async function updateSender(id, userId, data) {
    const sender = await prisma_js_1.default.sender.findFirst({
        where: {
            id,
            userId
        }
    });
    if (!sender) {
        throw new Error("Sender not found");
    }
    return prisma_js_1.default.sender.update({
        where: {
            id
        },
        data
    });
}
async function deleteSender(id, userId) {
    const sender = await prisma_js_1.default.sender.findFirst({
        where: {
            id,
            userId
        },
        include: {
            emails: {
                select: {
                    id: true
                },
                take: 1
            }
        }
    });
    if (!sender) {
        const error = new Error("Sender not found");
        error.code = "NOT_FOUND";
        throw error;
    }
    if (sender.emails.length > 0) {
        const error = new Error("Cannot delete sender because it has associated emails");
        error.code = "HAS_EMAILS";
        throw error;
    }
    return prisma_js_1.default.sender.delete({
        where: {
            id
        }
    });
}
