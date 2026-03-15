import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ListingModel } from "../models/Listing.js";
import { UserModel } from "../models/User.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

const listingStatusSchema = z.enum(["active", "draft", "inactive"]);

const listingWriteSchema = z.object({
  propertyType: z.enum(["apartment", "studio", "house", "room"]),
  title: z.string().min(1),
  description: z.string().min(1).max(2000),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  bedrooms: z.number().int().nonnegative(),
  bathrooms: z.number().int().min(1),
  area: z.number().positive(),
  monthlyRent: z.number().nonnegative(),
  deposit: z.number().nonnegative(),
  availableFrom: z.string().datetime({ offset: true }).or(z.string().date()),
  minStay: z.number().int().min(1),
  utilitiesIncluded: z.boolean().optional().default(false),
  registrationPossible: z.boolean().optional().default(false),
  amenities: z.array(z.string()).optional().default([]),
  houseRules: z.array(z.string()).optional().default([]),
  images: z.array(z.string().min(1)).optional().default([]),
  status: listingStatusSchema.optional().default("draft"),
});

const listingUpdateSchema = listingWriteSchema.partial();
const listingQuerySchema = z.object({
  city: z.string().optional(),
});

function toListingResponse(listing: {
  _id: unknown;
  propertyType: string;
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  deposit: number;
  availableFrom: Date;
  minStay: number;
  utilitiesIncluded: boolean;
  registrationPossible: boolean;
  amenities: string[];
  houseRules: string[];
  images: string[];
  status: "active" | "draft" | "inactive";
  views: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
}, options?: { landlord?: { id: string; name: string; initials: string } }) {
  return {
    id: String(listing._id),
    propertyType: listing.propertyType,
    title: listing.title,
    description: listing.description,
    address: listing.address,
    city: listing.city,
    postalCode: listing.postalCode,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    area: listing.area,
    monthlyRent: listing.price,
    deposit: listing.deposit,
    availableFrom: listing.availableFrom,
    minStay: listing.minStay,
    utilitiesIncluded: listing.utilitiesIncluded,
    registrationPossible: listing.registrationPossible,
    amenities: listing.amenities,
    houseRules: listing.houseRules,
    images: listing.images,
    status: listing.status,
    views: listing.views,
    inquiries: listing.inquiries,
    landlord: options?.landlord,
    createdAt: listing.createdAt,
    updatedAt: listing.updatedAt,
  };
}

router.get("/", async (req, res) => {
  const queryParsed = listingQuerySchema.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ message: "Invalid query parameters" });
    return;
  }

  const { city } = queryParsed.data;
  const filter: Record<string, unknown> = { status: "active" };

  if (city && city.trim().length > 0) {
    filter.city = new RegExp(`^${city.trim()}$`, "i");
  }

  const listings = await ListingModel.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ listings: listings.map((listing) => toListingResponse(listing)) });
});

router.get("/:id([0-9a-fA-F]{24})", async (req, res) => {
  // Avoid caching listing detail responses (especially 410 Gone), so reactivating
  // a listing becomes visible immediately.
  res.set("Cache-Control", "no-store");

  const listing = await ListingModel.findOneAndUpdate(
    { _id: req.params.id, status: "active" },
    { $inc: { views: 1 } },
    { new: true, lean: true }
  );
  if (!listing) {
    const existingListing = await ListingModel.findById(req.params.id).select("status").lean();
    if (existingListing) {
      res.status(410).json({ message: "This listing is no longer available" });
      return;
    }

    res.status(404).json({ message: "Listing not found" });
    return;
  }

  const landlord = await UserModel.findById(listing.landlordId).lean();

  res.json({
    listing: toListingResponse(listing, {
      landlord: landlord
        ? {
            id: String(landlord._id),
            name: `${landlord.firstName} ${landlord.lastName}`,
            initials: `${landlord.firstName[0] ?? ""}${landlord.lastName[0] ?? ""}`.toUpperCase(),
          }
        : undefined,
    }),
  });
});

router.use(requireAuth, requireRole("landlord"));

