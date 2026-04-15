import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { Types } from "mongoose";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ListingModel } from "../models/Listing.js";
import { ListingInteractionModel } from "../models/ListingInteraction.js";
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

// Nested schemas
const bathroomStructureSchema = z.object({
  count: z.number().int().nonnegative(),
  type: z.enum(["none", "private", "male", "female", "mixed"]).default("private"),
});

const amenitiesSchema = z.object({
  bed: z.boolean().default(false),
  wifi: z.boolean().default(false),
  desk: z.boolean().default(false),
  closet: z.boolean().default(false),
  tv: z.boolean().default(false),
  washingMachine: z.boolean().default(false),
  dryer: z.boolean().default(false),
  dishwasher: z.boolean().default(false),
  kitchenware: z.enum(["no", "shared", "private"]).default("private"),
  heating: z.enum(["central-heating", "electric", "gas", "district-heating", "floor-heating"]).default("central-heating"),
  airConditioning: z.boolean().default(false),
  flooring: z.enum(["laminate", "carpet", "stone", "wood", "plastic", "other"]).default("laminate"),
  livingRoomFurniture: z.boolean().default(false),
});

const utilitySchema = z.object({
  type: z.string(),
  frequency: z.enum(["monthly", "quarterly", "yearly"]).default("monthly"),
  included: z.boolean().default(false),
  amount: z.number().nonnegative().default(0),
});

const depositSchema = z.object({
  type: z.string(),
  requirement: z.string(),
  amount: z.number().nonnegative(),
});

const optionalServiceSchema = z.object({
  type: z.string(),
  category: z.string(),
  frequency: z.enum(["monthly", "one-time"]).default("monthly"),
  amount: z.number().nonnegative(),
});

const mediaSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["photo", "360", "floor-plan"]).default("photo"),
  order: z.number().default(0),
});

const listingWriteSchema = z.object({
  // Section 1: Property Type & Address
  kind: z.enum(["entire-place", "private-room", "shared-room"]),
  propertyType: z.enum(["house", "apartment", "building"]),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().optional().default("Netherlands"),
  apartmentNumber: z.string().optional(),
  floorNumber: z.string().optional(),
  isGroundFloor: z.boolean().optional().default(false),
  rentalRegistrationNumber: z.string().optional(),

  // Section 1: Rental Dates & Pricing
  availableFrom: z.string().datetime({ offset: true }).or(z.string().date()),
  monthlyRent: z.number().nonnegative(),
  currency: z.enum(["EUR", "USD", "GBP"]).optional().default("EUR"),
  minimumRentalPeriod: z.number().int().min(1),
  maximumRentalPeriod: z.number().int().optional(),

  // Section 2: Space
  propertySize: z.number().positive(),
  suitablePeopleCount: z.number().int().positive().optional().default(1),
  spaceDescription: z.string().min(1).max(2000),
  bedroomsCount: z.number().int().nonnegative(),
  bedroomFurnished: z.boolean().optional().default(false),
  lockOnBedroom: z.boolean().optional().default(false),

  // Section 3: Areas
  kitchen: z.enum(["no", "shared", "private"]).optional().default("private"),
  toilet: z.enum(["no", "shared", "private"]).optional().default("private"),
  bathroomStructure: bathroomStructureSchema.optional(),
  livingRoom: z.enum(["no", "shared", "private"]).optional().default("private"),
  balconyTerrace: z.enum(["no", "shared", "private"]).optional().default("no"),
  garden: z.enum(["no", "shared", "private"]).optional().default("no"),
  basement: z.enum(["no", "shared", "private"]).optional().default("no"),
  parking: z.enum(["no", "shared", "private"]).optional().default("no"),
  wheelchairAccessible: z.boolean().optional().default(false),
  elevator: z.boolean().optional().default(false),
  allergyFriendly: z.boolean().optional().default(false),

  // Section 4: Amenities
  amenities: amenitiesSchema.optional(),

  // Section 5: Rental Conditions & Costs
  rentCalculation: z.enum(["daily", "half-monthly", "monthly"]).optional().default("monthly"),
  cancellationPolicy: z.enum(["strict", "flexible"]).optional().default("flexible"),
  utilities: z.array(utilitySchema).optional().default([]),
  deposits: z.array(depositSchema).optional().default([]),
  optionalServices: z.array(optionalServiceSchema).optional().default([]),

  // Section 6: Tenant Preferences & Rules
  preferredGender: z.enum(["male", "female", "no-preference"]).optional().default("no-preference"),
  minimumAgePreference: z.number().int().optional(),
  maximumAgePreference: z.number().int().optional(),
  preferredTenantType: z.enum(["any", "students", "working"]).optional().default("any"),
  couplesAllowed: z.boolean().optional().default(true),
  registrationPossible: z.boolean().optional().default(false),
  petsPolicy: z.enum(["no", "yes", "negotiable"]).optional().default("negotiable"),
  musicPolicy: z.enum(["no", "yes", "negotiable"]).optional().default("negotiable"),
  smokingPolicy: z.enum(["no", "yes", "negotiable", "outside-only"]).optional().default("no"),
  requireProofOfIdentity: z.boolean().optional().default(false),
  requireProofOfOccupation: z.boolean().optional().default(false),
  requireProofOfIncome: z.boolean().optional().default(false),

  // Section 7: Media & Permissions
  media: z.array(mediaSchema).optional().default([]),
  agreedToTerms: z.string().or(z.date()).optional(),
  houseRules: z.array(z.string()).optional().default([]),

  // Metadata
  title: z.string().min(1),
  status: listingStatusSchema.optional().default("draft"),
});

