import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { MessageCircle, X, Send, Lock } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { HELP_DATA } from "../pages/help";

export function GlobalChatWidget() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string; timestamp: Date }>>([
    {
      sender: "bot",
      text: "Hello! Welcome to EzzyStay Support. How can I help you today?",
      timestamp: new Date()
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatBotOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatBotOpen]);

  // Hide on help page as it already renders locally
  if (location.pathname === "/help") {
    return null;
  }

  const handleHelpFloatClick = () => {
    if (!isAuthenticated) {
      setIsAuthPromptOpen(true);
    } else {
      setIsChatBotOpen(!isChatBotOpen);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: chatInput,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    const normalizedInput = chatInput.toLowerCase().trim();
    setChatInput("");

    setTimeout(() => {
      let botResponse = "I'm sorry, I couldn't find a direct answer to that. Try asking about things like 'payment security', 'refunds', 'two-factor authentication', 'surveillance cameras', or contact our human support team.";

      let bestMatch: { title: string; description: string; steps?: string[]; extra?: string; } | null = null;
      let highestMatchCount = 0;

      Object.values(HELP_DATA).forEach((categoryData) => {
        categoryData.topics.forEach((topic) => {
          const keywords = `${topic.title} ${topic.description} ${(topic.steps || []).join(" ")}`.toLowerCase();
          const words = normalizedInput.split(/\s+/);
          let matchCount = 0;
          words.forEach((word) => {
            if (word.length > 2 && keywords.includes(word)) {
              matchCount++;
            }
          });
          if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            bestMatch = topic;
          }
        });
      });

      if (bestMatch && highestMatchCount > 0) {
        const matchTopic = bestMatch as { title: string; description: string; steps?: string[]; extra?: string; };
        let textResponse = `${matchTopic.description}`;
        if (matchTopic.steps && matchTopic.steps.length > 0) {
          textResponse += `\n\nHow it works:\n` + matchTopic.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
        }
        if (matchTopic.extra) {
          textResponse += `\n\nNote: ${matchTopic.extra}`;
        }
        botResponse = textResponse;
      }

      setMessages((prev) => [...prev, {
        sender: "bot" as const,
        text: botResponse,
        timestamp: new Date()
      }]);
    }, 600);
  };

  return (
    <>
      {/* Auth Prompt Modal if not logged in */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-[16px] animate-fade-in">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsAuthPromptOpen(false)} />

          {/* Modal Container */}
          <div className="bg-white rounded-[24px] w-full max-w-[380px] p-[32px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[210] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            {/* Circular Lock icon with soft background */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#EFF6FF] flex items-center justify-center mb-[20px]">
              <Lock className="w-[32px] h-[32px] text-[#2563EB]" />
            </div>

            <h3 className="text-[#1F2937] text-[20px] font-bold mb-[8px]">
              Please sign in
            </h3>
            <p className="text-[#6B7280] text-[14px] leading-[1.5] mb-[24px]">
              You need to sign in to access support chat assistance.
            </p>

            <Link
              to="/login"
              onClick={() => setIsAuthPromptOpen(false)}
              className="w-full h-[46px] flex items-center justify-center bg-[#0F2D36] hover:bg-[#081B20] text-white font-bold rounded-full transition-colors mb-[12px] text-[15px]"
            >
              Sign in
            </Link>
            <button
              onClick={() => setIsAuthPromptOpen(false)}
              className="text-[#6B7280] hover:text-[#1F2937] font-semibold text-[14px] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Bot Widget if logged in */}
      {isChatBotOpen && isAuthenticated && (
        <div className="fixed bottom-[90px] right-[24px] z-[100] w-[360px] h-[480px] bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-[#0F2D36] px-[20px] py-[16px] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-[8px]">
              <div className="w-[10px] h-[10px] rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[16px] font-bold">EzzyStay Bot</span>
            </div>
            <button
              onClick={() => setIsChatBotOpen(false)}
              className="w-[28px] h-[28px] hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-white/80 hover:text-white"
              aria-label="Close chat assistant"
            >
              <X className="w-[16px] h-[16px]" />
            </button>
          </div>

          {/* Chat History Messages */}
          <div className="flex-1 overflow-y-auto p-[16px] space-y-[12px] bg-[#F8FAFC]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
              >
                <div
                  className={`px-[14px] py-[10px] rounded-[16px] text-[14px] leading-[1.4] whitespace-pre-line text-left ${msg.sender === "user"
                      ? "bg-[#0F2D36] text-white rounded-tr-none"
                      : "bg-[#E2E8F0] text-[#1F2937] rounded-tl-none"
                    }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#94A3B8] mt-[3px] px-[4px]">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="border-t border-[#E2E8F0] p-[12px] bg-white flex gap-[8px] items-center shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 min-w-0 bg-[#F1F5F9] rounded-full px-[16px] py-[8px] text-[14px] text-[#1F2937] placeholder:text-[#94A3B8] outline-none border border-transparent focus:border-[#0F2D36]/40 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-[36px] h-[36px] bg-[#0F2D36] hover:bg-[#081B20] disabled:bg-[#94A3B8]/40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-[16px] h-[16px]" />
            </button>
          </form>
        </div>
      )}

      {/* Floating help widget bottom right */}
      <button
        onClick={handleHelpFloatClick}
        className="fixed bottom-[24px] right-[24px] bg-white border border-[#E2E8F0] shadow-[0_6px_20px_rgba(0,0,0,0.08)] rounded-full px-[20px] py-[10px] flex items-center gap-[8px] hover:bg-[#F8FAFC] transition-all z-[90] active:scale-95 cursor-pointer"
      >
        <MessageCircle className="w-[18px] h-[18px] text-[#2563EB]" />
        <span className="text-[#1F2937] text-[14px] font-bold">Help</span>
      </button>
    </>
  );
}