router.post("/upload-images", upload.array("images", 10), async (req, res) => {
  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    res.status(400).json({ message: "No files uploaded" });
    return;
  }

  const uploadsDir = path.resolve(process.cwd(), "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const savedUrls: string[] = [];

  for (const file of files) {
    if (!file.mimetype.startsWith("image/")) {
      continue;
    }

    const extension = (file.originalname.split(".").pop() || "jpg").toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const fullPath = path.join(uploadsDir, filename);
    await fs.writeFile(fullPath, file.buffer);

    savedUrls.push(`${req.protocol}://${req.get("host")}/uploads/${filename}`);
  }

  if (savedUrls.length === 0) {
    res.status(400).json({ message: "Only image files are allowed" });
    return;
  }

  res.status(201).json({ urls: savedUrls });
});

router.get("/mine", async (req, res) => {
  const listings = await ListingModel.find({ landlordId: req.user!.sub }).sort({ createdAt: -1 }).lean();
  res.json({ listings: listings.map((listing) => toListingResponse(listing)) });
});

router.get("/mine/:id([0-9a-fA-F]{24})", async (req, res) => {
  const listing = await ListingModel.findOne({ _id: req.params.id, landlordId: req.user!.sub }).lean();
  if (!listing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  res.json({ listing: toListingResponse(listing) });
});

router.post("/", async (req, res) => {
  const parsed = listingWriteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const input = parsed.data;
  const listing = await ListingModel.create({
    landlordId: req.user!.sub,
    propertyType: input.propertyType,
    title: input.title,
    description: input.description,
    address: input.address,
    city: input.city,
    postalCode: input.postalCode,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    area: input.area,
    price: input.monthlyRent,
    deposit: input.deposit,
    availableFrom: new Date(input.availableFrom),
    minStay: input.minStay,
    utilitiesIncluded: input.utilitiesIncluded,
    registrationPossible: input.registrationPossible,
    amenities: input.amenities,
    houseRules: input.houseRules,
    images: input.images,
    status: input.status,
  });

  res.status(201).json({ listing: toListingResponse(listing.toObject()) });
});

router.patch("/:id([0-9a-fA-F]{24})", async (req, res) => {
  const parsed = listingUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const updates = parsed.data;

  const listing = await ListingModel.findOne({ _id: req.params.id, landlordId: req.user!.sub });
  if (!listing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  if (updates.propertyType !== undefined) listing.propertyType = updates.propertyType;
  if (updates.title !== undefined) listing.title = updates.title;
  if (updates.description !== undefined) listing.description = updates.description;
  if (updates.address !== undefined) listing.address = updates.address;
  if (updates.city !== undefined) listing.city = updates.city;
  if (updates.postalCode !== undefined) listing.postalCode = updates.postalCode;
  if (updates.bedrooms !== undefined) listing.bedrooms = updates.bedrooms;
  if (updates.bathrooms !== undefined) listing.bathrooms = updates.bathrooms;
  if (updates.area !== undefined) listing.area = updates.area;
  if (updates.monthlyRent !== undefined) listing.price = updates.monthlyRent;
  if (updates.deposit !== undefined) listing.deposit = updates.deposit;
  if (updates.availableFrom !== undefined) listing.availableFrom = new Date(updates.availableFrom);
  if (updates.minStay !== undefined) listing.minStay = updates.minStay;
  if (updates.utilitiesIncluded !== undefined) listing.utilitiesIncluded = updates.utilitiesIncluded;
  if (updates.registrationPossible !== undefined) listing.registrationPossible = updates.registrationPossible;
  if (updates.amenities !== undefined) listing.amenities = updates.amenities;
  if (updates.houseRules !== undefined) listing.houseRules = updates.houseRules;
  if (updates.images !== undefined) listing.images = updates.images;
  if (updates.status !== undefined) listing.status = updates.status;

  await listing.save();

  res.json({ listing: toListingResponse(listing.toObject()) });
});

router.delete("/:id([0-9a-fA-F]{24})", async (req, res) => {
  const deleted = await ListingModel.findOneAndDelete({ _id: req.params.id, landlordId: req.user!.sub });
  if (!deleted) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  res.status(204).send();
});

export default router;
