import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { getStoredBlogs, type BlogPost } from "../utils/content-storage";
import heroBg from "../../assets/hero-bg.jpg";
import { Calendar, User, ArrowRight, X, BookOpen } from "lucide-react";

export function BlogLandlords() {
  const { isAuthenticated } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    const load = () => {
      const all = getStoredBlogs();
      setBlogs(all.filter((b) => b.audience === "landlord" && b.status === "published"));
    };
    load();

    window.addEventListener("ezzy_content_updated", load);
    return () => window.removeEventListener("ezzy_content_updated", load);
  }, []);

  const featured = blogs[0];
  const regularList = blogs.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Landlord Blog & Property Management Guide"
        description="Insights, property management advice, tenant screening best practices, and rental laws for landlords."
        canonicalUrl="https://ezzystay.com/blog/landlords"
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
            Property Insights
          </span>
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-tight mb-[14px] leading-[1.15]">
            Blog for Landlords
          </h1>
          <p className="text-[17px] md:text-[20px] font-medium text-white/90 max-w-[600px] leading-[1.5]">
            Market analysis, yield strategies, and property management insights published by our team.
          </p>
        </div>
      </section>

      <main className="max-w-[1100px] mx-auto px-[16px] py-[64px]">
        {blogs.length === 0 ? (
          <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[20px] p-[48px] text-center">
            <BookOpen className="w-[40px] h-[40px] text-[#0891B2] mx-auto mb-[16px]" />
            <h2 className="text-[20px] font-bold text-[#0F2D36] mb-[8px]">
              No Landlord Posts Published Yet
            </h2>
            <p className="text-[#6B7280] text-[15px]">
              Check back soon for new landlord market insights published by our team!
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-[20px] p-[28px] md:p-[40px] mb-[48px] flex flex-col lg:flex-row gap-[32px] items-center">
                <div className="flex-1">
                  <span className="inline-block bg-[#0891B2] text-white text-[12px] font-bold uppercase tracking-[0.05em] px-[12px] py-[4px] rounded-full mb-[16px]">
                    {featured.category}
                  </span>
                  <h2 className="text-[#0F2D36] text-[24px] md:text-[32px] font-bold leading-[1.25] mb-[14px]">
                    {featured.title}
                  </h2>
                  <p className="text-[#4B5563] text-[16px] leading-[1.6] mb-[20px]">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center gap-[16px] text-[13px] text-[#6B7280] mb-[24px]">
                    <span className="flex items-center gap-[6px]">
                      <User className="w-[14px] h-[14px] text-[#0891B2]" />
                      {featured.author}
                    </span>
                    <span className="flex items-center gap-[6px]">
                      <Calendar className="w-[14px] h-[14px] text-[#0891B2]" />
                      {featured.createdAt}
                    </span>
                    <span>{featured.readTime}</span>
                  </div>
                  <Link
                    to={`/blog/${featured.id}`}
                    className="inline-flex items-center gap-[8px] bg-[#0891B2] text-white px-[24px] py-[12px] rounded-[10px] font-bold text-[14px] hover:bg-[#0E7490] transition-colors"
                  >
                    Read Full Article
                    <ArrowRight className="w-[16px] h-[16px]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Regular Grid */}
            {regularList.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[28px]">
                {regularList.map((art) => (
                  <Link
                    key={art.id}
                    to={`/blog/${art.id}`}
                    className="bg-white border border-[#E5E7EB] rounded-[16px] p-[24px] flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(8,145,178,0.08)] hover:border-[#0891B2]/30 transition-all duration-300 group cursor-pointer"
                  >
                    <div>
                      <span className="inline-block text-[#0891B2] text-[12px] font-bold uppercase tracking-[0.05em] mb-[10px]">
                        {art.category}
                      </span>
                      <h3 className="text-[#0F2D36] text-[18px] font-bold leading-[1.35] mb-[10px] group-hover:text-[#0891B2] transition-colors">
                        {art.title}
                      </h3>
                      <p className="text-[#6B7280] text-[14px] leading-[1.6] mb-[20px]">
                        {art.excerpt}
                      </p>
                    </div>

                    <div className="pt-[16px] border-t border-[#F1F5F9] flex items-center justify-between text-[13px] text-[#6B7280]">
                      <span>{art.createdAt}</span>
                      <span className="font-medium text-[#0891B2] group-hover:translate-x-1 transition-transform inline-flex items-center gap-[4px]">
                        Read Article <ArrowRight className="w-[14px] h-[14px]" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
