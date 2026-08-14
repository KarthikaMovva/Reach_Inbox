"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmail = createEmail;
exports.getAllEmails = getAllEmails;
exports.getEmailById = getEmailById;
exports.deleteEmail = deleteEmail;
exports.getScheduledEmails = getScheduledEmails;
exports.getSentEmails = getSentEmails;
exports.updateEmail = updateEmail;
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const email_queue_js_1 = require("../queue/email.queue.js");
async function createEmail(data) {
    const sender = await prisma_js_1.default.sender.findFirst({
        where: {
            id: data.senderId,
            userId: data.userId
        }
    });
    if (!sender) {
        throw new Error("Sender not found");
    }
    const email = await prisma_js_1.default.email.create({
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
    await (0, email_queue_js_1.scheduleEmail)(email.id, email.scheduledAt);
    return email;
}
async function getAllEmails(userId) {
    return prisma_js_1.default.email.findMany({
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
async function getEmailById(id, userId) {
    return prisma_js_1.default.email.findFirst({
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
async function deleteEmail(id, userId) {
    const email = await prisma_js_1.default.email.findFirst({
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
        const cancelled = await (0, email_queue_js_1.cancelScheduledEmail)(id);
        if (!cancelled) {
            throw new Error("Scheduled email job could not be cancelled");
        }
    }
    return prisma_js_1.default.email.delete({
        where: {
            id
        }
    });
}
async function getScheduledEmails(userId) {
    return prisma_js_1.default.email.findMany({
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
async function getSentEmails(userId) {
    return prisma_js_1.default.email.findMany({
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
async function updateEmail(id, userId, data) {
    const existingEmail = await prisma_js_1.default.email.findFirst({
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
        const sender = await prisma_js_1.default.sender.findFirst({
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
        const cancelled = await (0, email_queue_js_1.cancelScheduledEmail)(id);
        if (!cancelled) {
            throw new Error("Scheduled email job could not be cancelled");
        }
    }
    const updatedEmail = await prisma_js_1.default.email.update({
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
        await (0, email_queue_js_1.scheduleEmail)(updatedEmail.id, updatedEmail.scheduledAt);
    }
    return updatedEmail;
}
