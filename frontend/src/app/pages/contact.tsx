import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { SEO } from "../components/seo";
import { useAuth } from "../contexts/auth-context";
import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";

import { API_BASE } from "../config";

export function Contact() {
  const { isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    userType: "tenant",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Contact Us | 24/7 Customer Support"
        description="Have questions or need assistance? Reach out to EzzyStay support team 24/7."
        canonicalUrl="https://ezzystay.com/contact"
      />
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Header Banner */}
      <section className="bg-[#0F2D36] text-white py-[56px] md:py-[72px] px-[16px] text-center rounded-b-[40px] md:rounded-b-[56px] shadow-[0_12px_32px_rgba(15,45,54,0.12)]">
        <h1 className="text-[32px] md:text-[48px] font-bold tracking-tight mb-[12px]">
          Contact Us
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/80 max-w-[550px] mx-auto leading-[1.5]">
          Have questions or need assistance? We're here to help you 24/7.
        </p>
      </section>

      <main className="max-w-[1100px] mx-auto px-[16px] py-[64px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[40px]">
          {/* Left - Contact Details */}
          <div className="space-y-[24px]">
            <h2 className="text-[#0F2D36] text-[24px] font-bold mb-[8px]">
              Get in Touch
            </h2>
            <p className="text-[#6B7280] text-[15px] leading-[1.6] mb-[24px]">
              Reach out through any of our channels below. Our support team responds within 2 hours.
            </p>

            <div className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[14px] p-[20px] space-y-[20px]">
              <div className="flex items-start gap-[14px]">
                <div className="w-[40px] h-[40px] bg-[#E0F2FE] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-[20px] h-[20px] text-[#0891B2]" />
                </div>
                <div>
                  <h3 className="text-[#0F2D36] text-[15px] font-bold">Email Us</h3>
                  <a href="mailto:support@ezzystay.com" className="text-[#0891B2] text-[14px] hover:underline">
                    support@ezzystay.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-[14px]">
                <div className="w-[40px] h-[40px] bg-[#E0F2FE] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-[20px] h-[20px] text-[#0891B2]" />
                </div>
                <div>
                  <h3 className="text-[#0F2D36] text-[15px] font-bold">Call Us</h3>
                  <p className="text-[#4B5563] text-[14px]">+31 (0) 20 123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-[14px]">
                <div className="w-[40px] h-[40px] bg-[#E0F2FE] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-[20px] h-[20px] text-[#0891B2]" />
                </div>
                <div>
                  <h3 className="text-[#0F2D36] text-[15px] font-bold">Headquarters</h3>
                  <p className="text-[#4B5563] text-[14px] leading-[1.5]">
                    Keizersgracht 520, 1017 EK Amsterdam, Netherlands
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-[14px]">
                <div className="w-[40px] h-[40px] bg-[#E0F2FE] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-[20px] h-[20px] text-[#0891B2]" />
                </div>
                <div>
                  <h3 className="text-[#0F2D36] text-[15px] font-bold">Support Hours</h3>
                  <p className="text-[#4B5563] text-[14px]">
                    Monday – Sunday: 24/7 Support
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[20px] p-[28px] md:p-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            {submitted ? (
              <div className="text-center py-[48px]">
                <div className="w-[64px] h-[64px] bg-[#DCFCE7] rounded-full flex items-center justify-center mx-auto mb-[20px]">
                  <CheckCircle className="w-[32px] h-[32px] text-[#16A34A]" />
                </div>
                <h3 className="text-[#0F2D36] text-[24px] font-bold mb-[10px]">
                  Message Received!
                </h3>
                <p className="text-[#6B7280] text-[16px] max-w-[450px] mx-auto mb-[24px]">
                  Thank you for reaching out. Our support team will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-[#0891B2] text-white px-[24px] py-[10px] rounded-[10px] font-bold text-[14px] hover:bg-[#0E7490] transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-[20px]">
                <h2 className="text-[#0F2D36] text-[22px] font-bold mb-[4px]">
                  Send a Message
                </h2>
                <p className="text-[#6B7280] text-[14px] mb-[20px]">
                  Fill out the form below and we will get back to you within 2 hours.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[#374151] text-[14px] font-medium mb-[6px]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#0891B2] text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#374151] text-[14px] font-medium mb-[6px]">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#0891B2] text-[14px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[#374151] text-[14px] font-medium mb-[6px]">
                      I am a...
                    </label>
                    <select
                      value={formData.userType}
                      onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                      className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#0891B2] text-[14px] bg-white"
                    >
                      <option value="tenant">Tenant looking for housing</option>
                      <option value="landlord">Landlord / Property Owner</option>
                      <option value="partner">Potential Partner</option>
                      <option value="press">Media / Journalist</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#374151] text-[14px] font-medium mb-[6px]">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Booking assistance"
                      className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#0891B2] text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#374151] text-[14px] font-medium mb-[6px]">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we help you?"
                    className="w-full px-[14px] py-[10px] rounded-[10px] border border-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#0891B2] text-[14px] resize-none"
                  />
                </div>

                {errorMsg && (
                  <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-[14px] p-[14px] rounded-[10px] mb-[16px]">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-[8px] bg-[#0891B2] text-white px-[32px] py-[12px] rounded-[10px] font-bold text-[15px] hover:bg-[#0E7490] disabled:bg-[#94A3B8] transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-[16px] h-[16px] border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-[16px] h-[16px]" />
                      Submit Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
