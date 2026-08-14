import prisma from "../lib/prisma.js";
import { scheduleEmail, cancelScheduledEmail } from "../queue/email.queue.js";
export async function createEmail(data) {
    const sender = await prisma.sender.findFirst({
        where: {
            id: data.senderId,
            userId: data.userId
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
    await scheduleEmail(email.id, email.scheduledAt);
    return email;
}
export async function getAllEmails(userId) {
    return prisma.email.findMany({
        where: {
            sender: {
                userId
            }
        },
        orderBy: {
            scheduledAt: "asc"
        },
        include: {
            sender: true
        }
    });
}
export async function getEmailById(id, userId) {
    return prisma.email.findFirst({
        where: {
            id,
            sender: {
                userId
            }
        },
        include: {
            sender: true
        }
    });
}
export async function deleteEmail(id, userId) {
    const email = await prisma.email.findFirst({
        where: {
            id,
            sender: {
                userId
            }
        }
    });
    if (!email) {
        throw new Error("Email not found");
    }
    if (email.status === "SCHEDULED") {
        const cancelled = await cancelScheduledEmail(id);
        if (!cancelled) {
            throw new Error("Scheduled email job could not be cancelled");
        }
    }
    return prisma.email.delete({
        where: {
            id
        }
    });
}
export async function getScheduledEmails(userId) {
    return prisma.email.findMany({
        where: {
            status: "SCHEDULED",
            sender: {
                userId
            }
        },
        include: {
            sender: true
        },
        orderBy: {
            scheduledAt: "asc"
        }
    });
}
export async function getSentEmails(userId) {
    return prisma.email.findMany({
        where: {
            status: {
                in: ["SENT", "FAILED"]
            },
            sender: {
                userId
            }
        },
        include: {
            sender: true
        },
        orderBy: {
            sentAt: "desc"
        }
    });
}
export async function updateEmail(id, userId, data) {
    const existingEmail = await prisma.email.findFirst({
        where: {
            id,
            sender: {
                userId
            }
        }
    });
    if (!existingEmail) {
        throw new Error("Email not found");
    }
    if (existingEmail.status !== "SCHEDULED") {
        throw new Error("Only scheduled emails can be updated");
    }
    if (data.senderId) {
        const sender = await prisma.sender.findFirst({
            where: {
                id: data.senderId,
                userId
            }
        });
        if (!sender) {
            throw new Error("Sender not found");
        }
    }
    const scheduledAtChanged = data.scheduledAt &&
        data.scheduledAt.getTime() !==
            existingEmail.scheduledAt.getTime();
    if (scheduledAtChanged) {
        const cancelled = await cancelScheduledEmail(id);
        if (!cancelled) {
            throw new Error("Scheduled email job could not be cancelled");
        }
    }
    const updatedEmail = await prisma.email.update({
        where: {
            id
        },
        data: {
            ...(data.recipient !== undefined && {
                recipient: data.recipient
            }),
            ...(data.subject !== undefined && {
                subject: data.subject
            }),
            ...(data.body !== undefined && {
                body: data.body
            }),
            ...(data.scheduledAt !== undefined && {
                scheduledAt: data.scheduledAt
            }),
            ...(data.senderId !== undefined && {
                senderId: data.senderId
            })
        },
        include: {
            sender: true
        }
    });
    if (scheduledAtChanged) {
        await scheduleEmail(updatedEmail.id, updatedEmail.scheduledAt);
    }
    return updatedEmail;
}
