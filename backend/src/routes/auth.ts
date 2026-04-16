import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { Types } from "mongoose";
import { UserModel } from "../models/User.js";
import { PendingSignupModel } from "../models/PendingSignup.js";
import { ListingModel } from "../models/Listing.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";
import { ConversationModel } from "../models/Conversation.js";
import { ListingInteractionModel } from "../models/ListingInteraction.js";
import { signAccessToken } from "../utils/jwt.js";
import { canSendEmails, sendPasswordResetEmail, sendSignupVerificationEmail } from "../utils/mailer.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["tenant", "landlord"]).default("tenant"),
});

const signupConfirmSchema = z.object({
  pendingSignupId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(false),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

const googleClient = env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(env.GOOGLE_CLIENT_ID)
  : null;

const landlordProfileSchema = z.object({
  businessType: z.enum(["individual", "dealer", "agency"]),
  numberOfProperties: z.number().int().nonnegative(),
  countryOfRegistration: z.string().min(1),
  phoneCountryCode: z.string().min(1),
  phoneNumber: z.string().min(1),
  businessName: z.string().optional(),
  licenseNumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
});

const profileUpdateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  cityOfResidence: z.string().optional(),
  nationality: z.string().optional(),
  occupation: z.enum(["student", "working", "other"]).optional(),
  organization: z.string().optional(),
  aboutMe: z.string().optional(),
  languages: z.array(z.string().min(1)).optional(),
});

const contactUpdateSchema = z.object({
  email: z.string().email(),
  phoneCountryCode: z.string().min(1),
  phoneNumber: z.string().min(1),
});

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8),
});

const favoriteListingSchema = z.object({
  listingId: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

const recommendationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).optional().default(6),
});

function getRecencyWeight(date: Date | string | undefined, windowDays = 90) {
  if (!date) {
    return 0.25;
  }

  const time = new Date(date).getTime();
  if (Number.isNaN(time)) {
    return 0.25;
  }

  const ageDays = (Date.now() - time) / (1000 * 60 * 60 * 24);
  return Math.max(0.25, 1 - ageDays / windowDays);
}

function toRecommendedListing(listing: {
  _id: unknown;
  title: string;
  city: string;
  address: string;
  propertySize?: number;
  bedroomsCount?: number;
  monthlyRent?: number;
  availableFrom: Date;
  media?: Array<{ url: string }>;
  images?: string[];
  createdAt: Date;
  utilities?: Array<{ included: boolean }>;
  area?: number;
  bedrooms?: number;
  price?: number;
}) {
  return {
    id: String(listing._id),
    title: listing.title,
    city: listing.city,
    address: listing.address,
    area: listing.propertySize ?? listing.area ?? 0,
    bedrooms: listing.bedroomsCount ?? listing.bedrooms ?? 0,
    monthlyRent: listing.monthlyRent ?? listing.price ?? 0,
    availableFrom: listing.availableFrom,
    images: listing.media?.map(m => m.url) ?? listing.images ?? [],
    createdAt: listing.createdAt,
    utilitiesIncluded: listing.utilities?.some(u => u.included) ?? false,
  };
}

function sortListingsByReferenceOrder<T extends { _id: unknown }>(listings: T[], orderedIds: string[]) {
  const listingById = new Map(listings.map((listing) => [String(listing._id), listing]));
  return orderedIds.map((id) => listingById.get(id)).filter(Boolean) as T[];
}

function hashResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashVerificationCode(code: string) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

function generateVerificationCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function toAuthUser(user: {
  _id: { toString(): string };
  email: string;
  firstName: string;
  lastName: string;
  role: "tenant" | "landlord";
  isLandlord: boolean;
  landlordProfile?: unknown;
  dateOfBirth?: string | null;
  gender?: "male" | "female" | "other" | null;
  cityOfResidence?: string | null;
  nationality?: string | null;
  occupation?: "student" | "working" | "other" | null;
  organization?: string | null;
  aboutMe?: string | null;
  languages?: string[] | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  profilePictureUrl?: string | null;
  passwordHash?: string | null;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
    isLandlord: user.isLandlord,
    landlordProfile: user.landlordProfile,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    cityOfResidence: user.cityOfResidence,
    nationality: user.nationality,
    occupation: user.occupation,
    organization: user.organization,
    aboutMe: user.aboutMe,
    languages: user.languages ?? [],
    phoneCountryCode: user.phoneCountryCode ?? "+1",
    phoneNumber: user.phoneNumber,
    emailVerified: user.emailVerified ?? false,
    phoneVerified: user.phoneVerified ?? false,
    profilePictureUrl: user.profilePictureUrl,
    hasPassword: Boolean(user.passwordHash),
  };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  if (!canSendEmails()) {
    res.status(503).json({ message: "Email service is not configured" });
    return;
  }

  const { email, password, firstName, lastName, role } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const existing = await UserModel.findOne({ email: normalizedEmail });

  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeHash = hashVerificationCode(verificationCode);
  const codeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const passwordHash = await bcrypt.hash(password, 10);

  const pendingSignup = await PendingSignupModel.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $set: {
        email: normalizedEmail,
        firstName,
        lastName,
        role,
        passwordHash,
        verificationCodeHash,
        codeExpiresAt,
        attempts: 0,
      },
    },
    { upsert: true, new: true }
  );

  try {
    await sendSignupVerificationEmail(normalizedEmail, firstName, verificationCode);
  } catch (error) {
    await PendingSignupModel.deleteOne({ _id: pendingSignup._id });
    console.error("[Signup Verification Email Error]", {
      timestamp: new Date().toISOString(),
      email: normalizedEmail,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ message: "Could not send verification email. Please try again." });
    return;
  }

  res.status(201).json({
    pendingSignupId: pendingSignup._id.toString(),
    expiresAt: codeExpiresAt.toISOString(),
    message: "Verification code sent",
  });
});

