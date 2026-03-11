import express from "express";
import cors from "cors";
import path from "path";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import landlordRoutes from "./routes/landlord.js";
import listingsRoutes from "./routes/listings.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/landlord", landlordRoutes);
  app.use("/api/listings", listingsRoutes);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  return app;
}
