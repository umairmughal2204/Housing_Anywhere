import type { Server, Socket } from "socket.io";
import { Types } from "mongoose";
import { verifyAccessToken } from "../utils/jwt.js";
import { ConversationModel } from "../models/Conversation.js";
import { MessageModel } from "../models/Message.js";

interface AuthenticatedSocket extends Socket {
  userId: string;
  userRole: "tenant" | "landlord";
  userEmail: string;
}

export function setupSocketServer(io: Server): void {
  const broadcastPresence = async (conversationId: string): Promise<void> => {
    if (!Types.ObjectId.isValid(conversationId)) return;

    const conversation = await ConversationModel.findById(conversationId)
      .select("tenantId landlordId")
      .lean();
    if (!conversation) return;

    const room = `conversation:${conversationId}`;
    const sockets = await io.in(room).fetchSockets();

    const onlineUserIds = new Set<string>();
    for (const s of sockets) {
      const maybeUserId = (s as unknown as AuthenticatedSocket).userId;
      if (typeof maybeUserId === "string" && maybeUserId.length > 0) {
        onlineUserIds.add(maybeUserId);
      }
    }

    const tenantOnline = onlineUserIds.has(String(conversation.tenantId));
    const landlordOnline = onlineUserIds.has(String(conversation.landlordId));

    io.to(room).emit("presence_update", {
      conversationId,
      tenantOnline,
      landlordOnline,
    });
  };

  // ── JWT authentication middleware ──────────────────────────────
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth as Record<string, unknown>).token as string | undefined;

    if (!token || typeof token !== "string") {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      (socket as AuthenticatedSocket).userId = payload.sub;
      (socket as AuthenticatedSocket).userRole = payload.role;
      (socket as AuthenticatedSocket).userEmail = payload.email;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (rawSocket: Socket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId, userRole } = socket;
    const joinedConversationIds = new Set<string>();

    // ── join_conversation ─────────────────────────────────────────
    // Client emits this after connecting to subscribe to a conversation room
    socket.on("join_conversation", async (conversationId: string, ack?: (res: { ok: boolean; error?: string }) => void) => {
      try {
        if (!Types.ObjectId.isValid(conversationId)) throw new Error("Invalid conversation id");

        const conversation = await ConversationModel.findById(conversationId).lean();
        if (!conversation) throw new Error("Conversation not found");

        const isParticipant =
          String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
        if (!isParticipant) throw new Error("Forbidden");

        await socket.join(`conversation:${conversationId}`);
        joinedConversationIds.add(conversationId);
        void broadcastPresence(conversationId);
        if (typeof ack === "function") ack({ ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to join";
        if (typeof ack === "function") ack({ ok: false, error: msg });
      }
    });

    // ── send_message ──────────────────────────────────────────────
    socket.on(
      "send_message",
      async (
        payload: { conversationId: string; body: string },
        ack?: (res: { ok: boolean; message?: object; error?: string }) => void
      ) => {
        try {
          const { conversationId, body } = payload;

          if (!Types.ObjectId.isValid(conversationId)) throw new Error("Invalid conversation id");
          if (!body || typeof body !== "string" || body.trim().length === 0) throw new Error("Empty message");
          if (body.length > 4000) throw new Error("Message too long");

          const conversation = await ConversationModel.findById(conversationId).lean();
          if (!conversation) throw new Error("Conversation not found");

          const isParticipant =
            String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
          if (!isParticipant) throw new Error("Forbidden");

          // Persist message
          const message = await MessageModel.create({
            conversationId: new Types.ObjectId(conversationId),
            senderId: new Types.ObjectId(userId),
            senderRole: userRole,
            body: body.trim(),
          });

          // Increment unread count for the other party
          const unreadField =
            userRole === "tenant" ? "unreadByLandlord" : "unreadByTenant";

          await ConversationModel.updateOne(
            { _id: conversationId },
            {
              $set: { lastMessage: body.trim(), lastMessageAt: new Date() },
              $inc: { [unreadField]: 1 },
            }
          );

          const outboundMessage = {
            id: String(message._id),
            conversationId,
            senderId: userId,
            senderRole: userRole,
            body: message.body,
            readAt: null,
            createdAt: message.createdAt,
          };

          // Broadcast to ALL participants in the room (including sender for confirmation)
          io.to(`conversation:${conversationId}`).emit("new_message", outboundMessage);

          if (typeof ack === "function") ack({ ok: true, message: outboundMessage });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to send";
          if (typeof ack === "function") ack({ ok: false, error: msg });
        }
      }
    );

    // ── mark_read ─────────────────────────────────────────────────
    socket.on("mark_read", async (conversationId: string) => {
      try {
        if (!Types.ObjectId.isValid(conversationId)) return;

        const conversation = await ConversationModel.findById(conversationId).lean();
        if (!conversation) return;

        const isParticipant =
          String(conversation.tenantId) === userId || String(conversation.landlordId) === userId;
        if (!isParticipant) return;

        const unreadField = userRole === "tenant" ? "unreadByTenant" : "unreadByLandlord";
        await ConversationModel.updateOne({ _id: conversationId }, { $set: { [unreadField]: 0 } });
        await MessageModel.updateMany(
          {
            conversationId: new Types.ObjectId(conversationId),
            senderId: { $ne: new Types.ObjectId(userId) },
            readAt: null,
          },
          { $set: { readAt: new Date() } }
        );

        // Notify the room that messages were read
        io.to(`conversation:${conversationId}`).emit("messages_read", { conversationId, byUserId: userId });
      } catch {
        // Silent — non-critical
      }
    });

    // ── typing indicators ─────────────────────────────────────────
    socket.on("typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing", { userId, conversationId });
    });

    socket.on("stop_typing", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("stop_typing", { userId, conversationId });
    });

    socket.on("disconnect", () => {
      // Rooms are automatically left on disconnect; broadcast updated presence.
      for (const conversationId of joinedConversationIds) {
        void broadcastPresence(conversationId);
      }
    });
  });
}
