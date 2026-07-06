import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { UserModel } from "../models/User.js";
import { ListingModel } from "../models/Listing.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";
import { PageViewModel } from "../models/PageView.js";
import { PlatformSettingsModel, getPlatformSettings } from "../models/PlatformSettings.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  const [
    totalUsers,
    totalLandlords,
    totalTenants,
    totalListings,
    totalApplications,
    paidApplications,
    pendingVerifications,
    flaggedUsers,
    paidAwaitingMoveIn,
    payoutsReady,
    payoutsReleased,
    payoutsBlocked,
  ] =
    await Promise.all([
      UserModel.countDocuments({ role: { $ne: "admin" } }),
      UserModel.countDocuments({ role: "landlord" }),
      UserModel.countDocuments({ role: "tenant" }),
      ListingModel.countDocuments(),
      RentalApplicationModel.countDocuments(),
      RentalApplicationModel.find({ "paymentDetails.isPaid": true }).select("paymentDetails.paidAmount").lean(),
      UserModel.countDocuments({ role: { $ne: "admin" }, verificationStatus: "pending" }),
      UserModel.countDocuments({ role: { $ne: "admin" }, verificationStatus: "flagged" }),
      RentalApplicationModel.countDocuments({ "paymentDetails.isPaid": true, keyReceivedConfirmed: { $ne: true } }),
      RentalApplicationModel.countDocuments({ payoutStatus: "ready" }),
      RentalApplicationModel.countDocuments({ payoutStatus: "released" }),
      RentalApplicationModel.countDocuments({ payoutStatus: "blocked" }),
    ]);

  const revenue = paidApplications.reduce((sum, a) => sum + (a.paymentDetails?.paidAmount ?? 0), 0);

  res.json({
    totalUsers,
    totalLandlords,
    totalTenants,
    totalListings,
    totalApplications,
    paidApplications: paidApplications.length,
    revenue,
    pendingVerifications,
    flaggedUsers,
    paidAwaitingMoveIn,
    payoutsReady,
    payoutsReleased,
    payoutsBlocked,
  });
});

// ─── USERS ────────────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const role = typeof req.query.role === "string" ? req.query.role : "";
  const verificationStatus = typeof req.query.verificationStatus === "string" ? req.query.verificationStatus : "";

  const filter: Record<string, unknown> = { role: { $ne: "admin" } };
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role === "tenant" || role === "landlord") {
    filter.role = role;
  }
  if (["pending", "verified", "rejected", "flagged"].includes(verificationStatus)) {
    filter.verificationStatus = verificationStatus;
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("firstName lastName email role isBanned isLandlord createdAt profilePictureUrl")
      .select("firstName lastName email role isBanned isLandlord createdAt profilePictureUrl emailVerified phoneVerified verificationStatus verificationNotes verifiedAt")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    UserModel.countDocuments(filter),
  ]);

  res.json({
    users: users.map((u) => ({
      id: u._id.toString(),
      name: `${u.firstName} ${u.lastName}`,
      email: u.email,
      role: u.role,
      isBanned: u.isBanned ?? false,
      emailVerified: u.emailVerified ?? false,
      phoneVerified: u.phoneVerified ?? false,
      verificationStatus: u.verificationStatus ?? "pending",
      verificationNotes: u.verificationNotes ?? "",
      verifiedAt: u.verifiedAt,
      createdAt: u.createdAt,
      profilePictureUrl: u.profilePictureUrl,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

router.patch("/users/:id/ban", async (req, res) => {
  const parsed = z.object({ isBanned: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "isBanned (boolean) required" });
    return;
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, role: { $ne: "admin" } },
    { $set: { isBanned: parsed.data.isBanned } },
    { new: true }
  ).lean();

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ id: user._id.toString(), isBanned: user.isBanned ?? false });
});

router.patch("/users/:id/role", async (req, res) => {
  const parsed = z.object({ role: z.enum(["tenant", "landlord"]) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "role must be 'tenant' or 'landlord'" });
    return;
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, role: { $ne: "admin" } },
    { $set: { role: parsed.data.role, isLandlord: parsed.data.role === "landlord" } },
    { new: true }
  ).lean();

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ id: user._id.toString(), role: user.role });
});

