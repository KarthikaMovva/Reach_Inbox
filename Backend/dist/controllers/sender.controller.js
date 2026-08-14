"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSendersController = getAllSendersController;
exports.getSenderByIdController = getSenderByIdController;
exports.createSenderController = createSenderController;
exports.updateSenderController = updateSenderController;
exports.deleteSenderController = deleteSenderController;
const sender_service_js_1 = require("../services/sender.service.js");
async function getAllSendersController(req, res) {
    try {
        const senders = await (0, sender_service_js_1.getAllSenders)(req.userId);
        return res.json(senders);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch senders"
        });
    }
}
async function getSenderByIdController(req, res) {
    try {
        const id = String(req.params.id);
        const sender = await (0, sender_service_js_1.getSenderById)(id, req.userId);
        if (!sender) {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        return res.json(sender);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch sender"
        });
    }
}
async function createSenderController(req, res) {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                error: "name and email are required"
            });
        }
        const sender = await (0, sender_service_js_1.createSender)({
            name,
            email
        }, req.userId);
        return res.status(201).json(sender);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create sender"
        });
    }
}
async function updateSenderController(req, res) {
    try {
        const id = String(req.params.id);
        const { name, email } = req.body;
        if (!name && !email) {
            return res.status(400).json({
                error: "At least one field is required"
            });
        }
        const sender = await (0, sender_service_js_1.updateSender)(id, req.userId, {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email })
        });
        return res.json(sender);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Sender not found") {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        return res.status(500).json({
            error: "Failed to update sender"
        });
    }
}
async function deleteSenderController(req, res) {
    try {
        const id = String(req.params.id);
        const sender = await (0, sender_service_js_1.deleteSender)(id, req.userId);
        return res.json(sender);
    }
    catch (error) {
        console.error(error);
        if (error.code === "NOT_FOUND") {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        if (error.code === "HAS_EMAILS") {
            return res.status(409).json({
                error: "Cannot delete sender because it has associated emails"
            });
        }
        return res.status(500).json({
            error: "Failed to delete sender"
        });
    }
}
