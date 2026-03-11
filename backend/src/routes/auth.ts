import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { UserModel } from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

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
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isLandlord: user.isLandlord,
      landlordProfile: user.landlordProfile,
    },
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
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isLandlord: user.isLandlord,
      landlordProfile: user.landlordProfile,
    },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user?.sub).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json({
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isLandlord: user.isLandlord,
      landlordProfile: user.landlordProfile,
    },
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
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
      isLandlord: user.isLandlord,
      landlordProfile: user.landlordProfile,
    },
  });
});

export default router;
