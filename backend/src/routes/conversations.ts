import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { ListingModel } from "../models/Listing.js";
import { UserModel } from "../models/User.js";
import { ConversationModel } from "../models/Conversation.js";
import { MessageModel } from "../models/Message.js";
import { RentalApplicationModel } from "../models/RentalApplication.js";

const router = Router();

// POST /api/conversations — find or create conversation for a listing
router.post("/", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      listingId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
      applicationId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    })
    .refine((value) => Boolean(value.listingId || value.applicationId), {
      message: "listingId or applicationId is required",
    })
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid listingId/applicationId" });
    return;
  }

  const callerId = req.user!.sub;
  const callerRole = req.user!.role;

  // Landlords must provide application context so the tenant can be resolved correctly.
  if (callerRole === "landlord" && !parsed.data.applicationId) {
    res.status(400).json({ message: "Landlords must open conversations from a rental application" });
    return;
  }

  let listingId = parsed.data.listingId;
  let resolvedTenantId: string | null = null;
  let resolvedLandlordId: string | null = null;

  if (!listingId && parsed.data.applicationId) {
    const application = await RentalApplicationModel.findById(parsed.data.applicationId).lean();
    if (!application) {
      res.status(404).json({ message: "Application not found" });
      return;
    }

    // Prevent opening conversations for someone else's application.
    if (String(application.tenantId) !== callerId && String(application.landlordId) !== callerId) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    listingId = String(application.listingId);
    resolvedTenantId = String(application.tenantId);
    resolvedLandlordId = String(application.landlordId);
  }

  if (!listingId) {
    res.status(400).json({ message: "Invalid listingId" });
    return;
  }

  const listing = await ListingModel.findById(listingId).lean();
  if (!listing) {
    res.status(404).json({ message: "Listing not found" });
    return;
  }

  const landlordId = resolvedLandlordId ?? String(listing.landlordId);
  const tenantId = resolvedTenantId ?? callerId;

  // Prevent landlord from messaging themselves
  if (callerRole === "landlord" && landlordId === callerId) {
    res.status(400).json({ message: "You cannot message your own listing" });
    return;
  }

  const conversation = await ConversationModel.findOneAndUpdate(
    {
      tenantId: new Types.ObjectId(tenantId),
      landlordId: new Types.ObjectId(landlordId),
      listingId: new Types.ObjectId(listingId),
    },
    {
      $setOnInsert: {
        tenantId: new Types.ObjectId(tenantId),
        landlordId: new Types.ObjectId(landlordId),
        listingId: new Types.ObjectId(listingId),
      },
    },
    { upsert: true, new: true }
  );

  res.status(200).json({ conversationId: String(conversation._id) });
});

// GET /api/conversations — list conversations for the authenticated user
router.get("/", requireAuth, async (req, res) => {
  const userId = new Types.ObjectId(req.user!.sub);
  const role = req.user!.role;

  const filter = role === "tenant" ? { tenantId: userId } : { landlordId: userId };
  const conversations = await ConversationModel.find(filter).sort({ lastMessageAt: -1 }).lean();

  if (conversations.length === 0) {
    res.json({ conversations: [] });
    return;
  }

  const listingIds = conversations.map((c) => c.listingId);
  const otherUserIds = conversations.map((c) =>
    role === "tenant" ? c.landlordId : c.tenantId
  );

  const [listings, otherUsers] = await Promise.all([
    ListingModel.find({ _id: { $in: listingIds } }).lean(),
    UserModel.find({ _id: { $in: otherUserIds } }).lean(),
  ]);

  const listingMap = new Map(listings.map((l) => [String(l._id), l]));
  const userMap = new Map(otherUsers.map((u) => [String(u._id), u]));

  res.json({
    conversations: conversations.map((c) => {
      const listing = listingMap.get(String(c.listingId));
      const otherId = role === "tenant" ? String(c.landlordId) : String(c.tenantId);
      const other = userMap.get(otherId);
      const unread = role === "tenant" ? c.unreadByTenant : c.unreadByLandlord;

      return {
        id: String(c._id),
        listingId: String(c.listingId),
        listing: {
          title: listing?.title ?? "Listing unavailable",
          address: listing?.address ?? "",
          city: listing?.city ?? "",
          image: listing?.media?.[0]?.url ?? "",
          monthlyRent: listing?.monthlyRent ?? 0,
        },
        otherUser: {
          id: otherId,
          name: other ? `${other.firstName} ${other.lastName}` : "Unknown",
          initials: other
            ? `${other.firstName[0]}${other.lastName[0]}`.toUpperCase()
            : "?",
        },
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unread,
      };
    }),
  });
});

