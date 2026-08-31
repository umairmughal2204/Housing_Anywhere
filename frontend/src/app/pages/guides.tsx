import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getStoredArticles, type ArticleGuide } from "../utils/content-storage";
import heroBg from "../../assets/hero-bg.jpg";
import { ArrowRight, X, FileText, BookOpen } from "lucide-react";

export function Guides() {
  const { isAuthenticated } = useAuth();
  const [guides, setGuides] = useState<ArticleGuide[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getStoredArticles();
      setGuides(all.filter((a) => a.status === "published"));
    };
    load();

    window.addEventListener("ezzy_content_updated", load);
    return () => window.removeEventListener("ezzy_content_updated", load);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="How-To Guides & Rental Tutorials"
        description="Comprehensive step-by-step guides for renting, listing properties, tenant safety, and housing contracts."
        canonicalUrl="https://ezzystay.com/guides"
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
            Knowledge Base
          </span>
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            How-to Guides & Articles
          </h1>
          <p className="text-[17px] md:text-[20px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Practical tutorials and expert guides published by our Super Admin team to help you navigate housing.
          </p>
        </div>
      </section>

      {/* Grid of Guides */}
      <main className="max-w-[1100px] mx-auto px-[16px] py-[64px]">
        {guides.length === 0 ? (
          <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[20px] p-[48px] text-center max-w-[600px] mx-auto">
            <BookOpen className="w-[40px] h-[40px] text-[#0891B2] mx-auto mb-[16px]" />
            <h2 className="text-[20px] font-bold text-[#0F2D36] mb-[8px]">
              No Guides Published Yet
            </h2>
            <p className="text-[#6B7280] text-[15px] mb-[24px]">
              Our team is preparing comprehensive guides. Need assistance in the meantime?
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-[8px] bg-[#0891B2] text-white px-[24px] py-[11px] rounded-[10px] text-[14px] font-bold hover:bg-[#0E7490] transition-colors"
            >
              Contact Support Team
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[28px]">
            {guides.map((g) => (
              <Link
                key={g.id}
                to={`/guide/${g.id}`}
                className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(8,145,178,0.08)] hover:border-[#0891B2]/30 transition-all duration-300 group cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-[12px]">
                    <span className="text-[#0891B2] text-[12px] font-bold uppercase tracking-[0.05em]">
                      {g.category}
                    </span>
                    <span className="text-[12px] text-[#9CA3AF] font-medium">{g.readTime}</span>
                  </div>
                  <h2 className="text-[#0F2D36] text-[18px] font-bold leading-[1.35] mb-[10px] group-hover:text-[#0891B2] transition-colors">
                    {g.title}
                  </h2>
                  <p className="text-[#6B7280] text-[14px] leading-[1.6] mb-[20px]">
                    {g.summary}
                  </p>
                </div>

                <div className="pt-[16px] border-t border-[#F1F5F9] flex items-center justify-end text-[14px] font-semibold text-[#0891B2]">
                  <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-[4px]">
                    Read Guide <ArrowRight className="w-[14px] h-[14px]" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
