import prisma from "../lib/prisma.js";
import {
    scheduleEmail,
    cancelScheduledEmail
} from "../queue/email.queue.ts";

interface CreateEmailInput {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: Date;
}

export async function createEmail(data: CreateEmailInput) {
    const email = await prisma.email.create({
        data: {
            recipient: data.recipient,
            subject: data.subject,
            body: data.body,
            scheduledAt: data.scheduledAt
        }
    });

    await scheduleEmail(
        email.id,
        email.scheduledAt
    );

    return email;
}

export async function getAllEmails() {
    return prisma.email.findMany({
        orderBy: {
            scheduledAt: "asc"
        }
    });
}

export async function getEmailById(id: string) {
    return prisma.email.findUnique({
        where: {
            id
        }
    });
}

export async function deleteEmail(id: string) {
    const email = await prisma.email.findUnique({
        where: {
            id
        }
    });

    if (!email) {
        throw new Error("Email not found");
    }

    if (email.status === "SCHEDULED") {
        const cancelled = await cancelScheduledEmail(id);

        if (!cancelled) {
            throw new Error(
                "Scheduled email job could not be cancelled"
            );
        }
    }

    return prisma.email.delete({
        where: {
            id
        }
    });
}