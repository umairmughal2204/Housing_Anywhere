import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react";

export function Cookies() {
  const { isAuthenticated } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const cookieTypes = [
    {
      icon: Shield,
      name: "Essential Cookies",
      purpose: "Required for the website to function properly. Cannot be disabled.",
      examples: "Session management, security tokens, login authentication, CSRF protection, load balancing.",
      duration: "Session — 1 year",
      color: "#059669",
    },
    {
      icon: Settings,
      name: "Functional Cookies",
      purpose: "Remember your preferences and provide enhanced features.",
      examples: "Language preferences, region selection, saved search filters, display preferences, recently viewed listings.",
      duration: "1 month — 1 year",
      color: "#0891B2",
    },
    {
      icon: BarChart3,
      name: "Analytics Cookies",
      purpose: "Help us understand how visitors interact with the website to improve our services.",
      examples: "Page visit counts, traffic sources, bounce rates, popular search terms, feature usage tracking.",
      duration: "30 days — 2 years",
      color: "#7C3AED",
    },
    {
      icon: Target,
      name: "Marketing Cookies",
      purpose: "Used to deliver relevant advertisements and measure campaign effectiveness.",
      examples: "Ad targeting, retargeting pixels, social media sharing, conversion tracking, campaign attribution.",
      duration: "30 days — 1 year",
      color: "#EA580C",
    },
  ];

  const sections = [
    {
      id: "what",
      title: "What Are Cookies?",
      content: `Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work efficiently, provide a better user experience, and give website owners useful information. Cookies can be "first-party" (set by the website you're visiting) or "third-party" (set by a different domain). They can also be "session cookies" (deleted when you close your browser) or "persistent cookies" (stored until they expire or you delete them).`,
    },
    {
      id: "how",
      title: "How We Use Cookies",
      content: `EzzyStay uses cookies and similar technologies (such as web beacons, pixels, and local storage) to: keep you signed in to your account; remember your search preferences and filters; understand how you navigate and use our platform; measure the effectiveness of our marketing campaigns; protect against fraud and ensure security; and improve our services based on usage patterns. We use both first-party cookies and carefully selected third-party cookies.`,
    },
    {
      id: "manage",
      title: "Managing Your Cookie Preferences",
      content: `You can control and manage cookies in several ways. Most web browsers allow you to manage cookies through their settings — you can block all cookies, accept all cookies, or selectively block certain types. Please note that blocking essential cookies may prevent you from using certain features of our website. You can also opt out of specific third-party cookies through industry opt-out tools such as the Digital Advertising Alliance (DAA) or the European Interactive Digital Advertising Alliance (EDAA). To modify your cookie preferences for EzzyStay, you can use our cookie consent banner that appears when you first visit our website.`,
    },
    {
      id: "updates",
      title: "Updates to This Policy",
      content: `We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for operational, legal, or regulatory reasons. When we make changes, we will update the "Last updated" date at the top of this policy. We encourage you to periodically review this page for the latest information on our cookie practices.`,
    },
    {
      id: "contact",
      title: "Contact Us",
      content: `If you have questions about our use of cookies or this Cookie Policy, please contact us at privacy@ezzystay.com or write to us at: EzzyStay B.V., Keizersgracht 520, 1017 EK Amsterdam, Netherlands.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Header Banner */}
      <section className="bg-[#0F2D36] text-white py-[56px] md:py-[72px] px-[16px] text-center">
        <Cookie className="w-[40px] h-[40px] mx-auto mb-[16px] text-[#0891B2]" />
        <h1 className="text-[32px] md:text-[48px] font-bold tracking-tight mb-[12px]">
          Cookie Policy
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/80 max-w-[550px] mx-auto leading-[1.5]">
          How and why we use cookies on our platform.
        </p>
        <p className="text-[13px] text-white/50 mt-[16px]">
          Last updated: August 1, 2026
        </p>
      </section>

      {/* Cookie Types */}
      <section className="max-w-[1000px] mx-auto px-[16px] py-[72px]">
        <h2 className="text-[#0F2D36] text-[28px] md:text-[36px] font-bold text-center mb-[12px]">
          Types of Cookies We Use
        </h2>
        <p className="text-[#6B7280] text-[16px] md:text-[17px] text-center max-w-[600px] mx-auto mb-[48px] leading-[1.6]">
          We use different categories of cookies for different purposes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
          {cookieTypes.map((cookie) => (
            <div
              key={cookie.name}
              className="border border-[#E5E7EB] rounded-[16px] p-[28px] hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] transition-all duration-300"
            >
              <div className="flex items-center gap-[12px] mb-[14px]">
                <div
                  className="w-[44px] h-[44px] rounded-[11px] flex items-center justify-center"
                  style={{ backgroundColor: `${cookie.color}15` }}
                >
                  <cookie.icon
                    className="w-[22px] h-[22px]"
                    style={{ color: cookie.color }}
                  />
                </div>
                <h3 className="text-[#0F2D36] text-[17px] font-bold">
                  {cookie.name}
                </h3>
              </div>
              <p className="text-[#4B5563] text-[14px] leading-[1.6] mb-[12px]">
                {cookie.purpose}
              </p>
              <div className="space-y-[8px] text-[13px]">
                <div>
                  <span className="font-semibold text-[#374151]">Examples: </span>
                  <span className="text-[#6B7280]">{cookie.examples}</span>
                </div>
                <div>
                  <span className="font-semibold text-[#374151]">Duration: </span>
                  <span className="text-[#6B7280]">{cookie.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Content Sections */}
      <main className="max-w-[800px] mx-auto px-[16px] pb-[72px]">
        <div className="space-y-[40px]">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-[120px]"
            >
              <h2 className="text-[#0F2D36] text-[20px] md:text-[22px] font-bold mb-[12px] pb-[10px] border-b border-[#E5E7EB]">
                {section.title}
              </h2>
              <p className="text-[#4B5563] text-[15px] leading-[1.8]">
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
