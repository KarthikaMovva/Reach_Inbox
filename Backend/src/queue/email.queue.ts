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

    const existingJob = await emailQueue.getJob(emailId);

    if (existingJob) {
        await existingJob.remove();
    }

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

export async function cancelScheduledEmail(
    emailId: string
) {
    const job = await emailQueue.getJob(emailId);

    // Job already disappeared from the queue.
    // Treat cancellation as successful.
    if (!job) {
        return true;
    }

    await job.remove();

    return true;
}