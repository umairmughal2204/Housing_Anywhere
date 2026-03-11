import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { ListingModel } from "../models/Listing.js";
import { signAccessToken } from "../utils/jwt.js";
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const landlordProfileSchema = z.object({
  businessType: z.enum(["individual", "dealer", "agency"]),
  numberOfProperties: z.number().int().nonnegative(),
  phoneNumber: z.string().min(1),
  businessName: z.string().optional(),
  licenseNumber: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
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
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

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
  };
}

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const { email, password, firstName, lastName, role } = parsed.data;
  const existing = await UserModel.findOne({ email: email.toLowerCase() });

  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    email: email.toLowerCase(),
    passwordHash,
    firstName,
    lastName,
    role,
    isLandlord: role === "landlord",
  });

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

  const { email, password } = parsed.data;
  const user = await UserModel.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ message: "Invalid credentials" });
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

  const isCurrentPasswordValid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!isCurrentPasswordValid) {
    res.status(401).json({ message: "Current password is incorrect" });
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  res.json({ message: "Password updated successfully" });
});

router.delete("/me", requireAuth, async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  await ListingModel.deleteMany({ landlordId: userId });
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
