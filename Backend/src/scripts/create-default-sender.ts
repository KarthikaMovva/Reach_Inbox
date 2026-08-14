import prisma from "../lib/prisma.js";

async function main() {
    const sender = await prisma.sender.upsert({
        where: {
            email: process.env.SMTP_USER!
        },
        update: {},
        create: {
            name: "ReachInbox Default Sender",
            email: process.env.SMTP_USER!
        }
    });

    console.log("Sender created:");
    console.log(sender);

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});