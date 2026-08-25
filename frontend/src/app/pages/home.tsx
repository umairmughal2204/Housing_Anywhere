import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { DatePicker } from "../components/date-picker";
import { motion, useScroll, useTransform } from "motion/react";
import mapImage from "../../assets/map.avif";
import guaranteedImage from "../../assets/guaranteed.avif";
import houseImage from "../../assets/house_image.svg";
import heroBg from "../../assets/hero-bg.jpg";
import {
  MapPin,
  Calendar,
  ArrowRight,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Home as HomeIcon,
  Building2,
  Building
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { toast } from "sonner";
import { API_BASE } from "../config";

interface HomeListing {
  id: string;
  title: string;
  area: number;
  bedrooms: number;
  monthlyRent: number;
  images: string[];
  availableFrom: string;
  createdAt: string;
  utilitiesIncluded: boolean;
}

type ApiHomeListing = Partial<HomeListing> & {
  media?: Array<{ url?: string }>;
  propertySize?: number;
  bedroomsCount?: number;
};

interface FavoriteListing {
  id: string;
  title: string;
  city: string;
  area: number;
  bedrooms: number;
  monthlyRent: number;
  image: string;
  availableFrom: string;
  propertyType: string;
  utilitiesIncluded: boolean;
}

type ApiFavoriteListing = Partial<FavoriteListing> & {
  media?: Array<{ url?: string }>;
  images?: string[];
  propertyType?: string;
  utilitiesIncluded?: boolean;
};

type FavoritesPayload = {
  listingIds?: Array<string | number>;
  favorites?: ApiFavoriteListing[];
};

interface CitySuggestion {
  name: string;
  country: string;
  properties: number;
  image?: string;
}

interface ListingCitySuggestion {
  city: string;
  images?: string[];
  media?: Array<{ url?: string }>;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  expanded?: boolean;
}

interface HomeTestimonial {
  id: string;
  name: string;
  movedTo: string;
  quote: string;
  initials: string;
  avatarBg: string;
}

function normalizeHomeListing(raw: ApiHomeListing): HomeListing {
  const mediaImages = Array.isArray(raw.media)
    ? raw.media.map((item) => item?.url).filter((url): url is string => Boolean(url))
    : [];

  return {
    id: raw.id ?? "",
    title: raw.title ?? "Untitled listing",
    area: raw.area ?? raw.propertySize ?? 0,
    bedrooms: raw.bedrooms ?? raw.bedroomsCount ?? 0,
    monthlyRent: raw.monthlyRent ?? 0,
    images: Array.isArray(raw.images) ? raw.images : mediaImages,
    availableFrom: raw.availableFrom ?? new Date().toISOString(),
    createdAt: raw.createdAt ?? new Date().toISOString(),
    utilitiesIncluded: raw.utilitiesIncluded ?? false,
  };
}

function normalizeFavoriteListing(raw: ApiFavoriteListing): FavoriteListing {
  const mediaImages = Array.isArray(raw.media)
    ? raw.media.map((item) => item?.url).filter((url): url is string => Boolean(url))
    : [];

  return {
    id: raw.id ?? "",
    title: raw.title ?? "Untitled listing",
    city: raw.city ?? "",
    area: raw.area ?? 0,
    bedrooms: raw.bedrooms ?? 0,
    monthlyRent: raw.monthlyRent ?? 0,
    image: raw.image ?? mediaImages[0] ?? raw.images?.[0] ?? "",
    availableFrom: raw.availableFrom ?? new Date().toISOString(),
    propertyType: raw.propertyType ?? "apartment",
    utilitiesIncluded: raw.utilitiesIncluded ?? false,
  };
}

function extractFavoriteListingIds(payload: FavoritesPayload) {
  if (Array.isArray(payload.listingIds) && payload.listingIds.length > 0) {
    return payload.listingIds.map((id) => String(id));
  }

  if (Array.isArray(payload.favorites) && payload.favorites.length > 0) {
    return payload.favorites
      .map((favorite) => favorite.id)
      .filter((id): id is string => Boolean(id))
      .map((id) => String(id));
  }

  return [];
}

const cities: CitySuggestion[] = [
  {
    name: "Berlin",
    country: "Germany",
    properties: 1247,
    image: "https://images.unsplash.com/flagged/photo-1559315284-b5ec5e926919?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZXJsaW4lMjBjaXR5c2NhcGUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzczMDg2Nzk5fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Lisbon",
    country: "Portugal",
    properties: 892,
    image: "https://images.unsplash.com/photo-1692033070591-c9ce710f112d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXNib24lMjBwb3J0dWdhbCUyMHN0cmVldCUyMHZpZXd8ZW58MXx8fHwxNzczMDg2ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Barcelona",
    country: "Spain",
    properties: 1563,
    image: "https://images.unsplash.com/photo-1595685842822-7893ddb30176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBzcGFpbiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NzMwMjgxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Amsterdam",
    country: "Netherlands",
    properties: 734,
    image: "https://images.unsplash.com/photo-1534203137048-137aa03c692e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbXN0ZXJkYW0lMjBjYW5hbCUyMGhvdXNlc3xlbnwxfHx8fDE3NzMwNDcyMjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Paris",
    country: "France",
    properties: 2104,
    image: "https://images.unsplash.com/photo-1662214585553-1a4f33689fb2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGZyYW5jZSUyMHN0cmVldHN8ZW58MXx8fHwxNzczMDg2ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Madrid",
    country: "Spain",
    properties: 1089,
    image: "https://images.unsplash.com/photo-1673322663062-1c314e48545e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWRyaWQlMjBzcGFpbiUyMGNpdHl8ZW58MXx8fHwxNzczMDg0MjAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Rome",
    country: "Italy",
    properties: 876,
    image: "https://images.unsplash.com/photo-1712516482132-130ed92120e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwaXRhbHklMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzczMDgzMzYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    name: "Vienna",
    country: "Austria",
    properties: 543,
    image: "https://images.unsplash.com/photo-1726928876882-46979d6275f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWVubmElMjBhdXN0cmlhJTIwYnVpbGRpbmdzfGVufDF8fHx8MTc3MzA4NjgwMXww&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const faqs: FaqItem[] = [
  {
    id: "agency",
    question: "Is EzzyStay a rental agency?",
    answer:
      "No, we’re not a real estate agency. EzzyStay is an online platform connecting people looking for their next home with landlords looking for tenants.",
  },
  {
    id: "how",
    question: "How does EzzyStay work?",
    answer:
      "You can find and rent your next home safely and entirely online. Watch the short video below to see how the process works, from searching for a place to moving in with our Tenant Protection. For more details, you can also read our step-by-step guide to renting.",
  },
  {
    id: "accepted",
    question: "My rental application was accepted. What's next?",
    answer:
      "You’ll pay the first month’s rent and, depending on the region, the Tenant Protection fee. Once we’ve received your payment, your stay is confirmed. You’ll then get the landlord’s contact details. You can pay the rest of the rental costs directly to the landlord.",
  },
  {
    id: "cancel",
    question: "What if I want to cancel my stay?",
    answer:
      "You can cancel your stay at any time before you move in. Depending on when you cancel and the cancellation policy, you can receive a full or partial refund. The Tenant Protection fee is non-refundable.",
  },
  {
    id: "visit",
    question: "Can I visit the place before I rent?",
    answer:
      "No, and you won’t need to. Listings have detailed descriptions, photos, videos, and floor plans to give you a clear idea of what you’ll get. Through our platform, you can message the landlord, clear doubts, and even exchange documents. And once you book, your money is safe with us until you move in.",
  },
];

const homeTestimonials: HomeTestimonial[] = [
  {
    id: "a",
    name: "Aisha",
    movedTo: "Moved to Amsterdam in January 2024",
    quote:
      "I found a place in less than two weeks. Messaging landlords in one place saved me so much time, and the move-in process felt really smooth.",
    initials: "A",
    avatarBg: "bg-[#F2EA8D]",
  },
  {
    id: "m",
    name: "Mayra",
    movedTo: "Moved to Valencia in September 2023",
    quote:
      "Up to now it has been a great experience. I love that you can talk to the landlord before booking. Also the filter to know if you can register at a place is super helpful.",
    initials: "M",
    avatarBg: "bg-[#D9C4F4]",
  },
  {
    id: "n",
    name: "Noah",
    movedTo: "Moved to Antwerp in November 2023",
    quote:
      "The protected payment gave me peace of mind. I moved from abroad and everything matched the listing details when I arrived.",
    initials: "N",
    avatarBg: "bg-[#C9D9F6]",
  },
];

function buildCitySuggestions(listings: ListingCitySuggestion[]) {
  const suggestionMap = new Map<string, CitySuggestion & { liveProperties: number }>();

  for (const city of cities) {
    suggestionMap.set(city.name.toLowerCase(), {
      ...city,
      liveProperties: 0,
    });
  }

  for (const listing of listings) {
    const normalizedCity = listing.city.trim();
    if (!normalizedCity) {
      continue;
    }

    const key = normalizedCity.toLowerCase();
    const existing = suggestionMap.get(key);
    const listingImage = listing.images?.[0] ?? listing.media?.[0]?.url;

    if (existing) {
      existing.liveProperties += 1;
      if (!existing.image && listingImage) {
        existing.image = listingImage;
      }
      continue;
    }

    suggestionMap.set(key, {
      name: normalizedCity,
      country: "Live listings",
      properties: 0,
      image: listingImage,
      liveProperties: 1,
    });
  }

  return [...suggestionMap.values()]
    .filter(({ liveProperties }) => liveProperties > 0)
    .map(({ liveProperties, ...city }) => ({
      ...city,
      properties: liveProperties,
    }))
    .sort((left, right) => right.properties - left.properties);
}

function getFilteredCities(suggestions: CitySuggestion[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchingCities = suggestions.filter((city) => {
    if (!normalizedQuery) {
      return true;
    }

    return city.name.toLowerCase().includes(normalizedQuery) ||
      city.country.toLowerCase().includes(normalizedQuery);
  });

  return matchingCities.sort((left, right) => {
    const leftName = left.name.toLowerCase();
    const rightName = right.name.toLowerCase();
    const leftStartsWith = normalizedQuery ? leftName.startsWith(normalizedQuery) : false;
    const rightStartsWith = normalizedQuery ? rightName.startsWith(normalizedQuery) : false;

    if (leftStartsWith !== rightStartsWith) {
      return leftStartsWith ? -1 : 1;
    }

    return right.properties - left.properties || left.name.localeCompare(right.name);
  }).slice(0, 8);
}

function toDateQueryValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveCityQuery(query: string, suggestions: CitySuggestion[]) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return null;
  }

  const exactMatch = suggestions.find((city) => city.name.toLowerCase() === normalizedQuery);
  if (exactMatch) {
    return exactMatch.name;
  }

  const startsWithMatch = suggestions.find((city) => city.name.toLowerCase().startsWith(normalizedQuery));
  if (startsWithMatch) {
    return startsWithMatch.name;
  }

  const partialNameMatch = suggestions.find((city) => city.name.toLowerCase().includes(normalizedQuery));
  if (partialNameMatch) {
    return partialNameMatch.name;
  }

  const countryMatch = suggestions.find((city) => city.country.toLowerCase().includes(normalizedQuery));
  return countryMatch?.name ?? query.trim();
}

function getImageDotCount(images: string[] | undefined) {
  return Math.max(1, images?.length ?? 0);
}

function HomeListingCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] flex flex-col gap-[12px]">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E8EDF2] rounded-[16px]" />
      <div className="flex flex-col gap-[8px]">
        <div className="h-[16px] w-[90%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="h-[14px] w-[60%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="mt-[4px] h-[14px] w-[50%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="mt-[8px] h-[22px] w-[40%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="mt-[4px] h-[14px] w-[55%] rounded-[4px] bg-[#E8EDF2]" />
      </div>
    </div>
  );
}

