import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Check, Search, Shield, MessageCircle, FileCheck, Clock } from "lucide-react";
import { Link } from "react-router";

export function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0891B2] to-[#0E7490] text-white py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px] text-center">
          <h1 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
            How It Works
          </h1>
          <p className="text-[20px] text-white/90 max-w-[720px] mx-auto leading-[1.6]">
            A simple, secure process designed for digital nomads, expatriates, and international students seeking mid-to-long-term housing.
          </p>
        </div>
      </section>

      {/* For Tenants */}
      <section className="py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <h2 className="text-neutral-black text-[36px] font-bold tracking-[-0.02em] mb-[48px] text-center">
            For Tenants
          </h2>

          <div className="grid grid-cols-3 gap-[48px] mb-[64px]">
            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-brand-primary text-white rounded-full flex items-center justify-center text-[28px] font-bold mx-auto mb-[24px]">
                1
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Search & Discover
              </h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Browse verified properties in your destination city. Filter by registration eligibility, duration, and amenities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-brand-primary text-white rounded-full flex items-center justify-center text-[28px] font-bold mx-auto mb-[24px]">
                2
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Apply & Connect
              </h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Message landlords securely, schedule viewings, and submit your rental application with verified documents.
              </p>
            </div>

            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-brand-primary text-white rounded-full flex items-center justify-center text-[28px] font-bold mx-auto mb-[24px]">
                3
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Sign & Move In
              </h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Review the legal lease agreement, pay securely with deposit held in escrow, and get your keys.
              </p>
            </div>
          </div>

          {/* Tenant Benefits */}
          <div className="bg-neutral-light-gray p-[48px]">
            <h3 className="text-neutral-black text-[24px] font-bold mb-[32px] text-center">
              Tenant Protection Benefits
            </h3>
            <div className="grid grid-cols-2 gap-[24px]">
              {[
                {
                  icon: Shield,
                  title: "Verified Properties Only",
                  description: "Every landlord undergoes identity verification and background checks.",
                },
                {
                  icon: FileCheck,
                  title: "Legal Lease Agreements",
                  description: "Standardized contracts compliant with local housing regulations.",
                },
                {
                  icon: MessageCircle,
                  title: "Secure Communication",
                  description: "End-to-end encrypted messaging with property details always visible.",
                },
                {
                  icon: Clock,
                  title: "24/7 Support",
                  description: "Dispute resolution and assistance throughout your rental period.",
                },
              ].map((benefit, idx) => (
                <div key={idx} className="flex gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-accent-blue flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-[24px] h-[24px] text-white" />
                  </div>
                  <div>
                    <h4 className="text-neutral-black text-[16px] font-bold mb-[4px]">
                      {benefit.title}
                    </h4>
                    <p className="text-neutral-gray text-[14px] leading-[1.6]">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For Landlords */}
      <section className="bg-neutral-light-gray py-[80px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <h2 className="text-neutral-black text-[36px] font-bold tracking-[-0.02em] mb-[48px] text-center">
            For Landlords
          </h2>

          <div className="grid grid-cols-3 gap-[48px] mb-[64px]">
            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-accent-blue text-white rounded-full flex items-center justify-center text-[28px] font-bold mx-auto mb-[24px]">
                1
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                List Your Property
              </h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Create a verified listing with photos, amenities, and rental terms. Complete identity verification.
              </p>
            </div>

            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-accent-blue text-white rounded-full flex items-center justify-center text-[28px] font-bold mx-auto mb-[24px]">
                2
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Manage Inquiries
              </h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Use our CRM inbox to organize applicants, schedule viewings, and respond with quick reply templates.
              </p>
            </div>

            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-accent-blue text-white rounded-full flex items-center justify-center text-[28px] font-bold mx-auto mb-[24px]">
                3
              </div>
              <h3 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Secure Payment
              </h3>
              <p className="text-neutral-gray text-[15px] leading-[1.6]">
                Receive rent payments automatically with deposit protection and legal documentation support.
              </p>
            </div>
          </div>

          {/* Landlord Benefits */}
          <div className="bg-white p-[48px]">
            <h3 className="text-neutral-black text-[24px] font-bold mb-[24px] text-center">
              Why Landlords Choose Us
            </h3>
            <div className="grid grid-cols-3 gap-[32px]">
              <div className="text-center">
                <div className="text-brand-primary text-[40px] font-bold mb-[8px]">
                  98%
                </div>
                <p className="text-neutral-gray text-[14px]">
                  Average occupancy rate for verified listings
                </p>
              </div>
              <div className="text-center">
                <div className="text-brand-primary text-[40px] font-bold mb-[8px]">
                  2 hrs
                </div>
                <p className="text-neutral-gray text-[14px]">
                  Average response time from qualified tenants
                </p>
              </div>
              <div className="text-center">
                <div className="text-brand-primary text-[40px] font-bold mb-[8px]">
                  24/7
                </div>
                <p className="text-neutral-gray text-[14px]">
                  Support for payment and legal issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[80px]">
        <div className="max-w-[800px] mx-auto px-[32px] text-center">
          <h2 className="text-neutral-black text-[36px] font-bold tracking-[-0.02em] mb-[24px]">
            Ready to Get Started?
          </h2>
          <p className="text-neutral-gray text-[18px] mb-[32px] leading-[1.6]">
            Join thousands of global citizens finding secure, verified housing.
          </p>
          <div className="flex items-center justify-center gap-[16px]">
            <Link
              to="/listings"
              className="px-[32px] py-[16px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors"
            >
              Search Properties
            </Link>
            <Link
              to="/landlord"
              className="px-[32px] py-[16px] border-[2px] border-neutral-black text-neutral-black font-bold hover:bg-neutral-black hover:text-white transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}