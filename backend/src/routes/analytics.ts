import { Router } from "express";
import { z } from "zod";
import { PageViewModel } from "../models/PageView.js";
import { verifyAccessToken } from "../utils/jwt.js";

const router = Router();

const trackSchema = z.object({
  path: z.string().trim().min(1).max(300),
  visitorId: z.string().trim().min(1).max(100),
  sessionId: z.string().trim().min(1).max(100),
  referrer: z.string().trim().max(500).optional(),
});

const BOT_UA_PATTERN = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegrambot/i;

function detectDevice(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobi|android|iphone/i.test(userAgent)) return "mobile";
  return "desktop";
}

function parseReferrerHost(referrer: string | undefined): string {
  if (!referrer) return "direct";
  try {
    return new URL(referrer).hostname || "direct";
  } catch {
    return "direct";
  }
}

router.post("/track", async (req, res) => {
  const userAgent = req.header("user-agent") ?? "";
  if (BOT_UA_PATTERN.test(userAgent)) {
    res.status(204).send();
    return;
  }

  const parsed = trackSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid tracking payload" });
    return;
  }

  let userId: string | undefined;
  const auth = req.header("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token) {
    try {
      userId = verifyAccessToken(token).sub;
    } catch {
      // ignore invalid/expired token, track anonymously
    }
  }

  await PageViewModel.create({
    path: parsed.data.path,
    visitorId: parsed.data.visitorId,
    sessionId: parsed.data.sessionId,
    referrerHost: parseReferrerHost(parsed.data.referrer),
    device: detectDevice(userAgent),
    userId,
  });

  res.status(204).send();
});

export default router;
