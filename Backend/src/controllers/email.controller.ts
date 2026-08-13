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
        const { recipient, subject, body, scheduledAt } = req.body;

        if (!recipient || !subject || !body || !scheduledAt) {
            return res.status(400).json({
                error: "recipient, subject, body and scheduledAt are required"
            });
        }

        const email = await createEmail({
            recipient,
            subject,
            body,
            scheduledAt: new Date(scheduledAt)
        });

        return res.status(201).json(email);
    } catch (error) {
        console.error(error);

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

        return res.status(404).json({
            error: "Email not found"
        });
    }
}