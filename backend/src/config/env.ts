import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(8),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  PASSWORD_RESET_URL_BASE: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.enum(["true", "false"]).optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),
  SMTP_FROM: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PASSWORD_RESET_URL_BASE: parsed.data.PASSWORD_RESET_URL_BASE ?? parsed.data.CLIENT_ORIGIN,
  SMTP_PORT: parsed.data.SMTP_PORT ?? 587,
  SMTP_SECURE: parsed.data.SMTP_SECURE === "true",
  SMTP_FROM: parsed.data.SMTP_FROM ?? parsed.data.SMTP_USER,
};
