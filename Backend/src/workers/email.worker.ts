import { Worker } from "bullmq";
import prisma from "../lib/prisma.js";
import { sendEmail } from "../services/email.sender.js";

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

        // Mark email as PROCESSING
        await prisma.email.update({
            where: {
                id: emailId
            },
            data: {
                status: "PROCESSING"
            }
        });

        try {
            console.log("Sending email to:", email.recipient);

            await sendEmail({
                recipient: email.recipient,
                subject: email.subject,
                body: email.body
            });

            // Mark email as SENT
            const updatedEmail = await prisma.email.update({
                where: {
                    id: emailId
                },
                data: {
                    status: "SENT",
                    sentAt: new Date()
                }
            });

            console.log("Email sent successfully:", emailId);

            return {
                success: true,
                emailId: updatedEmail.id
            };
        } catch (error) {
            // Mark email as FAILED
            await prisma.email.update({
                where: {
                    id: emailId
                },
                data: {
                    status: "FAILED"
                }
            });

            console.error("Email sending failed:", error);

            throw error;
        }
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