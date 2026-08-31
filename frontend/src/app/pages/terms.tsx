import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";

export function Terms() {
  const { isAuthenticated } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: `By accessing or using EzzyStay's website, mobile applications, or any other services (collectively, the "Services"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree to these Terms, you may not access or use the Services. We reserve the right to modify these Terms at any time, and your continued use of the Services after any such modification constitutes your acceptance of the modified Terms.`,
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      content: `You must be at least 18 years of age to use the Services. By using the Services, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into a binding agreement. If you are using the Services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.`,
    },
    {
      id: "accounts",
      title: "3. User Accounts",
      content: `To access certain features of the Services, you must create an account. You agree to provide accurate, current, and complete information during registration and to update your information to keep it accurate. You are responsible for safeguarding your password and for all activities that occur under your account. You agree to immediately notify EzzyStay of any unauthorized use of your account. EzzyStay reserves the right to disable any account at any time for any reason, including violation of these Terms.`,
    },
    {
      id: "listings",
      title: "4. Property Listings",
      content: `Landlords are solely responsible for the accuracy and completeness of their listing information, including descriptions, photos, pricing, and availability. EzzyStay does not verify or guarantee the accuracy of listings. By posting a listing, landlords represent and warrant that they have the legal right to rent the property and that the listing complies with all applicable laws and regulations. EzzyStay reserves the right to remove any listing that violates these Terms or is deemed inappropriate.`,
    },
    {
      id: "bookings",
      title: "5. Bookings & Payments",
      content: `When a tenant submits a rental application and it is approved by the landlord, a binding rental agreement is created between the tenant and landlord. EzzyStay acts as a platform facilitator and is not a party to any rental agreement. All payments are processed through our secure payment system. Service fees are non-refundable unless otherwise stated. Tenants agree to pay rent and any applicable fees on time as specified in their rental agreement.`,
    },
    {
      id: "cancellation",
      title: "6. Cancellation Policy",
      content: `Cancellation policies vary by listing and are set by the landlord. Tenants should review the cancellation policy before submitting a rental application. In general: cancellations made 30+ days before move-in may receive a full refund of the first month's rent (minus service fees); cancellations made 14-29 days before move-in may receive a 50% refund; cancellations made less than 14 days before move-in are non-refundable. The service fee is non-refundable in all cases.`,
    },
    {
      id: "conduct",
      title: "7. User Conduct",
      content: `You agree not to: (a) use the Services for any unlawful purpose; (b) post false, misleading, or fraudulent content; (c) harass, abuse, or harm other users; (d) attempt to gain unauthorized access to other accounts or systems; (e) use automated tools to scrape or collect data from the Services; (f) circumvent any security or authentication measures; (g) engage in any activity that interferes with or disrupts the Services. Violation of these rules may result in account termination.`,
    },
    {
      id: "ip",
      title: "8. Intellectual Property",
      content: `All content, features, and functionality of the Services, including but not limited to text, graphics, logos, icons, images, and software, are the exclusive property of EzzyStay or its licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content on the Services without prior written consent from EzzyStay.`,
    },
    {
      id: "liability",
      title: "9. Limitation of Liability",
      content: `To the maximum extent permitted by applicable law, EzzyStay shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising out of or related to your use of the Services. EzzyStay's total liability for any claim arising from the Services shall not exceed the amount paid by you to EzzyStay in the 12 months preceding the claim. EzzyStay does not guarantee the condition, legality, or suitability of any listed property.`,
    },
    {
      id: "dispute",
      title: "10. Dispute Resolution",
      content: `Any disputes arising from these Terms or the Services shall first be attempted to be resolved through good-faith negotiation. If the dispute cannot be resolved within 30 days, it shall be submitted to binding arbitration in accordance with the rules of the Netherlands Arbitration Institute. The arbitration shall be conducted in English in Amsterdam, Netherlands. Each party shall bear its own costs. Nothing in this section shall prevent either party from seeking injunctive relief in a court of competent jurisdiction.`,
    },
    {
      id: "governing",
      title: "11. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the Netherlands, without regard to its conflict of law provisions. You consent to the exclusive jurisdiction of the courts located in Amsterdam, Netherlands for any actions not subject to arbitration.`,
    },
    {
      id: "contact",
      title: "12. Contact Information",
      content: `If you have any questions about these Terms & Conditions, please contact us at legal@ezzystay.com or write to us at: EzzyStay B.V., Keizersgracht 520, 1017 EK Amsterdam, Netherlands.`,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Terms & Conditions"
        description="Review the terms and conditions governing the use of EzzyStay housing platform services."
        canonicalUrl="https://ezzystay.com/terms"
      />
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Header Banner */}
      <section className="bg-[#0F2D36] text-white py-[56px] md:py-[72px] px-[16px] text-center">
        <h1 className="text-[32px] md:text-[48px] font-bold tracking-tight mb-[12px]">
          Terms & Conditions
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/80 max-w-[550px] mx-auto leading-[1.5]">
          Please read these terms carefully before using EzzyStay.
        </p>
        <p className="text-[13px] text-white/50 mt-[16px]">
          Last updated: August 1, 2026
        </p>
      </section>

      {/* Table of Contents */}
      <section className="max-w-[800px] mx-auto px-[16px] py-[40px]">
        <nav className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[14px] p-[24px] md:p-[32px]">
          <h2 className="text-[#0F2D36] text-[18px] font-bold mb-[16px]">
            Table of Contents
          </h2>
          <ol className="space-y-[8px]">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="text-left text-[#0891B2] text-[14px] md:text-[15px] hover:text-[#0E7490] transition-colors hover:underline cursor-pointer"
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {/* Content */}
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
