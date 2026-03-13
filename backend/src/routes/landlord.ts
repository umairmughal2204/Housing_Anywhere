import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ListingModel } from "../models/Listing.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("landlord"), async (req, res) => {
  const landlordId = req.user!.sub;

  const [totalProperties, activeListings, pendingApplications] = await Promise.all([
    ListingModel.countDocuments({ landlordId }),
    ListingModel.countDocuments({ landlordId, status: "active" }),
    RentalApplicationModel.countDocuments({ landlordId, status: "pending" }),
  ]);

  // Initial metrics until rentals and payments modules are implemented.
  res.json({
    stats: {
      totalProperties,
      activeListings,
      occupancyRate: 0,
      monthlyRevenue: 0,
      revenueChange: 0,
      unreadMessages: 0,
      pendingApplications,
      upcomingCheckouts: 0,
    },
    recentActivity: [],
    upcomingEvents: [],
    topProperties: [],
  });
});

export default router;
