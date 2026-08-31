import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import { Link } from "react-router";
import heroBg from "../../assets/hero-bg.jpg";
import {
  Users,
  Globe,
  Heart,
  Zap,
  Coffee,
  BookOpen,
  Star,
  Shield,
  Briefcase,
  Mail,
} from "lucide-react";

export function Careers() {
  const { isAuthenticated } = useAuth();

  const values = [
    {
      icon: Heart,
      title: "People First",
      description:
        "We prioritize the well-being and growth of our team members, creating an environment where everyone can thrive.",
    },
    {
      icon: Globe,
      title: "Global Mindset",
      description:
        "Our team brings unique perspectives to build a seamless rental platform for tenants and landlords everywhere.",
    },
    {
      icon: Zap,
      title: "Innovation Driven",
      description:
        "We embrace new ideas and technologies, constantly pushing boundaries to improve the rental experience.",
    },
    {
      icon: Users,
      title: "Collaborative Spirit",
      description:
        "Great things happen when we work together. Cross-functional teamwork is at the heart of everything we do.",
    },
  ];

  const perks = [
    { icon: Coffee, label: "Flexible Work Hours" },
    { icon: Globe, label: "Remote-First Culture" },
    { icon: BookOpen, label: "Learning & Development" },
    { icon: Heart, label: "Health & Wellness" },
    { icon: Star, label: "Collaborative Environment" },
    { icon: Shield, label: "Work-Life Balance" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Hero Section */}
      <section
        className="relative min-h-[380px] md:min-h-[460px] flex items-center justify-center text-center bg-cover bg-center py-[64px] rounded-b-[40px] md:rounded-b-[56px] shadow-[0_12px_32px_rgba(15,45,54,0.12)]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 max-w-[800px] px-[16px] text-white flex flex-col items-center">
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[16px]">
            Careers at EzzyStay
          </span>
          <h1 className="text-[32px] md:text-[54px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            Build the Future of Renting
          </h1>
          <p className="text-[17px] md:text-[21px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Help us make finding a home easier, safer, and more transparent for
            tenants and landlords.
          </p>
        </div>
      </section>

      {/* Mission Banner */}
      <section className="bg-[#0D263B] text-white py-[28px] px-[16px] text-center">
        <p className="text-[16px] md:text-[18px] font-semibold max-w-[960px] mx-auto leading-[1.5]">
          We're a dedicated team passionate about modernizing the housing rental market.
        </p>
      </section>

      {/* Values Section */}
      <section className="max-w-[1100px] mx-auto px-[16px] py-[72px]">
        <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
          Our Values
        </h2>
        <p className="text-[#6B7280] text-[16px] md:text-[17px] text-center max-w-[600px] mx-auto mb-[48px] leading-[1.6]">
          The principles that guide how we work, build, and grow together.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
          {values.map((value) => (
            <div
              key={value.title}
              className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[16px] p-[28px] text-center hover:shadow-[0_8px_30px_rgba(8,145,178,0.1)] hover:border-[#0891B2]/30 transition-all duration-300"
            >
              <div className="w-[56px] h-[56px] bg-[#E0F2FE] rounded-[14px] flex items-center justify-center mx-auto mb-[18px]">
                <value.icon className="w-[26px] h-[26px] text-[#0891B2]" />
              </div>
              <h3 className="text-[#0F2D36] text-[17px] font-bold mb-[8px]">
                {value.title}
              </h3>
              <p className="text-[#6B7280] text-[14px] leading-[1.6]">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Positions - Honest Empty State */}
      <section className="bg-[#F8FAFB] py-[72px]">
        <div className="max-w-[750px] mx-auto px-[16px] text-center">
          <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold mb-[12px]">
            Open Positions
          </h2>
          <p className="text-[#6B7280] text-[16px] md:text-[17px] max-w-[550px] mx-auto mb-[40px] leading-[1.6]">
            Current job opportunities at EzzyStay.
          </p>

          <div className="bg-white border border-[#E5E7EB] rounded-[16px] p-[40px] md:p-[48px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="w-[60px] h-[60px] bg-[#E0F2FE] rounded-full flex items-center justify-center mx-auto mb-[20px]">
              <Briefcase className="w-[28px] h-[28px] text-[#0891B2]" />
            </div>
            <h3 className="text-[#0F2D36] text-[20px] font-bold mb-[10px]">
              No Open Roles Right Now
            </h3>
            <p className="text-[#6B7280] text-[15px] leading-[1.6] max-w-[480px] mx-auto mb-[28px]">
              We don't have any active job openings at the moment. However, we're always interested in meeting talented people. Feel free to send us your CV for future opportunities!
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-[8px] bg-[#0891B2] text-white px-[28px] py-[12px] rounded-[10px] font-bold text-[14px] hover:bg-[#0E7490] transition-colors"
            >
              <Mail className="w-[16px] h-[16px]" />
              Submit Open Application
            </Link>
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="max-w-[900px] mx-auto px-[16px] py-[72px]">
        <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
          Life at EzzyStay
        </h2>
        <p className="text-[#6B7280] text-[16px] md:text-[17px] text-center max-w-[550px] mx-auto mb-[40px] leading-[1.6]">
          What you can expect when working with our team.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[20px]">
          {perks.map((perk) => (
            <div
              key={perk.label}
              className="flex flex-col items-center text-center p-[24px] rounded-[14px] bg-[#F0FDFA] border border-[#CCFBF1] hover:bg-[#E0F2FE] hover:border-[#BAE6FD] transition-all duration-300"
            >
              <perk.icon className="w-[28px] h-[28px] text-[#0891B2] mb-[12px]" />
              <span className="text-[#0F2D36] text-[14px] md:text-[15px] font-semibold">
                {perk.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#0891B2] text-white py-[48px] px-[16px] text-center">
        <h2 className="text-[24px] md:text-[32px] font-bold mb-[12px]">
          Have Questions About Careers?
        </h2>
        <p className="text-[16px] md:text-[18px] text-white/90 mb-[24px] max-w-[500px] mx-auto leading-[1.5]">
          Reach out to our team anytime.
        </p>
        <Link
          to="/contact"
          className="inline-block bg-white text-[#0891B2] px-[32px] py-[14px] rounded-[10px] font-bold text-[15px] hover:bg-[#F0FDFA] transition-colors"
        >
          Contact Us
        </Link>
      </section>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
