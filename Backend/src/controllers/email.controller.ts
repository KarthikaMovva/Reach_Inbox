import { Request, Response } from "express";
import {
    createEmail,
    getAllEmails,
    getEmailById,
    deleteEmail
} from "../services/email.service.js";

export async function createEmailController(
    req: Request,
    res: Response
) {
    try {
        const {
            recipient,
            subject,
            body,
            scheduledAt,
            senderId
        } = req.body;

        console.log("POST /api/emails reached");

        if (
            !recipient ||
            !subject ||
            !body ||
            !scheduledAt ||
            !senderId
        ) {
            return res.status(400).json({
                error:
                    "recipient, subject, body, scheduledAt and senderId are required"
            });
        }

        const email = await createEmail({
            recipient,
            subject,
            body,
            scheduledAt: new Date(scheduledAt),
            senderId
        });

        return res.status(201).json(email);
    } catch (error) {
        console.error(error);

        if (
            error instanceof Error &&
            error.message === "Sender not found"
        ) {
            return res.status(404).json({
                error: "Sender not found"
            });
        }

        return res.status(500).json({
            error: "Failed to create email"
        });
    }
}

export async function getAllEmailsController(
    _req: Request,
    res: Response
) {
    try {
        const emails = await getAllEmails();

        return res.json(emails);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch emails"
        });
    }
}

export async function getEmailByIdController(
    req: Request,
    res: Response
) {
    try {
        const email = await getEmailById(req.params.id);

        if (!email) {
            return res.status(404).json({
                error: "Email not found"
            });
        }

        return res.json(email);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch email"
        });
    }
}

export async function deleteEmailController(
    req: Request,
    res: Response
) {
    try {
        const email = await deleteEmail(req.params.id);

        return res.json({
            message: "Email deleted successfully",
            email
        });
    } catch (error) {
        console.error(error);

        if (
            error instanceof Error &&
            error.message === "Email not found"
        ) {
            return res.status(404).json({
                error: "Email not found"
            });
        }

        return res.status(500).json({
            error: "Failed to delete email"
        });
    }
}