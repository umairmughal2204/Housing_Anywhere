import { Link, useParams, useNavigate } from "react-router";
import { Check } from "lucide-react";
import { Header } from "../components/header";

export function ApplicationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Success Content */}
      <div className="max-w-[800px] mx-auto px-[32px] py-[80px]">
        <div className="flex items-start gap-[48px]">
          {/* Left - Success Message */}
          <div className="flex-1">
            <h1 className="text-neutral-black text-[36px] font-bold tracking-[-0.02em] mb-[24px]">
              Your message was sent to Serdal!
            </h1>
            
            <p className="text-neutral-black text-[16px] leading-[1.6] mb-[8px]">
              This is the start of{" "}
              <button className="text-[#0066CC] underline hover:no-underline font-semibold">
                your conversation with Serdal
              </button>
              . Ask any questions you need to feel confident applying to Rue Clément Ader. You can find this conversation on your{" "}
              <button className="text-[#0066CC] underline hover:no-underline font-semibold">
                Messages
              </button>{" "}
              page anytime.
            </p>

            <p className="text-neutral-black text-[16px] leading-[1.6] mb-[32px]">
              Whenever you're ready, you can pick up where you left off and apply later from your conversation with Serdal. Your progress is saved.
            </p>

            <div className="flex items-center gap-[16px]">
              <button
                onClick={() => navigate(`/tenant/inbox/conversation/${id}`)}
                className="bg-brand-primary text-white px-[32px] py-[14px] font-bold hover:bg-brand-primary-dark transition-colors text-[16px]"
              >
                View conversation
              </button>
              <button
                onClick={() => navigate(`/tenant/applications`)}
                className="border-[2px] border-[rgba(0,0,0,0.16)] text-neutral-black px-[24px] py-[14px] font-bold hover:bg-neutral-light-gray transition-colors text-[16px]"
              >
                My applications
              </button>
              <button
                onClick={() => navigate(`/property/${id}/payment`)}
                className="border-[2px] border-neutral-black text-neutral-black px-[32px] py-[14px] font-bold hover:bg-neutral-black hover:text-white transition-colors text-[16px]"
              >
                Continue application
              </button>
            </div>
          </div>

          {/* Right - Success Icon */}
          <div className="relative">
            {/* Background circles */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px]">
              <div className="absolute top-[20px] right-[40px] w-[12px] h-[12px] rounded-full bg-[#B8E6D5] opacity-60"></div>
              <div className="absolute top-[60px] right-[20px] w-[16px] h-[16px] rounded-full bg-[#B8E6D5] opacity-40"></div>
              <div className="absolute top-[100px] right-[60px] w-[8px] h-[8px] rounded-full bg-[#B8E6D5] opacity-50"></div>
              <div className="absolute top-[40px] right-[100px] w-[10px] h-[10px] rounded-full bg-[#B8E6D5] opacity-30"></div>
              <div className="absolute top-[120px] right-[30px] w-[14px] h-[14px] rounded-full bg-[#B8E6D5] opacity-45"></div>
              <div className="absolute top-[80px] right-[80px] w-[6px] h-[6px] rounded-full bg-[#B8E6D5] opacity-60"></div>
            </div>

            {/* Main success circle */}
            <div className="relative w-[160px] h-[160px] bg-gradient-to-br from-[#00D084] to-[#00A86B] rounded-full flex items-center justify-center shadow-lg">
              <div className="w-[140px] h-[140px] bg-[#00BA74] rounded-full flex items-center justify-center">
                <Check className="w-[80px] h-[80px] text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}