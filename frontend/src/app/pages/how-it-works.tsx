import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { HandCoins, HandMetal, MessageCircle, MousePointer2, PencilLine, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useAuth } from "../contexts/auth-context";
import effortlessListingImage from "../../assets/Effortless-Listing.webp";
import remoteTenantMatchingImage from "../../assets/Remote-tenant-matching.webp";
import securePaymentsImage from "../../assets/Secure-Payments.webp";
import getSupportImage from "../../assets/Get-Support.webp";
import mariaSuccessStoryImage from "../../assets/Maria_Success_story.webp";
import tenantProtectionImage from "../../assets/Tenant-Protection.webp";
import onlineViewingImage from "../../assets/100--online.webp";
import searchSaveAlertGif from "../../assets/SearchSaveAlert.gif";
import getNoticedByLandlordsImage from "../../assets/Get-noticed-by-landlords.webp";
import trustAndSafetyImage from "../../assets/Trust-_-Safety.webp";
import chatAndShareGif from "../../assets/Chatandshare.gif";

type Audience = "tenant" | "landlord";

const AUDIENCE_COPY: Record<
  Audience,
  {
    title: string;
    description: string;
    cards: Array<{
      title: string;
      description: string;
      icon: typeof PencilLine;
    }>;
  }
> = {
  tenant: {
    title: "How it works",
    description:
      "Looking for a place? Or renting one out? Here's how ReserveHousing brings landlords and tenants together",
    cards: [
      {
        title: "Search verified homes",
        description:
          "Discover listings that match your budget and move-in plans, with trusted details and clear rental conditions.",
        icon: PencilLine,
      },
      {
        title: "Communicate with landlords",
        description:
          "Ask questions, discuss availability, and share your documents through one secure and simple message space.",
        icon: MessageCircle,
      },
      {
        title: "Book with confidence",
        description:
          "Confirm your booking safely with transparent payment steps and support throughout your rental journey.",
        icon: ShieldCheck,
      },
    ],
  },
  landlord: {
    title: "How it works",
    description:
      "Looking for a place? Or renting one out? Here's how ReserveHousing brings landlords and tenants together",
    cards: [
      {
        title: "Manage your listings",
        description:
          "Manage your listings with real-time updates and customizable settings to control availability and pricing and specify the type of tenants you prefer.",
        icon: PencilLine,
      },
      {
        title: "Communicate with tenants",
        description:
          "Easily chat with tenants using our message center, exchange documents and save time by setting Quick Replies for common questions.",
        icon: MessageCircle,
      },
      {
        title: "Secure rentals",
        description:
          "Ensure safety and reliability with verified tenants and a secure payment system for collecting rental payments smoothly.",
        icon: ShieldCheck,
      },
    ],
  },
};

