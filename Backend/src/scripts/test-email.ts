import "dotenv/config";
import nodemailer from "nodemailer";
import { sendEmail } from "../services/email.sender.js";

async function main() {
    const result = await sendEmail({
        recipient: "test@example.com",
        subject: "ReachInbox SMTP Test",
        body: "This is a test email from ReachInbox."
    });

    console.log("Email sent:", result.messageId);

    const previewUrl = nodemailer.getTestMessageUrl(result);

    console.log("Preview URL:", previewUrl);
}

main().catch((error) => {
    console.error("Email test failed:", error);
    process.exit(1);
});