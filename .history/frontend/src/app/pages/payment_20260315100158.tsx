import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Lock, Info, Shield, Check, CreditCard, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { API_BASE } from "../config";

interface ListingSummary {
  id: string;
  title: string;
  city: string;
  address: string;
  monthlyRent: number;
  deposit: number;
  images: string[];
  availableFrom: string;
}

export function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "ideal" | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(true);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      setIsLoadingListing(true);
      try {
        const response = await fetch(`${API_BASE}/api/listings/${id}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Listing not found");
        const payload = (await response.json()) as { listing: ListingSummary };
        setListing(payload.listing);
      } catch {
        setListing(null);
      } finally {
        setIsLoadingListing(false);
      }
    };
    void loadListing();
  }, [id]);

  const tenantProtectionFee = listing ? Math.round(listing.monthlyRent * 0.35) : 0;
  const totalDueToday = listing ? listing.monthlyRent + tenantProtectionFee : 0;

  // Dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const handlePayment = async () => {
    if (!paymentMethod || !agreedToTerms || !id) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    // Process payment
    alert("Payment successful!");

    try {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      });

      if (!response.ok) {
        navigate("/tenant/inbox");
        return;
      }

      const payload = (await response.json()) as { conversationId: string };
      navigate(`/tenant/inbox/conversation/${payload.conversationId}`);
    } catch {
      navigate("/tenant/inbox");
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown') && !target.closest('.user-menu-dropdown')) {
        setIsLanguageOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[16px] flex items-center justify-between">
          <button
            onClick={() => navigate(`/property/${id}/success`)}
            className="flex items-center gap-[8px] text-neutral-black hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-[16px] h-[16px]" />
            <span className="text-[14px] font-semibold">Back</span>
          </button>

          <Link to="/" className="flex items-center gap-[8px]">
            <div className="w-[32px] h-[32px] bg-brand-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-neutral-black text-[18px] font-bold">
              Easy<span className="text-brand-primary">Rent</span>
            </span>
          </Link>

          <div className="flex items-center gap-[16px]">
            {/* Language Dropdown */}
            <div className="relative language-dropdown">
              <button
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsUserMenuOpen(false);
                }}
                className="w-[40px] h-[40px] bg-neutral-light-gray rounded-full flex items-center justify-center hover:bg-neutral transition-colors"
              >
                <span className="text-neutral-black text-[14px] font-bold">
                  {selectedLanguage === "English" ? "EN" : 
                   selectedLanguage === "Español" ? "ES" :
                   selectedLanguage === "Français" ? "FR" :
                   selectedLanguage === "Deutsch" ? "DE" :
                   selectedLanguage === "Italiano" ? "IT" :
                   selectedLanguage === "Nederlands" ? "NL" :
                   selectedLanguage === "Português" ? "PT" :
                   selectedLanguage === "Polski" ? "PL" :
                   selectedLanguage === "Türkçe" ? "TR" :
                   selectedLanguage === "中文" ? "ZH" :
                   selectedLanguage === "日本語" ? "JA" :
                   selectedLanguage === "한국어" ? "KO" : "EN"}
                </span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 top-[48px] bg-white border border-neutral shadow-lg min-w-[160px] z-50">
                  {["English", "Español", "Français", "Deutsch", "Italiano", "Nederlands", "Português", "Polski", "Türkçe", "中文", "日本語", "한국어"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] hover:bg-neutral-light-gray transition-colors ${
                        selectedLanguage === lang ? "bg-neutral-light-gray font-semibold text-brand-primary" : "text-neutral-black"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative user-menu-dropdown">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsLanguageOpen(false);
                }}
                className="w-[40px] h-[40px] bg-brand-primary rounded-full flex items-center justify-center hover:bg-brand-primary-dark transition-colors"
              >
                <span className="text-white text-[14px] font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-[48px] bg-white border border-neutral shadow-lg min-w-[200px] z-50">
                  <div className="px-[16px] py-[12px] border-b border-neutral">
                    <p className="text-neutral-black text-[14px] font-bold">{user?.name || "User"}</p>
                    <p className="text-neutral-gray text-[12px]">{user?.email || "user@example.com"}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/account");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <User className="w-[16px] h-[16px]" />
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      navigate("/favorites");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <Check className="w-[16px] h-[16px]" />
                    My Favorites
                  </button>
                  <button
                    onClick={() => {
                      navigate("/tenant/inbox");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <Info className="w-[16px] h-[16px]" />
                    My Messages
                  </button>
                  <div className="border-t border-neutral">
                    <button
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                    >
                      <LogOut className="w-[16px] h-[16px]" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Security Banner */}
      <div className="bg-[#F7F9FC] border-b border-[#0066CC]">
        <div className="max-w-[1200px] mx-auto px-[32px] py-[16px]">
          <div className="flex items-center justify-center gap-[8px]">
            <Lock className="w-[16px] h-[16px] text-[#0066CC]" />
            <span className="text-[#1A1A1A] text-[14px] font-semibold">
              Secure payment powered by Stripe • Your payment information is encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-[32px] py-[48px]">
        <div className="flex gap-[64px]">
          {/* Left Column - Payment Form */}
          <div className="flex-[2]">
            <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[16px]">
              Confirm and pay
            </h1>
            <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[32px]">
              You won't be charged until Serdal accepts your booking request. You'll receive a confirmation email once payment is complete.
            </p>

            {/* Payment Method Selection */}
            <div className="mb-[32px]">
              <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">Choose payment method</h2>
              
              <div className="space-y-[16px]">
                {/* Credit/Debit Card */}
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full border-[2px] p-[20px] text-left transition-colors flex items-center justify-between ${
                    paymentMethod === "card" ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                  }`}
                >
                  <div className="flex items-center gap-[16px]">
                    <CreditCard className={`w-[24px] h-[24px] ${paymentMethod === "card" ? "text-brand-primary" : "text-neutral-gray"}`} />
                    <div>
                      <span className={`block text-[16px] font-semibold ${paymentMethod === "card" ? "text-brand-primary" : "text-neutral-black"}`}>
                        Credit or debit card
                      </span>
                      <span className="block text-[13px] text-neutral-gray mt-[4px]">Visa, Mastercard, American Express</span>
                    </div>
                  </div>
                  <div className={`w-[24px] h-[24px] rounded-full border-[2px] flex items-center justify-center ${
                    paymentMethod === "card" ? "border-brand-primary bg-brand-primary" : "border-[rgba(0,0,0,0.16)]"
                  }`}>
                    {paymentMethod === "card" && <div className="w-[12px] h-[12px] bg-white rounded-full"></div>}
                  </div>
                </button>

                {/* Bank Transfer */}
                <button
                  onClick={() => setPaymentMethod("bank")}
                  className={`w-full border-[2px] p-[20px] text-left transition-colors flex items-center justify-between ${
                    paymentMethod === "bank" ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                  }`}
                >
                  <div className="flex items-center gap-[16px]">
                    <svg className={`w-[24px] h-[24px] ${paymentMethod === "bank" ? "text-brand-primary" : "text-neutral-gray"}`} viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div>
                      <span className={`block text-[16px] font-semibold ${paymentMethod === "bank" ? "text-brand-primary" : "text-neutral-black"}`}>
                        Bank transfer
                      </span>
                      <span className="block text-[13px] text-neutral-gray mt-[4px]">Direct bank transfer (SEPA)</span>
                    </div>
                  </div>
                  <div className={`w-[24px] h-[24px] rounded-full border-[2px] flex items-center justify-center ${
                    paymentMethod === "bank" ? "border-brand-primary bg-brand-primary" : "border-[rgba(0,0,0,0.16)]"
                  }`}>
                    {paymentMethod === "bank" && <div className="w-[12px] h-[12px] bg-white rounded-full"></div>}
                  </div>
                </button>

                {/* iDEAL */}
                <button
                  onClick={() => setPaymentMethod("ideal")}
                  className={`w-full border-[2px] p-[20px] text-left transition-colors flex items-center justify-between ${
                    paymentMethod === "ideal" ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                  }`}
                >
                  <div className="flex items-center gap-[16px]">
                    <div className={`w-[24px] h-[24px] font-bold text-[18px] ${paymentMethod === "ideal" ? "text-brand-primary" : "text-neutral-gray"}`}>
                      iD
                    </div>
                    <div>
                      <span className={`block text-[16px] font-semibold ${paymentMethod === "ideal" ? "text-brand-primary" : "text-neutral-black"}`}>
                        iDEAL
                      </span>
                      <span className="block text-[13px] text-neutral-gray mt-[4px]">Direct payment via your Dutch bank</span>
                    </div>
                  </div>
                  <div className={`w-[24px] h-[24px] rounded-full border-[2px] flex items-center justify-center ${
                    paymentMethod === "ideal" ? "border-brand-primary bg-brand-primary" : "border-[rgba(0,0,0,0.16)]"
                  }`}>
                    {paymentMethod === "ideal" && <div className="w-[12px] h-[12px] bg-white rounded-full"></div>}
                  </div>
                </button>
              </div>
            </div>

            {/* Card Details Form */}
            {paymentMethod === "card" && (
              <div className="mb-[32px] bg-[#F7F7F9] p-[24px]">
                <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[24px]">Card details</h3>
                
                <div className="space-y-[16px]">
                  <div>
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Card number*</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-[16px]">
                    <div>
                      <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Expiry date*</label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">CVV*</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Cardholder name*</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="mb-[32px]">
              <label className="flex items-start gap-[12px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-[20px] h-[20px] border-[2px] border-[rgba(0,0,0,0.16)] rounded-none mt-[2px]"
                />
                <span className="text-[#1A1A1A] text-[14px] leading-[1.6]">
                  I agree to the{" "}
                  <button className="text-[#0066CC] underline hover:no-underline font-semibold">
                    HousingAnywhere Terms & Conditions
                  </button>
                  ,{" "}
                  <button className="text-[#0066CC] underline hover:no-underline font-semibold">
                    Cancellation Policy
                  </button>
                  , and{" "}
                  <button className="text-[#0066CC] underline hover:no-underline font-semibold">
                    Privacy Policy
                  </button>
                  . I also understand that I will be charged the total amount shown below.
                </span>
              </label>
            </div>

            {/* Payment Info */}
            <div className="bg-[#F7F9FC] border border-[#0066CC] p-[16px] mb-[32px]">
              <div className="flex items-start gap-[12px]">
                <Info className="w-[20px] h-[20px] text-[#0066CC] flex-shrink-0 mt-[2px]" />
                <div>
                  <p className="text-[#1A1A1A] text-[14px] leading-[1.6] mb-[8px]">
                    <strong>Your payment is secure:</strong> Your payment will be held securely by HousingAnywhere until 
                    24 hours after you move in. The landlord only receives payment if everything goes as planned.
                  </p>
                  <button className="text-[#0066CC] text-[13px] font-semibold hover:underline">
                    Learn more about secure payments
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handlePayment}
              disabled={!paymentMethod || !agreedToTerms}
              className={`w-full font-bold py-[16px] transition-colors text-[16px] ${
                paymentMethod && agreedToTerms
                  ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                  : "bg-[#EDEDED] text-neutral-gray cursor-not-allowed"
              }`}
            >
              Confirm and pay €{totalDueToday.toLocaleString()}
            </button>

            <p className="text-neutral-gray text-[13px] text-center mt-[16px] leading-[1.6]">
              By clicking "Confirm and pay", you agree to pay the total amount shown. Your card will be charged immediately.
            </p>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="flex-[1]">
            <div className="sticky top-[100px]">
              {/* Property Card */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[24px]">
                <div className="relative mb-[12px]">
                  {isLoadingListing ? (
                    <div className="w-full h-[120px] bg-neutral-light-gray animate-pulse" />
                  ) : (
                    <img
                      src={listing?.images?.[0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                      alt={listing?.title ?? "Property"}
                      className="w-full h-[120px] object-cover"
                    />
                  )}
                </div>

                <h3 className="text-neutral-black text-[18px] font-bold mb-[4px]">
                  {isLoadingListing ? "Loading..." : (listing?.title ?? "Property")}
                </h3>
                <p className="text-neutral-gray text-[13px] mb-[12px]">
                  {isLoadingListing ? "" : `${listing?.address ?? ""}, ${listing?.city ?? ""}`}
                </p>

                <div className="bg-neutral-light-gray px-[12px] py-[8px]">
                  <p className="text-neutral-black text-[13px] font-semibold mb-[2px]">Available from</p>
                  <p className="text-neutral-black text-[13px]">
                    {listing ? new Date(listing.availableFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                  </p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[24px]">
                <h3 className="text-neutral-black text-[16px] font-bold mb-[16px]">Price breakdown</h3>

                <div className="space-y-[12px] mb-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray text-[14px]">First month's rent</span>
                    <span className="text-neutral-black text-[14px] font-semibold">€{listing?.monthlyRent.toLocaleString() ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[4px]">
                      <span className="text-neutral-gray text-[14px]">Tenant Protection fee</span>
                      <Info className="w-[12px] h-[12px] text-neutral-gray" />
                    </div>
                    <span className="text-neutral-black text-[14px] font-semibold">€{tenantProtectionFee.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                  <span className="text-neutral-black text-[18px] font-bold">Total due today</span>
                  <span className="text-neutral-black text-[24px] font-bold">€{totalDueToday.toLocaleString()}</span>
                </div>
              </div>

              {/* Tenant Protection */}
              <div className="bg-[#F7F9FC] border border-[#0066CC] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <Shield className="w-[18px] h-[18px] text-[#0066CC]" />
                  <span className="text-neutral-black text-[14px] font-bold">Covered by Tenant Protection</span>
                </div>
                <p className="text-neutral-black text-[13px] leading-[1.6] mb-[12px]">
                  You're guaranteed a stress-free move-in or your money back. We'll refund your payment if:
                </p>
                <ul className="space-y-[6px] mb-[12px]">
                  <li className="flex items-start gap-[8px]">
                    <Check className="w-[14px] h-[14px] text-accent-blue flex-shrink-0 mt-[2px]" />
                    <span className="text-neutral-black text-[12px] leading-[1.5]">The listing is a scam</span>
                  </li>
                  <li className="flex items-start gap-[8px]">
                    <Check className="w-[14px] h-[14px] text-accent-blue flex-shrink-0 mt-[2px]" />
                    <span className="text-neutral-black text-[12px] leading-[1.5]">The property isn't as advertised</span>
                  </li>
                  <li className="flex items-start gap-[8px]">
                    <Check className="w-[14px] h-[14px] text-accent-blue flex-shrink-0 mt-[2px]" />
                    <span className="text-neutral-black text-[12px] leading-[1.5]">The landlord cancels your booking</span>
                  </li>
                </ul>
                <button className="text-[#0066CC] text-[13px] font-semibold hover:underline">
                  Learn more about protection →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}