import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";

export function Privacy() {
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
      id: "overview",
      title: "1. Overview",
      content: `EzzyStay B.V. ("EzzyStay," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website, mobile applications, and related services (collectively, the "Services"). By using our Services, you consent to the practices described in this policy.`,
    },
    {
      id: "collection",
      title: "2. Information We Collect",
      subsections: [
        {
          subtitle: "Information You Provide",
          content: `Account registration data (name, email, phone number, date of birth), profile information, identity verification documents, property listing details, rental application information, payment and billing data, messages and communications with other users, customer support interactions, and survey or feedback responses.`,
        },
        {
          subtitle: "Information We Collect Automatically",
          content: `Device information (IP address, browser type, operating system), usage data (pages visited, features used, search queries), location data (with your permission), cookies and similar tracking technologies, and log data (access times, referring URLs, error reports).`,
        },
        {
          subtitle: "Information from Third Parties",
          content: `Social media profile data (when you sign in with social accounts), identity verification results, payment processor data, and public records or databases for fraud prevention.`,
        },
      ],
    },
    {
      id: "use",
      title: "3. How We Use Your Information",
      content: `We use your personal information to: provide, maintain, and improve the Services; process rental applications and payments; verify user identity and prevent fraud; communicate with you about your account, bookings, and updates; personalize your experience and provide relevant recommendations; send marketing communications (with your consent); comply with legal obligations; resolve disputes and enforce our terms; analyze usage trends to improve the platform; and ensure platform safety and security.`,
    },
    {
      id: "sharing",
      title: "4. How We Share Your Information",
      content: `We may share your information with: other users as necessary to facilitate rental transactions (e.g., sharing tenant profiles with landlords); payment processors to process transactions; identity verification services; cloud hosting and infrastructure providers; analytics and advertising partners; legal and regulatory authorities when required by law; professional advisors (lawyers, accountants, auditors); and in connection with a merger, acquisition, or sale of assets. We do not sell your personal information to third parties for their own marketing purposes.`,
    },
    {
      id: "cookies",
      title: "5. Cookies & Tracking",
      content: `We use cookies and similar technologies to remember your preferences, keep you logged in, analyze site traffic, and serve relevant content. You can control cookie preferences through your browser settings. For detailed information about the cookies we use, please see our Cookie Policy. Note that disabling certain cookies may affect the functionality of our Services.`,
    },
    {
      id: "retention",
      title: "6. Data Retention",
      content: `We retain your personal information for as long as your account is active or as needed to provide you with the Services. We may also retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements. When personal data is no longer needed, we will securely delete or anonymize it. Typical retention periods: account data (duration of account + 3 years), transaction data (7 years for tax compliance), marketing data (until consent is withdrawn), and log data (12 months).`,
    },
    {
      id: "rights",
      title: "7. Your Rights",
      content: `Depending on your jurisdiction, you may have the following rights regarding your personal data: Right of Access — request a copy of the personal data we hold about you; Right to Rectification — request correction of inaccurate or incomplete data; Right to Erasure — request deletion of your personal data; Right to Restrict Processing — request that we limit how we use your data; Right to Data Portability — receive your data in a structured, machine-readable format; Right to Object — object to processing based on legitimate interests or for marketing; Right to Withdraw Consent — withdraw previously given consent at any time. To exercise these rights, please contact us at privacy@ezzystay.com.`,
    },
    {
      id: "security",
      title: "8. Data Security",
      content: `We implement appropriate technical and organizational security measures to protect your personal information, including: encryption of data in transit (TLS/SSL) and at rest; regular security assessments and penetration testing; access controls and authentication mechanisms; employee training on data protection; incident response procedures; and regular backups. However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security of your data.`,
    },
    {
      id: "international",
      title: "9. International Data Transfers",
      content: `Your personal data may be transferred to and processed in countries outside your country of residence, including countries that may not provide the same level of data protection. When we transfer data internationally, we use appropriate safeguards such as Standard Contractual Clauses approved by the European Commission, adequacy decisions, or other legally approved mechanisms to ensure your data remains protected.`,
    },
    {
      id: "children",
      title: "10. Children's Privacy",
      content: `Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected personal data from a child without parental consent, we will take steps to delete that information. If you believe we have inadvertently collected information from a child, please contact us immediately.`,
    },
    {
      id: "changes",
      title: "11. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of material changes by posting the updated policy on our website and, where appropriate, by email. Your continued use of the Services after any changes constitutes your acceptance of the updated policy.`,
    },
    {
      id: "contact",
      title: "12. Contact Us",
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at: privacy@ezzystay.com — EzzyStay B.V., Keizersgracht 520, 1017 EK Amsterdam, Netherlands. For EU residents, you also have the right to lodge a complaint with your local data protection authority.`,
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
        <h1 className="text-[32px] md:text-[48px] font-bold tracking-tight mb-[12px]">
          Privacy Policy
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/80 max-w-[550px] mx-auto leading-[1.5]">
          How we collect, use, and protect your personal information.
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
              {section.content && (
                <p className="text-[#4B5563] text-[15px] leading-[1.8]">
                  {section.content}
                </p>
              )}
              {"subsections" in section &&
                section.subsections?.map((sub) => (
                  <div key={sub.subtitle} className="mt-[20px]">
                    <h3 className="text-[#0F2D36] text-[16px] font-bold mb-[8px]">
                      {sub.subtitle}
                    </h3>
                    <p className="text-[#4B5563] text-[15px] leading-[1.8]">
                      {sub.content}
                    </p>
                  </div>
                ))}
            </section>
          ))}
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
