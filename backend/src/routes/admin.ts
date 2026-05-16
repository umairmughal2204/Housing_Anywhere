import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { UserModel } from "../models/User.js";
import { ListingModel } from "../models/Listing.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";

const router = Router();

router.use(requireAuth, requireAdmin);

// ─── STATS ────────────────────────────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  const [totalUsers, totalLandlords, totalTenants, totalListings, totalApplications, paidApplications] =
    await Promise.all([
      UserModel.countDocuments({ role: { $ne: "admin" } }),
      UserModel.countDocuments({ role: "landlord" }),
      UserModel.countDocuments({ role: "tenant" }),
      ListingModel.countDocuments(),
      RentalApplicationModel.countDocuments(),
      RentalApplicationModel.find({ "paymentDetails.isPaid": true }).select("paymentDetails.paidAmount").lean(),
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
  });
});

// ─── USERS ────────────────────────────────────────────────────────────────────
router.get("/users", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const role = typeof req.query.role === "string" ? req.query.role : "";

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

  const [users, total] = await Promise.all([
    UserModel.find(filter)
      .select("firstName lastName email role isBanned isLandlord createdAt profilePictureUrl")
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

  const filter: Record<string, unknown> = {};
  if (["pending", "approved", "rejected", "paid"].includes(status)) {
    filter.status = status;
  }

  const [applications, total] = await Promise.all([
    RentalApplicationModel.find(filter)
      .select("status paymentDetails.isPaid paymentDetails.paidAmount paymentDetails.currency createdAt tenantId landlordId listingId")
      .populate("tenantId", "firstName lastName email")
      .populate("landlordId", "firstName lastName email")
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
        paidAmount: a.paymentDetails?.paidAmount ?? 0,
        currency: a.paymentDetails?.currency ?? "EUR",
        createdAt: a.createdAt,
        tenant: tenant ? { id: tenant._id?.toString(), name: `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim(), email: tenant.email } : null,
        landlord: landlord ? { id: landlord._id?.toString(), name: `${landlord.firstName ?? ""} ${landlord.lastName ?? ""}`.trim(), email: landlord.email } : null,
        listing: listing ? { id: listing._id?.toString(), title: listing.title, city: listing.city } : null,
      };
    }),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

export default router;
