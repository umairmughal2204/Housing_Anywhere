import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { Types } from "mongoose";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ListingModel } from "../models/Listing.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";
import { ConversationModel } from "../models/Conversation.js";
import { MessageModel } from "../models/Message.js";
import { UserModel } from "../models/User.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 7 * 1024 * 1024,
    files: 4,
  },
});

const rentalApplicationSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  dateOfBirth: z
    .object({
      day: z.string().optional().default(""),
      month: z.string().optional().default(""),
      year: z.string().optional().default(""),
    })
    .optional(),
  gender: z.enum(["male", "female", "other"]).nullable().optional(),
  countryCode: z.string().optional().default(""),
  mobileNumber: z.string().optional().default(""),
  moveInCount: z.number().int().min(1).max(10).default(1),
  withPets: z.boolean().default(false),
  occupation: z.enum(["student", "professional", "other"]).nullable().optional(),
  universityName: z.string().optional().default(""),
  visaStatus: z.string().nullable().optional(),
  paymentMethods: z.array(z.string()).default([]),
  monthlyBudget: z.string().optional().default(""),
  employerName: z.string().optional().default(""),
  income: z.string().optional().default(""),
  supportingMessage: z.string().min(1).max(2000),
  moveInDate: z.string().datetime().nullable().optional(),
  moveOutDate: z.string().datetime().nullable().optional(),
  moveInAvailabilityConfirmed: z.boolean().optional().default(false),
  idVerified: z.boolean().default(false),
  shareDocuments: z.boolean().default(false),
  billingAddress: z
    .object({
      firstName: z.string().optional().default(""),
      lastName: z.string().optional().default(""),
      country: z.string().optional().default(""),
      street: z.string().optional().default(""),
      apartmentNumber: z.string().optional().default(""),
      city: z.string().optional().default(""),
      stateProvince: z.string().optional().default(""),
      postalCode: z.string().optional().default(""),
      confirmed: z.boolean().optional().default(false),
    })
    .optional(),
  paymentDetails: z
    .object({
      method: z.enum(["card", "ideal", "bancontact"]).optional().default("card"),
      cardNumber: z.string().optional().default(""),
      expiryDate: z.string().optional().default(""),
      cardholderName: z.string().optional().default(""),
      isPaid: z.boolean().optional().default(false),
      paidAmount: z.number().min(0).optional().default(0),
      currency: z.string().optional().default("EUR"),
      addRentGuarantee: z.boolean().optional().default(false),
      rentGuaranteeFee: z.number().min(0).optional().default(0),
      tenantProtectionFee: z.number().min(0).optional().default(0),
      rentForSelectedPeriod: z.number().min(0).optional().default(0),
      totalAmount: z.number().min(0).optional().default(0),
    })
    .optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});

const tenantResponseSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  decision: z.enum(["decline", "change_dates"]),
});

function mapDocumentType(fieldname: string): "enrollment" | "employment" | "income" | "profile" | null {
  if (fieldname === "enrollmentProof") return "enrollment";
  if (fieldname === "employmentProof") return "employment";
  if (fieldname === "incomeProof") return "income";
  if (fieldname === "profilePicture") return "profile";
  return null;
}

