import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { getStoredBlogs, type BlogPost } from "../utils/content-storage";
import heroBg from "../../assets/hero-bg.jpg";
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const all = getStoredBlogs();
    const found = all.find((b) => b.id === id);
    if (found) {
      setBlog(found);
      const related = all
        .filter((b) => b.id !== id && b.status === "published")
        .slice(0, 3);
      setRelatedBlogs(related);
    } else {
      setBlog(null);
    }
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between">
        <Header variant={isAuthenticated ? "dashboard" : "default"} dashboardButtonFilled={false} />
        <main className="max-w-[700px] mx-auto px-[16px] py-[96px] text-center">
          <BookOpen className="w-[48px] h-[48px] text-[#0891B2] mx-auto mb-[16px]" />
          <h1 className="text-[28px] font-bold text-[#0F2D36] mb-[8px]">
            Blog Post Not Found
          </h1>
          <p className="text-[#6B7280] text-[15px] mb-[28px]">
            The blog article you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/blog/tenants"
            className="inline-flex items-center gap-[8px] bg-[#0891B2] text-white px-[24px] py-[12px] rounded-[10px] font-bold text-[14px] hover:bg-[#0E7490] transition-colors"
          >
            <ArrowLeft className="w-[16px] h-[16px]" />
            Return to Blog
          </Link>
        </main>
        <Footer variant={isAuthenticated ? "dashboard" : "default"} />
      </div>
    );
  }

  const backLink = blog.audience === "landlord" ? "/blog/landlords" : "/blog/tenants";
  const backLabel = blog.audience === "landlord" ? "Landlord Blog" : "Tenant Blog";

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={blog.title}
        description={blog.excerpt || blog.content.slice(0, 160)}
        ogType="article"
        canonicalUrl={`https://ezzystay.com/blog/${blog.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blog.title,
          "description": blog.excerpt || blog.content.slice(0, 160),
          "author": {
            "@type": "Organization",
            "name": blog.author || "EzzyStay Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "EzzyStay",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ezzystay.com/favicon.png"
            }
          },
          "datePublished": blog.createdAt,
          "mainEntityOfPage": `https://ezzystay.com/blog/${blog.id}`
        }}
      />
      <Header variant={isAuthenticated ? "dashboard" : "default"} dashboardButtonFilled={false} />

      {/* Hero / Header Section */}
      <section
        className="relative min-h-[340px] md:min-h-[400px] flex items-center justify-center text-center bg-cover bg-center py-[56px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20 max-w-[850px] px-[16px] text-white flex flex-col items-center">
          {/* Breadcrumb navigation */}
          <Link
            to={backLink}
            className="inline-flex items-center gap-[6px] text-white/80 hover:text-white text-[13px] font-medium mb-[20px] bg-white/10 backdrop-blur-md px-[14px] py-[6px] rounded-full transition-colors"
          >
            <ArrowLeft className="w-[14px] h-[14px]" />
            Back to {backLabel}
          </Link>

          <span className="inline-block bg-[#0891B2] text-white text-[12px] font-bold uppercase tracking-[0.05em] px-[12px] py-[4px] rounded-full mb-[16px]">
            {blog.category}
          </span>

          <h1 className="text-[28px] md:text-[44px] font-bold tracking-tight mb-[16px] leading-[1.2]">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-[16px] text-[13px] text-white/90 font-medium">
            <span className="flex items-center gap-[6px]">
              <User className="w-[14px] h-[14px] text-[#38BDF8]" />
              {blog.author}
            </span>
            <span>•</span>
            <span className="flex items-center gap-[6px]">
              <Calendar className="w-[14px] h-[14px] text-[#38BDF8]" />
              {blog.createdAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-[6px]">
              <Clock className="w-[14px] h-[14px] text-[#38BDF8]" />
              {blog.readTime}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-[800px] mx-auto px-[16px] py-[64px]">
        {/* Article Summary Box */}
        <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-[18px] p-[24px] md:p-[28px] mb-[40px]">
          <h2 className="text-[#0891B2] text-[13px] font-bold uppercase tracking-[0.05em] mb-[8px]">
            Article Overview
          </h2>
          <p className="text-[#0F2D36] text-[16px] md:text-[17px] leading-[1.65] font-medium">
            {blog.excerpt}
          </p>
        </div>

        {/* Full Content */}
        <article className="prose max-w-none text-[#374151] text-[16px] md:text-[17px] leading-[1.85] space-y-[24px] whitespace-pre-wrap">
          {blog.content}
        </article>

        {/* Share & Actions Bar */}
        <div className="mt-[48px] pt-[24px] border-t border-[#E5E7EB] flex items-center justify-between">
          <Link
            to={backLink}
            className="inline-flex items-center gap-[8px] text-[#0891B2] font-semibold text-[14px] hover:text-[#0E7490] transition-colors"
          >
            <ArrowLeft className="w-[16px] h-[16px]" />
            Back to All {backLabel} Posts
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-[6px] bg-[#F8FAFB] border border-[#E5E7EB] px-[16px] py-[8px] rounded-[10px] text-[13px] font-semibold text-[#4B5563] hover:border-[#0891B2] hover:text-[#0891B2] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-[14px] h-[14px] text-[#16A34A]" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-[14px] h-[14px]" />
                Share Article
              </>
            )}
          </button>
        </div>

        {/* Related Articles */}
        {relatedBlogs.length > 0 && (
          <section className="mt-[64px] pt-[40px] border-t border-[#E5E7EB]">
            <h2 className="text-[#0F2D36] text-[22px] font-bold mb-[24px]">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px]">
              {relatedBlogs.map((item) => (
                <Link
                  key={item.id}
                  to={`/blog/${item.id}`}
                  className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[14px] p-[20px] hover:shadow-[0_6px_24px_rgba(8,145,178,0.08)] hover:border-[#0891B2]/30 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <span className="text-[#0891B2] text-[11px] font-bold uppercase mb-[6px] block">
                      {item.category}
                    </span>
                    <h3 className="text-[#0F2D36] text-[15px] font-bold leading-[1.4] mb-[8px] group-hover:text-[#0891B2] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                  <div className="text-[12px] text-[#9CA3AF] mt-[12px] flex items-center gap-[4px] font-semibold text-[#0891B2]">
                    Read <ArrowRight className="w-[12px] h-[12px]" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
