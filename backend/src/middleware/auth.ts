import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { UserModel } from "../models/User.js";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.header("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  void (async () => {
    try {
      const user = await UserModel.findById(req.user!.sub).select("isBanned").lean();
      if (user?.isBanned) {
        res.status(403).json({ message: "Your account has been suspended" });
        return;
      }
      next();
    } catch {
      next();
    }
  })();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ message: "Admin access required" });
    return;
  }
  next();
}

export function requireRole(role: "tenant" | "landlord" | "admin") {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    next();
  };
}