router.post(
  "/",
  requireAuth,
  upload.fields([
    { name: "enrollmentProof", maxCount: 1 },
    { name: "employmentProof", maxCount: 1 },
    { name: "incomeProof", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  async (req, res) => {
    if (req.user!.role === "landlord") {
      res
        .status(403)
        .json({ message: "Landlords cannot submit rental applications. Please create a tenant account to apply for properties." });
      return;
    }

    const rawApplication = req.body.application;
    if (typeof rawApplication !== "string") {
      res.status(400).json({ message: "Invalid application payload" });
      return;
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawApplication);
    } catch {
      res.status(400).json({ message: "Application payload is not valid JSON" });
      return;
    }

    const parsed = rentalApplicationSchema.safeParse(parsedBody);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid application data", errors: parsed.error.flatten() });
      return;
    }

    const tenantId = req.user!.sub;
    const input = parsed.data;

    const listing = await ListingModel.findOne({ _id: input.listingId, status: "active" }).lean();
    if (!listing) {
      const existingListing = await ListingModel.findById(input.listingId).select("status").lean();
      if (existingListing) {
        res.status(410).json({ message: "This listing is no longer available for applications" });
        return;
      }

      res.status(404).json({ message: "Listing not found" });
      return;
    }

    const existingPending = await RentalApplicationModel.findOne({
      listingId: listing._id,
      tenantId,
      status: "pending",
    }).lean();

    if (existingPending) {
      res.status(409).json({ message: "You already have a pending request for this property" });
      return;
    }

    const uploadsDir = path.resolve(process.cwd(), "uploads", "rental-applications");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filesByField = req.files as Record<string, Express.Multer.File[]> | undefined;
    const allFiles = filesByField ? Object.values(filesByField).flat() : [];

    const documents: Array<{
      type: "enrollment" | "employment" | "income" | "profile";
      name: string;
      url: string;
      mimeType: string;
      size: number;
    }> = [];

    for (const file of allFiles) {
      const mappedType = mapDocumentType(file.fieldname);
      if (!mappedType) {
        continue;
      }

      const extension = (file.originalname.split(".").pop() || "bin").toLowerCase();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
      const fullPath = path.join(uploadsDir, filename);

      await fs.writeFile(fullPath, file.buffer);

      documents.push({
        type: mappedType,
        name: file.originalname,
        url: `${req.protocol}://${req.get("host")}/uploads/rental-applications/${filename}`,
        mimeType: file.mimetype,
        size: file.size,
      });
    }

    const formattedDateOfBirth = input.dateOfBirth
      ? [input.dateOfBirth.day, input.dateOfBirth.month, input.dateOfBirth.year].filter(Boolean).join("/")
      : "";

    const normalizedCard = (input.paymentDetails?.cardNumber ?? "").replace(/\s+/g, "");
    const cardLast4 = normalizedCard.length >= 4 ? normalizedCard.slice(-4) : "";

    const created = await RentalApplicationModel.create({
      listingId: listing._id,
      landlordId: listing.landlordId,
      tenantId,
      dateOfBirth: formattedDateOfBirth,
      gender: input.gender ?? undefined,
      countryCode: input.countryCode,
      mobileNumber: input.mobileNumber,
      moveInCount: input.moveInCount,
      withPets: input.withPets,
      occupation: input.occupation ?? undefined,
      universityName: input.universityName,
      visaStatus: input.visaStatus ?? undefined,
      paymentMethods: input.paymentMethods,
      monthlyBudget: input.monthlyBudget,
      employerName: input.employerName,
      income: input.income,
      supportingMessage: input.supportingMessage,
      moveInDate: input.moveInDate ? new Date(input.moveInDate) : undefined,
      moveOutDate: input.moveOutDate ? new Date(input.moveOutDate) : undefined,
      moveInAvailabilityConfirmed: input.moveInAvailabilityConfirmed,
      idVerified: input.idVerified,
      shareDocuments: input.shareDocuments,
      billingAddress: {
        firstName: input.billingAddress?.firstName ?? "",
        lastName: input.billingAddress?.lastName ?? "",
        country: input.billingAddress?.country ?? "",
        street: input.billingAddress?.street ?? "",
        apartmentNumber: input.billingAddress?.apartmentNumber ?? "",
        city: input.billingAddress?.city ?? "",
        stateProvince: input.billingAddress?.stateProvince ?? "",
        postalCode: input.billingAddress?.postalCode ?? "",
        confirmed: input.billingAddress?.confirmed ?? false,
      },
      paymentDetails: {
        method: input.paymentDetails?.method ?? "card",
        cardLast4,
        expiryDate: input.paymentDetails?.expiryDate ?? "",
        cardholderName: input.paymentDetails?.cardholderName ?? "",
        isPaid: input.paymentDetails?.isPaid ?? false,
        paidAmount: input.paymentDetails?.paidAmount ?? 0,
        currency: input.paymentDetails?.currency ?? "EUR",
        addRentGuarantee: input.paymentDetails?.addRentGuarantee ?? false,
        rentGuaranteeFee: input.paymentDetails?.rentGuaranteeFee ?? 0,
        tenantProtectionFee: input.paymentDetails?.tenantProtectionFee ?? 0,
        rentForSelectedPeriod: input.paymentDetails?.rentForSelectedPeriod ?? 0,
        totalAmount: input.paymentDetails?.totalAmount ?? 0,
      },
      documents,
    });

    // Create or reuse a conversation for this tenant/landlord/listing and send the supporting message into chat.
    const conversation = await ConversationModel.findOneAndUpdate(
      {
        tenantId: new Types.ObjectId(tenantId),
        landlordId: new Types.ObjectId(String(listing.landlordId)),
        listingId: new Types.ObjectId(String(listing._id)),
      },
      {
        $setOnInsert: {
          tenantId: new Types.ObjectId(tenantId),
          landlordId: new Types.ObjectId(String(listing.landlordId)),
          listingId: new Types.ObjectId(String(listing._id)),
        },
      },
      { upsert: true, new: true }
    );

    const chatBody = input.supportingMessage.trim();
    if (chatBody.length > 0) {
      await MessageModel.create({
        conversationId: conversation._id,
        senderId: new Types.ObjectId(tenantId),
        senderRole: "tenant",
        body: chatBody,
      });

      await ConversationModel.updateOne(
        { _id: conversation._id },
        {
          $set: { lastMessage: chatBody, lastMessageAt: new Date() },
          $inc: { unreadByLandlord: 1 },
        }
      );
    }

    await ListingModel.updateOne({ _id: listing._id }, { $inc: { inquiries: 1 } });

    res.status(201).json({
      application: {
        id: String(created._id),
        status: created.status,
      },
      conversationId: String(conversation._id),
    });
  }
);

router.get("/tenant/check", requireAuth, async (req, res) => {
  const listingId = req.query.listingId;
  if (typeof listingId !== "string" || !/^[0-9a-fA-F]{24}$/.test(listingId)) {
    res.status(400).json({ message: "Invalid listingId" });
    return;
  }

  const application = await RentalApplicationModel.findOne({
    tenantId: new Types.ObjectId(req.user!.sub),
    listingId: new Types.ObjectId(listingId),
  })
    .select("status createdAt")
    .lean();

  res.json({
    hasApplied: !!application,
    applicationId: application ? String(application._id) : null,
    status: application?.status ?? null,
    createdAt: application?.createdAt ?? null,
  });
});

router.patch("/tenant/respond", requireAuth, async (req, res) => {
  if (req.user!.role === "landlord") {
    res.status(403).json({ message: "Only tenants can respond to invitations." });
    return;
  }

  const parsed = tenantResponseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid tenant response payload", errors: parsed.error.flatten() });
    return;
  }

  const { listingId, decision } = parsed.data;
  const tenantId = new Types.ObjectId(req.user!.sub);

  const application = await RentalApplicationModel.findOne({
    tenantId,
    listingId: new Types.ObjectId(listingId),
  }).sort({ createdAt: -1 });

  if (!application) {
    res.status(404).json({ message: "Rental application not found for this listing." });
    return;
  }

  if (decision === "decline") {
    application.status = "rejected";
  }

  if (decision === "change_dates" && application.status === "approved") {
    application.status = "pending";
  }

  await application.save();

  res.json({
    application: {
      id: String(application._id),
      status: application.status,
    },
  });
});

