import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Skeleton } from "../components/ui/skeleton";
import {
  Search,
  Mail,
  MapPin,
  MessageSquare,
  X as XIcon,
  Briefcase,
  Clock3,
  CheckSquare,
  Star,
  Archive,
  AlignJustify,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { API_BASE } from "../config";
import { io, type Socket } from "socket.io-client";
import { getConversationPreview, getConversationSearchableText } from "../components/chat-offer-message";

interface ConversationItem {
  id: string;
  listingId: string;
  listing: {
    title: string;
    address: string;
    city: string;
    image: string;
    monthlyRent: number;
  };
  otherUser: {
    id: string;
    name: string;
    initials: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

type TenantMessageFilter =
  | "active"
  | "unread"
  | "read"
  | "pending"
  | "rented"
  | "shortlisted"
  | "expired"
  | "archived"
  | "all";

const AVATAR_COLORS = ["#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#FF9800"];

function avatarColor(initials: string) {
  return AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function TenantInbox() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TenantMessageFilter>("active");
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const joinedRoomsRef = useRef<Set<string>>(new Set());
  const conversationsRef = useRef<ConversationItem[]>([]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to view your messages.");
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(d.message ?? "Failed to load conversations");
        }

        const data = (await res.json()) as { conversations: ConversationItem[] };
        if (!isCancelled) {
          setConversations(data.conversations);
          setError("");
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Failed to load conversations");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    const interval = window.setInterval(() => {
      void load();
    }, 15000);

    const handleWindowFocus = () => {
      void load();
    };

    void load();
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const socket: Socket = io(API_BASE, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsLiveConnected(true);

      for (const c of conversationsRef.current) {
        if (joinedRoomsRef.current.has(c.id)) continue;
        joinedRoomsRef.current.add(c.id);
        socket.emit("join_conversation", c.id);
      }
    });

    socket.on("disconnect", () => setIsLiveConnected(false));

    socket.on(
      "new_message",
      (msg: { conversationId: string; senderRole: "tenant" | "landlord"; body: string; createdAt: string }) => {
        setConversations((prev) => {
          const idx = prev.findIndex((c) => c.id === msg.conversationId);
          if (idx === -1) return prev;
          const existing = prev[idx];

          const isIncoming = msg.senderRole === "landlord";
          const nextItem: ConversationItem = {
            ...existing,
            lastMessage: msg.body,
            lastMessageAt: msg.createdAt,
            unread: isIncoming ? existing.unread + 1 : existing.unread,
          };

          const next = [...prev];
          next[idx] = nextItem;
          return next;
        });
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
      joinedRoomsRef.current = new Set();
      setIsLiveConnected(false);
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    for (const c of conversations) {
      if (joinedRoomsRef.current.has(c.id)) continue;
      joinedRoomsRef.current.add(c.id);
      socket.emit("join_conversation", c.id);
    }
  }, [conversations]);

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.unread > 0 && b.unread === 0) return -1;
    if (a.unread === 0 && b.unread > 0) return 1;
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  const filterBySection = (items: ConversationItem[], filter: TenantMessageFilter) => {
    switch (filter) {
      case "active":
      case "pending":
      case "rented":
      case "shortlisted":
      case "expired":
      case "archived":
      case "all":
        return items;
      case "unread":
        return items.filter((c) => c.unread > 0);
      case "read":
        return items.filter((c) => c.unread === 0);
      default:
        return items;
    }
  };

  const sectionFiltered = filterBySection(sortedConversations, activeFilter);

  const filtered = sectionFiltered.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser.name.toLowerCase().includes(q) ||
      c.listing.title.toLowerCase().includes(q) ||
      c.listing.address.toLowerCase().includes(q) ||
      getConversationSearchableText(c.lastMessage).toLowerCase().includes(q)
    );
  });

  const unreadCount = conversations.reduce((sum, c) => sum + c.unread, 0);
  const unreadThreads = conversations.filter((c) => c.unread > 0).length;

  const sidebarSections: {
    key: TenantMessageFilter;
    label: string;
    icon: typeof Mail;
    count?: number;
  }[] = [
    { key: "active", label: "Active", icon: Briefcase, count: conversations.length },
    { key: "unread", label: "Unread", icon: Mail, count: unreadThreads },
    { key: "read", label: "Read", icon: CheckSquare, count: conversations.length - unreadThreads },
    { key: "pending", label: "Pending", icon: Clock3 },
    { key: "rented", label: "Rented", icon: CheckSquare },
    { key: "shortlisted", label: "Shortlisted", icon: Star },
    { key: "expired", label: "Expired", icon: XIcon },
    { key: "archived", label: "Archived", icon: Archive },
    { key: "all", label: "All messages", icon: AlignJustify, count: conversations.length },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-[1240px] mx-auto w-full px-[32px] py-[40px]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-[28px]">
          <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">Messages</h1>

          <div className="relative w-[320px]">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search by keywords"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[36px] pr-[34px] py-[9px] border border-[rgba(0,0,0,0.12)] outline-none text-[14px] text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:border-[rgba(0,0,0,0.28)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <XIcon className="w-[15px] h-[15px]" />
              </button>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-[20px] items-start">
            <aside className="bg-[#F7F7F8] p-[12px] rounded-[16px] border border-[rgba(0,0,0,0.05)] lg:sticky lg:top-[96px]">
              <div className="space-y-[4px]">
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-[44px] w-full rounded-[8px]" />
                ))}
              </div>
            </aside>
            <div className="space-y-[12px]">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="block bg-[#F7F7F8] p-[20px] rounded-[16px] border border-[rgba(0,0,0,0.04)]">
                  <div className="flex items-start gap-[16px]">
                    <Skeleton className="w-[44px] h-[44px] rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-[10px] mb-[8px]">
                        <Skeleton className="h-[20px] w-[140px]" />
                        <Skeleton className="h-[16px] w-[60px] flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-[5px] mb-[12px]">
                        <Skeleton className="h-[14px] w-[200px]" />
                      </div>
                      <Skeleton className="h-[18px] w-[60%] mb-[12px]" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-[14px] w-[40%]" />
                        <Skeleton className="h-[14px] w-[40px]" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && error && <p className="text-brand-primary text-[14px]">{error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-[20px] items-start">
            <aside className="bg-[#F7F7F8] p-[12px] rounded-[16px] border border-[rgba(0,0,0,0.05)] lg:sticky lg:top-[96px]">
              <nav className="space-y-[4px]">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = section.key === activeFilter;

                  return (
                    <button
                      key={section.key}
                      type="button"
                      onClick={() => setActiveFilter(section.key)}
                      className={`w-full flex items-center justify-between px-[12px] py-[10px] rounded-[8px] text-left transition-colors ${
                        isActive ? "bg-[#E9E9EF] text-[#111827]" : "text-[#4B5563] hover:bg-[#EFEFF2]"
                      }`}
                    >
                      <span className="flex items-center gap-[10px] text-[18px]">
                        <Icon className="w-[18px] h-[18px]" />
                        <span>{section.label}</span>
                      </span>

                      {typeof section.count === "number" && (
                        <span
                          className={`text-[14px] min-w-[24px] h-[24px] rounded-full px-[7px] flex items-center justify-center ${
                            isActive ? "bg-[#111827] text-white" : "bg-[#D9D9D9] text-[#444444]"
                          }`}
                        >
                          {section.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="space-y-[12px]">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/tenant/inbox/conversation/${c.id}`}
                  className="block bg-[#F0EEFB] hover:bg-[#E8E3FA] transition-colors p-[20px] rounded-[16px] border border-[rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start gap-[16px]">
                    <div
                      className="w-[44px] h-[44px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[15px] font-bold"
                      style={{ backgroundColor: avatarColor(c.otherUser.initials) }}
                    >
                      {c.otherUser.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-[10px] mb-[4px]">
                        <span className="text-[#111827] text-[15px] font-bold truncate">{c.otherUser.name}</span>

                        <span className="text-[12px] text-[#6B7280] flex-shrink-0">{timeAgo(c.lastMessageAt)}</span>
                      </div>

                      <div className="flex items-center gap-[5px] text-[#556070] text-[13px] mb-[8px]">
                        <MapPin className="w-[12px] h-[12px] flex-shrink-0" />
                        <span className="truncate">
                          {c.listing.address}, {c.listing.city}
                        </span>
                      </div>

                      <p className={`text-[17px] leading-[1.5] truncate ${c.unread > 0 ? "text-[#101827] font-semibold" : "text-[#4B5563]"}`}>
                        {getConversationPreview(c.lastMessage) || "No messages yet - start the conversation"}
                      </p>

                      <div className="mt-[10px] flex items-center justify-between">
                        <span className="text-[13px] text-[#6B7280] truncate max-w-[70%]">{c.listing.title}</span>

                        {c.unread > 0 ? (
                          <span className="inline-flex items-center gap-[6px] text-[12px] font-semibold text-[#111827]">
                            <span className="w-[7px] h-[7px] rounded-full bg-brand-primary" />
                            {c.unread} unread
                          </span>
                        ) : (
                          <span className="text-[12px] text-[#6B7280]">Read</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {filtered.length === 0 && !searchQuery && activeFilter === "unread" && (
                <div className="text-center py-[60px] bg-[#F7F7F8] rounded-[16px] border border-[rgba(0,0,0,0.06)]">
                  <Mail className="w-[48px] h-[48px] text-[#C5C5CC] mx-auto mb-[12px]" />
                  <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[6px]">No unread messages</h3>
                  <p className="text-[#6B6B6B] text-[14px]">You are all caught up.</p>
                </div>
              )}

              {filtered.length === 0 && !searchQuery && activeFilter === "read" && (
                <div className="text-center py-[60px] bg-[#F7F7F8] rounded-[16px] border border-[rgba(0,0,0,0.06)]">
                  <CheckSquare className="w-[48px] h-[48px] text-[#C5C5CC] mx-auto mb-[12px]" />
                  <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[6px]">No read conversations</h3>
                  <p className="text-[#6B6B6B] text-[14px]">Read conversations will appear here.</p>
                </div>
              )}

              {filtered.length === 0 && !searchQuery && !["unread", "read"].includes(activeFilter) && conversations.length > 0 && (
                <div className="text-center py-[60px] bg-[#F7F7F8] rounded-[16px] border border-[rgba(0,0,0,0.06)]">
                  <MessageSquare className="w-[48px] h-[48px] text-[#C5C5CC] mx-auto mb-[12px]" />
                  <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[6px]">No messages in this section</h3>
                  <p className="text-[#6B6B6B] text-[14px]">Try another filter from the left menu.</p>
                </div>
              )}

              {filtered.length === 0 && !searchQuery && conversations.length === 0 && (
                <div className="text-center py-[80px]">
                  <Mail className="w-[56px] h-[56px] text-[#D0D0D0] mx-auto mb-[14px]" />
                  <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[8px]">No messages yet</h3>
                  <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                    Apply for a property and start chatting with landlords.
                  </p>
                  <Link
                    to="/"
                    className="inline-block px-[24px] py-[11px] rounded-[12px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors"
                  >
                    Browse properties
                  </Link>
                </div>
              )}

              {filtered.length === 0 && searchQuery && (
                <div className="text-center py-[60px] bg-[#F7F7F8] rounded-[16px] border border-[rgba(0,0,0,0.06)]">
                  <MessageSquare className="w-[48px] h-[48px] text-[#D0D0D0] mx-auto mb-[12px]" />
                  <p className="text-[#6B6B6B] text-[14px]">
                    No conversations match &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
              )}

              {unreadCount > 0 && (
                <p className="text-[13px] text-[#4B5563] px-[4px]">
                  You have <span className="font-semibold text-[#111827]">{unreadCount}</span> unread message{unreadCount > 1 ? "s" : ""}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

