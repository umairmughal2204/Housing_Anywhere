import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Search, Star, Archive, Inbox, Mail, Clock, CheckSquare, X as XIcon, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

interface Conversation {
  id: string;
  landlordName: string;
  landlordAvatar?: string;
  propertyAddress: string;
  dateRange: string;
  lastMessage: string;
  timestamp: string;
  isNew: boolean;
  isSystemMessage?: boolean;
  systemTitle?: string;
  systemAction?: string;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    landlordName: "Sendal",
    landlordAvatar: "S",
    propertyAddress: "Rue Clément Ader, Rosny-sous-Bois",
    dateRange: "16 Mar 2026 - 1 Jun 2026",
    lastMessage: "Hi, I have another room is available minimum 5 month stay.",
    timestamp: "today",
    isNew: false,
  },
  {
    id: "2",
    landlordName: "Shou Yi (Emma)",
    propertyAddress: "Rue Louis Lebrun, Sarcelles",
    dateRange: "16 Mar 2026 - 1 Jun 2026",
    lastMessage: "Build trust and show Shou Yi (Emma) you're ready to rent. Getting a Verified ID badge increases your ch...",
    timestamp: "today",
    isNew: false,
    isSystemMessage: true,
    systemTitle: "Verify your ID to stand out",
    systemAction: "Confirm my identity",
  },
];

type FilterType = "active" | "unread" | "pending" | "rented" | "shortlisted" | "expired" | "archived" | "all";

export function TenantInbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("active");

  const filterCounts = {
    active: 6,
    unread: 1,
    pending: 0,
    rented: 0,
    shortlisted: 0,
    expired: 0,
    archived: 0,
    all: 3,
  };

  const filters: { id: FilterType; label: string; icon: any }[] = [
    { id: "active", label: "Active", icon: Inbox },
    { id: "unread", label: "Unread", icon: Mail },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "rented", label: "Rented", icon: CheckSquare },
    { id: "shortlisted", label: "Shortlisted", icon: Star },
    { id: "expired", label: "Expired", icon: XIcon },
    { id: "archived", label: "Archived", icon: Archive },
    { id: "all", label: "All messages", icon: Menu },
  ];

  const getAvatarColor = (name: string) => {
    const colors = [
      "#E91E63", // Pink
      "#9C27B0", // Purple
      "#3F51B5", // Indigo
      "#2196F3", // Blue
      "#009688", // Teal
      "#FF9800", // Orange
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-[1200px] mx-auto px-[32px] py-[40px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-[32px]">
          <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">
            Messages
          </h1>
          
          {/* Search Bar */}
          <div className="relative w-[360px]">
            <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search by keywords"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-[36px] pr-[36px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[4px] outline-none text-[14px] text-[#1A1A1A] placeholder:text-[#6B6B6B] focus:border-[rgba(0,0,0,0.24)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <XIcon className="w-[16px] h-[16px]" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-[32px]">
          {/* Left Sidebar - Filters */}
          <div className="w-[240px] flex-shrink-0">
            <div className="space-y-[4px]">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const count = filterCounts[filter.id];
                const isActive = selectedFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`w-full flex items-center justify-between px-[12px] py-[10px] text-left rounded-[4px] transition-colors ${
                      isActive
                        ? "bg-[#F7F7F9] text-[#1A1A1A]"
                        : "text-[#6B6B6B] hover:bg-[#F7F7F9] hover:text-[#1A1A1A]"
                    }`}
                  >
                    <div className="flex items-center gap-[12px]">
                      <Icon className="w-[16px] h-[16px]" />
                      <span className="text-[15px] font-medium">{filter.label}</span>
                    </div>
                    {count > 0 && (
                      <span
                        className={`min-w-[20px] h-[20px] px-[6px] flex items-center justify-center text-[12px] font-bold rounded-full ${
                          isActive
                            ? "bg-[#1A1A1A] text-white"
                            : "bg-[#E0E0E0] text-[#6B6B6B]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content - Conversations */}
          <div className="flex-1">
            <div className="space-y-[16px]">
              {mockConversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/tenant/inbox/conversation/${conversation.id}`}
                  className="block bg-[#F5F3FF] hover:bg-[#EDE9FE] transition-colors p-[24px] rounded-[4px] border border-[rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-start justify-between mb-[12px]">
                    <div className="flex items-center gap-[12px]">
                      {/* Avatar */}
                      {conversation.landlordAvatar ? (
                        <div
                          className="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-[16px] font-bold"
                          style={{ backgroundColor: getAvatarColor(conversation.landlordName) }}
                        >
                          {conversation.landlordAvatar}
                        </div>
                      ) : (
                        <div className="w-[40px] h-[40px] rounded-full bg-[#6B6B6B] flex items-center justify-center">
                          <span className="text-white text-[14px] font-bold">
                            {conversation.landlordName.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Name and Property */}
                      <div>
                        <h3 className="text-[#1A1A1A] text-[15px] font-bold mb-[2px]">
                          {conversation.landlordName}
                        </h3>
                        <p className="text-[#6B6B6B] text-[13px]">
                          {conversation.propertyAddress} • {conversation.dateRange}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-[12px]">
                      <button className="flex items-center gap-[6px] text-[#6B6B6B] text-[13px] hover:text-[#1A1A1A] transition-colors">
                        <Star className="w-[14px] h-[14px]" />
                        Shortlist
                      </button>
                      <button className="flex items-center gap-[6px] text-[#6B6B6B] text-[13px] hover:text-[#1A1A1A] transition-colors">
                        <Archive className="w-[14px] h-[14px]" />
                        Archive
                      </button>
                    </div>
                  </div>

                  {/* Message Content */}
                  {conversation.isSystemMessage ? (
                    <div className="ml-[52px]">
                      <div className="mb-[8px]">
                        <p className="text-[#1A1A1A] text-[13px] font-semibold mb-[4px]">
                          EasyRent:
                        </p>
                        <p className="text-[#1A1A1A] text-[14px] font-bold mb-[8px]">
                          {conversation.systemTitle}
                        </p>
                        <p className="text-[#6B6B6B] text-[14px] leading-[1.6] mb-[12px]">
                          {conversation.lastMessage}
                        </p>
                        <button className="text-[#FF4B27] text-[13px] font-semibold hover:underline">
                          {conversation.systemAction}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ml-[52px]">
                      <p className="text-[#1A1A1A] text-[14px] leading-[1.6]">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="flex items-center justify-end mt-[12px]">
                    <span className="text-[#6B6B6B] text-[12px]">{conversation.timestamp}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {mockConversations.length === 0 && (
              <div className="text-center py-[80px]">
                <Mail className="w-[64px] h-[64px] text-[#E0E0E0] mx-auto mb-[16px]" />
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[8px]">
                  No messages yet
                </h3>
                <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                  Start conversations with landlords to find your perfect home
                </p>
                <Link
                  to="/s/berlin"
                  className="inline-block px-[24px] py-[12px] bg-[#FF4B27] text-white font-semibold hover:bg-[#E63E1C] transition-colors"
                >
                  Browse Properties
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}