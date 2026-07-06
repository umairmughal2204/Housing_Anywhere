import { Router } from "express";
import { getPlatformSettings } from "../models/PlatformSettings.js";

const router = Router();

// GET /api/settings — public, read-only platform configuration (fee rates, caps, etc.)
router.get("/", async (_req, res) => {
  const settings = await getPlatformSettings();

  res.json({
    tenantProtectionFeeRate: settings.tenantProtectionFeeRate,
    tenantProtectionFeeCap: settings.tenantProtectionFeeCap,
  });
});

export default router;
