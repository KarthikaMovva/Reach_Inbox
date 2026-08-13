import { Worker } from "bullmq";

const connection = {
    host: "localhost",
    port: 6379
};

const worker = new Worker(
    "email-queue",
    async (job) => {
        console.log("Processing job:", job.id);
        console.log("Job data:", job.data);

        return {
            success: true
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
    console.error(`Job ${job?.id} failed:`, error.message);
});

console.log("Email worker started...");