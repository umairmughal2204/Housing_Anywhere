import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { DatePicker } from "../components/date-picker";
import { motion, useMotionValue, useTransform, animate, useInView } from "motion/react";
import { 
  MapPin, 
  Calendar, 
  Search, 
  MessageCircle, 
  FileCheck, 
  CreditCard, 
  Shield, 
  ArrowRight, 
  Check, 
  Users, 
  Home as HomeIcon, 
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
  User as UserIcon
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
}

type ApiFavoriteListing = Partial<FavoriteListing> & {
  media?: Array<{ url?: string }>;
  images?: string[];
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
    .map(({ liveProperties, ...city }) => ({
      ...city,
      properties: liveProperties > 0 ? liveProperties : city.properties,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
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

// Counter Animation Component
function Counter({ value, suffix = "", prefix = "", duration = 2 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: "easeOut",
      });

      return controls.stop;
    }
  }, [isInView, motionValue, value, duration]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = prefix + Math.round(latest).toLocaleString() + suffix;
      }
    });

    return unsubscribe;
  }, [motionValue, prefix, suffix]);

  return <span ref={ref}>{prefix}{value.toLocaleString()}{suffix}</span>;
}

function HomeListingCardSkeleton() {
  return (
    <div className="group bg-white">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#E8EDF2]" />
      <div className="p-[16px]">
        <div className="h-[18px] w-[78%] bg-[#E8EDF2] rounded-[4px] mb-[8px]" />
        <div className="h-[18px] w-[60%] bg-[#E8EDF2] rounded-[4px] mb-[12px]" />
        <div className="flex items-center gap-[12px] mb-[12px]">
          <div className="h-[14px] w-[90px] bg-[#E8EDF2] rounded-[4px]" />
          <div className="h-[14px] w-[110px] bg-[#E8EDF2] rounded-[4px]" />
        </div>
        <div className="h-[20px] w-[72%] bg-[#E8EDF2] rounded-[4px] mb-[10px]" />
        <div className="h-[14px] w-[66%] bg-[#E8EDF2] rounded-[4px]" />
      </div>
    </div>
  );
}

