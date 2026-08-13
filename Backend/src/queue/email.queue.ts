import { Queue } from "bullmq";

const connection = {
    host: "localhost",
    port: 6379
};

export const emailQueue = new Queue("email-queue", {
    connection
});

export async function scheduleEmail(
    emailId: string,
    scheduledAt: Date
) {
    const delay = Math.max(
        scheduledAt.getTime() - Date.now(),
        0
    );

    const job = await emailQueue.add(
        "send-email",
        {
            emailId
        },
        {
            jobId: emailId,

            delay,

            attempts: 3,

            backoff: {
                type: "exponential",
                delay: 5000
            },

            removeOnComplete: true,
            removeOnFail: false
        }
    );

    return job;
}

export async function cancelScheduledEmail(emailId: string) {
    const job = await emailQueue.getJob(emailId);

    if (!job) {
        return false;
    }

    await job.remove();

    return true;
}