router.patch("/users/:id/verification", async (req, res) => {
  const parsed = z.object({
    verificationStatus: z.enum(["pending", "verified", "rejected", "flagged"]),
    verificationNotes: z.string().max(2000).optional().default(""),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid verification payload", errors: parsed.error.flatten() });
    return;
  }

  const update: Record<string, unknown> = {
    verificationStatus: parsed.data.verificationStatus,
    verificationNotes: parsed.data.verificationNotes,
  };
  if (parsed.data.verificationStatus === "verified") {
    update.verifiedAt = new Date();
    update.verifiedBy = req.user!.sub;
  } else {
    update.verifiedAt = undefined;
    update.verifiedBy = undefined;
  }

  const user = await UserModel.findOneAndUpdate(
    { _id: req.params.id, role: { $ne: "admin" } },
    { $set: update },
    { new: true }
  ).lean();

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({
    id: user._id.toString(),
    verificationStatus: user.verificationStatus ?? "pending",
    verificationNotes: user.verificationNotes ?? "",
    verifiedAt: user.verifiedAt,
  });
});

// ─── LISTINGS ─────────────────────────────────────────────────────────────────
router.get("/listings", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const status = typeof req.query.status === "string" ? req.query.status : "";

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }
  if (["active", "inactive", "draft"].includes(status)) {
    filter.status = status;
  }

  const [listings, total] = await Promise.all([
    ListingModel.find(filter)
      .select("title city status monthlyRent currency createdAt landlordId")
      .populate("landlordId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ListingModel.countDocuments(filter),
  ]);

  res.json({
    listings: listings.map((l) => {
      const landlord = l.landlordId as { _id: unknown; firstName?: string; lastName?: string; email?: string } | null;
      return {
        id: l._id.toString(),
        title: l.title,
        city: l.city,
        status: l.status,
        monthlyRent: l.monthlyRent,
        currency: l.currency,
        createdAt: l.createdAt,
        landlord: landlord
          ? {
              id: landlord._id?.toString(),
              name: `${landlord.firstName ?? ""} ${landlord.lastName ?? ""}`.trim(),
              email: landlord.email,
            }
          : null,
      };
    }),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

router.patch("/listings/:id/status", async (req, res) => {
  const parsed = z.object({ status: z.enum(["active", "inactive", "draft"]) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "status must be 'active', 'inactive', or 'draft'" });
    return;
  }

  const listing = await ListingModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: parsed.data.status } },
    { new: true }
  ).lean();

  if (!listing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  res.json({ id: listing._id.toString(), status: listing.status });
});

router.delete("/listings/:id", async (req, res) => {
  const listing = await ListingModel.findByIdAndDelete(req.params.id).lean();
  if (!listing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }
  res.json({ message: "Listing deleted" });
});

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────
router.get("/applications", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const approvalStatus = typeof req.query.approvalStatus === "string" ? req.query.approvalStatus : "";
  const payoutStatus = typeof req.query.payoutStatus === "string" ? req.query.payoutStatus : "";

  const filter: Record<string, unknown> = {};
  if (["pending", "approved", "rejected", "paid"].includes(status)) {
    filter.status = status;
  }
  if (["pending", "approved", "rejected"].includes(approvalStatus)) {
    filter.adminApprovalStatus = approvalStatus;
  }
  if (["not_ready", "ready", "released", "blocked"].includes(payoutStatus)) {
    filter.payoutStatus = payoutStatus;
  }

  const [applications, total] = await Promise.all([
    RentalApplicationModel.find(filter)
      .select("status adminApprovalStatus adminNotes tenantMoveInConfirmed tenantMoveInConfirmedAt keyReceivedConfirmed keyReceivedConfirmedAt payoutStatus payoutReleasedAt payoutNotes paymentDetails createdAt moveInDate moveOutDate tenantId landlordId listingId")
      .populate("tenantId", "firstName lastName email verificationStatus")
      .populate("landlordId", "firstName lastName email verificationStatus")
      .populate("listingId", "title city")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    RentalApplicationModel.countDocuments(filter),
  ]);

  res.json({
    applications: applications.map((a) => {
      const tenant = a.tenantId as { _id: unknown; firstName?: string; lastName?: string; email?: string } | null;
      const landlord = a.landlordId as { _id: unknown; firstName?: string; lastName?: string; email?: string } | null;
      const listing = a.listingId as { _id: unknown; title?: string; city?: string } | null;
      return {
        id: a._id.toString(),
        status: a.status,
        isPaid: a.paymentDetails?.isPaid ?? false,
        paymentStatus: a.paymentDetails?.paymentStatus ?? "",
        paidAmount: a.paymentDetails?.paidAmount ?? 0,
        currency: a.paymentDetails?.currency ?? "EUR",
        paidAt: a.paymentDetails?.paidAt,
        rentAmount: a.paymentDetails?.rentForSelectedPeriod ?? 0,
        tenantProtectionFee: a.paymentDetails?.tenantProtectionFee ?? 0,
        rentGuaranteeFee: a.paymentDetails?.addRentGuarantee ? a.paymentDetails?.rentGuaranteeFee ?? 0 : 0,
        totalAmount: a.paymentDetails?.totalAmount ?? a.paymentDetails?.paidAmount ?? 0,
        adminApprovalStatus: a.adminApprovalStatus ?? "pending",
        adminNotes: a.adminNotes ?? "",
        tenantMoveInConfirmed: a.tenantMoveInConfirmed ?? false,
        tenantMoveInConfirmedAt: a.tenantMoveInConfirmedAt,
        keyReceivedConfirmed: a.keyReceivedConfirmed ?? false,
        keyReceivedConfirmedAt: a.keyReceivedConfirmedAt,
        payoutStatus: a.payoutStatus ?? "not_ready",
        payoutReleasedAt: a.payoutReleasedAt,
        payoutNotes: a.payoutNotes ?? "",
        moveInDate: a.moveInDate,
        moveOutDate: a.moveOutDate,
        createdAt: a.createdAt,
        tenant: tenant ? { id: tenant._id?.toString(), name: `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim(), email: tenant.email, verificationStatus: (tenant as any).verificationStatus ?? "pending" } : null,
        landlord: landlord ? { id: landlord._id?.toString(), name: `${landlord.firstName ?? ""} ${landlord.lastName ?? ""}`.trim(), email: landlord.email, verificationStatus: (landlord as any).verificationStatus ?? "pending" } : null,
        listing: listing ? { id: listing._id?.toString(), title: listing.title, city: listing.city } : null,
      };
    }),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

router.patch("/applications/:id/approval", async (req, res) => {
  const parsed = z.object({
    adminApprovalStatus: z.enum(["pending", "approved", "rejected"]),
    adminNotes: z.string().max(2000).optional().default(""),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid approval payload", errors: parsed.error.flatten() });
    return;
  }

  const application = await RentalApplicationModel.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        adminApprovalStatus: parsed.data.adminApprovalStatus,
        adminNotes: parsed.data.adminNotes,
        status: parsed.data.adminApprovalStatus === "pending" ? "pending" : parsed.data.adminApprovalStatus,
      },
    },
    { new: true }
  ).lean();

  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return;
  }

  res.json({
    id: application._id.toString(),
    status: application.status,
    adminApprovalStatus: application.adminApprovalStatus ?? "pending",
    adminNotes: application.adminNotes ?? "",
  });
});

router.patch("/applications/:id/payout", async (req, res) => {
  const parsed = z.object({
    payoutStatus: z.enum(["not_ready", "ready", "released", "blocked"]),
    payoutNotes: z.string().max(2000).optional().default(""),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid payout payload", errors: parsed.error.flatten() });
    return;
  }

  const application = await RentalApplicationModel.findById(req.params.id);
  if (!application) {
    res.status(404).json({ message: "Application not found" });
    return;
  }

  const isPaid = Boolean(application.paymentDetails?.isPaid);
  const keyConfirmed = Boolean(application.keyReceivedConfirmed && application.tenantMoveInConfirmed);
  if (["ready", "released"].includes(parsed.data.payoutStatus) && (!isPaid || !keyConfirmed)) {
    res.status(400).json({ message: "Payout requires paid payment and tenant key/accommodation confirmation" });
    return;
  }

  application.payoutStatus = parsed.data.payoutStatus as any;
  application.payoutNotes = parsed.data.payoutNotes;
  application.payoutReleasedAt = parsed.data.payoutStatus === "released" ? new Date() : undefined;
  await application.save();

  res.json({
    id: application._id.toString(),
    payoutStatus: application.payoutStatus,
    payoutNotes: application.payoutNotes,
    payoutReleasedAt: application.payoutReleasedAt,
  });
});

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
router.get("/payments/summary", async (_req, res) => {
  const paidApplications = await RentalApplicationModel.find({ "paymentDetails.isPaid": true })
    .select("paymentDetails payoutStatus")
    .lean();

  let totalCollected = 0;
  let platformProfit = 0;
  let totalRentOwed = 0;
  let pendingPayout = 0;
  let releasedToLandlords = 0;
  let blockedAmount = 0;

  for (const application of paidApplications) {
    const paymentDetails = application.paymentDetails ?? {};
    const rent = paymentDetails.rentForSelectedPeriod ?? 0;
    const fees =
      (paymentDetails.tenantProtectionFee ?? 0) +
      (paymentDetails.addRentGuarantee ? paymentDetails.rentGuaranteeFee ?? 0 : 0);
    const total = paymentDetails.totalAmount ?? paymentDetails.paidAmount ?? 0;

    totalCollected += total;
    platformProfit += fees;
    totalRentOwed += rent;

    if (application.payoutStatus === "released") {
      releasedToLandlords += rent;
    } else if (application.payoutStatus === "blocked") {
      blockedAmount += rent;
    } else {
      pendingPayout += rent;
    }
  }

  res.json({
    totalPayments: paidApplications.length,
    totalCollected,
    platformProfit,
    totalRentOwed,
    pendingPayout,
    releasedToLandlords,
    blockedAmount,
    currency: "EUR",
  });
});

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
router.get("/analytics/overview", async (req, res) => {
  const range = z.enum(["7", "30", "90"]).catch("30").parse(req.query.range);
  const days = Number(range);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const match = { createdAt: { $gte: since } };

  const [totalPageviews, visitorIds, sessionIds, series, topPages, referrers, devices] = await Promise.all([
    PageViewModel.countDocuments(match),
    PageViewModel.distinct("visitorId", match),
    PageViewModel.distinct("sessionId", match),
    PageViewModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          pageviews: { $sum: 1 },
          visitors: { $addToSet: "$visitorId" },
        },
      },
      { $project: { _id: 0, date: "$_id", pageviews: 1, visitors: { $size: "$visitors" } } },
      { $sort: { date: 1 } },
    ]),
    PageViewModel.aggregate([
      { $match: match },
      { $group: { _id: "$path", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, path: "$_id", count: 1 } },
    ]),
    PageViewModel.aggregate([
      { $match: match },
      { $group: { _id: "$referrerHost", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, host: "$_id", count: 1 } },
    ]),
    PageViewModel.aggregate([
      { $match: match },
      { $group: { _id: "$device", count: { $sum: 1 } } },
      { $project: { _id: 0, device: "$_id", count: 1 } },
    ]),
  ]);

  const uniqueVisitors = visitorIds.length;
  const uniqueSessions = sessionIds.length;
  const avgPagesPerSession = uniqueSessions > 0 ? totalPageviews / uniqueSessions : 0;

  res.json({
    range: days,
    totalPageviews,
    uniqueVisitors,
    uniqueSessions,
    avgPagesPerSession,
    series,
    topPages,
    referrers,
    devices,
  });
});

router.get("/analytics/top-listings", async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  const listings = await ListingModel.find({ status: "active" })
    .sort({ views: -1 })
    .limit(limit)
    .select("title city views inquiries")
    .lean();

  res.json({
    listings: listings.map((l) => ({
      id: l._id.toString(),
      title: l.title,
      city: l.city,
      views: l.views ?? 0,
      inquiries: l.inquiries ?? 0,
    })),
  });
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
router.get("/settings", async (_req, res) => {
  const settings = await getPlatformSettings();

  res.json({
    tenantProtectionFeeRate: settings.tenantProtectionFeeRate,
    tenantProtectionFeeCap: settings.tenantProtectionFeeCap,
  });
});

router.patch("/settings", async (req, res) => {
  const parsed = z
    .object({
      tenantProtectionFeeRate: z.number().min(0).max(100),
      tenantProtectionFeeCap: z.number().min(0),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid settings payload", errors: parsed.error.flatten() });
    return;
  }

  const settings = await PlatformSettingsModel.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        tenantProtectionFeeRate: parsed.data.tenantProtectionFeeRate,
        tenantProtectionFeeCap: parsed.data.tenantProtectionFeeCap,
      },
      $setOnInsert: { key: "default" },
    },
    { upsert: true, new: true }
  ).lean();

  res.json({
    tenantProtectionFeeRate: settings.tenantProtectionFeeRate,
    tenantProtectionFeeCap: settings.tenantProtectionFeeCap,
  });
});

export default router;
