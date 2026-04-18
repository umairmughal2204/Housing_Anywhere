import { Link, useParams, useNavigate, useLocation } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Info, ChevronDown, Shield, Check, Plus, Upload, FileText, User, GraduationCap, Briefcase, Sparkles, LogOut, Pencil, Heart, CheckCircle2, Calendar, CircleDollarSign, Building2, Eye, Users, Bath, Utensils, Sofa, Bed, Tv, Wifi, CreditCard } from "lucide-react";
import { DatePicker } from "../components/date-picker";
import { useAuth } from "../contexts/auth-context";
import { API_BASE } from "../config";
import { BrandLogo } from "../components/brand-logo";

interface ListingSummary {
  id: string;
  title: string;
  city: string;
  address: string;
  country?: string;
  monthlyRent: number;
  deposit: number;
  availableFrom: string;
  images: string[];
  utilitiesIncluded: boolean;
  utilitiesCost: number;
  utilities: Array<{ type: string; included: boolean; amount: number }>;
  landlordName: string;
  landlordProfilePicture: string;
  minStay: number;
  maxStay?: number;
  requireProofOfIdentity: boolean;
  requireProofOfOccupation: boolean;
  requireProofOfIncome: boolean;
}

type ApiListingSummary = Partial<ListingSummary> & {
  media?: Array<{ url?: string }>;
  deposits?: Array<{ amount?: number }>;
  utilities?: Array<{ type?: string; included?: boolean; amount?: number }>;
  minimumRentalPeriod?: number;
  maximumRentalPeriod?: number;
  landlord?: {
    name?: string;
    profilePicture?: string;
    profileImage?: string;
    avatar?: string;
    image?: string;
  };
  requireProofOfIdentity?: boolean;
  requireProofOfOccupation?: boolean;
  requireProofOfIncome?: boolean;
};

function normalizeListingSummary(raw: ApiListingSummary): ListingSummary {
  const mediaImages = Array.isArray(raw.media)
    ? raw.media.map((item) => item?.url).filter((url): url is string => Boolean(url))
    : [];

  const utilities = Array.isArray(raw.utilities) ? raw.utilities : [];
  const normalizedUtilities = utilities.map((utility) => ({
    type: utility?.type ?? "Utility",
    included: Boolean(utility?.included),
    amount: utility?.amount ?? 0,
  }));
  const derivedUtilitiesIncluded = utilities.some((utility) => Boolean(utility?.included));
  const derivedUtilitiesCost = utilities
    .filter((utility) => !utility?.included)
    .reduce((sum, utility) => sum + (utility?.amount ?? 0), 0);

  return {
    id: raw.id ?? "",
    title: raw.title ?? "Listing unavailable",
    city: raw.city ?? "",
    address: raw.address ?? "",
    country: raw.country,
    monthlyRent: raw.monthlyRent ?? 0,
    deposit: raw.deposit ?? raw.deposits?.[0]?.amount ?? 0,
    availableFrom: raw.availableFrom ?? new Date().toISOString(),
    images: Array.isArray(raw.images) ? raw.images : mediaImages,
    utilitiesIncluded: raw.utilitiesIncluded ?? derivedUtilitiesIncluded,
    utilitiesCost: raw.utilitiesCost ?? derivedUtilitiesCost,
    utilities: normalizedUtilities,
    landlordName: raw.landlord?.name ?? "Landlord",
    landlordProfilePicture:
      raw.landlord?.profilePicture ?? raw.landlord?.profileImage ?? raw.landlord?.avatar ?? raw.landlord?.image ?? "",
    minStay: Math.max(1, raw.minStay ?? raw.minimumRentalPeriod ?? 1),
    maxStay: raw.maxStay ?? raw.maximumRentalPeriod,
    requireProofOfIdentity: Boolean(raw.requireProofOfIdentity),
    requireProofOfOccupation: Boolean(raw.requireProofOfOccupation),
    requireProofOfIncome: Boolean(raw.requireProofOfIncome),
  };
}

function addMonthsClamped(date: Date, months: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const maxDayInTarget = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, maxDayInTarget));
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const TENANT_PROTECTION_RATE = 0.1;
const TENANT_PROTECTION_FEE_CAP = 250;
const RENT_GUARANTEE_FEE = 251.54;

