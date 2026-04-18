import { Link, useParams, useNavigate } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { DatePicker } from "../components/date-picker";
import { useAuth } from "../contexts/auth-context";
import {
  Share2,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Home as HomeIcon,
  Check,
  Calendar,
  MessageSquare,
  Info,
  Shield,
  ShieldCheck,
  Lock,
  FileText,
  BadgeCheck,
  CheckCircle2,
  Bath,
  Sofa,
  Bed,
  Tv,
  Wifi,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../config";

const fallbackPropertyImages = [
  "https://images.unsplash.com/photo-1649740718655-3c70b0e3d431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGFwYXJ0bWVudCUyMGJlZHJvb20lMjB3aW5kb3d8ZW58MXx8fHwxNzczMDg5ODczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1758548157747-285c7012db5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW50YWwlMjByb29tJTIwaW50ZXJpb3IlMjBicmlnaHR8ZW58MXx8fHwxNzczMDg5ODczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1767800766429-7179fd80948f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBiZWRyb29tJTIwZGVzayUyMHN0dWR5fGVufDF8fHx8MTc3MzA4OTg3NHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1594295800284-990f74bb6928?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkaW8lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMDg5NTY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1730789442056-76dbcaab7dd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXNoZWQlMjBhcGFydG1lbnQlMjBsaXZpbmclMjBzcGFjZXxlbnwxfHx8fDE3NzMwODk1NjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

const TENANT_PROTECTION_RATE = 0.1;
const TENANT_PROTECTION_FEE_CAP = 250;

interface ListingDetails {
  id: string;
  propertyType: "apartment" | "studio" | "house" | "room";
  kind?: string;
  title: string;
  description: string;
  address: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  suitablePeopleCount?: number;
  monthlyRent: number;
  deposit: number;
  availableFrom: string;
  minStay: number;
  maxStay?: number;
  utilitiesIncluded: boolean;
  utilities: Array<{ type: string; included: boolean; amount: number }>;
  optionalServices: Array<{ type: string; amount: number; frequency?: string }>;
  registrationPossible: boolean;
  wheelchairAccessible?: boolean;
  elevator?: boolean;
  preferredGender?: string;
  preferredTenantType?: string;
  couplesAllowed?: boolean;
  petsPolicy?: string;
  smokingPolicy?: string;
  musicPolicy?: string;
  rentCalculation?: "daily" | "half-monthly" | "monthly";
  cancellationPolicy?: "strict" | "flexible";
  requireProofOfIdentity?: boolean;
  requireProofOfOccupation?: boolean;
  requireProofOfIncome?: boolean;
  kitchen?: string;
  livingRoom?: string;
  toilet?: string;
  balconyTerrace?: string;
  garden?: string;
  basement?: string;
  parking?: string;
  amenities: string[];
  amenityFlags: Record<string, boolean | string>;
  houseRules: string[];
  images: string[];
  currency: string;
  landlord?: {
    id: string;
    name: string;
    initials: string;
  };
}

type ApiListingDetails = Partial<ListingDetails> & {
  media?: Array<{ url?: string }>;
  deposits?: Array<{ type?: string; amount?: number }>;
  utilities?: Array<{ type?: string; included?: boolean; amount?: number; frequency?: string }>;
  optionalServices?: Array<{ type?: string; amount?: number; frequency?: string }>;
  amenities?: Record<string, unknown> | string[];
  bedroomsCount?: number;
  bathroomStructure?: { count?: number };
  propertySize?: number;
  suitablePeopleCount?: number;
  minimumRentalPeriod?: number;
  maximumRentalPeriod?: number;
  spaceDescription?: string;
  propertyType?: string;
};

function normalizeListingDetails(raw: ApiListingDetails): ListingDetails {
  const mediaImages = Array.isArray(raw.media)
    ? raw.media.map((item) => item?.url).filter((url): url is string => Boolean(url))
    : [];

  const amenityFlags =
    raw.amenities && typeof raw.amenities === "object" && !Array.isArray(raw.amenities)
      ? (raw.amenities as Record<string, boolean | string>)
      : {};

  const amenities = Array.isArray(raw.amenities)
    ? raw.amenities
    : raw.amenities && typeof raw.amenities === "object"
    ? Object.entries(raw.amenities)
        .filter(([, value]) => value === true)
        .map(([key]) => key)
    : [];

  const normalizedUtilities = Array.isArray(raw.utilities)
    ? raw.utilities.map((item) => ({
        type: item?.type ?? "Utility",
        included: Boolean(item?.included),
        amount: item?.amount ?? 0,
      }))
    : [];

  const normalizedOptionalServices = Array.isArray(raw.optionalServices)
    ? raw.optionalServices.map((item) => ({
        type: item?.type ?? "Service",
        amount: item?.amount ?? 0,
        frequency: item?.frequency,
      }))
    : [];

  const normalizedPropertyType: ListingDetails["propertyType"] =
    raw.propertyType === "apartment" ||
    raw.propertyType === "studio" ||
    raw.propertyType === "house" ||
    raw.propertyType === "room"
      ? raw.propertyType
      : raw.propertyType === "building"
      ? "apartment"
      : "room";

  return {
    id: raw.id ?? "",
    propertyType: normalizedPropertyType,
    kind: raw.kind,
    title: raw.title ?? "Listing unavailable",
    description: raw.description ?? raw.spaceDescription ?? "",
    address: raw.address ?? "",
    city: raw.city ?? "",
    bedrooms: raw.bedrooms ?? raw.bedroomsCount ?? 0,
    bathrooms: raw.bathrooms ?? raw.bathroomStructure?.count ?? 0,
    area: raw.area ?? raw.propertySize ?? 0,
    suitablePeopleCount: raw.suitablePeopleCount,
    monthlyRent: raw.monthlyRent ?? 0,
    deposit: raw.deposit ?? raw.deposits?.[0]?.amount ?? 0,
    availableFrom: raw.availableFrom ?? new Date().toISOString(),
    minStay: raw.minStay ?? raw.minimumRentalPeriod ?? 1,
    maxStay: raw.maximumRentalPeriod,
    utilitiesIncluded: raw.utilitiesIncluded ?? (raw.utilities?.some((u) => Boolean(u?.included)) ?? false),
    utilities: normalizedUtilities,
    optionalServices: normalizedOptionalServices,
    registrationPossible: raw.registrationPossible ?? false,
    wheelchairAccessible: raw.wheelchairAccessible,
    elevator: raw.elevator,
    preferredGender: raw.preferredGender,
    preferredTenantType: raw.preferredTenantType,
    couplesAllowed: raw.couplesAllowed,
    petsPolicy: raw.petsPolicy,
    smokingPolicy: raw.smokingPolicy,
    musicPolicy: raw.musicPolicy,
    rentCalculation: raw.rentCalculation,
    cancellationPolicy: raw.cancellationPolicy,
    requireProofOfIdentity: raw.requireProofOfIdentity,
    requireProofOfOccupation: raw.requireProofOfOccupation,
    requireProofOfIncome: raw.requireProofOfIncome,
    kitchen: raw.kitchen,
    livingRoom: raw.livingRoom,
    toilet: raw.toilet,
    balconyTerrace: raw.balconyTerrace,
    garden: raw.garden,
    basement: raw.basement,
    parking: raw.parking,
    amenities,
    amenityFlags,
    houseRules: Array.isArray(raw.houseRules) ? raw.houseRules : [],
    images: Array.isArray(raw.images) ? raw.images : mediaImages,
    currency: raw.currency ?? "EUR",
    landlord: raw.landlord,
  };
}

function addMonthsClamped(date: Date, months: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDayOfTargetMonth));
}

function monthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function PropertyListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = API_BASE;
  const { isAuthenticated, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteBusy, setIsFavoriteBusy] = useState(false);
  const [listingError, setListingError] = useState("");
  const [isListingUnavailable, setIsListingUnavailable] = useState(false);
  const [isPhotosModalOpen, setIsPhotosModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [isFacilitiesExpanded, setIsFacilitiesExpanded] = useState(false);
  const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);
  const [isProtectionExpanded, setIsProtectionExpanded] = useState(false);
  const [isPaymentsDrawerOpen, setIsPaymentsDrawerOpen] = useState(false);
  const [isPaymentsDrawerVisible, setIsPaymentsDrawerVisible] = useState(false);
  const [isDatePickerModalOpen, setIsDatePickerModalOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isMoveInAvailabilityChecked, setIsMoveInAvailabilityChecked] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const paymentsCloseTimerRef = useRef<number | null>(null);

  const faqItems = [
    {
      question: "I like this place, how do I rent it?",
      answerTitle: "If you are ready to rent, here's what to do:",
      lines: [
        "1. Select your dates to check availability.",
        "2. Click Apply to rent.",
        "3. Fill in a quick rental application and send an intro message.",
        "4. Add your supporting documents and payment details to pre-authorize a potential payment.",
        "5. If the landlord accepts your rental application, we'll collect payment to confirm your stay. If they don't, your payment will be automatically canceled.",
      ],
    },
    {
      question: "Can I view this property?",
      answerTitle:
        "At ReserveHousing, in person viewings are not supported - so everyone has an equal chance to rent, no matter where you are in the world. To help you make an informed decision, we recommend:",
      lines: [
        "1. Messaging the landlord on ReserveHousing to ask any questions.",
        "2. Requesting more photos, video tours, or floor plans.",
        "3. Read up on Tenant Protection to learn how you're covered if something goes wrong.",
      ],
    },
    {
      question: "How do I contact the landlord?",
      answerTitle:
        "Use the 'Message landlord' button to start a secure conversation on our platform. You can ask questions, discuss terms, and safely exchange documents.",
      lines: [
        "Keeping your conversation on ReserveHousing private protects your privacy and helps you avoid scams. All your messages are also saved in one place for easy access and as a record of your agreements.",
        "Once your rental is confirmed, we'll share the landlord's contact info so you can arrange your move in.",
      ],
    },
    {
      question: "What happens after the rental confirmation?",
      answerTitle:
        "After your rental is confirmed on ReserveHousing, you and the landlord will receive each other's contact details. You can then contact them outside our platform, or continue messaging on ReserveHousing. You can pay future months' rent and other rental costs using our payment request feature.",
      lines: [],
    },
    {
      question: "What is Tenant Protection?",
      answerTitle:
        "Tenant Protection is our service to help you rent with peace of mind. We hold all payments you make through our platform before move in, including the first month's rent and any deposit. After you arrive, you have 48 hours to check that the place is as you expected. We only send your money to the landlord if everything is okay.",
      lines: [
        "Watch this short video to see all the ways we keep you safe, from secure payments to support with finding a new place. For more details, you can also read about Tenant Protection.",
      ],
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      videoThumbnail: "https://img.youtube.com/vi/dQw4w9WgXc0/hqdefault.jpg",
    },
  ];

  const toggleFaqItem = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const formatValue = (value?: string) => {
    if (!value) {
      return "Not specified";
    }
    return value
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // Scroll to top when navigating to a different property
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
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

        const payload = (await response.json()) as { listing: ApiListingDetails };
        setListing(normalizeListingDetails(payload.listing));
        setListingError("");
        setIsListingUnavailable(false);
      } catch {
        setListing(null);
        setListingError("Could not load this listing right now");
        setIsListingUnavailable(false);
      } finally {
        setIsLoading(false);
      }
    };

    void loadListing();
  }, [apiBase, id]);

  useEffect(() => {
    if (!id || !isAuthenticated || !listing || isListingUnavailable) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      return;
    }

    void fetch(`${apiBase}/api/listings/${id}/interactions/view`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).catch(() => {
      // Interaction tracking should never block listing detail experience.
    });
  }, [apiBase, id, isAuthenticated, isListingUnavailable, listing]);

  useEffect(() => {
    const loadFavoriteState = async () => {
      if (!id || !isAuthenticated) {
        setIsFavorited(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsFavorited(false);
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/auth/me/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          listingIds?: Array<string | number>;
          favorites?: Array<{ id?: string | number }>;
        };
        const listingIds = Array.isArray(payload.listingIds)
          ? payload.listingIds.map((favoriteId) => String(favoriteId))
          : Array.isArray(payload.favorites)
          ? payload.favorites
              .map((favorite) => favorite.id)
              .filter((favoriteId): favoriteId is string | number => favoriteId !== undefined && favoriteId !== null)
              .map((favoriteId) => String(favoriteId))
          : [];
        setIsFavorited(listingIds.includes(id));
      } catch {
        // Ignore; favorite button remains usable.
      }
    };

    void loadFavoriteState();
  }, [apiBase, id, isAuthenticated]);

  useEffect(() => {
    const loadApplicationState = async () => {
      if (!id || !isAuthenticated || user?.role === "landlord") {
        setHasApplied(false);
        setApplicationStatus(null);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setHasApplied(false);
        setApplicationStatus(null);
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/rental-applications/tenant/check?listingId=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          hasApplied: boolean;
          status: "pending" | "approved" | "rejected" | null;
        };

        setHasApplied(payload.hasApplied);
        setApplicationStatus(payload.status);
      } catch {
        // Keep page usable when application check fails.
      }
    };

    void loadApplicationState();
  }, [apiBase, id, isAuthenticated, user?.role]);

  useEffect(() => {
    if (isPaymentsDrawerOpen) {
      const frameId = window.requestAnimationFrame(() => setIsPaymentsDrawerVisible(true));
      return () => window.cancelAnimationFrame(frameId);
    }

    setIsPaymentsDrawerVisible(false);
    return undefined;
  }, [isPaymentsDrawerOpen]);

  useEffect(() => {
    return () => {
      if (paymentsCloseTimerRef.current !== null) {
        window.clearTimeout(paymentsCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!listing) {
      return;
    }

    const availableDate = new Date(listing.availableFrom);
    if (Number.isNaN(availableDate.getTime())) {
      return;
    }

    // Keep empty initially; user explicitly selects move-in and move-out.
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  }, [listing?.id]);

  const propertyImages = useMemo(() => {
    if (listing && listing.images.length > 0) {
      return listing.images;
    }
    return fallbackPropertyImages;
  }, [listing]);

  const facilitiesAndAmenities = useMemo(() => {
    if (!listing) {
      return [] as string[];
    }

    const values: string[] = [];

    if (listing.toilet && listing.toilet !== "no") values.push(`${formatValue(listing.toilet)} toilet`);
    if (listing.livingRoom && listing.livingRoom !== "no") values.push(`${formatValue(listing.livingRoom)} living room`);
    if (listing.kitchen && listing.kitchen !== "no") values.push(`${formatValue(listing.kitchen)} kitchen`);
    if (typeof listing.amenityFlags.kitchenware === "string" && listing.amenityFlags.kitchenware !== "no") {
      values.push(`${formatValue(String(listing.amenityFlags.kitchenware))} kitchenware`);
    }
    if (listing.amenityFlags.wifi === true || listing.amenities.includes("wifi")) values.push("WiFi");
    if (listing.amenityFlags.bed === true || listing.amenities.includes("bed")) values.push("Bed");
    if (listing.amenityFlags.tv === true || listing.amenities.includes("tv")) values.push("TV");
    if (listing.amenityFlags.washingMachine === true || listing.amenities.includes("washer")) values.push("Washing machine");
    if (listing.amenityFlags.dishwasher === true || listing.amenities.includes("dishwasher")) values.push("Dishwasher");
    if (listing.balconyTerrace && listing.balconyTerrace !== "no") values.push(`${formatValue(listing.balconyTerrace)} balcony`);

    return Array.from(new Set(values));
  }, [listing]);

  const facilitiesModalData = useMemo(() => {
    if (!listing) {
      return { facilities: [] as Array<{ label: string; available: boolean }>, amenities: [] as Array<{ label: string; available: boolean }> };
    }

    const facilities = [
      {
        label: listing.toilet === "no" ? "No toilet" : `${formatValue(listing.toilet)} toilet`,
        available: listing.toilet !== "no",
      },
      {
        label: listing.livingRoom === "no" ? "No living room" : `${formatValue(listing.livingRoom)} living room`,
        available: listing.livingRoom !== "no",
      },
      {
        label: listing.kitchen === "no" ? "No kitchen" : `${formatValue(listing.kitchen)} kitchen`,
        available: listing.kitchen !== "no",
      },
      {
        label: listing.parking === "no" ? "No parking" : "Parking",
        available: listing.parking !== "no",
      },
      {
        label: listing.garden === "no" ? "No garden" : "Garden",
        available: listing.garden !== "no",
      },
      {
        label: listing.basement === "no" ? "No basement" : "Basement",
        available: listing.basement !== "no",
      },
      {
        label: listing.balconyTerrace === "no" ? "No balcony" : "Balcony",
        available: listing.balconyTerrace !== "no",
      },
    ];

    const kitchenwareAvailable =
      typeof listing.amenityFlags.kitchenware === "string" && listing.amenityFlags.kitchenware !== "no";

    const amenities = [
      {
        label: kitchenwareAvailable
          ? `${formatValue(String(listing.amenityFlags.kitchenware))} kitchenware`
          : "No kitchenware",
        available: kitchenwareAvailable,
      },
      { label: "WiFi", available: listing.amenityFlags.wifi === true || listing.amenities.includes("wifi") },
      { label: "Bed", available: listing.amenityFlags.bed === true || listing.amenities.includes("bed") },
      { label: "TV", available: listing.amenityFlags.tv === true || listing.amenities.includes("tv") },
      { label: "Bedroom lock", available: listing.amenityFlags.lockOnBedroom === true },
      { label: "Washing machine", available: listing.amenityFlags.washingMachine === true || listing.amenities.includes("washer") },
      { label: "Dryer", available: listing.amenityFlags.dryer === true },
      { label: "Closet", available: listing.amenityFlags.closet === true },
      { label: "Dishwasher", available: listing.amenityFlags.dishwasher === true || listing.amenities.includes("dishwasher") },
      { label: "Desk", available: listing.amenityFlags.desk === true },
      { label: "Access friendly", available: listing.wheelchairAccessible === true },
      { label: "Elevator", available: listing.elevator === true },
    ];

    return { facilities, amenities };
  }, [listing]);

  const housePreferences = useMemo(() => {
    if (!listing) {
      return [] as string[];
    }

    const prefs: string[] = [
      `Age: ${formatValue(listing.preferredGender) === "No Preference" ? "No preference" : "As specified"}`,
      `Gender: ${formatValue(listing.preferredGender)}`,
      `Tenant type: ${formatValue(listing.preferredTenantType)}`,
      `Suitable for couples: ${listing.couplesAllowed ? "Yes" : "No"}`,
      `Pets allowed: ${formatValue(listing.petsPolicy)}`,
      `Smoking allowed: ${formatValue(listing.smokingPolicy)}`,
      `Playing musical instruments: ${formatValue(listing.musicPolicy)}`,
    ];

    return prefs;
  }, [listing]);

  const requiredDocuments = useMemo(() => {
    if (!listing) {
      return ["Proof of identity"];
    }

    const docs: string[] = [];
    if (listing.requireProofOfIdentity) docs.push("Proof of identity");
    if (listing.requireProofOfOccupation) docs.push("Proof of occupation or enrollment");
    if (listing.requireProofOfIncome) docs.push("Proof of income");

    return docs.length > 0 ? docs : ["Proof of identity"];
  }, [listing]);

  const paymentLines = useMemo(() => {
    if (!listing) {
      return [] as Array<{ label: string; value: string }>;
    }

    const lines: Array<{ label: string; value: string }> = [
      { label: "Security deposit", value: listing.deposit > 0 ? formatCurrency(listing.deposit, listing.currency) : "Not required" },
    ];

    listing.utilities.forEach((utility) => {
      lines.push({
        label: formatValue(utility.type),
        value: utility.included ? "Included" : formatCurrency(utility.amount, listing.currency),
      });
    });

    lines.push({ label: "Rent", value: formatCurrency(listing.monthlyRent, listing.currency) });

    return lines;
  }, [listing]);

  const hiddenPhotoCount = Math.max(0, propertyImages.length - 4);

  const getDateLabel = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const minimumStayMonths = Math.max(1, listing?.minStay || 1);
  const moveInDate = selectedStartDate ?? (listing ? new Date(listing.availableFrom) : null);
  const firstRentEndDate =
    selectedEndDate && !Number.isNaN(selectedEndDate.getTime())
      ? selectedEndDate
      : moveInDate && !Number.isNaN(moveInDate.getTime())
      ? addMonthsClamped(moveInDate, minimumStayMonths)
      : null;
  // Only show second rent period if user has explicitly selected dates that span more than 1 month
  const shouldShowSecondPeriod =
    selectedStartDate &&
    selectedEndDate &&
    selectedEndDate > addMonthsClamped(selectedStartDate, minimumStayMonths);
  
  const secondRentStartDate = shouldShowSecondPeriod && firstRentEndDate ? new Date(firstRentEndDate) : null;
  if (secondRentStartDate) {
    secondRentStartDate.setDate(firstRentEndDate!.getDate() + 1);
  }
  const secondRentEndDate =
    secondRentStartDate && !Number.isNaN(secondRentStartDate.getTime())
      ? new Date(secondRentStartDate.getFullYear(), secondRentStartDate.getMonth() + 1, 0)
      : null;

  const securityDepositLine = paymentLines.find((line) => line.label === "Security deposit");
  const rentLine = paymentLines.find((line) => line.label === "Rent");
  const utilityLines = paymentLines.filter((line) => line.label !== "Security deposit" && line.label !== "Rent");

  const tenantProtectionService = useMemo(() => {
    if (!listing) {
      return null;
    }

    const directMatch = listing.optionalServices.find((service) =>
      service.type.toLowerCase().includes("tenant") && service.type.toLowerCase().includes("protection")
    );

    if (directMatch) {
      return directMatch;
    }

    if (listing.optionalServices.length > 0) {
      const totalOptionalAmount = listing.optionalServices.reduce((sum, service) => sum + service.amount, 0);
      return {
        type: "Tenant protection",
        amount: totalOptionalAmount,
      };
    }

    return null;
  }, [listing]);

  const calculatedTenantProtectionFee = listing
    ? Math.min(listing.monthlyRent * TENANT_PROTECTION_RATE, TENANT_PROTECTION_FEE_CAP)
    : 0;
  const tenantProtectionFee = tenantProtectionService?.amount ?? calculatedTenantProtectionFee;
  const rentForSelectedPeriod = (() => {
    if (!listing || !selectedStartDate || !selectedEndDate || selectedEndDate < selectedStartDate) {
      return listing?.monthlyRent ?? 0;
    }

    let total = 0;
    let cursor = new Date(selectedStartDate);

    while (cursor <= selectedEndDate) {
      const periodStart = new Date(cursor);
      const currentMonthEnd = monthEnd(periodStart);
      const periodEnd = currentMonthEnd < selectedEndDate ? currentMonthEnd : new Date(selectedEndDate);

      const daysInMonth = currentMonthEnd.getDate();
      const occupiedDays = Math.floor((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      total += occupiedDays < daysInMonth ? (listing.monthlyRent / daysInMonth) * occupiedDays : listing.monthlyRent;

      cursor = new Date(periodEnd);
      cursor.setDate(cursor.getDate() + 1);
    }

    return total;
  })();
  const hasSelectedDateRange = Boolean(selectedStartDate && selectedEndDate);
  const rentLineLabel = hasSelectedDateRange ? "Rent for selected period" : "First month's rent";
  const firstMonthRentAmount = listing?.monthlyRent ?? 0;
  const amountToConfirmStay = rentForSelectedPeriod + tenantProtectionFee;
  const rentBreakdownRows = useMemo(() => {
    if (!listing || !selectedStartDate || !selectedEndDate || selectedEndDate < selectedStartDate) {
      return [] as Array<{
        periodLabel: string;
        amountLabel: string;
        originalAmountLabel?: string;
      }>;
    }

    const monthSegments: Array<{
      start: Date;
      end: Date;
      amount: number;
      isFullMonth: boolean;
    }> = [];

    let cursor = new Date(selectedStartDate);
    while (cursor <= selectedEndDate) {
      const segmentStart = new Date(cursor);
      const currentMonthEnd = monthEnd(segmentStart);
      const segmentEnd = currentMonthEnd < selectedEndDate ? currentMonthEnd : new Date(selectedEndDate);
      const daysInMonth = currentMonthEnd.getDate();
      const occupiedDays = Math.floor((segmentEnd.getTime() - segmentStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const amount = occupiedDays < daysInMonth
        ? (listing.monthlyRent / daysInMonth) * occupiedDays
        : listing.monthlyRent;

      monthSegments.push({
        start: segmentStart,
        end: segmentEnd,
        amount,
        isFullMonth: occupiedDays === daysInMonth,
      });

      cursor = new Date(segmentEnd);
      cursor.setDate(cursor.getDate() + 1);
    }

    const rows: Array<{ periodLabel: string; amountLabel: string; originalAmountLabel?: string }> = [];

    for (let i = 0; i < monthSegments.length; i += 1) {
      const segment = monthSegments[i];

      if (!segment.isFullMonth) {
        rows.push({
          periodLabel: `${getDateLabel(segment.start)} - ${getDateLabel(segment.end)}`,
          amountLabel: formatCurrency(segment.amount, listing.currency),
          originalAmountLabel: formatCurrency(listing.monthlyRent, listing.currency),
        });
        continue;
      }

      let count = 1;
      let lastEnd = segment.end;
      while (i + count < monthSegments.length && monthSegments[i + count].isFullMonth) {
        lastEnd = monthSegments[i + count].end;
        count += 1;
      }

      rows.push({
        periodLabel: `${getDateLabel(segment.start)} - ${getDateLabel(lastEnd)}`,
        amountLabel: count > 1 ? `${count} months x ${formatCurrency(listing.monthlyRent, listing.currency)}` : formatCurrency(listing.monthlyRent, listing.currency),
      });

      i += count - 1;
    }

    return rows;
  }, [listing, selectedStartDate, selectedEndDate]);

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
  };

  const handleApplyToRent = () => {
    if (isListingUnavailable) {
      toast.error("This listing is no longer available for applications.");
      return;
    }

    if (hasApplied) {
      const statusMessage = applicationStatus
        ? `You have already applied for this property (${applicationStatus}).`
        : "You have already applied for this property.";
      toast.info(statusMessage);
      return;
    }

    if (user?.role === "landlord") {
      return;
    }

    if (!selectedStartDate || !selectedEndDate) {
      setIsDatePickerModalOpen(true);
      toast.error("Please select move-in and move-out dates first.");
      return;
    }

    const applySearchParams = new URLSearchParams();
    if (selectedStartDate) {
      applySearchParams.set("moveIn", selectedStartDate.toISOString());
    }
    if (selectedEndDate) {
      applySearchParams.set("moveOut", selectedEndDate.toISOString());
    }
    applySearchParams.set("available", isMoveInAvailabilityChecked ? "1" : "0");
    const applyPath = `/property/${id}/apply?${applySearchParams.toString()}`;

    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?returnTo=${encodeURIComponent(applyPath)}`);
    } else {
      navigate(applyPath, {
        state: {
          selectedStartDate: selectedStartDate?.toISOString() ?? null,
          selectedEndDate: selectedEndDate?.toISOString() ?? null,
          isMoveInAvailabilityChecked,
        },
      });
    }
  };

  const handleMessageLandlord = async () => {
    if (isListingUnavailable) {
      toast.error("This listing is no longer available.");
      return;
    }

    if (user?.role === "landlord") {
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?returnTo=/property/${id}`);
    } else {
      if (!id) {
        navigate("/tenant/inbox");
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate(`/login?returnTo=/property/${id}`);
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/conversations`, {
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
    }
  };

  const handleToggleFavorite = async () => {
    if (isListingUnavailable) {
      toast.error("Unavailable listings cannot be favorited.");
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?returnTo=/property/${id}`);
    } else {
      if (!id || isFavoriteBusy) return;

      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate(`/login?returnTo=/property/${id}`);
        return;
      }

      const next = !isFavorited;
      setIsFavorited(next);
      setIsFavoriteBusy(true);

      try {
        const response = await fetch(
          next ? `${apiBase}/api/auth/me/favorites` : `${apiBase}/api/auth/me/favorites/${id}`,
          {
            method: next ? "POST" : "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: next ? JSON.stringify({ listingId: id }) : undefined,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update favorites");
        }

        toast.success(next ? "Added to favorites" : "Removed from favorites");
      } catch {
        setIsFavorited(!next);
        toast.error("Could not update favorites. Please try again.");
      } finally {
        setIsFavoriteBusy(false);
      }
    }
  };

  const handleShareListing = async () => {
    if (!listing || !id) {
      toast.error("Listing details are not available yet.");
      return;
    }

    const listingUrl = `${window.location.origin}/property/${id}`;
    const sharePayload = {
      title: listing.title,
      text: `Check out this property in ${listing.city}`,
      url: listingUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }

      await navigator.clipboard.writeText(listingUrl);
      toast.success("Listing link copied to clipboard");
    } catch {
      toast.error("Could not share this listing right now.");
    }
  };

  const handleViewOnMap = () => {
    if (!listing) {
      toast.error("Listing details are not available yet.");
      return;
    }

    navigate(`/listings/${listing.city.toLowerCase()}?viewMode=map`);
  };

  const handleOpenDateSelector = () => {
    if (!listing) {
      toast.error("Listing details are not available yet.");
      return;
    }
    setIsDatePickerModalOpen(true);
  };

  const handleCloseDateSelector = () => {
    setIsDatePickerModalOpen(false);
  };

  const handleDateRangeChange = (nextStart: Date | null, nextEnd: Date | null) => {
    if (!listing) {
      return;
    }

    if (!nextStart || !nextEnd) {
      toast.error("Please select both move-in and move-out dates.");
      return;
    }

    const minMoveOut = monthStart(addMonthsClamped(nextStart, Math.max(1, listing.minStay || 1)));
    if (nextEnd < minMoveOut) {
      toast.error(`Move-out date must be at least ${Math.max(1, listing.minStay || 1)} month(s) after move-in.`);
      return;
    }

    if (listing.maxStay && nextEnd > monthEnd(addMonthsClamped(nextStart, listing.maxStay))) {
      toast.error(`Move-out date cannot be more than ${listing.maxStay} month(s) after move-in.`);
      return;
    }

    setSelectedStartDate(nextStart);
    setSelectedEndDate(nextEnd);
    setIsDatePickerModalOpen(false);
    toast.success(`Dates selected: ${getDateLabel(nextStart)} - ${getDateLabel(nextEnd)}`);
  };

  const handleOpenPaymentsDrawer = () => {
    if (paymentsCloseTimerRef.current !== null) {
      window.clearTimeout(paymentsCloseTimerRef.current);
      paymentsCloseTimerRef.current = null;
    }
    setIsPaymentsDrawerOpen(true);
  };

  const handleClosePaymentsDrawer = () => {
    setIsPaymentsDrawerVisible(false);

    if (paymentsCloseTimerRef.current !== null) {
      window.clearTimeout(paymentsCloseTimerRef.current);
    }

    paymentsCloseTimerRef.current = window.setTimeout(() => {
      setIsPaymentsDrawerOpen(false);
      paymentsCloseTimerRef.current = null;
    }, 260);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant="dashboard" />

      {/* Breadcrumb */}
      <div className="bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[12px]">
          <div className="flex items-center gap-[8px] text-[13px]">
            <Link to="/" className="text-brand-primary hover:underline font-semibold">
              ReserveHousing
            </Link>
            <span className="text-neutral-gray">&gt;</span>
            <Link to={`/listings/${(listing?.city ?? "city").toLowerCase()}`} className="text-brand-primary hover:underline font-semibold">
              {listing?.city ?? "City"}
            </Link>
            <span className="text-neutral-gray">&gt;</span>
            <Link to={`/listings/${(listing?.city ?? "city").toLowerCase()}`} className="text-brand-primary hover:underline font-semibold">
              {listing?.propertyType ? `${listing.propertyType.charAt(0).toUpperCase()}${listing.propertyType.slice(1)}s` : "Properties"}
            </Link>
            <span className="text-neutral-gray">&gt;</span>
            <span className="text-neutral-black font-semibold">{listing?.title ?? "Listing"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-[32px] py-[32px]">
        {isLoading && (
          <div className="animate-pulse flex gap-[48px]">
            <div className="flex-[2]">
              <div className="mb-[24px]">
                <div className="h-[480px] w-full bg-[#E8EDF2] rounded-[4px] mb-[16px]" />
                <div className="flex items-center gap-[8px]">
                  <div className="h-[80px] w-[120px] bg-[#E8EDF2] rounded-[4px]" />
                  <div className="h-[80px] w-[120px] bg-[#E8EDF2] rounded-[4px]" />
                  <div className="h-[80px] w-[120px] bg-[#E8EDF2] rounded-[4px]" />
                  <div className="h-[80px] w-[120px] bg-[#E8EDF2] rounded-[4px]" />
                </div>
              </div>

              <div className="mb-[28px]">
                <div className="h-[40px] w-[72%] bg-[#E8EDF2] rounded-[4px] mb-[14px]" />
                <div className="h-[24px] w-[44%] bg-[#E8EDF2] rounded-[4px] mb-[16px]" />
                <div className="flex flex-wrap gap-[8px]">
                  <div className="h-[30px] w-[120px] bg-[#E8EDF2] rounded-full" />
                  <div className="h-[30px] w-[140px] bg-[#E8EDF2] rounded-full" />
                  <div className="h-[30px] w-[130px] bg-[#E8EDF2] rounded-full" />
                  <div className="h-[30px] w-[160px] bg-[#E8EDF2] rounded-full" />
                </div>
              </div>

              <div className="mb-[26px]">
                <div className="h-[34px] w-[220px] bg-[#E8EDF2] rounded-[4px] mb-[12px]" />
                <div className="h-[14px] w-full bg-[#E8EDF2] rounded-[4px] mb-[8px]" />
                <div className="h-[14px] w-[95%] bg-[#E8EDF2] rounded-[4px] mb-[8px]" />
                <div className="h-[14px] w-[82%] bg-[#E8EDF2] rounded-[4px]" />
              </div>

              <div className="mb-[28px]">
                <div className="h-[34px] w-[320px] bg-[#E8EDF2] rounded-[4px] mb-[12px]" />
                <div className="h-[220px] w-full bg-[#E8EDF2] rounded-[4px]" />
              </div>
            </div>

            <div className="flex-[1]">
              <div className="sticky top-[100px] space-y-[12px]">
                <div className="border border-[rgba(15,45,54,0.12)] rounded-[6px] bg-[#F8FAFC] p-[18px]">
                  <div className="h-[22px] w-[60%] bg-[#E8EDF2] rounded-[4px] mb-[12px]" />
                  <div className="h-[52px] w-full bg-[#E8EDF2] rounded-[6px] mb-[10px]" />
                  <div className="h-[16px] w-[72%] bg-[#E8EDF2] rounded-[4px] mb-[8px]" />
                  <div className="h-[16px] w-[64%] bg-[#E8EDF2] rounded-[4px] mb-[18px]" />
                  <div className="h-[44px] w-full bg-[#E8EDF2] rounded-[6px] mb-[8px]" />
                  <div className="h-[44px] w-full bg-[#E8EDF2] rounded-[6px]" />
                </div>

                <div className="border border-[rgba(15,45,54,0.12)] rounded-[6px] bg-white p-[16px]">
                  <div className="h-[18px] w-[56%] bg-[#E8EDF2] rounded-[4px] mb-[10px]" />
                  <div className="h-[14px] w-[92%] bg-[#E8EDF2] rounded-[4px] mb-[6px]" />
                  <div className="h-[14px] w-[82%] bg-[#E8EDF2] rounded-[4px]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !listing && (
          <div className="max-w-[760px] py-[56px]">
            <div className="border border-[rgba(0,0,0,0.08)] bg-[#FFF7ED] p-[32px]">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C] mb-[12px]">
                {isListingUnavailable ? "Listing unavailable" : "Listing not found"}
              </p>
              <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[12px]">
                {isListingUnavailable ? "This home is no longer available" : "We couldn't find this property"}
              </h1>
              <p className="text-[#6B6B6B] text-[15px] leading-[1.6] mb-[24px]">
                {listingError || "The listing may have been removed or is no longer accepting applications."}
              </p>
              <div className="flex items-center gap-[12px]">
                <Link
                  to="/"
                  className="px-[20px] py-[12px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors"
                >
                  Browse available homes
                </Link>
                <button
                  onClick={() => navigate(-1)}
                  className="px-[20px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        )}

        {listing && (
        <div className="flex gap-[48px]">
          {/* Left Column - Gallery & Details */}
          <div className="flex-[2]">
            {/* Image Gallery */}
            <div className="mb-[24px]">
              {/* Main Image */}
              <div className="relative mb-[16px] bg-[#F7F7F9]">
                <img
                  src={propertyImages[currentImageIndex]}
                  alt="Property"
                  className="w-full h-[480px] object-cover object-center bg-[#F3F4F6]"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={previousImage}
                  className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-[20px] h-[20px] text-[#1A1A1A]" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[40px] h-[40px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-[20px] h-[20px] text-[#1A1A1A]" />
                </button>

                {/* Top Right Actions */}
                <div className="absolute top-[16px] right-[16px] flex items-center gap-[8px]">
                  <button
                    type="button"
                    onClick={() => void handleShareListing()}
                    className="w-[40px] h-[40px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Share2 className="w-[18px] h-[18px] text-[#1A1A1A]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className="w-[40px] h-[40px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Heart
                      className={`w-[18px] h-[18px] ${
                        isFavorited ? "fill-brand-primary text-brand-primary" : "text-neutral-black"
                      }`}
                    />
                  </button>
                </div>

                {/* View on Map Button */}
                <button
                  type="button"
                  onClick={handleViewOnMap}
                  className="absolute bottom-[16px] left-[16px] flex items-center gap-[8px] bg-white px-[16px] py-[10px] hover:bg-[#F7F7F9] transition-colors"
                >
                  <MapPin className="w-[16px] h-[16px] text-[#1A1A1A]" />
                  <span className="text-[#1A1A1A] text-[14px] font-semibold">View on map</span>
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-[8px]">
                {propertyImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative w-[120px] h-[80px] overflow-hidden ${
                      currentImageIndex === index ? "ring-2 ring-brand-primary" : ""
                    }`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover object-center bg-[#F3F4F6]" />
                  </button>
                ))}

                {/* More Photos Button */}
                {hiddenPhotoCount > 0 && (
                  <button
                    onClick={() => setIsPhotosModalOpen(true)}
                    className="w-[120px] h-[80px] bg-neutral-black text-white flex flex-col items-center justify-center hover:bg-brand-primary transition-colors"
                  >
                    <HomeIcon className="w-[20px] h-[20px] mb-[4px]" />
                    <span className="text-[12px] font-semibold">+{hiddenPhotoCount} photos</span>
                  </button>
                )}
              </div>
            </div>

            {isPhotosModalOpen && (
              <div className="fixed inset-0 z-[60] bg-black/80 p-[24px] overflow-y-auto">
                <div className="max-w-[1200px] mx-auto">
                  <div className="flex items-center justify-between mb-[16px]">
                    <h3 className="text-white text-[20px] font-bold">All photos</h3>
                    <button
                      onClick={() => setIsPhotosModalOpen(false)}
                      className="w-[40px] h-[40px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-[20px] h-[20px]" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-[12px]">
                    {propertyImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setIsPhotosModalOpen(false);
                        }}
                        className="relative aspect-[4/3] overflow-hidden bg-[#F3F4F6]"
                      >
                        <img src={image} alt={`Photo ${index + 1}`} className="w-full h-full object-cover object-center" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Property Title & Meta */}
            <div className="mb-[28px]">
              <h1 className="text-[#0F2D36] text-[34px] leading-[1.08] font-bold tracking-[-0.02em] mb-[10px]">
                {isLoading ? "Loading..." : listing?.title ?? "Listing unavailable"}
              </h1>

              <div className="flex items-center flex-wrap gap-[8px] mb-[10px]">
                <span className="text-[#0F2D36] text-[44px] leading-[1] font-bold">{formatCurrency(listing?.monthlyRent ?? 0, listing?.currency).replace(".00", "")}</span>
                <span className="text-[#0F2D36] text-[15px] font-semibold">per month,</span>
                <span className="text-[#0F2D36] text-[13px] underline decoration-dotted underline-offset-[5px]">
                  {listing?.utilitiesIncluded ? "includes bills" : "excludes bills"}, {listing?.deposit === 0 ? "no deposit" : "deposit required"}
                </span>
              </div>

              <div className="flex flex-wrap gap-[8px]">
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">{formatValue(listing?.kind)}</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">Bedroom: {listing?.bedrooms ?? 0}</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">Property: {listing?.area ?? 0} m²</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">{listing?.amenityFlags.tv ? "Furnished" : "Unfurnished"}</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">Space for {listing?.suitablePeopleCount ?? Math.max(1, listing?.bedrooms ?? 1)} people</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">{listing?.bathrooms ?? 0} bathroom</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">{Math.max(0, (listing?.suitablePeopleCount ?? 1) - 1)} housemates (mixed)</span>
                <span className="px-[11px] py-[5px] text-[14px] leading-[1] border border-[rgba(15,45,54,0.22)] text-[#3E5A64] rounded-full">{formatValue(listing?.cancellationPolicy)} Cancellation</span>
              </div>
            </div>

            {/* Description */}
            <section className="mb-[26px] pb-[6px]">
              <h2 className="text-[#0F2D36] text-[40px] leading-[1.1] font-bold mb-[14px]">Description</h2>
              <p className="text-[#425F69] text-[15px] leading-[1.7] italic">
                {`${(listing?.description ?? "No listing description available.").slice(0, 280)}${
                  (listing?.description ?? "").length > 280 ? "..." : ""
                }`}
              </p>
              {(listing?.description?.length ?? 0) > 280 && (
                <button
                  type="button"
                  onClick={() => setIsDescriptionModalOpen(true)}
                  className="mt-[14px] text-[#0F2D36] text-[14px] italic underline decoration-dotted underline-offset-[5px] cursor-pointer hover:text-[#0A2530]"
                >
                  Show more
                </button>
              )}
            </section>

            {isDescriptionModalOpen && (
              <div className="fixed inset-0 z-[80] bg-black/45 p-[18px] md:p-[28px]">
                <div className="mx-auto max-w-[560px] bg-white border border-[rgba(0,0,0,0.16)] rounded-[6px] shadow-[0_10px_32px_rgba(0,0,0,0.22)] max-h-[calc(100vh-56px)] overflow-y-auto">
                  <div className="flex items-center justify-between px-[22px] py-[16px] border-b border-[rgba(0,0,0,0.10)]">
                    <h3 className="text-[#0F2D36] text-[28px] leading-[1.2] font-bold">Description</h3>
                    <button
                      type="button"
                      onClick={() => setIsDescriptionModalOpen(false)}
                      className="w-[32px] h-[32px] flex items-center justify-center text-[#6B7F88] hover:text-[#0F2D36] cursor-pointer"
                    >
                      <X className="w-[20px] h-[20px]" />
                    </button>
                  </div>

                  <div className="px-[22px] py-[18px]">
                    <p className="text-[#425F69] text-[15px] leading-[1.75] italic whitespace-pre-line">
                      {listing?.description ?? "No listing description available."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Facilities and Amenities */}
            <section className="mb-[28px] pb-[24px] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-[#0F2D36] text-[40px] leading-[1.1] font-bold mb-[14px]">Facilities and amenities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[26px]">
                {[0, 1].map((columnIndex) => {
                  const shownItems = isFacilitiesExpanded ? facilitiesAndAmenities : facilitiesAndAmenities.slice(0, 8);
                  const midpoint = Math.ceil(shownItems.length / 2);
                  const columnItems = columnIndex === 0 ? shownItems.slice(0, midpoint) : shownItems.slice(midpoint);

                  return (
                    <div key={columnIndex} className={`${columnIndex === 1 ? "md:border-l md:border-[rgba(0,0,0,0.08)] md:pl-[26px]" : ""} space-y-[14px]`}>
                      {columnItems.map((item) => {
                        const lower = item.toLowerCase();
                        const Icon =
                          lower.includes("bath") || lower.includes("toilet")
                            ? Bath
                            : lower.includes("living")
                            ? Sofa
                            : lower.includes("wifi")
                            ? Wifi
                            : lower.includes("bed")
                            ? Bed
                            : lower.includes("tv")
                            ? Tv
                            : lower.includes("kitchen")
                            ? Utensils
                            : Check;

                        return (
                          <div key={item} className="flex items-center gap-[10px] text-[#596E76] text-[15px] italic">
                            <Icon className="w-[16px] h-[16px] text-[#1F3D47]" />
                            <span>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {facilitiesAndAmenities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsFacilitiesModalOpen(true)}
                  className="mt-[14px] text-[#0F2D36] text-[14px] italic underline decoration-dotted underline-offset-[5px] cursor-pointer hover:text-[#0A2530]"
                >
                  Show more
                </button>
              )}
            </section>

            {isFacilitiesModalOpen && (
              <div className="fixed inset-0 z-[80] bg-black/45 p-[18px] md:p-[28px]">
                <div className="mx-auto max-w-[560px] bg-white border border-[rgba(0,0,0,0.16)] rounded-[6px] shadow-[0_10px_32px_rgba(0,0,0,0.22)] max-h-[calc(100vh-56px)] overflow-y-auto">
                  <div className="flex items-center justify-between px-[22px] py-[16px] border-b border-[rgba(0,0,0,0.10)]">
                    <h3 className="text-[#0F2D36] text-[34px] leading-[1.2] font-bold">Facilities and amenities</h3>
                    <button
                      type="button"
                      onClick={() => setIsFacilitiesModalOpen(false)}
                      className="w-[32px] h-[32px] flex items-center justify-center text-[#6B7F88] hover:text-[#0F2D36] cursor-pointer"
                    >
                      <X className="w-[20px] h-[20px]" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[22px] px-[22px] py-[18px]">
                    <div>
                      <h4 className="text-[#0F2D36] text-[16px] font-bold mb-[10px]">Facilities</h4>
                      <div className="space-y-[10px]">
                        {facilitiesModalData.facilities.map((item) => (
                          <div key={item.label} className="flex items-center gap-[10px]">
                            <Check className={`w-[16px] h-[16px] ${item.available ? "text-[#1F3D47]" : "text-[#9BA8AD]"}`} />
                            <span className={`text-[14px] italic ${item.available ? "text-[#5A6E75]" : "text-[#A2ADB2] line-through"}`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[#0F2D36] text-[16px] font-bold mb-[10px]">Amenities</h4>
                      <div className="space-y-[10px]">
                        {facilitiesModalData.amenities.map((item) => (
                          <div key={item.label} className="flex items-center gap-[10px]">
                            <Check className={`w-[16px] h-[16px] ${item.available ? "text-[#1F3D47]" : "text-[#9BA8AD]"}`} />
                            <span className={`text-[14px] italic ${item.available ? "text-[#5A6E75]" : "text-[#A2ADB2] line-through"}`}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section className="mb-[28px] bg-[#E9EDF1] rounded-[4px] p-[24px]">
              <div className="flex items-start gap-[10px]">
                <div className="w-[28px] h-[28px] rounded-[8px] bg-[#073543] text-white flex items-center justify-center shrink-0 mt-[2px]">
                  <Shield className="w-[16px] h-[16px]" />
                </div>
                <div>
                  <h3 className="text-[#0F2D36] text-[18px] leading-[1.3] font-bold mb-[6px]">No guarantor? Choose ReserveHousing Rent Guarantee</h3>
                  <p className="text-[#425F69] text-[14px] leading-[1.6]">
                    This landlord may ask for a guarantor. ReserveHousing Rent Guarantee saves you the hassle of finding one and comes with extra damage protection. It costs only 3% of your total contract value.
                    <button className="ml-[4px] text-[#0F2D36] text-[14px] font-semibold underline decoration-dotted underline-offset-[4px] hover:text-[#0A2530] transition-colors cursor-pointer">Learn more</button>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-[28px]">
              <h2 className="text-[#0F2D36] text-[40px] leading-[1.2] font-bold mb-[12px]">House rules and preferences</h2>
              <div className="border border-[rgba(0,0,0,0.16)] rounded-[4px] p-[14px] grid grid-cols-1 md:grid-cols-2 gap-[0]">
                {[housePreferences.slice(0, 4), housePreferences.slice(4)].map((column, columnIndex) => (
                  <div key={columnIndex} className={`${columnIndex === 1 ? "md:border-l md:border-[rgba(0,0,0,0.08)] md:pl-[24px]" : "md:pr-[24px]"} space-y-[8px]`}>
                    {column.map((item) => {
                      const [label, ...valueParts] = item.split(":");
                      const value = valueParts.join(":").trim();
                      return (
                        <p key={item} className="text-[#6A7F88] text-[14px] leading-[1.6]">
                          <span className="mr-[6px]">•</span>
                          <span>{label.trim()}:</span>{" "}
                          <span className="font-semibold text-[#5B6E78]">{value}</span>
                        </p>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-[28px] bg-[#3462CF] rounded-[4px] p-[28px] text-white">
              <h3 className="text-[42px] leading-[1.18] font-bold mb-[8px]">Tenant Protection: Smooth move, or your money back</h3>
              <p className="text-[16px] leading-[1.6] mb-[18px] text-[#EAF2FF]">
                Move in and check the place out. You have 48 hours to report any problems, then we'll send your money to the landlord.
              </p>

              <div className="mb-[14px]">
                <div className="w-full h-[30px] bg-[#5E84D8] rounded-[4px] flex items-center overflow-hidden">
                  <div className="flex-1 h-full" />
                  <div className="w-[65%] h-full bg-white text-[#365EC3] flex items-center justify-center gap-[6px] text-[13px] font-semibold">
                    <Lock className="w-[14px] h-[14px]" />
                    Your money's held safe
                  </div>
                  <div className="flex-1 h-full" />
                </div>

                <div className="mt-[10px] border-t border-dashed border-[#89A3E3] relative">
                  <div className="absolute -top-[3px] left-[17%] w-[6px] h-[6px] rounded-full bg-[#DCE8FF]" />
                  <div className="absolute -top-[3px] left-[49%] w-[6px] h-[6px] rounded-full bg-[#DCE8FF]" />
                  <div className="absolute -top-[3px] left-[82%] w-[6px] h-[6px] rounded-full bg-[#DCE8FF]" />
                </div>

                <div className="mt-[10px] grid grid-cols-3 text-[13px] font-semibold text-[#EAF2FF]">
                  <p className="text-center">Confirm rental</p>
                  <p className="text-center">Move in</p>
                  <p className="text-center">48 hours later</p>
                </div>
              </div>

              <button className="text-[15px] font-semibold underline hover:text-[#EAF2FF] transition-colors cursor-pointer">How Tenant Protection works</button>
            </section>

            <section className="mb-[28px]">
              <h2 className="text-[#0F2D36] text-[36px] leading-[1.2] font-bold mb-[12px]">Required documents</h2>
              <div className="border border-[rgba(0,0,0,0.16)] rounded-[3px] p-[16px]">
                <p className="text-[#7B8E97] text-[14px] italic mb-[10px]">The following documents are required to rent this place:</p>
                {requiredDocuments.map((doc) => (
                  <div key={doc} className="mb-[6px]">
                    <p className="text-[#0F2D36] text-[16px] font-bold italic flex items-center gap-[8px]">
                      <FileText className="w-[15px] h-[15px] text-[#0F2D36]" />
                      {doc}
                    </p>
                    {doc.toLowerCase().includes("identity") && (
                      <p className="text-[#6E838D] text-[13px] italic pl-[24px]">Government-issued ID or passport.</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-[28px]">
              <h2 className="text-[#0F2D36] text-[36px] leading-[1.2] font-bold mb-[12px]">How rent is calculated</h2>
              <div className="border border-[rgba(0,0,0,0.16)] rounded-[3px] p-[16px]">
                <p className="text-[#0F2D36] text-[16px] font-bold mb-[10px] flex items-center gap-[8px]">
                  <FileText className="w-[15px] h-[15px] text-[#0F2D36]" />
                  {formatValue(listing?.rentCalculation)} basis
                </p>
                <p className="text-[#3D555F] text-[14px] leading-[1.7] mb-[14px]">
                  {listing?.rentCalculation === "daily"
                    ? "This listing's rent is calculated on a daily basis. For the first and last months of your stay, you'll only pay for the exact number of nights in your rental period. To confirm your rental, you'll need to pay one month's rent in full. Any excess rent you pay for the first month will be subtracted from the next month's rent."
                    : listing?.rentCalculation === "half-monthly"
                    ? "This listing uses a half-monthly calculation. If your move-in or move-out creates a partial month, pricing is adjusted according to the stay period and contract terms."
                    : "This listing uses monthly rent calculation according to contract terms and billing schedule."}
                </p>

                <div className="border-t border-[rgba(0,0,0,0.10)] pt-[12px] flex items-start justify-between gap-[12px]">
                  <div>
                    <p className="text-[#0F2D36] text-[16px] font-bold flex items-center gap-[8px] mb-[6px]">
                      <FileText className="w-[15px] h-[15px] text-[#0F2D36]" />
                      Preview contract
                    </p>
                    <p className="text-[#3D555F] text-[14px] leading-[1.6] max-w-[520px]">
                      Want to know what's in the rental contract? Preview the draft contract for this place.
                    </p>
                  </div>
                  <div className="flex flex-col gap-[8px] shrink-0">
                    {/* <button className="px-[14px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#0F2D36] text-[14px] font-semibold bg-[#F3F7FB] hover:bg-[#EAF1F8]">View French contract</button>
                    <button className="px-[14px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#0F2D36] text-[14px] font-semibold bg-[#F3F7FB] hover:bg-[#EAF1F8]">View English translation</button> */}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-[28px]">
              <h2 className="text-[#0F2D36] text-[36px] leading-[1.2] font-bold mb-[12px]">Cancellation policy</h2>
              <div className="border border-[rgba(0,0,0,0.16)] rounded-[3px] p-[16px]">
                <p className="text-[#3D5560] text-[15px] font-bold italic mb-[10px] flex items-center gap-[8px]">
                  <FileText className="w-[15px] h-[15px] text-[#0F2D36]" />
                  {formatValue(listing?.cancellationPolicy)} cancellation
                </p>
                {listing?.cancellationPolicy === "flexible" ? (
                  <>
                    <p className="text-[#5E737C] text-[14px] leading-[1.7] italic mb-[6px]">If you cancel within 24 hours of confirmation - Full refund of first month's rent.</p>
                    <p className="text-[#5E737C] text-[14px] leading-[1.7] italic mb-[10px]">If you cancel when your move-in date is:</p>
                    <ul className="space-y-[6px] mb-[10px]">
                      <li className="text-[#5E737C] text-[14px] italic">○ More than 30 days away - Full refund of first month's rent</li>
                      <li className="text-[#5E737C] text-[14px] italic">○ 30 to 7 days away - 50% refund of first month's rent</li>
                      <li className="text-[#5E737C] text-[14px] italic">○ Less than 7 days away - No refund</li>
                    </ul>
                  </>
                ) : (
                  <p className="text-[#5E737C] text-[14px] leading-[1.7] italic mb-[10px]">
                    This listing follows strict cancellation terms. Please review your contract timeline and refund conditions carefully before confirming your booking.
                  </p>
                )}
                <p className="text-[#6D818A] text-[13px] italic">The Tenant Protection fee is non-refundable.</p>
              </div>
            </section>

            <section className="mb-[16px]">
              <h2 className="text-[#0F2D36] text-[20px] font-bold italic mb-[12px]">How to rent this place</h2>
              <div className="space-y-0 border border-[rgba(0,0,0,0.12)] rounded-[2px] overflow-hidden">
                {faqItems.map((item, index) => (
                  <div key={item.question} className="border-t border-[rgba(0,0,0,0.12)] first:border-t-0 bg-[#F6F8FA]">
                    <button
                      type="button"
                      onClick={() => toggleFaqItem(index)}
                      className="w-full px-[12px] py-[11px] flex items-center justify-between text-left hover:bg-[#EDF2F6] transition-colors cursor-pointer"
                    >
                      <span className="text-[#2D4A55] text-[13px] italic font-semibold">{item.question}</span>
                      <ChevronDown className={`w-[14px] h-[14px] text-[#6B7F88] transition-transform ${openFaqIndex === index ? "rotate-180" : ""}`} />
                    </button>
                    {openFaqIndex === index && (
                      <div className="px-[12px] pb-[12px]">
                        <p className="text-[#5D717A] text-[12px] italic leading-[1.7] mb-[8px]">{item.answerTitle}</p>
                        {item.lines.map((line) => (
                          <p key={line} className="text-[#5D717A] text-[12px] italic leading-[1.7]">
                            {line}
                          </p>
                        ))}

                        {item.videoUrl && item.videoThumbnail && (
                          <a
                            href={item.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-[10px] block max-w-[420px] border border-[rgba(0,0,0,0.18)] bg-white"
                          >
                            <div className="relative">
                              <img src={item.videoThumbnail} alt="Tenant Protection video" className="w-full h-[210px] object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[58px] h-[40px] rounded-[8px] bg-[#FF0000] flex items-center justify-center">
                                  <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[13px] border-t-transparent border-b-transparent border-l-white ml-[2px]" />
                                </div>
                              </div>
                            </div>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="flex-[1]">
            <div className="sticky top-[100px] space-y-[10px]">
              <div className="border border-[rgba(15,45,54,0.18)] rounded-[6px] bg-[#F8FAFC] overflow-hidden">
                <div className="px-[24px] py-[18px] flex items-center gap-[14px] border-b border-[rgba(15,45,54,0.12)] bg-white">
                  <div className="w-[64px] h-[64px] rounded-full overflow-hidden border border-[rgba(15,45,54,0.16)] bg-[#EAF2FF] shrink-0">
                    <img
                      src={listing?.images?.[0] || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"}
                      alt="Landlord"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[#0F2D36] text-[16px] leading-[1.2] font-bold mb-[6px]">{listing?.landlord?.name ?? "Landlord"}</p>
                    <p className="text-[#0F2D36] text-[14px] leading-[1] flex items-center gap-[6px]">
                      <ShieldCheck className="w-[16px] h-[16px] text-[#0E7A48]" />
                      Verified
                    </p>
                  </div>
                </div>

                <div className="px-[24px] py-[18px]">
                  <div className="flex items-center justify-between mb-[14px]">
                    <p className="text-[#2F4653] text-[14px] leading-[1.2]">1st available move-in date:</p>
                    <p className="text-[#2F4653] text-[14px] leading-[1.2] font-bold">
                      {new Date(listing.availableFrom).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenDateSelector}
                    className="w-full h-[56px] mb-[16px] flex items-center justify-center gap-[8px] border border-[rgba(15,45,54,0.35)] rounded-[7px] text-[#0F2D36] hover:bg-[#EEF3F7] transition-colors"
                  >
                    <Calendar className="w-[20px] h-[20px]" />
                    <span className="text-[16px] leading-[1] font-semibold">
                      {selectedStartDate && selectedEndDate
                        ? `${new Date(selectedStartDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} - ${new Date(selectedEndDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                        : "Move in - Move out"}
                    </span>
                  </button>

                  {hasSelectedDateRange && (
                    <>
                      <div className="space-y-[10px] pb-[14px] border-b border-[rgba(15,45,54,0.14)]">
                        <div className="flex items-center justify-between">
                          <p className="text-[#2F4653] text-[15px] leading-[1.2] flex items-center gap-[6px]">
                            {rentLineLabel}
                            <span className="relative inline-flex items-center group">
                              <Info className="w-[14px] h-[14px] cursor-help" aria-hidden="true" />
                              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[20] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0F2D36] px-[8px] py-[6px] text-[12px] leading-[1.3] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-opacity duration-150 group-hover:opacity-100">
                                This is the rent total for your selected rental period.
                              </span>
                            </span>
                          </p>
                          <p className="text-[#2F4653] text-[15px] leading-[1.2]">{formatCurrency(rentForSelectedPeriod, listing?.currency)}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[#2F4653] text-[15px] leading-[1.2] flex items-center gap-[6px]">
                            Tenant Protection fee
                            <span className="relative inline-flex items-center group">
                              <Info className="w-[14px] h-[14px] cursor-help" aria-hidden="true" />
                              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[20] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0F2D36] px-[8px] py-[6px] text-[12px] leading-[1.3] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-opacity duration-150 group-hover:opacity-100">
                                Fee for payment protection and move-in support.
                              </span>
                            </span>
                          </p>
                          <p className="text-[#2F4653] text-[15px] leading-[1.2]">{formatCurrency(tenantProtectionFee, listing?.currency)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-[14px]">
                        <p className="text-[#2F4653] text-[18px] leading-[1.2] font-bold">To confirm stay</p>
                        <p className="text-[#2F4653] text-[18px] leading-[1.2] font-bold">{formatCurrency(amountToConfirmStay, listing?.currency)}</p>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenPaymentsDrawer}
                    className="flex items-center gap-[8px] text-[#0F2D36] text-[15px] leading-[1.2] font-semibold underline decoration-dotted underline-offset-[4px] mb-[16px] hover:text-[#0A2530] transition-colors cursor-pointer"
                  >
                    <FileText className="w-[16px] h-[16px]" />
                    View all payments
                  </button>

                  <button
                    onClick={handleApplyToRent}
                    disabled={user?.role === "landlord" || hasApplied}
                    className="w-full h-[56px] rounded-[8px] bg-brand-primary text-white text-[16px] leading-[1] font-bold hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {hasApplied ? "Application already submitted" : "Apply to rent"}
                  </button>

                  {hasApplied && (
                    <p className="mt-[8px] text-[12px] text-[#6B6B6B]">
                      You already applied for this property{applicationStatus ? ` (${applicationStatus})` : ""}.
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-[rgba(15,45,54,0.18)] rounded-[6px] p-[28px] bg-[#F8FAFC]">
                <h4 className="text-[#0F2D36] text-[16px] leading-[1.2] font-bold mb-[14px]">Not ready to apply?</h4>
                <p className="text-[#173743] text-[14px] leading-[1.55] mb-[18px] max-w-[420px]">
                  Ask the landlord questions, share info, and see if there's a match. Get the answers you need to rent with peace of mind.
                </p>
                <button
                  onClick={handleMessageLandlord}
                  disabled={user?.role === "landlord"}
                  className="w-full h-[58px] flex items-center justify-center gap-[10px] border-[3px] border-[#B8C8D4] rounded-[6px] text-[#0F2D36] text-[14px] font-semibold hover:bg-[#EEF3F7] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <MessageSquare className="w-[18px] h-[18px]" />
                  Message landlord
                </button>
              </div>

              <div className="border border-[rgba(15,45,54,0.12)] rounded-[6px] p-[28px] bg-[#E9EEF4]">
                <h4 className="text-[#264991] text-[16px] leading-[1.25] font-bold mb-[12px] flex items-center gap-[10px]">
                  <Heart className="w-[22px] h-[22px]" />
                  Covered by Tenant Protection
                </h4>
                <p className="text-[#274A93] text-[14px] leading-[1.6] mb-[16px] max-w-[420px]">
                  You're guaranteed a stress-free move-in or your money back.
                </p>

                {isProtectionExpanded && (
                  <div className="space-y-[18px] mb-[18px]">
                    <div className="flex items-start gap-[10px]">
                      <CheckCircle2 className="w-[22px] h-[22px] text-[#264991] mt-[2px] shrink-0" />
                      <div>
                        <p className="text-[#264991] text-[16px] font-bold mb-[4px]">Protection against the unexpected</p>
                        <p className="text-[#274A93] text-[14px] leading-[1.6]">
                          If the landlord cancels last minute or delays your move-in, you'll get help finding another place or a temporary hotel stay.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-[10px]">
                      <CheckCircle2 className="w-[22px] h-[22px] text-[#264991] mt-[2px] shrink-0" />
                      <div>
                        <p className="text-[#264991] text-[16px] font-bold mb-[4px]">Quick support</p>
                        <p className="text-[#274A93] text-[14px] leading-[1.6]">
                          If something goes wrong with your rental, we can help make it right.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-[10px]">
                      <CheckCircle2 className="w-[22px] h-[22px] text-[#264991] mt-[2px] shrink-0" />
                      <div>
                        <p className="text-[#264991] text-[16px] font-bold mb-[4px]">Move-in with confidence</p>
                        <p className="text-[#274A93] text-[14px] leading-[1.6]">
                          We keep your payment safe until you move in. If the place doesn't match the description, you'll get a refund.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsProtectionExpanded((prev) => !prev)}
                  className="text-[#264991] text-[14px] font-medium underline decoration-dotted underline-offset-[4px] flex items-center gap-[6px] hover:text-[#1D3F85] transition-colors cursor-pointer"
                >
                  How you're protected
                  <ChevronDown className={`w-[14px] h-[14px] transition-transform ${isProtectionExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>

              <div className="border border-[rgba(15,45,54,0.18)] rounded-[6px] p-[28px] bg-[#F8FAFC]">
                <h4 className="text-[#0F2D36] text-[16px] leading-[1.2] font-bold mb-[12px] flex items-center gap-[10px]">
                  <FileText className="w-[22px] h-[22px]" />
                  Digital Contract
                </h4>
                <p className="text-[#173743] text-[14px] leading-[1.55] mb-[16px] max-w-[420px]">
                  Easily review and sign your rental agreement online. Secure, fast, and hassle-free.
                </p>
                {/* <button className="text-[#0F2D36] text-[14px] font-medium underline decoration-dotted underline-offset-[4px] hover:text-[#0A2530] transition-colors cursor-pointer">
                  Learn more
                </button> */}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {isPaymentsDrawerOpen && listing && (
        <div className="fixed inset-0 z-[90]">
          <button
            type="button"
            aria-label="Close payments drawer"
            onClick={handleClosePaymentsDrawer}
            className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
              isPaymentsDrawerVisible ? "opacity-100" : "opacity-0"
            }`}
          />

          <aside
            className={`absolute right-0 top-0 h-full w-full max-w-[640px] bg-white shadow-[0_12px_38px_rgba(0,0,0,0.28)] overflow-y-auto transition-transform duration-300 ease-out ${
              isPaymentsDrawerVisible ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="sticky top-0 z-[2] bg-white border-b border-[rgba(15,45,54,0.14)] px-[24px] py-[20px] flex items-center justify-between">
              <h3 className="text-[#0F2D36] text-[38px] leading-[1.05] font-bold">Total payments</h3>
              <button
                type="button"
                onClick={handleClosePaymentsDrawer}
                className="w-[36px] h-[36px] rounded-[4px] text-[#0F2D36] hover:bg-[#EEF3F7] transition-colors cursor-pointer flex items-center justify-center"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="px-[24px] py-[22px]">
              <p className="text-[#173743] text-[16px] leading-[1.55] mb-[18px]">A breakdown of all costs for your stay.</p>

              <p className="text-[#0F2D36] text-[33px] leading-[1.1] font-bold mb-[14px]">You <span className="text-[#6A7F88]">-&gt;</span> ReserveHousing</p>
              <p className="text-[#173743] text-[16px] leading-[1.55] mb-[14px]">Pay this now to secure your place.</p>

              {hasSelectedDateRange ? (
                <>
                  <div className="space-y-[10px] border-b border-[rgba(15,45,54,0.12)] pb-[16px]">
                    <div className="flex items-center justify-between gap-[12px]">
                      <p className="text-[#0F2D36] text-[16px] leading-[1.35]">{rentLineLabel}</p>
                      <p className="text-[#0F2D36] text-[16px] leading-[1.35] font-semibold">{formatCurrency(rentForSelectedPeriod, listing.currency)}</p>
                    </div>

                    <div className="flex items-center justify-between gap-[12px]">
                      <p className="text-[#0F2D36] text-[16px] leading-[1.35] flex items-center gap-[6px]">
                        Tenant Protection fee
                        <span className="relative inline-flex items-center group">
                          <Info className="w-[14px] h-[14px] text-[#70838B] cursor-help" aria-hidden="true" />
                          <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[20] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0F2D36] px-[8px] py-[6px] text-[12px] leading-[1.3] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-opacity duration-150 group-hover:opacity-100">
                            Fee for payment protection and move-in support.
                          </span>
                        </span>
                      </p>
                      <p className="text-[#0F2D36] text-[16px] leading-[1.35] font-semibold">{formatCurrency(tenantProtectionFee, listing.currency)}</p>
                    </div>
                  </div>

                  <div className="mt-[10px] mb-[18px] rounded-[4px] bg-[#EEF3F7] p-[12px]">
                    <div className="flex items-center justify-between gap-[12px] mb-[6px]">
                      <p className="text-[#0F2D36] text-[16px] leading-[1.2] font-bold">Total</p>
                      <p className="text-[#0F2D36] text-[16px] leading-[1.2] font-bold">{formatCurrency(amountToConfirmStay, listing.currency)}</p>
                    </div>
                    <p className="text-[#264991] text-[14px] leading-[1.45] flex items-center gap-[6px]">
                      <Shield className="w-[14px] h-[14px]" />
                      Covered by Tenant Protection.
                      <button
                        type="button"
                        className="underline decoration-dotted underline-offset-[4px] hover:text-[#1D3F85] transition-colors cursor-pointer"
                      >
                        Learn more
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-[18px] border-b border-[rgba(15,45,54,0.12)] pb-[16px]">
                  <div className="flex items-end justify-between gap-[12px] border-b border-dotted border-[rgba(15,45,54,0.24)] pb-[8px]">
                    <p className="text-[#0F2D36] text-[16px] leading-[1.35] font-semibold">Monthly rent</p>
                    <p className="text-[#0F2D36] text-[16px] leading-[1.35] font-semibold">{formatCurrency(firstMonthRentAmount, listing.currency).replace(".00", "")}</p>
                  </div>
                  <div className="flex items-end justify-between gap-[12px] border-b border-dotted border-[rgba(15,45,54,0.24)] pb-[8px]">
                    <p className="text-[#0F2D36] text-[16px] leading-[1.35] font-semibold flex items-center gap-[6px]">
                      Tenant Protection fee
                      <span className="relative inline-flex items-center group">
                        <Info className="w-[14px] h-[14px] text-[#70838B] cursor-help" aria-hidden="true" />
                        <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[20] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0F2D36] px-[8px] py-[6px] text-[12px] leading-[1.3] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-opacity duration-150 group-hover:opacity-100">
                          Fee for payment protection and move-in support.
                        </span>
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenDateSelector}
                      className="text-[#0F2D36] text-[16px] leading-[1.35] font-semibold underline decoration-dotted underline-offset-[4px] hover:text-[#0A2530] transition-colors cursor-pointer"
                    >
                      Select dates
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-[16px] border-t border-[rgba(15,45,54,0.12)]">
                <p className="text-[#0F2D36] text-[33px] leading-[1.1] font-bold mb-[14px]">You <span className="text-[#6A7F88]">-&gt;</span> {listing.landlord?.name ?? "Landlord"}</p>
                <p className="text-[#173743] text-[16px] leading-[1.55] mb-[14px]">Future rental costs to the landlord. You'll pay these directly, per your contract.</p>

                <div className="space-y-[10px] mb-[12px]">
                  <div className="flex items-center justify-between gap-[12px]">
                    <p className="text-[#0F2D36] text-[16px] leading-[1.35]">{securityDepositLine?.label ?? "Security deposit"}</p>
                    <p className="text-[#95A4AC] text-[16px] leading-[1.35] font-semibold">{securityDepositLine?.value ?? "Not required"}</p>
                  </div>

                  <div>
                    <p className="text-[#0F2D36] text-[16px] leading-[1.35] mb-[6px]">Utilities</p>
                    <div className="space-y-[8px] pl-[10px]">
                      {utilityLines.length > 0 ? (
                        utilityLines.map((line) => (
                          <div key={line.label} className="flex items-center justify-between gap-[10px]">
                            <p className="text-[#173743] text-[15px] leading-[1.35]">{line.label}</p>
                            <p className="text-[15px] leading-[1.35] flex items-center gap-[6px] text-[#2A7B4F]">
                              {line.value === "Included" && <Check className="w-[14px] h-[14px]" />}
                              <span className={line.value === "Included" ? "font-medium" : "text-[#0F2D36]"}>{line.value}</span>
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#7A8A91] text-[14px]">No utility details available.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-[8px] border-t border-[rgba(15,45,54,0.12)]">
                  <p className="text-[#0F2D36] text-[16px] leading-[1.35] mb-[8px]">Rent</p>
                  <div className="space-y-[8px]">
                    {hasSelectedDateRange && rentBreakdownRows.length > 0 ? (
                      rentBreakdownRows.map((row) => (
                        <div key={`${row.periodLabel}-${row.amountLabel}`} className="flex items-center gap-[10px]">
                          <p className="text-[#173743] text-[15px] leading-[1.35] whitespace-nowrap">{row.periodLabel}</p>
                          <span className="flex-1 border-b border-dotted border-[rgba(15,45,54,0.24)]" />
                          <div className="flex items-center gap-[6px]">
                            {row.originalAmountLabel && (
                              <span className="relative inline-flex items-center gap-[6px] group">
                                <Info className="w-[14px] h-[14px] text-[#70838B] cursor-help" aria-hidden="true" />
                                <span className="text-[#8897A0] text-[15px] leading-[1.35] line-through">{row.originalAmountLabel}</span>
                                <span className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-[20] -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#0F2D36] px-[8px] py-[6px] text-[12px] leading-[1.3] font-medium text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.24)] transition-opacity duration-150 group-hover:opacity-100">
                                  Original full-month rent before proration.
                                </span>
                              </span>
                            )}
                            <span className="text-[#0F2D36] text-[15px] leading-[1.35] font-medium">{row.amountLabel}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-[12px]">
                          <p className="text-[#173743] text-[15px] leading-[1.35]">
                            {moveInDate && firstRentEndDate ? `${getDateLabel(moveInDate)} - ${getDateLabel(firstRentEndDate)}` : "Current period"}
                          </p>
                          <p className="text-[#0F2D36] text-[15px] leading-[1.35] font-medium">{rentLine?.value ?? formatCurrency(listing.monthlyRent, listing.currency)}</p>
                        </div>
                        <div className="flex items-center justify-between gap-[12px]">
                          <p className="text-[#173743] text-[15px] leading-[1.35]">
                            {secondRentStartDate && secondRentEndDate ? `${getDateLabel(secondRentStartDate)} - ${getDateLabel(secondRentEndDate)}` : "Next period"}
                          </p>
                          <p className="text-[#0F2D36] text-[15px] leading-[1.35] font-medium">{rentLine?.value ?? formatCurrency(listing.monthlyRent, listing.currency)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {isDatePickerModalOpen && listing && (
        <div className="fixed inset-0 z-[95]">
          <button
            type="button"
            aria-label="Close date picker"
            onClick={handleCloseDateSelector}
            className="absolute inset-0 z-[0] bg-black/30"
          />

          <div className="relative z-[1] mx-auto mt-[12px] md:mt-[22px] w-[94vw] max-w-[980px]">
            <div className="mb-[8px] flex justify-end">
              <button
                type="button"
                onClick={handleCloseDateSelector}
                className="w-[38px] h-[38px] rounded-[8px] bg-white/95 hover:bg-white transition-colors flex items-center justify-center"
              >
                <X className="w-[18px] h-[18px] text-[#0F2D36]" />
              </button>
            </div>

            <DatePicker
              isOpen={isDatePickerModalOpen}
              onClose={handleCloseDateSelector}
              startDate={selectedStartDate}
              endDate={selectedEndDate}
              onDateChange={handleDateRangeChange}
              moveInAvailableChecked={isMoveInAvailabilityChecked}
              onMoveInAvailableChange={setIsMoveInAvailabilityChecked}
              isModal
              minStayMonths={Math.max(1, listing.minStay || 1)}
              maxStayMonths={listing.maxStay}
              availableFrom={new Date(listing.availableFrom)}
            />
          </div>
        </div>
      )}

      <Footer variant="dashboard" />
    </div>
  );
}