router.get("/landlord", requireAuth, requireRole("landlord"), async (req, res) => {
  const landlordId = req.user!.sub;

  const applications = await RentalApplicationModel.find({ landlordId }).sort({ createdAt: -1 }).lean();

  const listingIds = Array.from(new Set(applications.map((item) => String(item.listingId))));
  const tenantIds = Array.from(new Set(applications.map((item) => String(item.tenantId))));

  const [listings, tenants] = await Promise.all([
    ListingModel.find({ _id: { $in: listingIds } }).lean(),
    UserModel.find({ _id: { $in: tenantIds } }).lean(),
  ]);

  const listingMap = new Map(listings.map((item) => [String(item._id), item]));
  const tenantMap = new Map(tenants.map((item) => [String(item._id), item]));

  res.json({
    applications: applications.map((item) => {
      const listing = listingMap.get(String(item.listingId));
      const tenant = tenantMap.get(String(item.tenantId));

      return {
        id: String(item._id),
        status: item.status,
        createdAt: item.createdAt,
        supportingMessage: item.supportingMessage,
        moveInCount: item.moveInCount,
        withPets: item.withPets,
        occupation: item.occupation,
        visaStatus: item.visaStatus,
        idVerified: item.idVerified,
        moveInDate: item.moveInDate ?? null,
        moveOutDate: item.moveOutDate ?? null,
        moveInAvailabilityConfirmed: item.moveInAvailabilityConfirmed ?? false,
        billingAddress: item.billingAddress ?? null,
        paymentDetails: item.paymentDetails
          ? {
              method: item.paymentDetails.method,
              cardLast4: item.paymentDetails.cardLast4,
              expiryDate: item.paymentDetails.expiryDate,
              cardholderName: item.paymentDetails.cardholderName,
              isPaid: item.paymentDetails.isPaid,
              paidAmount: item.paymentDetails.paidAmount,
              currency: item.paymentDetails.currency,
              addRentGuarantee: item.paymentDetails.addRentGuarantee,
              rentGuaranteeFee: item.paymentDetails.rentGuaranteeFee,
              tenantProtectionFee: item.paymentDetails.tenantProtectionFee,
              rentForSelectedPeriod: item.paymentDetails.rentForSelectedPeriod,
              totalAmount: item.paymentDetails.totalAmount,
            }
          : null,
        documents: (item.documents || []).map((doc) => ({
          id: `${String(item._id)}-${doc.type}-${doc.name}`,
          type: doc.type,
          name: doc.name,
          url: doc.url,
          mimeType: doc.mimeType,
          size: doc.size,
        })),
        listing: {
          id: listing ? String(listing._id) : "",
          title: listing?.title ?? "Listing unavailable",
          address: listing?.address ?? "",
          city: listing?.city ?? "",
            monthlyRent: listing?.monthlyRent ?? (listing as any)?.price ?? 0,
            deposit: listing?.deposits?.[0]?.amount ?? (listing as any)?.deposit ?? 0,
              image: listing?.media?.[0]?.url ?? (listing as any)?.images?.[0] ?? "",
        },
        tenant: {
          id: tenant ? String(tenant._id) : "",
          name: tenant ? `${tenant.firstName} ${tenant.lastName}` : "Unknown tenant",
          email: tenant?.email ?? "",
          phone: `${item.countryCode ?? ""} ${item.mobileNumber ?? ""}`.trim(),
          dateOfBirth: item.dateOfBirth,
          gender: item.gender,
          universityName: item.universityName,
          monthlyBudget: item.monthlyBudget,
          employerName: item.employerName,
          income: item.income,
          paymentMethods: item.paymentMethods,
        },
      };
    }),
  });
});

