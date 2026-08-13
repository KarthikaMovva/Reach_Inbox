import { Worker } from "bullmq";
import prisma from "../lib/prisma.js";

const connection = {
    host: "localhost",
    port: 6379
};

const worker = new Worker(
    "email-queue",
    async (job) => {
        const { emailId } = job.data;

        console.log("Processing email:", emailId);

        const email = await prisma.email.findUnique({
            where: {
                id: emailId
            }
        });

        if (!email) {
            throw new Error(`Email ${emailId} not found`);
        }

        console.log("Email details:", {
            recipient: email.recipient,
            subject: email.subject,
            scheduledAt: email.scheduledAt
        });

        return {
            success: true,
            emailId
        };
    },
    {
        connection
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, error) => {
    console.error(
        `Job ${job?.id} failed:`,
        error.message
    );
});

console.log("Email worker started...");