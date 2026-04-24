import express, { Router } from "express";
import { createMollieClient } from "@mollie/api-client";
import { z } from "zod";
import { Types } from "mongoose";
import { env } from "../config/env.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";

const router = Router();

const createCheckoutSchema = z.object({
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

const applicationStatusSchema = z.object({
  applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

function formatAmountValue(amount: number) {
  return amount.toFixed(2);
}

router.post("/mollie/create-checkout", requireAuth, requireRole("tenant"), async (req, res) => {
  if (!env.MOLLIE_API_KEY) {
    res.status(500).json({ message: "Mollie API key is not configured" });
    return;
  }

  if (!env.SERVER_PUBLIC_URL) {
    res.status(500).json({ message: "SERVER_PUBLIC_URL is required for Mollie webhooks" });
    return;
  }

  const parsed = createCheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid checkout payload", errors: parsed.error.flatten() });
    return;
  }

  const tenantId = req.user!.sub;
  const application = await RentalApplicationModel.findOne({
    _id: new Types.ObjectId(parsed.data.applicationId),
    tenantId: new Types.ObjectId(tenantId),
  });

  if (!application) {
    res.status(404).json({ message: "Rental application not found" });
    return;
  }

  const totalAmount = Math.max(0, application.paymentDetails?.totalAmount ?? 0);
  if (totalAmount <= 0) {
    res.status(400).json({ message: "Invalid payment amount" });
    return;
  }

  const currency = (application.paymentDetails?.currency || "EUR").toUpperCase();
  const mollieClient = createMollieClient({ apiKey: env.MOLLIE_API_KEY });

  const redirectUrl = `${env.CLIENT_ORIGIN}/property/${String(application.listingId)}/payment/return?applicationId=${String(
    application._id
  )}`;

  const payment = await mollieClient.payments.create({
    amount: {
      currency,
      value: formatAmountValue(totalAmount),
    },
    description: `HousingAnywhere application ${String(application._id)}`,
    redirectUrl,
    webhookUrl: `${env.SERVER_PUBLIC_URL}/api/payments/mollie/webhook`,
    metadata: {
      applicationId: String(application._id),
      tenantId,
      listingId: String(application.listingId),
    },
  });

  application.paymentDetails = {
    ...(application.paymentDetails ?? {}),
    provider: "mollie",
    providerPaymentId: payment.id,
    checkoutUrl: payment._links?.checkout?.href ?? "",
    paymentStatus: payment.status,
  };
  await application.save();

  const checkoutUrl = payment._links?.checkout?.href;
  if (!checkoutUrl) {
    res.status(500).json({ message: "Mollie did not return checkout URL" });
    return;
  }

  res.json({ checkoutUrl, paymentId: payment.id });
});

router.post("/mollie/webhook", express.urlencoded({ extended: false }), async (req, res) => {
  if (!env.MOLLIE_API_KEY) {
    res.status(200).send("ignored");
    return;
  }

  const paymentId = typeof req.body?.id === "string" ? req.body.id : "";
  if (!paymentId) {
    res.status(200).send("missing payment id");
    return;
  }

  const mollieClient = createMollieClient({ apiKey: env.MOLLIE_API_KEY });
  const payment = await mollieClient.payments.get(paymentId);

  const metadata = payment.metadata as { applicationId?: string } | undefined;
  const applicationId = metadata?.applicationId;

  if (!applicationId || !/^[0-9a-fA-F]{24}$/.test(applicationId)) {
    res.status(200).send("ok");
    return;
  }

  const application = await RentalApplicationModel.findById(applicationId);
  if (!application) {
    res.status(200).send("ok");
    return;
  }

  const isPaid = payment.status === "paid";
  const amountValue = Number(payment.amount.value);

  application.paymentDetails = {
    ...(application.paymentDetails ?? {}),
    provider: "mollie",
    providerPaymentId: payment.id,
    isPaid,
    paymentStatus: payment.status,
    paidAmount: Number.isFinite(amountValue) ? amountValue : application.paymentDetails?.paidAmount ?? 0,
    currency: payment.amount.currency,
    paidAt: isPaid ? new Date() : application.paymentDetails?.paidAt,
  };

  await application.save();

  res.status(200).send("ok");
});

router.get("/mollie/application-status", async (req, res) => {
  const parsed = applicationStatusSchema.safeParse({
    applicationId: req.query.applicationId,
  });

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid application id" });
    return;
  }

  const application = await RentalApplicationModel.findById(parsed.data.applicationId);
  if (!application) {
    res.status(404).json({ message: "Rental application not found" });
    return;
  }

  const storedPaymentDetails = application.paymentDetails ?? {};
  let paymentStatus = storedPaymentDetails.paymentStatus ?? (storedPaymentDetails.isPaid ? "paid" : "open");
  let isPaid = Boolean(storedPaymentDetails.isPaid);
  let paidAmount = storedPaymentDetails.paidAmount ?? 0;
  let currency = storedPaymentDetails.currency ?? "EUR";

  if (env.MOLLIE_API_KEY && storedPaymentDetails.providerPaymentId) {
    try {
      const mollieClient = createMollieClient({ apiKey: env.MOLLIE_API_KEY });
      const payment = await mollieClient.payments.get(storedPaymentDetails.providerPaymentId);

      paymentStatus = payment.status;
      isPaid = payment.status === "paid";
      paidAmount = Number(payment.amount.value);
      currency = payment.amount.currency;

      application.paymentDetails = {
        ...storedPaymentDetails,
        provider: "mollie",
        providerPaymentId: payment.id,
        paymentStatus,
        isPaid,
        paidAmount: Number.isFinite(paidAmount) ? paidAmount : storedPaymentDetails.paidAmount ?? 0,
        currency,
        paidAt: isPaid ? new Date() : storedPaymentDetails.paidAt,
      };
      await application.save();
    } catch (error) {
      console.error("Failed to refresh Mollie payment status", error);
    }
  }

  res.json({
    applicationId: String(application._id),
    paymentStatus,
    isPaid,
    paidAmount: Number.isFinite(paidAmount) ? paidAmount : storedPaymentDetails.paidAmount ?? 0,
    currency,
    providerPaymentId: storedPaymentDetails.providerPaymentId ?? "",
  });
});

export default router;
