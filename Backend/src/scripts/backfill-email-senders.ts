import prisma from "../lib/prisma.js";

async function main() {
    const sender = await prisma.sender.findUnique({
        where: {
            email: process.env.SMTP_USER!
        }
    });

    if (!sender) {
        throw new Error("Default sender not found");
    }

    const result = await prisma.email.updateMany({
        where: {
            senderId: null
        },
        data: {
            senderId: sender.id
        }
    });

    console.log(`Updated ${result.count} emails.`);

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});