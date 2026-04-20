import { Link, useParams, useNavigate, useSearchParams } from "react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Header } from "../components/header";
import { API_BASE } from "../config";

export function ApplicationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);

  const openConversation = async () => {
    if (isOpeningConversation) {
      return;
    }

    const directConversationId = searchParams.get("conversationId");
    if (directConversationId) {
      navigate(`/tenant/inbox/conversation/${directConversationId}`);
      return;
    }

    if (!id) {
      navigate("/tenant/inbox");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setIsOpeningConversation(true);
    try {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      });

      if (!response.ok) {
        navigate("/tenant/inbox");
        return;
      }

      const payload = (await response.json()) as { conversationId: string };
      navigate(`/tenant/inbox/conversation/${payload.conversationId}`);
    } finally {
      setIsOpeningConversation(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Success Content */}
      <div className="max-w-[980px] mx-auto px-[16px] sm:px-[24px] md:px-[32px] py-[36px] sm:py-[52px] md:py-[80px]">
        <div className="flex flex-col-reverse md:flex-row items-start gap-[28px] md:gap-[48px]">
          {/* Left - Success Message */}
          <div className="flex-1 min-w-0">
            <h1 className="text-neutral-black text-[28px] sm:text-[32px] md:text-[36px] font-bold tracking-[-0.02em] leading-[1.15] mb-[16px] md:mb-[24px]">
              Your message was sent to Serdal!
            </h1>
            
            <p className="text-neutral-black text-[15px] md:text-[16px] leading-[1.6] mb-[8px]">
              This is the start of{" "}
              <button
                type="button"
                onClick={() => void openConversation()}
                className="text-[#0066CC] underline hover:no-underline font-semibold"
              >
                your conversation with Serdal
              </button>
              . Ask any questions you need to feel confident applying to Rue Clément Ader. You can find this conversation on your{" "}
              <button
                type="button"
                onClick={() => navigate("/tenant/inbox")}
                className="text-[#0066CC] underline hover:no-underline font-semibold"
              >
                Messages
              </button>{" "}
              page anytime.
            </p>

            <p className="text-neutral-black text-[15px] md:text-[16px] leading-[1.6] mb-[24px] md:mb-[32px]">
              Whenever you're ready, you can pick up where you left off and apply later from your conversation with Serdal. Your progress is saved.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[12px] md:gap-[16px]">
              <button
                type="button"
                onClick={() => void openConversation()}
                disabled={isOpeningConversation}
                className="w-full rounded-full bg-brand-primary text-white px-[24px] py-[12px] md:py-[14px] font-bold hover:bg-brand-primary-dark transition-colors text-[15px] md:text-[16px] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isOpeningConversation ? "Opening..." : "View conversation"}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/tenant/applications`)}
                className="w-full rounded-full border-[2px] border-[rgba(0,0,0,0.16)] text-neutral-black px-[20px] py-[12px] md:py-[14px] font-bold hover:bg-neutral-light-gray transition-colors text-[15px] md:text-[16px]"
              >
                My applications
              </button>
              <button
                type="button"
                onClick={() => navigate(`/property/${id}/payment`)}
                className="w-full rounded-full border-[2px] border-neutral-black text-neutral-black px-[24px] py-[12px] md:py-[14px] font-bold hover:bg-neutral-black hover:text-white transition-colors text-[15px] md:text-[16px]"
              >
                Continue application
              </button>
            </div>
          </div>

          {/* Right - Success Icon */}
          <div className="relative mx-auto md:mx-0">
            {/* Background circles */}
            <div className="absolute top-0 right-0 w-[160px] h-[160px] sm:w-[200px] sm:h-[200px]">
              <div className="absolute top-[18px] right-[34px] w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] rounded-full bg-[#B8E6D5] opacity-60"></div>
              <div className="absolute top-[52px] right-[16px] w-[12px] h-[12px] sm:top-[60px] sm:right-[20px] sm:w-[16px] sm:h-[16px] rounded-full bg-[#B8E6D5] opacity-40"></div>
              <div className="absolute top-[86px] right-[54px] w-[8px] h-[8px] rounded-full bg-[#B8E6D5] opacity-50"></div>
              <div className="absolute top-[34px] right-[86px] w-[9px] h-[9px] sm:top-[40px] sm:right-[100px] sm:w-[10px] sm:h-[10px] rounded-full bg-[#B8E6D5] opacity-30"></div>
              <div className="absolute top-[104px] right-[24px] w-[12px] h-[12px] sm:top-[120px] sm:right-[30px] sm:w-[14px] sm:h-[14px] rounded-full bg-[#B8E6D5] opacity-45"></div>
              <div className="absolute top-[72px] right-[72px] w-[6px] h-[6px] rounded-full bg-[#B8E6D5] opacity-60"></div>
            </div>

            {/* Main success circle */}
            <div className="relative w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] bg-gradient-to-br from-[#00D084] to-[#00A86B] rounded-full flex items-center justify-center shadow-lg">
              <div className="w-[114px] h-[114px] sm:w-[140px] sm:h-[140px] bg-[#00BA74] rounded-full flex items-center justify-center">
                <Check className="w-[62px] h-[62px] sm:w-[80px] sm:h-[80px] text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}