router.post("/signup/confirm", async (req, res) => {
  const parsed = signupConfirmSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const pendingSignup = await PendingSignupModel.findById(parsed.data.pendingSignupId);
  if (!pendingSignup) {
    res.status(400).json({ message: "Verification code is invalid or has expired" });
    return;
  }

  if (pendingSignup.codeExpiresAt.getTime() < Date.now()) {
    await PendingSignupModel.deleteOne({ _id: pendingSignup._id });
    res.status(400).json({ message: "Verification code is invalid or has expired" });
    return;
  }

  if ((pendingSignup.attempts ?? 0) >= 5) {
    await PendingSignupModel.deleteOne({ _id: pendingSignup._id });
    res.status(429).json({ message: "Too many invalid verification attempts. Please request a new code." });
    return;
  }

  const expectedCodeHash = hashVerificationCode(parsed.data.code);
  if (pendingSignup.verificationCodeHash !== expectedCodeHash) {
    pendingSignup.attempts = (pendingSignup.attempts ?? 0) + 1;
    await pendingSignup.save();
    res.status(400).json({ message: "Verification code is invalid or has expired" });
    return;
  }

  const existingUser = await UserModel.findOne({ email: pendingSignup.email });
  if (existingUser) {
    await PendingSignupModel.deleteOne({ _id: pendingSignup._id });
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await UserModel.create({
    email: pendingSignup.email,
    passwordHash: pendingSignup.passwordHash,
    authProvider: "local",
    firstName: pendingSignup.firstName,
    lastName: pendingSignup.lastName,
    role: pendingSignup.role,
    isLandlord: pendingSignup.role === "landlord",
    emailVerified: true,
  });

  await PendingSignupModel.deleteOne({ _id: pendingSignup._id });

  const token = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.status(201).json({
    token,
    user: toAuthUser(user),
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const { email, password, rememberMe } = parsed.data;
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  if (!user.passwordHash) {
    res.status(401).json({ message: "This account uses Google sign-in" });
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const token = signAccessToken(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    rememberMe ? "10d" : "1d"
  );

  res.json({
    token,
    user: toAuthUser(user),
  });
});

router.post("/forgot-password", async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid email format" });
    return;
  }

  if (!canSendEmails()) {
    res.status(503).json({ message: "Email service is not configured" });
    return;
  }

  const email = parsed.data.email.toLowerCase();
  const user = await UserModel.findOne({ email });

  if (!user) {
    res.status(404).json({ message: "No account found with this email" });
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  user.passwordResetTokenHash = tokenHash;
  user.passwordResetExpiresAt = expiresAt;
  await user.save();

  const resetLink = `${env.PASSWORD_RESET_URL_BASE.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`;

  try {
    await sendPasswordResetEmail(user.email, user.firstName, resetLink);
  } catch (error) {
    console.error("[Forgot Password Email Error]", {
      timestamp: new Date().toISOString(),
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({ message: "Could not send reset email. Please try again." });
    return;
  }

  res.json({ message: "Password reset email sent" });
});

router.post("/reset-password", async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const tokenHash = hashResetToken(parsed.data.token);

  const user = await UserModel.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    res.status(400).json({ message: "Reset token is invalid or has expired" });
    return;
  }

  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
});

router.post("/google", async (req, res) => {
  const parsed = googleAuthSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  if (!googleClient || !env.GOOGLE_CLIENT_ID) {
    res.status(503).json({ message: "Google sign-in is not configured" });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.email_verified) {
      res.status(401).json({ message: "Google account email is not verified" });
      return;
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const fallbackName = (payload.name ?? "").trim();
    const firstName = (payload.given_name ?? fallbackName.split(" ")[0] ?? "User").trim() || "User";
    const lastName = (payload.family_name ?? fallbackName.split(" ").slice(1).join(" ") ?? "").trim() || "Google";

    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({
        email,
        firstName,
        lastName,
        role: "tenant",
        isLandlord: false,
        authProvider: "google",
        googleId,
        emailVerified: true,
        profilePictureUrl: payload.picture,
      });
    } else {
      const updates: Record<string, unknown> = {};
      if (!user.googleId) {
        updates.googleId = googleId;
      }
      if (!user.profilePictureUrl && payload.picture) {
        updates.profilePictureUrl = payload.picture;
      }
      if (!user.emailVerified) {
        updates.emailVerified = true;
      }
      if (Object.keys(updates).length > 0) {
        user = await UserModel.findByIdAndUpdate(user._id, { $set: updates }, { new: true }) ?? user;
      }
    }

    const token = signAccessToken(
      {
        sub: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      parsed.data.rememberMe ? "10d" : "1d"
    );

    res.json({
      token,
      user: toAuthUser(user),
    });
  } catch (error) {
    console.error("[Google Auth Error]", {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(401).json({ message: "Invalid Google credential" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user?.sub).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({
    user: toAuthUser(user),
  });
});

router.post("/register-landlord", requireAuth, async (req, res) => {
  const parsed = landlordProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?.sub,
    {
      $set: {
        role: "landlord",
        isLandlord: true,
        phoneCountryCode: parsed.data.phoneCountryCode,
        phoneNumber: parsed.data.phoneNumber,
        landlordProfile: parsed.data,
      },
    },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const token = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.json({
    token,
    user: toAuthUser(user),
  });
});

router.patch("/me/profile", requireAuth, async (req, res) => {
  const parsed = profileUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?.sub,
    {
      $set: {
        ...parsed.data,
        languages: (parsed.data.languages ?? []).filter((lang) => lang.trim().length > 0),
      },
    },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({ user: toAuthUser(user) });
});

router.patch("/me/contact", requireAuth, async (req, res) => {
  const parsed = contactUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const existing = await UserModel.findOne({
    email: parsed.data.email.toLowerCase(),
    _id: { $ne: req.user?.sub },
  }).lean();

  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user?.sub,
    {
      $set: {
        email: parsed.data.email.toLowerCase(),
        phoneCountryCode: parsed.data.phoneCountryCode,
        phoneNumber: parsed.data.phoneNumber,
        emailVerified: false,
      },
    },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const token = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });

  res.json({
    token,
    user: toAuthUser(user),
  });
});

router.patch("/me/password", requireAuth, async (req, res) => {
  const parsed = passwordUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const user = await UserModel.findById(req.user?.sub);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (user.passwordHash) {
    if (!parsed.data.currentPassword) {
      res.status(400).json({ message: "Current password is required" });
      return;
    }

    const isCurrentPasswordValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

router.get("/me/favorites", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user?.sub).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  const favoriteIds = (user.favoriteListingIds ?? []).map((id) => String(id));
  if (favoriteIds.length === 0) {
    res.json({ listingIds: [], favorites: [] });
    return;
  }

  const listings = await ListingModel.find({
    _id: { $in: favoriteIds },
    status: "active",
  }).lean();
  const byId = new Map(listings.map((l) => [String(l._id), l]));
  const orderedListings = favoriteIds.map((id) => byId.get(id)).filter(Boolean);
  const activeFavoriteIds = orderedListings.map((listing) => String(listing!._id));

  if (activeFavoriteIds.length !== favoriteIds.length) {
    await UserModel.updateOne(
      { _id: req.user!.sub },
      {
        $set: {
          favoriteListingIds: activeFavoriteIds.map((id) => new Types.ObjectId(id)),
        },
      }
    );
  }

  res.json({
    listingIds: activeFavoriteIds,
    favorites: orderedListings.map((listing) => ({
      id: String(listing!._id),
      title: listing!.title,
      city: listing!.city,
      address: listing!.address,
      monthlyRent: listing!.monthlyRent,
      bedrooms: listing!.bedroomsCount,
      area: listing!.propertySize,
      availableFrom: listing!.availableFrom,
      image: listing!.media?.[0]?.url ?? "",
      status: listing!.status,
    })),
  });
});

router.get("/me/recommendations", requireAuth, async (req, res) => {
  const parsed = recommendationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters" });
    return;
  }

  const userId = req.user!.sub;
  const { limit } = parsed.data;

  const [user, activeListings, applications, conversations, interactions] = await Promise.all([
    UserModel.findById(userId).select("favoriteListingIds").lean(),
    ListingModel.find({ status: "active" }).lean(),
    RentalApplicationModel.find({ tenantId: userId }).select("listingId createdAt").lean(),
    ConversationModel.find({ tenantId: userId }).select("listingId createdAt").lean(),
    ListingInteractionModel.find({ tenantId: userId, interactionType: "view" })
      .select("listingId count lastInteractedAt")
      .lean(),
  ]);

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (activeListings.length === 0) {
    res.json({ recommendations: [] });
    return;
  }

  const listingById = new Map(activeListings.map((listing) => [String(listing._id), listing]));
  const maxViews = Math.max(...activeListings.map((listing) => listing.views ?? 0), 1);
  const maxInquiries = Math.max(...activeListings.map((listing) => listing.inquiries ?? 0), 1);

  const scoreByListingId = new Map<string, number>();
  const cityAffinity = new Map<string, number>();
  const typeAffinity = new Map<string, number>();

  const bumpScore = (listingId: string, points: number) => {
    scoreByListingId.set(listingId, (scoreByListingId.get(listingId) ?? 0) + points);
  };

  const bumpAffinity = (listingId: string, points: number) => {
    const listing = listingById.get(listingId);
    if (!listing) {
      return;
    }

    cityAffinity.set(listing.city, (cityAffinity.get(listing.city) ?? 0) + points);
    typeAffinity.set(listing.propertyType, (typeAffinity.get(listing.propertyType) ?? 0) + points);
  };

  for (const listing of activeListings) {
    const listingId = String(listing._id);
    const viewsScore = (listing.views ?? 0) / maxViews;
    const inquiryScore = (listing.inquiries ?? 0) / maxInquiries;
    const freshnessScore = getRecencyWeight(listing.createdAt, 120);
    bumpScore(listingId, viewsScore * 1.2 + inquiryScore * 1.8 + freshnessScore * 0.8);
  }

  const favoriteIds = (user.favoriteListingIds ?? []).map((id) => String(id));
  for (const favoriteId of favoriteIds) {
    const listing = listingById.get(favoriteId);
    if (!listing) {
      continue;
    }

    bumpScore(favoriteId, 4);
    bumpAffinity(favoriteId, 2.5);
  }

  for (const application of applications) {
    const listingId = String(application.listingId);
    if (!listingById.has(listingId)) {
      continue;
    }

    const interactionRecency = getRecencyWeight(application.createdAt, 180);
    bumpScore(listingId, 3 * interactionRecency);
    bumpAffinity(listingId, 1.8 * interactionRecency);
  }

  for (const conversation of conversations) {
    const listingId = String(conversation.listingId);
    if (!listingById.has(listingId)) {
      continue;
    }

    const interactionRecency = getRecencyWeight(conversation.createdAt, 180);
    bumpScore(listingId, 2.2 * interactionRecency);
    bumpAffinity(listingId, 1.3 * interactionRecency);
  }

  for (const interaction of interactions) {
    const listingId = String(interaction.listingId);
    if (!listingById.has(listingId)) {
      continue;
    }

    const interactionRecency = getRecencyWeight(interaction.lastInteractedAt, 90);
    const interactionStrength = Math.min(interaction.count, 10) / 10;
    bumpScore(listingId, 3.6 * interactionRecency + 2 * interactionStrength);
    bumpAffinity(listingId, 2.4 * interactionRecency + 1.2 * interactionStrength);
  }

  for (const listing of activeListings) {
    const listingId = String(listing._id);
    const cityBoost = cityAffinity.get(listing.city) ?? 0;
    const typeBoost = typeAffinity.get(listing.propertyType) ?? 0;
    bumpScore(listingId, cityBoost * 0.8 + typeBoost * 0.65);
  }

  const recommendations = [...activeListings]
    .sort((left, right) => {
      const leftScore = scoreByListingId.get(String(left._id)) ?? 0;
      const rightScore = scoreByListingId.get(String(right._id)) ?? 0;
      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return right.createdAt.getTime() - left.createdAt.getTime();
    })
    .slice(0, limit)
    .map((listing) => toRecommendedListing(listing));

  res.json({ recommendations });
});

router.get("/me/recently-viewed", requireAuth, async (req, res) => {
  const parsed = recommendationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid query parameters" });
    return;
  }

  const interactions = await ListingInteractionModel.find({
    tenantId: req.user!.sub,
    interactionType: "view",
  })
    .sort({ lastInteractedAt: -1 })
    .select("listingId")
    .lean();

  const orderedListingIds = interactions.map((interaction) => String(interaction.listingId));
  if (orderedListingIds.length === 0) {
    res.json({ listings: [] });
    return;
  }

  const listings = await ListingModel.find({
    _id: { $in: orderedListingIds },
    status: "active",
  }).lean();

  const orderedListings = sortListingsByReferenceOrder(listings, orderedListingIds).slice(0, parsed.data.limit);
  res.json({ listings: orderedListings.map((listing) => toRecommendedListing(listing)) });
});

router.post("/me/favorites", requireAuth, async (req, res) => {
  const parsed = favoriteListingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid listingId" });
    return;
  }

  const listing = await ListingModel.findOne({
    _id: parsed.data.listingId,
    status: "active",
  }).lean();
  if (!listing) {
    res.status(404).json({ message: "Active listing not found" });
    return;
  }

  await UserModel.updateOne(
    { _id: req.user!.sub },
    { $addToSet: { favoriteListingIds: new Types.ObjectId(parsed.data.listingId) } }
  );

  res.status(201).json({ ok: true });
});

router.delete("/me/favorites/:listingId([0-9a-fA-F]{24})", requireAuth, async (req, res) => {
  await UserModel.updateOne(
    { _id: req.user!.sub },
    { $pull: { favoriteListingIds: new Types.ObjectId(req.params.listingId) } }
  );

  res.json({ ok: true });
});

router.delete("/me", requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  await ListingModel.deleteMany({ landlordId: userId });
  await RentalApplicationModel.deleteMany({ $or: [{ landlordId: userId }, { tenantId: userId }] });
  const deletedUser = await UserModel.findByIdAndDelete(userId);

  if (!deletedUser) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(204).send();
});

router.post("/me/profile-picture", requireAuth, upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ message: "No image uploaded" });
    return;
  }

  if (!file.mimetype.startsWith("image/")) {
    res.status(400).json({ message: "Only image files are allowed" });
    return;
  }

  const uploadsDir = path.resolve(process.cwd(), "uploads", "profile-pictures");
  await fs.mkdir(uploadsDir, { recursive: true });

  const extension = (file.originalname.split(".").pop() || "jpg").toLowerCase();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const fullPath = path.join(uploadsDir, filename);
  await fs.writeFile(fullPath, file.buffer);

  const profilePictureUrl = `${req.protocol}://${req.get("host")}/uploads/profile-pictures/${filename}`;

  const user = await UserModel.findByIdAndUpdate(
    req.user?.sub,
    {
      $set: {
        profilePictureUrl,
      },
    },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.status(201).json({ user: toAuthUser(user) });
});

export default router;
