import { Link, useNavigate } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Check, Shield, Users, Home, TrendingUp, Clock, FileText, Star, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/auth-context";

export function Landlord() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // If user is already a landlord, go to dashboard
    if (user?.isLandlord) {
      navigate("/landlord/dashboard");
      return;
    }
    
    // If user is logged in but not a landlord, go to registration form
    if (isAuthenticated) {
      navigate("/landlord/register");
      return;
    }
    
    // If not logged in, go to login with redirect
    navigate("/login?redirect=/landlord/register");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D] text-white py-[120px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="grid grid-cols-2 gap-[64px] items-center">
            <div>
              <h1 className="text-[56px] font-bold leading-[1.1] tracking-[-0.02em] mb-[24px]">
                Rent out quickly and<br />
                with confidence
              </h1>
              <p className="text-[18px] text-white/90 mb-[40px] leading-[1.6]">
                Join thousands of landlords who trust EasyRent to find reliable tenants for mid-to-long-term rentals.
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-block rounded-[14px] bg-brand-primary text-white px-[48px] py-[18px] font-bold hover:bg-brand-primary-dark transition-colors"
              >
                {user?.isLandlord ? "Go to Dashboard" : isAuthenticated ? "Complete Registration" : "Get started for free"}
              </button>
              <p className="text-white/70 text-[14px] mt-[16px]">
                {user?.isLandlord ? "Manage your properties and find tenants" : "No upfront costs • Only pay when you rent out"}
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1743865318581-2e0e59e7292e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxhcHRvcCUyMHdvcmtpbmclMjBob21lfGVufDF8fHx8MTc3MzE0NDQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Landlord"
                className="w-full h-[500px] rounded-[18px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#F7F7F9] py-[64px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="grid grid-cols-3 gap-[48px]">
            <div className="text-center">
              <div className="text-brand-primary text-[56px] font-bold tracking-[-0.02em] mb-[8px]">
                75,000+
              </div>
              <p className="text-[#1A1A1A] text-[16px] font-semibold">
                Landlords worldwide
              </p>
            </div>
            <div className="text-center">
              <div className="text-brand-primary text-[56px] font-bold tracking-[-0.02em] mb-[8px]">
                3.8M+
              </div>
              <p className="text-[#1A1A1A] text-[16px] font-semibold">
                International tenants
              </p>
            </div>
            <div className="text-center">
              <div className="text-brand-primary text-[56px] font-bold tracking-[-0.02em] mb-[8px]">
                14 days
              </div>
              <p className="text-[#1A1A1A] text-[16px] font-semibold">
                Average time to rent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Everything you need Section */}
      <section className="py-[80px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="text-center mb-[64px]">
            <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
              Everything you need to maximise your earnings
            </h2>
            <p className="text-[#6B6B6B] text-[18px] max-w-[720px] mx-auto leading-[1.6]">
              We handle the complexity so you can focus on what matters
            </p>
          </div>

          <div className="grid grid-cols-2 gap-[32px]">
            {/* Feature 1 */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] p-[32px]">
              <div className="w-[56px] h-[56px] rounded-[14px] bg-accent-blue flex items-center justify-center mb-[24px]">
                <Users className="w-[32px] h-[32px] text-white" />
              </div>
              <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-[12px]">
                Verified tenant profiles
              </h3>
              <p className="text-[#6B6B6B] text-[16px] leading-[1.6]">
                Every tenant is ID-verified and screened. See their employment status, income verification, and references before accepting.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] p-[32px]">
              <div className="w-[56px] h-[56px] rounded-[14px] bg-accent-blue flex items-center justify-center mb-[24px]">
                <Shield className="w-[32px] h-[32px] text-white" />
              </div>
              <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-[12px]">
                Guaranteed rent payments
              </h3>
              <p className="text-[#6B6B6B] text-[16px] leading-[1.6]">
                Payments are held in escrow and released automatically. No more chasing tenants for rent or dealing with late payments.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] p-[32px]">
              <div className="w-[56px] h-[56px] rounded-[14px] bg-accent-blue flex items-center justify-center mb-[24px]">
                <FileText className="w-[32px] h-[32px] text-white" />
              </div>
              <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-[12px]">
                Legal lease agreements
              </h3>
              <p className="text-[#6B6B6B] text-[16px] leading-[1.6]">
                Generate legally-binding contracts in minutes, compliant with local housing laws in your country. Available in 12+ languages.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] p-[32px]">
              <div className="w-[56px] h-[56px] rounded-[14px] bg-accent-blue flex items-center justify-center mb-[24px]">
                <Clock className="w-[32px] h-[32px] text-white" />
              </div>
              <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-[12px]">
                24/7 landlord support
              </h3>
              <p className="text-[#6B6B6B] text-[16px] leading-[1.6]">
                Dedicated support team available around the clock to help with tenant disputes, payment issues, or platform questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-[80px] bg-[#F7F7F9]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="grid grid-cols-2 gap-[64px] items-center">
            <img
              src="https://images.unsplash.com/photo-1758523669429-45723b96106c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjByZWxheGluZyUyMG1vZGVybiUyMGFwYXJ0bWVudCUyMGhvbWV8ZW58MXx8fHwxNzczMTQ0NDEyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Couple relaxing"
              className="w-full h-[500px] rounded-[18px] object-cover"
            />
            <div>
              <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
                Simply pricing for<br />
                friction-costly rentals
              </h2>
              <p className="text-[#6B6B6B] text-[18px] mb-[32px] leading-[1.6]">
                No upfront fees. No hidden costs. You only pay when we successfully find you a tenant.
              </p>
              <div className="space-y-[16px]">
                <div className="flex items-center gap-[12px]">
                  <Check className="w-[24px] h-[24px] text-accent-blue flex-shrink-0" />
                  <span className="text-[#1A1A1A] text-[16px]">One month's rent as service fee</span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <Check className="w-[24px] h-[24px] text-accent-blue flex-shrink-0" />
                  <span className="text-[#1A1A1A] text-[16px]">Free property listing and photos</span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <Check className="w-[24px] h-[24px] text-accent-blue flex-shrink-0" />
                  <span className="text-[#1A1A1A] text-[16px]">No fees if you don't rent out</span>
                </div>
                <div className="flex items-center gap-[12px]">
                  <Check className="w-[24px] h-[24px] text-accent-blue flex-shrink-0" />
                  <span className="text-[#1A1A1A] text-[16px]">Cancel anytime with no penalties</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-[80px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="text-center mb-[64px]">
            <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
              All online. 100% secure.
            </h2>
            <p className="text-[#6B6B6B] text-[18px] max-w-[720px] mx-auto leading-[1.6]">
              From listing to lease signing, everything happens on our platform
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[48px]">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-[80px] h-[80px] bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-[24px]">
                <span className="text-white text-[32px] font-bold">1</span>
              </div>
              <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[12px]">
                List your property
              </h3>
              <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                Create your listing in 10 minutes with photos, description, and pricing. We'll help you optimize for maximum visibility.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-[80px] h-[80px] bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-[24px]">
                <span className="text-white text-[32px] font-bold">2</span>
              </div>
              <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[12px]">
                Review applications
              </h3>
              <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                Receive applications from verified tenants. Review profiles, chat directly, and choose your ideal tenant.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-[80px] h-[80px] bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-[24px]">
                <span className="text-white text-[32px] font-bold">3</span>
              </div>
              <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[12px]">
                Sign & get paid
              </h3>
              <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                Sign the digital lease agreement and receive your first payment securely through our escrow system.
              </p>
            </div>
          </div>

          <div className="text-center mt-[48px]">
            <Link
              to={isAuthenticated ? "/landlord/inbox" : "/signup"}
              className="inline-flex items-center gap-[12px] rounded-[14px] bg-brand-primary text-white px-[48px] py-[18px] font-bold hover:bg-brand-primary-dark transition-colors"
            >
              {isAuthenticated ? "Go to dashboard" : "Get started now"}
              <ArrowRight className="w-[20px] h-[20px]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-[80px] bg-[#F7F7F9]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="text-center mb-[48px]">
            <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
              All-in-one landlord dashboard
            </h2>
            <p className="text-[#6B6B6B] text-[18px]">
              Manage all your properties from one powerful dashboard
            </p>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[22px] p-[48px]">
            <img
              src="https://images.unsplash.com/photo-1663756915301-2ba688e078cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzczMDU2NjkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Dashboard Preview"
              className="w-full h-[400px] object-cover rounded-[14px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-[32px] mt-[48px]">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-[24px] text-center">
              <TrendingUp className="w-[40px] h-[40px] text-brand-primary mx-auto mb-[16px]" />
              <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[8px]">
                Live activity updates
              </h3>
              <p className="text-[#6B6B6B] text-[14px] leading-[1.6]">
                Stay updated on inquiries and tenant responses in real time
              </p>
            </div>
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-[24px] text-center">
              <Home className="w-[40px] h-[40px] text-brand-primary mx-auto mb-[16px]" />
              <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[8px]">
                Multi-property management
              </h3>
              <p className="text-[#6B6B6B] text-[14px] leading-[1.6]">
                Manage unlimited properties in one place
              </p>
            </div>
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] p-[24px] text-center">
              <Star className="w-[40px] h-[40px] text-brand-primary mx-auto mb-[16px]" />
              <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[8px]">
                Tenant ratings
              </h3>
              <p className="text-[#6B6B6B] text-[14px] leading-[1.6]">
                See reviews from previous landlords
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[80px] bg-[#1A1A1A] text-white">
        <div className="max-w-[1440px] mx-auto px-[32px] text-center">
          <h2 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
            Start earning with a verified tenant today
          </h2>
          <p className="text-[18px] text-white/90 mb-[40px] max-w-[720px] mx-auto leading-[1.6]">
            Join 75,000+ landlords who've rented out their properties through EasyRent
          </p>
          <Link
            to={isAuthenticated ? "/landlord/inbox" : "/signup"}
            className="inline-block rounded-[14px] bg-brand-primary text-white px-[56px] py-[20px] font-bold text-[16px] hover:bg-brand-primary-dark transition-colors"
          >
            {isAuthenticated ? "Go to dashboard" : "List your property for free"}
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-[80px] bg-white">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="text-center mb-[64px]">
            <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
              Your questions, answered
            </h2>
          </div>

          <div className="max-w-[800px] mx-auto space-y-[16px]">
            <details className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[24px] cursor-pointer">
              <summary className="text-[#1A1A1A] text-[18px] font-bold flex items-center justify-between">
                How much does it cost to list my property?
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p className="text-[#6B6B6B] text-[15px] mt-[16px] leading-[1.6]">
                Listing your property is completely free. We only charge a service fee (equivalent to one month's rent) when you successfully rent out your property. No upfront costs, no hidden fees.
              </p>
            </details>

            <details className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[24px] cursor-pointer">
              <summary className="text-[#1A1A1A] text-[18px] font-bold flex items-center justify-between">
                How do I know tenants are verified?
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p className="text-[#6B6B6B] text-[15px] mt-[16px] leading-[1.6]">
                Every tenant must verify their identity through government-issued ID, provide proof of income or enrollment, and complete a background screening before they can apply for properties.
              </p>
            </details>

            <details className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[24px] cursor-pointer">
              <summary className="text-[#1A1A1A] text-[18px] font-bold flex items-center justify-between">
                What if my tenant doesn't pay rent?
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p className="text-[#6B6B6B] text-[15px] mt-[16px] leading-[1.6]">
                All rent payments go through our secure escrow system. The tenant pays upfront for the rental period, and funds are held securely until the move-in is confirmed. You're protected from non-payment.
              </p>
            </details>

            <details className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[24px] cursor-pointer">
              <summary className="text-[#1A1A1A] text-[18px] font-bold flex items-center justify-between">
                Can I list multiple properties?
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p className="text-[#6B6B6B] text-[15px] mt-[16px] leading-[1.6]">
                Yes! You can list unlimited properties on your landlord dashboard. Manage all your listings, applications, and tenants from one central location.
              </p>
            </details>

            <details className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[24px] cursor-pointer">
              <summary className="text-[#1A1A1A] text-[18px] font-bold flex items-center justify-between">
                How long does it take to find a tenant?
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p className="text-[#6B6B6B] text-[15px] mt-[16px] leading-[1.6]">
                On average, landlords find tenants within 14 days. Our global reach of 3.8M+ international students, expats, and digital nomads means high-quality inquiries from day one.
              </p>
            </details>

            <details className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[24px] cursor-pointer">
              <summary className="text-[#1A1A1A] text-[18px] font-bold flex items-center justify-between">
                What types of properties can I list?
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </summary>
              <p className="text-[#6B6B6B] text-[15px] mt-[16px] leading-[1.6]">
                You can list apartments, studios, rooms in shared apartments, and entire houses. Properties must be available for mid-to-long-term rentals (minimum 1 month).
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="dashboard" />
    </div>
  );
}