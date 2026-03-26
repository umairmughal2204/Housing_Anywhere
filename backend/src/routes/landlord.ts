import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { Types } from "mongoose";
import { ConversationModel } from "../models/Conversation.js";
import { ListingModel } from "../models/Listing.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";
import { UserModel } from "../models/User.js";

const router = Router();
const TOP_PROPERTIES_LIMIT = 5;
const RECENT_ACTIVITY_LIMIT = 5;
const TOP_PROPERTIES_LOOKBACK = 10;

function startOfMonth(dateValue: Date) {
  const date = new Date(dateValue);
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatRelativeTime(dateValue: Date) {
  const diffMs = Date.now() - dateValue.getTime();

  if (diffMs < 60_000) return "Just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

router.get("/dashboard", requireAuth, requireRole("landlord"), async (req, res) => {
  const landlordId = req.user!.sub;
  const landlordObjectId = new Types.ObjectId(landlordId);

  const now = new Date();
  const thisMonthStart = startOfMonth(now);

  const [
    unreadAggregation,
    totalProperties,
    activeListings,
    inactiveListings,
    pendingApplications,
    listings,
    approvedListingIds,
    approvedListingIdsLastMonth,
    approvedCounts,
    latestApplications,
    latestConversations,
  ] = await Promise.all([
    ConversationModel.aggregate([
      { $match: { landlordId: landlordObjectId } },
      { $group: { _id: null, total: { $sum: "$unreadByLandlord" } } },
    ]),
    ListingModel.countDocuments({ landlordId }),
    ListingModel.countDocuments({ landlordId, status: "active" }),
    ListingModel.countDocuments({ landlordId, status: "inactive" }),
    RentalApplicationModel.countDocuments({ landlordId, status: "pending" }),
    ListingModel.find({ landlordId })
      .sort({ updatedAt: -1 })
      .limit(TOP_PROPERTIES_LOOKBACK)
      .select({ title: 1, views: 1, inquiries: 1, price: 1, updatedAt: 1 })
      .lean(),
    RentalApplicationModel.distinct("listingId", { landlordId: landlordObjectId, status: "approved" }),
    RentalApplicationModel.distinct("listingId", {
      landlordId: landlordObjectId,
      status: "approved",
      createdAt: { $lt: thisMonthStart },
    }),
    RentalApplicationModel.aggregate([
      { $match: { landlordId: landlordObjectId, status: "approved" } },
      { $group: { _id: "$listingId", count: { $sum: 1 } } },
    ]),
    RentalApplicationModel.find({ landlordId: landlordObjectId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select({ listingId: 1, tenantId: 1, status: 1, createdAt: 1 })
      .lean(),
    ConversationModel.find({ landlordId: landlordObjectId })
      .sort({ lastMessageAt: -1 })
      .limit(5)
      .select({ listingId: 1, tenantId: 1, lastMessage: 1, lastMessageAt: 1 })
      .lean(),
  ]);

  const unreadMessages = unreadAggregation[0]?.total ?? 0;

  const listingMap = new Map(listings.map((item) => [String(item._id), item]));

  const approvedCountsMap = new Map(
    (approvedCounts as Array<{ _id: Types.ObjectId; count: number }>).map((item) => [String(item._id), item.count])
  );

  const approvedListings = approvedListingIds.map((id) => String(id));
  const approvedListingsLastMonth = approvedListingIdsLastMonth.map((id) => String(id));

  const monthlyRevenue = approvedListings.reduce((sum, listingIdValue) => {
    const listing = listingMap.get(listingIdValue);
    return sum + (listing?.monthlyRent ?? 0);
  }, 0);

  const monthlyRevenueLastMonth = approvedListingsLastMonth.reduce((sum, listingIdValue) => {
    const listing = listingMap.get(listingIdValue);
    return sum + (listing?.monthlyRent ?? 0);
  }, 0);

  const occupancyRate = activeListings > 0 ? Math.round((approvedListings.length / activeListings) * 100) : 0;
  const occupancyRateLastMonth =
    activeListings > 0 ? Math.round((approvedListingsLastMonth.length / activeListings) * 100) : 0;

  const occupancyChange = occupancyRate - occupancyRateLastMonth;

  const revenueChange =
    monthlyRevenueLastMonth === 0
      ? monthlyRevenue > 0
        ? 100
        : 0
      : Math.round(((monthlyRevenue - monthlyRevenueLastMonth) / monthlyRevenueLastMonth) * 100);

  const topProperties = listings
    .slice()
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, TOP_PROPERTIES_LIMIT)
    .map((listing, index) => {
      const inquiries = listing.inquiries ?? 0;
      const approvedCount = approvedCountsMap.get(String(listing._id)) ?? 0;
      const bookingRate = inquiries > 0 ? Math.min(100, Math.round((approvedCount / inquiries) * 100)) : 0;

      return {
        id: index + 1,
        title: listing.title,
        views: listing.views ?? 0,
        inquiries,
        bookingRate,
      };
    });

  const tenantIds = Array.from(
    new Set([
      ...latestApplications.map((item) => String(item.tenantId)),
      ...latestConversations.map((item) => String(item.tenantId)),
    ])
  );

  const tenants = await UserModel.find({ _id: { $in: tenantIds } })
    .select({ firstName: 1, lastName: 1 })
    .lean();
  const tenantMap = new Map(tenants.map((t) => [String(t._id), `${t.firstName} ${t.lastName}`.trim()]));

  const mergedActivity = [
    ...latestApplications.map((item) => {
      const listing = listingMap.get(String(item.listingId));
      const tenantName = tenantMap.get(String(item.tenantId));
      const listingTitle = listing?.title ?? "a listing";
      const namePrefix = tenantName ? `${tenantName} submitted` : "New";

      return {
        date: item.createdAt ? new Date(item.createdAt) : new Date(),
        type: "application" as const,
        text: `${namePrefix} a rental application for ${listingTitle}`,
      };
    }),
    ...latestConversations
      .filter((c) => (c.lastMessage ?? "").trim().length > 0)
      .map((c) => {
        const listing = listingMap.get(String(c.listingId));
        const listingTitle = listing?.title ?? "a listing";
        const preview = String(c.lastMessage).trim();
        const clippedPreview = preview.length > 60 ? `${preview.slice(0, 60)}…` : preview;
        return {
          date: c.lastMessageAt ? new Date(c.lastMessageAt) : new Date(),
          type: "message" as const,
          text: `New message about ${listingTitle}: ${clippedPreview}`,
        };
      }),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((item, index) => ({
      id: index + 1,
      type: item.type,
      text: item.text,
      time: formatRelativeTime(item.date),
    }));

  res.json({
    stats: {
      totalProperties,
      activeListings,
      inactiveListings,
      occupancyRate,
      occupancyChange,
      monthlyRevenue,
      revenueChange,
      unreadMessages,
      pendingApplications,
      upcomingCheckouts: 0,
    },
    recentActivity: mergedActivity,
    upcomingEvents: [],
    topProperties,
  });
});

export default router;