function HomeFavoriteListingCardSkeleton() {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px] flex flex-col border border-[rgba(0,0,0,0.08)] bg-white rounded-[24px] p-[12px]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#E8EDF2] rounded-[16px]" />
      <div className="flex flex-col gap-[8px] pt-[14px] px-[4px]">
        <div className="h-[16px] w-[90%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="h-[14px] w-[60%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="mt-[12px] h-[22px] w-[40%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="mt-[4px] h-[14px] w-[50%] rounded-[4px] bg-[#E8EDF2]" />
        <div className="mt-[4px] h-[14px] w-[55%] rounded-[4px] bg-[#E8EDF2]" />
      </div>
    </div>
  );
}

function HomeListingsSkeletonGrid({ variant = "default" }: { variant?: "default" | "favorites" }) {
  return (
    <div className="flex overflow-x-auto gap-[24px] pb-[16px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-pulse">
      {Array.from({ length: 4 }, (_, index) => (
        variant === "favorites" ? (
          <HomeFavoriteListingCardSkeleton key={index} />
        ) : (
          <HomeListingCardSkeleton key={index} />
        )
      ))}
    </div>
  );
}



export function Home() {
  const [searchCity, setSearchCity] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date(2026, 2, 1)); // March 1, 2026
  const [endDate, setEndDate] = useState<Date | null>(new Date(2026, 5, 1)); // June 1, 2026
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [citySuggestions, setCitySuggestions] = useState<CitySuggestion[]>(cities);
  const [recommendations, setRecommendations] = useState<HomeListing[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<HomeListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [carouselImagesByListingId, setCarouselImagesByListingId] = useState<Record<string, number>>({});
  const [favoriteSplashById, setFavoriteSplashById] = useState<Set<string>>(new Set());
  const [favoriteListingIds, setFavoriteListingIds] = useState<Set<string>>(new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(1);
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  const [favoritesTypeFilter, setFavoritesTypeFilter] = useState<string>("all");
  const tenantProtectionRef = useRef<HTMLElement | null>(null);
  const recommendationsScrollRef = useRef<HTMLDivElement>(null);
  const recentlyViewedScrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: tenantProtectionProgress } = useScroll({
    target: tenantProtectionRef,
    offset: ["start end", "end start"],
  });
  const tenantProtectionImageY = useTransform(tenantProtectionProgress, [0, 1], [52, -52]);
  const tenantProtectionImageScale = useTransform(tenantProtectionProgress, [0, 0.5, 1], [0.96, 1, 0.96]);

  const isAbortError = (error: unknown) =>
    error instanceof DOMException && error.name === "AbortError";

  useEffect(() => {
    const loadCitySuggestions = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/listings`);
        if (!response.ok) {
          throw new Error("Failed to load listing cities");
        }

        const payload = (await response.json()) as { listings: ListingCitySuggestion[] };
        setCitySuggestions(buildCitySuggestions(payload.listings));
      } catch {
        setCitySuggestions(cities);
      }
    };

    void loadCitySuggestions();
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      setRecommendations([]);
      setRecentlyViewed([]);
      setFavorites([]);
      setFavoriteListingIds(new Set());
      setIsLoadingRecommendations(false);
      setIsLoadingListings(false);
      setIsLoadingFavorites(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setRecommendations([]);
      setRecentlyViewed([]);
      setFavorites([]);
      setFavoriteListingIds(new Set());
      setIsLoadingRecommendations(false);
      setIsLoadingListings(false);
      setIsLoadingFavorites(false);
      return;
    }

    const abortController = new AbortController();
    const headers = { Authorization: `Bearer ${token}` };

    setIsLoadingRecommendations(true);
    setIsLoadingListings(true);
    setIsLoadingFavorites(true);

    const loadRecommendations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me/recommendations?limit=3`, {
          headers,
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load recommendations");
        }

        const payload = (await response.json()) as { recommendations: ApiHomeListing[] };
        setRecommendations((payload.recommendations ?? []).map(normalizeHomeListing));
      } catch (error) {
        if (!isAbortError(error)) {
          setRecommendations([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingRecommendations(false);
        }
      }
    };

    const loadHomeListings = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me/recently-viewed?limit=3`, {
          headers,
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load home listings");
        }

        const payload = (await response.json()) as { listings: ApiHomeListing[] };
        setRecentlyViewed((payload.listings ?? []).map(normalizeHomeListing));
      } catch (error) {
        if (!isAbortError(error)) {
          setRecentlyViewed([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingListings(false);
        }
      }
    };

    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me/favorites`, {
          headers,
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load favorites");
        }

        const payload = (await response.json()) as FavoritesPayload;
        setFavorites((payload.favorites ?? []).map(normalizeFavoriteListing));
        setFavoriteListingIds(new Set(extractFavoriteListingIds(payload)));
      } catch (error) {
        if (!isAbortError(error)) {
          setFavorites([]);
          setFavoriteListingIds(new Set());
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingFavorites(false);
        }
      }
    };

    void Promise.allSettled([loadRecommendations(), loadHomeListings(), loadFavorites()]);

    return () => {
      abortController.abort();
    };
  }, [isAuthenticated, isAuthLoading]);


  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };

    if (isCityDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCityDropdownOpen]);

  const MAX_CARD_PREVIEW_IMAGES = 5;

  const getListingCardImages = (_listingId: string, images: string[] | undefined) => {
    const safeImages = Array.isArray(images) ? images : [];
    return safeImages.slice(0, MAX_CARD_PREVIEW_IMAGES);
  };

  const moveListingImage = (listingId: string, direction: "prev" | "next", images: string[]) => {
    const previewImages = getListingCardImages(listingId, images);
    const currentIndex = carouselImagesByListingId[listingId] ?? 0;
    let nextIndex = currentIndex;

    if (direction === "next") {
      nextIndex = currentIndex === previewImages.length - 1 ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex === 0 ? previewImages.length - 1 : currentIndex - 1;
    }

    setCarouselImagesByListingId((prev) => ({
      ...prev,
      [listingId]: nextIndex,
    }));
  };

  const triggerFavoriteSplash = (listingId: string) => {
    setFavoriteSplashById((prev) => new Set(prev).add(listingId));
    setTimeout(() => {
      setFavoriteSplashById((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }, 480);
  };

  const handleToggleFavorite = async (listingId: string, isAdd: boolean) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    if (favoriteBusyId === listingId) {
      return;
    }

    setFavoriteBusyId(listingId);
    setFavoriteListingIds((prev) => {
      const next = new Set(prev);
      if (isAdd) {
        next.add(listingId);
      } else {
        next.delete(listingId);
      }
      return next;
    });

    try {
      const response = isAdd
        ? await fetch(`${API_BASE}/api/auth/me/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ listingId }),
        })
        : await fetch(`${API_BASE}/api/auth/me/favorites/${listingId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      if (!response.ok) {
        throw new Error("Failed to update favorites");
      }

      toast.success(isAdd ? "Added to favorites" : "Removed from favorites");
    } catch {
      setFavoriteListingIds((prev) => {
        const next = new Set(prev);
        if (isAdd) {
          next.delete(listingId);
        } else {
          next.add(listingId);
        }
        return next;
      });

      toast.error("Could not update favorites. Please try again.");
    } finally {
      setFavoriteBusyId(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedCity = resolveCityQuery(searchCity, citySuggestions);
    if (!resolvedCity) {
      return;
    }

    const nextSearchParams = new URLSearchParams();
    if (startDate) {
      nextSearchParams.set("startDate", toDateQueryValue(startDate));
    }
    if (endDate) {
      nextSearchParams.set("endDate", toDateQueryValue(endDate));
    }

    setSearchCity(resolvedCity);
    navigate({
      pathname: `/listings/${resolvedCity.toLowerCase().replace(/\s+/g, "-")}`,
      search: nextSearchParams.toString(),
    });
  };

  const formatDateRange = () => {
    if (!startDate || !endDate) return "Select dates";
    const start = startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const end = endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${start} - ${end}`;
  };

  const handleCitySelect = (cityName: string) => {
    setSearchCity(cityName);
    setIsCityDropdownOpen(false);
  };

  const filteredCities = getFilteredCities(citySuggestions, searchCity);

  const currentTestimonial = homeTestimonials[activeTestimonial];

  const showPreviousTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + homeTestimonials.length) % homeTestimonials.length);
  };

  const showNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % homeTestimonials.length);
  };

  const scrollRecommendations = (direction: "left" | "right") => {
    if (recommendationsScrollRef.current) {
      const { scrollLeft, clientWidth } = recommendationsScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      recommendationsScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRecentlyViewed = (direction: "left" | "right") => {
    if (recentlyViewedScrollRef.current) {
      const { scrollLeft, clientWidth } = recentlyViewedScrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      recentlyViewedScrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header variant={isAuthenticated ? "dashboard" : "default"} dashboardButtonFilled={false} />

      <section
        className="relative z-[20] overflow-x-clip text-white bg-cover bg-center bg-no-repeat flex items-center py-[64px] md:py-0 md:aspect-[3.6/1] min-h-[380px] md:min-h-[360px] w-full mb-[24px]"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-neutral-black/35 z-0" />
        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-[16px] sm:px-[24px] md:px-[32px]">
          <div className="relative z-10 max-w-[430px] md:max-w-[1000px] mx-auto">
            <h1
              className="text-[24px] md:text-[34px] font-semibold leading-[1.2] tracking-tight mb-[24px] md:mb-[32px] text-center"
              style={{ fontFamily: "'Lora', Georgia, serif" }}
            >
              All the space you need, just for you
            </h1>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="relative flex flex-col md:flex-row items-stretch md:items-center gap-[10px] md:gap-0 rounded-[24px] md:rounded-full border border-[rgba(255,255,255,0.7)] bg-white/95 p-[12px] md:p-[8px] md:pl-[24px] md:pr-[8px] shadow-[0_14px_36px_rgba(2,22,33,0.18)] backdrop-blur text-neutral-black"
            >
              {/* Destination Input */}
              <div className="flex-1 relative flex items-center">
                <div className="flex h-[56px] md:h-auto flex-1 items-center gap-[12px] md:gap-[14px] rounded-[14px] md:rounded-none border border-[#E3E8EE] md:border-none bg-[#F7F9FC] md:bg-transparent px-[16px] md:px-0">
                  <MapPin className="w-[20px] h-[20px] text-[#6B6B6B] flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Where will you go?"
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setIsCityDropdownOpen(true);
                    }}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    className="flex-1 bg-transparent py-[12px] md:py-[10px] text-[15px] md:text-[16px] text-[#1A1A1A] placeholder:text-[#6B6B6B] outline-none font-medium"
                  />
                </div>

                {/* City Dropdown */}
                {isCityDropdownOpen && filteredCities.length > 0 && (
                  <div
                    ref={cityDropdownRef}
                    className="absolute top-[calc(100%+14px)] left-[-16px] right-0 mt-[8px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 max-h-[300px] overflow-y-auto rounded-[16px]"
                  >
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleCitySelect(city.name)}
                        className="w-full px-[20px] py-[12px] flex items-center gap-[12px] hover:bg-[#F7F7F9] transition-colors text-left border-b border-[rgba(0,0,0,0.04)] last:border-b-0"
                      >
                        <div className="w-[48px] h-[36px] flex-shrink-0 overflow-hidden rounded-[4px]">
                          {city.image ? (
                            <img
                              src={city.image}
                              alt={city.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#E0F2FE] flex items-center justify-center">
                              <MapPin className="w-[16px] h-[16px] text-[#0891B2]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-[#1A1A1A] text-[14px] font-bold">
                            {city.name}
                          </div>
                          <div className="text-[#6B6B6B] text-[12px]">
                            {city.country}
                          </div>
                        </div>
                        <div className="text-[#6B6B6B] text-[12px] font-semibold">
                          {city.properties} properties
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Vertical line divider */}
              <div className="hidden md:block h-[32px] w-[1px] bg-[#E2E8F0] mx-[20px] flex-shrink-0" />

              {/* Dates Picker Button */}
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full md:w-auto flex h-[56px] md:h-auto items-center gap-[12px] rounded-[14px] md:rounded-full border border-[#E3E8EE] md:border-none bg-white md:bg-transparent px-[16px] md:px-[16px] py-[15px] md:py-[10px] hover:bg-[#F7F9FC] md:hover:bg-[#F7F9FC]/80 transition-colors text-left"
              >
                <Calendar className="w-[20px] h-[20px] text-[#1A1A1A]" />
                <span className="text-[#1A1A1A] text-[15px] md:text-[16px] font-semibold whitespace-nowrap">
                  {formatDateRange()}
                </span>
              </button>

              {/* Submit Search Button */}
              <button
                type="submit"
                className="w-full md:w-auto rounded-[14px] md:rounded-full px-[34px] py-[16px] md:py-[14px] md:ml-[12px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors whitespace-nowrap text-[15px]"
              >
                Search
              </button>

              <DatePicker
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                startDate={startDate}
                endDate={endDate}
                onDateChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
              />
            </form>

          </div>
        </div>
      </section>

      {/* Personalized Recommendations - Only show when logged in */}
      {isAuthenticated && (
        <section className="bg-white pt-[12px] pb-[64px] border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-[1200px] mx-auto px-[32px]">
            {/* Section 1: Recently viewed */}
            <div className="mb-[56px] relative group/list">
              <div className="mb-[24px]">
                <h2 className="text-[26px] md:text-[32px] font-bold text-[#1A1A1A] mb-[4px]">Recently viewed</h2>
                <p className="text-[14px] text-[#6B6B6B]">Based on your recent viewing history</p>
              </div>
              {isLoadingListings ? (
                <HomeListingsSkeletonGrid />
              ) : recentlyViewed.length > 0 ? (
                <div className="relative">
                  <div
                    ref={recentlyViewedScrollRef}
                    className="flex overflow-x-auto gap-[24px] pb-[16px] scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {recentlyViewed.map((property) => (
                      <Link
                        key={property.id}
                        to={`/listing/${property.id}`}
                        className="flex-shrink-0 w-[280px] md:w-[320px] group flex flex-col gap-[12px]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F7F9] group/carousel rounded-[16px]">
                          <img
                            src={getListingCardImages(property.id, property.images)[carouselImagesByListingId[property.id] ?? 0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                            alt={property.title}
                            className="w-full h-full object-cover object-center bg-[#F3F4F6]"
                          />
                          {Date.now() - new Date(property.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7 && (
                            <div className="absolute top-[12px] left-[12px] bg-[#F7EFE9] text-[#5C4533] px-[12px] py-[4.5px] rounded-[6px] text-[11px] font-semibold tracking-[0.02em] shadow-sm flex items-center gap-[4px]">
                              <Star className="w-[10px] h-[10px] fill-current text-[#A78B71]" />
                              New
                            </div>
                          )}

                          {getListingCardImages(property.id, property.images).length > 1 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                moveListingImage(property.id, "prev", property.images);
                              }}
                              className="absolute left-[8px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white/80 hover:bg-white flex items-center justify-center transition-colors opacity-0 group-hover/carousel:opacity-100 rounded-full z-10"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-[16px] h-[16px] text-[#1A1A1A]" />
                            </button>
                          )}

                          {getListingCardImages(property.id, property.images).length > 1 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                moveListingImage(property.id, "next", property.images);
                              }}
                              className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white/80 hover:bg-white flex items-center justify-center transition-colors opacity-0 group-hover/carousel:opacity-100 rounded-full z-10"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-[16px] h-[16px] text-[#1A1A1A]" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const isAdd = !favoriteListingIds.has(property.id);
                              triggerFavoriteSplash(property.id);
                              void handleToggleFavorite(property.id, isAdd);
                            }}
                            type="button"
                            disabled={favoriteBusyId === property.id}
                            aria-label={favoriteListingIds.has(property.id) ? "Remove from favorites" : "Add to favorites"}
                            className="absolute top-[12px] right-[12px] w-[36px] h-[36px] bg-white hover:bg-white/95 flex items-center justify-center transition-all rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 active:scale-95 z-10"
                          >
                            <Heart
                              className={`w-[18px] h-[18px] transition-colors ${favoriteListingIds.has(property.id)
                                ? "fill-red-500 text-red-500"
                                : "text-[#B91C1C] hover:text-red-500"
                                }`}
                            />

                            {favoriteSplashById.has(property.id) && (
                              <>
                                <div className="absolute inset-0 border-2 border-[#0891B2] rounded-full animate-ping" style={{ animationDuration: "480ms" }} />
                                <div className="absolute inset-0 border-2 border-[#0891B2] rounded-full opacity-30" style={{ animation: "ring-pulse 480ms ease-out forwards" }} />
                              </>
                            )}
                          </button>

                          {getListingCardImages(property.id, property.images).length > 1 && (
                            <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
                              {Array.from({ length: getListingCardImages(property.id, property.images).length }, (_, index) => (
                                <div
                                  key={index}
                                  className={`w-[6px] h-[6px] rounded-full ${index === (carouselImagesByListingId[property.id] ?? 0) ? "bg-white" : "bg-white/40"
                                    }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-[4px] pt-[2px]">
                          <h3 className="line-clamp-1 text-[16px] font-bold leading-[1.3] text-[#1A1A1A]">{property.title}</h3>
                          <span className="text-[14px] text-[#6B6B6B]">{property.bedrooms} bedrooms · {property.area} m²</span>
                          <span className="text-[14px] text-[#6B6B6B]">
                            {new Date(property.availableFrom) <= new Date()
                              ? "Available now"
                              : `Available from ${new Date(property.availableFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                          </span>

                          <div className="mt-[10px] pt-[10px] border-t border-[#F3F4F6]">
                            <span className="text-[22px] font-bold text-[#1A1A1A]">€{property.monthlyRent}</span>
                            <span className="text-[14px] text-[#6B6B6B] ml-[4px]">/month</span>
                          </div>

                          <div className="flex items-center gap-[6px] mt-[4px]">
                            {property.utilitiesIncluded ? (
                              <>
                                <svg className="w-[16px] h-[16px] text-[#16A34A] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                <span className="text-[13px] text-[#16A34A] font-semibold">All fees included</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-[16px] h-[16px] text-[#9CA3AF] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                <span className="text-[13px] text-[#6B6B6B] font-semibold">Utilities excluded</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9] p-[40px] text-center">
                  <div className="flex justify-center mb-[24px]">
                    <img src={houseImage} alt="No listings" className="w-[120px] h-[120px] object-contain" />
                  </div>
                  <div className="text-[#1A1A1A] text-[18px] font-semibold mb-[8px]">No recently viewed listings yet</div>
                  <div className="text-[#6B6B6B] text-[14px] max-w-[560px] mx-auto mb-[16px]">
                    Once you open a property, it will appear here so you can jump back to it quickly.
                  </div>
                  <div className="flex items-center justify-center gap-[12px] flex-wrap mt-[16px]">
                    <Link
                      to="/listings"
                      className="inline-flex items-center gap-[8px] px-[24px] py-[10px] bg-[#0891B2] text-white text-[14px] font-semibold rounded-full shadow-[0_4px_10px_rgba(8,145,178,0.16)] hover:bg-[#0E7490] hover:shadow-[0_6px_14px_rgba(8,145,178,0.24)] transition-all"
                    >
                      Browse listings
                      <ArrowRight className="w-[16px] h-[16px]" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Recommendations */}
            <div className="mb-[56px] relative group/list">
              <div className="mb-[24px]">
                <h2 className="text-[26px] md:text-[32px] font-bold text-[#1A1A1A] mb-[4px]">Recommendations</h2>
                <p className="text-[14px] text-[#6B6B6B]">Personalized suggestions for your next stay</p>
              </div>
              {isLoadingRecommendations ? (
                <HomeListingsSkeletonGrid />
              ) : recommendations.length > 0 ? (
                <div className="relative">
                  <div
                    ref={recommendationsScrollRef}
                    className="flex overflow-x-auto gap-[24px] pb-[16px] scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    {recommendations.map((property) => (
                      <Link
                        key={property.id}
                        to={`/listing/${property.id}`}
                        className="flex-shrink-0 w-[280px] md:w-[320px] group flex flex-col gap-[12px]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F7F9] group/carousel rounded-[16px]">
                          <img
                            src={getListingCardImages(property.id, property.images)[carouselImagesByListingId[property.id] ?? 0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                            alt={property.title}
                            className="w-full h-full object-cover object-center bg-[#F3F4F6]"
                          />
                          {Date.now() - new Date(property.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7 && (
                            <div className="absolute top-[12px] left-[12px] bg-[#F7EFE9] text-[#5C4533] px-[12px] py-[4.5px] rounded-[6px] text-[11px] font-semibold tracking-[0.02em] shadow-sm flex items-center gap-[4px]">
                              <Star className="w-[10px] h-[10px] fill-current text-[#A78B71]" />
                              New
                            </div>
                          )}

                          {getListingCardImages(property.id, property.images).length > 1 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                moveListingImage(property.id, "prev", property.images);
                              }}
                              className="absolute left-[8px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white/80 hover:bg-white flex items-center justify-center transition-colors opacity-0 group-hover/carousel:opacity-100 rounded-full z-10"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-[16px] h-[16px] text-[#1A1A1A]" />
                            </button>
                          )}

                          {getListingCardImages(property.id, property.images).length > 1 && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                moveListingImage(property.id, "next", property.images);
                              }}
                              className="absolute right-[8px] top-1/2 -translate-y-1/2 w-[28px] h-[28px] bg-white/80 hover:bg-white flex items-center justify-center transition-colors opacity-0 group-hover/carousel:opacity-100 rounded-full z-10"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-[16px] h-[16px] text-[#1A1A1A]" />
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const isAdd = !favoriteListingIds.has(property.id);
                              triggerFavoriteSplash(property.id);
                              void handleToggleFavorite(property.id, isAdd);
                            }}
                            type="button"
                            disabled={favoriteBusyId === property.id}
                            aria-label={favoriteListingIds.has(property.id) ? "Remove from favorites" : "Add to favorites"}
                            className="absolute top-[12px] right-[12px] w-[36px] h-[36px] bg-white hover:bg-white/95 flex items-center justify-center transition-all rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 active:scale-95 z-10"
                          >
                            <Heart
                              className={`w-[18px] h-[18px] transition-colors ${favoriteListingIds.has(property.id)
                                ? "fill-red-500 text-red-500"
                                : "text-[#B91C1C] hover:text-red-500"
                                }`}
                            />

                            {favoriteSplashById.has(property.id) && (
                              <>
                                <div className="absolute inset-0 border-2 border-[#0891B2] rounded-full animate-ping" style={{ animationDuration: "480ms" }} />
                                <div className="absolute inset-0 border-2 border-[#0891B2] rounded-full opacity-30" style={{ animation: "ring-pulse 480ms ease-out forwards" }} />
                              </>
                            )}
                          </button>

                          {getListingCardImages(property.id, property.images).length > 1 && (
                            <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
                              {Array.from({ length: getListingCardImages(property.id, property.images).length }, (_, index) => (
                                <div
                                  key={index}
                                  className={`w-[6px] h-[6px] rounded-full ${index === (carouselImagesByListingId[property.id] ?? 0) ? "bg-white" : "bg-white/40"
                                    }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-[4px] pt-[2px]">
                          <h3 className="line-clamp-1 text-[16px] font-bold leading-[1.3] text-[#1A1A1A]">{property.title}</h3>
                          <span className="text-[14px] text-[#6B6B6B]">{property.bedrooms} bedrooms · {property.area} m²</span>
                          <span className="text-[14px] text-[#6B6B6B]">
                            {new Date(property.availableFrom) <= new Date()
                              ? "Available now"
                              : `Available from ${new Date(property.availableFrom).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                          </span>

                          <div className="mt-[10px] pt-[10px] border-t border-[#F3F4F6]">
                            <span className="text-[22px] font-bold text-[#1A1A1A]">€{property.monthlyRent}</span>
                            <span className="text-[14px] text-[#6B6B6B] ml-[4px]">/month</span>
                          </div>

                          <div className="flex items-center gap-[6px] mt-[4px]">
                            {property.utilitiesIncluded ? (
                              <>
                                <svg className="w-[16px] h-[16px] text-[#16A34A] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                <span className="text-[13px] text-[#16A34A] font-semibold">All fees included</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-[16px] h-[16px] text-[#9CA3AF] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                <span className="text-[13px] text-[#6B6B6B] font-semibold">Utilities excluded</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9] p-[40px] text-center">
                  <div className="flex justify-center mb-[24px]">
                    <img src={houseImage} alt="No listings" className="w-[120px] h-[120px] object-contain" />
                  </div>
                  <div className="text-[#1A1A1A] text-[18px] font-semibold mb-[8px]">No recommendations yet</div>
                  <div className="text-[#6B6B6B] text-[14px] max-w-[560px] mx-auto mb-[16px]">
                    Start exploring listings, save a few favorites, or message landlords to help us personalize your recommendations.
                  </div>
                  <div className="flex items-center justify-center gap-[12px] flex-wrap mt-[16px]">
                    <Link
                      to="/listings"
                      className="inline-flex items-center gap-[8px] px-[24px] py-[10px] bg-[#0891B2] text-white text-[14px] font-semibold rounded-full shadow-[0_4px_10px_rgba(8,145,178,0.16)] hover:bg-[#0E7490] hover:shadow-[0_6px_14px_rgba(8,145,178,0.24)] transition-all"
                    >
                      Browse listings
                      <ArrowRight className="w-[16px] h-[16px]" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Your favorites */}
            {(isLoadingFavorites || favorites.length > 0) && (
              <div className="mb-[24px]">
                <div className="mb-[8px]">
                  <h2 className="text-[26px] md:text-[32px] font-bold text-[#1A1A1A] mb-[4px]">Your favorites</h2>
                  <p className="text-[14px] text-[#6B6B6B]">Properties you've saved for later</p>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex items-center gap-[32px] mb-[24px] border-b border-[#E5E7EB] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {[
                    { key: "all", label: "All", icon: Star },
                    { key: "house", label: "House", icon: HomeIcon },
                    { key: "apartment", label: "Apartment", icon: Building2 },
                    { key: "building", label: "Building", icon: Building },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setFavoritesTypeFilter(tab.key)}
                      className={`flex flex-col items-center gap-[6px] pb-[12px] pt-[4px] px-[4px] text-[13px] font-semibold transition-all whitespace-nowrap border-b-[2px] ${favoritesTypeFilter === tab.key
                          ? "border-[#1A1A1A] text-[#1A1A1A]"
                          : "border-transparent text-[#9CA3AF] hover:text-[#6B6B6B]"
                        }`}
                    >
                      <tab.icon className="w-[24px] h-[24px]" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {isLoadingFavorites ? (
                  <HomeListingsSkeletonGrid variant="favorites" />
                ) : (() => {
                  const filteredFavorites = favoritesTypeFilter === "all"
                    ? favorites
                    : favorites.filter((p) => p.propertyType === favoritesTypeFilter);

                  return filteredFavorites.length > 0 ? (
                    <div className="flex overflow-x-auto gap-[24px] pb-[16px] scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {filteredFavorites.map((property) => (
                        <Link
                          key={property.id}
                          to={`/listing/${property.id}`}
                          className="flex-shrink-0 w-[280px] md:w-[320px] group flex flex-col border border-[rgba(0,0,0,0.08)] bg-white rounded-[24px] p-[12px] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-200"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F9] group/carousel rounded-[16px]">
                            <img
                              src={property.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                              alt={property.title}
                              className="w-full h-full object-cover object-center bg-[#F3F4F6] transition-transform duration-300 group-hover:scale-[1.03]"
                            />

                            {/* Property Type Badge */}
                            <div className="absolute top-[12px] left-[12px] bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-[10px] py-[4px] rounded-[6px] text-[11px] font-semibold capitalize shadow-sm">
                              {property.propertyType}
                            </div>

                            {/* Heart Button */}
                            <div className="absolute top-[12px] right-[12px] w-[36px] h-[36px] bg-white/90 backdrop-blur-sm hover:bg-white flex items-center justify-center rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:scale-105 active:scale-95 transition-all z-10">
                              <Heart className="w-[18px] h-[18px] fill-red-500 text-red-500" />
                            </div>
                          </div>

                          <div className="flex flex-col gap-[2px] pt-[14px] px-[4px]">
                            <h3 className="line-clamp-1 text-[16px] font-bold leading-[1.3] text-[#1A1A1A]">{property.title}</h3>
                            <span className="text-[14px] text-[#6B6B6B]">{property.bedrooms} bedrooms · {property.area} m²</span>

                            <div className="mt-[10px]">
                              <span className="text-[22px] font-bold text-[#1A1A1A]">€{property.monthlyRent}</span>
                              <span className="text-[14px] text-[#6B6B6B] ml-[2px]">/month</span>
                            </div>
                            <div className="flex items-center gap-[6px] mt-[4px]">
                              {property.utilitiesIncluded ? (
                                <>
                                  <svg className="w-[16px] h-[16px] text-[#16A34A] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                  <span className="text-[13px] text-[#16A34A] font-semibold">All fees included</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-[16px] h-[16px] text-[#9CA3AF] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                  <span className="text-[13px] text-[#6B6B6B] font-semibold">Utilities excluded</span>
                                </>
                              )}
                            </div>
                            <span className="text-[13px] text-[#6B6B6B] mt-[2px]">
                              {new Date(property.availableFrom) <= new Date()
                                ? "Available now"
                                : `${new Date(property.availableFrom).toLocaleDateString("en-GB", { month: "short", day: "numeric" })} - onwards`}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-[40px] text-[#6B6B6B] text-[15px]">
                      No {favoritesTypeFilter !== "all" ? favoritesTypeFilter : ""} favorites found.
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="mt-[32px] md:mt-[40px]">
              <Link
                to="/listings"
                className="inline-flex items-center gap-[6px] text-[#0891B2] text-[15px] font-semibold hover:text-[#0E7490] transition-colors"
              >
                View more properties
                <span className="text-[18px]">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}



      <section className="bg-white py-[62px] md:py-[72px]">
        <div className="mx-auto max-w-[980px] px-[32px] text-center">
          <h2 className="mb-[30px] text-[44px] font-bold leading-[1.14] tracking-[-0.02em] text-[#052F3C]">
            Your next base could be here
          </h2>

          <div className="mx-auto mb-[26px] grid max-w-[760px] grid-cols-2 gap-y-[12px] text-left text-[14px] font-semibold text-[#0B3341] md:grid-cols-4 md:gap-x-[32px]">
            <span>Berlin</span>
            <span>Rotterdam</span>
            <span>Vienna</span>
            <span>Brussels</span>
            <span>Barcelona</span>
            <span>Milan</span>
            <span>Madrid</span>
            <span>London</span>
            <span>Paris</span>
            <span>New York</span>
            <span>Los Angeles</span>
          </div>

          <div className="mx-auto mb-[20px] flex w-full max-w-[660px] items-center justify-center">
            <img src={mapImage} alt="Top cities map" className="w-full max-w-[620px] object-contain opacity-95 mix-blend-multiply" />
          </div>

          <div className="mb-[8px] text-[54px] font-bold leading-[1] tracking-[-0.02em] text-[#052F3C]">150+ CITIES</div>
          <p className="text-[16px] leading-[1.5] text-[#0B3341]">50,000+ homes advertised by real landlords</p>
        </div>
      </section>

      <section ref={tenantProtectionRef} className="bg-gradient-to-r from-[#0AA9C8] via-[#08A2C3] to-[#0B9BBC] py-[66px] md:py-[76px]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-[48px] px-[32px] lg:grid-cols-[1.06fr_0.94fr]">
          <div>
            <h2 className="mb-[26px] text-[44px] font-bold uppercase leading-[1.05] tracking-[-0.02em] text-white">
              Tenant Protection
            </h2>

            <div className="space-y-[24px] text-white">
              <div className="flex items-start gap-[14px]">
                <span className="mt-[4px] flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/70 text-[16px] font-bold">✓</span>
                <div>
                  <h3 className="mb-[8px] text-[34px] font-bold leading-[1.2]">Protection against the unexpected</h3>
                  <p className="text-[16px] leading-[1.55] text-white/95">If a landlord cancels at the last minute or delays your move-in, we help you find another place or a temporary hotel stay.</p>
                </div>
              </div>

              <div className="flex items-start gap-[14px]">
                <span className="mt-[4px] flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/70 text-[16px] font-bold">✓</span>
                <div>
                  <h3 className="mb-[8px] text-[34px] font-bold leading-[1.2]">Quick support</h3>
                  <p className="text-[16px] leading-[1.55] text-white/95">If something goes wrong with your rental, our team helps you resolve it quickly.</p>
                </div>
              </div>

              <div className="flex items-start gap-[14px]">
                <span className="mt-[4px] flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/70 text-[16px] font-bold">✓</span>
                <div>
                  <h3 className="mb-[8px] text-[34px] font-bold leading-[1.2]">Move-in with confidence</h3>
                  <p className="text-[16px] leading-[1.55] text-white/95">We keep your payment safe until you move in. If the place does not match the listing, you can request a refund.</p>
                </div>
              </div>
            </div>

            <Link to="/how-it-works" className="mt-[26px] inline-flex items-center border-b border-white pb-[2px] text-[22px] font-semibold text-white hover:text-white/90 hover:border-white/90">
              Learn about Tenant Protection
            </Link>
          </div>

          <div className="flex justify-center lg:justify-end">
            <motion.img
              src={guaranteedImage}
              alt="Tenant protection"
              className="w-full max-w-[520px] rounded-[6px] object-cover shadow-[0_18px_36px_rgba(2,22,33,0.24)]"
              style={{ y: tenantProtectionImageY, scale: tenantProtectionImageScale }}
            />
          </div>
        </div>
      </section>

      <section className="bg-[#F2F3F4] py-[66px] md:py-[76px]">
        <div className="mx-auto max-w-[1440px] px-[32px]">
          <h2 className="mb-[30px] text-[24px] font-bold leading-[1.15] tracking-[-0.02em] text-[#032D3A] md:text-[32px]">
            It&apos;s quick. All online. 100% safe.
          </h2>

          <div className="grid grid-cols-1 gap-x-[34px] gap-y-[30px] md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className="mb-[6px] text-[30px] font-bold leading-[1] tracking-[-0.02em] text-[#032D3A] md:text-[36px]">1</div>
              <h3 className="mb-[8px] text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#032D3A] md:text-[28px]">Pick a few places</h3>
              <p className="max-w-[300px] text-[15px] leading-[1.65] text-[#032D3A] md:text-[17px]">
                Explore hundreds of high-quality rooms, studios, and apartments. Save favorites. Get alerts. Finding your dream home could not be easier.
              </p>
            </div>

            <div>
              <div className="mb-[6px] text-[30px] font-bold leading-[1] tracking-[-0.02em] text-[#032D3A] md:text-[36px]">2</div>
              <h3 className="mb-[8px] text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#032D3A] md:text-[28px]">Message the landlord</h3>
              <p className="max-w-[300px] text-[15px] leading-[1.65] text-[#032D3A] md:text-[17px]">
                Enjoy an online, private space for all conversations with the landlord. Ask questions, share information, and see how well you both match.
              </p>
            </div>

            <div>
              <div className="mb-[6px] text-[30px] font-bold leading-[1] tracking-[-0.02em] text-[#032D3A] md:text-[36px]">3</div>
              <h3 className="mb-[8px] text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#032D3A] md:text-[28px]">Apply to rent</h3>
              <p className="max-w-[300px] text-[15px] leading-[1.65] text-[#032D3A] md:text-[17px]">
                Like a place and want to call it home? Apply to rent it, and you&apos;ll know if it&apos;s yours within 48 hours.
              </p>
            </div>

            <div>
              <div className="mb-[6px] text-[30px] font-bold leading-[1] tracking-[-0.02em] text-[#032D3A] md:text-[36px]">4</div>
              <h3 className="mb-[8px] text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#032D3A] md:text-[28px]">Pay, and it&apos;s yours</h3>
              <p className="max-w-[300px] text-[15px] leading-[1.65] text-[#032D3A] md:text-[17px]">
                Pay the first month&apos;s rent to confirm your stay. Congratulations, you found your next home. We&apos;ll protect your money until you&apos;ve moved in and checked the place out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION — commented out temporarily
      <section className="relative overflow-hidden bg-[#012F3B] pt-[72px] pb-[120px] text-white min-h-[560px] md:min-h-[640px]">
        <div className="mx-auto flex max-w-[1040px] flex-col items-center px-[32px] text-center">
          <div className={`mb-[12px] flex h-[78px] w-[78px] items-center justify-center rounded-full text-[30px] font-black text-black ${currentTestimonial.avatarBg}`}>
            {currentTestimonial.initials}
          </div>
          <div className="text-[22px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[28px]">{currentTestimonial.name}</div>
          <div className="mb-[22px] mt-[6px] text-[14px] text-white/85 md:text-[18px]">{currentTestimonial.movedTo}</div>

          <p className="mx-auto max-w-[900px] text-[18px] font-semibold leading-[1.45] tracking-[-0.01em] text-white md:text-[24px]">
            {currentTestimonial.quote}
          </p>

          <div className="mb-[28px] mt-[22px] flex items-center gap-[6px]" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }, (_, index) => (
              <Star key={index} className="h-[14px] w-[14px] fill-white text-white md:h-[18px] md:w-[18px]" />
            ))}
          </div>

          <div className="flex items-center gap-[22px]">
            <button
              type="button"
              onClick={showPreviousTestimonial}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/18 text-white transition-colors hover:bg-white/30 md:h-[46px] md:w-[46px]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-[20px] w-[20px] md:h-[24px] md:w-[24px]" />
            </button>

            <div className="flex items-center gap-[18px]">
              {homeTestimonials.map((testimonial, index) => {
                const isActive = index === activeTestimonial;
                return (
                  <button
                    key={testimonial.id}
                    type="button"
                    onClick={() => setActiveTestimonial(index)}
                    className={`flex h-[44px] w-[44px] items-center justify-center rounded-full text-[22px] font-black text-black transition-transform hover:scale-105 md:h-[50px] md:w-[50px] md:text-[26px] ${testimonial.avatarBg} ${
                      isActive ? "ring-4 ring-white ring-offset-2 ring-offset-[#012F3B]" : ""
                    }`}
                    aria-label={`Show testimonial from ${testimonial.name}`}
                    aria-current={isActive}
                  >
                    {testimonial.initials}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={showNextTestimonial}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/18 text-white transition-colors hover:bg-white/30 md:h-[46px] md:w-[46px]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-[20px] w-[20px] md:h-[24px] md:w-[24px]" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-[-112px] left-1/2 h-[224px] w-[130%] -translate-x-1/2 rounded-[50%] bg-[#F2F3F4]" />
      </section>
      */}

      <section className="bg-[#F2F3F4] py-[64px] md:py-[74px]">
        <div className="mx-auto max-w-[1240px] px-[32px]">
          <h2 className="text-center text-[50px] font-black uppercase leading-[1] tracking-[-0.02em] text-[#032D3A] md:text-[70px]">
            Endless searching ends now
          </h2>

          <div className="mt-[34px] flex justify-center">
            <Link
              to="/listings"
              className="inline-flex items-center justify-center rounded-[16px] bg-brand-primary px-[26px] py-[15px] text-[15px] font-bold text-white transition-colors hover:bg-brand-primary-dark"
            >
              Find your next home
            </Link>
          </div>

          <div className="mt-[72px] grid grid-cols-2 gap-x-[36px] gap-y-[30px] sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">Austria</div>
              <div className="text-[12px] text-[#123E4B]">Vienna</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Belgium</div>
              <div className="text-[12px] text-[#123E4B]">Brussels</div>
              <div className="text-[12px] text-[#123E4B]">Antwerp</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Canada</div>
              <div className="text-[12px] text-[#123E4B]">Toronto</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Czech Republic</div>
              <div className="text-[12px] text-[#123E4B]">Prague</div>
            </div>

            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">France</div>
              <div className="text-[12px] text-[#123E4B]">Bordeaux</div>
              <div className="text-[12px] text-[#123E4B]">Lyon</div>
              <div className="text-[12px] text-[#123E4B]">Paris</div>
              <div className="text-[12px] text-[#123E4B]">Strasbourg</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Germany</div>
              <div className="text-[12px] text-[#123E4B]">Berlin</div>
              <div className="text-[12px] text-[#123E4B]">Cologne</div>
              <div className="text-[12px] text-[#123E4B]">Dusseldorf</div>
              <div className="text-[12px] text-[#123E4B]">Frankfurt am Main</div>
              <div className="text-[12px] text-[#123E4B]">Hamburg</div>
              <div className="text-[12px] text-[#123E4B]">Munich</div>
              <div className="text-[12px] text-[#123E4B]">Stuttgart</div>
            </div>

            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">Greece</div>
              <div className="text-[12px] text-[#123E4B]">Athens</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Hungary</div>
              <div className="text-[12px] text-[#123E4B]">Budapest</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Iceland</div>
              <div className="text-[12px] text-[#123E4B]">Reykjavik</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Ireland</div>
              <div className="text-[12px] text-[#123E4B]">Dublin</div>
            </div>

            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">Italy</div>
              <div className="text-[12px] text-[#123E4B]">Bologna</div>
              <div className="text-[12px] text-[#123E4B]">Florence</div>
              <div className="text-[12px] text-[#123E4B]">Milan</div>
              <div className="text-[12px] text-[#123E4B]">Padua</div>
              <div className="text-[12px] text-[#123E4B]">Rome</div>
              <div className="text-[12px] text-[#123E4B]">Turin</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Netherlands</div>
              <div className="text-[12px] text-[#123E4B]">Amsterdam</div>
              <div className="text-[12px] text-[#123E4B]">Rotterdam</div>
              <div className="text-[12px] text-[#123E4B]">The Hague</div>
              <div className="text-[12px] text-[#123E4B]">Utrecht</div>
            </div>

            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">Poland</div>
              <div className="text-[12px] text-[#123E4B]">Krakow</div>
              <div className="text-[12px] text-[#123E4B]">Warsaw</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Portugal</div>
              <div className="text-[12px] text-[#123E4B]">Lisbon</div>
              <div className="text-[12px] text-[#123E4B]">Porto</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Slovenia</div>
              <div className="text-[12px] text-[#123E4B]">Ljubljana</div>
            </div>

            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">Spain</div>
              <div className="text-[12px] text-[#123E4B]">Barcelona</div>
              <div className="text-[12px] text-[#123E4B]">Madrid</div>
              <div className="text-[12px] text-[#123E4B]">Malaga</div>
              <div className="text-[12px] text-[#123E4B]">Seville</div>
              <div className="text-[12px] text-[#123E4B]">Valencia</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">Switzerland</div>
              <div className="text-[12px] text-[#123E4B]">Zurich</div>
              <div className="pt-[10px] text-[18px] font-bold text-[#032D3A]">United Kingdom</div>
              <div className="text-[12px] text-[#123E4B]">London</div>
              <div className="text-[12px] text-[#123E4B]">Manchester</div>
              <div className="text-[12px] text-[#123E4B]">Birmingham</div>
            </div>

            <div className="space-y-[10px]">
              <div className="text-[15px] font-bold text-[#032D3A]">United States</div>
              <div className="text-[12px] text-[#123E4B]">Boston</div>
              <div className="text-[12px] text-[#123E4B]">Chicago</div>
              <div className="text-[12px] text-[#123E4B]">Los Angeles</div>
              <div className="text-[12px] text-[#123E4B]">New York</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-[56px] md:py-[64px]">
        <div className="mx-auto max-w-[1180px] px-[32px]">
          <h2 className="mb-[24px] text-center text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-[#052F3C] md:text-[42px]">
            Your questions, answered
          </h2>

          <div className="mx-auto max-w-[980px] space-y-[16px]">
            {faqs.map((item) => {
              const isOpen = activeFaqId === item.id;
              return (
                <div key={item.id} className="overflow-hidden border border-neutral bg-white">
                  <button
                    type="button"
                    onClick={() => setActiveFaqId(isOpen ? null : item.id)}
                    className="flex w-full items-center justify-between gap-[16px] px-[24px] py-[20px] text-left transition-colors hover:bg-neutral-light-gray"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[16px] font-semibold leading-[1.25] text-neutral-black md:text-[18px] pr-[16px]">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-[20px] w-[20px] shrink-0 text-neutral-gray transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-[24px] pb-[20px] pt-[4px]">
                      <p className="text-[15px] leading-[1.6] text-neutral-gray md:text-[15px]">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* <div className="mt-[18px]">
            <Link to="/help" className="text-[14px] font-bold text-[#052F3C] underline underline-offset-4 hover:no-underline">
              Visit our Help Center
            </Link>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <Footer variant="dashboard" />
    </div>
  );
}