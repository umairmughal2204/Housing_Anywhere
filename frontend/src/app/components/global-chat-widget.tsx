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
      let botResponse = "";

      // Greetings
      if (/^(hello|hi|hey|heyy|greetings|hola|good morning|good afternoon|good evening|hello there|hi there)\b/i.test(normalizedInput)) {
        botResponse = "Hello! 👋 Welcome to EzzyStay Support. How can I help you today? You can ask me about searching for homes, booking process, tenant protection, listing your property, pricing, or contracts!";
      }
      // Gratitude
      else if (/^(thank|thanks|thank you|thx|awesome|great|perfect|cool)\b/i.test(normalizedInput)) {
        botResponse = "You're very welcome! 😊 Feel free to ask if you have any more questions about EzzyStay.";
      }
      // Farewells
      else if (/^(bye|goodbye|cya|see ya|take care)\b/i.test(normalizedInput)) {
        botResponse = "Goodbye! Have a great day and good luck finding or renting your ideal stay! 🏠";
      }
      // Identity
      else if (/\b(who are you|what is ezzystay|what are you)\b/i.test(normalizedInput)) {
        botResponse = "I am the EzzyStay Virtual Support Assistant! EzzyStay is a premier online platform connecting verified landlords and tenants worldwide with secure payments and 24/7 support.";
      }
      // Contact / Human Agent
      else if (/\b(human|agent|person|contact|email|phone|call|talk to someone|support team)\b/i.test(normalizedInput)) {
        botResponse = "Our support team is available 24/7! You can send us a direct message on our Contact page (/contact) or email us anytime at support@ezzystay.com.";
      }
      // Pricing & Fees
      else if (/\b(pricing|price|cost|fee|fees|commission)\b/i.test(normalizedInput)) {
        botResponse = "Creating property listings on EzzyStay is completely free for landlords! Service fees for tenants vary by country. Visit our Pricing page (/pricing) for a detailed breakdown.";
      }
      // Contracts & Agreements
      else if (/\b(contract|contracts|lease|agreement|agreements|document|documents)\b/i.test(normalizedInput)) {
        botResponse = "We provide support for legally compliant rental agreements and digital contracts. Check our Legal Agreements section at /sample-contracts or contact support@ezzystay.com for legal guidance.";
      }
      else {
        // Fuzzy search in HELP_DATA topics
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
        } else {
          botResponse = "I'm here to help! While I didn't find an exact match for that specific phrase, you can ask about topics like 'tenant protection', 'refunds', 'how to list a property', 'pricing', 'contracts', or reach our 24/7 support team directly at support@ezzystay.com.";
        }
      }

      setMessages((prev) => [...prev, {
        sender: "bot" as const,
        text: botResponse,
        timestamp: new Date()
      }]);
    }, 500);
  };

  return (
    <>
      {/* Auth Prompt Modal if not logged in */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-[16px] animate-fade-in backdrop-blur-xs">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsAuthPromptOpen(false)} />

          {/* Modal Container */}
          <div className="bg-white rounded-[24px] w-full max-w-[380px] p-[32px] text-center shadow-[0_20px_50px_rgba(8,145,178,0.18)] z-[210] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200 border border-[rgba(8,145,178,0.14)]">
            {/* Circular Lock icon with soft teal background */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#E0F2FE] flex items-center justify-center mb-[20px] shadow-inner">
              <Lock className="w-[32px] h-[32px] text-[#0891B2]" />
            </div>

            <h3 className="text-[#0F2D36] text-[20px] font-bold mb-[8px]">
              Please sign in
            </h3>
            <p className="text-[#64748B] text-[14px] leading-[1.5] mb-[24px]">
              You need to sign in to your account to access support chat assistance.
            </p>

            <Link
              to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
              onClick={() => setIsAuthPromptOpen(false)}
              className="w-full h-[46px] flex items-center justify-center bg-[#0891B2] hover:bg-[#0E7490] text-white font-bold rounded-full transition-all shadow-[0_4px_12px_rgba(8,145,178,0.2)] mb-[12px] text-[15px] active:scale-[0.98]"
            >
              Sign in
            </Link>
            <button
              onClick={() => setIsAuthPromptOpen(false)}
              className="text-[#64748B] hover:text-[#0F2D36] font-semibold text-[14px] transition-colors cursor-pointer"
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

      {/* Clean & Compact Floating Help Icon */}
      <button
        onClick={handleHelpFloatClick}
        aria-label="Need Help?"
        title="Need Help?"
        className="fixed bottom-[24px] right-[24px] w-[48px] h-[48px] rounded-full bg-[#0891B2] hover:bg-[#0E7490] text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center z-[90] cursor-pointer active:scale-95"
      >
        {isChatBotOpen ? (
          <X className="w-[22px] h-[22px] text-white" />
        ) : (
          <MessageCircle className="w-[22px] h-[22px] text-white" />
        )}
      </button>
    </>
  );
}
