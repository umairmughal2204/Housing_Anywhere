import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { Send, Search, MapPin, Wifi, X as XIcon } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { useAuth } from "../contexts/auth-context";
import { useConversation } from "../hooks/use-conversation";
import { API_BASE } from "../config";

interface ConversationItem {
  id: string;
  listingId: string;
  listing: { title: string; address: string; city: string; image: string; monthlyRent: number };
  otherUser: { id: string; name: string; initials: string };
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
}

const AVATAR_COLORS = ["#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#FF9800"];
function avatarColor(s: string) { return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length]; }

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

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function formatMsgDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

//  Conversation Chat Panel 
interface ChatPanelProps {
  conversation: ConversationItem;
  onClose: () => void;
}

function ChatPanel({ conversation, onClose }: ChatPanelProps) {
  const { user } = useAuth();
  const token = localStorage.getItem("authToken");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const { messages, isConnected, isLoadingHistory, hasMoreMessages, sendMessage, loadMoreMessages, otherUserTyping, emitTyping, emitStopTyping } =
    useConversation({ conversationId: conversation.id, token });

  useEffect(() => {
    if (messages.length === 0) return;
    if (isFirstLoad.current) { messagesEndRef.current?.scrollIntoView(); isFirstLoad.current = false; }
    else {
      const c = messagesContainerRef.current;
      if (c && c.scrollHeight - c.scrollTop - c.clientHeight < 120) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const body = inputText.trim();
    if (!body || isSending) return;
    setIsSending(true); setSendError("");
    try { await sendMessage(body); setInputText(""); emitStopTyping(); }
    catch (err) { setSendError(err instanceof Error ? err.message : "Failed to send"); }
    finally { setIsSending(false); }
  }, [inputText, isSending, sendMessage, emitStopTyping]);

  // Group messages by date
  const grouped: { date: string; msgs: typeof messages }[] = [];
  for (const msg of messages) {
    const label = formatMsgDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === label) last.msgs.push(msg);
    else grouped.push({ date: label, msgs: [msg] });
  }

  const myId = user?.id;
  const myRole = user?.role;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="p-[16px] border-b border-[rgba(0,0,0,0.08)] bg-white flex items-center gap-[12px]">
        <div className="w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[14px] font-bold"
          style={{ backgroundColor: avatarColor(conversation.otherUser.initials) }}>
          {conversation.otherUser.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#1A1A1A] text-[15px] font-bold truncate">{conversation.otherUser.name}</p>
          <div className="flex items-center gap-[4px] text-[12px] text-[#6B6B6B]">
            <MapPin className="w-[11px] h-[11px]" />
            <span className="truncate">{conversation.listing.title}</span>
          </div>
        </div>
        <div className={`flex items-center gap-[5px] text-[11px] font-medium px-[8px] py-[3px] rounded-full ${isConnected ? "bg-green-50 text-green-700" : "bg-[#F7F7F9] text-[#6B6B6B]"}`}>
          <Wifi className="w-[10px] h-[10px]" />
          {isConnected ? "Live" : "Connecting"}
        </div>
        <Link to={`/property/${conversation.listingId}`} className="text-[12px] font-semibold text-brand-primary hover:underline hidden sm:block">
          View listing
        </Link>
        <button onClick={onClose} className="p-[4px] text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
          <XIcon className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-[20px] bg-neutral-light-gray">
        {hasMoreMessages && (
          <button onClick={() => void loadMoreMessages()} disabled={isLoadingHistory}
            className="block mx-auto mb-[12px] text-[12px] text-brand-primary font-semibold hover:underline">
            {isLoadingHistory ? "Loading..." : "Load earlier messages"}
          </button>
        )}
        {isLoadingHistory && messages.length === 0 && (
          <p className="text-[#6B6B6B] text-[13px] text-center">Loading messages...</p>
        )}
        {grouped.length === 0 && !isLoadingHistory && (
          <div className="h-full flex items-center justify-center">
            <p className="text-[#6B6B6B] text-[13px]">No messages yet. Start the conversation!</p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date}>
            <div className="flex items-center gap-[10px] my-[14px]">
              <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
              <span className="text-[11px] text-[#6B6B6B] font-medium px-[6px]">{group.date}</span>
              <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
            </div>
            {group.msgs.map((msg, i) => {
              const isMe = (Boolean(myId) && msg.senderId === myId) || (Boolean(myRole) && msg.senderRole === myRole);
              const prevMsg = i > 0 ? group.msgs[i - 1] : null;
              const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
              return (
                <div key={msg.id} className={`flex items-end gap-[8px] mb-[6px] ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="w-[28px] flex-shrink-0">
                      {showAvatar && (
                        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: avatarColor(conversation.otherUser.initials) }}>
                          {conversation.otherUser.initials}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`px-[14px] py-[10px] text-[14px] leading-[1.6] ${
                      isMe ? "bg-brand-primary text-white rounded-[14px_14px_4px_14px]" : "bg-white text-[#1A1A1A] rounded-[14px_14px_14px_4px] border border-[rgba(0,0,0,0.06)]"
                    }`}>
                      {msg.body}
                    </div>
                    <span className="text-[10px] text-[#9B9B9B] mt-[3px] px-[2px]">
                      {formatMsgTime(msg.createdAt)}
                      {isMe && msg.readAt && <span className="ml-[4px] text-brand-primary">Read</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {otherUserTyping && (
          <div className="flex items-end gap-[8px]">
            <div className="w-[28px]" />
            <div className="bg-white rounded-[14px_14px_14px_4px] px-[14px] py-[10px] border border-[rgba(0,0,0,0.06)]">
              <div className="flex gap-[3px] items-center h-[14px]">
                <div className="w-[6px] h-[6px] rounded-full bg-[#9B9B9B] animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-[6px] h-[6px] rounded-full bg-[#9B9B9B] animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-[6px] h-[6px] rounded-full bg-[#9B9B9B] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-[16px] bg-white border-t border-[rgba(0,0,0,0.08)]">
        <div className="flex items-end gap-[10px] bg-neutral-light-gray px-[14px] py-[10px] border-2 border-transparent focus-within:border-brand-primary transition-colors">
          <textarea
            value={inputText}
            onChange={(e) => { setInputText(e.target.value); emitTyping(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
            onBlur={emitStopTyping}
            placeholder="Type a reply (Enter to send)"
            rows={2}
            className="flex-1 bg-transparent text-[14px] text-[#1A1A1A] placeholder:text-[#9B9B9B] resize-none outline-none leading-[1.6]"
          />
          <button
            onClick={() => void handleSend()}
            disabled={!inputText.trim() || isSending}
            className={`flex items-center gap-[6px] px-[16px] py-[9px] text-[13px] font-semibold rounded-[8px] transition-colors flex-shrink-0 ${
              inputText.trim() && !isSending ? "bg-brand-primary text-white hover:bg-brand-primary-dark" : "bg-[#EDEDED] text-[#9B9B9B] cursor-not-allowed"
            }`}
          >
            <Send className="w-[14px] h-[14px]" />
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
        {sendError && <p className="text-brand-primary text-[12px] mt-[6px]">{sendError}</p>}
      </div>
    </div>
  );
}

//  Main page 
export function LandlordInbox() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const load = async () => {
      if (!token) { setError("Please log in."); setIsLoading(false); return; }
      try {
        const res = await fetch(`${API_BASE}/api/conversations`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { const d = (await res.json()) as { message?: string }; throw new Error(d.message ?? "Failed"); }
        const data = (await res.json()) as { conversations: ConversationItem[] };
        setConversations(data.conversations);
        if (data.conversations.length > 0) setSelectedId(data.conversations[0].id);
      } catch (err) { setError(err instanceof Error ? err.message : "Failed to load"); }
      finally { setIsLoading(false); }
    };
    void load();
  }, [token]);

  const filtered = conversations.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.otherUser.name.toLowerCase().includes(q) || c.listing.title.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);
  });

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <LandlordPortalLayout>
      <div className="h-[calc(100vh-73px)] flex bg-white">
        {/* Sidebar */}
        <div className="w-[380px] border-r border-[rgba(0,0,0,0.08)] flex flex-col flex-shrink-0">
          <div className="p-[20px] border-b border-[rgba(0,0,0,0.08)] bg-white">
            <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-[14px]">Inbox</h1>
            <div className="relative">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#6B6B6B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-[34px] pr-[12px] py-[9px] bg-[#F7F7F9] text-[13px] text-[#1A1A1A] placeholder:text-[#9B9B9B] border-2 border-transparent focus:border-brand-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="text-[#6B6B6B] text-[13px] p-[20px]">Loading...</p>}
            {!isLoading && error && <p className="text-brand-primary text-[13px] p-[20px]">{error}</p>}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="p-[40px] text-center">
                <p className="text-[#6B6B6B] text-[13px]">{searchQuery ? "No conversations match your search." : "No conversations yet."}</p>
              </div>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full p-[16px] border-b border-[rgba(0,0,0,0.06)] text-left transition-all ${
                  selectedId === c.id ? "bg-white shadow-[inset_4px_0_0_0_var(--color-brand-primary)]" : "bg-[#F7F7F9] hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-[10px]">
                  <div className="w-[38px] h-[38px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[13px] font-bold"
                    style={{ backgroundColor: avatarColor(c.otherUser.initials) }}>
                    {c.otherUser.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-[2px]">
                      <span className="text-[14px] font-bold text-[#1A1A1A] truncate">{c.otherUser.name}</span>
                      <div className="flex items-center gap-[6px] flex-shrink-0 ml-[6px]">
                        {c.unread > 0 && (
                          <span className="px-[6px] py-[1px] text-[10px] font-bold bg-brand-primary text-white rounded-full">{c.unread}</span>
                        )}
                        <span className="text-[11px] text-[#9B9B9B]">{timeAgo(c.lastMessageAt)}</span>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#6B6B6B] truncate mb-[2px]">{c.listing.title}</p>
                    <p className={`text-[12px] truncate ${c.unread > 0 ? "text-[#1A1A1A] font-semibold" : "text-[#9B9B9B]"}`}>
                      {c.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main panel */}
        {selectedConversation ? (
          <ChatPanel key={selectedConversation.id} conversation={selectedConversation} onClose={() => setSelectedId(null)} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#F7F7F9]">
            <div className="text-center max-w-[320px]">
              <div className="w-[80px] h-[80px] rounded-full bg-white mx-auto mb-[16px] flex items-center justify-center border border-[rgba(0,0,0,0.08)]">
                <Send className="w-[36px] h-[36px] text-[#D0D0D0]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1A1A1A] mb-[8px]">Select a conversation</h3>
              <p className="text-[14px] text-[#6B6B6B] leading-[1.6]">
                Choose a tenant message from the list to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </LandlordPortalLayout>
  );
}
