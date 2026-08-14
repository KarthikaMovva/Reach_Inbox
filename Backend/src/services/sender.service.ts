import prisma from "../lib/prisma.js";

interface CreateSenderInput {
    name: string;
    email: string;
}

interface UpdateSenderInput {
    name?: string;
    email?: string;
}

export async function getAllSenders(userId: string) {
    return prisma.sender.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "asc"
        }
    });
}

export async function getSenderById(
    id: string,
    userId: string
) {
    return prisma.sender.findFirst({
        where: {
            id,
            userId
        }
    });
}

export async function createSender(
    data: CreateSenderInput,
    userId: string
) {
    return prisma.sender.create({
        data: {
            name: data.name,
            email: data.email,
            userId
        }
    });
}

export async function updateSender(
    id: string,
    userId: string,
    data: UpdateSenderInput
) {
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

export async function deleteSender(
    id: string,
    userId: string
) {
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
        (error as any).code = "NOT_FOUND";
        throw error;
    }

    if (sender.emails.length > 0) {
        const error = new Error(
            "Cannot delete sender because it has associated emails"
        );
        (error as any).code = "HAS_EMAILS";
        throw error;
    }

    return prisma.sender.delete({
        where: {
            id
        }
    });
}