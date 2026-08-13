import prisma from "../lib/prisma.js";

interface CreateEmailInput {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: Date;
}

export async function createEmail(data: CreateEmailInput) {
    return prisma.email.create({
        data: {
            recipient: data.recipient,
            subject: data.subject,
            body: data.body,
            scheduledAt: data.scheduledAt
        }
    });
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
    return prisma.email.delete({
        where: {
            id
        }
    });
}