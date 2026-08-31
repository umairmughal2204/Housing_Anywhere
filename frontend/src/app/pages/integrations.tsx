import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import { Link } from "react-router";
import heroBg from "../../assets/hero-bg.jpg";
import { Cpu, Calendar, CreditCard, Key, Shield, RefreshCw, CheckCircle, ArrowRight } from "lucide-react";

export function Integrations() {
  const { isAuthenticated } = useAuth();

  const integrations = [
    {
      icon: Calendar,
      name: "iCal & Channel Sync",
      category: "Calendar Sync",
      description: "Synchronize availability automatically with Airbnb, Booking.com, VRBO, and Google Calendar.",
      status: "Available",
    },
    {
      icon: CreditCard,
      name: "Stripe & SEPA Direct Debit",
      category: "Payments",
      description: "Automate recurring rent collection, security deposit holds, and instant payout disbursements.",
      status: "Available",
    },
    {
      icon: Key,
      name: "Smart Lock & Keyless Entry",
      category: "Access Control",
      description: "Integrate Nuki, Yale, and August smart locks to send automated pin codes for tenant check-ins.",
      status: "Available",
    },
    {
      icon: Shield,
      name: "ID & Background Verification",
      category: "Security",
      description: "Automated identity checks and credit background verification powered by Onfido and Sumsub.",
      status: "Available",
    },
    {
      icon: Cpu,
      name: "Property Management API",
      category: "Developer API",
      description: "RESTful API and webhooks for custom ERP, CRM, and PMS software integration.",
      status: "Beta Access",
    },
    {
      icon: RefreshCw,
      name: "Accounting & QuickBooks",
      category: "Finance",
      description: "Export monthly rental statements, tax invoices, and expense reports to your accounting suite.",
      status: "Available",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Software Integrations & Channel Manager API"
        description="Connect EzzyStay with PMS property software, iCal calendar sync, Stripe payments, and smart lock hardware."
        canonicalUrl="https://ezzystay.com/integrations"
      />
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
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[14px]">
            Ecosystem
          </span>
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            EzzyStay Integrations
          </h1>
          <p className="text-[17px] md:text-[20px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Connect your favorite property management tools, calendars, and payment processors seamlessly.
          </p>
        </div>
      </section>

      {/* Grid */}
      <main className="max-w-[1100px] mx-auto px-[16px] py-[64px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px]">
          {integrations.map((item) => (
            <div
              key={item.name}
              className="bg-white border border-[#E5E7EB] rounded-[16px] p-[28px] hover:shadow-[0_8px_30px_rgba(8,145,178,0.08)] hover:border-[#0891B2]/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#E0F2FE] rounded-[12px] flex items-center justify-center">
                    <item.icon className="w-[24px] h-[24px] text-[#0891B2]" />
                  </div>
                  <span className="bg-[#DCFCE7] text-[#166534] text-[12px] font-semibold px-[10px] py-[3px] rounded-full">
                    {item.status}
                  </span>
                </div>
                <span className="text-[#0891B2] text-[12px] font-bold uppercase tracking-[0.05em]">
                  {item.category}
                </span>
                <h2 className="text-[#0F2D36] text-[18px] font-bold mt-[4px] mb-[8px]">
                  {item.name}
                </h2>
                <p className="text-[#6B7280] text-[14px] leading-[1.6]">
                  {item.description}
                </p>
              </div>

              <div className="mt-[20px] pt-[16px] border-t border-[#F1F5F9] text-right">
                <Link
                  to="/contact"
                  className="text-[#0891B2] text-[13px] font-semibold hover:text-[#0E7490] inline-flex items-center gap-[4px]"
                >
                  Contact Support <ArrowRight className="w-[13px] h-[13px]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
