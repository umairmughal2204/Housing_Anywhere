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
    subject: "Reset your EzzyStay password",
    text,
    html,
  });
}

export async function sendSignupVerificationEmail(toEmail: string, firstName: string, verificationCode: string) {
  const activeTransporter = getTransporter();
  if (!activeTransporter || !env.SMTP_FROM) {
    throw new Error("Email service is not configured");
  }

  const text = [
    `Hi ${firstName},`,
    "",
    "Use this verification code to finish creating your EzzyStay account:",
    verificationCode,
    "",
    "This code expires in 15 minutes.",
    "If you did not request this code, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Hi ${firstName},</p>
    <p>Use this verification code to finish creating your EzzyStay account:</p>
    <p><strong style="font-size: 20px; letter-spacing: 2px;">${verificationCode}</strong></p>
    <p>This code expires in 15 minutes.</p>
    <p>If you did not request this code, you can ignore this email.</p>
  `;

  await activeTransporter.sendMail({
    from: env.SMTP_FROM,
    to: toEmail,
    subject: "Your EzzyStay verification code",
    text,
    html,
  });
}

export async function sendContactFormEmail({
  name,
  email,
  subject,
  message,
  phone,
  userType,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  userType?: string;
}) {
  const activeTransporter = getTransporter();
  if (!activeTransporter || !env.SMTP_FROM) {
    throw new Error("Email service is not configured");
  }

  const recipient = env.ADMIN_EMAIL || env.SMTP_USER || "admin@ezzystay.com";

  const text = [
    `New Contact Form Submission from EzzyStay`,
    `----------------------------------------`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `User Type: ${userType || "Visitor"}`,
    `Subject: ${subject}`,
    ``,
    `Message:`,
    message,
  ].join("\n");

  const html = `
    <h2>New Contact Inquiry from EzzyStay</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
    <p><strong>User Type:</strong> ${userType || "Visitor"}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <hr/>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap; background: #f8fafb; padding: 16px; border-radius: 8px;">${message}</p>
  `;

  await activeTransporter.sendMail({
    from: env.SMTP_FROM,
    to: recipient,
    replyTo: email,
    subject: `EzzyStay Contact: ${subject}`,
    text,
    html,
  });
}

