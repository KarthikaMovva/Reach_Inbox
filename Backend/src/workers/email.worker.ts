import { Worker } from "bullmq";
import prisma from "../lib/prisma.js";
import { sendEmail } from "../services/email.sender.js";
import { waitForEmailSendSlot } from "../utils/email.throttle.js";

const connection = {
    host: "localhost",
    port: 6379
};

const MAX_ATTEMPTS = 3;

const concurrency = Number(
    process.env.WORKER_CONCURRENCY
);

const worker = new Worker(
    "email-queue",
    async (job) => {
        const { emailId } = job.data;

        console.log(
            `Processing email: ${emailId} | Attempt ${job.attemptsMade + 1}/${MAX_ATTEMPTS}`
        );

        const email = await prisma.email.findUnique({
            where: {
                id: emailId
            }
        });

        if (!email) {
            throw new Error(`Email ${emailId} not found`);
        }

        // Mark as PROCESSING
        await prisma.email.update({
            where: {
                id: emailId
            },
            data: {
                status: "PROCESSING"
            }
        });

        try {
            await waitForEmailSendSlot();

            console.log(
                `[${new Date().toISOString()}] Sending email to:`,
                email.recipient
            );

            await sendEmail({
                recipient: email.recipient,
                subject: email.subject,
                body: email.body
            });

            // Email successfully sent
            await prisma.email.update({
                where: {
                    id: emailId
                },
                data: {
                    status: "SENT",
                    sentAt: new Date()
                }
            });

            console.log(
                "Email sent successfully:",
                emailId
            );

            return {
                success: true,
                emailId
            };
        } catch (error) {
            const isFinalAttempt =
                job.attemptsMade + 1 >= MAX_ATTEMPTS;

            console.error(
                `Email sending failed | Attempt ${job.attemptsMade + 1}/${MAX_ATTEMPTS}`
            );

            if (isFinalAttempt) {
                await prisma.email.update({
                    where: {
                        id: emailId
                    },
                    data: {
                        status: "FAILED"
                    }
                });

                console.error(
                    "All retry attempts exhausted. Email marked as FAILED."
                );
            }

            // IMPORTANT:
            // Tell BullMQ that this attempt failed.
            throw error;
        }
    },
    {
        connection,
        concurrency
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

console.log(
    `Email worker started with concurrency: ${concurrency}`
);