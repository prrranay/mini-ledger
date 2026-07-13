import nodemailer from "nodemailer";
import { logActivity } from "./activity";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
  userId,
}: {
  to: string;
  subject: string;
  html: string;
  userId?: string;
}) {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.warn("SMTP credentials not configured, skipping email.");
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@miniledger.app",
      to,
      subject,
      html,
    });

    if (userId) {
      await logActivity(userId, "EMAIL_SENT", `Subject: ${subject}`);
    }
  } catch (error) {
    console.error("Failed to send email:", error);
    if (userId) {
      await logActivity(userId, "EMAIL_FAILED", `Subject: ${subject} | Error: ${error instanceof Error ? error.message : "Unknown"}`);
    }
  }
}
