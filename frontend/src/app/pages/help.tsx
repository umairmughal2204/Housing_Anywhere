import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Search, Mail, Phone, MessageCircle, FileText, HelpCircle } from "lucide-react";

export function Help() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0891B2] to-[#0E7490] text-white py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px] text-center">
          <h1 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
            Help Center
          </h1>
          <p className="text-[20px] text-white/90 max-w-[720px] mx-auto mb-[32px] leading-[1.6]">
            Find answers to common questions or contact our support team
          </p>
          
          {/* Search */}
          <div className="max-w-[600px] mx-auto">
            <div className="flex items-center gap-[12px] bg-white p-[16px]">
              <Search className="w-[20px] h-[20px] text-[#6B6B6B]" />
              <input
                type="text"
                placeholder="Search for help..."
                className="flex-1 outline-none text-[#1A1A1A] placeholder:text-[#6B6B6B]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <h2 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[48px] text-center">
            Get in Touch
          </h2>
          
          <div className="grid grid-cols-3 gap-[32px] mb-[64px]">
            <div className="bg-neutral-light-gray p-[32px] text-center hover:bg-brand-primary-light transition-colors cursor-pointer">
              <div className="w-[56px] h-[56px] flex items-center justify-center mx-auto mb-[24px] bg-brand-primary">
                <MessageCircle className="w-[28px] h-[28px] text-white" />
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Live Chat
              </h3>
              <p className="text-neutral-gray text-[14px] mb-[16px]">
                Chat with our support team
              </p>
              <p className="text-neutral-black text-[13px] font-semibold">
                Available 24/7
              </p>
            </div>

            <div className="bg-neutral-light-gray p-[32px] text-center hover:bg-brand-primary-light transition-colors cursor-pointer">
              <div className="w-[56px] h-[56px] flex items-center justify-center mx-auto mb-[24px] bg-brand-primary">
                <Mail className="w-[28px] h-[28px] text-white" />
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Email Support
              </h3>
              <p className="text-neutral-gray text-[14px] mb-[16px]">
                support@easyrent.com
              </p>
              <p className="text-neutral-black text-[13px] font-semibold">
                Response within 2 hours
              </p>
            </div>

            <div className="bg-neutral-light-gray p-[32px] text-center hover:bg-brand-primary-light transition-colors cursor-pointer">
              <div className="w-[56px] h-[56px] flex items-center justify-center mx-auto mb-[24px] bg-brand-primary">
                <Phone className="w-[28px] h-[28px] text-white" />
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Phone Support
              </h3>
              <p className="text-neutral-gray text-[14px] mb-[16px]">
                +31 20 123 4567
              </p>
              <p className="text-neutral-black text-[13px] font-semibold">
                Mon-Fri, 9am-6pm CET
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="bg-[#F7F7F9] py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <h2 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[48px] text-center">
            Popular Topics
          </h2>
          
          <div className="grid grid-cols-2 gap-[32px]">
            {/* For Tenants */}
            <div className="bg-white p-[32px]">
              <div className="flex items-center gap-[12px] mb-[24px]">
                <HelpCircle className="w-[24px] h-[24px] text-brand-primary" />
                <h3 className="text-neutral-black text-[20px] font-bold">
                  For Tenants
                </h3>
              </div>
              <div className="space-y-[16px]">
                {[
                  "How do I search for properties?",
                  "What is registration (Anmeldung)?",
                  "How does deposit protection work?",
                  "Can I view properties virtually?",
                  "What documents do I need to apply?",
                  "How long does approval take?",
                  "What if I need to cancel?",
                  "How do I pay my rent?",
                ].map((question, idx) => (
                  <button
                    key={idx}
                    className="block w-full text-left text-neutral-black text-[15px] hover:text-brand-primary transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* For Landlords */}
            <div className="bg-white p-[32px]">
              <div className="flex items-center gap-[12px] mb-[24px]">
                <FileText className="w-[24px] h-[24px] text-accent-blue" />
                <h3 className="text-neutral-black text-[20px] font-bold">
                  For Landlords
                </h3>
              </div>
              <div className="space-y-[16px]">
                {[
                  "How do I list my property?",
                  "What is the verification process?",
                  "How do I manage inquiries?",
                  "What are quick reply templates?",
                  "How does payment collection work?",
                  "What if a tenant doesn't pay?",
                  "How do I handle disputes?",
                  "Can I list multiple properties?",
                ].map((question, idx) => (
                  <button
                    key={idx}
                    className="block w-full text-left text-neutral-black text-[15px] hover:text-accent-blue transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Security */}
      <section className="py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <h2 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[48px] text-center">
            Safety & Security
          </h2>
          
          <div className="bg-[#F7F7F9] p-[48px]">
            <div className="max-w-[800px] mx-auto space-y-[24px]">
              <div>
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[12px]">
                  How we protect you
                </h3>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                  We employ bank-level encryption, identity verification for all users, 
                  escrow-based deposit protection, and 24/7 fraud monitoring to ensure 
                  your safety throughout the rental process.
                </p>
              </div>
              <div>
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[12px]">
                  Reporting suspicious activity
                </h3>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                  If you encounter any suspicious behavior, fake listings, or fraudulent 
                  requests, please report immediately to safety@easyrent.com. Our 
                  security team investigates all reports within 1 hour.
                </p>
              </div>
              <div>
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[12px]">
                  Data privacy
                </h3>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                  We are GDPR compliant and never share your personal information with 
                  third parties. All communication is encrypted end-to-end, and your 
                  payment details are processed through secure, PCI-compliant systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}