const listingUpdateSchema = listingWriteSchema.partial();
const listingQuerySchema = z.object({
  city: z.string().optional(),
});

function toListingResponse(listing: any, options?: { landlord?: { id: string; name: string; initials: string } }) {
  return {
    id: String(listing._id),
    // Section 1
    kind: listing.kind,
    propertyType: listing.propertyType,
    address: listing.address,
    city: listing.city,
    country: listing.country,
    apartmentNumber: listing.apartmentNumber,
    floorNumber: listing.floorNumber,
    isGroundFloor: listing.isGroundFloor,
    rentalRegistrationNumber: listing.rentalRegistrationNumber,
    availableFrom: listing.availableFrom,
    monthlyRent: listing.monthlyRent,
    currency: listing.currency,
    minimumRentalPeriod: listing.minimumRentalPeriod,
    maximumRentalPeriod: listing.maximumRentalPeriod,
    // Section 2
    propertySize: listing.propertySize,
    suitablePeopleCount: listing.suitablePeopleCount,
    spaceDescription: listing.spaceDescription,
    bedroomsCount: listing.bedroomsCount,
    bedroomFurnished: listing.bedroomFurnished,
    lockOnBedroom: listing.lockOnBedroom,
    // Section 3
    kitchen: listing.kitchen,
    toilet: listing.toilet,
    bathroomStructure: listing.bathroomStructure,
    livingRoom: listing.livingRoom,
    balconyTerrace: listing.balconyTerrace,
    garden: listing.garden,
    basement: listing.basement,
    parking: listing.parking,
    wheelchairAccessible: listing.wheelchairAccessible,
    elevator: listing.elevator,
    allergyFriendly: listing.allergyFriendly,
    // Section 4
    amenities: listing.amenities,
    // Section 5
    rentCalculation: listing.rentCalculation,
    cancellationPolicy: listing.cancellationPolicy,
    utilities: listing.utilities,
    deposits: listing.deposits,
    optionalServices: listing.optionalServices,
    // Section 6
    preferredGender: listing.preferredGender,
    minimumAgePreference: listing.minimumAgePreference,
    maximumAgePreference: listing.maximumAgePreference,
    preferredTenantType: listing.preferredTenantType,
    couplesAllowed: listing.couplesAllowed,
    registrationPossible: listing.registrationPossible,
    petsPolicy: listing.petsPolicy,
    musicPolicy: listing.musicPolicy,
    smokingPolicy: listing.smokingPolicy,
    requireProofOfIdentity: listing.requireProofOfIdentity,
    requireProofOfOccupation: listing.requireProofOfOccupation,
    requireProofOfIncome: listing.requireProofOfIncome,
    // Section 7
    media: listing.media,
    agreedToTerms: listing.agreedToTerms,
    houseRules: listing.houseRules,
    // Metadata
    title: listing.title,
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

router.post("/:id([0-9a-fA-F]{24})/interactions/view", requireAuth, async (req, res) => {
  const listingExists = await ListingModel.exists({ _id: req.params.id, status: "active" });
  if (!listingExists) {
    res.status(404).json({ message: "Active listing not found" });
    return;
  }

  await ListingInteractionModel.updateOne(
    {
      tenantId: new Types.ObjectId(req.user!.sub),
      listingId: new Types.ObjectId(req.params.id),
      interactionType: "view",
    },
    {
      $inc: { count: 1 },
      $set: { lastInteractedAt: new Date() },
      $setOnInsert: {
        tenantId: new Types.ObjectId(req.user!.sub),
        listingId: new Types.ObjectId(req.params.id),
        interactionType: "view",
      },
    },
    { upsert: true }
  );

  res.status(204).send();
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

router.post("/:id([0-9a-fA-F]{24})/duplicate", async (req, res) => {
  const sourceListing = await ListingModel.findOne({ _id: req.params.id, landlordId: req.user!.sub }).lean();
  if (!sourceListing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  const duplicated = await ListingModel.create({
    landlordId: req.user!.sub,
    kind: sourceListing.kind,
    propertyType: sourceListing.propertyType,
    address: sourceListing.address,
    city: sourceListing.city,
    country: sourceListing.country,
    apartmentNumber: sourceListing.apartmentNumber,
    floorNumber: sourceListing.floorNumber,
    isGroundFloor: sourceListing.isGroundFloor,
    rentalRegistrationNumber: sourceListing.rentalRegistrationNumber,
    availableFrom: sourceListing.availableFrom,
    monthlyRent: sourceListing.monthlyRent,
    currency: sourceListing.currency,
    minimumRentalPeriod: sourceListing.minimumRentalPeriod,
    maximumRentalPeriod: sourceListing.maximumRentalPeriod,
    propertySize: sourceListing.propertySize,
    suitablePeopleCount: sourceListing.suitablePeopleCount,
    spaceDescription: sourceListing.spaceDescription,
    bedroomsCount: sourceListing.bedroomsCount,
    bedroomFurnished: sourceListing.bedroomFurnished,
    lockOnBedroom: sourceListing.lockOnBedroom,
    kitchen: sourceListing.kitchen,
    toilet: sourceListing.toilet,
    bathroomStructure: sourceListing.bathroomStructure,
    livingRoom: sourceListing.livingRoom,
    balconyTerrace: sourceListing.balconyTerrace,
    garden: sourceListing.garden,
    basement: sourceListing.basement,
    parking: sourceListing.parking,
    wheelchairAccessible: sourceListing.wheelchairAccessible,
    elevator: sourceListing.elevator,
    allergyFriendly: sourceListing.allergyFriendly,
    amenities: sourceListing.amenities,
    rentCalculation: sourceListing.rentCalculation,
    cancellationPolicy: sourceListing.cancellationPolicy,
    utilities: sourceListing.utilities,
    deposits: sourceListing.deposits,
    optionalServices: sourceListing.optionalServices,
    preferredGender: sourceListing.preferredGender,
    minimumAgePreference: sourceListing.minimumAgePreference,
    maximumAgePreference: sourceListing.maximumAgePreference,
    preferredTenantType: sourceListing.preferredTenantType,
    couplesAllowed: sourceListing.couplesAllowed,
    registrationPossible: sourceListing.registrationPossible,
    petsPolicy: sourceListing.petsPolicy,
    musicPolicy: sourceListing.musicPolicy,
    smokingPolicy: sourceListing.smokingPolicy,
    requireProofOfIdentity: sourceListing.requireProofOfIdentity,
    requireProofOfOccupation: sourceListing.requireProofOfOccupation,
    requireProofOfIncome: sourceListing.requireProofOfIncome,
    media: sourceListing.media,
    houseRules: sourceListing.houseRules,
    title: `Copy of ${sourceListing.title}`,
    status: "draft",
    views: 0,
    inquiries: 0,
    version: sourceListing.version,
    agreedToTerms: null,
  });

  res.status(201).json({ listing: toListingResponse(duplicated.toObject()) });
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
    kind: input.kind,
    propertyType: input.propertyType,
    address: input.address,
    city: input.city,
    country: input.country,
    apartmentNumber: input.apartmentNumber,
    floorNumber: input.floorNumber,
    isGroundFloor: input.isGroundFloor,
    rentalRegistrationNumber: input.rentalRegistrationNumber,
    availableFrom: new Date(input.availableFrom),
    monthlyRent: input.monthlyRent,
    currency: input.currency,
    minimumRentalPeriod: input.minimumRentalPeriod,
    maximumRentalPeriod: input.maximumRentalPeriod,
    propertySize: input.propertySize,
    suitablePeopleCount: input.suitablePeopleCount,
    spaceDescription: input.spaceDescription,
    bedroomsCount: input.bedroomsCount,
    bedroomFurnished: input.bedroomFurnished,
    lockOnBedroom: input.lockOnBedroom,
    kitchen: input.kitchen,
    toilet: input.toilet,
    bathroomStructure: input.bathroomStructure || { count: 1, type: "private" },
    livingRoom: input.livingRoom,
    balconyTerrace: input.balconyTerrace,
    garden: input.garden,
    basement: input.basement,
    parking: input.parking,
    wheelchairAccessible: input.wheelchairAccessible,
    elevator: input.elevator,
    allergyFriendly: input.allergyFriendly,
    amenities: input.amenities || {},
    rentCalculation: input.rentCalculation,
    cancellationPolicy: input.cancellationPolicy,
    utilities: input.utilities,
    deposits: input.deposits,
    optionalServices: input.optionalServices,
    preferredGender: input.preferredGender,
    minimumAgePreference: input.minimumAgePreference,
    maximumAgePreference: input.maximumAgePreference,
    preferredTenantType: input.preferredTenantType,
    couplesAllowed: input.couplesAllowed,
    registrationPossible: input.registrationPossible,
    petsPolicy: input.petsPolicy,
    musicPolicy: input.musicPolicy,
    smokingPolicy: input.smokingPolicy,
    requireProofOfIdentity: input.requireProofOfIdentity,
    requireProofOfOccupation: input.requireProofOfOccupation,
    requireProofOfIncome: input.requireProofOfIncome,
    media: input.media,
    agreedToTerms: input.agreedToTerms ? new Date(input.agreedToTerms) : null,
    houseRules: input.houseRules,
    title: input.title,
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

  // Section 1
  if (updates.kind !== undefined) listing.kind = updates.kind;
  if (updates.propertyType !== undefined) listing.propertyType = updates.propertyType;
  if (updates.address !== undefined) listing.address = updates.address;
  if (updates.city !== undefined) listing.city = updates.city;
  if (updates.country !== undefined) listing.country = updates.country;
  if (updates.apartmentNumber !== undefined) listing.apartmentNumber = updates.apartmentNumber;
  if (updates.floorNumber !== undefined) listing.floorNumber = updates.floorNumber;
  if (updates.isGroundFloor !== undefined) listing.isGroundFloor = updates.isGroundFloor;
  if (updates.rentalRegistrationNumber !== undefined) listing.rentalRegistrationNumber = updates.rentalRegistrationNumber;
  if (updates.availableFrom !== undefined) listing.availableFrom = new Date(updates.availableFrom);
  if (updates.monthlyRent !== undefined) listing.monthlyRent = updates.monthlyRent;
  if (updates.currency !== undefined) listing.currency = updates.currency;
  if (updates.minimumRentalPeriod !== undefined) listing.minimumRentalPeriod = updates.minimumRentalPeriod;
  if (updates.maximumRentalPeriod !== undefined) listing.maximumRentalPeriod = updates.maximumRentalPeriod;
  
  // Section 2
  if (updates.propertySize !== undefined) listing.propertySize = updates.propertySize;
  if (updates.suitablePeopleCount !== undefined) listing.suitablePeopleCount = updates.suitablePeopleCount;
  if (updates.spaceDescription !== undefined) listing.spaceDescription = updates.spaceDescription;
  if (updates.bedroomsCount !== undefined) listing.bedroomsCount = updates.bedroomsCount;
  if (updates.bedroomFurnished !== undefined) listing.bedroomFurnished = updates.bedroomFurnished;
  if (updates.lockOnBedroom !== undefined) listing.lockOnBedroom = updates.lockOnBedroom;
  
  // Section 3
  if (updates.kitchen !== undefined) listing.kitchen = updates.kitchen;
  if (updates.toilet !== undefined) listing.toilet = updates.toilet;
  if (updates.bathroomStructure !== undefined) listing.bathroomStructure = updates.bathroomStructure;
  if (updates.livingRoom !== undefined) listing.livingRoom = updates.livingRoom;
  if (updates.balconyTerrace !== undefined) listing.balconyTerrace = updates.balconyTerrace;
  if (updates.garden !== undefined) listing.garden = updates.garden;
  if (updates.basement !== undefined) listing.basement = updates.basement;
  if (updates.parking !== undefined) listing.parking = updates.parking;
  if (updates.wheelchairAccessible !== undefined) listing.wheelchairAccessible = updates.wheelchairAccessible;
  if (updates.elevator !== undefined) listing.elevator = updates.elevator;
  if (updates.allergyFriendly !== undefined) listing.allergyFriendly = updates.allergyFriendly;
  
  // Section 4
  if (updates.amenities !== undefined) listing.amenities = updates.amenities;
  
  // Section 5
  if (updates.rentCalculation !== undefined) listing.rentCalculation = updates.rentCalculation;
  if (updates.cancellationPolicy !== undefined) listing.cancellationPolicy = updates.cancellationPolicy;
  if (updates.utilities !== undefined) {
    (listing as any).utilities = updates.utilities;
  }
  if (updates.deposits !== undefined) {
    (listing as any).deposits = updates.deposits;
  }
  if (updates.optionalServices !== undefined) {
    (listing as any).optionalServices = updates.optionalServices;
  }
  
  // Section 6
  if (updates.preferredGender !== undefined) listing.preferredGender = updates.preferredGender;
  if (updates.minimumAgePreference !== undefined) listing.minimumAgePreference = updates.minimumAgePreference;
  if (updates.maximumAgePreference !== undefined) listing.maximumAgePreference = updates.maximumAgePreference;
  if (updates.preferredTenantType !== undefined) listing.preferredTenantType = updates.preferredTenantType;
  if (updates.couplesAllowed !== undefined) listing.couplesAllowed = updates.couplesAllowed;
  if (updates.registrationPossible !== undefined) listing.registrationPossible = updates.registrationPossible;
  if (updates.petsPolicy !== undefined) listing.petsPolicy = updates.petsPolicy;
  if (updates.musicPolicy !== undefined) listing.musicPolicy = updates.musicPolicy;
  if (updates.smokingPolicy !== undefined) listing.smokingPolicy = updates.smokingPolicy;
  if (updates.requireProofOfIdentity !== undefined) listing.requireProofOfIdentity = updates.requireProofOfIdentity;
  if (updates.requireProofOfOccupation !== undefined) listing.requireProofOfOccupation = updates.requireProofOfOccupation;
  if (updates.requireProofOfIncome !== undefined) listing.requireProofOfIncome = updates.requireProofOfIncome;
  
  // Section 7
  if (updates.media !== undefined) {
    (listing as any).media = updates.media;
  }
  if (updates.agreedToTerms !== undefined) listing.agreedToTerms = updates.agreedToTerms ? new Date(updates.agreedToTerms) : null;
  if (updates.houseRules !== undefined) listing.houseRules = updates.houseRules;
  
  // Metadata
  if (updates.title !== undefined) listing.title = updates.title;
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
