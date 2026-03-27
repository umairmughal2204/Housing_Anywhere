import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export function canSendEmails() {
  return isSmtpConfigured();
}

export async function sendPasswordResetEmail(toEmail: string, firstName: string, resetLink: string) {
  const activeTransporter = getTransporter();
  if (!activeTransporter || !env.SMTP_FROM) {
    throw new Error("Email service is not configured");
  }

  const text = [
    `Hi ${firstName},`,
    "",
    "We received a request to reset your password.",
    `Use this link to set a new password: ${resetLink}`,
    "",
    "This link expires in 15 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your password.</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>This link expires in 15 minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await activeTransporter.sendMail({
    from: env.SMTP_FROM,
    to: toEmail,
    subject: "Reset your EasyRent password",
    text,
    html,
  });
}
