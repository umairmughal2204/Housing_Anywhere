import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Search, Mail, Phone, MessageCircle, FileText, HelpCircle, ArrowRight, ShieldCheck, LifeBuoy, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";

type HelpContact = {
  title: string;
  description: string;
  detail: string;
  actionLabel: string;
  href: string;
  openInNewTab?: boolean;
  icon: typeof MessageCircle;
  accentClassName: string;
  keywords: string[];
};

type HelpTopic = {
  question: string;
  answer: string;
  tags: string[];
};

const HELP_CONTACTS: HelpContact[] = [
  {
    title: "Live Chat",
    description: "Chat with our support team",
    detail: "Available 24/7",
    actionLabel: "Start chat",
    href: "/tenant/inbox",
    icon: MessageCircle,
    accentClassName: "bg-brand-primary",
    keywords: ["chat", "support", "message", "live"],
  },
  {
    title: "Email Support",
    description: "support@reservehousing.com",
    detail: "Response within 2 hours",
    actionLabel: "Send email",
    href: "mailto:support@reservehousing.com",
    icon: Mail,
    accentClassName: "bg-brand-primary",
    keywords: ["email", "mail", "support", "reply"],
  },
  {
    title: "Phone Support",
    description: "+31 20 123 4567",
    detail: "Mon-Fri, 9am-6pm CET",
    actionLabel: "Call now",
    href: "tel:+31201234567",
    icon: Phone,
    accentClassName: "bg-brand-primary",
    keywords: ["phone", "call", "contact", "support"],
  },
];

const TENANT_TOPICS: HelpTopic[] = [
  {
    question: "How do I search for properties?",
    answer: "Use city, price, move-in date, and property type filters to narrow listings that match your stay.",
    tags: ["search", "properties", "filters", "listing"],
  },
  {
    question: "What is registration (Anmeldung)?",
    answer: "Registration is the official address registration required in some cities after moving in.",
    tags: ["registration", "anmeldung", "address", "city"],
  },
  {
    question: "How does deposit protection work?",
    answer: "Eligible deposits are handled with protection so the funds are safeguarded during the rental period.",
    tags: ["deposit", "protection", "safety", "payment"],
  },
  {
    question: "Can I view properties virtually?",
    answer: "Many landlords offer online viewings or video walkthroughs before you book.",
    tags: ["viewing", "virtual", "video", "tour"],
  },
  {
    question: "What documents do I need to apply?",
    answer: "Common documents include ID, proof of income, student proof, and a short profile introduction.",
    tags: ["documents", "apply", "id", "income"],
  },
  {
    question: "How long does approval take?",
    answer: "Response time depends on the landlord, but many applications are reviewed within a few days.",
    tags: ["approval", "response", "application", "time"],
  },
  {
    question: "What if I need to cancel?",
    answer: "Cancellation terms depend on the lease and the stage of your booking, so always review the policy first.",
    tags: ["cancel", "policy", "booking", "lease"],
  },
  {
    question: "How do I pay my rent?",
    answer: "Rent can be paid through the platform or the landlord's preferred payment method where available.",
    tags: ["rent", "payment", "monthly", "transfer"],
  },
];

const LANDLORD_TOPICS: HelpTopic[] = [
  {
    question: "How do I list my property?",
    answer: "Create a listing with photos, rental details, house rules, and verification information.",
    tags: ["list", "property", "photos", "verification"],
  },
  {
    question: "What is the verification process?",
    answer: "Landlords typically complete identity and listing verification before publishing properties.",
    tags: ["verification", "landlord", "identity", "publish"],
  },
  {
    question: "How do I manage inquiries?",
    answer: "Use the inbox to organize applicants, reply faster, and keep conversations in one place.",
    tags: ["inquiries", "inbox", "applicants", "messages"],
  },
  {
    question: "What are quick reply templates?",
    answer: "Quick replies help you answer common questions with reusable messages and save time.",
    tags: ["templates", "replies", "messages", "time"],
  },
  {
    question: "How does payment collection work?",
    answer: "Payments can be handled with automated rent collection or another approved method.",
    tags: ["payment", "collection", "rent", "automation"],
  },
  {
    question: "What if a tenant doesn't pay?",
    answer: "If payment is missed, review the lease terms and contact support early to manage the situation.",
    tags: ["tenant", "payment", "missed", "support"],
  },
  {
    question: "How do I handle disputes?",
    answer: "Document the issue, keep the conversation in the platform, and escalate with support if needed.",
    tags: ["disputes", "support", "issue", "resolution"],
  },
  {
    question: "Can I list multiple properties?",
    answer: "Yes. Manage each property separately so availability, pricing, and messages stay organized.",
    tags: ["multiple", "properties", "manage", "listing"],
  },
];

const SAFETY_TOPICS: HelpTopic[] = [
  {
    question: "How we protect you",
    answer: "We use verification, secure messaging, and deposit safeguards to reduce rental risk.",
    tags: ["security", "verification", "messaging", "deposit"],
  },
  {
    question: "Reporting suspicious activity",
    answer: "Report suspicious messages or listings immediately so our team can investigate quickly.",
    tags: ["report", "suspicious", "fraud", "safety"],
  },
  {
    question: "Data privacy",
    answer: "Your data is handled with encrypted systems and shared only where necessary for the service.",
    tags: ["privacy", "gdpr", "data", "encryption"],
  },
];

