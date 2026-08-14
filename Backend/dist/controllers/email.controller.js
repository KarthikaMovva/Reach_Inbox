"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailController = createEmailController;
exports.getAllEmailsController = getAllEmailsController;
exports.getEmailByIdController = getEmailByIdController;
exports.deleteEmailController = deleteEmailController;
exports.getScheduledEmailsController = getScheduledEmailsController;
exports.getSentEmailsController = getSentEmailsController;
exports.updateEmailController = updateEmailController;
const email_service_js_1 = require("../services/email.service.js");
async function createEmailController(req, res) {
    try {
        const { recipient, subject, body, scheduledAt, senderId } = req.body;
        if (!recipient ||
            !subject ||
            !body ||
            !scheduledAt ||
            !senderId) {
            return res.status(400).json({
                error: "recipient, subject, body, scheduledAt and senderId are required"
            });
        }
        const email = await (0, email_service_js_1.createEmail)({
            recipient,
            subject,
            body,
            scheduledAt: new Date(scheduledAt),
            senderId,
            userId: req.userId
        });
        return res.status(201).json(email);
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
            error: "Failed to create email"
        });
    }
}
async function getAllEmailsController(req, res) {
    try {
        const emails = await (0, email_service_js_1.getAllEmails)(req.userId);
        return res.json(emails);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch emails"
        });
    }
}
async function getEmailByIdController(req, res) {
    try {
        const id = String(req.params.id);
        const email = await (0, email_service_js_1.getEmailById)(id, req.userId);
        if (!email) {
            return res.status(404).json({
                error: "Email not found"
            });
        }
        return res.json(email);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch email"
        });
    }
}
async function deleteEmailController(req, res) {
    try {
        const id = String(req.params.id);
        const email = await (0, email_service_js_1.deleteEmail)(id, req.userId);
        return res.json({
            message: "Email deleted successfully",
            email
        });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Email not found") {
            return res.status(404).json({
                error: "Email not found"
            });
        }
        if (error instanceof Error &&
            error.message ===
                "Scheduled email job could not be cancelled") {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(500).json({
            error: "Failed to delete email"
        });
    }
}
async function getScheduledEmailsController(req, res) {
    try {
        const emails = await (0, email_service_js_1.getScheduledEmails)(req.userId);
        return res.json(emails);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch scheduled emails"
        });
    }
}
async function getSentEmailsController(req, res) {
    try {
        const emails = await (0, email_service_js_1.getSentEmails)(req.userId);
        return res.json(emails);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch sent emails"
        });
    }
}
async function updateEmailController(req, res) {
    try {
        const id = String(req.params.id);
        const { recipient, subject, body, scheduledAt, senderId } = req.body;
        if (recipient === undefined &&
            subject === undefined &&
            body === undefined &&
            scheduledAt === undefined &&
            senderId === undefined) {
            return res.status(400).json({
                error: "At least one field is required"
            });
        }
        const email = await (0, email_service_js_1.updateEmail)(id, req.userId, {
            ...(recipient !== undefined && {
                recipient
            }),
            ...(subject !== undefined && {
                subject
            }),
            ...(body !== undefined && {
                body
            }),
            ...(scheduledAt !== undefined && {
                scheduledAt: new Date(scheduledAt)
            }),
            ...(senderId !== undefined && {
                senderId
            })
        });
        return res.json(email);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error &&
            error.message === "Email not found") {
            return res.status(404).json({
                error: "Email not found"
            });
        }
        if (error instanceof Error &&
            error.message === "Sender not found") {
            return res.status(404).json({
                error: "Sender not found"
            });
        }
        if (error instanceof Error &&
            error.message ===
                "Only scheduled emails can be updated") {
            return res.status(409).json({
                error: error.message
            });
        }
        if (error instanceof Error &&
            error.message ===
                "Scheduled email job could not be cancelled") {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(500).json({
            error: "Failed to update email"
        });
    }
}