// GET /api/conversations/:id — conversation details
router.get("/:id([0-9a-fA-F]{24})", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const role = req.user!.role;
  const conversationId = req.params.id;

  const conversation = await ConversationModel.findById(conversationId).lean();
  if (!conversation) {
    res.status(404).json({ message: "Conversation not found" });
    return;
  }

  const isParticipant =
    String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
  if (!isParticipant) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const otherId = String(conversation.tenantId) === userId
    ? String(conversation.landlordId)
    : String(conversation.tenantId);

  const [listing, otherUser] = await Promise.all([
    ListingModel.findById(conversation.listingId).lean(),
    UserModel.findById(otherId).lean(),
  ]);

  res.json({
    conversation: {
      id: conversationId,
      listingId: String(conversation.listingId),
      tenantId: String(conversation.tenantId),
      landlordId: String(conversation.landlordId),
      listing: {
        title: listing?.title ?? "Listing unavailable",
        address: listing?.address ?? "",
        city: listing?.city ?? "",
        image: listing?.media?.[0]?.url ?? (listing as any)?.images?.[0] ?? "",
        monthlyRent: listing?.monthlyRent ?? (listing as any)?.price ?? 0,
      },
      otherUser: {
        id: otherId,
        name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : "Unknown",
        initials: otherUser
          ? `${otherUser.firstName[0]}${otherUser.lastName[0]}`.toUpperCase()
          : "?",
      },
      unread: role === "tenant" ? conversation.unreadByTenant : conversation.unreadByLandlord,
    },
  });
});

// GET /api/conversations/:id/messages — paginated message history (cursor-based)
router.get("/:id([0-9a-fA-F]{24})/messages", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const conversationId = req.params.id;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before as string | undefined; // cursor: createdAt ISO string

  const conversation = await ConversationModel.findById(conversationId).lean();
  if (!conversation) {
    res.status(404).json({ message: "Conversation not found" });
    return;
  }

  const isParticipant =
    String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
  if (!isParticipant) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const filter: Record<string, any> = { conversationId: new Types.ObjectId(conversationId) };
  if (before) {
    filter["createdAt"] = { $lt: new Date(before) };
  }

  const messages = await MessageModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Return oldest-first for display
  messages.reverse();

  res.json({
    messages: messages.map((m) => ({
      id: String(m._id),
      conversationId: String(m.conversationId),
      senderId: String(m.senderId),
      senderRole: m.senderRole,
      body: m.body,
      readAt: m.readAt,
      createdAt: m.createdAt,
    })),
    hasMore: messages.length === limit,
  });
});

// POST /api/conversations/:id/messages — send message via REST fallback
router.post("/:id([0-9a-fA-F]{24})/messages", requireAuth, async (req, res) => {
  const parsed = z
    .object({ body: z.string().min(1).max(4000) })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid message body" });
    return;
  }

  const userId = req.user!.sub;
  const userRole = req.user!.role;
  const conversationId = req.params.id;
  const body = parsed.data.body.trim();

  const conversation = await ConversationModel.findById(conversationId).lean();
  if (!conversation) {
    res.status(404).json({ message: "Conversation not found" });
    return;
  }

  const isParticipant =
    String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
  if (!isParticipant) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const message = await MessageModel.create({
    conversationId: new Types.ObjectId(conversationId),
    senderId: new Types.ObjectId(userId),
    senderRole: userRole,
    body,
  });

  const unreadField = userRole === "tenant" ? "unreadByLandlord" : "unreadByTenant";
  await ConversationModel.updateOne(
    { _id: conversationId },
    {
      $set: { lastMessage: body, lastMessageAt: new Date() },
      $inc: { [unreadField]: 1 },
    }
  );

  res.status(201).json({
    message: {
      id: String(message._id),
      conversationId,
      senderId: userId,
      senderRole: userRole,
      body: message.body,
      readAt: message.readAt,
      createdAt: message.createdAt,
    },
  });
});

// PATCH /api/conversations/:id/read — mark messages as read
router.patch("/:id([0-9a-fA-F]{24})/read", requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  const role = req.user!.role;
  const conversationId = req.params.id;

  const conversation = await ConversationModel.findById(conversationId).lean();
  if (!conversation) {
    res.status(404).json({ message: "Conversation not found" });
    return;
  }

  const isParticipant =
    String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
  if (!isParticipant) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const unreadField = role === "tenant" ? "unreadByTenant" : "unreadByLandlord";
  await ConversationModel.updateOne({ _id: conversationId }, { $set: { [unreadField]: 0 } });

  // Mark messages from the other side as read
  await MessageModel.updateMany(
    { conversationId: new Types.ObjectId(conversationId), senderId: { $ne: new Types.ObjectId(userId) }, readAt: null },
    { $set: { readAt: new Date() } }
  );

  res.json({ ok: true });
});

export default router;
