import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import heroBg from "../../assets/hero-bg.jpg";
import { Star, Quote, Building2, MapPin, TrendingUp, Users } from "lucide-react";

export function SuccessStories() {
  const { isAuthenticated } = useAuth();

  const stories = [
    {
      name: "Jean-Luc Dupont",
      role: "Private Landlord • 8 Apartments",
      location: "Paris, France",
      quote:
        "Switching to EzzyStay reduced my vacancy rates to zero. The tenant screening process is top-notch, and the automated rent payout feature saves me hours every month.",
      metric: "0% Vacancy",
      metricLabel: "Across 8 units for 2 years",
    },
    {
      name: "Klara Lindqvist",
      role: "Property Manager",
      location: "Stockholm, Sweden",
      quote:
        "The digital contract signing and instant messaging transformed how we communicate with international tenants. Everything is clear, secure, and compliant.",
      metric: "+45% Income",
      metricLabel: "Increase in rental revenue",
    },
    {
      name: "Marco Rossi",
      role: "Portfolio Owner • 15 Units",
      location: "Milan, Italy",
      quote:
        "EzzyStay Rent Guarantee gave me the confidence to expand my portfolio. Knowing my monthly payouts are 100% guaranteed removes all stress.",
      metric: "100% On-Time",
      metricLabel: "Rent payouts guaranteed",
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
        className="relative min-h-[360px] md:min-h-[420px] flex items-center justify-center text-center bg-cover bg-center py-[64px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 max-w-[800px] px-[16px] text-white flex flex-col items-center">
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[14px]">
            Landlord Spotlights
          </span>
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            Success Stories
          </h1>
          <p className="text-[17px] md:text-[20px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            See how property owners across Europe grow their income and simplify management with EzzyStay.
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <main className="max-w-[1100px] mx-auto px-[16px] py-[64px]">
        <div className="space-y-[32px]">
          {stories.map((s, i) => (
            <div
              key={i}
              className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[20px] p-[28px] md:p-[40px] flex flex-col md:flex-row gap-[32px] items-start md:items-center hover:shadow-[0_8px_30px_rgba(8,145,178,0.08)] transition-all duration-300"
            >
              <div className="flex-1">
                <Quote className="w-[36px] h-[36px] text-[#0891B2]/30 mb-[16px]" />
                <p className="text-[#0F2D36] text-[18px] md:text-[20px] font-medium leading-[1.6] mb-[20px] italic">
                  "{s.quote}"
                </p>
                <div>
                  <h2 className="text-[#0F2D36] text-[17px] font-bold">
                    {s.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-[12px] text-[13px] text-[#6B7280] mt-[2px]">
                    <span className="font-medium">{s.role}</span>
                    <span className="flex items-center gap-[4px]">
                      <MapPin className="w-[12px] h-[12px] text-[#0891B2]" />
                      {s.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metric Card */}
              <div className="w-full md:w-[220px] bg-white border border-[#CCFBF1] rounded-[16px] p-[24px] text-center flex-shrink-0">
                <div className="text-[32px] font-bold text-[#0891B2] mb-[4px]">
                  {s.metric}
                </div>
                <div className="text-[#6B7280] text-[13px] font-medium">
                  {s.metricLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
