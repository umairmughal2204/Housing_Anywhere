import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Search, Mail, MapPin, MessageSquare, X as XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { API_BASE } from "../config";

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

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your messages.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const d = (await res.json()) as { message?: string };
          throw new Error(d.message ?? "Failed to load conversations");
        }
        const data = (await res.json()) as { conversations: ConversationItem[] };
        setConversations(data.conversations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load conversations");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.otherUser.name.toLowerCase().includes(q) ||
      c.listing.title.toLowerCase().includes(q) ||
      c.listing.address.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 max-w-[1100px] mx-auto w-full px-[32px] py-[40px]">
        {/* Header row */}
        <div className="flex items-center justify-between mb-[28px]">
          <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">Messages</h1>

          <div className="relative w-[320px]">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search conversations..."
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

        {isLoading && <p className="text-[#6B6B6B] text-[14px]">Loading your conversations...</p>}
        {!isLoading && error && <p className="text-brand-primary text-[14px]">{error}</p>}

        {!isLoading && !error && (
          <div className="space-y-[10px]">
            {filtered.map((c) => (
              <Link
                key={c.id}
                to={`/tenant/inbox/conversation/${c.id}`}
                className="flex items-start gap-[16px] bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors p-[20px] border border-[rgba(0,0,0,0.04)]"
              >
                <div
                  className="w-[44px] h-[44px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[15px] font-bold"
                  style={{ backgroundColor: avatarColor(c.otherUser.initials) }}
                >
                  {c.otherUser.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-[8px] mb-[4px]">
                    <span className="text-[#1A1A1A] text-[15px] font-bold truncate">{c.otherUser.name}</span>
                    <div className="flex items-center gap-[8px] flex-shrink-0">
                      {c.unread > 0 && (
                        <span className="px-[7px] py-[2px] text-[11px] font-bold bg-brand-primary text-white rounded-full">
                          {c.unread}
                        </span>
                      )}
                      <span className="text-[12px] text-[#6B6B6B]">{timeAgo(c.lastMessageAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-[5px] text-[#6B6B6B] text-[13px] mb-[6px]">
                    <MapPin className="w-[12px] h-[12px] flex-shrink-0" />
                    <span className="truncate">
                      {c.listing.title} | {c.listing.address}, {c.listing.city}
                    </span>
                  </div>

                  <p className={`text-[13px] truncate ${c.unread > 0 ? "text-[#1A1A1A] font-semibold" : "text-[#6B6B6B]"}`}>
                    {c.lastMessage || "No messages yet - start the conversation"}
                  </p>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && !searchQuery && (
              <div className="text-center py-[80px]">
                <Mail className="w-[56px] h-[56px] text-[#D0D0D0] mx-auto mb-[14px]" />
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[8px]">No messages yet</h3>
                <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                  Apply for a property and start chatting with landlords.
                </p>
                <Link
                  to="/"
                  className="inline-block px-[24px] py-[11px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors"
                >
                  Browse properties
                </Link>
              </div>
            )}

            {filtered.length === 0 && searchQuery && (
              <div className="text-center py-[60px]">
                <MessageSquare className="w-[48px] h-[48px] text-[#D0D0D0] mx-auto mb-[12px]" />
                <p className="text-[#6B6B6B] text-[14px]">
                  No conversations match &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

