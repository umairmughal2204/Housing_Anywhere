import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { 
  Send, 
  Search,
  Filter,
  Star,
  Archive,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Paperclip,
  Image as ImageIcon,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { useState } from "react";

type MessageStatus = "new" | "active" | "archived";
type MessagePriority = "high" | "normal" | "low";

interface Message {
  id: string;
  senderName: string;
  senderInitials: string;
  subject: string;
  preview: string;
  timestamp: string;
  status: MessageStatus;
  priority: MessagePriority;
  isRead: boolean;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyImage: string;
  messages: Array<{
    id: string;
    from: "tenant" | "landlord";
    content: string;
    time: string;
    date: string;
  }>;
}

const mockMessages: Message[] = [
  {
    id: "msg-1",
    senderName: "Emma Richardson",
    senderInitials: "ER",
    subject: "Inquiry about Modern Studio",
    preview: "Hello, I'm interested in your studio apartment. I'm moving to Berlin next month for work...",
    timestamp: "10 min ago",
    status: "new",
    priority: "high",
    isRead: false,
    propertyTitle: "Modern Studio in Mitte",
    propertyLocation: "Mitte, Berlin",
    propertyPrice: 1650,
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
    messages: [
      {
        id: "1",
        from: "tenant",
        content: "Hello, I'm interested in your studio apartment. I'm moving to Berlin next month for work and need accommodation for at least 6 months. Is the property still available? Also, is registration (Anmeldung) possible?",
        time: "2:45 PM",
        date: "Today"
      }
    ]
  },
  {
    id: "msg-2",
    senderName: "Michael Torres",
    senderInitials: "MT",
    subject: "Re: 2-Bedroom Apartment Viewing",
    preview: "Thank you for the quick response! Wednesday at 3 PM works perfectly for me...",
    timestamp: "2 hours ago",
    status: "active",
    priority: "normal",
    isRead: false,
    propertyTitle: "Spacious 2BR in Kreuzberg",
    propertyLocation: "Kreuzberg, Berlin",
    propertyPrice: 2100,
    propertyImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80",
    messages: [
      {
        id: "1",
        from: "tenant",
        content: "Hi, I'd like to schedule a viewing for the 2-bedroom apartment. Are you available this week?",
        time: "11:30 AM",
        date: "Today"
      },
      {
        id: "2",
        from: "landlord",
        content: "Hello Michael! Yes, I'm available. How about Wednesday at 3 PM or Thursday at 5 PM?",
        time: "12:15 PM",
        date: "Today"
      },
      {
        id: "3",
        from: "tenant",
        content: "Thank you for the quick response! Wednesday at 3 PM works perfectly for me. See you then!",
        time: "1:20 PM",
        date: "Today"
      }
    ]
  },
  {
    id: "msg-3",
    senderName: "Sophie Anderson",
    senderInitials: "SA",
    subject: "Question about utilities",
    preview: "I noticed the listing mentions utilities included. Does this cover internet as well?",
    timestamp: "Yesterday",
    status: "active",
    priority: "normal",
    isRead: true,
    propertyTitle: "Cozy 1BR Apartment",
    propertyLocation: "Prenzlauer Berg, Berlin",
    propertyPrice: 1450,
    propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
    messages: [
      {
        id: "1",
        from: "tenant",
        content: "I noticed the listing mentions utilities included. Does this cover internet as well? Also, what's the internet speed?",
        time: "4:30 PM",
        date: "Yesterday"
      }
    ]
  },
  {
    id: "msg-4",
    senderName: "David Kim",
    senderInitials: "DK",
    subject: "Interested international student",
    preview: "I'm an international student starting my masters program in September. Looking for long-term...",
    timestamp: "2 days ago",
    status: "new",
    priority: "high",
    isRead: false,
    propertyTitle: "Student-Friendly Studio",
    propertyLocation: "Charlottenburg, Berlin",
    propertyPrice: 950,
    propertyImage: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=400&q=80",
    messages: [
      {
        id: "1",
        from: "tenant",
        content: "I'm an international student starting my masters program in September. Looking for long-term accommodation. Is your studio still available? What documents do you need?",
        time: "9:15 AM",
        date: "Mar 8"
      }
    ]
  },
];

export function LandlordInbox() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<MessageStatus | "all">("all");
  const [replyText, setReplyText] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filteredMessages = mockMessages.filter(msg => {
    const matchesSearch = searchQuery === "" || 
      msg.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || msg.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log("Sending:", replyText);
      setReplyText("");
    }
  };

  return (
    <LandlordPortalLayout>
      <div className="h-[calc(100vh-73px)] flex bg-white">
        {/* Sidebar - Message List */}
        <div className="w-[420px] border-r border-[rgba(0,0,0,0.08)] flex flex-col bg-neutral-light-gray">
          {/* Sidebar Header */}
          <div className="p-[24px] bg-white border-b border-[rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-[16px]">
              <h1 className="text-[24px] font-bold text-neutral-black">Inbox</h1>
              <div className="flex items-center gap-[8px]">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-[8px] hover:bg-neutral-light-gray rounded-[8px] transition-colors"
                >
                  <Filter className="w-[20px] h-[20px] text-neutral-gray" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-[14px] top-[50%] -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-[42px] pr-[14px] py-[10px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            {showFilters && (
              <div className="mt-[16px] flex gap-[8px]">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${
                    filterStatus === "all" 
                      ? "bg-brand-primary text-white" 
                      : "bg-white text-neutral-gray hover:bg-neutral-light-gray"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus("new")}
                  className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${
                    filterStatus === "new" 
                      ? "bg-brand-primary text-white" 
                      : "bg-white text-neutral-gray hover:bg-neutral-light-gray"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${
                    filterStatus === "active" 
                      ? "bg-brand-primary text-white" 
                      : "bg-white text-neutral-gray hover:bg-neutral-light-gray"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus("archived")}
                  className={`px-[12px] py-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${
                    filterStatus === "archived" 
                      ? "bg-brand-primary text-white" 
                      : "bg-white text-neutral-gray hover:bg-neutral-light-gray"
                  }`}
                >
                  Archived
                </button>
              </div>
            )}
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="p-[48px] text-center">
                <div className="w-[72px] h-[72px] rounded-full bg-white mx-auto mb-[16px] flex items-center justify-center">
                  <Search className="w-[32px] h-[32px] text-neutral-gray opacity-40" />
                </div>
                <p className="text-neutral-gray text-[14px]">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`w-full p-[20px] border-b border-[rgba(0,0,0,0.06)] text-left transition-all ${
                    selectedMessage?.id === message.id
                      ? "bg-white shadow-[inset_4px_0_0_0_#0891B2]"
                      : "bg-neutral-light-gray hover:bg-white"
                  } ${!message.isRead ? "font-medium" : ""}`}
                >
                  <div className="flex items-start gap-[12px]">
                    {/* Avatar */}
                    <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0 ${
                      message.priority === "high" ? "bg-accent-blue" : "bg-brand-primary"
                    }`}>
                      {message.senderInitials}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-[4px]">
                        <span className="text-[15px] font-bold text-neutral-black truncate">
                          {message.senderName}
                        </span>
                        <span className="text-[12px] text-neutral-gray ml-[8px] flex-shrink-0">
                          {message.timestamp}
                        </span>
                      </div>

                      {/* Subject */}
                      <div className="text-[14px] text-neutral-black mb-[4px] truncate">
                        {message.subject}
                      </div>

                      {/* Preview */}
                      <p className="text-[13px] text-neutral-gray line-clamp-2 mb-[8px]">
                        {message.preview}
                      </p>

                      {/* Property Tag */}
                      <div className="inline-flex items-center gap-[6px] px-[8px] py-[4px] bg-white rounded-[6px] text-[12px] text-neutral-gray border border-[rgba(0,0,0,0.06)]">
                        <MapPin className="w-[12px] h-[12px]" />
                        <span className="truncate max-w-[200px]">{message.propertyTitle}</span>
                      </div>

                      {/* Unread Badge */}
                      {!message.isRead && (
                        <div className="mt-[8px]">
                          <span className="inline-block w-[8px] h-[8px] rounded-full bg-brand-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Content - Conversation */}
        {selectedMessage ? (
          <div className="flex-1 flex flex-col">
            {/* Conversation Header */}
            <div className="p-[16px] border-b border-[rgba(0,0,0,0.08)] bg-white">
              <div className="max-w-[900px] mx-auto">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-[16px] font-bold ${
                      selectedMessage.priority === "high" ? "bg-accent-blue" : "bg-brand-primary"
                    }`}>
                      {selectedMessage.senderInitials}
                    </div>
                    <div>
                      <h2 className="text-[16px] font-bold text-neutral-black mb-[2px]">
                        {selectedMessage.senderName}
                      </h2>
                      <p className="text-[13px] text-neutral-gray">
                        {selectedMessage.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-[4px]">
                    <button className="p-[8px] hover:bg-neutral-light-gray rounded-[8px] transition-colors">
                      <Star className="w-[18px] h-[18px] text-neutral-gray" />
                    </button>
                    <button className="p-[8px] hover:bg-neutral-light-gray rounded-[8px] transition-colors">
                      <Archive className="w-[18px] h-[18px] text-neutral-gray" />
                    </button>
                    <button className="p-[8px] hover:bg-neutral-light-gray rounded-[8px] transition-colors">
                      <Trash2 className="w-[18px] h-[18px] text-neutral-gray" />
                    </button>
                    <button className="p-[8px] hover:bg-neutral-light-gray rounded-[8px] transition-colors">
                      <MoreHorizontal className="w-[18px] h-[18px] text-neutral-gray" />
                    </button>
                  </div>
                </div>

                {/* Property Card */}
                <div className="bg-neutral-light-gray rounded-[8px] p-[12px] border border-[rgba(0,0,0,0.06)]">
                  <div className="flex gap-[12px]">
                    <img
                      src={selectedMessage.propertyImage}
                      alt={selectedMessage.propertyTitle}
                      className="w-[72px] h-[72px] rounded-[8px] object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-[12px]">
                          <h3 className="text-[15px] font-bold text-neutral-black mb-[2px] truncate">
                            {selectedMessage.propertyTitle}
                          </h3>
                          <div className="flex items-center gap-[4px] text-[13px] text-neutral-gray">
                            <MapPin className="w-[14px] h-[14px]" />
                            {selectedMessage.propertyLocation}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[20px] font-bold text-brand-primary leading-[1]">
                            €{selectedMessage.propertyPrice}
                          </div>
                          <div className="text-[11px] text-neutral-gray">per month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-[24px] bg-neutral-light-gray">
              <div className="max-w-[900px] mx-auto space-y-[24px]">
                {selectedMessage.messages.map((msg) => (
                  <div key={msg.id}>
                    {/* Date Divider */}
                    <div className="flex items-center justify-center mb-[16px]">
                      <div className="px-[16px] py-[6px] bg-white rounded-full text-[12px] font-medium text-neutral-gray border border-[rgba(0,0,0,0.06)]">
                        {msg.date}
                      </div>
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex ${msg.from === "landlord" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[65%] ${
                        msg.from === "landlord"
                          ? "bg-brand-primary text-white"
                          : "bg-white text-neutral-black border border-[rgba(0,0,0,0.06)]"
                      } rounded-[16px] px-[20px] py-[16px] shadow-sm`}>
                        <p className="text-[15px] leading-[1.6] mb-[8px]">
                          {msg.content}
                        </p>
                        <div className={`text-[12px] ${
                          msg.from === "landlord" ? "text-white/80" : "text-neutral-gray"
                        }`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reply Box */}
            <div className="p-[24px] bg-white border-t border-[rgba(0,0,0,0.08)]">
              <div className="max-w-[900px] mx-auto">
                <div className="flex items-center gap-[12px] bg-neutral-light-gray rounded-[10px] px-[16px] py-[10px] border-2 border-transparent focus-within:border-brand-primary transition-colors">
                  <div className="flex items-center gap-[8px]">
                    <button className="p-[6px] hover:bg-white rounded-[6px] transition-colors">
                      <Paperclip className="w-[18px] h-[18px] text-neutral-gray" />
                    </button>
                    <button className="p-[6px] hover:bg-white rounded-[6px] transition-colors">
                      <ImageIcon className="w-[18px] h-[18px] text-neutral-gray" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 bg-transparent text-[14px] text-neutral-black placeholder:text-neutral-gray focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && replyText.trim()) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    className="px-[20px] py-[8px] bg-brand-primary text-white text-[14px] font-semibold rounded-[8px] hover:bg-brand-primary-dark disabled:bg-neutral-gray disabled:cursor-not-allowed transition-colors flex items-center gap-[6px] flex-shrink-0"
                  >
                    <Send className="w-[16px] h-[16px]" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-light-gray">
            <div className="text-center max-w-[400px] px-[24px]">
              <div className="w-[140px] h-[140px] rounded-full bg-white mx-auto mb-[24px] flex items-center justify-center border border-[rgba(0,0,0,0.06)]">
                <Send className="w-[64px] h-[64px] text-neutral-gray opacity-30" />
              </div>
              <h3 className="text-[24px] font-bold text-neutral-black mb-[12px]">
                Select a Message
              </h3>
              <p className="text-[15px] text-neutral-gray leading-[1.6]">
                Choose a conversation from your inbox to view messages and respond to tenant inquiries
              </p>
            </div>
          </div>
        )}
      </div>
    </LandlordPortalLayout>
  );
}