const QUICK_SEARCHES = ["deposit protection", "verification", "cancel booking", "list my property", "payment", "safety"];

function matchesQuery(question: string, answer: string, tags: string[], query: string) {
  if (!query) {
    return true;
  }

  const haystack = `${question} ${answer} ${tags.join(" ")}`.toLowerCase();
  return haystack.includes(query);
}

function HelpTopicCard({ topic, tone }: { topic: HelpTopic; tone: "brand" | "accent" }) {
  const iconClassName = tone === "brand" ? "text-brand-primary" : "text-accent-blue";

  return (
    <details className="group rounded-[24px] border border-[rgba(0,0,0,0.08)] bg-white p-[20px] shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-[16px]">
        <div>
          <div className={`mb-[8px] flex items-center gap-[8px] text-[12px] font-semibold uppercase tracking-[0.12em] ${iconClassName}`}>
            <Sparkles className="h-[14px] w-[14px]" />
            Helpful answer
          </div>
          <h4 className="text-[16px] font-bold text-neutral-black leading-[1.4]">
            {topic.question}
          </h4>
        </div>
        <ArrowRight className="mt-[4px] h-[18px] w-[18px] shrink-0 text-neutral-gray transition-transform group-open:rotate-90" />
      </summary>
      <p className="mt-[12px] text-[14px] leading-[1.65] text-neutral-gray">
        {topic.answer}
      </p>
    </details>
  );
}

