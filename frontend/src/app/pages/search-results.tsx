import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { DatePicker } from "../components/date-picker";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Home as HomeIcon,
  Heart,
  Star,
  SlidersHorizontal,
  X,
  Map
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";
import { useIsMobile } from "../components/ui/use-mobile";
import priceSliderGraph from "../../assets/price-slider-graph.svg";

interface ListingItem {
  id: string;
  title: string;
  city: string;
  address: string;
  area: number;
  bedrooms: number;
  monthlyRent: number;
  availableFrom: string;
  minStay: number;
  propertyType: "apartment" | "studio" | "house" | "room";
  images: string[];
}

type ApiListingItem = Partial<ListingItem> & {
  media?: Array<{ url?: string }>;
  propertySize?: number;
  bedroomsCount?: number;
  minimumRentalPeriod?: number;
  propertyType?: string;
};

function normalizeListingItem(raw: ApiListingItem): ListingItem {
  const mediaImages = Array.isArray(raw.media)
    ? raw.media.map((item) => item?.url).filter((url): url is string => Boolean(url))
    : [];

  const normalizedPropertyType: ListingItem["propertyType"] =
    raw.propertyType === "apartment" ||
    raw.propertyType === "studio" ||
    raw.propertyType === "house" ||
    raw.propertyType === "room"
      ? raw.propertyType
      : raw.propertyType === "building"
      ? "apartment"
      : "apartment";

  return {
    id: raw.id ?? "",
    title: raw.title ?? "Untitled listing",
    city: raw.city ?? "",
    address: raw.address ?? "",
    area: raw.area ?? raw.propertySize ?? 0,
    bedrooms: raw.bedrooms ?? raw.bedroomsCount ?? 0,
    monthlyRent: raw.monthlyRent ?? 0,
    availableFrom: raw.availableFrom ?? new Date().toISOString(),
    minStay: raw.minStay ?? raw.minimumRentalPeriod ?? 1,
    propertyType: normalizedPropertyType,
    images: Array.isArray(raw.images) ? raw.images : mediaImages,
  };
}

type SortOption = "recommended" | "most-recent" | "lowest-price" | "highest-price" | "landlord-rating";

const PROPERTY_TYPES: Array<ListingItem["propertyType"]> = ["apartment", "studio", "house", "room"];

function toDateQueryValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseFilterDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function formatDateLabel(date: Date | null) {
  if (!date) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRequestedStayLengthLabel(startDate: Date | null, endDate: Date | null) {
  if (!startDate || !endDate || endDate <= startDate) {
    return null;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);
  if (dayCount < 28) {
    return `${dayCount} day${dayCount === 1 ? "" : "s"}`;
  }

  const monthCount = Math.max(1, Math.round(dayCount / 30));
  return `${monthCount} month${monthCount === 1 ? "" : "s"}`;
}

function getRequestedStayMonths(startDate: Date | null, endDate: Date | null) {
  if (!startDate || !endDate || endDate <= startDate) {
    return null;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / millisecondsPerDay);
  return Math.max(1, Math.ceil(dayCount / 30));
}

function parseNumberParam(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDelimitedParam(value: string | null) {
  if (!value) {
    return [];
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function serializeDelimitedParam(values: string[]) {
  return values.join(",");
}

function extractNeighborhood(property: ListingItem) {
  const firstAddressToken = property.address?.split(",")[0]?.trim();
  if (firstAddressToken && firstAddressToken.length > 0) {
    return firstAddressToken;
  }

  return property.city;
}

function resolveListingImageUrl(image: string | undefined, apiBase: string) {
  if (!image || image.trim().length === 0) {
    return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80";
  }

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  const normalizedPath = image.startsWith("/") ? image : `/${image}`;
  return `${apiBase}${normalizedPath}`;
}

function getImageDotCount(images: string[] | undefined) {
  return Math.max(1, images?.length ?? 0);
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatTypeBreakdown(parts: string[]) {
  if (parts.length === 0) {
    return "0 listings";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

type ListingCoordinates = {
  lat: number;
  lng: number;
};

const CITY_CENTER_BY_NAME: Record<string, ListingCoordinates> = {
  berlin: { lat: 52.52, lng: 13.405 },
  amsterdam: { lat: 52.3676, lng: 4.9041 },
  paris: { lat: 48.8566, lng: 2.3522 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  lisbon: { lat: 38.7223, lng: -9.1393 },
  rome: { lat: 41.9028, lng: 12.4964 },
  vienna: { lat: 48.2082, lng: 16.3738 },
};

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function buildFallbackCoordinates(listingId: string, cityName: string): ListingCoordinates {
  const normalizedCity = cityName.trim().toLowerCase();
  const cityCenter = CITY_CENTER_BY_NAME[normalizedCity] ?? { lat: 52.52, lng: 13.405 };
  const hash = hashString(`${listingId}-${normalizedCity}`);

  // Keep generated points within ~2km radius around city center.
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 0.004 + (hash % 12) * 0.001;

  return {
    lat: cityCenter.lat + Math.sin(angle) * radius,
    lng: cityCenter.lng + Math.cos(angle) * radius,
  };
}

function formatMarkerPrice(monthlyRent: number) {
  return `€${monthlyRent.toLocaleString("en-GB")}`;
}

function createPriceMarkerIcon(monthlyRent: number) {
  return L.divIcon({
    className: "",
    html: `<div style="background:#fff;border:1px solid rgba(0,0,0,0.18);border-radius:999px;padding:6px 10px;font-weight:700;font-size:14px;color:#12303B;box-shadow:0 4px 12px rgba(0,0,0,0.12);white-space:nowrap;">${formatMarkerPrice(monthlyRent)}</div>`,
    iconSize: [84, 34],
    iconAnchor: [42, 17],
  });
}

function FitMapToMarkers({ points, resetSignal }: { points: Array<[number, number]>; resetSignal: number }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 13, { animate: true });
      return;
    }

    map.fitBounds(points, {
      padding: [40, 40],
      maxZoom: 13,
      animate: true,
    });
  }, [map, points, resetSignal]);

  return null;
}

function InvalidateMapSize({ isExpanded }: { isExpanded: boolean }) {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isExpanded, map]);

  return null;
}

function SearchListingCardSkeleton() {
  return (
    <div className="cursor-default">
      <div className="relative mb-[12px] overflow-hidden bg-[#E8EDF2] h-[220px]" />
      <div className="space-y-[8px]">
        <div className="h-[18px] w-[80%] bg-[#E8EDF2] rounded-[4px]" />
        <div className="h-[16px] w-[42%] bg-[#E8EDF2] rounded-[4px]" />
        <div className="h-[14px] w-[66%] bg-[#E8EDF2] rounded-[4px]" />
        <div className="h-[20px] w-[56%] bg-[#E8EDF2] rounded-[4px]" />
        <div className="h-[14px] w-[60%] bg-[#E8EDF2] rounded-[4px]" />
      </div>
    </div>
  );
}

export function SearchResults() {
  const { city } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const apiBase = API_BASE;
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [dateOpen, setDateOpen] = useState(false);
  const [propertyDatePickerId, setPropertyDatePickerId] = useState<string | null>(null);
  const [propertyDatePickerStart, setPropertyDatePickerStart] = useState<string>("");
  const [propertyDatePickerEnd, setPropertyDatePickerEnd] = useState<string>("");
  const [priceOpen, setPriceOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"anyone" | "students" | "professionals" | "families">("anyone");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("recommended");
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [properties, setProperties] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteListingIds, setFavoriteListingIds] = useState<Set<string>>(new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const [mapCoordinatesByListingId, setMapCoordinatesByListingId] = useState<Record<string, ListingCoordinates>>({});
  const [hoveredMapListingId, setHoveredMapListingId] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [minPriceDraft, setMinPriceDraft] = useState("");
  const [maxPriceDraft, setMaxPriceDraft] = useState("");
  const [mapResetSignal, setMapResetSignal] = useState(0);
  const [carouselImagesByListingId, setCarouselImagesByListingId] = useState<Record<string, number>>({});
  const [favoriteSplashById, setFavoriteSplashById] = useState<Set<string>>(new Set());
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [allFiltersShowAllNeighborhoods, setAllFiltersShowAllNeighborhoods] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const requestedStartDate = useMemo(() => parseFilterDate(searchParams.get("startDate")), [searchParams]);
  const requestedEndDate = useMemo(() => parseFilterDate(searchParams.get("endDate")), [searchParams]);
  const startDateValue = searchParams.get("startDate") ?? "";
  const endDateValue = searchParams.get("endDate") ?? "";
  const minPrice = useMemo(() => parseNumberParam(searchParams.get("minPrice")), [searchParams]);
  const maxPrice = useMemo(() => parseNumberParam(searchParams.get("maxPrice")), [searchParams]);
  const selectedPropertyTypes = useMemo(
    () => new Set(parseDelimitedParam(searchParams.get("types"))),
    [searchParams],
  );
  const selectedNeighborhoods = useMemo(
    () => new Set(parseDelimitedParam(searchParams.get("neighborhoods"))),
    [searchParams],
  );
  const requestedStayMonths = useMemo(
    () => getRequestedStayMonths(requestedStartDate, requestedEndDate),
    [requestedEndDate, requestedStartDate],
  );
  const neighborhoodOptions = useMemo(() => {
    const uniqueNeighborhoods = new Set<string>();
    for (const property of properties) {
      uniqueNeighborhoods.add(extractNeighborhood(property));
    }

    return [...uniqueNeighborhoods].sort((left, right) => left.localeCompare(right));
  }, [properties]);
  const absoluteMinPrice = 0;
  const absoluteMaxPrice = 15000;
  const resolvedMinDraft = useMemo(() => {
    const parsed = Number(minPriceDraft);
    return Number.isFinite(parsed) ? parsed : absoluteMinPrice;
  }, [absoluteMinPrice, minPriceDraft]);
  const resolvedMaxDraft = useMemo(() => {
    const parsed = Number(maxPriceDraft);
    return Number.isFinite(parsed) ? parsed : absoluteMaxPrice;
  }, [absoluteMaxPrice, maxPriceDraft]);
  const sliderMinValue = Math.max(absoluteMinPrice, Math.min(resolvedMinDraft, absoluteMaxPrice));
  const sliderMaxValue = Math.min(absoluteMaxPrice, Math.max(resolvedMaxDraft, sliderMinValue));
  const sliderSpan = Math.max(1, absoluteMaxPrice - absoluteMinPrice);
  const sliderMinPercent = ((sliderMinValue - absoluteMinPrice) / sliderSpan) * 100;
  const sliderMaxPercent = ((sliderMaxValue - absoluteMinPrice) / sliderSpan) * 100;

  useEffect(() => {
    // Keep new searches anchored at the page top so users always see the header first.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [city]);

  useEffect(() => {
    // Check if viewMode is passed in URL and set it
    const viewModeParam = searchParams.get("viewMode");
    if (viewModeParam === "map" || viewModeParam === "list") {
      setViewMode(viewModeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setMinPriceDraft(minPrice !== null ? String(minPrice) : "");
    setMaxPriceDraft(maxPrice !== null ? String(maxPrice) : "");
  }, [maxPrice, minPrice]);

  useEffect(() => {
    if (!neighborhoodsOpen) {
      setShowAllNeighborhoods(false);
    }
  }, [neighborhoodsOpen]);

  useEffect(() => {
    if (!allFiltersOpen) {
      setAllFiltersShowAllNeighborhoods(false);
    }
  }, [allFiltersOpen]);

  useEffect(() => {
    if (!dateOpen && !allFiltersOpen) {
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [allFiltersOpen, dateOpen]);

  const updateSearchFilters = (nextValues: Record<string, string | number | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(nextValues)) {
      if (value === null || value === "") {
        nextParams.delete(key);
        continue;
      }

      nextParams.set(key, String(value));
    }

    setSearchParams(nextParams);
  };

  const closeAllPanels = () => {
    setDateOpen(false);
    setPriceOpen(false);
    setPropertyTypeOpen(false);
    setNeighborhoodsOpen(false);
    setAllFiltersOpen(false);
  };

  const togglePanel = (panel: "date" | "price" | "propertyType" | "neighborhoods" | "all") => {
    const nextOpen = {
      date: panel === "date" ? !dateOpen : false,
      price: panel === "price" ? !priceOpen : false,
      propertyType: panel === "propertyType" ? !propertyTypeOpen : false,
      neighborhoods: panel === "neighborhoods" ? !neighborhoodsOpen : false,
      all: panel === "all" ? !allFiltersOpen : false,
    };

    setDateOpen(nextOpen.date);
    setPriceOpen(nextOpen.price);
    setPropertyTypeOpen(nextOpen.propertyType);
    setNeighborhoodsOpen(nextOpen.neighborhoods);
    setAllFiltersOpen(nextOpen.all);
  };

  const clearAllFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    ["startDate", "endDate", "minPrice", "maxPrice", "types", "neighborhoods"].forEach((key) => {
      nextParams.delete(key);
    });
    setSearchParams(nextParams);
    setPriceOpen(false);
    setPropertyTypeOpen(false);
    setNeighborhoodsOpen(false);
    setAllFiltersOpen(false);
    setDateOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        closeAllPanels();
      }
    };

    if (dateOpen || priceOpen || propertyTypeOpen || neighborhoodsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dateOpen, neighborhoodsOpen, priceOpen, propertyTypeOpen]);

  useEffect(() => {
    const handleSortOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };

    if (sortOpen) {
      document.addEventListener("mousedown", handleSortOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleSortOutside);
    };
  }, [sortOpen]);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!requestedStartDate) {
        // no-op: keep evaluating the rest of active filters
      } else {
        const availableFromDate = new Date(property.availableFrom);
        if (Number.isNaN(availableFromDate.getTime())) {
          return false;
        }

        if (availableFromDate > requestedStartDate) {
          return false;
        }

        if (requestedStayMonths !== null && property.minStay > requestedStayMonths) {
          return false;
        }
      }

      if (minPrice !== null && property.monthlyRent < minPrice) {
        return false;
      }

      if (maxPrice !== null && property.monthlyRent > maxPrice) {
        return false;
      }

      if (selectedPropertyTypes.size > 0 && !selectedPropertyTypes.has(property.propertyType)) {
        return false;
      }

      const propertyNeighborhood = extractNeighborhood(property);
      if (selectedNeighborhoods.size > 0 && !selectedNeighborhoods.has(propertyNeighborhood)) {
        return false;
      }

      return true;
    });
  }, [
    maxPrice,
    minPrice,
    properties,
    requestedStartDate,
    requestedStayMonths,
    selectedNeighborhoods,
    selectedPropertyTypes,
  ]);
  const sortedProperties = useMemo(() => {
    const next = [...filteredProperties];

    switch (sortOption) {
      case "most-recent":
        next.sort((left, right) => {
          const leftTime = new Date(left.availableFrom).getTime();
          const rightTime = new Date(right.availableFrom).getTime();
          return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
        });
        break;
      case "lowest-price":
        next.sort((left, right) => left.monthlyRent - right.monthlyRent);
        break;
      case "highest-price":
        next.sort((left, right) => right.monthlyRent - left.monthlyRent);
        break;
      case "landlord-rating":
        // Proxy score until backend provides explicit rating values.
        next.sort((left, right) => {
          const leftScore = left.area * 0.5 + left.bedrooms * 20 - left.monthlyRent * 0.02;
          const rightScore = right.area * 0.5 + right.bedrooms * 20 - right.monthlyRent * 0.02;
          return rightScore - leftScore;
        });
        break;
      default:
        break;
    }

    return next;
  }, [filteredProperties, sortOption]);
  const activeFilters = useMemo(() => {
    let count = 0;
    if (requestedStartDate || requestedEndDate) count += 1;
    if (minPrice !== null || maxPrice !== null) count += 1;
    if (selectedPropertyTypes.size > 0) count += 1;
    if (selectedNeighborhoods.size > 0) count += 1;
    return count;
  }, [maxPrice, minPrice, requestedEndDate, requestedStartDate, selectedNeighborhoods.size, selectedPropertyTypes.size]);
  const dateRangeLabel = useMemo(() => {
    const startLabel = formatDateLabel(requestedStartDate);
    const endLabel = formatDateLabel(requestedEndDate);

    if (startLabel && endLabel) {
      return `${startLabel} - ${endLabel}`;
    }

    return startLabel ?? endLabel ?? "Flexible dates";
  }, [requestedEndDate, requestedStartDate]);
  const stayLengthLabel = useMemo(
    () => getRequestedStayLengthLabel(requestedStartDate, requestedEndDate),
    [requestedEndDate, requestedStartDate],
  );
  const priceLabel = useMemo(() => {
    if (minPrice !== null && maxPrice !== null) {
      return `€${minPrice} - €${maxPrice}`;
    }

    if (minPrice !== null) {
      return `From €${minPrice}`;
    }

    if (maxPrice !== null) {
      return `Up to €${maxPrice}`;
    }

    return "Price";
  }, [maxPrice, minPrice]);
  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : "All cities";
  const listingTypeBreakdown = useMemo(() => {
    const counts = filteredProperties.reduce(
      (accumulator, property) => {
        accumulator[property.propertyType] += 1;
        return accumulator;
      },
      { apartment: 0, studio: 0, house: 0, room: 0 } as Record<ListingItem["propertyType"], number>,
    );

    const parts: string[] = [];
    if (counts.room > 0) {
      parts.push(formatCountLabel(counts.room, "room", "rooms"));
    }
    if (counts.studio > 0) {
      parts.push(formatCountLabel(counts.studio, "studio", "studios"));
    }
    if (counts.apartment > 0) {
      parts.push(formatCountLabel(counts.apartment, "apartment", "apartments"));
    }
    if (counts.house > 0) {
      parts.push(formatCountLabel(counts.house, "house", "houses"));
    }

    return formatTypeBreakdown(parts);
  }, [filteredProperties]);
  const mappedListings = useMemo(() => {
    return sortedProperties
      .map((property) => {
        const coordinates = mapCoordinatesByListingId[property.id] ?? buildFallbackCoordinates(property.id, property.city);

        return {
          ...property,
          coordinates,
        };
      })
      .filter((property): property is ListingItem & { coordinates: ListingCoordinates } => Boolean(property));
  }, [mapCoordinatesByListingId, sortedProperties]);
  const mapPoints = useMemo(() => {
    return mappedListings.map((property) => [property.coordinates.lat, property.coordinates.lng] as [number, number]);
  }, [mappedListings]);
  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: () => void }> = [];

    if (requestedStartDate || requestedEndDate) {
      chips.push({
        key: "dates",
        label: dateRangeLabel,
        clear: () => updateSearchFilters({ startDate: null, endDate: null }),
      });
    }

    if (minPrice !== null || maxPrice !== null) {
      chips.push({
        key: "price",
        label: priceLabel,
        clear: () => updateSearchFilters({ minPrice: null, maxPrice: null }),
      });
    }

    if (selectedPropertyTypes.size > 0) {
      chips.push({
        key: "types",
        label: `Type: ${[...selectedPropertyTypes].join(", ")}`,
        clear: () => updateSearchFilters({ types: null }),
      });
    }

    if (selectedNeighborhoods.size > 0) {
      chips.push({
        key: "neighborhoods",
        label: `Area: ${[...selectedNeighborhoods].join(", ")}`,
        clear: () => updateSearchFilters({ neighborhoods: null }),
      });
    }

    return chips;
  }, [
    dateRangeLabel,
    maxPrice,
    minPrice,
    priceLabel,
    requestedEndDate,
    requestedStartDate,
    selectedNeighborhoods,
    selectedPropertyTypes,
  ]);

  useEffect(() => {
    const loadListings = async () => {
      setIsLoading(true);
      try {
        const cityQuery = city ? `?city=${encodeURIComponent(city)}` : "";
        const response = await fetch(`${apiBase}/api/listings${cityQuery}`);
        if (!response.ok) {
          throw new Error("Failed to load listings");
        }

        const payload = (await response.json()) as { listings: ApiListingItem[] };
        setProperties((payload.listings ?? []).map(normalizeListingItem));
      } catch {
        setProperties([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadListings();
  }, [apiBase, city]);

  useEffect(() => {
    const loadFavoriteState = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setFavoriteListingIds(new Set());
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/auth/me/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          return;
        }

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
        setFavoriteListingIds(new Set(listingIds));
      } catch {
        // Keep page usable even if favorites state cannot be loaded.
      }
    };

    void loadFavoriteState();
  }, [apiBase]);

  useEffect(() => {
    if (viewMode !== "map") {
      return;
    }

    const unresolvedListings = filteredProperties.filter((property) => !mapCoordinatesByListingId[property.id]);
    if (unresolvedListings.length === 0) {
      return;
    }

    // Always place listings on the map immediately, even if live geocoding fails.
    setMapCoordinatesByListingId((prev) => {
      const next = { ...prev };
      for (const property of unresolvedListings) {
        if (!next[property.id]) {
          next[property.id] = buildFallbackCoordinates(property.id, property.city);
        }
      }
      return next;
    });

    let isCancelled = false;
    setIsGeocoding(true);

    const geocodeListings = async () => {
      for (const property of unresolvedListings) {
        if (isCancelled) {
          return;
        }

        const fullQuery = `${property.address}, ${property.city}`;
        const cityQuery = property.city;
        const tryQueries = [fullQuery, cityQuery];

        let nextCoordinates: ListingCoordinates | null = null;

        for (const query of tryQueries) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`,
              {
                headers: {
                  Accept: "application/json",
                },
              },
            );

            if (!response.ok) {
              continue;
            }

            const payload = (await response.json()) as Array<{ lat: string; lon: string }>;
            const firstResult = payload[0];
            if (!firstResult) {
              continue;
            }

            const lat = Number(firstResult.lat);
            const lng = Number(firstResult.lon);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              continue;
            }

            nextCoordinates = { lat, lng };
            break;
          } catch {
            // Keep trying with fallback queries.
          }
        }

        if (nextCoordinates) {
          setMapCoordinatesByListingId((prev) => ({
            ...prev,
            [property.id]: nextCoordinates as ListingCoordinates,
          }));
        }

        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      if (!isCancelled) {
        setIsGeocoding(false);
      }
    };

    void geocodeListings();

    return () => {
      isCancelled = true;
    };
  }, [filteredProperties, mapCoordinatesByListingId, viewMode]);

  const handleToggleFavorite = async (listingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    if (favoriteBusyId === listingId) {
      return;
    }

    const isCurrentlyFavorite = favoriteListingIds.has(listingId);
    setFavoriteBusyId(listingId);
    setFavoriteListingIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFavorite) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      return next;
    });

    try {
      const response = isCurrentlyFavorite
        ? await fetch(`${apiBase}/api/auth/me/favorites/${listingId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        : await fetch(`${apiBase}/api/auth/me/favorites`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ listingId }),
          });

      if (!response.ok) {
        throw new Error("Failed to update favorites");
      }

      toast.success(isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      setFavoriteListingIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyFavorite) {
          next.add(listingId);
        } else {
          next.delete(listingId);
        }
        return next;
      });

      toast.error("Could not update favorites. Please try again.");
    } finally {
      setFavoriteBusyId(null);
    }
  };

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

  const handleToggleFavoriteWithSplash = async (listingId: string) => {
    triggerFavoriteSplash(listingId);
    await handleToggleFavorite(listingId);
  };

  const handlePropertyDateSelection = () => {
    if (!propertyDatePickerId) return;
    
    const params: Record<string, string> = {};
    if (propertyDatePickerStart) params.startDate = propertyDatePickerStart;
    if (propertyDatePickerEnd) params.endDate = propertyDatePickerEnd;
    
    const queryString = Object.keys(params).length > 0 
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    
    navigate(`/property/${propertyDatePickerId}${queryString}`);
    setPropertyDatePickerId(null);
    setPropertyDatePickerStart("");
    setPropertyDatePickerEnd("");
  };

  const scrollToResultsHeader = () => {
    const resultsHeader = document.getElementById("results-header");
    if (!resultsHeader) {
      return;
    }

    const appHeader = document.querySelector("header.sticky") as HTMLElement | null;
    const filterBar = document.querySelector('[data-results-filter-bar="true"]') as HTMLElement | null;
    const stickyHeaderOffset = (appHeader?.offsetHeight ?? 64) + (filterBar?.offsetHeight ?? 64) + 12;
    const sectionTop = resultsHeader.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, sectionTop - stickyHeaderOffset);
    window.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  const handleShowRecommended = () => {
    setViewMode("list");
    setIsMapExpanded(false);
    setSortOpen(false);
    setHoveredMapListingId(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("viewMode");
    setSearchParams(nextParams);
    requestAnimationFrame(scrollToResultsHeader);
  };

  const handleShowMap = () => {
    setViewMode("map");
    setIsMapExpanded(false);
    setSortOpen(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("viewMode", "map");
    setSearchParams(nextParams);
    requestAnimationFrame(scrollToResultsHeader);
  };

  const handleSelectSort = (nextSort: SortOption) => {
    setSortOption(nextSort);
    setSortOpen(false);
    setViewMode("list");
    setIsMapExpanded(false);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("viewMode");
    setSearchParams(nextParams);
    requestAnimationFrame(scrollToResultsHeader);
  };

  const sortLabelByOption: Record<SortOption, string> = {
    recommended: "Recommended",
    "most-recent": "Most recent",
    "lowest-price": "Lowest price",
    "highest-price": "Highest price",
    "landlord-rating": "Landlord rating",
  };

  const sortOptions: Array<{ value: SortOption; label: string }> = [
    { value: "recommended", label: "Recommended" },
    { value: "most-recent", label: "Most recent" },
    { value: "lowest-price", label: "Lowest price" },
    { value: "highest-price", label: "Highest price" },
    { value: "landlord-rating", label: "Landlord rating" },
  ];
  const isSplitMapMode = viewMode === "map" && !isMapExpanded;

  const handleResetMapView = () => {
    setHoveredMapListingId(null);
    setMapResetSignal((prev) => prev + 1);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isMapExpanded) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMapExpanded]);

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      <Header variant="dashboard" logoVariant="mobile-favicon" />

      {/* Filter Bar */}
      <div data-results-filter-bar="true" className="sticky top-[76px] z-40 border-b border-[#E3E8EE] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div ref={filtersRef} className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px]">
          {/* Top Filter Row */}
          <div className="flex items-center gap-[10px] py-[12px] overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible md:whitespace-normal md:py-[14px]">
            {/* Date Display */}
            <div className="relative">
              <button
                type="button"
                onClick={() => togglePanel("date")}
                className={`flex items-center gap-[8px] text-[#1A1A1A] text-[13px] sm:text-[14px] px-[12px] py-[8px] rounded-[12px] border transition-colors flex-shrink-0 ${
                  dateOpen || requestedStartDate || requestedEndDate
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <Calendar className="w-[16px] h-[16px]" />
                <span className="font-semibold">{dateRangeLabel}</span>
                {stayLengthLabel && <span className="text-[#6B6B6B]">({stayLengthLabel})</span>}
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {dateOpen && (
                <>
                  {isMobile && <button type="button" aria-label="Close date overlay" onClick={() => setDateOpen(false)} className="fixed inset-0 z-[95] bg-[rgba(16,26,34,0.50)] md:hidden" />}
                  <div className={isMobile ? "fixed inset-x-0 bottom-0 z-[96] md:hidden" : "absolute top-full left-0 mt-[8px] z-50 hidden md:block"}>
                    <DatePicker
                      isOpen={dateOpen}
                      onClose={() => setDateOpen(false)}
                      startDate={requestedStartDate}
                      endDate={requestedEndDate}
                      initializeFromSelection
                      presentation={isMobile ? "bottom-sheet" : "popover"}
                      onDateChange={(start, end) => {
                        updateSearchFilters({
                          startDate: start ? toDateQueryValue(start) : null,
                          endDate: end ? toDateQueryValue(end) : null,
                        });
                      }}
                      onClearSelection={() => updateSearchFilters({ startDate: null, endDate: null })}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Price Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => togglePanel("price")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[12px] border transition-colors flex-shrink-0 ${
                  priceOpen || minPrice !== null || maxPrice !== null
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <span className="text-[#1A1A1A] text-[13px] sm:text-[14px] font-semibold">{priceLabel}</span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {priceOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[380px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[22px] border border-[rgba(11,45,58,0.10)] bg-white shadow-[0_18px_44px_rgba(0,0,0,0.14)] z-50">
                  <div className="flex items-center justify-between gap-[12px] px-[18px] pt-[18px]">
                    <div className="text-[16px] font-semibold text-[#12303B]">Monthly rent</div>
                    <button
                      type="button"
                      className="inline-flex items-center gap-[8px] rounded-[14px] border border-[#AFC1D3] bg-white px-[14px] py-[9px] text-[13px] font-semibold text-[#12303B]"
                    >
                      Euros (€)
                      <ChevronDown className="h-[16px] w-[16px] text-[#12303B]" />
                    </button>
                  </div>

                  <div className="px-[18px] pt-[16px]">
                    <div className="rounded-[18px] bg-[#FCFEFF] px-[12px] pt-[14px] pb-[10px] border border-[#E6EDF3]">
                      <img
                        src={priceSliderGraph}
                        alt="Price trend graph"
                        className="h-[146px] w-full object-cover rounded-[12px]"
                      />
                      <div className="mt-[8px] flex items-center justify-between text-[11px] text-[#6B7280]">
                        <span>€{absoluteMinPrice.toLocaleString("en-GB")}</span>
                        <span>€{absoluteMaxPrice.toLocaleString("en-GB")}</span>
                      </div>

                      <div className="relative mt-[14px] px-[2px]">
                        <div className="h-[3px] rounded-full bg-[#D5E2ED]" />
                        <div
                          className="absolute top-0 h-[3px] rounded-full bg-[#103947]"
                          style={{ left: `${sliderMinPercent}%`, width: `${Math.max(0, sliderMaxPercent - sliderMinPercent)}%` }}
                        />

                        <input
                          type="range"
                          min={absoluteMinPrice}
                          max={absoluteMaxPrice}
                          value={sliderMinValue}
                          onChange={(event) => {
                            const nextMin = Number(event.target.value);
                            setMinPriceDraft(String(Math.min(nextMin, sliderMaxValue)));
                          }}
                          className="absolute inset-x-0 top-[-8px] h-[20px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3B82F6] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(59,130,246,0.25)]"
                        />
                        <input
                          type="range"
                          min={absoluteMinPrice}
                          max={absoluteMaxPrice}
                          value={sliderMaxValue}
                          onChange={(event) => {
                            const nextMax = Number(event.target.value);
                            setMaxPriceDraft(String(Math.max(nextMax, sliderMinValue)));
                          }}
                          className="absolute inset-x-0 top-[-8px] h-[20px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[20px] [&::-webkit-slider-thumb]:w-[20px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3B82F6] [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_10px_rgba(59,130,246,0.25)]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-[12px] px-[18px] pt-[18px]">
                    <label className="block">
                      <span className="mb-[8px] block text-[14px] font-medium text-[#12303B]">Minimum</span>
                      <div className="flex items-center rounded-[16px] border border-[#AFC1D3] bg-white px-[14px] py-[14px] focus-within:border-[#12303B]">
                        <span className="text-[18px] font-medium text-[#8C99A8]">€</span>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={minPriceDraft}
                          onChange={(event) => setMinPriceDraft(event.target.value)}
                          className="w-full bg-transparent pl-[10px] text-[18px] font-medium text-[#12303B] outline-none placeholder:text-[#8C99A8]"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-[8px] block text-[14px] font-medium text-[#12303B]">Maximum</span>
                      <div className="flex items-center rounded-[16px] border border-[#AFC1D3] bg-white px-[14px] py-[14px] focus-within:border-[#12303B]">
                        <span className="text-[18px] font-medium text-[#8C99A8]">€</span>
                        <input
                          type="number"
                          min={0}
                          placeholder={absoluteMaxPrice.toString()}
                          value={maxPriceDraft}
                          onChange={(event) => setMaxPriceDraft(event.target.value)}
                          className="w-full bg-transparent pl-[10px] text-[18px] font-medium text-[#12303B] outline-none placeholder:text-[#8C99A8]"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="px-[18px] pt-[16px] pb-[18px]">
                    <button
                      type="button"
                      onClick={() => {
                        setMinPriceDraft("");
                        setMaxPriceDraft("");
                        updateSearchFilters({ minPrice: null, maxPrice: null });
                        setPriceOpen(false);
                      }}
                      className="rounded-[16px] border border-[#AFC1D3] px-[18px] py-[11px] text-[14px] font-semibold text-[#12303B] hover:bg-[#F7FAFC]"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMin = minPriceDraft.trim() ? Number(minPriceDraft) : null;
                        const nextMax = maxPriceDraft.trim() ? Number(maxPriceDraft) : null;
                        const sanitizedMin = nextMin !== null && Number.isFinite(nextMin)
                          ? Math.max(absoluteMinPrice, Math.min(nextMin, absoluteMaxPrice))
                          : null;
                        const sanitizedMax = nextMax !== null && Number.isFinite(nextMax)
                          ? Math.max(absoluteMinPrice, Math.min(nextMax, absoluteMaxPrice))
                          : null;
                        const safeMin = sanitizedMin !== null && sanitizedMax !== null
                          ? Math.min(sanitizedMin, sanitizedMax)
                          : sanitizedMin;
                        const safeMax = sanitizedMin !== null && sanitizedMax !== null
                          ? Math.max(sanitizedMin, sanitizedMax)
                          : sanitizedMax;
                        updateSearchFilters({
                          minPrice: safeMin,
                          maxPrice: safeMax,
                        });
                        setPriceOpen(false);
                      }}
                      className="rounded-[16px] bg-brand-primary px-[18px] py-[11px] text-[14px] font-semibold text-white shadow-[0_10px_22px_rgba(11,165,199,0.24)] hover:bg-brand-primary-dark"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => togglePanel("propertyType")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[12px] border transition-colors flex-shrink-0 ${
                  propertyTypeOpen || selectedPropertyTypes.size > 0
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <span className="text-[#1A1A1A] text-[13px] sm:text-[14px] font-semibold">
                  {selectedPropertyTypes.size > 0 ? `Property type (${selectedPropertyTypes.size})` : "Property type"}
                </span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {propertyTypeOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[280px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[20px] border border-[rgba(11,45,58,0.10)] bg-white shadow-[0_18px_44px_rgba(0,0,0,0.14)] z-50">
                  <div className="px-[18px] pt-[18px] pb-[10px]">
                    <div className="text-[16px] font-semibold text-[#12303B]">Property type</div>
                  </div>
                  <div className="space-y-[2px] px-[10px] pb-[16px]">
                  {PROPERTY_TYPES.map((type) => {
                    const checked = selectedPropertyTypes.has(type);
                    return (
                      <label key={type} className="flex items-center gap-[10px] rounded-[12px] px-[12px] py-[11px] text-[14px] text-[#12303B] cursor-pointer hover:bg-[#F7FAFC]">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="h-[18px] w-[18px] rounded-[4px] border-[#AFC1D3] text-brand-primary focus:ring-brand-primary"
                          onChange={() => {
                            const nextTypes = new Set(selectedPropertyTypes);
                            if (nextTypes.has(type)) {
                              nextTypes.delete(type);
                            } else {
                              nextTypes.add(type);
                            }
                            updateSearchFilters({
                              types: nextTypes.size > 0 ? serializeDelimitedParam([...nextTypes]) : null,
                            });
                          }}
                        />
                        <span className="capitalize font-medium">{type}</span>
                      </label>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>

            {/* Neighborhoods Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => togglePanel("neighborhoods")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[12px] border transition-colors flex-shrink-0 ${
                  neighborhoodsOpen || selectedNeighborhoods.size > 0
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <span className="text-[#1A1A1A] text-[13px] sm:text-[14px] font-semibold">
                  {selectedNeighborhoods.size > 0 ? `Neighborhoods (${selectedNeighborhoods.size})` : "Neighborhoods"}
                </span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {neighborhoodsOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[300px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[20px] border border-[rgba(11,45,58,0.10)] bg-white shadow-[0_18px_44px_rgba(0,0,0,0.14)] z-50">
                  <div className="px-[18px] pt-[18px] pb-[12px]">
                    <div className="text-[16px] font-semibold text-[#12303B]">Neighborhoods</div>
                  </div>
                  <div className="max-h-[268px] overflow-y-auto px-[10px] pb-[10px]">
                    {neighborhoodOptions.length === 0 && (
                      <div className="text-[13px] text-[#6B6B6B] px-[8px] py-[6px]">No neighborhoods available yet.</div>
                    )}
                    {(showAllNeighborhoods ? neighborhoodOptions : neighborhoodOptions.slice(0, 5)).map((neighborhood) => {
                    const checked = selectedNeighborhoods.has(neighborhood);
                    return (
                      <label key={neighborhood} className="flex items-center gap-[10px] rounded-[12px] px-[12px] py-[11px] text-[14px] text-[#12303B] cursor-pointer hover:bg-[#F7FAFC]">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="h-[18px] w-[18px] rounded-[4px] border-[#AFC1D3] text-brand-primary focus:ring-brand-primary"
                          onChange={() => {
                            const nextNeighborhoods = new Set(selectedNeighborhoods);
                            if (nextNeighborhoods.has(neighborhood)) {
                              nextNeighborhoods.delete(neighborhood);
                            } else {
                              nextNeighborhoods.add(neighborhood);
                            }
                            updateSearchFilters({
                              neighborhoods: nextNeighborhoods.size > 0 ? serializeDelimitedParam([...nextNeighborhoods]) : null,
                            });
                          }}
                        />
                        <span className="font-medium">{neighborhood}</span>
                      </label>
                    );
                    })}
                  </div>
                  {neighborhoodOptions.length > 5 && (
                    <div className="px-[18px] pb-[18px]">
                      <button
                        type="button"
                        onClick={() => setShowAllNeighborhoods((prev) => !prev)}
                        className="inline-flex items-center gap-[8px] text-[14px] font-semibold text-[#12303B] underline decoration-[#12303B] underline-offset-[4px]"
                      >
                        {showAllNeighborhoods ? "Show less" : "Show all"}
                        <ChevronDown className={`h-[16px] w-[16px] transition-transform ${showAllNeighborhoods ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* All Filters Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => togglePanel("all")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[12px] border transition-colors flex-shrink-0 ${
                  allFiltersOpen
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <SlidersHorizontal className="w-[16px] h-[16px] text-[#1A1A1A]" />
                <span className="text-[#1A1A1A] text-[13px] sm:text-[14px] font-semibold">All filters</span>
                {activeFilters > 0 && (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#1A1A1A] flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold">{activeFilters}</span>
                  </div>
                )}
              </button>
              {allFiltersOpen && (
                <></>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-[8px] pb-[10px] flex-wrap overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-[6px] px-[10px] py-[6px] bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] text-[#1A1A1A] text-[12px] font-semibold hover:bg-[#EEF2F7]"
                >
                  <span>{chip.label}</span>
                  <X className="w-[12px] h-[12px]" />
                </button>
              ))}
            </div>
          )}

          {/* Tenant Type Tabs */}
          <div className="flex items-center gap-[18px] md:gap-[32px] border-t border-[rgba(0,0,0,0.08)] pt-[8px] pb-[8px] overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setActiveTab("anyone")}
              className={`pb-[12px] text-[14px] font-semibold transition-colors ${
                activeTab === "anyone"
                  ? "text-[#1A1A1A] border-b-[3px] border-[#1A1A1A]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              Anyone
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`pb-[12px] text-[14px] font-semibold transition-colors ${
                activeTab === "students"
                  ? "text-[#1A1A1A] border-b-[3px] border-[#1A1A1A]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("professionals")}
              className={`pb-[12px] text-[14px] font-semibold transition-colors ${
                activeTab === "professionals"
                  ? "text-[#1A1A1A] border-b-[3px] border-[#1A1A1A]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              Professionals
            </button>
            <button
              onClick={() => setActiveTab("families")}
              className={`pb-[12px] text-[14px] font-semibold transition-colors ${
                activeTab === "families"
                  ? "text-[#1A1A1A] border-b-[3px] border-[#1A1A1A]"
                  : "text-[#6B6B6B] hover:text-[#1A1A1A]"
              }`}
            >
              Families
            </button>
          </div>
        </div>
      </div>

      {allFiltersOpen && (
        <>
          <button
            type="button"
            aria-label="Close all filters overlay"
            onClick={() => setAllFiltersOpen(false)}
            className="fixed inset-0 z-[1300] bg-[rgba(16,26,34,0.52)]"
          />
          <aside
            className={isMobile
              ? "fixed inset-x-0 bottom-0 z-[1310] max-h-[86vh] overflow-y-auto rounded-t-[24px] border border-[rgba(11,45,58,0.14)] bg-white shadow-[0_-14px_36px_rgba(0,0,0,0.24)]"
              : "fixed right-0 top-0 z-[1310] h-full w-full max-w-[740px] overflow-y-auto border-l border-[rgba(11,45,58,0.14)] bg-white shadow-[-12px_0_36px_rgba(0,0,0,0.24)]"
            }
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#DDE6EE] bg-white px-[16px] py-[14px]">
              <h2 className="text-[24px] font-bold text-[#12303B]">Filters</h2>
              <button
                type="button"
                onClick={() => setAllFiltersOpen(false)}
                className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full text-[#12303B] hover:bg-[#F3F7FB]"
                aria-label="Close all filters"
              >
                <X className="h-[20px] w-[20px]" />
              </button>
            </div>

            <div className="space-y-[20px] px-[16px] py-[14px]">
              <section>
                <div className="mb-[10px] flex items-center justify-between gap-[10px]">
                  <h4 className="text-[18px] font-bold text-[#12303B]">Monthly rent</h4>
                  <button
                    type="button"
                    className="inline-flex items-center gap-[6px] rounded-[12px] border border-[#AFC1D3] bg-white px-[12px] py-[7px] text-[13px] font-semibold text-[#12303B]"
                  >
                    Euros (€)
                    <ChevronDown className="h-[14px] w-[14px] text-[#12303B]" />
                  </button>
                </div>

                <div className="rounded-[14px] border border-[#E6EDF3] bg-[#FCFEFF] px-[10px] pt-[12px] pb-[10px]">
                  <img
                    src={priceSliderGraph}
                    alt="Price trend graph"
                    className="h-[98px] w-full object-cover rounded-[10px]"
                  />

                  <div className="relative mt-[10px] px-[2px]">
                    <div className="h-[3px] rounded-full bg-[#D5E2ED]" />
                    <div
                      className="absolute top-0 h-[3px] rounded-full bg-[#103947]"
                      style={{ left: `${sliderMinPercent}%`, width: `${Math.max(0, sliderMaxPercent - sliderMinPercent)}%` }}
                    />

                    <input
                      type="range"
                      min={absoluteMinPrice}
                      max={absoluteMaxPrice}
                      value={sliderMinValue}
                      onChange={(event) => {
                        const nextMin = Number(event.target.value);
                        setMinPriceDraft(String(Math.min(nextMin, sliderMaxValue)));
                      }}
                      className="absolute inset-x-0 top-[-8px] h-[20px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3B82F6] [&::-webkit-slider-thumb]:bg-white"
                    />
                    <input
                      type="range"
                      min={absoluteMinPrice}
                      max={absoluteMaxPrice}
                      value={sliderMaxValue}
                      onChange={(event) => {
                        const nextMax = Number(event.target.value);
                        setMaxPriceDraft(String(Math.max(nextMax, sliderMinValue)));
                      }}
                      className="absolute inset-x-0 top-[-8px] h-[20px] w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#3B82F6] [&::-webkit-slider-thumb]:bg-white"
                    />
                  </div>
                </div>

                <div className="mt-[12px] grid grid-cols-2 gap-[10px]">
                  <label className="block">
                    <span className="mb-[6px] block text-[12px] font-medium text-[#12303B]">Minimum</span>
                    <div className="flex items-center rounded-[12px] border border-[#AFC1D3] bg-white px-[12px] py-[10px]">
                      <span className="text-[16px] font-medium text-[#8C99A8]">€</span>
                      <input
                        type="number"
                        min={0}
                        max={15000}
                        value={minPriceDraft}
                        onChange={(event) => setMinPriceDraft(event.target.value)}
                        placeholder="0"
                        className="w-full bg-transparent pl-[8px] text-[16px] font-medium text-[#12303B] outline-none placeholder:text-[#8C99A8]"
                      />
                    </div>
                  </label>
                  <label className="block">
                    <span className="mb-[6px] block text-[12px] font-medium text-[#12303B]">Maximum</span>
                    <div className="flex items-center rounded-[12px] border border-[#AFC1D3] bg-white px-[12px] py-[10px]">
                      <span className="text-[16px] font-medium text-[#8C99A8]">€</span>
                      <input
                        type="number"
                        min={0}
                        max={15000}
                        value={maxPriceDraft}
                        onChange={(event) => setMaxPriceDraft(event.target.value)}
                        placeholder="15000"
                        className="w-full bg-transparent pl-[8px] text-[16px] font-medium text-[#12303B] outline-none placeholder:text-[#8C99A8]"
                      />
                    </div>
                  </label>
                </div>
              </section>

              <section>
                <h4 className="mb-[8px] text-[18px] font-bold text-[#12303B]">Property type</h4>
                <div className="grid grid-cols-1 gap-[2px] sm:grid-cols-2">
                  {PROPERTY_TYPES.map((type) => {
                    const checked = selectedPropertyTypes.has(type);
                    return (
                      <label key={`sidebar-${type}`} className="flex items-center gap-[8px] rounded-[10px] px-[10px] py-[9px] text-[14px] text-[#12303B] cursor-pointer hover:bg-[#F7FAFC]">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="h-[16px] w-[16px] rounded-[4px] border-[#AFC1D3] text-brand-primary focus:ring-brand-primary"
                          onChange={() => {
                            const nextTypes = new Set(selectedPropertyTypes);
                            if (nextTypes.has(type)) {
                              nextTypes.delete(type);
                            } else {
                              nextTypes.add(type);
                            }
                            updateSearchFilters({
                              types: nextTypes.size > 0 ? serializeDelimitedParam([...nextTypes]) : null,
                            });
                          }}
                        />
                        <span className="capitalize font-medium">{type}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section>
                <h4 className="mb-[8px] text-[18px] font-bold text-[#12303B]">Neighborhoods</h4>
                <div className="max-h-[180px] overflow-y-auto">
                  {(allFiltersShowAllNeighborhoods ? neighborhoodOptions : neighborhoodOptions.slice(0, 8)).map((neighborhood) => {
                    const checked = selectedNeighborhoods.has(neighborhood);
                    return (
                      <label key={`sidebar-neighborhood-${neighborhood}`} className="flex items-center gap-[8px] rounded-[10px] px-[10px] py-[9px] text-[14px] text-[#12303B] cursor-pointer hover:bg-[#F7FAFC]">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="h-[16px] w-[16px] rounded-[4px] border-[#AFC1D3] text-brand-primary focus:ring-brand-primary"
                          onChange={() => {
                            const nextNeighborhoods = new Set(selectedNeighborhoods);
                            if (nextNeighborhoods.has(neighborhood)) {
                              nextNeighborhoods.delete(neighborhood);
                            } else {
                              nextNeighborhoods.add(neighborhood);
                            }
                            updateSearchFilters({
                              neighborhoods: nextNeighborhoods.size > 0 ? serializeDelimitedParam([...nextNeighborhoods]) : null,
                            });
                          }}
                        />
                        <span className="font-medium">{neighborhood}</span>
                      </label>
                    );
                  })}
                </div>
                {neighborhoodOptions.length > 8 && (
                  <button
                    type="button"
                    onClick={() => setAllFiltersShowAllNeighborhoods((prev) => !prev)}
                    className="mt-[6px] inline-flex items-center gap-[6px] text-[13px] font-semibold text-[#12303B] underline decoration-[#12303B] underline-offset-[4px]"
                  >
                    {allFiltersShowAllNeighborhoods ? "Show less" : "Show all"}
                    <ChevronDown className={`h-[14px] w-[14px] transition-transform ${allFiltersShowAllNeighborhoods ? "rotate-180" : ""}`} />
                  </button>
                )}
              </section>
            </div>

            <div className="sticky bottom-0 border-t border-[#DDE6EE] bg-white px-[16px] py-[12px]">
              <div className="flex items-center justify-between gap-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                    setAllFiltersOpen(false);
                  }}
                  className="rounded-[12px] border border-[#AFC1D3] px-[14px] py-[9px] text-[13px] font-semibold text-[#12303B] hover:bg-[#F7FAFC]"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMin = minPriceDraft.trim() ? Number(minPriceDraft) : null;
                    const nextMax = maxPriceDraft.trim() ? Number(maxPriceDraft) : null;
                    const sanitizedMin = nextMin !== null && Number.isFinite(nextMin)
                      ? Math.max(absoluteMinPrice, Math.min(nextMin, absoluteMaxPrice))
                      : null;
                    const sanitizedMax = nextMax !== null && Number.isFinite(nextMax)
                      ? Math.max(absoluteMinPrice, Math.min(nextMax, absoluteMaxPrice))
                      : null;
                    const safeMin = sanitizedMin !== null && sanitizedMax !== null
                      ? Math.min(sanitizedMin, sanitizedMax)
                      : sanitizedMin;
                    const safeMax = sanitizedMin !== null && sanitizedMax !== null
                      ? Math.max(sanitizedMin, sanitizedMax)
                      : sanitizedMax;

                    updateSearchFilters({
                      minPrice: safeMin,
                      maxPrice: safeMax,
                    });
                    setAllFiltersOpen(false);
                  }}
                  className="rounded-[12px] bg-brand-primary px-[14px] py-[9px] text-[13px] font-semibold text-white shadow-[0_10px_22px_rgba(11,165,199,0.24)] hover:bg-brand-primary-dark"
                >
                  Apply filters
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      

      {/* Breadcrumb */}
      <div className="bg-[#F4F7FA] border-b border-[#E3E8EE]">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px] py-[14px] sm:py-[16px]">
          <div className="flex items-center gap-[8px] text-[13px]">
            <Link to="/" className="text-[#0891B2] hover:underline font-semibold">
              ReserveHousing
            </Link>
            <span className="text-[#6B6B6B]">&gt;</span>
            <span className="text-[#1A1A1A] font-semibold">
              {cityLabel} Housing
            </span>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div id="results-header" className="bg-white border-b border-[#E3E8EE]">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px] py-[18px] sm:py-[24px]">
          <div className="flex flex-col gap-[14px] sm:flex-row sm:items-center sm:justify-between sm:gap-[20px]">
            <h1 className="text-[#1A1A1A] text-[16px] sm:text-[20px] font-semibold leading-[1.35]">
              {filteredProperties.length} listings for rent in {cityLabel} ({listingTypeBreakdown})
            </h1>

            <div className="ml-0 sm:ml-auto flex items-center gap-[10px]">
              <div ref={sortMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((prev) => !prev)}
                  className={`inline-flex items-center justify-between gap-[8px] w-full sm:min-w-[190px] rounded-[14px] px-[14px] sm:px-[16px] py-[10px] sm:py-[12px] border text-[13px] sm:text-[14px] font-semibold transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#12303B] border-[#12303B]"
                      : "bg-white text-[#12303B] border-[rgba(11,45,58,0.24)] hover:border-[#12303B]"
                  }`}
                >
                  <div className="flex items-center gap-[8px]">
                    <SlidersHorizontal className="w-[16px] h-[16px]" />
                    <span>{sortLabelByOption[sortOption]}</span>
                  </div>
                  <ChevronDown className="w-[16px] h-[16px]" />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-[8px] min-w-[240px] max-w-[calc(100vw-24px)] overflow-hidden rounded-[18px] bg-white border border-[rgba(11,45,58,0.12)] shadow-[0_18px_44px_rgba(0,0,0,0.14)] z-50">
                    {sortOptions.map((option) => {
                      const isActive = sortOption === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelectSort(option.value)}
                          className={`w-full flex items-center justify-between px-[16px] py-[12px] text-[18px] text-left transition-colors ${
                            isActive
                              ? "text-[#12303B] bg-[#EDF3F8]"
                              : "text-[#12303B] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <span>{option.label}</span>
                          {isActive && <Check className="w-[16px] h-[16px]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {viewMode !== "map" && (
                <button
                  type="button"
                  onClick={handleShowMap}
                  className="inline-flex items-center justify-center gap-[8px] min-w-[104px] rounded-[12px] px-[14px] py-[10px] sm:px-[16px] sm:py-[12px] border text-[13px] sm:text-[14px] font-semibold transition-colors bg-white text-[#1A1A1A] border-[rgba(0,0,0,0.14)] hover:border-[rgba(0,0,0,0.24)]"
                >
                  <Map className="w-[16px] h-[16px]" />
                  <span>Map</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div id="results-content" className="bg-[#F4F7FA]">
        <div className={`max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[32px] py-[18px] sm:py-[24px] lg:py-[32px] ${isSplitMapMode ? "xl:pb-[20px]" : ""}`}>
          {(viewMode === "list" || viewMode === "map") && (
            <div className={viewMode === "map" ? (isMapExpanded ? "" : "grid grid-cols-1 xl:grid-cols-[58%_42%] xl:gap-0 items-start") : ""}>
              <div className={viewMode === "map" ? (isMapExpanded ? "hidden" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[16px] xl:pr-[24px] xl:border-r xl:border-[rgba(0,0,0,0.10)] xl:max-h-[calc(100vh-140px)] xl:overflow-y-auto xl:overscroll-contain") : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px] sm:gap-[20px]"}>
              {isLoading &&
                Array.from({ length: viewMode === "map" ? 6 : 8 }, (_, index) => (
                  <div key={`listing-skeleton-${index}`} className="animate-pulse">
                    <SearchListingCardSkeleton />
                  </div>
                ))}
              {!isLoading && sortedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setPropertyDatePickerId(property.id)}
                  className="group cursor-pointer overflow-hidden rounded-[12px] border border-[rgba(15,45,54,0.16)] bg-white transition-shadow duration-200 hover:shadow-[0_10px_24px_rgba(15,45,54,0.10)]"
                >
                  {/* Image Container */}
                  <div 
                    className="relative overflow-hidden group/carousel"
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
                      src={resolveListingImageUrl(
                        getListingCardImages(property.id, property.images)[carouselImagesByListingId[property.id] ?? 0],
                        apiBase
                      )}
                      alt={property.title}
                      className="w-full h-[192px] sm:h-[220px] object-cover object-center bg-[#F3F4F6]"
                    />
                    
                    {/* New Badge */}
                    {!property.images[1] && (
                      <div className="absolute top-[12px] left-[12px] rounded-full bg-[#38BDF8] px-[12px] py-[5px] shadow-[0_8px_18px_rgba(56,189,248,0.32)]">
                        <span className="text-[11px] font-bold tracking-[0.04em] text-white">NEW</span>
                      </div>
                    )}

                    {/* Left Arrow */}
                    {getListingCardImages(property.id, property.images).length > 1 && (carouselImagesByListingId[property.id] ?? 0) > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
                          e.stopPropagation();
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
                        e.stopPropagation();
                        void handleToggleFavoriteWithSplash(property.id);
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

                  {/* Property Info */}
                  <div className="px-[14px] sm:px-[16px] pt-[12px] sm:pt-[14px] pb-[12px]">
                    {/* Title */}
                    <h3 className="mb-[8px] text-[15px] sm:text-[16px] font-semibold leading-[1.25] text-[#12303B] line-clamp-2">
                      {property.title}, {property.city}
                    </h3>

                    {/* Rating */}
                    <div className="mb-[8px] flex items-center gap-[4px]">
                      <Star className="w-[14px] h-[14px] text-[#0891B2] fill-[#0891B2]" />
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">Live</span>
                      <span className="text-[#6B6B6B] text-[14px]">listing</span>
                    </div>

                    {/* Size and Housemates */}
                    <div className="mb-[12px] flex items-center gap-[12px] text-[12px] sm:text-[13px] text-[#3E5963]">
                      <div className="flex items-center gap-[4px]">
                        <HomeIcon className="w-[14px] h-[14px]" />
                        <span>{property.area} m²</span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        <Users className="w-[14px] h-[14px]" />
                        <span>{property.bedrooms} bedrooms</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-[10px] flex items-baseline gap-[4px]">
                      <span className="text-[17px] sm:text-[18px] font-bold text-[#12303B]">€{property.monthlyRent}</span>
                      <span className="text-[13px] sm:text-[14px] text-[#4F6771]">/month, excl. utilities</span>
                    </div>

                    {/* Availability */}
                    <div className="mt-[8px] flex items-center gap-[8px] border-t border-[rgba(15,45,54,0.12)] pt-[12px] text-[13px] sm:text-[14px] font-semibold text-[#12303B]">
                      <div className="h-[10px] w-[10px] rounded-full bg-[#17A45A]" />
                      <span>Available from {new Date(property.availableFrom).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {viewMode === "map" && (
                <div className={`${isMapExpanded ? "fixed inset-x-0 bottom-0 top-[132px] md:top-[154px] z-[90] flex flex-col" : "xl:sticky xl:top-[88px] xl:pl-[24px]"} overflow-hidden rounded-[16px] border border-[#E3E8EE] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}>
                  <div className="relative">
                    <div className={`w-full ${isMapExpanded ? "h-[calc(100vh-206px)] md:h-[calc(100vh-228px)] min-h-[460px]" : "h-[68vh] min-h-[520px] xl:h-[calc(100vh-152px)]"} bg-[#E6EEF5]`}>
                      {isLoading ? (
                        <div className="w-full h-full animate-pulse p-[24px]">
                          <div className="h-full w-full bg-[#DCE6F0]" />
                        </div>
                      ) : mapPoints.length > 0 ? (
                        <MapContainer
                          center={mapPoints[0]}
                          zoom={12}
                          scrollWheelZoom
                          zoomControl={false}
                          className="w-full h-full"
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <InvalidateMapSize isExpanded={isMapExpanded} />
                          <FitMapToMarkers points={mapPoints} resetSignal={mapResetSignal} />
                          {mappedListings.map((property) => (
                            <Marker
                              key={property.id}
                              position={[property.coordinates.lat, property.coordinates.lng]}
                              icon={createPriceMarkerIcon(property.monthlyRent)}
                              eventHandlers={{
                                click: (event) => {
                                  setHoveredMapListingId(property.id);
                                  event.target.openPopup();
                                },
                                popupclose: (event) => {
                                  setHoveredMapListingId((prev) => (prev === property.id ? null : prev));
                                  event.target.closePopup();
                                },
                              }}
                            >
                              <Popup closeButton offset={[0, -18]} autoPan>
                                <div className="w-[280px]">
                                  <img
                                    src={resolveListingImageUrl(property.images[0], apiBase)}
                                    alt={property.title}
                                    className="w-full h-[120px] object-cover bg-[#F3F4F6] mb-[10px]"
                                  />
                                  <div className="text-[#1A1A1A] text-[16px] font-bold leading-tight mb-[6px] line-clamp-2">
                                    {property.title}
                                  </div>
                                  <div className="text-[#6B6B6B] text-[12px] mb-[8px] line-clamp-1">
                                    {property.address}, {property.city}
                                  </div>
                                  <div className="text-[#1A1A1A] text-[26px] font-bold mb-[8px]">
                                    {formatMarkerPrice(property.monthlyRent)}
                                    <span className="text-[#6B6B6B] text-[13px] font-medium"> /month</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => navigate(`/property/${property.id}`)}
                                    className="w-full px-[12px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors"
                                  >
                                    View listing
                                  </button>
                                </div>
                              </Popup>
                            </Marker>
                          ))}
                        </MapContainer>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-[14px]">
                          {isGeocoding ? "Loading map locations..." : "No map locations available for these filters yet."}
                        </div>
                      )}
                    </div>
                    <div className="absolute top-[18px] left-[18px] right-[18px] z-[1200] flex items-center justify-between gap-[10px] pointer-events-none">
                      <button
                        type="button"
                        onClick={() => setIsMapExpanded((prev) => !prev)}
                        className="pointer-events-auto inline-flex items-center gap-[8px] rounded-[12px] px-[18px] py-[14px] bg-white text-[#12303B] text-[14px] font-semibold border border-[rgba(0,0,0,0.08)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:bg-[#F7F7F9] transition-colors z-[1201]"
                      >
                        <ChevronLeft className="w-[16px] h-[16px]" />
                        {isMapExpanded ? "View list" : "Expand map"}
                      </button>
                      <button
                        type="button"
                        onClick={handleShowRecommended}
                        className="pointer-events-auto inline-flex items-center gap-[8px] rounded-[12px] px-[18px] py-[14px] bg-white text-[#12303B] text-[14px] font-semibold border border-[rgba(0,0,0,0.08)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:bg-[#F7F7F9] transition-colors z-[1201]"
                      >
                        <X className="w-[16px] h-[16px]" />
                        Close map
                      </button>
                    </div>
                  </div>
                  <div className="p-[14px] border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between gap-[12px] flex-wrap">
                    <div className="text-[13px] text-[#6B6B6B]">
                      Showing {mappedListings.length} mapped listings in {cityLabel}
                    </div>
                    <button
                      type="button"
                      onClick={handleResetMapView}
                      className="px-[14px] py-[8px] bg-[#1A1A1A] text-white text-[13px] font-semibold hover:bg-[#0F172A] transition-colors"
                    >
                      Reset map
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {!isLoading && filteredProperties.length === 0 && (
            <div className="text-center text-[#6B6B6B] text-[14px] py-[40px]">
              {activeFilters > 0
                ? "No listings match your current filters."
                : requestedStartDate
                ? "No live listings match the selected dates yet."
                : "No live listings found for this city yet."}
            </div>
          )}
        </div>
      </div>

      {/* Property Date Picker Modal */}
      {propertyDatePickerId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-[20px]">
          <div className="bg-white rounded-[12px] shadow-[0_20px_40px_rgba(0,0,0,0.16)] w-full max-w-[500px] p-[32px]">
            <h2 className="text-[20px] font-semibold text-[#1A1A1A] mb-[24px]">Select dates for this property</h2>
            
            <div className="space-y-[20px] mb-[32px]">
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-[8px]">Check-in date</label>
                <input
                  type="date"
                  value={propertyDatePickerStart}
                  onChange={(e) => setPropertyDatePickerStart(e.target.value)}
                  className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] rounded-[6px] text-[14px] font-medium text-[#1A1A1A]"
                />
              </div>
              
              <div>
                <label className="block text-[14px] font-medium text-[#1A1A1A] mb-[8px]">Check-out date</label>
                <input
                  type="date"
                  value={propertyDatePickerEnd}
                  onChange={(e) => setPropertyDatePickerEnd(e.target.value)}
                  className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] rounded-[6px] text-[14px] font-medium text-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="flex gap-[12px]">
              <button
                type="button"
                onClick={() => {
                  setPropertyDatePickerId(null);
                  setPropertyDatePickerStart("");
                  setPropertyDatePickerEnd("");
                }}
                className="flex-1 px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-[14px] font-semibold text-[#1A1A1A] rounded-[6px] hover:bg-[#F7F7F9] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePropertyDateSelection}
                className="flex-1 px-[16px] py-[12px] bg-[#0891B2] text-white text-[14px] font-semibold rounded-[6px] hover:bg-[#0E7490] transition-colors disabled:bg-[#CCCCCC] disabled:cursor-not-allowed"
                disabled={!propertyDatePickerStart || !propertyDatePickerEnd}
              >
                View property
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer variant="dashboard" />
    </div>
  );
}