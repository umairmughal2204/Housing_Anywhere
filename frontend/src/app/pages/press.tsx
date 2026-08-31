import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import heroBg from "../../assets/hero-bg.jpg";
import { Newspaper, Mail, Download, Info } from "lucide-react";

export function Press() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Press & Media | Newsroom & Resources"
        description="Official EzzyStay press announcements, brand assets, newsroom updates, and media contact info."
        canonicalUrl="https://ezzystay.com/press"
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
          <span className="text-[12px] uppercase tracking-[0.25em] font-bold text-white/80 mb-[16px]">
            Press Center
          </span>
          <h1 className="text-[32px] md:text-[54px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            Press & Media
          </h1>
          <p className="text-[17px] md:text-[21px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Official announcements, media inquiries, and brand resources for EzzyStay.
          </p>
        </div>
      </section>

      {/* Main Content Area - Honest Press Room */}
      <main className="max-w-[850px] mx-auto px-[16px] py-[72px]">
        <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-[32px] md:p-[48px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center mb-[48px]">
          <div className="w-[60px] h-[60px] bg-[#E0F2FE] rounded-full flex items-center justify-center mx-auto mb-[20px]">
            <Newspaper className="w-[28px] h-[28px] text-[#0891B2]" />
          </div>
          <h2 className="text-[#0F2D36] text-[24px] md:text-[28px] font-bold mb-[12px]">
            Official News & Press Releases
          </h2>
          <p className="text-[#6B7280] text-[15px] leading-[1.6] max-w-[540px] mx-auto mb-[28px]">
            All official announcements, company news, and market updates will be published right here in our press room.
          </p>
          <div className="inline-flex items-center gap-[8px] bg-[#F8FAFB] border border-[#E5E7EB] px-[20px] py-[10px] rounded-[10px] text-[14px] text-[#4B5563]">
            <Info className="w-[16px] h-[16px] text-[#0891B2]" />
            No active press releases published yet. Check back soon!
          </div>
        </div>

        {/* Media Contact Section */}
        <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[20px] p-[32px] md:p-[40px] text-center">
          <h2 className="text-[#0F2D36] text-[22px] md:text-[26px] font-bold mb-[12px]">
            Media & Press Inquiries
          </h2>
          <p className="text-[#6B7280] text-[15px] leading-[1.6] max-w-[500px] mx-auto mb-[28px]">
            Are you a journalist or media representative looking for information, interview requests, or official statements? Reach out to our communications team.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-[16px]">
            <a
              href="mailto:press@ezzystay.com"
              className="flex items-center gap-[8px] bg-[#0891B2] text-white px-[28px] py-[13px] rounded-[10px] font-bold text-[15px] hover:bg-[#0E7490] transition-colors"
            >
              <Mail className="w-[18px] h-[18px]" />
              press@ezzystay.com
            </a>
          </div>
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
