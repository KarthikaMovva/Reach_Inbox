import prisma from "../lib/prisma.js";
import {
    scheduleEmail,
    cancelScheduledEmail
} from "../queue/email.queue.js";

interface CreateEmailInput {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: Date;
    senderId: string;
}

export async function createEmail(data: CreateEmailInput) {
    const sender = await prisma.sender.findUnique({
        where: {
            id: data.senderId
        }
    });

    if (!sender) {
        throw new Error("Sender not found");
    }

    const email = await prisma.email.create({
        data: {
            recipient: data.recipient,
            subject: data.subject,
            body: data.body,
            scheduledAt: data.scheduledAt,
            senderId: data.senderId
        },
        include: {
            sender: true
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
        },
        include: {
            sender: true
        }
    });
}

export async function getEmailById(id: string) {
    return prisma.email.findUnique({
        where: {
            id
        },
        include: {
            sender: true
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