function HomeListingsSkeletonGrid() {
  return (
    <div className="grid grid-cols-3 gap-[24px] animate-pulse" aria-label="Loading listings">
      {Array.from({ length: 3 }, (_, index) => (
        <HomeListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function Home() {
  const apiBase = (import.meta as any).env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const [searchCity, setSearchCity] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date(2026, 2, 1)); // March 1, 2026
  const [endDate, setEndDate] = useState<Date | null>(new Date(2026, 5, 1)); // June 1, 2026
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommendations" | "recently" | "favorites">("recently");
  const [hasAutoShiftedEmptyRecent, setHasAutoShiftedEmptyRecent] = useState(false);
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

  const isAbortError = (error: unknown) =>
    error instanceof DOMException && error.name === "AbortError";

  // Scroll to top on home page load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    const loadCitySuggestions = async () => {
      try {
        const response = await fetch(`${apiBase}/api/listings`);
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
  }, [apiBase]);

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
        const response = await fetch(`${apiBase}/api/auth/me/recommendations?limit=3`, {
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
        const response = await fetch(`${apiBase}/api/auth/me/recently-viewed?limit=3`, {
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
        const response = await fetch(`${apiBase}/api/auth/me/favorites`, {
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
  }, [apiBase, isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasAutoShiftedEmptyRecent(false);
      return;
    }

    if (
      !hasAutoShiftedEmptyRecent &&
      activeTab === "recently" &&
      !isLoadingListings &&
      !isLoadingRecommendations &&
      recentlyViewed.length === 0 &&
      recommendations.length > 0
    ) {
      setActiveTab("recommendations");
      setHasAutoShiftedEmptyRecent(true);
    }
  }, [
    activeTab,
    hasAutoShiftedEmptyRecent,
    isAuthenticated,
    isLoadingListings,
    isLoadingRecommendations,
    recommendations.length,
    recentlyViewed.length,
  ]);

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
      nextIndex = Math.min(currentIndex + 1, previewImages.length - 1);
    } else {
      nextIndex = Math.max(currentIndex - 1, 0);
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
      pathname: `/listings/${resolvedCity.toLowerCase()}`,
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
  const displayedListings = activeTab === "recommendations" ? recommendations : recentlyViewed;
  const isRecommendationsTab = activeTab === "recommendations";
  const isRecentlyViewedTab = activeTab === "recently";
  const isListingsTabLoading =
    (isRecommendationsTab && isLoadingRecommendations) ||
    (isRecentlyViewedTab && isLoadingListings);
  const isListingsTabEmpty = displayedListings.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-primary via-[#0BA5C7] to-brand-primary text-white py-[80px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="max-w-[1000px] mx-auto">
            <h1 className="text-[56px] font-bold leading-[1.1] tracking-[-0.02em] mb-[16px] text-center">
              Book Your Next Home.<br />
              <span className="text-white">No Viewing Required.</span>
            </h1>
            <p className="text-[18px] text-white/90 mb-[48px] leading-[1.6] text-center max-w-[720px] mx-auto">
              Secure, verified mid-to-long-term rentals for digital nomads, expatriates, and international students.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white p-[8px] flex items-stretch gap-[8px] relative">
              <div className="flex-1 relative">
                <div className="flex items-center gap-[16px] px-[24px] bg-[#F7F7F9] h-full">
                  <MapPin className="w-[20px] h-[20px] text-[#6B6B6B]" />
                  <input
                    type="text"
                    placeholder="Where will you go?"
                    value={searchCity}
                    onChange={(e) => {
                      setSearchCity(e.target.value);
                      setIsCityDropdownOpen(true);
                    }}
                    onFocus={() => setIsCityDropdownOpen(true)}
                    className="flex-1 outline-none text-[#1A1A1A] text-[16px] placeholder:text-[#6B6B6B] bg-transparent py-[20px]"
                  />
                </div>

                {/* City Dropdown */}
                {isCityDropdownOpen && filteredCities.length > 0 && (
                  <div ref={cityDropdownRef} className="absolute top-full left-0 right-0 mt-[8px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 max-h-[400px] overflow-y-auto">
                    {filteredCities.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleCitySelect(city.name)}
                        className="w-full px-[24px] py-[16px] flex items-center gap-[16px] hover:bg-[#F7F7F9] transition-colors text-left border-b border-[rgba(0,0,0,0.04)] last:border-b-0"
                      >
                        <div className="w-[64px] h-[48px] flex-shrink-0 overflow-hidden">
                          {city.image ? (
                            <img
                              src={city.image}
                              alt={city.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#E0F2FE] flex items-center justify-center">
                              <MapPin className="w-[18px] h-[18px] text-[#0891B2]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-[#1A1A1A] text-[16px] font-bold mb-[2px]">
                            {city.name}
                          </div>
                          <div className="text-[#6B6B6B] text-[13px]">
                            {city.country}
                          </div>
                        </div>
                        <div className="text-[#6B6B6B] text-[13px] font-semibold">
                          {city.properties} properties
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="flex items-center gap-[16px] px-[24px] bg-white hover:bg-[#F7F7F9] transition-colors"
              >
                <Calendar className="w-[20px] h-[20px] text-[#1A1A1A]" />
                <span className="text-[#1A1A1A] text-[16px] font-semibold whitespace-nowrap">
                  {formatDateRange()}
                </span>
              </button>

              <button
                type="submit"
                className="px-[48px] py-[20px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors"
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

            {/* Landlord Link */}
            <div className="text-center mt-[16px]">
              <span className="text-white/80 text-[14px]">Looking for tenants? </span>
              <Link to="/landlord" className="text-white text-[14px] font-bold underline hover:no-underline">
                Rent out
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Personalized Recommendations - Only show when logged in */}
      {isAuthenticated && (
        <section className="bg-white pt-[40px] pb-[64px] border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-[1200px] mx-auto px-[32px]">
            {/* Tabs */}
            <div className="flex items-center gap-[40px] mb-[32px] border-b border-[rgba(0,0,0,0.08)]">
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`pb-[16px] px-[4px] text-[15px] font-semibold relative transition-colors ${
                  activeTab === "recommendations"
                    ? "text-[#1A1A1A]"
                    : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                }`}
              >
                Recommendations
                {activeTab === "recommendations" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("recently")}
                className={`pb-[16px] px-[4px] text-[15px] font-semibold relative transition-colors ${
                  activeTab === "recently"
                    ? "text-[#1A1A1A]"
                    : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                }`}
              >
                Recently viewed
                {activeTab === "recently" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`pb-[16px] px-[4px] text-[15px] font-semibold relative transition-colors ${
                  activeTab === "favorites"
                    ? "text-[#1A1A1A]"
                    : "text-[#6B6B6B] hover:text-[#1A1A1A]"
                }`}
              >
                Your favorites
                {activeTab === "favorites" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
                )}
              </button>
            </div>

            {/* Property Cards */}
            {(activeTab === "recently" || activeTab === "recommendations") && (
              <>
                {isListingsTabLoading && (
                  <HomeListingsSkeletonGrid />
                )}
                {!isListingsTabEmpty && (
                  <div className="grid grid-cols-3 gap-[24px]">
                    {displayedListings.map((property) => (
                      <Link
                        key={property.id}
                        to={`/listing/${property.id}`}
                        className="group bg-white hover:shadow-lg transition-all duration-300"
                      >
                        <div
                    className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F9] group/carousel"
                    onWheel={(e) => {
                      const previewImages = getListingCardImages(property.id, property.images);
                      if (previewImages.length <= 1) return;
                      
                      e.preventDefault();
                      e.stopPropagation();
                      const isScrollingDown = e.deltaY > 0;
                      moveListingImage(property.id, isScrollingDown ? "next" : "prev", property.images);
                    }}
                  >
                    {/* Carousel Image */}
                    <img
                      src={getListingCardImages(property.id, property.images)[carouselImagesByListingId[property.id] ?? 0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                      alt={property.title}
                      className="w-full h-full object-cover object-center bg-[#F3F4F6]"
                    />
                    {Date.now() - new Date(property.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7 && (
                      <div className="absolute top-[12px] left-[12px] bg-[#FFD93D] text-[#1A1A1A] px-[8px] py-[4px] text-[11px] font-bold uppercase tracking-[0.05em] flex items-center gap-[4px]">
                        <Star className="w-[10px] h-[10px] fill-current" />
                        New
                      </div>
                    )}

                    {/* Left Arrow */}
                    {getListingCardImages(property.id, property.images).length > 1 && (carouselImagesByListingId[property.id] ?? 0) > 0 && (
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

                    {/* Right Arrow */}
                    {getListingCardImages(property.id, property.images).length > 1 && (carouselImagesByListingId[property.id] ?? 0) < getListingCardImages(property.id, property.images).length - 1 && (
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

                    {/* Favorite Icon with Splash */}
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
                      className="absolute top-[12px] right-[12px] w-[32px] h-[32px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors rounded-full"
                    >
                      <Heart
                        className={`w-[16px] h-[16px] ${
                          favoriteListingIds.has(property.id)
                            ? "fill-[#0891B2] text-[#0891B2]"
                            : "text-[#1A1A1A]"
                        }`}
                      />

                      {/* Splash Animation */}
                      {favoriteSplashById.has(property.id) && (
                        <>
                          <div className="absolute inset-0 border-2 border-[#0891B2] rounded-full animate-ping" style={{ animationDuration: "480ms" }} />
                          <div className="absolute inset-0 border-2 border-[#0891B2] rounded-full opacity-30" style={{ animation: "ring-pulse 480ms ease-out forwards" }} />
                        </>
                      )}
                    </button>

                    {/* View All Media Overlay - Show on last preview image when there are more images */}
                    {getListingCardImages(property.id, property.images).length > 1 && (carouselImagesByListingId[property.id] ?? 0) === getListingCardImages(property.id, property.images).length - 1 && property.images.length > getListingCardImages(property.id, property.images).length && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-[38px] font-bold mb-[4px]">View all media</div>
                          <div className="text-[33px] text-white/90">{property.images.length} photos</div>
                        </div>
                      </div>
                    )}

                    {/* Image Dots */}
                    {getListingCardImages(property.id, property.images).length > 1 && (
                      <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
                        {Array.from({ length: getListingCardImages(property.id, property.images).length }, (_, index) => (
                          <div
                            key={index}
                            className={`w-[6px] h-[6px] rounded-full ${
                              index === (carouselImagesByListingId[property.id] ?? 0) ? "bg-white" : "bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                        <div className="p-[16px]">
                          <h3 className="text-[#1A1A1A] text-[15px] font-semibold mb-[8px] line-clamp-2">{property.title}</h3>
                          <div className="flex items-center gap-[12px] mb-[12px] text-[13px] text-[#6B6B6B]">
                            <div className="flex items-center gap-[4px]"><MapPin className="w-[12px] h-[12px]" /><span>{property.area} m²</span></div>
                            <div className="flex items-center gap-[4px]"><UserIcon className="w-[12px] h-[12px]" /><span>{property.bedrooms} bedrooms</span></div>
                          </div>
                          <div className="flex items-baseline gap-[4px] mb-[8px]">
                            <span className="text-[#1A1A1A] text-[18px] font-bold">€{property.monthlyRent}</span>
                            <span className="text-[#6B6B6B] text-[13px]">/month, {property.utilitiesIncluded ? "utilities included" : "excl. utilities"}</span>
                          </div>
                          <div className="flex items-center gap-[6px] text-accent-blue text-[12px] font-semibold">
                            <div className="w-[6px] h-[6px] rounded-full bg-accent-blue" />
                            Available from {new Date(property.availableFrom).toLocaleDateString("en-GB")}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {!isListingsTabLoading && isListingsTabEmpty && isRecommendationsTab && (
                  <div className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9] p-[24px] text-center">
                    <div className="text-[#1A1A1A] text-[18px] font-semibold mb-[8px]">No recommendations yet</div>
                    <div className="text-[#6B6B6B] text-[14px] max-w-[560px] mx-auto mb-[16px]">
                      Start exploring listings, save a few favorites, or message landlords to help us personalize your recommendations.
                    </div>
                    <Link
                      to="/listings"
                      className="inline-flex items-center gap-[8px] px-[16px] py-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold hover:bg-[#0891B2] transition-colors"
                    >
                      Explore listings
                      <ArrowRight className="w-[16px] h-[16px]" />
                    </Link>
                  </div>
                )}
                {!isListingsTabLoading && isListingsTabEmpty && isRecentlyViewedTab && (
                  <div className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#F7F7F9] p-[24px] text-center">
                    <div className="text-[#1A1A1A] text-[18px] font-semibold mb-[8px]">No recently viewed listings yet</div>
                    <div className="text-[#6B6B6B] text-[14px] max-w-[560px] mx-auto mb-[16px]">
                      Once you open a property, it will appear here so you can jump back to it quickly.
                    </div>
                    <div className="flex items-center justify-center gap-[12px] flex-wrap">
                      {recommendations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab("recommendations")}
                          className="inline-flex items-center gap-[8px] px-[16px] py-[10px] border border-[rgba(0,0,0,0.12)] text-[#1A1A1A] text-[14px] font-semibold hover:border-[rgba(0,0,0,0.24)] hover:bg-white transition-colors"
                        >
                          See recommendations
                        </button>
                      )}
                      <Link
                        to="/listings"
                        className="inline-flex items-center gap-[8px] px-[16px] py-[10px] bg-[#1A1A1A] text-white text-[14px] font-semibold hover:bg-[#0891B2] transition-colors"
                      >
                        Browse listings
                        <ArrowRight className="w-[16px] h-[16px]" />
                      </Link>
                    </div>
                  </div>
                )}
                <div className="mt-[24px] flex justify-end">
                  <Link
                    to="/listings"
                    className="inline-flex items-center gap-[8px] px-[16px] py-[10px] border border-[rgba(0,0,0,0.12)] text-[#1A1A1A] text-[14px] font-semibold hover:border-[rgba(0,0,0,0.24)] hover:bg-[#F7F7F9] transition-colors"
                  >
                    View all listings
                    <ArrowRight className="w-[16px] h-[16px]" />
                  </Link>
                </div>
              </>
            )}

            {activeTab === "favorites" && (
              <>
                {isLoadingFavorites && (
                  <HomeListingsSkeletonGrid />
                )}
                {!isLoadingFavorites && (
                  <div className="grid grid-cols-3 gap-[24px]">
                    {favorites.map((property) => (
                      <Link
                        key={property.id}
                        to={`/listing/${property.id}`}
                        className="group bg-white hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F9]">
                          <img
                            src={property.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                            alt={property.title}
                            className="w-full h-full object-cover object-center bg-[#F3F4F6]"
                          />
                          <div className="absolute bottom-[12px] left-0 right-0 flex items-center justify-center gap-[4px]">
                            {Array.from({ length: getImageDotCount(property.image ? [property.image] : []) }, (_, index) => (
                              <div key={index} className={`w-[6px] h-[6px] rounded-full ${index === 0 ? "bg-white" : "bg-white/40"}`} />
                            ))}
                          </div>
                        </div>
                        <div className="p-[16px]">
                          <h3 className="text-[#1A1A1A] text-[15px] font-semibold mb-[8px] line-clamp-2">{property.title}</h3>
                          <div className="flex items-center gap-[12px] mb-[12px] text-[13px] text-[#6B6B6B]">
                            <div className="flex items-center gap-[4px]"><MapPin className="w-[12px] h-[12px]" /><span>{property.area} m²</span></div>
                            <div className="flex items-center gap-[4px]"><UserIcon className="w-[12px] h-[12px]" /><span>{property.bedrooms} bedrooms</span></div>
                          </div>
                          <div className="flex items-baseline gap-[4px] mb-[8px]">
                            <span className="text-[#1A1A1A] text-[18px] font-bold">€{property.monthlyRent}</span>
                            <span className="text-[#6B6B6B] text-[13px]">/month</span>
                          </div>
                          <div className="flex items-center gap-[6px] text-accent-blue text-[12px] font-semibold">
                            <div className="w-[6px] h-[6px] rounded-full bg-accent-blue" />
                            Available from {new Date(property.availableFrom).toLocaleDateString("en-GB")}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {!isLoadingFavorites && favorites.length === 0 && (
                  <div className="text-[#6B6B6B] text-[14px] py-[8px]">You haven't saved any favorites yet. Heart a listing to save it here.</div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Zero-Viewing Trust Section */}
      <section className="py-[80px] bg-[#F7F7F9]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="text-center mb-[64px]">
            <div className="inline-flex items-center gap-[8px] bg-accent-blue text-white px-[16px] py-[8px] mb-[24px]">
              <Shield className="w-[16px] h-[16px]" />
              <span className="text-[12px] font-bold uppercase tracking-[0.05em]">
                Zero-Viewing Guarantee
              </span>
            </div>
            <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[16px]">
              Rent Without Risk
            </h2>
            <p className="text-[#6B6B6B] text-[18px] max-w-[720px] mx-auto leading-[1.6]">
              Our institutional-grade verification process means you can book your next home 
              entirely online—no physical viewing required. If it doesn't match the listing, 
              we refund you 100%.
            </p>
          </div>

          {/* 4-Step Workflow */}
          <div className="grid grid-cols-4 gap-[32px]">
            {[
              {
                step: "01",
                title: "Pick",
                description: "Browse verified properties with transparent pricing and comprehensive documentation.",
                icon: Search,
              },
              {
                step: "02",
                title: "Message",
                description: "Chat directly with verified landlords through our secure, encrypted messaging platform.",
                icon: MessageCircle,
              },
              {
                step: "03",
                title: "Apply",
                description: "Submit your application with verified documents. Receive approval within 24 hours.",
                icon: FileCheck,
              },
              {
                step: "04",
                title: "Pay",
                description: "Secure payment with deposit held in escrow. Get your keys and move in remotely.",
                icon: CreditCard,
              },
            ].map((step, idx) => (
              <motion.div 
                key={idx} 
                className="bg-white group hover:shadow-lg transition-shadow p-[32px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-[16px] mb-[16px]">
                  <div className="w-[64px] h-[64px] bg-[#2563EB] text-white flex items-center justify-center">
                    <step.icon className="w-[32px] h-[32px]" />
                  </div>
                  <div>
                    <span className="text-[#6B6B6B] text-[12px] font-bold uppercase tracking-[0.05em] block">
                      Step {step.step}
                    </span>
                    <h3 className="text-[#1A1A1A] text-[28px] font-bold">
                      {step.title}
                    </h3>
                  </div>
                </div>
                <p className="text-[#6B6B6B] text-[15px] leading-[1.6]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Trust Stats */}
          <div className="mt-[64px] bg-white p-[48px]">
            <div className="grid grid-cols-4 gap-[48px]">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0, type: "spring", stiffness: 100 }}
              >
                <div className="text-[#0891B2] text-[48px] font-bold tracking-[-0.02em] mb-[8px]">
                  <Counter value={100} suffix="%" duration={2.5} />
                </div>
                <p className="text-[#1A1A1A] text-[14px] font-semibold uppercase tracking-[0.05em]">
                  Verified Landlords
                </p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15, type: "spring", stiffness: 100 }}
              >
                <div className="text-[#0891B2] text-[48px] font-bold tracking-[-0.02em] mb-[8px]">
                  <Counter value={50} prefix="€" suffix="M+" duration={2.5} />
                </div>
                <p className="text-[#1A1A1A] text-[14px] font-semibold uppercase tracking-[0.05em]">
                  Protected in Escrow
                </p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
              >
                <div className="text-[#0891B2] text-[48px] font-bold tracking-[-0.02em] mb-[8px]">
                  <Counter value={98} suffix="%" duration={2.5} />
                </div>
                <p className="text-[#1A1A1A] text-[14px] font-semibold uppercase tracking-[0.05em]">
                  Satisfaction Rate
                </p>
              </motion.div>

              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45, type: "spring", stiffness: 100 }}
              >
                <div className="text-[#0891B2] text-[48px] font-bold tracking-[-0.02em] mb-[8px]">
                  24/7
                </div>
                <p className="text-[#1A1A1A] text-[14px] font-semibold uppercase tracking-[0.05em]">
                  Support Available
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-[80px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="flex items-end justify-between mb-[48px]">
            <div>
              <h2 className="text-[#1A1A1A] text-[48px] font-bold tracking-[-0.02em] mb-[8px]">
                Popular Destinations
              </h2>
              <p className="text-[#6B6B6B] text-[18px]">
                Discover verified homes in Europe's most livable cities
              </p>
            </div>
            <Link
              to="/listings/berlin"
              className="flex items-center gap-[8px] text-[#0891B2] font-bold hover:gap-[12px] transition-all"
            >
              View All Cities
              <ArrowRight className="w-[20px] h-[20px]" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-[24px]">
            {cities.map((city, idx) => (
              <Link
                key={idx}
                to={`/listings/${city.name.toLowerCase()}`}
                className="group relative overflow-hidden aspect-[3/4] bg-[#F7F7F9]"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-[24px] left-[24px] right-[24px] text-white">
                  <h3 className="text-[28px] font-bold mb-[4px]">
                    {city.name}
                  </h3>
                  <p className="text-white/80 text-[14px] mb-[8px]">
                    {city.country}
                  </p>
                  <div className="flex items-center gap-[8px] text-[13px]">
                    <HomeIcon className="w-[14px] h-[14px]" />
                    <span>{city.properties} properties</span>
                  </div>
                </div>
                <div className="absolute top-[16px] right-[16px] bg-[#2563EB] text-white px-[8px] py-[4px] text-[11px] font-bold uppercase tracking-[0.05em] opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works CTA */}
      <section className="py-[80px] bg-[#1A1A1A] text-white">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="grid grid-cols-2 gap-[64px] items-center">
            <div>
              <h2 className="text-[48px] font-bold tracking-[-0.02em] mb-[24px]">
                Built for Global Mobility
              </h2>
              <p className="text-white/80 text-[18px] mb-[32px] leading-[1.6]">
                Whether you're a digital nomad seeking flexibility, an expatriate relocating 
                for work, or an international student starting a new chapter—we provide the 
                infrastructure for secure, seamless housing across borders.
              </p>
              <div className="space-y-[16px] mb-[32px]">
                {[
                  "Flexible 3-12 month lease terms",
                  "Registration (Anmeldung) support for visas",
                  "All utilities included in transparent pricing",
                  "Legal lease agreements in your language",
                  "24/7 multilingual customer support",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-[12px]">
                    <Check className="w-[20px] h-[20px] text-[#2563EB] flex-shrink-0" />
                    <span className="text-[16px]">{feature}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-[12px] px-[32px] py-[16px] bg-[#0891B2] text-white font-bold hover:bg-[#0E7490] transition-colors"
              >
                Learn How It Works
                <ArrowRight className="w-[20px] h-[20px]" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-[16px]">
              <div className="bg-white/5 p-[32px] backdrop-blur">
                <Users className="w-[40px] h-[40px] text-[#0891B2] mb-[16px]" />
                <h3 className="text-[24px] font-bold mb-[8px]">
                  <Counter value={147} suffix="K+" duration={2.5} />
                </h3>
                <p className="text-white/60 text-[14px]">Global Tenants</p>
              </div>
              <div className="bg-white/5 p-[32px] backdrop-blur">
                <HomeIcon className="w-[40px] h-[40px] text-[#0891B2] mb-[16px]" />
                <h3 className="text-[24px] font-bold mb-[8px]">
                  <Counter value={43} suffix="K+" duration={2.5} />
                </h3>
                <p className="text-white/60 text-[14px]">Verified Properties</p>
              </div>
              <div className="bg-white/5 p-[32px] backdrop-blur">
                <MapPin className="w-[40px] h-[40px] text-[#0891B2] mb-[16px]" />
                <h3 className="text-[24px] font-bold mb-[8px]">
                  <Counter value={400} suffix="+" duration={2.5} />
                </h3>
                <p className="text-white/60 text-[14px]">Cities Worldwide</p>
              </div>
              <div className="bg-white/5 p-[32px] backdrop-blur">
                <Star className="w-[40px] h-[40px] text-[#0891B2] mb-[16px]" />
                <h3 className="text-[24px] font-bold mb-[8px]">4.8/5</h3>
                <p className="text-white/60 text-[14px]">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}