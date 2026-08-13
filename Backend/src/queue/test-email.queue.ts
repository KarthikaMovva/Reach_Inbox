import { emailQueue } from "./email.queue.js";

async function addTestJob() {
    const job = await emailQueue.add("test-email", {
        emailId: "test-123",
        recipient: "test@example.com",
        subject: "BullMQ Test"
    });

    console.log("Job added:", job.id);

    await emailQueue.close();
}

addTestJob();