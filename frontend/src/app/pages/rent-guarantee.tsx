import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import { Link } from "react-router";
import heroBg from "../../assets/hero-bg.jpg";
import {
  ShieldCheck,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export function RentGuarantee() {
  const { isAuthenticated } = useAuth();

  const benefits = [
    {
      icon: DollarSign,
      title: "100% Guaranteed On-Time Rent",
      description:
        "Receive guaranteed monthly rent payments directly to your bank account on the 1st of every month, even if the tenant delays.",
    },
    {
      icon: ShieldCheck,
      title: "Property Damage Coverage",
      description:
        "Up to €5,000 protection against accidental damages caused during tenancy beyond normal wear and tear.",
    },
    {
      icon: CalendarCheck,
      title: "Vacancy Protection",
      description:
        "If a tenant leaves early without notice, we cover rent payments for up to 60 days while finding a replacement tenant.",
    },
    {
      icon: Lock,
      title: "Legal Cost Assistance",
      description:
        "Full legal support and court fee coverage up to €2,500 in the unlikely event of tenancy dispute resolution.",
    },
  ];

  const faqs = [
    {
      q: "How does the EzzyStay Rent Guarantee work?",
      a: "Once you enable Rent Guarantee on your listing, EzzyStay assumes the financial risk. We transfer monthly rent directly to you on the due date regardless of when the tenant pays.",
    },
    {
      q: "Who is eligible for Rent Guarantee?",
      a: "All verified landlords with active listings on EzzyStay who complete our standard tenant screening process are eligible.",
    },
    {
      q: "How much does Rent Guarantee cost?",
      a: "Rent Guarantee is included as a low 3.5% fee on monthly rent transactions or available free with our Premium Landlord Subscription.",
    },
    {
      q: "What happens if a tenant causes damage?",
      a: "Submit a claim with photos within 7 days of tenant move-out. Our claims team reviews and reimburses covered repairs up to €5,000 within 5 business days.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Hero Section */}
      <section
        className="relative min-h-[380px] md:min-h-[460px] flex items-center justify-center text-center bg-cover bg-center py-[64px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/55 z-10" />
        <div className="relative z-20 max-w-[800px] px-[16px] text-white flex flex-col items-center">
          <div className="w-[52px] h-[52px] bg-[#0891B2] rounded-[14px] flex items-center justify-center mb-[18px]">
            <ShieldCheck className="w-[28px] h-[28px] text-white" />
          </div>
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[12px]">
            Landlord Protection
          </span>
          <h1 className="text-[32px] md:text-[54px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            EzzyStay Rent Guarantee
          </h1>
          <p className="text-[17px] md:text-[21px] font-medium text-white/90 max-w-[620px] leading-[1.5]">
            Complete peace of mind for property owners. Get paid on time, every month — guaranteed.
          </p>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="max-w-[1100px] mx-auto px-[16px] py-[72px]">
        <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
          Why Landlords Trust Rent Guarantee
        </h2>
        <p className="text-[#6B7280] text-[16px] md:text-[17px] text-center max-w-[600px] mx-auto mb-[48px] leading-[1.6]">
          Protect your rental income and property with comprehensive coverage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[16px] p-[28px] text-center hover:shadow-[0_8px_30px_rgba(8,145,178,0.1)] hover:border-[#0891B2]/30 transition-all duration-300"
            >
              <div className="w-[56px] h-[56px] bg-[#E0F2FE] rounded-[14px] flex items-center justify-center mx-auto mb-[18px]">
                <b.icon className="w-[26px] h-[26px] text-[#0891B2]" />
              </div>
              <h3 className="text-[#0F2D36] text-[17px] font-bold mb-[8px]">
                {b.title}
              </h3>
              <p className="text-[#6B7280] text-[14px] leading-[1.6]">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-[#F8FAFB] py-[72px]">
        <div className="max-w-[800px] mx-auto px-[16px]">
          <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B7280] text-[16px] text-center max-w-[500px] mx-auto mb-[48px]">
            Everything you need to know about Rent Guarantee.
          </p>

          <div className="space-y-[16px]">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E7EB] rounded-[14px] p-[24px]"
              >
                <h3 className="text-[#0F2D36] text-[17px] font-bold mb-[8px] flex items-start gap-[10px]">
                  <HelpCircle className="w-[20px] h-[20px] text-[#0891B2] flex-shrink-0 mt-[2px]" />
                  {faq.q}
                </h3>
                <p className="text-[#6B7280] text-[15px] leading-[1.6] pl-[30px]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0891B2] text-white py-[48px] px-[16px] text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold mb-[12px]">
          Protect Your Rental Income Today
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/90 mb-[24px] max-w-[500px] mx-auto leading-[1.5]">
          Enable Rent Guarantee on your listings in minutes.
        </p>
        <Link
          to="/landlord"
          className="inline-flex items-center gap-[8px] bg-white text-[#0891B2] px-[32px] py-[14px] rounded-[10px] font-bold text-[15px] hover:bg-[#F0FDFA] transition-colors"
        >
          Become a Landlord
          <ArrowRight className="w-[16px] h-[16px]" />
        </Link>
      </section>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
