import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
export async function sendEmail(data) {
    const result = await transporter.sendMail({
        from: `"${data.sender.name}" <${data.sender.email}>`,
        to: data.recipient,
        subject: data.subject,
        text: data.body
    });
    return result;
}
