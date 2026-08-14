import prisma from "../lib/prisma.js";
export async function getAllSenders(userId) {
    return prisma.sender.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "asc"
        }
    });
}
export async function getSenderById(id, userId) {
    return prisma.sender.findFirst({
        where: {
            id,
            userId
        }
    });
}
export async function createSender(data, userId) {
    return prisma.sender.create({
        data: {
            name: data.name,
            email: data.email,
            userId
        }
    });
}
export async function updateSender(id, userId, data) {
    const sender = await prisma.sender.findFirst({
        where: {
            id,
            userId
        }
    });
    if (!sender) {
        throw new Error("Sender not found");
    }
    return prisma.sender.update({
        where: {
            id
        },
        data
    });
}
export async function deleteSender(id, userId) {
    const sender = await prisma.sender.findFirst({
        where: {
            id,
            userId
        },
        include: {
            emails: {
                select: {
                    id: true
                },
                take: 1
            }
        }
    });
    if (!sender) {
        const error = new Error("Sender not found");
        error.code = "NOT_FOUND";
        throw error;
    }
    if (sender.emails.length > 0) {
        const error = new Error("Cannot delete sender because it has associated emails");
        error.code = "HAS_EMAILS";
        throw error;
    }
    return prisma.sender.delete({
        where: {
            id
        }
    });
}
