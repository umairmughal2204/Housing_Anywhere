import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Info, ChevronDown, Shield, Check, Plus, Upload, FileText, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { API_BASE } from "../config";

interface ListingSummary {
  id: string;
  title: string;
  city: string;
  address: string;
  monthlyRent: number;
  deposit: number;
  availableFrom: string;
  images: string[];
  utilitiesIncluded: boolean;
  utilitiesCost: number;
}

const COUNTRY_CODE_OPTIONS = [
  { value: "NL +31", label: "Netherlands (+31)" },
  { value: "DE +49", label: "Germany (+49)" },
  { value: "FR +33", label: "France (+33)" },
  { value: "ES +34", label: "Spain (+34)" },
  { value: "IT +39", label: "Italy (+39)" },
  { value: "GB +44", label: "United Kingdom (+44)" },
  { value: "US +1", label: "United States (+1)" },
  { value: "PK +92", label: "Pakistan (+92)" },
  { value: "IN +91", label: "India (+91)" },
  { value: "TR +90", label: "Turkey (+90)" },
  { value: "CN +86", label: "China (+86)" },
];

const TENANT_PROTECTION_RATE = 0.1;
const TENANT_PROTECTION_FEE_CAP = 250;

export function RentalApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const apiBase = API_BASE;
  const [currentStep, setCurrentStep] = useState(1);
  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const [listingError, setListingError] = useState("");
  const [isListingUnavailable, setIsListingUnavailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepOneError, setStepOneError] = useState("");
  
  // Dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  
  // Form states
  const [dateOfBirth, setDateOfBirth] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);
  const [countryCode, setCountryCode] = useState("NL +31");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [moveInCount, setMoveInCount] = useState(1);
  const [withPets, setWithPets] = useState(false);
  const [occupation, setOccupation] = useState<"student" | "professional" | "other" | null>(null);
  const [universityName, setUniversityName] = useState("");
  const [visaStatus, setVisaStatus] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [income, setIncome] = useState("");
  const [supportingMessage, setSupportingMessage] = useState(
    "Hi, I'm interested in renting your place. I'd love to connect, and hope to hear from you soon."
  );
  const [showMorePayments, setShowMorePayments] = useState(false);
  
  // Document states
  const [idVerified, setIdVerified] = useState(false);
  const [enrollmentProof, setEnrollmentProof] = useState<File | null>(null);
  const [employmentProof, setEmploymentProof] = useState<File | null>(null);
  const [incomeProof, setIncomeProof] = useState<File | null>(null);
  const [shareDocuments, setShareDocuments] = useState(false);
  const tenantProtectionFee = listing
    ? Math.min(listing.monthlyRent * TENANT_PROTECTION_RATE, TENANT_PROTECTION_FEE_CAP)
    : 0;

  const getStepOneValidationError = () => {
    const day = Number(dateOfBirth.day);
    const month = Number(dateOfBirth.month);
    const year = Number(dateOfBirth.year);

    if (!day || !month || !year) {
      return "Please complete your full date of birth.";
    }

    const dob = new Date(year, month - 1, day);
    if (
      Number.isNaN(dob.getTime()) ||
      dob.getDate() !== day ||
      dob.getMonth() !== month - 1 ||
      dob.getFullYear() !== year
    ) {
      return "Please enter a valid date of birth.";
    }

    if (!gender) {
      return "Please select your gender.";
    }

    if (!countryCode) {
      return "Please select a country code.";
    }

    const digitsOnlyPhone = mobileNumber.replace(/\D/g, "");
    if (digitsOnlyPhone.length < 6 || digitsOnlyPhone.length > 15) {
      return "Please enter a valid mobile number (6-15 digits).";
    }

    if (!occupation) {
      return "Please select your occupation.";
    }

    if (occupation === "student" && !universityName.trim()) {
      return "Please enter your university name.";
    }

    if (occupation === "student" && paymentMethods.length === 0) {
      return "Please choose at least one payment method.";
    }

    if (occupation === "professional" && !employerName.trim()) {
      return "Please enter your employer name.";
    }

    if (occupation === "professional") {
      const numericIncome = Number(income);
      if (!Number.isFinite(numericIncome) || numericIncome <= 0) {
        return "Please enter a valid monthly income greater than 0.";
      }
    }

    if (supportingMessage.trim().length < 20) {
      return "Please write at least 20 characters in your supporting message.";
    }

    return "";
  };

  const handleContinue = () => {
    if (currentStep === 1) {
      const validationError = getStepOneValidationError();
      if (validationError) {
        setStepOneError(validationError);
        return;
      }

      setStepOneError("");
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmit = async () => {
    if (!id) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate(`/login?returnTo=/property/${id}/apply`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    if (isListingUnavailable) {
      setSubmitError("This listing is no longer available for applications.");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        "application",
        JSON.stringify({
          listingId: id,
          dateOfBirth,
          gender,
          countryCode,
          mobileNumber,
          moveInCount,
          withPets,
          occupation,
          universityName,
          visaStatus,
          paymentMethods,
          monthlyBudget,
          employerName,
          income,
          supportingMessage,
          idVerified,
          shareDocuments,
        })
      );

      if (enrollmentProof) {
        formData.append("enrollmentProof", enrollmentProof);
      }

      if (employmentProof) {
        formData.append("employmentProof", employmentProof);
      }

      if (incomeProof) {
        formData.append("incomeProof", incomeProof);
      }

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await fetch(`${apiBase}/api/rental-applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to submit rental application");
      }

      const payload = (await response.json()) as { conversationId?: string };
      if (payload.conversationId) {
        navigate(`/property/${id}/success?conversationId=${encodeURIComponent(payload.conversationId)}`);
      } else {
        navigate(`/property/${id}/success`);
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to submit rental application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (file: File, type: string) => {
    if (type === "profile") {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    } else if (type === "enrollment") {
      setEnrollmentProof(file);
    } else if (type === "employment") {
      setEmploymentProof(file);
    } else if (type === "income") {
      setIncomeProof(file);
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

  useEffect(() => {
    const loadListing = async () => {
      if (!id) {
        return;
      }

      try {
        setIsLoadingListing(true);
        const response = await fetch(`${apiBase}/api/listings/${id}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { message?: string };
          setListing(null);
          setListingError(payload.message ?? "Listing not found");
          setIsListingUnavailable(response.status === 410);
          return;
        }

        const payload = (await response.json()) as { listing: ListingSummary };
        setListing(payload.listing);
        setListingError("");
        setIsListingUnavailable(false);
      } catch {
        setListing(null);
        setListingError("Could not load this listing right now");
        setIsListingUnavailable(false);
      } finally {
        setIsLoadingListing(false);
      }
    };

    void loadListing();
  }, [apiBase, id]);

  useEffect(() => {
    return () => {
      if (profilePicturePreview) {
        URL.revokeObjectURL(profilePicturePreview);
      }
    };
  }, [profilePicturePreview]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[16px] flex items-center justify-between">
          <button
            onClick={() => navigate(`/property/${id}`)}
            className="flex items-center gap-[8px] text-neutral-black hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-[16px] h-[16px]" />
            <span className="text-[14px] font-semibold">Back to listing</span>
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

      {user?.isLandlord && (
        <div className="max-w-[1200px] mx-auto px-[32px] py-[48px]">
          <div className="max-w-[720px] border border-[rgba(0,0,0,0.08)] bg-[#FFF7ED] p-[40px]">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C] mb-[12px]">
              Action not allowed
            </p>
            <h1 className="text-[#1A1A1A] text-[28px] font-bold tracking-[-0.02em] mb-[12px]">
              Landlords can't apply for rentals
            </h1>
            <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[28px]">
              Your current account is registered as a landlord. Only tenants can submit rental applications.
              To apply for this property, please create a separate tenant account.
            </p>
            <div className="flex items-center gap-[12px] flex-wrap">
              <button
                onClick={() => {
                  logout();
                  navigate("/signup?role=tenant");
                }}
                className="px-[20px] py-[12px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                Create a tenant account
              </button>
              <button
                onClick={() => navigate(`/property/${id}`)}
                className="px-[20px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors"
              >
                Back to listing
              </button>
            </div>
          </div>
        </div>
      )}

      {!user?.isLandlord && !isLoadingListing && !listing && (
        <div className="max-w-[1200px] mx-auto px-[32px] py-[48px]">
          <div className="max-w-[720px] border border-[rgba(0,0,0,0.08)] bg-[#FFF7ED] p-[32px]">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C] mb-[12px]">
              {isListingUnavailable ? "Applications closed" : "Listing unavailable"}
            </p>
            <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[12px]">
              {isListingUnavailable ? "This listing is no longer accepting applications" : "This property could not be loaded"}
            </h1>
            <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[24px]">
              {listingError || "The property may have been removed or set to inactive after you opened this page."}
            </p>
            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => navigate("/tenant/applications")}
                className="px-[20px] py-[12px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                View my applications
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-[20px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors"
              >
                Browse other homes
              </button>
            </div>
          </div>
        </div>
      )}

      {!user?.isLandlord && listing && (
      <>
      {/* Progress Steps */}
      <div className="bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1200px] mx-auto px-[32px] py-[32px]">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-[16px] left-0 right-0 h-[2px] bg-[rgba(0,0,0,0.08)]" style={{ width: "calc(100% - 32px)", left: "16px" }} />
            <div
              className="absolute top-[16px] left-0 h-[2px] bg-brand-primary transition-all duration-300"
              style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%", left: "16px" }}
            />

            {/* Step 1 */}
            <div className="flex items-center gap-[12px] relative z-10">
              <div
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? "bg-brand-primary text-white" : "bg-white border-[2px] border-[rgba(0,0,0,0.08)] text-neutral-gray"
                }`}
              >
                {currentStep > 1 ? <Check className="w-[16px] h-[16px]" /> : <span className="font-bold text-[14px]">1</span>}
              </div>
              <span className={`text-[14px] font-semibold bg-neutral-light-gray px-[8px] ${currentStep >= 1 ? "text-neutral-black" : "text-neutral-gray"}`}>
                {currentStep === 1 ? "Review application" : "Fill in rental application"}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-[12px] relative z-10">
              <div
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? "bg-brand-primary text-white" : "bg-white border-[2px] border-[rgba(0,0,0,0.08)] text-neutral-gray"
                }`}
              >
                {currentStep > 2 ? <Check className="w-[16px] h-[16px]" /> : <span className="font-bold text-[14px]">2</span>}
              </div>
              <span className={`text-[14px] font-semibold bg-neutral-light-gray px-[8px] ${currentStep >= 2 ? "text-neutral-black" : "text-neutral-gray"}`}>
                Add documents
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-[12px] relative z-10">
              <div
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? "bg-brand-primary text-white" : "bg-white border-[2px] border-[rgba(0,0,0,0.08)] text-neutral-gray"
                }`}
              >
                <span className="font-bold text-[14px]">3</span>
              </div>
              <span className={`text-[14px] font-semibold bg-neutral-light-gray px-[8px] ${currentStep >= 3 ? "text-neutral-black" : "text-neutral-gray"}`}>
                Submit application
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-[32px] py-[48px]">
        <div className="flex gap-[64px]">
          {/* Left Column */}
          <div className="flex-[2]">
            {/* STEP 1: Fill in rental application */}
            {currentStep === 1 && (
              <>
                <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[16px]">
                  Fill in your rental application in 5 minutes
                </h1>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[32px]">
                  Confirm your details and introduce yourself to EasyRent — we'll save your info for future applications.
                </p>

                {/* About You Section */}
                <div className="mb-[48px]">
                  <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">About you</h2>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Date of birth*</label>
                    <div className="grid grid-cols-3 gap-[16px]">
                      <select
                        value={dateOfBirth.day}
                        onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
                        className="px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] bg-white"
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <select
                        value={dateOfBirth.month}
                        onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
                        className="px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] bg-white"
                      >
                        <option value="">Month</option>
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                          <option key={month} value={idx + 1}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={dateOfBirth.year}
                        onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
                        className="px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] bg-white"
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 80 }, (_, i) => 2010 - i).map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Gender*</label>
                    <div className="flex items-center gap-[12px]">
                      {[
                        { value: "male", label: "♂ Male" },
                        { value: "female", label: "♀ Female" },
                        { value: "other", label: "⚥ Other" }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setGender(value as any)}
                          className={`px-[24px] py-[10px] border transition-colors ${
                            gender === value ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                          }`}
                        >
                          <span className={`text-[14px] font-semibold ${gender === value ? "text-brand-primary" : "text-neutral-black"}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Mobile number*</label>
                    <div className="grid grid-cols-3 gap-[16px]">
                      <div className="col-span-1">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                        >
                          {COUNTRY_CODE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <span className="block text-[#6B6B6B] text-[12px] mt-[4px]">Country code</span>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => {
                            const next = e.target.value.replace(/[^0-9]/g, "").slice(0, 15);
                            setMobileNumber(next);
                          }}
                          placeholder="Mobile number"
                          inputMode="numeric"
                          pattern="[0-9]{6,15}"
                          maxLength={15}
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                        />
                        <span className="block text-[#6B6B6B] text-[12px] mt-[4px]">Mobile number</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <label className="text-[#1A1A1A] text-[14px] font-semibold">Profile picture (Optional)</label>
                      <span className="relative group inline-flex items-center">
                        <Info className="w-[14px] h-[14px] text-[#6B6B6B]" />
                        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[230px] bg-neutral-black text-white text-[11px] leading-[1.4] px-[10px] py-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          Upload a clear face photo (JPG, PNG, or WEBP). This helps landlords recognize your application.
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-[12px]">
                      <label className="w-[80px] h-[80px] border-[2px] border-dashed border-[rgba(0,0,0,0.16)] bg-[#F7F7F9] flex items-center justify-center hover:bg-[#EDEDED] transition-colors cursor-pointer overflow-hidden">
                        {profilePicturePreview ? (
                          <img src={profilePicturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <Plus className="w-[24px] h-[24px] text-[#6B6B6B]" />
                        )}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(e.target.files[0], "profile");
                            }
                          }}
                          className="hidden"
                        />
                      </label>

                      {profilePicture && (
                        <div>
                          <p className="text-neutral-black text-[13px] font-semibold">{profilePicture.name}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePicture(null);
                              setProfilePicturePreview(null);
                            }}
                            className="text-brand-primary text-[13px] hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Who'll be living here */}
                <div className="mb-[48px]">
                  <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">Who'll be living here</h2>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">How many people will move in?*</label>
                    <div className="flex items-center gap-[12px]">
                      {[1, 2, 3].map((count) => (
                        <button
                          key={count}
                          onClick={() => setMoveInCount(count)}
                          className={`w-[56px] h-[56px] border transition-colors ${
                            moveInCount === count ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                          }`}
                        >
                          <span className={`text-[18px] font-bold ${moveInCount === count ? "text-brand-primary" : "text-neutral-black"}`}>
                            {count === 3 ? "3+" : count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <div className="flex items-center justify-between">
                      <label className="text-[#1A1A1A] text-[14px] font-semibold">With pet(s)</label>
                      <button
                        onClick={() => setWithPets(!withPets)}
                        className={`relative w-[48px] h-[24px] rounded-full transition-colors ${
                          withPets ? "bg-brand-primary" : "bg-[rgba(0,0,0,0.16)]"
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full transition-transform ${
                            withPets ? "translate-x-[26px]" : "translate-x-[2px]"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Occupation and Finances */}
                <div className="mb-[48px]">
                  <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">Occupation and finances</h2>
                  <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                    We may ask more questions depending on your occupation.
                  </p>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Occupation*</label>
                    <div className="flex items-center gap-[12px]">
                      {[
                        { value: "student", label: "🎓 Student" },
                        { value: "professional", label: "💼 Working professional" },
                        { value: "other", label: "✨ Other" }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setOccupation(value as any)}
                          className={`px-[24px] py-[10px] border transition-colors ${
                            occupation === value ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                          }`}
                        >
                          <span className={`text-[14px] font-semibold ${occupation === value ? "text-brand-primary" : "text-neutral-black"}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Student-specific fields */}
                  {occupation === "student" && (
                    <>
                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">University name</label>
                        <input
                          type="text"
                          value={universityName}
                          onChange={(e) => setUniversityName(e.target.value)}
                          placeholder="PUCIT"
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                        />
                        <div className="flex items-center gap-[8px] mt-[8px] bg-[#F7F7F9] px-[12px] py-[8px]">
                          <span className="relative group inline-flex items-center">
                            <Info className="w-[16px] h-[16px] text-[#0066CC]" />
                            <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[210px] bg-neutral-black text-white text-[11px] leading-[1.4] px-[10px] py-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                              You can upload your enrollment proof in the next step.
                            </span>
                          </span>
                          <span className="text-[#1A1A1A] text-[13px]">
                            You can add proof of enrollment in the next step.
                          </span>
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">What is your visa status?</label>
                        <div className="grid grid-cols-2 gap-[12px]">
                          {[
                            { value: "no_visa", label: "I don't need a visa" },
                            { value: "approved", label: "My visa is already approved" },
                            { value: "in_progress", label: "My application is in progress" },
                            { value: "need_to_apply", label: "I still need to apply" }
                          ].map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => setVisaStatus(value)}
                              className={`px-[16px] py-[12px] border text-left transition-colors ${
                                visaStatus === value ? "border-[#FF4B27] bg-[#FFF5F3]" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-[#F7F7F9]"
                              }`}
                            >
                              <span className="text-[#1A1A1A] text-[14px]">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">
                          How are you planning to pay for rent?
                        </label>
                        <div className="space-y-[12px]">
                          {[
                            { value: "savings", label: "Savings" },
                            { value: "parent", label: "Parent/guarantor" },
                            { value: "part_time", label: "Part-time job" },
                            { value: "other", label: "Other" }
                          ].map(({ value, label }) => (
                            <label key={value} className="flex items-center gap-[12px] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={paymentMethods.includes(value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPaymentMethods([...paymentMethods, value]);
                                  } else {
                                    setPaymentMethods(paymentMethods.filter((method) => method !== value));
                                  }
                                }}
                                className="w-[20px] h-[20px] border-[2px] border-[rgba(0,0,0,0.16)] rounded-none"
                              />
                              <span className="text-[#1A1A1A] text-[14px]">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">
                          Estimate how much money you'll have each month
                        </label>
                        <p className="text-[#6B6B6B] text-[13px] mb-[8px] leading-[1.6]">
                          Including for rent and other living expenses. This helps landlords understand your financial
                          situation, so they feel confident renting to you.
                        </p>
                        <div className="relative">
                          <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#6B6B6B] text-[14px]">€</span>
                          <input
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder=""
                            min={0}
                            step="1"
                            className="w-[250px] pl-[32px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Working professional-specific fields */}
                  {occupation === "professional" && (
                    <>
                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[14px] font-semibold mb-[8px]">Employer's name</label>
                        <input
                          type="text"
                          value={employerName}
                          onChange={(e) => setEmployerName(e.target.value)}
                          placeholder=""
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                        />
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-neutral-black text-[14px] font-semibold mb-[8px]">Your income</label>
                        <div className="relative">
                          <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-neutral-gray text-[14px]">€</span>
                          <input
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder=""
                            min={0}
                            step="1"
                            className="w-[250px] pl-[32px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px]"
                          />
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-neutral-black text-[14px] font-semibold mb-[8px]">What is your visa status?</label>
                        <div className="grid grid-cols-2 gap-[12px]">
                          {[
                            { value: "no_visa", label: "I don't need a visa" },
                            { value: "approved", label: "My visa is already approved" },
                            { value: "in_progress", label: "My application is in progress" },
                            { value: "need_to_apply", label: "I still need to apply" }
                          ].map(({ value, label }) => (
                            <button
                              key={value}
                              onClick={() => setVisaStatus(value)}
                              className={`px-[16px] py-[12px] border text-left transition-colors ${
                                visaStatus === value ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                              }`}
                            >
                              <span className="text-neutral-black text-[14px]">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Supporting Message */}
                <div className="mb-[48px]">
                  <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">Supporting message</h2>

                  <div className="mb-[24px]">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <label className="text-[#1A1A1A] text-[14px] font-semibold">
                        Introduce yourself to EasyRent!
                      </label>
                      <span className="relative group inline-flex items-center">
                        <Info className="w-[14px] h-[14px] text-[#6B6B6B]" />
                        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[240px] bg-neutral-black text-white text-[11px] leading-[1.4] px-[10px] py-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          Share your background, move-in plan, and why you would be a great tenant.
                        </span>
                      </span>
                    </div>
                    <textarea
                      value={supportingMessage}
                      onChange={(e) => setSupportingMessage(e.target.value)}
                      placeholder="Introduce yourself and mention why you are a good tenant"
                      rows={4}
                      maxLength={2000}
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] leading-[1.6] resize-none"
                    />
                    <p className="text-[#6B6B6B] text-[12px] mt-[6px]">{supportingMessage.trim().length}/2000</p>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full font-bold py-[16px] transition-colors text-[16px] bg-brand-primary text-white hover:bg-brand-primary-dark"
                >
                  Continue
                </button>
                {stepOneError && <p className="text-brand-primary text-[14px] mt-[12px]">{stepOneError}</p>}
              </>
            )}

            {/* STEP 2: Add documents */}
            {currentStep === 2 && (
              <>
                <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[16px]">
                  Upload required documents
                </h1>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[32px]">
                  Upload all required documents below. These files will be shown to the landlord in the dashboard rental requests section.
                </p>

                <div className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] p-[20px] mb-[24px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[10px]">Required documents</h2>
                  <ul className="space-y-[6px] text-[#1A1A1A] text-[14px]">
                    <li>1. Government ID (passport/national ID)</li>
                    <li>2. Proof of income (salary slip or bank statement)</li>
                    <li>3. Enrollment or employment proof</li>
                  </ul>
                </div>

                <div className="mb-[20px]">
                  <h2 className="text-[#1A1A1A] text-[22px] font-bold mb-[12px]">1. Government ID (required)</h2>
                  <div className="border-[2px] border-dashed border-[rgba(0,0,0,0.16)] p-[24px] text-center">
                    {enrollmentProof ? (
                      <div className="flex items-center gap-[12px] justify-center">
                        <FileText className="w-[24px] h-[24px] text-accent-blue" />
                        <span className="text-neutral-black text-[14px] font-semibold">{enrollmentProof.name}</span>
                        <button onClick={() => setEnrollmentProof(null)} className="text-brand-primary hover:underline text-[14px]">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-[42px] h-[42px] text-neutral-gray mx-auto mb-[12px]" />
                        <p className="text-neutral-black text-[14px] font-semibold mb-[8px]">Upload passport or national ID</p>
                        <label className="bg-brand-primary text-white px-[20px] py-[10px] font-semibold inline-block cursor-pointer hover:bg-brand-primary-dark transition-colors">
                          Upload ID document
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "enrollment")}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-[20px]">
                  <h2 className="text-[#1A1A1A] text-[22px] font-bold mb-[12px]">2. Proof of income (required)</h2>
                  <div className="border-[2px] border-dashed border-[rgba(0,0,0,0.16)] p-[24px] text-center">
                    {incomeProof ? (
                      <div className="flex items-center gap-[12px] justify-center">
                        <FileText className="w-[24px] h-[24px] text-accent-blue" />
                        <span className="text-neutral-black text-[14px] font-semibold">{incomeProof.name}</span>
                        <button onClick={() => setIncomeProof(null)} className="text-brand-primary hover:underline text-[14px]">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-[42px] h-[42px] text-neutral-gray mx-auto mb-[12px]" />
                        <p className="text-neutral-black text-[14px] font-semibold mb-[8px]">Upload salary slip or bank statement</p>
                        <label className="bg-brand-primary text-white px-[20px] py-[10px] font-semibold inline-block cursor-pointer hover:bg-brand-primary-dark transition-colors">
                          Upload income proof
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "income")}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-[28px]">
                  <h2 className="text-[#1A1A1A] text-[22px] font-bold mb-[12px]">3. Enrollment or employment proof (required)</h2>
                  <div className="border-[2px] border-dashed border-[rgba(0,0,0,0.16)] p-[24px] text-center">
                    {employmentProof ? (
                      <div className="flex items-center gap-[12px] justify-center">
                        <FileText className="w-[24px] h-[24px] text-accent-blue" />
                        <span className="text-neutral-black text-[14px] font-semibold">{employmentProof.name}</span>
                        <button onClick={() => setEmploymentProof(null)} className="text-brand-primary hover:underline text-[14px]">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-[42px] h-[42px] text-neutral-gray mx-auto mb-[12px]" />
                        <p className="text-neutral-black text-[14px] font-semibold mb-[8px]">Upload enrollment card or employment letter</p>
                        <label className="bg-brand-primary text-white px-[20px] py-[10px] font-semibold inline-block cursor-pointer hover:bg-brand-primary-dark transition-colors">
                          Upload supporting proof
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "employment")}
                            className="hidden"
                          />
                        </label>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-[32px] bg-[#F7F7F9] p-[14px]">
                  <label className="flex items-start gap-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareDocuments}
                      onChange={(e) => setShareDocuments(e.target.checked)}
                      className="w-[20px] h-[20px] border-[2px] border-[rgba(0,0,0,0.16)] rounded-none mt-[2px]"
                    />
                    <span className="text-[#1A1A1A] text-[14px] leading-[1.6]">
                      I confirm these uploaded documents can be shared with the landlord for rental request review.
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => {
                    setIdVerified(Boolean(enrollmentProof));
                    handleContinue();
                  }}
                  disabled={!shareDocuments || !enrollmentProof || !employmentProof || !incomeProof}
                  className={`w-full font-bold py-[16px] transition-colors text-[16px] ${
                    shareDocuments && enrollmentProof && employmentProof && incomeProof
                      ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                      : "bg-[#EDEDED] text-neutral-gray cursor-not-allowed"
                  }`}
                >
                  Continue to review
                </button>
              </>
            )}

            {/* STEP 3: Submit application */}
            {currentStep === 3 && (
              <>
                <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[16px]">
                  Review your application
                </h1>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[32px]">
                  Please review all the details before submitting your rental application.
                </p>

                {/* Personal Information */}
                <div className="bg-[#F7F7F9] p-[24px] mb-[24px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[16px]">Personal Information</h2>
                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B] text-[14px]">Date of birth</span>
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">
                        {dateOfBirth.day}/{dateOfBirth.month}/{dateOfBirth.year}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B] text-[14px]">Gender</span>
                      <span className="text-[#1A1A1A] text-[14px] font-semibold capitalize">{gender || "Not specified"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B] text-[14px]">Mobile number</span>
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">
                        {countryCode} {mobileNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Living Arrangement */}
                <div className="bg-[#F7F7F9] p-[24px] mb-[24px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[16px]">Living Arrangement</h2>
                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B] text-[14px]">Number of people moving in</span>
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">{moveInCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B] text-[14px]">With pets</span>
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">{withPets ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>

                {/* Occupation & Finances */}
                <div className="bg-[#F7F7F9] p-[24px] mb-[24px]">
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[16px]">Occupation & Finances</h2>
                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B] text-[14px]">Occupation</span>
                      <span className="text-[#1A1A1A] text-[14px] font-semibold capitalize">{occupation || "Not specified"}</span>
                    </div>
                    {occupation === "student" && universityName && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B] text-[14px]">University</span>
                          <span className="text-[#1A1A1A] text-[14px] font-semibold">{universityName}</span>
                        </div>
                        {monthlyBudget && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B] text-[14px]">Monthly budget</span>
                            <span className="text-[#1A1A1A] text-[14px] font-semibold">€{monthlyBudget}</span>
                          </div>
                        )}
                      </>
                    )}
                    {occupation === "professional" && (
                      <>
                        {employerName && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B] text-[14px]">Employer</span>
                            <span className="text-[#1A1A1A] text-[14px] font-semibold">{employerName}</span>
                          </div>
                        )}
                        {income && (
                          <div className="flex items-center justify-between">
                            <span className="text-[#6B6B6B] text-[14px]">Income</span>
                            <span className="text-[#1A1A1A] text-[14px] font-semibold">€{income}</span>
                          </div>
                        )}
                      </>
                    )}
                    {visaStatus && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B6B6B] text-[14px]">Visa status</span>
                        <span className="text-[#1A1A1A] text-[14px] font-semibold">
                          {visaStatus === "no_visa" && "No visa needed"}
                          {visaStatus === "approved" && "Visa approved"}
                          {visaStatus === "in_progress" && "In progress"}
                          {visaStatus === "need_to_apply" && "Need to apply"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-neutral-light-gray p-[24px] mb-[24px]">
                  <h2 className="text-neutral-black text-[20px] font-bold mb-[16px]">Documents</h2>
                  <div className="space-y-[12px]">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-gray text-[14px]">Government ID</span>
                      <span className={`text-[14px] font-semibold ${idVerified ? "text-accent-blue" : "text-neutral-gray"}`}>
                        {idVerified ? "✓ Uploaded" : "Missing"}
                      </span>
                    </div>
                    {enrollmentProof && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-gray text-[14px]">Government ID file</span>
                        <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                      </div>
                    )}
                    {employmentProof && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-gray text-[14px]">Enrollment or employment proof</span>
                        <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                      </div>
                    )}
                    {incomeProof && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-gray text-[14px]">Income proof</span>
                        <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                      </div>
                    )}
                    {profilePicture && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-gray text-[14px]">Profile picture</span>
                        <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Supporting Message */}
                <div className="bg-neutral-light-gray p-[24px] mb-[32px]">
                  <h2 className="text-neutral-black text-[20px] font-bold mb-[16px]">Supporting Message</h2>
                  <p className="text-neutral-black text-[14px] leading-[1.6]">{supportingMessage}</p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary text-white font-bold py-[16px] hover:bg-brand-primary-dark transition-colors text-[16px]"
                >
                  {isSubmitting ? "Submitting..." : "Submit application"}
                </button>
                {submitError && <p className="text-brand-primary text-[14px] mt-[12px]">{submitError}</p>}
              </>
            )}
          </div>

          {/* Right Column - Property & Payment Summary */}
          <div className="flex-[1]">
            <div className="sticky top-[100px]">
              {/* Property Card */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[24px]">
                <div className="relative mb-[12px]">
                  <img src={listing?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"} alt="Property" className="w-full h-[120px] object-cover" />
                  <div className="absolute bottom-[8px] right-[8px] w-[32px] h-[32px] bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-bold">S</span>
                  </div>
                </div>

                <h3 className="text-neutral-black text-[18px] font-bold mb-[4px]">{listing?.title ?? "Listing"}</h3>
                <p className="text-neutral-gray text-[13px] mb-[8px]">{listing ? `${listing.address}, ${listing.city}` : ""}</p>
                <p className="text-neutral-gray text-[13px] mb-[8px]">Published by EasyRent</p>

                <div className="bg-neutral-light-gray px-[12px] py-[8px]">
                  <p className="text-neutral-black text-[13px] font-semibold mb-[2px]">Rental period</p>
                  <div className="flex items-center gap-[4px]">
                    <p className="text-neutral-black text-[13px]">
                      {listing?.availableFrom ? new Date(listing.availableFrom).toLocaleDateString("en-GB") : "Date pending"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment to HousingAnywhere */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[16px]">
                <div className="flex items-center gap-[12px] mb-[16px]">
                  <div className="w-[24px] h-[24px] bg-[#1A1A1A] rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">Y</span>
                  </div>
                  <svg className="w-[16px] h-[16px] text-neutral-gray" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div className="w-[24px] h-[24px] bg-brand-primary flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1L2 4.5V10.5H5V7.5H9V10.5H12V4.5L7 1Z" fill="white" stroke="white" strokeWidth="1" />
                    </svg>
                  </div>
                  <span className="text-neutral-black text-[13px] font-bold">EasyRent</span>
                </div>

                <p className="text-neutral-black text-[13px] font-semibold mb-[16px]">
                  Pay this now to secure your place.
                </p>

                <div className="space-y-[12px] mb-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray text-[14px]">First month's rent</span>
                    <span className="text-neutral-black text-[14px] font-semibold">€{(listing?.monthlyRent ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[4px]">
                      <span className="text-neutral-gray text-[14px]">Tenant Protection fee</span>
                      <span className="relative group inline-flex items-center">
                        <Info className="w-[12px] h-[12px] text-neutral-gray" />
                        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[220px] bg-neutral-black text-white text-[11px] leading-[1.4] px-[10px] py-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          Tenant Protection fee is 10% of monthly rent, capped at €250. It covers payment security and move-in support.
                        </span>
                      </span>
                    </div>
                    <span className="text-neutral-black text-[14px] font-semibold">€{tenantProtectionFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-[16px] border-t border-[rgba(0,0,0,0.08)] mb-[12px]">
                  <span className="text-[#1A1A1A] text-[16px] font-bold">Total</span>
                  <span className="text-[#1A1A1A] text-[20px] font-bold">
                    €{(listing ? listing.monthlyRent + tenantProtectionFee : 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-[6px] bg-[#F7F7F9] px-[12px] py-[8px]">
                  <Shield className="w-[14px] h-[14px] text-[#0066CC]" />
                  <span className="text-[#1A1A1A] text-[12px]">
                    Covered by Tenant Protection.{" "}
                    <button className="text-[#0066CC] underline hover:no-underline">Learn more</button>
                  </span>
                </div>
              </div>

              {/* Payment to Landlord */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[16px]">
                <div className="flex items-center gap-[12px] mb-[16px]">
                  <div className="w-[24px] h-[24px] bg-neutral-black rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">Y</span>
                  </div>
                  <svg className="w-[16px] h-[16px] text-neutral-gray" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8H14M14 8L10 4M14 8L10 12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                  <div className="w-[24px] h-[24px] bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">S</span>
                  </div>
                  <span className="text-neutral-black text-[13px] font-bold">Sental</span>
                </div>

                <p className="text-neutral-gray text-[13px] mb-[16px]">
                  Future rental costs to the landlord. You'll pay these directly, per your contract.
                </p>

                <div className="space-y-[12px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[4px]">
                      <span className="text-neutral-gray text-[14px]">Security deposit</span>
                      <span className="text-neutral-gray text-[12px]">before move-in</span>
                      <span className="relative group inline-flex items-center">
                        <Info className="w-[12px] h-[12px] text-neutral-gray" />
                        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[250px] bg-neutral-black text-white text-[11px] leading-[1.4] px-[10px] py-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          This refundable amount is held by the landlord and may be returned after move-out, based on contract terms.
                        </span>
                      </span>
                    </div>
                    <span className="text-neutral-black text-[14px] font-semibold">€{(listing?.deposit ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray text-[14px]">Utilities</span>
                    <span className="text-neutral-black text-[14px] font-semibold">
                      {listing?.utilitiesIncluded
                        ? listing.utilitiesCost > 0
                          ? `€${listing.utilitiesCost.toFixed(2)}`
                          : "Included"
                        : "Not included"}
                    </span>
                  </div>

                  {showMorePayments && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-gray text-[14px]">Monthly rent (from month 2)</span>
                      <span className="text-neutral-black text-[14px] font-semibold">€{(listing?.monthlyRent ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowMorePayments(!showMorePayments)}
                  className="flex items-center gap-[4px] text-neutral-black text-[13px] font-semibold mt-[12px] hover:text-brand-primary transition-colors"
                >
                  View {showMorePayments ? "less" : "more"}
                  <ChevronDown className={`w-[14px] h-[14px] transition-transform ${showMorePayments ? "rotate-180" : ""}`} />
                </button>
              </div>

              {/* Tenant Protection Info */}
              <div className="bg-[#F7F9FC] border border-[#0066CC] p-[16px]">
                <div className="flex items-center gap-[8px] mb-[12px]">
                  <Shield className="w-[18px] h-[18px] text-[#0066CC]" />
                  <span className="text-[#1A1A1A] text-[14px] font-bold">Covered by Tenant Protection</span>
                </div>
                <p className="text-[#1A1A1A] text-[13px] leading-[1.6] mb-[12px]">
                  You're guaranteed a stress-free move-in or your money back.
                </p>
                <button className="flex items-center gap-[4px] text-[#0066CC] text-[13px] font-semibold hover:underline">
                  How you're protected
                  <ChevronDown className="w-[12px] h-[12px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