router.patch("/:id([0-9a-fA-F]{24})/status", requireAuth, requireRole("landlord"), async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid status", errors: parsed.error.flatten() });
    return;
  }

  const application = await RentalApplicationModel.findByIdAndUpdate(
    req.params.id,
    { status: parsed.data.status },
    { new: true }
  );

  if (!application) {
    res.status(404).json({ message: "Rental request not found" });
    return;
  }


  res.json({
    application: {
      id: String(application._id),
      status: application.status,
    },
  });
});

router.get("/tenant", requireAuth, async (req, res) => {
  const tenantId = new Types.ObjectId(req.user!.sub);
  const applications = await RentalApplicationModel.find({ tenantId }).sort({ createdAt: -1 }).lean();

  const listingIds = Array.from(new Set(applications.map((item) => String(item.listingId))));
  const listings = await ListingModel.find({ _id: { $in: listingIds } }).lean();
  const listingMap = new Map(listings.map((item) => [String(item._id), item]));

  res.json({
    applications: applications.map((item) => ({
      id: String(item._id),
      listingId: String(item.listingId),
      status: item.status,
      createdAt: item.createdAt,
      moveInDate: item.moveInDate ?? null,
      moveOutDate: item.moveOutDate ?? null,
      moveInAvailabilityConfirmed: item.moveInAvailabilityConfirmed ?? false,
      billingAddress: item.billingAddress ?? null,
      paymentDetails: item.paymentDetails
        ? {
            method: item.paymentDetails.method,
            cardLast4: item.paymentDetails.cardLast4,
            expiryDate: item.paymentDetails.expiryDate,
            cardholderName: item.paymentDetails.cardholderName,
            isPaid: item.paymentDetails.isPaid,
            paidAmount: item.paymentDetails.paidAmount,
            currency: item.paymentDetails.currency,
            addRentGuarantee: item.paymentDetails.addRentGuarantee,
            rentGuaranteeFee: item.paymentDetails.rentGuaranteeFee,
            tenantProtectionFee: item.paymentDetails.tenantProtectionFee,
            rentForSelectedPeriod: item.paymentDetails.rentForSelectedPeriod,
            totalAmount: item.paymentDetails.totalAmount,
          }
        : null,
      listing: {
        isAvailable: listingMap.get(String(item.listingId))?.status === "active",
        title: listingMap.get(String(item.listingId))?.title ?? "Listing unavailable",
        city: listingMap.get(String(item.listingId))?.city ?? "",
        address: listingMap.get(String(item.listingId))?.address ?? "",
        monthlyRent: listingMap.get(String(item.listingId))?.monthlyRent ?? (listingMap.get(String(item.listingId)) as any)?.price ?? 0,
        image: listingMap.get(String(item.listingId))?.media?.[0]?.url ?? (listingMap.get(String(item.listingId)) as any)?.images?.[0] ?? "",
      },
    })),
  });
});

// Get all landlord bookings for calendar view
router.get("/landlord/bookings", requireAuth, async (req, res) => {
  try {
    if (req.user!.role !== "landlord") {
      return res.status(403).json({ message: "Only landlords can view bookings" });
    }

    const landlordId = req.user!.sub;

    // Fetch all rental applications for this landlord
    const applications = await RentalApplicationModel.find({ landlordId: new Types.ObjectId(landlordId) })
      .populate("listingId", "title media")
      .populate("tenantId", "name")
      .sort({ moveInDate: 1 });

    const bookings = applications
      .filter((app) => app.moveInDate && app.moveOutDate)
      .map((app) => {
        const listing = app.listingId as any;
        const propertyImage = listing?.media && listing.media.length > 0 ? listing.media[0].url : undefined;
        return {
          id: String(app._id),
          propertyTitle: listing?.title || "Unknown Property",
          propertyImage,
          tenantName: (app.tenantId as any)?.name || "Unknown Tenant",
          moveInDate: app.moveInDate?.toISOString() || "",
          moveOutDate: app.moveOutDate?.toISOString() || "",
          status: app.status,
        };
      });

    return res.status(200).json({ bookings });
  } catch (err) {
    console.error("Error fetching landlord bookings:", err);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

export default router;
