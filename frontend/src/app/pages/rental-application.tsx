import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Info, ChevronDown, Shield, Check, Plus, Upload, FileText, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import propertyImage from "../../assets/2db5a7303bce6c3d85b53a7866c4838e88cb5e61.png";

export function RentalApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  
  // Form states
  const [dateOfBirth, setDateOfBirth] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);
  const [countryCode, setCountryCode] = useState("NL +31");
  const [mobileNumber, setMobileNumber] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
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

  const handleContinue = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmit = () => {
    // Navigate to success page
    navigate(`/property/${id}/success`);
  };

  const handleFileUpload = (file: File, type: string) => {
    if (type === "enrollment") {
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
                  Confirm your details and introduce yourself to Sental — we'll save your info for future applications.
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
                        <input
                          type="text"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          placeholder="Country code"
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                        />
                        <span className="block text-[#6B6B6B] text-[12px] mt-[4px]">Country code</span>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="Mobile number"
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px]"
                        />
                        <span className="block text-[#6B6B6B] text-[12px] mt-[4px]">Mobile number</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <label className="text-[#1A1A1A] text-[14px] font-semibold">Profile picture (Optional)</label>
                      <Info className="w-[14px] h-[14px] text-[#6B6B6B]" />
                    </div>
                    <button className="w-[80px] h-[80px] border-[2px] border-dashed border-[rgba(0,0,0,0.16)] bg-[#F7F7F9] flex items-center justify-center hover:bg-[#EDEDED] transition-colors">
                      <Plus className="w-[24px] h-[24px] text-[#6B6B6B]" />
                    </button>
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
                          <Info className="w-[16px] h-[16px] text-[#0066CC]" />
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
                            type="text"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder=""
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
                            type="text"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder=""
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
                        Introduce yourself to Sental!
                      </label>
                      <Info className="w-[14px] h-[14px] text-[#6B6B6B]" />
                    </div>
                    <textarea
                      value={supportingMessage}
                      onChange={(e) => setSupportingMessage(e.target.value)}
                      rows={4}
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] leading-[1.6] resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full bg-brand-primary text-white font-bold py-[16px] hover:bg-brand-primary-dark transition-colors text-[16px]"
                >
                  Continue
                </button>
              </>
            )}

            {/* STEP 2: Add documents */}
            {currentStep === 2 && (
              <>
                <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[16px]">
                  Confirm your ID to stand out
                </h1>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[32px]">
                  Get a verified ID badge and build trust. People who confirm their ID are 5x more likely to rent.{" "}
                  <button className="text-[#0066CC] underline hover:no-underline">About document security</button>
                </p>

                {/* ID Verification */}
                <div className="bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] p-[24px] mb-[32px]">
                  <div className="flex items-start gap-[16px] mb-[16px]">
                    <div className="flex-shrink-0">
                      <svg className="w-[32px] h-[32px]" viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="4" fill="#635BFF"/>
                        <path d="M8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16Z" fill="white"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[4px]">
                        ID verification <span className="text-[#635BFF] text-[14px] font-normal">Powered by Stripe</span>
                      </h3>
                      <div className="bg-brand-light border border-brand-primary px-[12px] py-[6px] inline-block mb-[12px]">
                        <span className="text-brand-primary text-[12px] font-semibold">To Do</span>
                      </div>
                      <div className="space-y-[8px] mb-[16px]">
                        <div className="flex items-center gap-[8px]">
                          <Check className="w-[16px] h-[16px] text-accent-blue" />
                          <span className="text-neutral-black text-[14px]">
                            <strong>We'll check:</strong> Your government-issued photo ID against a selfie.
                          </span>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <Check className="w-[16px] h-[16px] text-accent-blue" />
                          <span className="text-neutral-black text-[14px]">
                            <strong>You'll receive:</strong> A verified ID badge to boost your chances of renting.
                          </span>
                        </div>
                        <div className="flex items-center gap-[8px]">
                          <Check className="w-[16px] h-[16px] text-accent-blue" />
                          <span className="text-neutral-black text-[14px]">
                            <strong>Landlords will see:</strong> Your new badge. And your ID, only once you choose to share it with them.
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIdVerified(true)}
                        className="bg-neutral-black text-white px-[24px] py-[12px] font-semibold hover:bg-brand-primary transition-colors"
                      >
                        Confirm my identity
                      </button>
                    </div>
                  </div>
                </div>

                {/* Conditional Document Upload */}
                {occupation === "student" && (
                  <div className="mb-[32px]">
                    <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">Student verification</h2>
                    <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                      Upload your enrollment card or proof of enrollment to verify your student status.
                    </p>
                    
                    <div className="border-[2px] border-dashed border-[rgba(0,0,0,0.16)] p-[32px] text-center">
                      {enrollmentProof ? (
                        <div className="flex items-center gap-[12px] justify-center">
                          <FileText className="w-[24px] h-[24px] text-accent-blue" />
                          <span className="text-neutral-black text-[14px] font-semibold">{enrollmentProof.name}</span>
                          <button
                            onClick={() => setEnrollmentProof(null)}
                            className="text-brand-primary hover:underline text-[14px]"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-[48px] h-[48px] text-neutral-gray mx-auto mb-[16px]" />
                          <p className="text-neutral-black text-[14px] font-semibold mb-[8px]">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-neutral-gray text-[13px] mb-[16px]">
                            Max file size: 7MB | Accepted formats: pdf, png, jpg, jpeg | Multiple uploads possible
                          </p>
                          <label className="bg-brand-primary text-white px-[24px] py-[12px] font-semibold inline-block cursor-pointer hover:bg-brand-primary-dark transition-colors">
                            Upload document
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
                )}

                {occupation === "professional" && (
                  <>
                    <div className="mb-[32px]">
                      <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">Employment verification</h2>
                      <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                        Upload your employment contract or letter to verify your employment status.
                      </p>
                      
                      <div className="border-[2px] border-dashed border-[rgba(0,0,0,0.16)] p-[32px] text-center">
                        {employmentProof ? (
                          <div className="flex items-center gap-[12px] justify-center">
                            <FileText className="w-[24px] h-[24px] text-accent-blue" />
                            <span className="text-neutral-black text-[14px] font-semibold">{employmentProof.name}</span>
                            <button
                              onClick={() => setEmploymentProof(null)}
                              className="text-brand-primary hover:underline text-[14px]"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-[48px] h-[48px] text-neutral-gray mx-auto mb-[16px]" />
                            <p className="text-neutral-black text-[14px] font-semibold mb-[8px]">
                              Drag and drop or click to upload
                            </p>
                            <p className="text-neutral-gray text-[13px] mb-[16px]">
                              Max file size: 7MB | Accepted formats: pdf, png, jpg, jpeg | Multiple uploads possible
                            </p>
                            <label className="bg-brand-primary text-white px-[24px] py-[12px] font-semibold inline-block cursor-pointer hover:bg-brand-primary-dark transition-colors">
                              Upload document
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

                    <div className="mb-[32px]">
                      <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">Income verification</h2>
                      <p className="text-[#6B6B6B] text-[14px] mb-[24px]">
                        Upload your recent pay slip or bank statement to verify your income.
                      </p>
                      
                      <div className="border-[2px] border-dashed border-[rgba(0,0,0,0.16)] p-[32px] text-center">
                        {incomeProof ? (
                          <div className="flex items-center gap-[12px] justify-center">
                            <FileText className="w-[24px] h-[24px] text-accent-blue" />
                            <span className="text-neutral-black text-[14px] font-semibold">{incomeProof.name}</span>
                            <button
                              onClick={() => setIncomeProof(null)}
                              className="text-brand-primary hover:underline text-[14px]"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-[48px] h-[48px] text-neutral-gray mx-auto mb-[16px]" />
                            <p className="text-neutral-black text-[14px] font-semibold mb-[8px]">
                              Drag and drop or click to upload
                            </p>
                            <p className="text-neutral-gray text-[13px] mb-[16px]">
                              Max file size: 7MB | Accepted formats: pdf, png, jpg, jpeg | Multiple uploads possible
                            </p>
                            <label className="bg-brand-primary text-white px-[24px] py-[12px] font-semibold inline-block cursor-pointer hover:bg-brand-primary-dark transition-colors">
                              Upload document
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
                  </>
                )}

                {/* Share Documents Checkbox */}
                <div className="mb-[32px]">
                  <label className="flex items-start gap-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareDocuments}
                      onChange={(e) => setShareDocuments(e.target.checked)}
                      className="w-[20px] h-[20px] border-[2px] border-[rgba(0,0,0,0.16)] rounded-none mt-[2px]"
                    />
                    <span className="text-[#1A1A1A] text-[14px] leading-[1.6]">
                      I agree to share these documents <strong>only</strong> with Sental, in accordance with
                      HousingAnywhere's <button className="text-[#0066CC] underline hover:no-underline">Terms & Conditions</button> and{" "}
                      <button className="text-[#0066CC] underline hover:no-underline">Privacy Policy</button>.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-[16px]">
                  <button
                    onClick={handleContinue}
                    disabled={!shareDocuments}
                    className={`flex-1 font-bold py-[16px] transition-colors text-[16px] ${
                      shareDocuments
                        ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                        : "bg-[#EDEDED] text-neutral-gray cursor-not-allowed"
                    }`}
                  >
                    Share and continue
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-[24px] py-[16px] text-neutral-black font-semibold hover:underline"
                  >
                    I'll do it later
                  </button>
                </div>
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
                      <span className="text-neutral-gray text-[14px]">ID verified</span>
                      <span className={`text-[14px] font-semibold ${idVerified ? "text-accent-blue" : "text-neutral-gray"}`}>
                        {idVerified ? "✓ Verified" : "Not verified"}
                      </span>
                    </div>
                    {occupation === "student" && enrollmentProof && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-gray text-[14px]">Enrollment proof</span>
                        <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                      </div>
                    )}
                    {occupation === "professional" && (
                      <>
                        {employmentProof && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-gray text-[14px]">Employment proof</span>
                            <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                          </div>
                        )}
                        {incomeProof && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-gray text-[14px]">Income proof</span>
                            <span className="text-accent-blue text-[14px] font-semibold">✓ Uploaded</span>
                          </div>
                        )}
                      </>
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
                  className="w-full bg-brand-primary text-white font-bold py-[16px] hover:bg-brand-primary-dark transition-colors text-[16px]"
                >
                  Submit application
                </button>
              </>
            )}
          </div>

          {/* Right Column - Property & Payment Summary */}
          <div className="flex-[1]">
            <div className="sticky top-[100px]">
              {/* Property Card */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[24px]">
                <div className="relative mb-[12px]">
                  <img src={propertyImage} alt="Property" className="w-full h-[120px] object-cover" />
                  <div className="absolute bottom-[8px] right-[8px] w-[32px] h-[32px] bg-brand-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-[12px] font-bold">S</span>
                  </div>
                </div>

                <h3 className="text-neutral-black text-[18px] font-bold mb-[4px]">Rue Clément Ader</h3>
                <p className="text-neutral-gray text-[13px] mb-[8px]">Rosny-sous-Bois, France</p>
                <p className="text-neutral-gray text-[13px] mb-[8px]">Published by Sental</p>

                <div className="bg-neutral-light-gray px-[12px] py-[8px]">
                  <p className="text-neutral-black text-[13px] font-semibold mb-[2px]">Rental period</p>
                  <div className="flex items-center gap-[4px]">
                    <p className="text-neutral-black text-[13px]">10 Mar – 1 Jun 2026</p>
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
                    <span className="text-neutral-black text-[14px] font-semibold">€600.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-[4px]">
                      <span className="text-neutral-gray text-[14px]">Tenant Protection fee</span>
                      <Info className="w-[12px] h-[12px] text-neutral-gray" />
                    </div>
                    <span className="text-neutral-black text-[14px] font-semibold">€210.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-[16px] border-t border-[rgba(0,0,0,0.08)] mb-[12px]">
                  <span className="text-[#1A1A1A] text-[16px] font-bold">Total</span>
                  <span className="text-[#1A1A1A] text-[20px] font-bold">€810.00</span>
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
                      <Info className="w-[12px] h-[12px] text-neutral-gray" />
                    </div>
                    <span className="text-neutral-black text-[14px] font-semibold">€900.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray text-[14px]">Utilities</span>
                    <span className="text-neutral-black text-[14px] font-semibold">€150.00</span>
                  </div>

                  {showMorePayments && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-gray text-[14px]">Monthly rent (from month 2)</span>
                      <span className="text-neutral-black text-[14px] font-semibold">€600.00</span>
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
    </div>
  );
}
