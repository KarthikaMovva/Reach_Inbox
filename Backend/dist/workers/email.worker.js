"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const email_sender_js_1 = require("../services/email.sender.js");
const email_throttle_js_1 = require("../utils/email.throttle.js");
const connection = {
    host: "localhost",
    port: 6379
};
const MAX_ATTEMPTS = 3;
const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 5);
const MAX_EMAILS_PER_HOUR = Number(process.env.MAX_EMAILS_PER_HOUR ?? 200);
const worker = new bullmq_1.Worker("email-queue", async (job) => {
    const { emailId } = job.data;
    const attempt = job.attemptsMade + 1;
    console.log(`Processing email: ${emailId} | Attempt ${attempt}/${MAX_ATTEMPTS}`);
    const email = await prisma_js_1.default.email.findUnique({
        where: {
            id: emailId
        },
        include: {
            sender: true
        }
    });
    if (!email) {
        throw new Error(`Email ${emailId} not found`);
    }
    if (!email.sender) {
        throw new Error(`Sender not found for email ${emailId}`);
    }
    /*
     * Idempotency protection:
     * If the email was already successfully sent,
     * never send it again.
     */
    if (email.status === "SENT") {
        console.log(`Email ${emailId} already sent. Skipping duplicate send.`);
        return {
            success: true,
            emailId,
            skipped: true,
            reason: "ALREADY_SENT"
        };
    }
    /*
     * If another worker already owns this email,
     * don't allow this job to send it again.
     *
     * PROCESSING is allowed for retries of the same
     * BullMQ job, but not for a separate competing job.
     */
    if (email.status === "PROCESSING" &&
        job.attemptsMade === 0) {
        console.log(`Email ${emailId} is already being processed. Skipping duplicate job.`);
        return {
            success: true,
            emailId,
            skipped: true,
            reason: "ALREADY_PROCESSING"
        };
    }
    /*
     * First attempt:
     *
     * Atomically change:
     *
     * SCHEDULED → PROCESSING
     *
     * updateMany() allows us to conditionally update
     * based on the current database state.
     */
    if (job.attemptsMade === 0) {
        const claimedEmail = await prisma_js_1.default.email.updateMany({
            where: {
                id: emailId,
                status: "SCHEDULED"
            },
            data: {
                status: "PROCESSING"
            }
        });
        /*
         * count === 0 means another worker/job changed
         * the state before we could claim it.
         */
        if (claimedEmail.count === 0) {
            console.log(`Email ${emailId} could not be claimed. Skipping duplicate job.`);
            return {
                success: true,
                emailId,
                skipped: true,
                reason: "CLAIM_FAILED"
            };
        }
    }
    try {
        await (0, email_throttle_js_1.waitForEmailSendSlot)();
        // Re-check the database immediately before sending.
        // This prevents sending an email that was cancelled
        // while the worker was waiting.
        const currentEmail = await prisma_js_1.default.email.findUnique({
            where: {
                id: emailId
            }
        });
        if (!currentEmail) {
            console.log(`Email ${emailId} no longer exists. Skipping.`);
            return {
                success: true,
                emailId,
                skipped: true,
                reason: "EMAIL_NOT_FOUND"
            };
        }
        if (currentEmail.status !== "PROCESSING") {
            console.log(`Email ${emailId} is no longer processing. Current status: ${currentEmail.status}`);
            return {
                success: true,
                emailId,
                skipped: true,
                reason: "EMAIL_NOT_PROCESSING"
            };
        }
        console.log(`[${new Date().toISOString()}] Sending email to:`, email.recipient);
        await (0, email_sender_js_1.sendEmail)({
            recipient: email.recipient,
            subject: email.subject,
            body: email.body,
            sender: email.sender
        });
        await prisma_js_1.default.email.update({
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
            emailId
        };
    }
    catch (error) {
        const isFinalAttempt = attempt >= MAX_ATTEMPTS;
        console.error(`Email sending failed | Attempt ${attempt}/${MAX_ATTEMPTS}`);
        if (isFinalAttempt) {
            await prisma_js_1.default.email.update({
                where: {
                    id: emailId
                },
                data: {
                    status: "FAILED"
                }
            });
            console.error("All retry attempts exhausted. Email marked as FAILED.");
        }
        throw error;
    }
}, {
    connection,
    concurrency,
    limiter: {
        max: MAX_EMAILS_PER_HOUR,
        duration: 60 * 60 * 1000
    }
});
worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});
worker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message);
});
console.log(`Email worker started with concurrency: ${concurrency}`);
