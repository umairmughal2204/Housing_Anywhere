import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
import { useState } from "react";

export function Pricing() {
  const [activeTab, setActiveTab] = useState<"tenants" | "landlords">("tenants");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-brand-primary-light py-[64px]">
        <div className="max-w-[1200px] mx-auto px-[32px] text-center">
          <h1 className="text-neutral-black text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
            Pricing
          </h1>
          <p className="text-neutral-black text-[18px] mb-[32px] max-w-[600px] mx-auto">
            Learn about the benefits of using EasyRent.
          </p>
          
          <div className="flex items-center justify-center gap-[16px]">
            <button
              onClick={() => setActiveTab("tenants")}
              className={`px-[32px] py-[12px] rounded-full font-semibold transition-colors ${
                activeTab === "tenants"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-neutral-black border border-neutral"
              }`}
            >
              For tenants
            </button>
            <button
              onClick={() => setActiveTab("landlords")}
              className={`px-[32px] py-[12px] rounded-full font-semibold transition-colors ${
                activeTab === "landlords"
                  ? "bg-brand-primary text-white"
                  : "bg-white text-neutral-black border border-neutral"
              }`}
            >
              For landlords
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-[80px] bg-white">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          {activeTab === "tenants" ? (
            <>
              <h2 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[64px] text-center max-w-[600px] mx-auto">
                What you'll pay to book depends on where you're moving to
              </h2>

              <div className="grid grid-cols-[1fr_400px] gap-[80px]">
                {/* Left Column - Steps */}
                <div className="space-y-[48px]">
                  {/* Step 1 */}
                  <div className="flex gap-[24px]">
                    <div className="flex-shrink-0">
                      <div className="w-[40px] h-[40px] rounded-full bg-neutral-black text-white flex items-center justify-center font-bold">
                        1
                      </div>
                    </div>
                    <div>
                      <h3 className="text-neutral-black text-[24px] font-bold mb-[12px]">
                        Search fast, search smart
                      </h3>
                      <p className="text-neutral-gray text-[15px] leading-[1.6] mb-[8px]">
                        Browse through all types of properties in 400+ cities. From studios and shared
                        rooms to entire apartments. Find where you're meant to be with our advanced
                        search filters.
                      </p>
                      <p className="text-neutral-black text-[15px] leading-[1.6] font-semibold mb-[4px]">
                        What you'll save:
                      </p>
                      <p className="text-neutral-gray text-[13px] uppercase tracking-[0.05em] font-semibold">
                        START YOUR SEARCH NOW →
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-[24px]">
                    <div className="flex-shrink-0">
                      <div className="w-[40px] h-[40px] rounded-full bg-neutral-black text-white flex items-center justify-center font-bold">
                        2
                      </div>
                    </div>
                    <div>
                      <h3 className="text-neutral-black text-[24px] font-bold mb-[12px]">
                        Chat in real-time with verified landlords
                      </h3>
                      <p className="text-neutral-gray text-[15px] leading-[1.6] mb-[8px]">
                        All properties on EasyRent have been cross-checked and most come from
                        verified landlords who are approved by our team. And even if you're not sure
                        where to start, you can always ask our customer support for help.
                      </p>
                      <p className="text-neutral-black text-[15px] leading-[1.6] font-semibold mb-[4px]">
                        For apartment-finders in countries where a landlord fee is not a standard
                        practice (see the right column), you'll also be exempt from paying a landlord
                        fee if a property is verified. This means you'll only be charged the
                        EasyRent service fee.
                      </p>
                      <p className="text-neutral-gray text-[13px] uppercase tracking-[0.05em] font-semibold">
                        Free to get in touch with landlords
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-[24px]">
                    <div className="flex-shrink-0">
                      <div className="w-[40px] h-[40px] rounded-full bg-neutral-black text-white flex items-center justify-center font-bold">
                        3
                      </div>
                    </div>
                    <div>
                      <h3 className="text-neutral-black text-[24px] font-bold mb-[12px]">
                        Book and pay securely online
                      </h3>
                      <p className="text-neutral-gray text-[15px] leading-[1.6] mb-[8px]">
                        Our properties can be booked online. Either the landlord accepts your booking
                        request or you'll receive a counter-offer. You'll make an online payment for the
                        first month's rent (including service fee) and your security deposit. A service
                        fee will be automatically calculated for you once you've selected a property
                        online.
                      </p>
                      <p className="text-neutral-black text-[15px] leading-[1.6] font-semibold mb-[4px]">
                        Service fees vary by country - see exact details on the right column. Service
                        fees range from 150 EUR to 25% of rent paid.
                      </p>
                      <p className="text-neutral-gray text-[13px] uppercase tracking-[0.05em] font-semibold">
                        Learn more →
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-[24px]">
                    <div className="flex-shrink-0">
                      <div className="w-[40px] h-[40px] rounded-full bg-neutral-black text-white flex items-center justify-center font-bold">
                        4
                      </div>
                    </div>
                    <div>
                      <h3 className="text-neutral-black text-[24px] font-bold mb-[12px]">
                        Pay your deposit, monthly rent and any extras
                      </h3>
                      <p className="text-neutral-gray text-[15px] leading-[1.6] mb-[8px]">
                        We can also pay your booking with a payment plan. Instead of having to pay the
                        full amount of your first month's rent, security deposit and service fee right
                        away, you can pay in three monthly instalments. Current annual interest rate
                        (TAEG) and nominal rate on the first purchase is 0%.
                      </p>
                      <p className="text-neutral-gray text-[13px] uppercase tracking-[0.05em] font-semibold">
                        More about payment required
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Regional Pricing */}
                <div className="space-y-[24px]">
                  {/* Netherlands - No Landlord Fee */}
                  <div className="bg-white border border-neutral p-[24px]">
                    <div className="mb-[16px]">
                      <h4 className="text-neutral-black text-[18px] font-bold mb-[4px]">
                        The Netherlands - No Landlord Fee
                      </h4>
                      <p className="text-neutral-gray text-[14px]">
                        (This apartment's <span className="font-semibold">landlord is verified</span>)
                      </p>
                    </div>
                    <div className="space-y-[8px]">
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-gray text-[14px]">
                          EasyRent service fee
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-gray text-[14px]">Landlord fee</span>
                        <span className="text-neutral-black text-[14px] font-semibold">€ 0</span>
                      </div>
                      <p className="text-neutral-gray text-[12px] leading-[1.5] mt-[8px]">
                        * IMPORTANT: Landlord fee is exempted for this property
                      </p>
                      <button className="text-brand-primary text-[13px] font-semibold flex items-center gap-[4px] mt-[12px]">
                        Learn more <ChevronRight className="w-[14px] h-[14px]" />
                      </button>
                    </div>
                  </div>

                  {/* Netherlands - No Fees */}
                  <div className="bg-white border border-neutral p-[24px]">
                    <div className="mb-[16px]">
                      <h4 className="text-neutral-black text-[18px] font-bold mb-[4px]">
                        The Netherlands - No fees
                      </h4>
                      <p className="text-neutral-gray text-[14px]">
                        (This apartment's <span className="font-semibold">landlord is not verified</span>)
                      </p>
                    </div>
                    <div className="space-y-[8px]">
                      <div className="flex justify-between items-baseline">
                        <span className="text-neutral-gray text-[14px]">
                          EasyRent service fee
                        </span>
                      </div>
                      <p className="text-neutral-gray text-[12px] leading-[1.5] mt-[8px]">
                        * IMPORTANT: If the Landlord is not verified, no fees will be charged on either side
                      </p>
                      <button className="text-brand-primary text-[13px] font-semibold flex items-center gap-[4px] mt-[12px]">
                        Learn more <ChevronRight className="w-[14px] h-[14px]" />
                      </button>
                    </div>
                  </div>

                  {/* UK and US */}
                  <div className="bg-white border border-neutral p-[24px]">
                    <div className="mb-[16px]">
                      <h4 className="text-neutral-black text-[18px] font-bold mb-[4px]">
                        UK and US - No fees
                      </h4>
                      <p className="text-neutral-gray text-[14px]">
                        Other countries: <span className="font-semibold">+ 25% of one-time fee</span>
                      </p>
                    </div>
                    <div className="space-y-[8px]">
                      <p className="text-neutral-gray text-[12px] leading-[1.5]">
                        Service fee in UK and US is completely free.
                      </p>
                      <button className="text-brand-primary text-[13px] font-semibold flex items-center gap-[4px] mt-[12px]">
                        Waste repair or damage fees <ChevronRight className="w-[14px] h-[14px]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Landlord Pricing Content */}
              <h2 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[24px] text-center">
                Choose the right plan for your rental business
              </h2>
              <p className="text-neutral-gray text-[16px] text-center max-w-[700px] mx-auto mb-[64px]">
                List your properties on EasyRent and reach thousands of verified tenants worldwide. Transparent pricing with no hidden fees.
              </p>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-[32px] mb-[64px]">
                {/* Basic Plan */}
                <div className="bg-white border border-neutral p-[32px]">
                  <h3 className="text-neutral-black text-[24px] font-bold mb-[8px]">Basic</h3>
                  <div className="mb-[24px]">
                    <span className="text-neutral-black text-[48px] font-bold">Free</span>
                  </div>
                  <p className="text-neutral-gray text-[14px] mb-[32px]">
                    Perfect for individual landlords with a single property
                  </p>
                  <ul className="space-y-[16px] mb-[32px]">
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">1 property listing</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Up to 10 photos per listing</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Basic messaging with tenants</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">15% commission per booking</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Standard support</span>
                    </li>
                  </ul>
                  <button className="w-full py-[12px] border border-neutral text-neutral-black font-semibold hover:bg-neutral-light-gray transition-colors">
                    Get Started
                  </button>
                </div>

                {/* Professional Plan */}
                <div className="bg-white border-2 border-brand-primary p-[32px] relative">
                  <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-brand-primary text-white px-[16px] py-[4px] text-[12px] font-bold">
                    POPULAR
                  </div>
                  <h3 className="text-neutral-black text-[24px] font-bold mb-[8px]">Professional</h3>
                  <div className="mb-[24px]">
                    <span className="text-neutral-black text-[48px] font-bold">€49</span>
                    <span className="text-neutral-gray text-[16px]">/month</span>
                  </div>
                  <p className="text-neutral-gray text-[14px] mb-[32px]">
                    Best for landlords with multiple properties
                  </p>
                  <ul className="space-y-[16px] mb-[32px]">
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Up to 5 property listings</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Up to 25 photos per listing</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Priority messaging</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">10% commission per booking</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Verified landlord badge</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Analytics dashboard</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Priority support</span>
                    </li>
                  </ul>
                  <button className="w-full py-[12px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors">
                    Start Free Trial
                  </button>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white border border-neutral p-[32px]">
                  <h3 className="text-neutral-black text-[24px] font-bold mb-[8px]">Enterprise</h3>
                  <div className="mb-[24px]">
                    <span className="text-neutral-black text-[48px] font-bold">€149</span>
                    <span className="text-neutral-gray text-[16px]">/month</span>
                  </div>
                  <p className="text-neutral-gray text-[14px] mb-[32px]">
                    For property managers and agencies
                  </p>
                  <ul className="space-y-[16px] mb-[32px]">
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Unlimited property listings</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Unlimited photos per listing</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Advanced messaging features</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">5% commission per booking</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Premium verified badge</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Advanced analytics & reports</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">API access</span>
                    </li>
                    <li className="flex items-start gap-[12px]">
                      <Check className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
                      <span className="text-neutral-gray text-[14px]">Dedicated account manager</span>
                    </li>
                  </ul>
                  <button className="w-full py-[12px] border border-neutral text-neutral-black font-semibold hover:bg-neutral-light-gray transition-colors">
                    Contact Sales
                  </button>
                </div>
              </div>

              {/* Additional Benefits */}
              <div className="bg-brand-primary-light border border-brand-primary p-[48px] mb-[64px]">
                <h3 className="text-neutral-black text-[24px] font-bold mb-[32px] text-center">All plans include</h3>
                <div className="grid grid-cols-3 gap-[32px]">
                  <div className="text-center">
                    <div className="w-[64px] h-[64px] bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-[16px]">
                      <Check className="w-[32px] h-[32px] text-white" />
                    </div>
                    <h4 className="text-neutral-black text-[16px] font-bold mb-[8px]">Secure Payments</h4>
                    <p className="text-neutral-gray text-[14px]">All transactions are processed securely through our platform</p>
                  </div>
                  <div className="text-center">
                    <div className="w-[64px] h-[64px] bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-[16px]">
                      <Check className="w-[32px] h-[32px] text-white" />
                    </div>
                    <h4 className="text-neutral-black text-[16px] font-bold mb-[8px]">Verified Tenants</h4>
                    <p className="text-neutral-gray text-[14px]">All tenants undergo identity verification for your security</p>
                  </div>
                  <div className="text-center">
                    <div className="w-[64px] h-[64px] bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-[16px]">
                      <Check className="w-[32px] h-[32px] text-white" />
                    </div>
                    <h4 className="text-neutral-black text-[16px] font-bold mb-[8px]">24/7 Support</h4>
                    <p className="text-neutral-gray text-[14px]">Our support team is always ready to help you</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-[80px] border-t border-neutral">
        <div className="max-w-[800px] mx-auto px-[32px]">
          <h2 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[48px] text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-[16px]">
            {(activeTab === "tenants" ? [
              {
                q: "Which city I need to pay for Landlord fee ?",
                a: "Landlord fees are only applicable in certain countries where this is a standard practice. Check the regional pricing section above to see if your destination has landlord fees.",
              },
              {
                q: "How do I pay my monthly rent?",
                a: "After your first month's rent is paid through our platform, subsequent monthly payments can be made through automatic bank transfers or our payment portal. You'll receive reminders before each payment is due.",
              },
              {
                q: "Is My deposit protection like an insurance fee?",
                a: "No, your security deposit is not an insurance fee. It's a refundable amount held in escrow to protect the landlord against damages. It will be returned to you at the end of your lease, minus any deductions for damages.",
              },
              {
                q: "I am booking an apartment from the US, but I am moving to Spain. Can I add the service fee to the lease?",
                a: "The service fee is a one-time payment due at booking and cannot be added to your monthly lease payments. However, we do offer payment plans that allow you to split the first payment into three monthly installments at 0% interest.",
              },
            ] : [
              {
                q: "What commission does EasyRent charge?",
                a: "Our commission rates vary by plan: Basic (15%), Professional (10%), and Enterprise (5%). The commission is only charged when you successfully rent out your property.",
              },
              {
                q: "Can I upgrade or downgrade my plan anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, you'll be charged a prorated amount for the remainder of the month. If you downgrade, the change will take effect at the start of your next billing cycle.",
              },
              {
                q: "How does the verification process work?",
                a: "To become a verified landlord, you'll need to provide proof of property ownership or authorization to rent, valid identification, and pass a background check. The verification process typically takes 2-3 business days.",
              },
              {
                q: "What payment methods do you accept from tenants?",
                a: "We accept all major credit cards, debit cards, and bank transfers. All payments are processed securely through our platform, and funds are transferred to your account within 2-3 business days after tenant move-in.",
              },
              {
                q: "Is there a free trial for paid plans?",
                a: "Yes! The Professional plan comes with a 14-day free trial. You can explore all features with no commitment. Cancel anytime during the trial period without being charged.",
              },
            ]).map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-neutral overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-[24px] py-[20px] flex items-center justify-between text-left hover:bg-neutral-light-gray transition-colors"
                >
                  <span className="text-neutral-black text-[16px] font-semibold pr-[16px]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-[20px] h-[20px] text-neutral-gray flex-shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-[24px] pb-[20px] pt-[4px]">
                    <p className="text-neutral-gray text-[15px] leading-[1.6]">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section
        className="py-[80px] relative bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1577897113176-6888367369bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHdvbWFuJTIwc21pbGluZyUyMHBvcnRyYWl0JTIwYWZyaWNhbiUyMGFtZXJpY2FufGVufDF8fHx8MTc3MzE0NzEyMXww&ixlib=rb-4.1.0&q=80&w=1080')`,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <div className="max-w-[600px]">
            <h2 className="text-white text-[40px] font-bold tracking-[-0.02em] mb-[16px]">This is Suzie. She just rented her new home</h2>
            <p className="text-white text-[18px] leading-[1.6] mb-[32px]">
              "I was looking for a place in Lagos. Then I discovered EasyRent. With my very
              first search, I was flooded with quality offers."
            </p>
            <button className="px-[32px] py-[14px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors">Find the Perfect Place</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}