export function RentalApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const apiBase = API_BASE;
  const [currentStep, setCurrentStep] = useState(1);
  const [showAskQuestionForm, setShowAskQuestionForm] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<string[]>([]);
  const [questionText, setQuestionText] = useState("");
  const [isSendingQuestion, setIsSendingQuestion] = useState(false);
  const [questionSendError, setQuestionSendError] = useState("");
  const [questionSendSuccess, setQuestionSendSuccess] = useState("");
  const [billingFirstName, setBillingFirstName] = useState("");
  const [billingLastName, setBillingLastName] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [billingStreet, setBillingStreet] = useState("");
  const [billingApartmentNumber, setBillingApartmentNumber] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingStateProvince, setBillingStateProvince] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingAddressConfirmed, setBillingAddressConfirmed] = useState(false);
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<"card" | "ideal" | "bancontact">("card");
  const [billingCardNumber, setBillingCardNumber] = useState("");
  const [billingExpiryDate, setBillingExpiryDate] = useState("");
  const [billingSecurityCode, setBillingSecurityCode] = useState("");
  const [addRentGuarantee, setAddRentGuarantee] = useState(false);
  const [listing, setListing] = useState<ListingSummary | null>(null);
  const [isLoadingListing, setIsLoadingListing] = useState(true);
  const [listingError, setListingError] = useState("");
  const [isListingUnavailable, setIsListingUnavailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [stepOneError, setStepOneError] = useState("");
  const [showLandlordMore, setShowLandlordMore] = useState(false);
  const [isProtectionExpanded, setIsProtectionExpanded] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isMoveInAvailabilityChecked, setIsMoveInAvailabilityChecked] = useState(false);
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const statePayload = (location.state ?? {}) as {
    selectedStartDate?: string | null;
    selectedEndDate?: string | null;
    isMoveInAvailabilityChecked?: boolean;
  };
  const incomingStartDateIso = searchParams.get("moveIn") ?? statePayload.selectedStartDate;
  const incomingEndDateIso = searchParams.get("moveOut") ?? statePayload.selectedEndDate;
  const incomingAvailabilityRaw =
    searchParams.get("available") ??
    (typeof statePayload.isMoveInAvailabilityChecked === "boolean"
      ? statePayload.isMoveInAvailabilityChecked
      : null);
  
  // Dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  
  // Form states
  const [dateOfBirth, setDateOfBirth] = useState({ day: "", month: "", year: "" });
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(null);
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
  
  // Document states
  const [idVerified, setIdVerified] = useState(false);
  const [enrollmentProof, setEnrollmentProof] = useState<File | null>(null);
  const [employmentProof, setEmploymentProof] = useState<File | null>(null);
  const [incomeProof, setIncomeProof] = useState<File | null>(null);
  const [shareDocuments, setShareDocuments] = useState(false);
  const tenantProtectionFee = listing
    ? Math.min(listing.monthlyRent * TENANT_PROTECTION_RATE, TENANT_PROTECTION_FEE_CAP)
    : 0;
  const landlordInitials = (listing?.landlordName ?? "Landlord")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "L";
  const landlordFirstName =
    (listing?.landlordName ?? "Robin")
      .split(" ")
      .map((part) => part.trim())
      .find(Boolean) || "Robin";
  const requiresIdentityProof = Boolean(listing?.requireProofOfIdentity);
  const requiresOccupationProof = Boolean(listing?.requireProofOfOccupation);
  const requiresIncomeProof = Boolean(listing?.requireProofOfIncome);
  const documentsRequiredCount = [requiresIdentityProof, requiresOccupationProof, requiresIncomeProof].filter(Boolean).length;
  const hasRequiredDocuments =
    (!requiresIdentityProof || idVerified) &&
    (!requiresOccupationProof || Boolean(employmentProof)) &&
    (!requiresIncomeProof || Boolean(incomeProof));

  const isAskQuestionMode = currentStep === 1 && showAskQuestionForm;
  const billingCountryLabel =
    billingCountry === "NL" ? "Netherlands" :
    billingCountry === "DE" ? "Germany" :
    billingCountry === "FR" ? "France" :
    billingCountry === "PK" ? "Pakistan" : "";
  const hasBillingAddressDetails = Boolean(
    billingFirstName.trim() &&
    billingLastName.trim() &&
    billingCountry &&
    billingStreet.trim() &&
    billingCity.trim()
  );
  const canSubmitBilling = billingAddressConfirmed;

  const selectedRangeLabel =
    selectedStartDate && selectedEndDate
      ? `${formatDateLabel(selectedStartDate)} - ${formatDateLabel(selectedEndDate)}`
      : "Move in - Move out";

  const rentBreakdownRows = (() => {
    if (!listing || !selectedStartDate || !selectedEndDate || selectedEndDate < selectedStartDate) {
      return [] as Array<{ label: string; value: string; amount: number; original?: string }>;
    }

    const rows: Array<{ label: string; value: string; amount: number; original?: string }> = [];
    const monthlyRent = listing.monthlyRent;
    let cursor = new Date(selectedStartDate);

    while (cursor <= selectedEndDate) {
      const periodStart = new Date(cursor);
      const monthLastDay = monthEnd(periodStart);
      const periodEnd = monthLastDay < selectedEndDate ? monthLastDay : new Date(selectedEndDate);

      const daysInMonth = monthLastDay.getDate();
      const occupiedDays = Math.floor((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      let value = monthlyRent;
      let original: string | undefined;
      if (occupiedDays < daysInMonth) {
        value = (monthlyRent / daysInMonth) * occupiedDays;
        original = `\u20AC${monthlyRent.toFixed(2)}`;
      }

      rows.push({
        label: `${formatDateLabel(periodStart)} - ${formatDateLabel(periodEnd)}`,
        value: `\u20AC${value.toFixed(2)}`,
        amount: value,
        original,
      });

      cursor = new Date(periodEnd);
      cursor.setDate(cursor.getDate() + 1);
    }

    return rows;
  })();
  const rentForSelectedPeriod =
    rentBreakdownRows.length > 0
      ? rentBreakdownRows.reduce((sum, row) => sum + row.amount, 0)
      : listing?.monthlyRent ?? 0;
  const rentLineLabel = selectedStartDate && selectedEndDate ? "Rent for selected period" : "First month's rent";
  const totalAmount = rentForSelectedPeriod + tenantProtectionFee + (addRentGuarantee ? RENT_GUARANTEE_FEE : 0);

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

  const handleSendQuestion = async () => {
    const trimmedQuestion = questionText.trim();
    if (!trimmedQuestion || !id) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    setIsSendingQuestion(true);
    setQuestionSendError("");
    setQuestionSendSuccess("");

    try {
      const topics = expandedTopics.length > 0 ? expandedTopics.join(", ") : "General";
      const messageBody = `Question topic${expandedTopics.length > 1 ? "s" : ""}: ${topics}\n\n${trimmedQuestion}`;

      const conversationResponse = await fetch(`${apiBase}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      });

      if (!conversationResponse.ok) {
        throw new Error("Could not open conversation with landlord.");
      }

      const conversationPayload = (await conversationResponse.json()) as { conversationId: string };

      const messageResponse = await fetch(`${apiBase}/api/conversations/${conversationPayload.conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: messageBody }),
      });

      if (!messageResponse.ok) {
        const payload = (await messageResponse.json().catch(() => ({}))) as { message?: string };
        throw new Error(payload.message ?? "Failed to send your question.");
      }

      setQuestionText("");
      setQuestionSendSuccess("Your question was sent to the landlord.");
    } catch (error) {
      setQuestionSendError(error instanceof Error ? error.message : "Failed to send your question.");
    } finally {
      setIsSendingQuestion(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!id) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
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
          moveInDate: selectedStartDate ? selectedStartDate.toISOString() : null,
          moveOutDate: selectedEndDate ? selectedEndDate.toISOString() : null,
          moveInAvailabilityConfirmed: isMoveInAvailabilityChecked,
          idVerified,
          shareDocuments,
          billingAddress: {
            firstName: billingFirstName,
            lastName: billingLastName,
            country: billingCountry,
            street: billingStreet,
            apartmentNumber: billingApartmentNumber,
            city: billingCity,
            stateProvince: billingStateProvince,
            postalCode: billingPostalCode,
            confirmed: billingAddressConfirmed,
          },
          paymentDetails: {
            method: billingPaymentMethod,
            cardNumber: billingCardNumber,
            expiryDate: billingExpiryDate,
            cardholderName: `${billingFirstName} ${billingLastName}`.trim(),
            isPaid: canSubmitBilling,
            paidAmount: canSubmitBilling ? totalAmount : 0,
            currency: "EUR",
            addRentGuarantee,
            rentGuaranteeFee: addRentGuarantee ? RENT_GUARANTEE_FEE : 0,
            tenantProtectionFee,
            rentForSelectedPeriod,
            totalAmount,
          },
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

        const payload = (await response.json()) as { listing: ApiListingSummary };
        const normalized = normalizeListingSummary(payload.listing);
        setListing(normalized);

        const incomingStartDate = incomingStartDateIso ? new Date(incomingStartDateIso) : null;
        const incomingEndDate = incomingEndDateIso ? new Date(incomingEndDateIso) : null;
        const hasIncomingDates =
          incomingStartDate &&
          incomingEndDate &&
          !Number.isNaN(incomingStartDate.getTime()) &&
          !Number.isNaN(incomingEndDate.getTime()) &&
          incomingEndDate >= incomingStartDate;

        const availableDate = new Date(normalized.availableFrom);

        if (hasIncomingDates) {
          // Keep the exact period chosen on property listing for a consistent flow.
          setSelectedStartDate(incomingStartDate);
          setSelectedEndDate(incomingEndDate);
        } else if (!Number.isNaN(availableDate.getTime())) {
          setSelectedStartDate(availableDate);
          setSelectedEndDate(addMonthsClamped(availableDate, normalized.minStay));
        }

        if (typeof incomingAvailabilityRaw === "boolean") {
          setIsMoveInAvailabilityChecked(incomingAvailabilityRaw);
        } else {
          setIsMoveInAvailabilityChecked(incomingAvailabilityRaw === "1" || incomingAvailabilityRaw === "true");
        }
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
  }, [apiBase, id, incomingAvailabilityRaw, incomingEndDateIso, incomingStartDateIso]);

  const handleDateRangeChange = (nextStart: Date | null, nextEnd: Date | null) => {
    if (!listing || !nextStart || !nextEnd) {
      return;
    }

    const minMoveOut = monthStart(addMonthsClamped(nextStart, listing.minStay));
    if (nextEnd < minMoveOut) {
      return;
    }

    if (listing.maxStay && nextEnd > monthEnd(addMonthsClamped(nextStart, listing.maxStay))) {
      return;
    }

    setSelectedStartDate(nextStart);
    setSelectedEndDate(nextEnd);

    const nextParams = new URLSearchParams(location.search);
    nextParams.set("moveIn", nextStart.toISOString());
    nextParams.set("moveOut", nextEnd.toISOString());
    nextParams.set("available", isMoveInAvailabilityChecked ? "1" : "0");
    navigate(
      {
        pathname: location.pathname,
        search: `?${nextParams.toString()}`,
      },
      {
        replace: true,
        state: {
          ...statePayload,
          selectedStartDate: nextStart.toISOString(),
          selectedEndDate: nextEnd.toISOString(),
          isMoveInAvailabilityChecked,
        },
      }
    );

    setIsDatePickerModalOpen(false);
  };

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
            <span className="text-[15px] font-semibold">Back to listing</span>
          </button>

          <Link to="/" className="flex items-center gap-[8px]">
            <BrandLogo className="h-[68px] sm:h-[76px]" />
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
                <span className="text-neutral-black text-[15px] font-bold">
                  {selectedLanguage === "English" ? "EN" : 
                   selectedLanguage === "EspaÃ±ol" ? "ES" :
                   selectedLanguage === "FranÃ§ais" ? "FR" :
                   selectedLanguage === "Deutsch" ? "DE" :
                   selectedLanguage === "Italiano" ? "IT" :
                   selectedLanguage === "Nederlands" ? "NL" :
                   selectedLanguage === "PortuguÃªs" ? "PT" :
                   selectedLanguage === "Polski" ? "PL" :
                   selectedLanguage === "TÃ¼rkÃ§e" ? "TR" :
                   selectedLanguage === "ä¸­æ–‡" ? "ZH" :
                   selectedLanguage === "æ—¥æœ¬èªž" ? "JA" :
                   selectedLanguage === "í•œêµ­ì–´" ? "KO" : "EN"}
                </span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 top-[48px] bg-white border border-neutral shadow-lg min-w-[160px] z-50">
                  {["English", "EspaÃ±ol", "FranÃ§ais", "Deutsch", "Italiano", "Nederlands", "PortuguÃªs", "Polski", "TÃ¼rkÃ§e", "ä¸­æ–‡", "æ—¥æœ¬èªž", "í•œêµ­ì–´"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full px-[16px] py-[12px] text-left text-[15px] hover:bg-neutral-light-gray transition-colors ${
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
                <span className="text-white text-[15px] font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-[48px] bg-white border border-neutral shadow-lg min-w-[200px] z-50">
                  <div className="px-[16px] py-[12px] border-b border-neutral">
                    <p className="text-neutral-black text-[15px] font-bold">{user?.name || "User"}</p>
                    <p className="text-neutral-gray text-[12px]">{user?.email || "user@example.com"}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/account");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[15px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <User className="w-[16px] h-[16px]" />
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      navigate("/favorites");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[15px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <Check className="w-[16px] h-[16px]" />
                    My Favorites
                  </button>
                  <button
                    onClick={() => {
                      navigate("/tenant/inbox");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[15px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
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
                      className="w-full px-[16px] py-[12px] text-left text-[15px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
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
                className="px-[20px] py-[12px] bg-brand-primary text-white text-[15px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                Create a tenant account
              </button>
              <button
                onClick={() => navigate(`/property/${id}`)}
                className="px-[20px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px] font-semibold hover:bg-[#F7F7F9] transition-colors"
              >
                Back to listing
              </button>
            </div>
          </div>
        </div>
      )}

      {!user?.isLandlord && isLoadingListing && (
        <>
          <div className="bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)]">
            <div className="max-w-[1200px] mx-auto px-[32px] py-[32px]">
              <div className="animate-pulse">
                <div className="h-[2px] w-full bg-[rgba(0,0,0,0.08)] mb-[16px]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E8EDF2]" />
                    <div className="h-[14px] w-[170px] rounded-[4px] bg-[#E8EDF2]" />
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E8EDF2]" />
                    <div className="h-[14px] w-[120px] rounded-[4px] bg-[#E8EDF2]" />
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#E8EDF2]" />
                    <div className="h-[14px] w-[140px] rounded-[4px] bg-[#E8EDF2]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-[1200px] mx-auto px-[32px] pt-[48px] pb-[48px]">
            <div className="animate-pulse flex gap-[64px]">
              <div className="flex-[2] space-y-[26px]">
                <div>
                  <div className="h-[34px] w-[58%] rounded-[4px] bg-[#E8EDF2] mb-[14px]" />
                  <div className="h-[14px] w-[92%] rounded-[4px] bg-[#E8EDF2] mb-[8px]" />
                  <div className="h-[14px] w-[80%] rounded-[4px] bg-[#E8EDF2]" />
                </div>

                <div className="border border-[rgba(0,0,0,0.08)] bg-white p-[22px]">
                  <div className="h-[24px] w-[180px] rounded-[4px] bg-[#E8EDF2] mb-[18px]" />
                  <div className="grid grid-cols-3 gap-[12px] mb-[14px]">
                    <div className="h-[42px] rounded-[4px] bg-[#E8EDF2]" />
                    <div className="h-[42px] rounded-[4px] bg-[#E8EDF2]" />
                    <div className="h-[42px] rounded-[4px] bg-[#E8EDF2]" />
                  </div>
                  <div className="h-[42px] w-[280px] rounded-[4px] bg-[#E8EDF2]" />
                </div>

                <div className="border border-[rgba(0,0,0,0.08)] bg-white p-[22px]">
                  <div className="h-[24px] w-[230px] rounded-[4px] bg-[#E8EDF2] mb-[16px]" />
                  <div className="h-[44px] w-full rounded-[4px] bg-[#E8EDF2] mb-[10px]" />
                  <div className="h-[44px] w-[65%] rounded-[4px] bg-[#E8EDF2]" />
                </div>

                <div className="border border-[rgba(0,0,0,0.08)] bg-white p-[22px]">
                  <div className="h-[24px] w-[180px] rounded-[4px] bg-[#E8EDF2] mb-[12px]" />
                  <div className="h-[140px] w-full rounded-[6px] bg-[#E8EDF2] mb-[12px]" />
                  <div className="h-[60px] w-full rounded-[6px] bg-[#E8EDF2]" />
                </div>
              </div>

              <div className="flex-[1]">
                <div className="sticky top-[100px] space-y-[12px]">
                  <div className="border border-[rgba(15,45,54,0.14)] rounded-[6px] bg-white p-[16px]">
                    <div className="h-[84px] w-full rounded-[8px] bg-[#E8EDF2] mb-[12px]" />
                    <div className="h-[16px] w-[72%] rounded-[4px] bg-[#E8EDF2] mb-[8px]" />
                    <div className="h-[16px] w-[56%] rounded-[4px] bg-[#E8EDF2] mb-[16px]" />
                    <div className="h-[42px] w-full rounded-[6px] bg-[#E8EDF2]" />
                  </div>

                  <div className="border border-[rgba(15,45,54,0.14)] rounded-[6px] bg-white p-[16px]">
                    <div className="h-[18px] w-[52%] rounded-[4px] bg-[#E8EDF2] mb-[10px]" />
                    <div className="h-[14px] w-[92%] rounded-[4px] bg-[#E8EDF2] mb-[6px]" />
                    <div className="h-[14px] w-[85%] rounded-[4px] bg-[#E8EDF2]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
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
                className="px-[20px] py-[12px] bg-brand-primary text-white text-[15px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                View my applications
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-[20px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px] font-semibold hover:bg-[#F7F7F9] transition-colors"
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
      {!isAskQuestionMode && currentStep !== 3 && (
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
                {currentStep > 1 ? <Check className="w-[16px] h-[16px]" /> : <span className="font-bold text-[15px]">1</span>}
              </div>
              <span className={`text-[15px] font-semibold bg-neutral-light-gray px-[8px] ${currentStep >= 1 ? "text-neutral-black" : "text-neutral-gray"}`}>
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
                {currentStep > 2 ? <Check className="w-[16px] h-[16px]" /> : <span className="font-bold text-[15px]">2</span>}
              </div>
              <span className={`text-[15px] font-semibold bg-neutral-light-gray px-[8px] ${currentStep >= 2 ? "text-neutral-black" : "text-neutral-gray"}`}>
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
                <span className="font-bold text-[15px]">3</span>
              </div>
              <span className={`text-[15px] font-semibold bg-neutral-light-gray px-[8px] ${currentStep >= 3 ? "text-neutral-black" : "text-neutral-gray"}`}>
                Submit application
              </span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div className={`max-w-[1200px] mx-auto px-[32px] pt-[48px] ${currentStep === 1 && !showAskQuestionForm ? "pb-[180px]" : "pb-[48px]"}`}>
        <div className="flex gap-[64px]">
          {/* Left Column */}
          <div className="flex-[2]">
            {/* STEP 1: Fill in rental application */}
            {currentStep === 1 && (
              <div className="pb-[180px]">
                {!showAskQuestionForm && (<>
                <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[16px]">
                  Fill in your rental application in 5 minutes
                </h1>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[32px]">
                  Confirm your details and introduce yourself to {landlordFirstName} - we'll save your info for future applications. Not quite ready to apply?{" "}
                  <button
                    type="button"
                    onClick={() => setShowAskQuestionForm(true)}
                    className="text-[#0F2D36] underline underline-offset-[4px] decoration-[1px] hover:text-[#0A2530] transition-colors cursor-pointer"
                  >
                    Ask {landlordFirstName} a question.
                  </button>
                </p>

                {/* About You Section */}
                <div className="mb-[48px]">
                  <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">About you</h2>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">Date of birth*</label>
                    <div className="grid grid-cols-3 gap-[16px]">
                      <select
                        value={dateOfBirth.day}
                        onChange={(e) => setDateOfBirth({ ...dateOfBirth, day: e.target.value })}
                        className="px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px] bg-white"
                      >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <select
                        value={dateOfBirth.month}
                        onChange={(e) => setDateOfBirth({ ...dateOfBirth, month: e.target.value })}
                        className="px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px] bg-white"
                      >
                        <option value="">Month</option>
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, idx) => (
                          <option key={month} value={idx + 1}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={dateOfBirth.year}
                        onChange={(e) => setDateOfBirth({ ...dateOfBirth, year: e.target.value })}
                        className="px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px] bg-white"
                      >
                        <option value="">Year</option>
                        {Array.from({ length: 80 }, (_, i) => 2010 - i).map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">Gender*</label>
                    <div className="flex items-center gap-[12px]">
                      {[
                        { value: "male", label: "Male", symbol: "♂" },
                        { value: "female", label: "Female", symbol: "♀" },
                        { value: "other", label: "Other", symbol: "⚧" }
                      ].map(({ value, label, symbol }) => (
                        <button
                          key={value}
                          onClick={() => setGender(value as any)}
                          className={`px-[24px] py-[10px] border transition-colors ${
                            gender === value ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                          }`}
                        >
                          <span className={`inline-flex items-center gap-[8px] text-[15px] font-semibold ${gender === value ? "text-brand-primary" : "text-neutral-black"}`}>
                            <span className="text-[22px] leading-none" aria-hidden="true">{symbol}</span>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-[24px]">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <label className="text-[#1A1A1A] text-[15px] font-semibold">Profile picture (Optional)</label>
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
                    <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">How many people will move in?*</label>
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
                      <label className="text-[#1A1A1A] text-[15px] font-semibold">With pet(s)</label>
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
                  <p className="text-[#6B6B6B] text-[15px] mb-[24px]">
                    We may ask more questions depending on your occupation.
                  </p>

                  <div className="mb-[24px]">
                    <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">Occupation*</label>
                    <div className="flex items-center gap-[12px]">
                      {[
                        { value: "student", label: "Student", icon: GraduationCap },
                        { value: "professional", label: "Working professional", icon: Briefcase },
                        { value: "other", label: "Other", icon: Sparkles }
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => setOccupation(value as any)}
                          className={`px-[24px] py-[10px] border transition-colors ${
                            occupation === value ? "border-brand-primary bg-brand-light" : "border-[rgba(0,0,0,0.16)] bg-white hover:bg-neutral-light-gray"
                          }`}
                        >
                          <span className={`inline-flex items-center gap-[8px] text-[15px] font-semibold ${occupation === value ? "text-brand-primary" : "text-neutral-black"}`}>
                            <Icon className="w-[16px] h-[16px]" />
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
                        <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">University name</label>
                        <input
                          type="text"
                          value={universityName}
                          onChange={(e) => setUniversityName(e.target.value)}
                          placeholder="PUCIT"
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px]"
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
                        <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">What is your visa status?</label>
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
                              <span className="text-[#1A1A1A] text-[15px]">{label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">
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
                              <span className="text-[#1A1A1A] text-[15px]">{label}</span>
                            </label>
                          ))}
                        </div>

                        <div className="mt-[12px] flex items-start gap-[12px] rounded-[6px] bg-[#EEF3F7] px-[16px] py-[14px]">
                          <Info className="w-[22px] h-[22px] text-[#0F2D36] mt-[2px] shrink-0" />
                          <p className="text-[#0F2D36] text-[15px] leading-[1.55]">
                            We recommend sharing details about your financial situation in your supporting message below. You can add supporting documents in the next step.
                          </p>
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">
                          Estimate how much money you'll have each month
                        </label>
                        <p className="text-[#6B6B6B] text-[13px] mb-[8px] leading-[1.6]">
                          Including for rent and other living expenses. This helps landlords understand your financial
                          situation, so they feel confident renting to you.
                        </p>
                        <div className="relative">
                          <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#6B6B6B] text-[15px]">{"\u20AC"}</span>
                          <input
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder=""
                            min={0}
                            step="1"
                            className="w-[250px] pl-[32px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px]"
                          />
                        </div>

                        <div className="mt-[12px] flex items-start gap-[12px] rounded-[6px] bg-[#EEF3F7] px-[16px] py-[12px]">
                          <Info className="w-[22px] h-[22px] text-[#0F2D36] mt-[2px] shrink-0" />
                          <p className="text-[#0F2D36] text-[15px] leading-[1.5]">
                            You can add proof of income in the next step.
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Working professional-specific fields */}
                  {occupation === "professional" && (
                    <>
                      <div className="mb-[24px]">
                        <label className="block text-[#1A1A1A] text-[15px] font-semibold mb-[8px]">Employer's name</label>
                        <input
                          type="text"
                          value={employerName}
                          onChange={(e) => setEmployerName(e.target.value)}
                          placeholder=""
                          className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[15px]"
                        />
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-neutral-black text-[15px] font-semibold mb-[8px]">Your income</label>
                        <div className="relative">
                          <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-neutral-gray text-[15px]">{"\u20AC"}</span>
                          <input
                            type="number"
                            value={income}
                            onChange={(e) => setIncome(e.target.value)}
                            placeholder=""
                            min={0}
                            step="1"
                            className="w-[250px] pl-[32px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[15px]"
                          />
                        </div>

                        <div className="mt-[12px] flex items-start gap-[12px] rounded-[6px] bg-[#EEF3F7] px-[16px] py-[12px]">
                          <Info className="w-[22px] h-[22px] text-[#0F2D36] mt-[2px] shrink-0" />
                          <p className="text-[#0F2D36] text-[15px] leading-[1.5]">
                            You can add proof of income in the next step.
                          </p>
                        </div>
                      </div>

                      <div className="mb-[24px]">
                        <label className="block text-neutral-black text-[15px] font-semibold mb-[8px]">What is your visa status?</label>
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
                              <span className="text-neutral-black text-[15px]">{label}</span>
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
                      <label className="text-[#1A1A1A] text-[15px] font-semibold">
                        Introduce yourself to {landlordFirstName}*
                      </label>
                      <span className="relative group inline-flex items-center">
                        <Info className="w-[14px] h-[14px] text-[#94A3AE]" />
                        <span className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-[240px] bg-neutral-black text-white text-[11px] leading-[1.4] px-[10px] py-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-20">
                          Share your background, move-in plan, and why you would be a great tenant.
                        </span>
                      </span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={supportingMessage}
                        onChange={(e) => setSupportingMessage(e.target.value)}
                        placeholder="Introduce yourself and mention why you are a good tenant"
                        rows={4}
                        maxLength={2000}
                        className="w-full px-[18px] py-[14px] pr-[84px] border border-[#0F2D36] rounded-[6px] text-[#0F2D36] text-[15px] leading-[1.55] resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => setSupportingMessage("")}
                        className="absolute right-[16px] bottom-[16px] text-[#0F2D36] text-[15px] hover:text-[#0A2530] transition-colors"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="mt-[16px] rounded-[6px] bg-[#EEF3F7] px-[16px] py-[14px] flex items-start gap-[12px]">
                      <Info className="w-[22px] h-[22px] text-[#0F2D36] mt-[2px] shrink-0" />
                      <p className="text-[#0F2D36] text-[15px] leading-[1.55]">
                        Viewings aren't possible, but you can ask the landlord for video tours, floor plans, and more. When you message and pay on ReserveHousing, you're covered by Tenant Protection. <button type="button" className="underline underline-offset-[4px] hover:text-[#0A2530] transition-colors cursor-pointer">How you're protected</button>
                      </p>
                    </div>
                  </div>
                </div>
                </>)}

                {showAskQuestionForm && (
                  <div>
                    <h3 className="text-[#1A1A1A] text-[32px] font-bold mb-[12px]">Ask {landlordFirstName} a question</h3>
                    <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[8px]">
                      Landlords can take a few days to respond. If you love this place and your question isn't a dealbreaker, you may want to move quickly.{" "}
                      <button
                        type="button"
                        onClick={() => setShowAskQuestionForm(false)}
                        className="text-[#0F2D36] underline underline-offset-[4px] decoration-[1px] hover:text-[#0A2530] transition-colors cursor-pointer"
                      >
                        Apply to rent.
                      </button>
                    </p>
                    <h4 className="text-[#1A1A1A] text-[18px] font-bold mb-[16px] mt-[24px]">What's your question about?</h4>
                    <div className="grid grid-cols-2 gap-[16px] mb-[24px]">
                      {[
                        { label: "Dates & duration", icon: Calendar },
                        { label: "Price & payments", icon: CircleDollarSign },
                        { label: "Property details & amenities", icon: Building2 },
                        { label: "Viewings", icon: Eye },
                        { label: "Required documents", icon: FileText },
                        { label: "People & housemates", icon: Users },
                        { label: "Additional needs & requests", icon: Heart },
                        { label: "Other", icon: Sparkles }
                      ].map(({ label, icon: Icon }) => {
                        const isExpanded = expandedTopics.includes(label);
                        return (
                          <button
                            key={label}
                            onClick={() => {
                              setExpandedTopics(prevTopics =>
                                prevTopics.includes(label)
                                  ? prevTopics.filter(t => t !== label)
                                  : [...prevTopics, label]
                              );
                            }}
                            className={`px-[16px] py-[14px] rounded-[6px] border transition-all flex items-start gap-[10px] ${isExpanded ? "border-[#3B73D9] bg-[#E9F0FF]" : "border-[rgba(15,45,54,0.18)] bg-white hover:bg-[#F7F7F9]"}`}
                          >
                            <Icon className={`w-[19px] h-[19px] shrink-0 mt-[2px] ${isExpanded ? "text-[#3B73D9]" : "text-[#0F2D36]"}`} />
                            <span className={`text-[15px] font-semibold text-left ${isExpanded ? "text-[#3B73D9]" : "text-[#0F2D36]"}`}>{label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Topic Content */}
                    {expandedTopics.includes("Dates & duration") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Dates & duration info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] space-y-[12px]">
                          <div className="flex items-start gap-[8px]">
                            <span className="text-[#0F2D36] text-[15px]">•</span>
                            <span className="text-[#0F2D36] text-[15px]">Available from: {listing?.availableFrom ? new Date(listing.availableFrom).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : "TBD"}</span>
                          </div>
                          <div className="flex items-start gap-[8px]">
                            <span className="text-[#0F2D36] text-[15px]">•</span>
                            <span className="text-[#0F2D36] text-[15px]">Minimum stay: {listing?.minStay} {listing?.minStay === 1 ? "month" : "months"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("Price & payments") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Price & payments info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] space-y-[16px] text-[#0F2D36] text-[15px] leading-[1.6]">
                          <div className="space-y-[12px]">
                            <div className="flex items-start gap-[8px]">
                              <span className="text-[15px]">•</span>
                              <span>To protect your money, always pay on ReserveHousing. We'll transfer your first month's rent to the landlord 48 hours after you move in. If the place isn't as advertised, you're covered by <button className="text-[#0F2D36] underline underline-offset-[2px] hover:text-[#0A2530]">Tenant Protection</button>.</span>
                            </div>
                            <div className="flex items-start gap-[8px]">
                              <span className="text-[15px]">•</span>
                              <span>This listing's rent is calculated on a daily basis. For the first and last months of your stay, you'll only pay for the exact number of nights you stay — just like a hotel. For all other months, you'll pay the full month's rent. We call this a Daily contract type.</span>
                            </div>
                          </div>

                          <div className="border-t border-[rgba(0,0,0,0.12)] pt-[16px]">
                            <p className="mb-[12px]">To confirm your rental, you'll need to pay one month's rent in full. Any excess rent you pay for the first month will be subtracted from the next month's rent.</p>
                          </div>

                          <div className="border-t border-[rgba(0,0,0,0.12)] pt-[16px]">
                            <h6 className="text-[15px] font-bold mb-[12px]">Additional fees and charges from landlords</h6>
                            <p className="mb-[12px]">Landlords may have additional fees due after your rental is confirmed on ReserveHousing. We found references to the following fees in the listing description. Please message the landlord to confirm any fees and agree on payment terms.</p>
                            <ul className="space-y-[8px]">
                              <li className="flex items-start gap-[8px]">
                                <span className="text-[15px]">•</span>
                                <span>Security deposit: €{listing?.deposit.toFixed(2) ?? "TBD"}</span>
                              </li>
                              <li className="flex items-start gap-[8px]">
                                <span className="text-[15px]">•</span>
                                <span>Landlord administration fee: €490.00</span>
                              </li>
                              <li className="flex items-start gap-[8px]">
                                <span className="text-[15px]">•</span>
                                <span>Utilities: €0.00</span>
                              </li>
                              <li className="flex items-start gap-[8px]">
                                <span className="text-[15px]">•</span>
                                <span>Cleaning fee: €0.00</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("Property details & amenities") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Property details & amenities info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] space-y-[18px] text-[#0F2D36] text-[15px] leading-[1.6]">
                          <ul className="space-y-[8px]">
                            <li className="flex items-start gap-[8px]"><span>•</span><span>{listing?.title || "Private room in apartment (1 bedroom)"}</span></li>
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Bedroom: 13 m²</span></li>
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Property: 13 m²</span></li>
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Furnished</span></li>
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Space for 0 people</span></li>
                          </ul>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] pt-[4px]">
                            <div>
                              <h6 className="text-[15px] font-bold mb-[8px]">Facilities</h6>
                              <ul className="space-y-[6px]">
                                <li className="flex items-center gap-[8px]"><Bath className="w-[16px] h-[16px]" />Shared toilet</li>
                                <li className="flex items-center gap-[8px]"><Utensils className="w-[16px] h-[16px]" />Private kitchen</li>
                                <li className="flex items-center gap-[8px]"><Sofa className="w-[16px] h-[16px]" />Private living room</li>
                                <li className="line-through text-[#7A8790]">No parking</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="text-[15px] font-bold mb-[8px]">Amenities</h6>
                              <ul className="space-y-[6px]">
                                <li className="flex items-center gap-[8px]"><Bed className="w-[16px] h-[16px]" />Bed</li>
                                <li className="flex items-center gap-[8px]"><User className="w-[16px] h-[16px]" />Closet</li>
                                <li className="flex items-center gap-[8px]"><FileText className="w-[16px] h-[16px]" />Desk</li>
                                <li className="flex items-center gap-[8px]"><Utensils className="w-[16px] h-[16px]" />Dishwasher</li>
                                <li className="flex items-center gap-[8px]"><Sparkles className="w-[16px] h-[16px]" />Dryer</li>
                                <li className="flex items-center gap-[8px]"><Shield className="w-[16px] h-[16px]" />Bedroom lock</li>
                                <li className="flex items-center gap-[8px]"><Sofa className="w-[16px] h-[16px]" />Living room furniture</li>
                                <li className="flex items-center gap-[8px]"><Tv className="w-[16px] h-[16px]" />TV</li>
                                <li className="flex items-center gap-[8px]"><Upload className="w-[16px] h-[16px]" />Washing machine</li>
                                <li className="flex items-center gap-[8px]"><Wifi className="w-[16px] h-[16px]" />WiFi</li>
                                <li className="line-through text-[#7A8790]">No air conditioning</li>
                                <li className="line-through text-[#7A8790]">Not access friendly</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("Viewings") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Viewings info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] space-y-[12px] text-[#0F2D36] text-[15px] leading-[1.6]">
                          <p>At ReserveHousing, in-person viewings are not supported. So everyone has an equal chance to rent, no matter where you are in the world.</p>
                          <p>To stay safe, always message and pay on ReserveHousing. This helps us verify everyone's details, and prevents off-platform agreements that could compromise your safety.</p>

                          <div className="pt-[6px]">
                            <h6 className="text-[15px] font-bold mb-[8px]">Find your next home without a viewing</h6>
                            <p className="mb-[8px]">To help you make an informed decision, we recommend:</p>
                            <ul className="space-y-[8px]">
                              <li className="flex items-start gap-[8px]"><span>•</span><span>Messaging the landlord on ReserveHousing to ask any questions.</span></li>
                              <li className="flex items-start gap-[8px]"><span>•</span><span>Requesting more photos, video tours, or floor plans.</span></li>
                            </ul>
                          </div>

                          <div className="pt-[6px]">
                            <h6 className="text-[15px] font-bold mb-[8px]">Your rental is covered by Tenant Protection</h6>
                            <p className="mb-[8px]">We know that renting without seeing a place in person can feel like a big step. That's why every rental on ReserveHousing is backed by <button className="text-[#0F2D36] underline underline-offset-[2px] hover:text-[#0A2530]">Tenant Protection</button>.</p>
                            <ul className="space-y-[8px]">
                              <li className="flex items-start gap-[8px]"><span>•</span><span>If the place is not as advertised when you move in, you can <button className="text-[#0F2D36] underline underline-offset-[2px] hover:text-[#0A2530]">cancel within 48 hours</button>.</span></li>
                              <li className="flex items-start gap-[8px]"><span>•</span><span>If your reason for cancelling is covered by our policies, we'll help you find a new place to stay. If needed, we can also provide a temporary hotel stay.</span></li>
                              <li className="flex items-start gap-[8px]"><span>•</span><span>If we can't find you a suitable home, you'll receive a full refund.</span></li>
                            </ul>
                            <p className="mt-[8px]"><span className="mr-[4px]">👉</span>For more details, see our <button className="text-[#0F2D36] underline underline-offset-[2px] hover:text-[#0A2530]">Terms & Conditions</button>, section 15.16.2. Refund eligibility.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("Additional needs & requests") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Additional needs & requests info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] text-[#0F2D36] text-[15px] leading-[1.6]">
                          <ul className="space-y-[8px]">
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Pets not allowed</span></li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("People & housemates") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">People & housemates info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] text-[#0F2D36] text-[15px] leading-[1.6] space-y-[14px]">
                          <div>
                            <h6 className="text-[15px] font-bold mb-[6px]">Who can rent this place</h6>
                          </div>
                          <div>
                            <h6 className="text-[15px] font-bold mb-[6px]">Who you'll be living with</h6>
                            <ul className="space-y-[8px]">
                              <li className="flex items-start gap-[8px]"><span>•</span><span>Number of housemates: 0</span></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("Required documents") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Required documents info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                        <div className="mt-[16px] text-[#0F2D36] text-[15px] leading-[1.6]">
                          <p className="mb-[10px]">The landlord needs these documents to confirm your rental. We'll always ask your consent before sharing them with a new verified landlord.</p>
                          <ul className="space-y-[8px]">
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Proof of identity — Government-issued ID or passport.</span></li>
                            <li className="flex items-start gap-[8px]"><span>•</span><span>Proof of enrollment or occupation — University enrollment certificate, internship or employment contract.</span></li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {expandedTopics.includes("Other") && (
                      <div className="border border-[rgba(0,0,0,0.12)] rounded-[6px] p-[20px] mb-[24px]">
                        <button className="w-full flex items-center justify-between text-left">
                          <h5 className="text-[#0F2D36] text-[18px] font-bold">Other info</h5>
                          <ChevronDown className="w-[24px] h-[24px] text-[#0F2D36]" />
                        </button>
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-[#E8EEF4] rounded-[6px] p-[16px] mb-[24px]">
                      <p className="text-[#0F2D36] text-[14px] leading-[1.6]">
                        <span className="font-bold">Get your foot in the door 👉🏠</span> — If this answered your question, you can{" "}
                        <button
                          type="button"
                          onClick={() => setShowAskQuestionForm(false)}
                          className="text-[#0F2D36] underline underline-offset-[4px] decoration-[1px] hover:text-[#0A2530] transition-colors cursor-pointer"
                        >
                          apply to rent
                        </button>
                        . Your application will go straight to the top of the landlord's inbox!
                      </p>
                    </div>

                    {/* Question Textarea */}
                    <h4 className="text-[#0F2D36] text-[16px] font-bold mb-[12px]">What's your question about?</h4>
                    <div className="mb-[16px]">
                      <textarea
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Ask away, world traveller..."
                        className="w-full px-[16px] py-[14px] border border-[rgba(0,0,0,0.16)] rounded-[6px] text-[#0F2D36] text-[15px] leading-[1.6] resize-none"
                        rows={6}
                      />
                      <div className="flex justify-end mt-[8px]">
                        <button
                          type="button"
                          onClick={() => setQuestionText("")}
                          className="text-[#0F2D36] text-[15px] underline underline-offset-[4px] hover:text-[#0A2530] transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Send Button */}
                    <button
                      type="button"
                      onClick={handleSendQuestion}
                      disabled={!questionText.trim() || isSendingQuestion}
                      className={`px-[24px] py-[12px] rounded-[6px] font-semibold text-[15px] transition-colors ${
                        questionText.trim() && !isSendingQuestion
                          ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                          : "bg-[#E0E8EF] text-[#8A969C] cursor-not-allowed"
                      }`}
                    >
                      {isSendingQuestion ? "Sending..." : "Send question"}
                    </button>
                    {questionSendError && <p className="text-[#B80F3D] text-[14px] mt-[10px]">{questionSendError}</p>}
                    {questionSendSuccess && <p className="text-[#0E7A48] text-[14px] mt-[10px]">{questionSendSuccess}</p>}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Add documents */}
            {currentStep === 2 && (
              <>
                <h1 className="text-[#0F2D36] text-[38px] md:text-[32px] font-bold tracking-[-0.02em] mb-[6px]">
                  Add documents to stand out
                </h1>
                <p className="text-[#0F2D36] text-[15px] leading-[1.55] mb-[4px]">
                  Show {landlordFirstName} you're committed to renting this place. {documentsRequiredCount > 0 ? `This property requires ${documentsRequiredCount} document${documentsRequiredCount > 1 ? "s" : ""} from the landlord settings.` : "No mandatory documents are configured for this property."} <button type="button" className="underline underline-offset-[3px] hover:text-[#0A2530] transition-colors">About document security</button>
                </p>
                <p className="text-[#6B7A84] text-[13px] leading-[1.5] mb-[18px]">
                  Max. file size: 7MB | Accepted formats: pdf, png, jpg, jpeg | Multiple uploads possible
                </p>

                <div className="space-y-[12px]">
                  {requiresIdentityProof && (
                  <div className="rounded-[6px] border border-[rgba(15,45,54,0.14)] bg-white px-[18px] py-[16px]">
                    <div className="flex items-start justify-between gap-[12px] mb-[12px]">
                      <p className="text-[#0F2D36] text-[28px] md:text-[30px] font-bold leading-[1.15]">
                        ID verification <span className="text-[12px] font-semibold text-[#6C7785]">Powered by <span className="text-[#635BFF]">stripe</span></span>
                      </p>
                      <span className="inline-flex items-center rounded-full bg-[#B80F3D] px-[10px] py-[2px] text-white text-[12px] font-semibold">
                        {idVerified ? "Done" : "To-do"}
                      </span>
                    </div>

                    <div className="space-y-[10px] mb-[14px]">
                      <div className="flex items-start gap-[10px]">
                        <FileText className="w-[18px] h-[18px] text-[#0F2D36] mt-[2px] shrink-0" />
                        <p className="text-[#0F2D36] text-[15px] leading-[1.45]"><span className="font-semibold">We'll check</span><br />Your government-issued photo ID against a selfie.</p>
                      </div>
                      <div className="flex items-start gap-[10px]">
                        <Check className="w-[18px] h-[18px] text-[#0F2D36] mt-[2px] shrink-0" />
                        <p className="text-[#0F2D36] text-[15px] leading-[1.45]"><span className="font-semibold">You'll receive</span><br />A Verified ID badge to boost your chances of renting.</p>
                      </div>
                      <div className="flex items-start gap-[10px]">
                        <User className="w-[18px] h-[18px] text-[#0F2D36] mt-[2px] shrink-0" />
                        <p className="text-[#0F2D36] text-[15px] leading-[1.45]"><span className="font-semibold">Landlords will see</span><br />Your new badge. And your ID, once you choose to share it with them.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIdVerified(true)}
                      className="h-[42px] px-[16px] rounded-[4px] border border-[rgba(15,45,54,0.22)] bg-[#F7FAFC] text-[#0F2D36] text-[15px] font-semibold hover:bg-[#EEF3F7] transition-colors"
                    >
                      {idVerified ? "Identity confirmed" : "Confirm my identity"}
                    </button>
                  </div>
                  )}

                  {requiresOccupationProof && (
                  <div className="rounded-[6px] border border-[rgba(15,45,54,0.14)] bg-white px-[18px] py-[16px]">
                    <div className="flex items-start justify-between gap-[12px] mb-[8px]">
                      <p className="text-[#0F2D36] text-[33px] md:text-[30px] font-bold leading-[1.15]">Proof of enrollment or occupation</p>
                      <span className="inline-flex items-center rounded-full bg-[#B80F3D] px-[10px] py-[2px] text-white text-[12px] font-semibold">
                        {employmentProof ? "Done" : "To-do"}
                      </span>
                    </div>
                    <p className="text-[#0F2D36] text-[15px] leading-[1.5] mb-[12px]">University enrollment certificate, internship or employment contract.</p>
                    {employmentProof ? (
                      <div className="flex items-center gap-[12px] flex-wrap">
                        <span className="text-[#0F2D36] text-[15px] font-semibold">{employmentProof.name}</span>
                        <button type="button" onClick={() => setEmploymentProof(null)} className="text-[#0F2D36] text-[13px] underline hover:text-[#0A2530]">Remove</button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center h-[38px] px-[14px] rounded-[4px] border border-[rgba(15,45,54,0.22)] bg-[#F7FAFC] text-[#0F2D36] text-[15px] font-semibold cursor-pointer hover:bg-[#EEF3F7] transition-colors">
                        Upload
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "employment")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  )}

                  {requiresIncomeProof && (
                  <div className="rounded-[6px] border border-[rgba(15,45,54,0.14)] bg-white px-[18px] py-[16px]">
                    <div className="flex items-start justify-between gap-[12px] mb-[8px]">
                      <p className="text-[#0F2D36] text-[33px] md:text-[30px] font-bold leading-[1.15]">Proof of income</p>
                      <span className="inline-flex items-center rounded-full bg-[#B80F3D] px-[10px] py-[2px] text-white text-[12px] font-semibold">
                        {incomeProof ? "Done" : "To-do"}
                      </span>
                    </div>
                    <p className="text-[#0F2D36] text-[15px] leading-[1.5] mb-[12px]">Salary slip or bank statements from the tenant or their sponsor.</p>
                    {incomeProof ? (
                      <div className="flex items-center gap-[12px] flex-wrap">
                        <span className="text-[#0F2D36] text-[15px] font-semibold">{incomeProof.name}</span>
                        <button type="button" onClick={() => setIncomeProof(null)} className="text-[#0F2D36] text-[13px] underline hover:text-[#0A2530]">Remove</button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center h-[38px] px-[14px] rounded-[4px] border border-[rgba(15,45,54,0.22)] bg-[#F7FAFC] text-[#0F2D36] text-[15px] font-semibold cursor-pointer hover:bg-[#EEF3F7] transition-colors">
                        Upload
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0], "income")}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  )}
                </div>

                <div className="mt-[18px] mb-[18px] bg-white px-[2px]">
                  <label className="flex items-start gap-[12px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareDocuments}
                      onChange={(e) => setShareDocuments(e.target.checked)}
                      className="w-[18px] h-[18px] border border-[rgba(0,0,0,0.2)] rounded-[2px] mt-[2px]"
                    />
                    <span className="text-[#1A1A1A] text-[15px] leading-[1.6]">
                      I agree to share these documents only with {landlordFirstName}, in accordance with ReserveHousing's <button type="button" className="underline hover:text-[#0A2530]">Terms &amp; Conditions</button> and <button type="button" className="underline hover:text-[#0A2530]">Privacy Policy</button>.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-[12px]">
                  <button
                    onClick={() => {
                      if (!requiresIdentityProof) {
                        setIdVerified(false);
                      }
                      handleContinue();
                    }}
                    disabled={!shareDocuments || !hasRequiredDocuments}
                    className={`h-[44px] px-[22px] rounded-[4px] font-semibold transition-colors text-[16px] ${
                      shareDocuments && hasRequiredDocuments
                        ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                        : "bg-[#EDEDED] text-[#8A969C] cursor-not-allowed"
                    }`}
                  >
                    Share and continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(3);
                      window.scrollTo(0, 0);
                    }}
                    className="h-[44px] px-[18px] rounded-[4px] border border-[rgba(15,45,54,0.24)] bg-[#F3F6F9] text-[#0F2D36] text-[16px] font-semibold hover:bg-[#E9EEF3] transition-colors"
                  >
                    I'll do it later
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: Submit application */}
            {currentStep === 3 && (
              <>
                <h1 className="text-[#0F2D36] text-[42px] md:text-[38px] font-bold tracking-[-0.02em] mb-[18px]">
                  Apply to rent {listing?.title ?? "Rue Lépine"}
                </h1>

                <div className="bg-[#E8EEF4] rounded-[6px] px-[22px] py-[18px] mb-[34px]">
                  <p className="text-[#0F2D36] text-[15px] leading-[1.6]">
                    <span className="font-bold">Why add payment details?</span> Adding payment details allows you to submit your rental application. {landlordFirstName} has 48 hours to respond. We only charge you if they accept your application and confirm your stay.
                  </p>
                </div>

                <h2 className="text-[#0F2D36] text-[40px] md:text-[32px] font-bold mb-[20px]">1. Billing address</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[12px]">
                  <div>
                    <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">First name</label>
                    <input
                      type="text"
                      value={billingFirstName}
                      onChange={(e) => {
                        setBillingFirstName(e.target.value);
                        setBillingAddressConfirmed(false);
                      }}
                      placeholder="Brand"
                      className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.34)] rounded-[4px] text-[#0F2D36] text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">Last name</label>
                    <input
                      type="text"
                      value={billingLastName}
                      onChange={(e) => {
                        setBillingLastName(e.target.value);
                        setBillingAddressConfirmed(false);
                      }}
                      placeholder="Com"
                      className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.34)] rounded-[4px] text-[#0F2D36] text-[15px]"
                    />
                  </div>
                </div>

                <div className="mb-[26px]">
                  <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">Country</label>
                  <div className="relative">
                    <select
                      value={billingCountry}
                      onChange={(e) => {
                        setBillingCountry(e.target.value);
                        setBillingAddressConfirmed(false);
                      }}
                      className="w-full h-[48px] px-[12px] pr-[40px] border border-[rgba(15,45,54,0.34)] rounded-[4px] text-[#0F2D36] text-[15px] appearance-none bg-white"
                    >
                      <option value="">Select country</option>
                      <option value="NL">Netherlands</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="PK">Pakistan</option>
                    </select>
                    <ChevronDown className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#0F2D36] pointer-events-none" />
                  </div>
                </div>

                {billingCountry && !billingAddressConfirmed && (
                  <div className="mb-[26px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[12px]">
                      <div>
                        <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">Street</label>
                        <input
                          type="text"
                          value={billingStreet}
                          onChange={(e) => setBillingStreet(e.target.value)}
                          className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">Apartment number</label>
                        <input
                          type="text"
                          value={billingApartmentNumber}
                          onChange={(e) => setBillingApartmentNumber(e.target.value)}
                          placeholder="Apt., suite, unit number, etc."
                          className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[12px]">
                      <div>
                        <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">City</label>
                        <input
                          type="text"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                          className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">State/Province (optional)</label>
                        <input
                          type="text"
                          value={billingStateProvince}
                          onChange={(e) => setBillingStateProvince(e.target.value)}
                          className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[14px]">
                      <div>
                        <label className="block text-[#0F2D36] text-[14px] font-semibold mb-[6px]">Postal/ZIP code (optional)</label>
                        <input
                          type="text"
                          value={billingPostalCode}
                          onChange={(e) => setBillingPostalCode(e.target.value)}
                          className="w-full h-[48px] px-[12px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBillingAddressConfirmed(true)}
                      disabled={!hasBillingAddressDetails}
                      className={`h-[44px] px-[18px] rounded-[6px] font-semibold text-[15px] transition-colors ${hasBillingAddressDetails ? "bg-brand-primary text-white hover:bg-brand-primary-dark" : "bg-[#E0E8EF] text-[#8A969C] cursor-not-allowed"}`}
                    >
                      Confirm
                    </button>
                  </div>
                )}

                {billingAddressConfirmed && (
                  <div className="mb-[26px] border border-[rgba(15,45,54,0.24)] rounded-[8px] px-[16px] py-[14px]">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-[12px]">
                      <div className="min-w-0">
                        <div className="flex items-center gap-[8px] mb-[4px]">
                          <CheckCircle2 className="w-[16px] h-[16px] text-[#0E7A48] shrink-0" />
                          <p className="text-[#0F2D36] text-[15px] font-semibold">Billing address confirmed</p>
                        </div>
                        <p className="text-[#0F2D36] text-[16px] font-bold break-words">{billingFirstName} {billingLastName}</p>
                        <p className="text-[#0F2D36] text-[15px] leading-[1.5] break-words">
                          {billingStreet}{billingApartmentNumber ? `, ${billingApartmentNumber}` : ""}, {billingCity}{billingStateProvince ? `, ${billingStateProvince}` : ""}{billingPostalCode ? `, ${billingPostalCode}` : ""}, {billingCountryLabel}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBillingAddressConfirmed(false)}
                        className="h-[40px] w-full md:w-auto px-[14px] rounded-[6px] border border-[rgba(15,45,54,0.24)] bg-[#F7FAFC] text-[#0F2D36] text-[14px] font-semibold hover:bg-[#EEF3F7] transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}

                <div className="h-[1px] bg-[rgba(15,45,54,0.16)] mb-[26px]" />

                <h2 className="text-[#0F2D36] text-[40px] md:text-[32px] font-bold mb-[14px]">2. Payment method</h2>
                <h3 className="text-[#0F2D36] text-[20px] font-bold mb-[10px]">Payment method</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px] mb-[12px]">
                  <button
                    type="button"
                    onClick={() => setBillingPaymentMethod("card")}
                    className={`h-[64px] rounded-[4px] border px-[12px] text-left transition-colors ${billingPaymentMethod === "card" ? "border-[#0F2D36] bg-white" : "border-[rgba(15,45,54,0.18)] bg-white"}`}
                  >
                    <CreditCard className="w-[16px] h-[16px] mb-[6px] text-[#0F2D36]" />
                    <p className="text-[#0F2D36] text-[15px] font-medium">Card</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPaymentMethod("ideal")}
                    className={`h-[64px] rounded-[4px] border px-[12px] text-left transition-colors ${billingPaymentMethod === "ideal" ? "border-[#0F2D36] bg-white" : "border-[rgba(15,45,54,0.18)] bg-white"}`}
                  >
                    <p className="text-[#B80F3D] text-[11px] font-bold mb-[6px]">iDEAL</p>
                    <p className="text-[#0F2D36] text-[15px] font-medium">iDEAL | Wero</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPaymentMethod("bancontact")}
                    className={`h-[64px] rounded-[4px] border px-[12px] text-left transition-colors ${billingPaymentMethod === "bancontact" ? "border-[#0F2D36] bg-white" : "border-[rgba(15,45,54,0.18)] bg-white"}`}
                  >
                    <div className="w-[24px] h-[6px] rounded-[999px] bg-[#0F57B5] mb-[8px]" />
                    <p className="text-[#0F2D36] text-[15px] font-medium">Bancontact</p>
                  </button>
                </div>

                <div className="mb-[10px]">
                  <label className="block text-[#0F2D36] text-[14px] font-medium mb-[6px]">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={billingCardNumber}
                      onChange={(e) => setBillingCardNumber(e.target.value)}
                      placeholder="1234 1234 1234 1234"
                      className="w-full h-[44px] px-[12px] pr-[120px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                    />
                    <div className="absolute right-[10px] top-1/2 -translate-y-1/2 flex items-center gap-[4px] text-[10px]">
                      <span className="px-[4px] py-[1px] rounded bg-[#111827] text-white">MC</span>
                      <span className="px-[4px] py-[1px] rounded bg-[#1D4ED8] text-white">VISA</span>
                      <span className="px-[4px] py-[1px] rounded bg-[#0EA5E9] text-white">AMEX</span>
                      <span className="px-[4px] py-[1px] rounded bg-[#047857] text-white">UNP</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-[22px]">
                  <div>
                    <label className="block text-[#0F2D36] text-[14px] font-medium mb-[6px]">Expiry date</label>
                    <input
                      type="text"
                      value={billingExpiryDate}
                      onChange={(e) => setBillingExpiryDate(e.target.value)}
                      placeholder="MM / YY"
                      className="w-full h-[44px] px-[12px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0F2D36] text-[14px] font-medium mb-[6px]">Security code</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={billingSecurityCode}
                        onChange={(e) => setBillingSecurityCode(e.target.value)}
                        placeholder="CVC"
                        className="w-full h-[44px] px-[12px] pr-[56px] border border-[rgba(15,45,54,0.24)] rounded-[4px] text-[#0F2D36] text-[15px]"
                      />
                      <span className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#5F7D89] text-[12px] font-semibold">123</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-[rgba(15,45,54,0.16)] mb-[26px]" />

                <h2 className="text-[#0F2D36] text-[28px] md:text-[24px] font-bold mb-[14px]">3. Increase your chances by up to 42%</h2>
                <div className="border border-[rgba(15,45,54,0.18)] rounded-[6px] overflow-hidden mb-[28px]">
                  <div className="h-[24px] bg-[#002D3B] px-[12px] flex items-center">
                    <span className="text-white text-[13px] font-semibold">Recommended</span>
                  </div>

                  <div className="p-[20px]">
                    <div className="flex items-start justify-between gap-[12px] mb-[14px]">
                      <div>
                        <h3 className="text-[#0F2D36] text-[22px] md:text-[20px] font-bold leading-[1.2]">ReserveHousing Rent Guarantee</h3>
                        <p className="text-[#0F2D36] text-[22px] md:text-[20px] font-bold leading-[1.2] mt-[4px]">+€251.54 <span className="text-[16px] md:text-[15px] font-medium">paid once, only if your application is accepted</span></p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAddRentGuarantee((prev) => !prev)}
                        className={`inline-flex items-center gap-[10px] ${addRentGuarantee ? "text-[#0E7A48]" : "text-[#6B7F88]"}`}
                        aria-label="Toggle rent guarantee"
                        role="switch"
                        aria-checked={addRentGuarantee}
                      >
                        <span className={`relative w-[46px] h-[24px] rounded-full transition-colors ${addRentGuarantee ? "bg-[#0F2D36]" : "bg-[#D8DEE3]"}`}>
                          <span className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow transition-transform ${addRentGuarantee ? "translate-x-[24px]" : "translate-x-[2px]"}`} />
                        </span>
                        <span className="hidden sm:inline text-[13px] font-semibold whitespace-nowrap">{addRentGuarantee ? "Added" : "Add"}</span>
                      </button>
                    </div>

                    <div className="h-[1px] bg-[rgba(15,45,54,0.16)] mb-[14px]" />

                    <p className="text-[#0F2D36] text-[15px] leading-[1.6] mb-[12px]">Rent Guarantee is an insurance policy that protects your landlord against unpaid rent and property damages.</p>
                    <ul className="space-y-[8px] text-[#0F2D36] text-[15px] leading-[1.6] mb-[14px]">
                      <li className="flex items-start gap-[8px]"><Check className="w-[16px] h-[16px] mt-[3px] shrink-0" /><span>Stand out as a preferred and safe choice.</span></li>
                      <li className="flex items-start gap-[8px]"><Check className="w-[16px] h-[16px] mt-[3px] shrink-0" /><span>Skip the need for a private guarantor.</span></li>
                      <li className="flex items-start gap-[8px]"><Check className="w-[16px] h-[16px] mt-[3px] shrink-0" /><span>Add it to your application in just a few taps.</span></li>
                    </ul>

                    <button type="button" className="text-[#0F2D36] underline underline-offset-[3px] text-[15px] hover:text-[#0A2530]">
                      How it works
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSubmitBilling}
                  className={`w-full font-bold py-[13px] transition-colors text-[16px] rounded-[6px] ${isSubmitting || !canSubmitBilling ? "bg-[#D6DEE5] text-[#90A3B3] cursor-not-allowed" : "bg-brand-primary text-white hover:bg-brand-primary-dark"}`}
                >
                  {isSubmitting ? "Submitting..." : "Submit rental application"}
                </button>

                {!canSubmitBilling && <p className="text-[#0F2D36] text-[14px] text-center mt-[10px]">Add a billing address first.</p>}

                <div className="mt-[18px] space-y-[10px] text-[#5D7380] text-[14px] leading-[1.65]">
                  <p>By selecting submit application, you agree to pay {landlordFirstName} if {landlordFirstName} accepts your application and confirms your stay. You can withdraw your application anytime before it's accepted - you won't be charged. After it's accepted, this listing's cancellation policy will apply.</p>
                  <p>If your application is rejected, this transaction will be automatically canceled and you will be notified. Your payment details are never shared with anyone.</p>
                  <p>By continuing, you agree to our <button type="button" className="underline underline-offset-[3px] hover:text-[#0A2530]">Terms & Conditions</button> and <button type="button" className="underline underline-offset-[3px] hover:text-[#0A2530]">Privacy Policy</button>.</p>
                </div>

                {submitError && <p className="text-brand-primary text-[15px] mt-[12px]">{submitError}</p>}
              </>
            )}
          </div>

          {/* Right Column - Property & Payment Summary */}
          <div className="flex-[1]">
            <div className="sticky top-[100px]">
              <div className="rounded-[6px] bg-white overflow-hidden">
                <div className="px-[12px] py-[12px] flex items-start gap-[12px] bg-white">
                  <div className="relative w-[86px] h-[86px] shrink-0">
                    <div className="w-[86px] h-[86px] rounded-[8px] overflow-hidden border border-[rgba(15,45,54,0.16)] bg-[#EAF2FF]">
                      <img
                        src={listing?.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                        alt="Property"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="absolute right-[-10px] bottom-[-10px] w-[30px] h-[30px] rounded-full overflow-hidden border-2 border-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] bg-[#EAF2FF]">
                      {listing?.landlordProfilePicture ? (
                        <img
                          src={listing.landlordProfilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#12303B] text-white text-[11px] font-bold flex items-center justify-center">
                          {landlordInitials}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[#0F2D36] text-[22px] leading-[1.1] font-bold truncate">{listing?.title ?? "Listing"}</h3>
                    <p className="text-[#596E76] text-[15px] mt-[4px]">{listing?.city}{listing?.country ? `, ${listing.country}` : ""}</p>
                    <p className="text-[#0F2D36] text-[18px] mt-[10px]">Published by {listing?.landlordName ?? "Landlord"}</p>
                  </div>
                </div>

                <div className="px-[12px] py-[12px] flex flex-col">
                  <p className="text-[#0F2D36] text-[20px] font-bold mb-[8px]">Rental period</p>
                  {currentStep === 1 ? (
                    <button
                      type="button"
                      onClick={() => setIsDatePickerModalOpen(true)}
                      className="inline-flex items-center gap-[8px] text-[#0F2D36] text-[40px] md:text-[16px] leading-[1.2] underline decoration-dotted underline-offset-[8px] cursor-pointer hover:text-[#0A2530] hover:underline-offset-[10px] transition-all duration-150"
                    >
                      {selectedRangeLabel}
                      <Pencil className="w-[16px] h-[16px]" />
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-[8px] text-[#0F2D36] text-[40px] md:text-[16px] leading-[1.2]">
                      {selectedRangeLabel}
                    </div>
                  )}

                  <div className={`mt-[14px] pt-[14px] ${currentStep === 1 ? "order-1" : "order-2"}`}>
                    <p className="text-[#001F33] text-[44px] md:text-[16px] leading-[1.2] font-bold mb-[10px]">
                      You <span className="text-[#8DA0AB]">-&gt;</span>{" "}
                      <span className="inline-flex items-center gap-[8px]">
                        <span className="w-[24px] h-[24px] rounded-full overflow-hidden border border-[rgba(15,45,54,0.18)] bg-[#EAF2FF]">
                          {listing?.landlordProfilePicture ? (
                            <img
                              src={listing.landlordProfilePicture}
                              alt="Landlord"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="w-full h-full bg-[#12303B] text-white text-[10px] font-bold flex items-center justify-center">
                              {landlordInitials}
                            </span>
                          )}
                        </span>
                        <span>{listing?.landlordName ?? "Landlord"}</span>
                      </span>
                    </p>
                    <p className="text-[#0F2D36] text-[36px] md:text-[16px] leading-[1.45] mb-[14px]">
                      Future rental costs to the landlord. You'll pay these directly, per your contract.
                    </p>

                    <div className="space-y-[10px] pb-[12px]">
                      <div className="flex items-center justify-between gap-[12px]">
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] flex items-center gap-[6px]">
                          Security deposit <span className="text-[#8194A0]">before move-in</span>
                          <Info className="w-[14px] h-[14px] text-[#8194A0]" />
                        </p>
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] font-semibold">{"\u20AC"}{(listing?.deposit ?? 0).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-[12px]">
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2]">Utilities</p>
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] font-semibold">
                          {listing?.utilitiesIncluded
                            ? listing.utilitiesCost > 0
                              ? `\u20AC${listing.utilitiesCost.toFixed(2)}`
                              : "\u20AC0.00"
                            : "Not included"}
                        </p>
                      </div>

                      {showLandlordMore && (
                        <>
                          {listing.utilities.map((utility) => (
                            <div key={utility.type} className="flex items-center justify-between gap-[12px] pl-[16px]">
                              <p className="text-[#0F2D36] text-[34px] md:text-[16px] leading-[1.2]">{utility.type}</p>
                              <p className="text-[#8194A0] text-[34px] md:text-[16px] leading-[1.2] inline-flex items-center gap-[6px]">
                                {utility.included && <Check className="w-[14px] h-[14px] text-[#0E7A48]" />}
                                {utility.included ? "Included" : `\u20AC${utility.amount.toFixed(2)}`}
                              </p>
                            </div>
                          ))}

                          <div className="pt-[4px]">
                            <p className="text-[#0F2D36] text-[34px] md:text-[16px] leading-[1.2] mb-[6px]">Rent</p>
                            <div className="space-y-[6px] pl-[16px]">
                              {rentBreakdownRows.map((row, index) => (
                                <div key={row.label} className="flex items-center justify-between gap-[12px]">
                                  <p className="text-[#0F2D36] text-[32px] md:text-[16px] leading-[1.2]">{row.label}</p>
                                  <p className="text-[#0F2D36] text-[32px] md:text-[16px] leading-[1.2] font-semibold inline-flex items-center gap-[6px]">
                                    {row.original && (
                                      <span className="inline-flex items-center gap-[6px]">
                                        <span className="relative inline-flex items-center group">
                                          <Info className="w-[14px] h-[14px] text-[#6B7F88]" />
                                          <span className="pointer-events-none absolute right-0 top-[calc(100%+8px)] z-[30] w-[320px] rounded-[6px] bg-[#0F2D36] px-[10px] py-[8px] text-[12px] leading-[1.4] font-medium text-white opacity-0 shadow-[0_10px_28px_rgba(0,0,0,0.28)] transition-opacity duration-150 group-hover:opacity-100">
                                            {index === 0
                                              ? "To rent the place, you pay the first month's rent upfront."
                                              : "This listing's rent is calculated on a daily basis. For the first and last months of your stay, you'll only pay for the exact number of nights in your rental period - just like a hotel. To confirm your rental, you'll need to pay one month's rent in full. Any excess rent you pay for the first month will be subtracted from the next month's rent."}
                                          </span>
                                        </span>
                                        <span className="text-[#9CA9B2] line-through">{row.original}</span>
                                      </span>
                                    )}
                                    <span>{row.value}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLandlordMore((prev) => !prev)}
                      className="inline-flex items-center gap-[6px] text-[#0F2D36] text-[34px] md:text-[16px] leading-[1.2] font-semibold underline decoration-dotted underline-offset-[8px] cursor-pointer hover:text-[#0A2530] hover:underline-offset-[10px] transition-all duration-150"
                    >
                      View {showLandlordMore ? "less" : "more"}
                      <ChevronDown className={`w-[16px] h-[16px] transition-transform ${showLandlordMore ? "rotate-180" : ""}`} />
                    </button>

                    <div className="mt-[12px] border border-[rgba(15,45,54,0.12)] rounded-[6px] p-[28px] bg-[#E9EEF4]">
                      <h4 className="text-[#264991] text-[16px] leading-[1.25] font-bold mb-[12px] flex items-center gap-[10px]">
                        <Heart className="w-[22px] h-[22px]" />
                        Covered by Tenant Protection
                      </h4>
                      <p className="text-[#274A93] text-[15px] leading-[1.6] mb-[16px] max-w-[420px]">
                        You're guaranteed a stress-free move-in or your money back.
                      </p>

                      {isProtectionExpanded && (
                        <div className="space-y-[18px] mb-[18px]">
                          <div className="flex items-start gap-[10px]">
                            <CheckCircle2 className="w-[22px] h-[22px] text-[#264991] mt-[2px] shrink-0" />
                            <div>
                              <p className="text-[#264991] text-[16px] font-bold mb-[4px]">Protection against the unexpected</p>
                              <p className="text-[#274A93] text-[15px] leading-[1.6]">
                                If the landlord cancels last minute or delays your move-in, you'll get help finding another place or a temporary hotel stay.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-[10px]">
                            <CheckCircle2 className="w-[22px] h-[22px] text-[#264991] mt-[2px] shrink-0" />
                            <div>
                              <p className="text-[#264991] text-[16px] font-bold mb-[4px]">Quick support</p>
                              <p className="text-[#274A93] text-[15px] leading-[1.6]">
                                If something goes wrong with your rental, we can help make it right.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-[10px]">
                            <CheckCircle2 className="w-[22px] h-[22px] text-[#264991] mt-[2px] shrink-0" />
                            <div>
                              <p className="text-[#264991] text-[16px] font-bold mb-[4px]">Move-in with confidence</p>
                              <p className="text-[#274A93] text-[15px] leading-[1.6]">
                                We keep your payment safe until you move in. If the place doesn't match the description, you'll get a refund.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsProtectionExpanded((prev) => !prev)}
                        className="text-[#264991] text-[15px] font-medium underline decoration-dotted underline-offset-[4px] flex items-center gap-[6px] hover:text-[#1D3F85] transition-colors cursor-pointer"
                      >
                        How you're protected
                        <ChevronDown className={`w-[14px] h-[14px] transition-transform ${isProtectionExpanded ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-[14px] pt-[14px] ${currentStep === 1 ? "order-2" : "order-1"}`}>
                    <p className="text-[#001F33] text-[44px] md:text-[16px] leading-[1.2] font-bold mb-[8px]">You <span className="text-[#8DA0AB]">-&gt;</span> ReserveHousing</p>
                    <p className="text-[#0F2D36] text-[36px] md:text-[16px] leading-[1.45] mb-[14px]">Pay this now to secure your place.</p>

                    <div className="space-y-[10px] pb-[12px]">
                      <div className="flex items-center justify-between gap-[12px]">
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2]">{rentLineLabel}</p>
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] font-semibold">{"\u20AC"}{rentForSelectedPeriod.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-[12px]">
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] flex items-center gap-[6px]">
                          Tenant Protection fee
                          <Info className="w-[14px] h-[14px]" />
                        </p>
                        <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] font-semibold">{"\u20AC"}{tenantProtectionFee.toFixed(2)}</p>
                      </div>
                      {addRentGuarantee && (
                        <div className="flex items-center justify-between gap-[12px]">
                          <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2]">Rent Guarantee</p>
                          <p className="text-[#0F2D36] text-[38px] md:text-[16px] leading-[1.2] font-semibold">{"\u20AC"}{RENT_GUARANTEE_FEE.toFixed(2)}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-[8px] rounded-[6px] bg-[#E8EEF4] p-[12px]">
                      <div className="flex items-center justify-between gap-[12px] mb-[8px]">
                        <p className="text-[#0F2D36] text-[20px] font-bold">Total</p>
                        <p className="text-[#0F2D36] text-[20px] font-bold">{"\u20AC"}{totalAmount.toFixed(2)}</p>
                      </div>
                      <p className="text-[#264991] text-[15px] leading-[1.45] flex items-center gap-[6px]">
                        <Shield className="w-[14px] h-[14px]" />
                        Covered by Tenant Protection.
                        {/* <button type="button" className="underline decoration-dotted underline-offset-[4px] hover:text-[#1D3F85] transition-colors cursor-pointer">Learn more</button> */}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentStep === 1 && !showAskQuestionForm && (
        <div className="fixed left-0 right-0 bottom-0 z-40 bg-[#F7F7F9] border-t border-[rgba(0,0,0,0.12)]">
          <div className="max-w-[1200px] mx-auto px-[32px] py-[14px]">
            <button
              onClick={handleContinue}
              className="w-full max-w-[620px] font-semibold py-[13px] transition-colors text-[15px] bg-brand-primary text-white hover:bg-brand-primary-dark"
            >
              Continue
            </button>
            {stepOneError && <p className="text-brand-primary text-[15px] mt-[10px]">{stepOneError}</p>}
          </div>
        </div>
      )}
      </>
      )}

      {isDatePickerModalOpen && listing && (
        <div className="fixed inset-0 z-[95]">
          <button
            type="button"
            aria-label="Close date picker"
            onClick={() => setIsDatePickerModalOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <div className="relative z-[1] mx-auto mt-[12px] md:mt-[22px] w-[94vw] max-w-[980px]">
            <DatePicker
              isOpen={isDatePickerModalOpen}
              onClose={() => setIsDatePickerModalOpen(false)}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onDateChange={handleDateRangeChange}
              moveInAvailableChecked={isMoveInAvailabilityChecked}
              onMoveInAvailableChange={setIsMoveInAvailabilityChecked}
              onClearSelection={() => {
                setSelectedStartDate(null);
                setSelectedEndDate(null);
              }}
              initializeFromSelection
              isModal
              minStayMonths={Math.max(1, listing.minStay || 1)}
              maxStayMonths={listing.maxStay}
              availableFrom={new Date(listing.availableFrom)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