export function Help() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    const queryFromUrl = new URLSearchParams(location.search).get("q");
    if (queryFromUrl !== null) {
      setSearchQuery(queryFromUrl);
    }
  }, [location.search]);

  const filteredContacts = useMemo(
    () => HELP_CONTACTS.filter((contact) => matchesQuery(contact.title, contact.description, contact.keywords, normalizedQuery)),
    [normalizedQuery],
  );

  const filteredTenantTopics = useMemo(
    () => TENANT_TOPICS.filter((topic) => matchesQuery(topic.question, topic.answer, topic.tags, normalizedQuery)),
    [normalizedQuery],
  );

  const filteredLandlordTopics = useMemo(
    () => LANDLORD_TOPICS.filter((topic) => matchesQuery(topic.question, topic.answer, topic.tags, normalizedQuery)),
    [normalizedQuery],
  );

  const filteredSafetyTopics = useMemo(
    () => SAFETY_TOPICS.filter((topic) => matchesQuery(topic.question, topic.answer, topic.tags, normalizedQuery)),
    [normalizedQuery],
  );

  const totalMatches = filteredContacts.length + filteredTenantTopics.length + filteredLandlordTopics.length + filteredSafetyTopics.length;
  const hasSearch = normalizedQuery.length > 0;
  const hasAnyMatches = totalMatches > 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative overflow-hidden bg-[#D8DFE9] pt-[50px] pb-[136px] md:pt-[64px] md:pb-[164px]">
        <div className="max-w-[1200px] mx-auto px-[32px] text-center">
          <h1 className="text-[#032E3D] text-[42px] md:text-[58px] font-bold tracking-[-0.04em] leading-[1] mb-[16px]">
            Help Center
          </h1>
          <p className="text-[#0D3747] text-[15px] md:text-[18px] font-semibold max-w-[760px] mx-auto leading-[1.45]">
            Search articles, contact support, and explore guidance for tenants and landlords in one place.
          </p>

          <div className="mx-auto mt-[42px] max-w-[760px]">
            <div className="flex items-center gap-[12px] rounded-full border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.52)] p-[4px] shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
              <div className="flex flex-1 items-center gap-[12px] rounded-full bg-white px-[18px] py-[12px] shadow-[inset_0_0_0_1px_rgba(11,165,199,0.08)]">
                <Search className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search topics like deposit, verification, cancel booking, or rent"
                  className="flex-1 outline-none text-[14px] text-[#1A1A1A] placeholder:text-[#6B6B6B]"
                />
              </div>
            </div>

            <div className="mt-[16px] flex flex-wrap items-center justify-center gap-[8px]">
              {QUICK_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSearchQuery(term)}
                  className="rounded-full border border-[rgba(11,165,199,0.14)] bg-white px-[12px] py-[6px] text-[12px] font-semibold text-neutral-black transition-colors hover:bg-brand-primary hover:text-white"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-[18px] text-[13px] text-[#0D3747]/80">
            Try searching for support email, rent payment, safety, or landlord verification.
          </p>
        </div>
        <div className="pointer-events-none absolute left-1/2 bottom-[-210px] h-[340px] w-[1800px] -translate-x-1/2 rounded-[50%] bg-white" />
      </section>

      <section className="py-[72px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <div className="mb-[32px] flex flex-wrap items-center justify-between gap-[16px]">
            <div>
              <h2 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">
                Get in Touch
              </h2>
              <p className="mt-[8px] text-[15px] text-neutral-gray">
                Use the options below if you want immediate support instead of searching.
              </p>
            </div>
            {hasSearch && (
              <div className="rounded-full bg-[#F7F7F9] px-[14px] py-[8px] text-[13px] font-semibold text-[#1A1A1A]">
                {hasAnyMatches ? `${totalMatches} matches found` : "No matches found"}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-[32px]">
            {filteredContacts.map((contact) => {
              const Icon = contact.icon;

              return (
                <a
                  key={contact.title}
                  href={contact.href}
                  target={contact.openInNewTab ? "_blank" : undefined}
                  rel={contact.openInNewTab ? "noreferrer" : undefined}
                  className="group block rounded-[28px] border border-[rgba(11,45,58,0.08)] bg-[linear-gradient(180deg,#F9FCFF_0%,#F4F7FA_100%)] p-[24px] md:p-[32px] text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-[3px] hover:border-[rgba(11,165,199,0.32)] hover:shadow-[0_16px_36px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center mx-auto mb-[20px] md:mb-[24px] shadow-[0_10px_20px_rgba(11,165,199,0.22)] ${contact.accentClassName}`}>
                    <Icon className="w-[28px] h-[28px] text-white" />
                  </div>
                  <h3 className="text-neutral-black text-[20px] font-bold mb-[10px]">
                    {contact.title}
                  </h3>
                  <p className="text-neutral-gray text-[14px] mb-[12px] md:mb-[16px]">
                    {contact.description}
                  </p>
                  <p className="text-neutral-black text-[13px] font-semibold">
                    {contact.detail}
                  </p>
                  <span className="mt-[18px] inline-flex items-center gap-[8px] rounded-full bg-white px-[16px] py-[9px] text-[13px] font-semibold text-[#1A1A1A] shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all group-hover:bg-brand-primary group-hover:text-white">
                    {contact.actionLabel}
                    <ArrowRight className="h-[14px] w-[14px] transition-transform group-hover:translate-x-[2px]" />
                  </span>
                </a>
              );
            })}
          </div>

          {hasSearch && filteredContacts.length === 0 && (
            <div className="mt-[24px] rounded-[16px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9] p-[20px] text-center text-[14px] text-neutral-gray">
              No contact option matched your search. Try “email”, “chat”, or “phone”.
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F7F7F9] py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <div className="mb-[32px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h2 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">
                Popular Topics
              </h2>
              <p className="mt-[8px] text-[15px] text-neutral-gray">
                Expand a topic to see the answer. Search narrows these down instantly.
              </p>
            </div>
            <div className="rounded-full bg-white px-[14px] py-[8px] text-[13px] font-semibold text-[#1A1A1A] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
              {filteredTenantTopics.length + filteredLandlordTopics.length} topic results
            </div>
          </div>

          {hasSearch && !hasAnyMatches ? (
            <div className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-white p-[32px] text-center">
              <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[8px]">No results found</h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Try a different keyword like “deposit”, “verification”, or “rent”.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-[20px] inline-flex items-center gap-[8px] rounded-full bg-brand-primary px-[18px] py-[10px] text-[14px] font-semibold text-white transition-colors hover:bg-brand-primary-dark"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-[32px]">
              <div className="rounded-[28px] bg-white p-[32px]">
                <div className="flex items-center gap-[12px] mb-[24px]">
                  <HelpCircle className="w-[24px] h-[24px] text-brand-primary" />
                  <h3 className="text-neutral-black text-[20px] font-bold">
                    For Tenants
                  </h3>
                </div>
                <div className="space-y-[12px]">
                  {filteredTenantTopics.map((topic) => (
                    <HelpTopicCard key={topic.question} topic={topic} tone="brand" />
                  ))}
                  {filteredTenantTopics.length === 0 && (
                    <p className="text-neutral-gray text-[14px]">No tenant topics matched your search.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-[32px]">
                <div className="flex items-center gap-[12px] mb-[24px]">
                  <FileText className="w-[24px] h-[24px] text-accent-blue" />
                  <h3 className="text-neutral-black text-[20px] font-bold">
                    For Landlords
                  </h3>
                </div>
                <div className="space-y-[12px]">
                  {filteredLandlordTopics.map((topic) => (
                    <HelpTopicCard key={topic.question} topic={topic} tone="accent" />
                  ))}
                  {filteredLandlordTopics.length === 0 && (
                    <p className="text-neutral-gray text-[14px]">No landlord topics matched your search.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <div className="mb-[32px] flex flex-wrap items-end justify-between gap-[16px]">
            <div>
              <h2 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">
                Safety & Security
              </h2>
              <p className="mt-[8px] text-[15px] text-neutral-gray">
                Clear guidance for secure renting, reporting, and data protection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-[24px]">
            {filteredSafetyTopics.map((topic) => (
              <HelpTopicCard key={topic.question} topic={topic} tone="brand" />
            ))}
          </div>
        </div>
      </section>

      <Footer variant="dashboard" />
    </div>
  );
}