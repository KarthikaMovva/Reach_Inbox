import { Request, Response } from "express";
import {
    createEmail,
    getAllEmails,
    getScheduledEmails,
    getSentEmails,
    getEmailById,
    deleteEmail,
    updateEmail
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
            senderId,
            userId: req.userId
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
    req: Request,
    res: Response
) {
    try {
        const emails = await getAllEmails(req.userId);

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
        const email = await getEmailById(
            req.params.id,
            req.userId
        );

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
        const email = await deleteEmail(
            req.params.id,
            req.userId
        );

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

        if (
            error instanceof Error &&
            error.message ===
            "Scheduled email job could not be cancelled"
        ) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: "Failed to delete email"
        });
    }
}

export async function getScheduledEmailsController(
    req: Request,
    res: Response
) {
    try {
        const emails = await getScheduledEmails(
            req.userId
        );

        return res.json(emails);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch scheduled emails"
        });
    }
}

export async function getSentEmailsController(
    req: Request,
    res: Response
) {
    try {
        const emails = await getSentEmails(
            req.userId
        );

        return res.json(emails);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Failed to fetch sent emails"
        });
    }
}

export async function updateEmailController(
    req: Request,
    res: Response
) {
    try {
        const { id } = req.params;

        const {
            recipient,
            subject,
            body,
            scheduledAt,
            senderId
        } = req.body;

        if (
            recipient === undefined &&
            subject === undefined &&
            body === undefined &&
            scheduledAt === undefined &&
            senderId === undefined
        ) {
            return res.status(400).json({
                error: "At least one field is required"
            });
        }

        const email = await updateEmail(
            id,
            req.userId,
            {
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
            }
        );

        return res.json(email);
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

        if (
            error instanceof Error &&
            error.message === "Sender not found"
        ) {
            return res.status(404).json({
                error: "Sender not found"
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "Only scheduled emails can be updated"
        ) {
            return res.status(409).json({
                error: error.message
            });
        }

        if (
            error instanceof Error &&
            error.message ===
            "Scheduled email job could not be cancelled"
        ) {
            return res.status(500).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: "Failed to update email"
        });
    }
}