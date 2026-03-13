import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { API_BASE } from "../config";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "tenant" | "landlord";
  body: string;
  readAt: string | null;
  createdAt: string;
}

interface UseConversationOptions {
  conversationId: string | undefined;
  token: string | null;
}

interface UseConversationReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoadingHistory: boolean;
  hasMoreMessages: boolean;
  sendMessage: (body: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  otherUserTyping: boolean;
  emitTyping: () => void;
  emitStopTyping: () => void;
}

const SOCKET_URL = API_BASE;

export function useConversation({
  conversationId,
  token,
}: UseConversationOptions): UseConversationReturn {
  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const otherTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load message history via REST ──────────────────────────────
  const markReadViaRest = useCallback(async () => {
    if (!conversationId || !token) return;
    await fetch(`${SOCKET_URL}/api/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
  }, [conversationId, token]);

  const loadHistory = useCallback(
    async (before?: string) => {
      if (!conversationId || !token) return;
      setIsLoadingHistory(true);
      try {
        const url = new URL(`${SOCKET_URL}/api/conversations/${conversationId}/messages`);
        url.searchParams.set("limit", "50");
        if (before) url.searchParams.set("before", before);

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { messages: ChatMessage[]; hasMore: boolean };
        setMessages((prev) => (before ? [...data.messages, ...prev] : data.messages));
        setHasMoreMessages(data.hasMore);
        if (!before) {
          void markReadViaRest();
        }
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [conversationId, token, markReadViaRest]
  );

  const loadMoreMessages = useCallback(async () => {
    if (messages.length === 0) return;
    await loadHistory(messages[0].createdAt);
  }, [messages, loadHistory]);

  // ── Socket.io connection ───────────────────────────────────────
  useEffect(() => {
    if (!token || !conversationId) return;

    // Load REST history first
    void loadHistory();

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      // Join the conversation room
      socket.emit("join_conversation", conversationId, (res: { ok: boolean; error?: string }) => {
        if (!res.ok) console.error("Failed to join room:", res.error);
      });
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("new_message", (msg: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate by id (socket may re-deliver on reconnect in some edge cases)
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("typing", ({ conversationId: cId }: { conversationId: string }) => {
      if (cId !== conversationId) return;
      setOtherUserTyping(true);
      if (otherTypingTimerRef.current) clearTimeout(otherTypingTimerRef.current);
      otherTypingTimerRef.current = setTimeout(() => setOtherUserTyping(false), 3000);
    });

    socket.on("stop_typing", ({ conversationId: cId }: { conversationId: string }) => {
      if (cId !== conversationId) return;
      setOtherUserTyping(false);
    });

    // Mark as read when joining over socket
    socket.emit("mark_read", conversationId);

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setMessages([]);
    };
  }, [conversationId, token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ───────────────────────────────────────────────
  const sendMessage = useCallback(
    async (body: string): Promise<void> => {
      if (!conversationId || !token) {
        throw new Error("Not authenticated");
      }

      const canUseSocket = socketRef.current && socketRef.current.connected;
      if (canUseSocket) {
        await new Promise<void>((resolve, reject) => {
          socketRef.current!.emit(
            "send_message",
            { conversationId, body },
            (res: { ok: boolean; error?: string }) => {
              if (res.ok) resolve();
              else reject(new Error(res.error ?? "Failed to send"));
            }
          );
        });
        return;
      }

      // REST fallback for environments where websocket cannot connect.
      const res = await fetch(`${SOCKET_URL}/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Failed to send");
      }

      const payload = (await res.json()) as { message: ChatMessage };
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.message.id)) return prev;
        return [...prev, payload.message];
      });
    },
    [conversationId, token]
  );

  // ── Typing indicators ──────────────────────────────────────────
  const emitTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("typing", conversationId);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", conversationId);
    }, 2000);
  }, [conversationId]);

  const emitStopTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    socketRef.current.emit("stop_typing", conversationId);
  }, [conversationId]);

  return {
    messages,
    isConnected,
    isLoadingHistory,
    hasMoreMessages,
    sendMessage,
    loadMoreMessages,
    otherUserTyping,
    emitTyping,
    emitStopTyping,
  };
}
