"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
exports.scheduleEmail = scheduleEmail;
exports.cancelScheduledEmail = cancelScheduledEmail;
const bullmq_1 = require("bullmq");
const connection = {
    host: "localhost",
    port: 6379
};
exports.emailQueue = new bullmq_1.Queue("email-queue", {
    connection
});
async function scheduleEmail(emailId, scheduledAt) {
    const delay = Math.max(scheduledAt.getTime() - Date.now(), 0);
    const existingJob = await exports.emailQueue.getJob(emailId);
    if (existingJob) {
        await existingJob.remove();
    }
    const job = await exports.emailQueue.add("send-email", {
        emailId
    }, {
        jobId: emailId,
        delay,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: true,
        removeOnFail: false
    });
    return job;
}
async function cancelScheduledEmail(emailId) {
    const job = await exports.emailQueue.getJob(emailId);
    // Job already disappeared from the queue.
    // Treat cancellation as successful.
    if (!job) {
        return true;
    }
    await job.remove();
    return true;
}
