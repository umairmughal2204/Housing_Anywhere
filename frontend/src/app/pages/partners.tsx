import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import { Link } from "react-router";
import heroBg from "../../assets/hero-bg.jpg";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Handshake,
  Globe,
  CheckCircle,
  ArrowRight,
  Mail,
} from "lucide-react";

export function Partners() {
  const { isAuthenticated } = useAuth();

  const partnerTypes = [
    {
      icon: Building2,
      title: "Property Managers",
      description:
        "Manage multiple properties with dedicated management features, centralized inbox, and custom listing arrangements.",
      benefits: ["Multi-unit management", "Centralized tenant inbox", "Custom agreements"],
    },
    {
      icon: GraduationCap,
      title: "Universities & Student Housing",
      description:
        "Help your domestic and international students find verified, safe housing near campus with dedicated assistance.",
      benefits: ["Student housing support", "Verified landlord listings", "Campus location search"],
    },
    {
      icon: Briefcase,
      title: "Corporate Relocation",
      description:
        "Streamline employee relocation and mid-term housing with curated listings and streamlined booking.",
      benefits: ["Corporate accounts", "Fast booking process", "Dedicated support"],
    },
    {
      icon: Globe,
      title: "Travel & Housing Organizations",
      description:
        "Collaborate with EzzyStay to provide housing options for long-term travelers and digital nomads.",
      benefits: ["Custom integrations", "Co-marketing opportunities", "Affiliate arrangements"],
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
        className="relative min-h-[360px] md:min-h-[420px] flex items-center justify-center text-center bg-cover bg-center py-[64px] rounded-b-[40px] md:rounded-b-[56px] shadow-[0_12px_32px_rgba(15,45,54,0.12)]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 max-w-[800px] px-[16px] text-white flex flex-col items-center">
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[16px]">
            Partnerships
          </span>
          <h1 className="text-[32px] md:text-[54px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            Partner with EzzyStay
          </h1>
          <p className="text-[17px] md:text-[21px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Collaborate with us to expand housing access, streamline relocation, and deliver exceptional rental experiences.
          </p>
        </div>
      </section>

      {/* Intro Banner */}
      <section className="bg-[#0D263B] text-white py-[28px] px-[16px] text-center">
        <p className="text-[16px] md:text-[18px] font-semibold max-w-[960px] mx-auto leading-[1.5]">
          We welcome partnerships with property managers, universities, corporate teams, and relocation services.
        </p>
      </section>

      {/* Partner Types */}
      <section className="max-w-[1100px] mx-auto px-[16px] py-[72px]">
        <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
          Partnership Opportunities
        </h2>
        <p className="text-[#6B7280] text-[16px] md:text-[17px] text-center max-w-[600px] mx-auto mb-[48px] leading-[1.6]">
          Explore how your organization can work together with EzzyStay.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {partnerTypes.map((partner) => (
            <div
              key={partner.title}
              className="border border-[#E5E7EB] rounded-[16px] p-[32px] hover:shadow-[0_8px_30px_rgba(8,145,178,0.1)] hover:border-[#0891B2]/30 transition-all duration-300 group"
            >
              <div className="w-[52px] h-[52px] bg-[#E0F2FE] rounded-[13px] flex items-center justify-center mb-[18px]">
                <partner.icon className="w-[24px] h-[24px] text-[#0891B2]" />
              </div>
              <h3 className="text-[#0F2D36] text-[20px] font-bold mb-[10px] group-hover:text-[#0891B2] transition-colors">
                {partner.title}
              </h3>
              <p className="text-[#6B7280] text-[15px] leading-[1.6] mb-[16px]">
                {partner.description}
              </p>
              <ul className="space-y-[8px]">
                {partner.benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-[8px] text-[#374151] text-[14px]"
                  >
                    <CheckCircle className="w-[16px] h-[16px] text-[#0891B2] flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#F8FAFB] py-[72px]">
        <div className="max-w-[800px] mx-auto px-[16px]">
          <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
            How to Partner With Us
          </h2>
          <p className="text-[#6B7280] text-[16px] md:text-[17px] text-center max-w-[550px] mx-auto mb-[48px] leading-[1.6]">
            Getting started is simple.
          </p>
          <div className="space-y-[24px]">
            {[
              {
                step: "01",
                title: "Reach Out",
                description:
                  "Contact our partnerships team with information about your organization and partnership goals.",
              },
              {
                step: "02",
                title: "Discussion",
                description:
                  "We will schedule an introductory call to explore mutual goals and customize a partnership model.",
              },
              {
                step: "03",
                title: "Onboarding & Launch",
                description:
                  "Set up your partnership, configure any relevant accounts, and start collaborating.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-[20px] bg-white border border-[#E5E7EB] rounded-[14px] p-[24px]"
              >
                <div className="w-[48px] h-[48px] bg-[#0891B2] rounded-[12px] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[16px] font-bold">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-[#0F2D36] text-[17px] font-bold mb-[4px]">
                    {item.title}
                  </h3>
                  <p className="text-[#6B7280] text-[14px] leading-[1.6]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0891B2] text-white py-[48px] px-[16px] text-center">
        <Handshake className="w-[40px] h-[40px] mx-auto mb-[16px] text-white/90" />
        <h2 className="text-[24px] md:text-[32px] font-bold mb-[12px]">
          Interested in Partnering?
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/90 mb-[24px] max-w-[500px] mx-auto leading-[1.5]">
          Send an inquiry to our team to discuss partnership opportunities.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-[8px] bg-white text-[#0891B2] px-[32px] py-[14px] rounded-[10px] font-bold text-[15px] hover:bg-[#F0FDFA] transition-colors"
        >
          <Mail className="w-[16px] h-[16px]" />
          Contact Partnerships Team
        </Link>
      </section>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
