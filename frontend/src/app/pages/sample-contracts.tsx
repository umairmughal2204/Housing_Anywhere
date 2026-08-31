import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import { Link } from "react-router";
import heroBg from "../../assets/hero-bg.jpg";
import { FileText, Mail, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";

export function SampleContracts() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Sample Contracts & Lease Legal Support"
        description="Learn about legally compliant tenancy agreement templates and customized contract support."
        canonicalUrl="https://ezzystay.com/sample-contracts"
      />
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Hero Section */}
      <section
        className="relative min-h-[360px] md:min-h-[420px] flex items-center justify-center text-center bg-cover bg-center py-[64px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 max-w-[800px] px-[16px] text-white flex flex-col items-center">
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[14px]">
            Legal Agreements
          </span>
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            Rental Contracts & Documentation
          </h1>
          <p className="text-[17px] md:text-[20px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Customized rental agreements and legal support tailored for your property and jurisdiction.
          </p>
        </div>
      </section>

      <main className="max-w-[850px] mx-auto px-[16px] py-[72px]">
        {/* Main Banner */}
        <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-[32px] md:p-[48px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center mb-[40px]">
          <div className="w-[60px] h-[60px] bg-[#E0F2FE] rounded-full flex items-center justify-center mx-auto mb-[20px]">
            <FileText className="w-[28px] h-[28px] text-[#0891B2]" />
          </div>
          <h2 className="text-[#0F2D36] text-[24px] md:text-[28px] font-bold mb-[12px]">
            Request Rental Contract Assistance
          </h2>
          <p className="text-[#6B7280] text-[15px] leading-[1.7] max-w-[580px] mx-auto mb-[28px]">
            Rental contract regulations vary by municipality, country, and lease duration. To ensure your agreement is fully compliant with local housing laws, please contact our support team to request contract guidance and documentation.
          </p>

          <Link
            to="/contact"
            className="inline-flex items-center gap-[8px] bg-[#0891B2] text-white px-[28px] py-[13px] rounded-[10px] font-bold text-[15px] hover:bg-[#0E7490] transition-colors"
          >
            <Mail className="w-[18px] h-[18px]" />
            Contact Us for Contract Support
          </Link>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[16px] p-[28px]">
            <ShieldCheck className="w-[28px] h-[28px] text-[#0891B2] mb-[14px]" />
            <h3 className="text-[#0F2D36] text-[18px] font-bold mb-[8px]">
              Digital Tenancy Agreements
            </h3>
            <p className="text-[#6B7280] text-[14px] leading-[1.6] mb-[16px]">
              EzzyStay provides digital contract tools for landlords and tenants to securely finalize bookings online.
            </p>
            <Link
              to="/how-it-works"
              className="text-[#0891B2] text-[14px] font-semibold hover:underline inline-flex items-center gap-[4px]"
            >
              Learn How It Works <ArrowRight className="w-[14px] h-[14px]" />
            </Link>
          </div>

          <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[16px] p-[28px]">
            <HelpCircle className="w-[28px] h-[28px] text-[#0891B2] mb-[14px]" />
            <h3 className="text-[#0F2D36] text-[18px] font-bold mb-[8px]">
              Have Legal Questions?
            </h3>
            <p className="text-[#6B7280] text-[14px] leading-[1.6] mb-[16px]">
              Our legal and support team is available 24/7 to clarify tenancy rules, deposits, and notice periods.
            </p>
            <Link
              to="/help"
              className="text-[#0891B2] text-[14px] font-semibold hover:underline inline-flex items-center gap-[4px]"
            >
              Visit Help Center <ArrowRight className="w-[14px] h-[14px]" />
            </Link>
          </div>
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