export function HowItWorks() {
  const { user } = useAuth();
  const location = useLocation();

  const resolveAudience = (search: string, role?: "tenant" | "landlord"): Audience => {
    const queryAudience = new URLSearchParams(search).get("audience");
    if (queryAudience === "tenant" || queryAudience === "landlord") {
      return queryAudience;
    }

    if (role === "tenant" || role === "landlord") {
      return role;
    }

    return "landlord";
  };

  const [activeAudience, setActiveAudience] = useState<Audience>(() =>
    resolveAudience(location.search, user?.role),
  );
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const content = AUDIENCE_COPY[activeAudience];

  useEffect(() => {
    setActiveAudience(resolveAudience(location.search, user?.role));
  }, [location.search, user?.role]);

  const faqs = [
    {
      question: "What is ReserveHousing?",
      answer: "ReserveHousing is a platform that connects landlords with tenants, making it easy to find verified matches, communicate securely, and manage rentals from anywhere in the world.",
    },
    {
      question: "Why should I list my place on ReserveHousing?",
      answer: "By listing on ReserveHousing, you gain access to millions of potential tenants worldwide, supported by partnerships with over 300+ international universities. Our platform handles payments securely and provides tools to manage your properties efficiently.",
    },
    {
      question: "Can I use ReserveHousing for free?",
      answer: "ReserveHousing offers free listing creation. Some premium features and services may have associated fees, but you can start listing your property without any upfront costs.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden bg-[#D8DFE9] pt-[50px] pb-[152px] md:pt-[64px] md:pb-[182px]">
        <div className="mx-auto max-w-[1200px] px-[32px] text-center">
          <h1 className="text-[#032E3D] text-[42px] md:text-[58px] font-bold tracking-[-0.04em] leading-[1]">
            {content.title}
          </h1>
          <p className="mx-auto mt-[16px] max-w-[840px] text-[#0D3747] text-[15px] md:text-[18px] leading-[1.45] font-semibold">
            {content.description}
          </p>

          <div className="mx-auto mt-[42px] flex w-full max-w-[620px] rounded-full border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.52)] p-[4px] shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
            <button
              type="button"
              className={`h-[40px] md:h-[44px] flex-1 rounded-full text-[14px] md:text-[16px] font-medium transition-colors ${
                activeAudience === "tenant"
                  ? "bg-[#032E3D] text-white"
                  : "bg-transparent text-[#0D3747] hover:bg-[rgba(255,255,255,0.32)]"
              }`}
              onClick={() => setActiveAudience("tenant")}
            >
              For tenants
            </button>
            <button
              type="button"
              className={`h-[40px] md:h-[44px] flex-1 rounded-full text-[14px] md:text-[16px] font-semibold transition-colors ${
                activeAudience === "landlord"
                  ? "bg-[#032E3D] text-white"
                  : "bg-transparent text-[#0D3747] hover:bg-[rgba(255,255,255,0.32)]"
              }`}
              onClick={() => setActiveAudience("landlord")}
            >
              For landlords
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 bottom-[-170px] h-[275px] w-[1800px] -translate-x-1/2 rounded-[50%] bg-white" />
      </section>

      <section className="mt-[10px] md:mt-[14px] relative z-10 pb-[52px] md:pb-[64px]">
        <div className="mx-auto max-w-[1180px] px-[20px] md:px-[28px]">
          <div className="grid grid-cols-1 gap-[20px] md:grid-cols-3 md:gap-[22px]">
            {content.cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[12px] border border-[rgba(11,45,58,0.06)] bg-[#D4DAE2] px-[20px] py-[18px] shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
              >
                <card.icon className="h-[36px] w-[36px] text-[#113646]" />
                <h2 className="mt-[12px] text-[#0B3242] text-[20px] md:text-[16px] font-bold leading-[1.2]">{card.title}</h2>
                <p className="mt-[8px] text-[#355361] text-[16px] md:text-[13px] leading-[1.5]">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeAudience === "tenant" ? (
      <section className="pb-[56px] md:pb-[72px]">
        <div className="mx-auto max-w-[1180px] px-[20px] md:px-[28px] space-y-[40px]">
          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="overflow-hidden rounded-[8px] border border-[rgba(3,46,61,0.16)] bg-black">
              <iframe
                title="How it works | ReserveHousing"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="h-[280px] w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Join over 100,000 people who&apos;ve found their home with us.
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Whether you&apos;re a student, a professional, or someone looking for temporary accommodation, ReserveHousing securely connects you with landlords and property managers.
              </p>
              <button
                type="button"
                className="mt-[16px] inline-flex items-center justify-center gap-[6px] rounded-[8px] bg-[#FF5630] px-[16px] py-[10px] text-white text-[13px] font-bold tracking-[0.01em] hover:bg-[#E64520] transition-colors"
              >
                Find a place that feels like home
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-[36px]">
            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Tenant Protection
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                All rentals on ReserveHousing come with Tenant Protection, which ensures a secure and stress-free rental experience from start to finish. For example, if a landlord cancels or delays your move-in, we will help you find alternative accommodations or a temporary stay. We also protect your payment by holding your first month's rent for 48 hours after you move in. This allows you to confirm that everything is as promised.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                Learn more about Tenant Protection
              </button>
            </div>

            <div className="rounded-[14px] p-[8px]">
              <img
                src={tenantProtectionImage}
                alt="Tenant Protection"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="rounded-[14px] p-[8px]">
              <img
                src={onlineViewingImage}
                alt="Safe way to rent a place remotely"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Safe way to rent a place remotely
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Find, rent, and manage your stay entirely online with no in-person visits. Choose from a wide selection of properties in major cities and university towns, with multilingual support available for your destination.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                Learn more about online viewings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-[36px]">
            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Search, save and set alerts
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Browse thousands of rental properties, save favorites and set up alerts to get real-time availability updates and plan your move with confidence.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                How to find a perfect place
              </button>
            </div>

            <div className="rounded-[14px] p-[8px]">
              <img
                src={searchSaveAlertGif}
                alt="Search, save and set alerts"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="rounded-[14px] p-[8px]">
              <img
                src={getNoticedByLandlordsImage}
                alt="Get noticed by landlords"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Get noticed by landlords
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                A verified ID builds trust and shows landlords you're a serious renter. Complete your ID verification to stand out and secure your place faster.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                Verify your profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-[36px]">
            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Trust and safety
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                We verify landlords through a robust process including email verification, ID and selfie checks, and KYC verification. This ensures you're renting with trusted landlords, giving you the confidence to make the move.
              </p>
            </div>

            <div className="rounded-[14px] p-[8px]">
              <img
                src={trustAndSafetyImage}
                alt="Trust and safety checks"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="rounded-[14px] p-[8px]">
              <img
                src={chatAndShareGif}
                alt="Chat and share documents securely"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Chat and share documents securely
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Communicate directly with landlords using our platform's secure chat feature. Ask questions, negotiate terms, and share important documents safely, all within a protected environment.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold tracking-[0.02em]"
              >
                Learn more about communicating with landlords and property managers
              </button>
            </div>
          </div>

          <section className="pt-[16px] md:pt-[24px]">
            <div className="mx-auto max-w-[1020px] grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-[12px] bg-[#DDE3E8] px-[20px] py-[18px]">
                <MousePointer2 className="h-[36px] w-[36px] text-[#0B3242]" />
                <h3 className="mt-[12px] text-[#0B3242] text-[20px] md:text-[16px] font-bold leading-[1.2]">1. Pick a few places</h3>
                <p className="mt-[8px] text-[#4E6470] text-[16px] md:text-[13px] leading-[1.5]">
                  Browse rooms, studios, and apartments online. With photos, videos, and descriptions, viewings are not needed - renting from anywhere is quick and easy.
                </p>
              </article>

              <article className="rounded-[12px] bg-[#DDE3E8] px-[20px] py-[18px]">
                <MessageCircle className="h-[36px] w-[36px] text-[#0B3242]" />
                <h3 className="mt-[12px] text-[#0B3242] text-[20px] md:text-[16px] font-bold leading-[1.2]">2. Message the landlord</h3>
                <p className="mt-[8px] text-[#4E6470] text-[16px] md:text-[13px] leading-[1.5]">
                  Send a message to the landlord through private chat. Ask questions, share information, and see how well you both match.
                </p>
              </article>

              <article className="rounded-[12px] bg-[#DDE3E8] px-[20px] py-[18px] md:col-span-2 xl:col-span-1">
                <Send className="h-[36px] w-[36px] text-[#0B3242]" />
                <h3 className="mt-[12px] text-[#0B3242] text-[20px] md:text-[16px] font-bold leading-[1.2]">3. Apply to rent</h3>
                <p className="mt-[8px] text-[#4E6470] text-[16px] md:text-[13px] leading-[1.5]">
                  Like a place and want to call it home? Apply to rent it, and you'll know if it's yours within 48 hours.
                </p>
              </article>

              <article className="rounded-[12px] bg-[#DDE3E8] px-[20px] py-[18px] md:col-start-1 xl:col-start-1 xl:col-span-1">
                <HandCoins className="h-[36px] w-[36px] text-[#0B3242]" />
                <h3 className="mt-[12px] text-[#0B3242] text-[20px] md:text-[16px] font-bold leading-[1.2]">4. Pay, and it's yours</h3>
                <p className="mt-[8px] text-[#4E6470] text-[16px] md:text-[13px] leading-[1.5]">
                  Pay the first month's rent to confirm your stay. Congratulations! You found your next home.
                </p>
              </article>

              <article className="rounded-[12px] bg-[#DDE3E8] px-[20px] py-[18px] md:col-start-2 xl:col-start-2 xl:col-span-1">
                <HandMetal className="h-[36px] w-[36px] text-[#0B3242]" />
                <h3 className="mt-[12px] text-[#0B3242] text-[20px] md:text-[16px] font-bold leading-[1.2]">5. Move in with peace of mind</h3>
                <p className="mt-[8px] text-[#4E6470] text-[16px] md:text-[13px] leading-[1.5]">
                  Your payment is safe with us until you move in and check everything out. With our Tenant Protection, you're in safe hands from start to finish.
                </p>
              </article>
            </div>
          </section>
        </div>
      </section>
      ) : (
      <section className="pb-[56px] md:pb-[72px]">
        <div className="mx-auto max-w-[1180px] px-[20px] md:px-[28px] space-y-[40px]">
          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="overflow-hidden rounded-[8px] border border-[rgba(3,46,61,0.16)] bg-black">
              <iframe
                title="How it works landlord video preview"
                src="about:blank"
                className="h-[280px] w-full"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Extensive reach and exposure
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Access millions of potential tenants worldwide, supported by our partnerships with over 300+ international universities.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                More about our audience reach
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-[36px]">
            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Effortless listing and management
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Create and manage property listings with ease. Listings are automatically translated into multiple languages, and our advanced calendar sync saves you time and effort.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                More about property management
              </button>
            </div>

            <div className="rounded-[14px] p-[8px]">
              <img
                src={effortlessListingImage}
                alt="Effortless listing and management"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="rounded-[14px] p-[8px]">
              <img
                src={remoteTenantMatchingImage}
                alt="Remote tenant matching and communication"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Remote tenant matching and communication
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Use filters to set tenant preferences and find the right match. Communicate with verified tenants via our secure messaging system and skip property tours by creating detailed listings with photos and videos.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                More about tenant matching
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-[36px]">
            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Securely collect all payments
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Collect rent, deposits, utility bills and other fees securely on our platform. With several international payment methods, collecting payments is easy, regardless of your location or your tenant's.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                More about online rent collection
              </button>
            </div>

            <div className="rounded-[14px] p-[8px]">
              <img
                src={securePaymentsImage}
                alt="Securely collect all payments"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[1.02fr_0.98fr] lg:gap-[36px]">
            <div className="rounded-[14px] p-[8px]">
              <img
                src={getSupportImage}
                alt="Get support from our international team"
                className="w-full max-w-[450px] rounded-[10px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Get support from our international team
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Benefit from our dedicated customer support team, available to assist you with any questions or issues. Get the most out of ReserveHousing with our library of resources. Maximize your rental income by reading other landlord's success stories.
              </p>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em]"
              >
                Contact us
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-[24px] lg:grid-cols-[0.98fr_1.02fr] lg:gap-[36px]">
            <div>
              <h2 className="text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.12] tracking-[-0.02em]">
                Sync calendars and connect to other platforms
              </h2>
              <p className="mt-[12px] text-[#4E6470] text-[15px] leading-[1.5]">
                Keep your property details and availability up-to-date with calendar integration, and easily integrate with property and channel managers.
              </p>
              <button
                type="button"
                className="mt-[16px] inline-flex items-center justify-center gap-[6px] rounded-[8px] bg-[#032E3D] px-[16px] py-[10px] text-white text-[13px] font-bold uppercase tracking-[0.02em] hover:bg-[#022633] transition-colors"
              >
                Learn more about integrations
              </button>
            </div>

            <div className="overflow-hidden rounded-[8px] border border-[rgba(3,46,61,0.16)] bg-black">
              <iframe
                title="Update property availability status"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="h-[280px] w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>
      )}

      {activeAudience === "landlord" && (
      <section className="bg-[#F9F9F9] py-[52px] md:py-[72px]">
        <div className="mx-auto max-w-[880px] px-[20px] md:px-[28px] text-center">
          <h2 className="text-[#0B3242] text-[28px] md:text-[36px] font-bold leading-[1.2] tracking-[-0.02em]">
            List my property
          </h2>
          <p className="mx-auto mt-[12px] max-w-[700px] text-[#4E6470] text-[14px] leading-[1.5]">
            Experience the ease of managing your mid-term rentals with ReserveHousing. Start attracting the right tenants today.
          </p>
          <button
            type="button"
            className="mt-[22px] inline-flex items-center justify-center rounded-[8px] bg-[#032E3D] px-[22px] py-[11px] text-white text-[13px] font-bold uppercase tracking-[0.02em] hover:bg-[#022633] transition-colors"
          >
            Get started now
          </button>
        </div>
      </section>
      )}

      {activeAudience === "landlord" && (
      <section className="py-[52px] md:py-[72px]">
        <div className="mx-auto max-w-[880px] px-[20px] md:px-[28px]">
          <h2 className="text-center text-[#0B3242] text-[28px] md:text-[32px] font-bold leading-[1.2] tracking-[-0.02em] mb-[32px]">
            Frequently Asked Questions
          </h2>

          <div className="space-y-[12px]">
            {faqs.map((faq, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full rounded-[10px] border border-[#D5DCE5] bg-[#F0F3F7] px-[16px] py-[12px] text-left transition-colors hover:bg-[#E8EDF3]"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-[#0B3242] text-[15px] font-semibold">{faq.question}</h3>
                  <span className="flex-shrink-0 text-[#0B3242] text-[16px]">→</span>
                </div>
                {expandedFaq === index && (
                  <p className="mt-[8px] text-[#4E6470] text-[14px] leading-[1.5]">
                    {faq.answer}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
      )}

      {activeAudience === "landlord" && (
      <section className="py-[52px] md:py-[72px]">
        <div className="mx-auto max-w-[1180px] px-[20px] md:px-[28px]">
          <div className="grid grid-cols-1 items-center gap-[32px] lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-[12px] overflow-hidden">
              <img
                src={mariaSuccessStoryImage}
                alt="Maria's success story"
                className="w-full max-w-[500px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-[#0B3242] text-[24px] md:text-[28px] font-bold leading-[1.2] tracking-[-0.02em]">
                Maria's toolkit for safe, secure and efficient rental
              </h2>
              <blockquote className="mt-[16px] text-[#4E6470] text-[14px] leading-[1.6] italic border-l-[4px] border-[#0BA5C7] pl-[16px]">
                "I'm never left with vacant rooms. Everything is rented before the school term starts. Even during the summer, my rooms were all occupied."
              </blockquote>
              <button
                type="button"
                className="mt-[16px] border-b border-[#0B3242] pb-[2px] text-[#0B3242] text-[13px] font-bold uppercase tracking-[0.02em] hover:border-b-2"
              >
                Read more
              </button>
            </div>
          </div>
        </div>
      </section>
      )}

      <Footer variant="dashboard" />
    </div>
  );
}