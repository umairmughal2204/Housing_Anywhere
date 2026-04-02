import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, Send, MapPin, Home, Wifi } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useConversation } from "../hooks/use-conversation";
import { buildOfferMessage, ChatMessageBubble, type OfferActionType, type OfferMessagePayload } from "../components/chat-offer-message";
import { API_BASE } from "../config";

interface ConversationMeta {
  id: string;
  listingId: string;
  tenantId: string;
  landlordId: string;
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
}

const AVATAR_COLORS = ["#E91E63", "#9C27B0", "#3F51B5", "#2196F3", "#009688", "#FF9800"];
function avatarColor(s: string) {
  return AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];
}

function formatMsgTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
function formatMsgDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function TenantConversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const token = localStorage.getItem("authToken");
  const [meta, setMeta] = useState<ConversationMeta | null>(null);
  const [metaError, setMetaError] = useState("");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<{ hasApplied: boolean; applicationId: string | null; status: string | null } | null>(null);
  const [offerActionInProgress, setOfferActionInProgress] = useState<OfferActionType | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);

  const {
    messages,
    isConnected,
    otherUserOnline,
    isLoadingHistory,
    hasMoreMessages,
    sendMessage,
    loadMoreMessages,
    otherUserTyping,
    emitTyping,
    emitStopTyping,
  } = useConversation({ conversationId: id, token, myRole: "tenant" });

  // Load conversation metadata
  useEffect(() => {
    if (!id || !token) return;
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const d = (await res.json()) as { message?: string };
          setMetaError(d.message ?? "Conversation not found");
          return;
        }
        const data = (await res.json()) as { conversation: ConversationMeta };
        setMeta(data.conversation);

        // Check application status for this listing
        const checkRes = await fetch(
          `${API_BASE}/api/rental-applications/tenant/check?listingId=${data.conversation.listingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (checkRes.ok) {
          const checkData = (await checkRes.json()) as { hasApplied: boolean; applicationId: string | null; status: string | null };
          setApplicationStatus(checkData);
        }
      } catch {
        setMetaError("Failed to load conversation");
      }
    };
    void load();
  }, [id, token]);

  // Scroll to bottom when messages first load or new message arrives
  useEffect(() => {
    if (messages.length === 0) return;
    if (isFirstLoad.current) {
      messagesEndRef.current?.scrollIntoView();
      isFirstLoad.current = false;
    } else {
      // Only auto-scroll if near bottom
      const container = messagesContainerRef.current;
      if (container) {
        const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        if (distFromBottom < 120) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const body = inputText.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setSendError("");
    try {
      await sendMessage(body);
      setInputText("");
      emitStopTyping();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, sendMessage, emitStopTyping]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    emitTyping();
  };

  const handleOfferAction = useCallback(
    async (action: OfferActionType, offer: OfferMessagePayload) => {
      if (!meta || !token || offerActionInProgress !== null) {
        return;
      }

      setOfferActionInProgress(action);
      setSendError("");

      try {
        if (action === "pay") {
          await sendMessage(
            buildOfferMessage({
              version: 1,
              kind: "tenant_response",
              listingTitle: offer.listingTitle,
              tenantName: user?.name,
              responseAction: "payment_started",
              note: "Tenant opened the payment page to continue booking.",
            })
          );
          navigate(`/property/${meta.listingId}/payment`);
          return;
        }

        if (action === "decline") {
          await fetch(`${API_BASE}/api/rental-applications/tenant/respond`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ listingId: meta.listingId, decision: "decline" }),
          });

          await sendMessage(
            buildOfferMessage({
              version: 1,
              kind: "tenant_response",
              listingTitle: offer.listingTitle,
              tenantName: user?.name,
              responseAction: "declined",
              note: "Tenant declined the invitation to book.",
            })
          );

          setApplicationStatus((prev) => (prev ? { ...prev, status: "rejected" } : prev));
          return;
        }

        await fetch(`${API_BASE}/api/rental-applications/tenant/respond`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ listingId: meta.listingId, decision: "change_dates" }),
        });

        await sendMessage(
          buildOfferMessage({
            version: 1,
            kind: "tenant_response",
            listingTitle: offer.listingTitle,
            tenantName: user?.name,
            responseAction: "change_dates_requested",
            note: "Tenant requested a date adjustment.",
          })
        );

        setApplicationStatus((prev) => (prev ? { ...prev, status: "pending" } : prev));
      } catch (err) {
        setSendError(err instanceof Error ? err.message : "Failed to process this action");
      } finally {
        setOfferActionInProgress(null);
      }
    },
    [API_BASE, meta, navigate, offerActionInProgress, sendMessage, token, user?.name]
  );

  // Group messages by date
  const grouped: { date: string; msgs: typeof messages }[] = [];
  for (const msg of messages) {
    const label = formatMsgDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === label) last.msgs.push(msg);
    else grouped.push({ date: label, msgs: [msg] });
  }

  const myRole: "tenant" = "tenant";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[14px] flex items-center gap-[16px]">
          <button
            onClick={() => navigate("/tenant/inbox")}
            className="flex items-center gap-[8px] text-[#1A1A1A] hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
            <span className="text-[14px] font-semibold">Inbox</span>
          </button>

          <div className="flex-1" />

          <Link to="/" className="flex items-center gap-[8px]">
            <div className="w-[30px] h-[30px] bg-brand-primary flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[#1A1A1A] text-[18px] font-bold">
              Easy<span className="text-brand-primary">Rent</span>
            </span>
          </Link>

          <div className="flex-1 flex justify-end">
            <div
              className={`flex items-center gap-[6px] text-[12px] font-medium px-[10px] py-[4px] rounded-full ${
                !isConnected
                  ? "bg-[#F7F7F9] text-[#6B6B6B]"
                  : otherUserOnline
                    ? "bg-green-50 text-green-700"
                    : "bg-[#F7F7F9] text-[#6B6B6B]"
              }`}
            >
              <Wifi className="w-[12px] h-[12px]" />
              {!isConnected ? "Connecting" : otherUserOnline ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </header>

      {metaError && (
        <div className="max-w-[900px] mx-auto px-[32px] py-[40px] text-center">
          <p className="text-brand-primary text-[15px]">{metaError}</p>
          <button onClick={() => navigate("/tenant/inbox")} className="mt-[16px] text-[14px] font-semibold text-brand-primary hover:underline">
            Back to inbox
          </button>
        </div>
      )}

      {!metaError && (
        <div className="flex-1 max-w-[1200px] mx-auto w-full px-[32px] py-[28px] flex gap-[28px]">
          {/*  Chat column  */}
          <div className="flex-[2] flex flex-col min-h-0">
            {/* Other user header */}
            {meta && (
              <div className="flex items-center gap-[12px] mb-[16px] p-[16px] bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)]">
                <div
                  className="w-[40px] h-[40px] rounded-full flex-shrink-0 flex items-center justify-center text-white text-[15px] font-bold"
                  style={{ backgroundColor: avatarColor(meta.otherUser.initials) }}
                >
                  {meta.otherUser.initials}
                </div>
                <div>
                  <p className="text-[#1A1A1A] text-[15px] font-bold">{meta.otherUser.name}</p>
                  <p className="text-[#6B6B6B] text-[12px]">Landlord</p>
                </div>
              </div>
            )}

            {/* Load more */}
            {hasMoreMessages && (
              <button
                onClick={() => void loadMoreMessages()}
                disabled={isLoadingHistory}
                className="text-[13px] text-brand-primary font-semibold hover:underline mb-[12px] self-center"
              >
                {isLoadingHistory ? "Loading..." : "Load earlier messages"}
              </button>
            )}
            {isLoadingHistory && messages.length === 0 && (
              <p className="text-[#6B6B6B] text-[13px] text-center mb-[12px]">Loading messages...</p>
            )}

            {/* Messages area */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto bg-white border border-[rgba(0,0,0,0.08)] p-[20px] min-h-[400px] max-h-[560px] space-y-[4px]"
            >
              {grouped.length === 0 && !isLoadingHistory && (
                <div className="h-full flex items-center justify-center">
                  <p className="text-[#6B6B6B] text-[14px]">No messages yet. Say hello!</p>
                </div>
              )}

              {grouped.map((group) => (
                <div key={group.date}>
                  {/* Date divider */}
                  <div className="flex items-center gap-[10px] my-[16px]">
                    <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                    <span className="text-[11px] text-[#6B6B6B] font-medium px-[6px]">{group.date}</span>
                    <div className="flex-1 h-px bg-[rgba(0,0,0,0.08)]" />
                  </div>

                  {group.msgs.map((msg, i) => {
                    const isMe = msg.senderRole === myRole;
                    const prevMsg = i > 0 ? group.msgs[i - 1] : null;
                    const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);

                    return (
                      <div key={msg.id} className={`flex items-end gap-[8px] mb-[6px] ${isMe ? "justify-end" : "justify-start"}`}>
                        {/* Other user avatar placeholder */}
                        {!isMe && (
                          <div className="w-[28px] flex-shrink-0">
                            {showAvatar && meta && (
                              <div
                                className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                style={{ backgroundColor: avatarColor(meta.otherUser.initials) }}
                              >
                                {meta.otherUser.initials}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`max-w-[65%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <ChatMessageBubble
                            message={msg}
                            isMe={isMe}
                            onOfferAction={isMe ? undefined : handleOfferAction}
                            actionInProgress={offerActionInProgress}
                          />
                          <span className="text-[10px] text-[#9B9B9B] mt-[3px] px-[2px]">
                            {formatMsgTime(msg.createdAt)}
                            {isMe && msg.readAt && (
                              <span className="ml-[4px] text-brand-primary">Read</span>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex items-end gap-[8px] mb-[6px]">
                  <div className="w-[28px] flex-shrink-0" />
                  <div className="bg-[#F1F1F1] rounded-[14px_14px_14px_4px] px-[14px] py-[10px]">
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

            {/* Input area */}
            <div className="mt-[12px] border border-[rgba(0,0,0,0.12)] bg-white">
              <textarea
                value={inputText}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onBlur={emitStopTyping}
                placeholder="Write a message (Enter to send, Shift+Enter for new line)"
                rows={3}
                className="w-full px-[16px] pt-[14px] pb-[8px] text-[14px] text-[#1A1A1A] placeholder:text-[#9B9B9B] resize-none outline-none leading-[1.6]"
              />
              <div className="flex items-center justify-between px-[12px] pb-[12px]">
                {sendError && <p className="text-brand-primary text-[12px]">{sendError}</p>}
                {!sendError && <span className="text-[11px] text-[#9B9B9B]">{inputText.length}/4000</span>}
                <button
                  onClick={() => void handleSend()}
                  disabled={!inputText.trim() || isSending}
                  className={`flex items-center gap-[8px] px-[20px] py-[9px] text-[13px] font-semibold transition-colors ${
                    inputText.trim() && !isSending
                      ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                      : "bg-[#EDEDED] text-[#9B9B9B] cursor-not-allowed"
                  }`}
                >
                  <Send className="w-[14px] h-[14px]" />
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/*  Right sidebar  */}
          <div className="w-[280px] flex-shrink-0 space-y-[16px]">
            {meta && (
              <>
                {/* Listing card */}
                <div className="border border-[rgba(0,0,0,0.08)]">
                  <div className="h-[140px] overflow-hidden bg-[#F1F1F1]">
                    <ImageWithFallback
                      src={meta.listing.image}
                      alt={meta.listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-[14px]">
                    <h3 className="text-[#1A1A1A] text-[14px] font-bold mb-[6px] leading-[1.4]">
                      {meta.listing.title}
                    </h3>
                    <div className="flex items-center gap-[4px] text-[#6B6B6B] text-[12px] mb-[4px]">
                      <MapPin className="w-[11px] h-[11px]" />
                      <span>{meta.listing.address}, {meta.listing.city}</span>
                    </div>
                    <div className="flex items-center gap-[4px] text-[#6B6B6B] text-[12px] mb-[12px]">
                      <Home className="w-[11px] h-[11px]" />
                      <span className="font-semibold text-[#1A1A1A]">{meta.listing.monthlyRent.toLocaleString()}</span>
                      <span>/ month</span>
                    </div>
                    <Link
                      to={`/property/${meta.listingId}`}
                      className="block text-center py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[12px] font-semibold hover:bg-[#F7F7F9] transition-colors"
                    >
                      View listing
                    </Link>
                  </div>
                </div>

                {/* Apply CTA */}
                {applicationStatus?.hasApplied ? (
                  <div className="bg-[#F0FDF4] border border-[#86EFAC] p-[14px]">
                    <p className="text-[13px] text-[#166534] font-bold mb-[4px]">
                      Application submitted
                    </p>
                    <p className="text-[12px] text-[#15803D] leading-[1.5]">
                      {applicationStatus.status === "approved"
                        ? "Your application has been approved."
                        : applicationStatus.status === "rejected"
                        ? "Your application was not accepted."
                        : "Your application is under review by the landlord."}
                    </p>
                  </div>
                ) : (
                  <div className="bg-brand-light border border-brand-primary/20 p-[14px]">
                    <p className="text-[13px] text-[#1A1A1A] font-semibold mb-[6px]">Ready to apply?</p>
                    <p className="text-[12px] text-[#6B6B6B] mb-[10px] leading-[1.5]">
                      Submit an application to secure this place.
                    </p>
                    <Link
                      to={`/property/${meta.listingId}/apply`}
                      className="block text-center py-[8px] bg-brand-primary text-white text-[12px] font-semibold hover:bg-brand-primary-dark transition-colors"
                    >
                      Apply to rent
                    </Link>
                  </div>
                )}

                {/* My applications */}
                <Link
                  to="/tenant/applications"
                  className="block text-center py-[9px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[12px] font-semibold hover:bg-[#F7F7F9] transition-colors"
                >
                  View my applications
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
