import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
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

export function SearchResults() {
  const { city } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const apiBase = API_BASE;
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [dateOpen, setDateOpen] = useState(false);
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
  const [minBedroomsDraft, setMinBedroomsDraft] = useState("");
  const [mapResetSignal, setMapResetSignal] = useState(0);
  const [carouselImagesByListingId, setCarouselImagesByListingId] = useState<Record<string, number>>({});
  const [favoriteSplashById, setFavoriteSplashById] = useState<Set<string>>(new Set());
  const filtersRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const requestedStartDate = useMemo(() => parseFilterDate(searchParams.get("startDate")), [searchParams]);
  const requestedEndDate = useMemo(() => parseFilterDate(searchParams.get("endDate")), [searchParams]);
  const startDateValue = searchParams.get("startDate") ?? "";
  const endDateValue = searchParams.get("endDate") ?? "";
  const minPrice = useMemo(() => parseNumberParam(searchParams.get("minPrice")), [searchParams]);
  const maxPrice = useMemo(() => parseNumberParam(searchParams.get("maxPrice")), [searchParams]);
  const minBedrooms = useMemo(() => parseNumberParam(searchParams.get("minBedrooms")), [searchParams]);
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
    setMinBedroomsDraft(minBedrooms !== null ? String(minBedrooms) : "");
  }, [maxPrice, minBedrooms, minPrice]);

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
    ["startDate", "endDate", "minPrice", "maxPrice", "types", "neighborhoods", "minBedrooms"].forEach((key) => {
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

    if (dateOpen || priceOpen || propertyTypeOpen || neighborhoodsOpen || allFiltersOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [allFiltersOpen, dateOpen, neighborhoodsOpen, priceOpen, propertyTypeOpen]);

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

      if (minBedrooms !== null && property.bedrooms < minBedrooms) {
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
    minBedrooms,
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
    if (minBedrooms !== null) count += 1;
    return count;
  }, [maxPrice, minBedrooms, minPrice, requestedEndDate, requestedStartDate, selectedNeighborhoods.size, selectedPropertyTypes.size]);
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

    if (minBedrooms !== null) {
      chips.push({
        key: "bedrooms",
        label: `${minBedrooms}+ bedrooms`,
        clear: () => updateSearchFilters({ minBedrooms: null }),
      });
    }

    return chips;
  }, [
    dateRangeLabel,
    maxPrice,
    minBedrooms,
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

        const payload = (await response.json()) as { listingIds: string[] };
        setFavoriteListingIds(new Set(payload.listingIds));
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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Filter Bar */}
      <div data-results-filter-bar="true" className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-[64px] z-40">
        <div ref={filtersRef} className="max-w-[1440px] mx-auto px-[32px]">
          {/* Top Filter Row */}
          <div className="flex items-center gap-[12px] py-[14px] flex-wrap">
            {/* Date Display */}
            <div className="relative">
              <button
                type="button"
                onClick={() => togglePanel("date")}
                className={`flex items-center gap-[8px] text-[#1A1A1A] text-[14px] px-[12px] py-[8px] border transition-colors ${
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
                <div className="absolute top-full left-0 mt-[8px] w-[320px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-[16px] z-50">
                  <div className="text-[13px] font-semibold text-[#1A1A1A] mb-[10px]">Select your stay dates</div>
                  <div className="grid grid-cols-2 gap-[10px] mb-[12px]">
                    <label className="text-[12px] text-[#6B6B6B]">
                      Move in
                      <input
                        type="date"
                        value={startDateValue}
                        max={endDateValue || undefined}
                        onChange={(event) => {
                          const nextStart = event.target.value;
                          updateSearchFilters({ startDate: nextStart || null });
                        }}
                        className="mt-[4px] w-full border border-[rgba(0,0,0,0.12)] px-[10px] py-[8px] text-[13px] outline-none"
                      />
                    </label>
                    <label className="text-[12px] text-[#6B6B6B]">
                      Move out
                      <input
                        type="date"
                        value={endDateValue}
                        min={startDateValue || undefined}
                        onChange={(event) => {
                          const nextEnd = event.target.value;
                          updateSearchFilters({ endDate: nextEnd || null });
                        }}
                        className="mt-[4px] w-full border border-[rgba(0,0,0,0.12)] px-[10px] py-[8px] text-[13px] outline-none"
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => updateSearchFilters({ startDate: null, endDate: null })}
                      className="text-[12px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]"
                    >
                      Clear dates
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateOpen(false)}
                      className="px-[12px] py-[6px] bg-[#1A1A1A] text-white text-[12px] font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Price Dropdown */}
            <div className="relative">
              <button
                onClick={() => togglePanel("price")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] border transition-colors ${
                  priceOpen || minPrice !== null || maxPrice !== null
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <span className="text-[#1A1A1A] text-[14px] font-semibold">{priceLabel}</span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {priceOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[260px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-[16px] z-50">
                  <div className="text-[13px] font-semibold text-[#1A1A1A] mb-[12px]">Monthly rent</div>
                  <div className="flex items-center gap-[8px] mb-[12px]">
                    <input
                      type="number"
                      min={0}
                      placeholder="Min"
                      value={minPriceDraft}
                      onChange={(event) => setMinPriceDraft(event.target.value)}
                      className="w-full border border-[rgba(0,0,0,0.12)] px-[10px] py-[8px] text-[13px] outline-none"
                    />
                    <span className="text-[#6B6B6B]">-</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="Max"
                      value={maxPriceDraft}
                      onChange={(event) => setMaxPriceDraft(event.target.value)}
                      className="w-full border border-[rgba(0,0,0,0.12)] px-[10px] py-[8px] text-[13px] outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setMinPriceDraft("");
                        setMaxPriceDraft("");
                        updateSearchFilters({ minPrice: null, maxPrice: null });
                        setPriceOpen(false);
                      }}
                      className="text-[12px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSearchFilters({
                          minPrice: minPriceDraft.trim() ? Number(minPriceDraft) : null,
                          maxPrice: maxPriceDraft.trim() ? Number(maxPriceDraft) : null,
                        });
                        setPriceOpen(false);
                      }}
                      className="px-[12px] py-[6px] bg-[#1A1A1A] text-white text-[12px] font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => togglePanel("propertyType")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] border transition-colors ${
                  propertyTypeOpen || selectedPropertyTypes.size > 0
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <span className="text-[#1A1A1A] text-[14px] font-semibold">
                  {selectedPropertyTypes.size > 0 ? `Property type (${selectedPropertyTypes.size})` : "Property type"}
                </span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {propertyTypeOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[240px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-[12px] z-50">
                  {PROPERTY_TYPES.map((type) => {
                    const checked = selectedPropertyTypes.has(type);
                    return (
                      <label key={type} className="flex items-center gap-[8px] px-[8px] py-[6px] text-[13px] text-[#1A1A1A] cursor-pointer hover:bg-[#F7F7F9]">
                        <input
                          type="checkbox"
                          checked={checked}
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
                        <span className="capitalize">{type}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Neighborhoods Dropdown */}
            <div className="relative">
              <button
                onClick={() => togglePanel("neighborhoods")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] border transition-colors ${
                  neighborhoodsOpen || selectedNeighborhoods.size > 0
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <span className="text-[#1A1A1A] text-[14px] font-semibold">
                  {selectedNeighborhoods.size > 0 ? `Neighborhoods (${selectedNeighborhoods.size})` : "Neighborhoods"}
                </span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
              {neighborhoodsOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[280px] max-h-[320px] overflow-y-auto bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-[12px] z-50">
                  {neighborhoodOptions.length === 0 && (
                    <div className="text-[13px] text-[#6B6B6B] px-[8px] py-[6px]">No neighborhoods available yet.</div>
                  )}
                  {neighborhoodOptions.map((neighborhood) => {
                    const checked = selectedNeighborhoods.has(neighborhood);
                    return (
                      <label key={neighborhood} className="flex items-center gap-[8px] px-[8px] py-[6px] text-[13px] text-[#1A1A1A] cursor-pointer hover:bg-[#F7F7F9]">
                        <input
                          type="checkbox"
                          checked={checked}
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
                        <span>{neighborhood}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All Filters Button */}
            <div className="relative">
              <button
                onClick={() => togglePanel("all")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] border transition-colors ${
                  allFiltersOpen || minBedrooms !== null
                    ? "border-[#1A1A1A] bg-[#F7F7F9]"
                    : "border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <SlidersHorizontal className="w-[16px] h-[16px] text-[#1A1A1A]" />
                <span className="text-[#1A1A1A] text-[14px] font-semibold">All filters</span>
                {activeFilters > 0 && (
                  <div className="w-[20px] h-[20px] rounded-full bg-[#1A1A1A] flex items-center justify-center">
                    <span className="text-white text-[11px] font-bold">{activeFilters}</span>
                  </div>
                )}
              </button>
              {allFiltersOpen && (
                <div className="absolute top-full left-0 mt-[8px] w-[300px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-[16px] z-50">
                  <div className="text-[13px] font-semibold text-[#1A1A1A] mb-[8px]">Minimum bedrooms</div>
                  <input
                    type="number"
                    min={0}
                    value={minBedroomsDraft}
                    onChange={(event) => setMinBedroomsDraft(event.target.value)}
                    placeholder="e.g. 2"
                    className="w-full border border-[rgba(0,0,0,0.12)] px-[10px] py-[8px] text-[13px] outline-none mb-[12px]"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-[12px] font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]"
                    >
                      Clear all
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateSearchFilters({
                          minBedrooms: minBedroomsDraft.trim() ? Number(minBedroomsDraft) : null,
                        });
                        setAllFiltersOpen(false);
                      }}
                      className="px-[12px] py-[6px] bg-[#1A1A1A] text-white text-[12px] font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Spacer */}
            <div className="flex-1" />
          </div>

          {activeFilterChips.length > 0 && (
            <div className="flex items-center gap-[8px] pb-[10px] flex-wrap">
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
          <div className="flex items-center gap-[32px] border-t border-[rgba(0,0,0,0.08)] pt-[8px] pb-[8px]">
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

      {/* Breadcrumb */}
      <div className="bg-[#F7F7F9] border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[16px]">
          <div className="flex items-center gap-[8px] text-[13px]">
            <Link to="/" className="text-[#0891B2] hover:underline font-semibold">
              EasyRent
            </Link>
            <span className="text-[#6B6B6B]">&gt;</span>
            <span className="text-[#1A1A1A] font-semibold">
              {cityLabel} Housing
            </span>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div id="results-header" className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[24px]">
          <div className="flex items-center justify-between gap-[20px] flex-wrap">
            <h1 className="text-[#1A1A1A] text-[20px] font-semibold">
              {filteredProperties.length} rooms, studios and apartments for rent in {cityLabel}
            </h1>

            <div className="ml-auto flex items-center gap-[10px]">
              <div ref={sortMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((prev) => !prev)}
                  className={`inline-flex items-center justify-between gap-[8px] min-w-[190px] px-[16px] py-[12px] border text-[14px] font-semibold transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-[#1A1A1A] border-[rgba(0,0,0,0.20)]"
                      : "bg-white text-[#1A1A1A] border-[rgba(0,0,0,0.14)] hover:border-[rgba(0,0,0,0.24)]"
                  }`}
                >
                  <div className="flex items-center gap-[8px]">
                    <SlidersHorizontal className="w-[16px] h-[16px]" />
                    <span>{sortLabelByOption[sortOption]}</span>
                  </div>
                  <ChevronDown className="w-[16px] h-[16px]" />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 mt-[4px] min-w-[220px] bg-white border border-[rgba(0,0,0,0.14)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50">
                    {sortOptions.map((option) => {
                      const isActive = sortOption === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelectSort(option.value)}
                          className={`w-full flex items-center justify-between px-[14px] py-[10px] text-[15px] text-left transition-colors ${
                            isActive
                              ? "text-[#12303B] bg-[#F1F5F9]"
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
                  className="inline-flex items-center justify-center gap-[8px] min-w-[120px] px-[16px] py-[12px] border text-[14px] font-semibold transition-colors bg-white text-[#1A1A1A] border-[rgba(0,0,0,0.14)] hover:border-[rgba(0,0,0,0.24)]"
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
      <div id="results-content" className="bg-white">
        <div className={`max-w-[1440px] mx-auto px-[32px] py-[32px] ${isSplitMapMode ? "xl:pb-[20px]" : ""}`}>
          {(viewMode === "list" || viewMode === "map") && (
            <div className={viewMode === "map" ? (isMapExpanded ? "" : "grid grid-cols-1 xl:grid-cols-[58%_42%] xl:gap-0 items-start") : ""}>
              <div className={viewMode === "map" ? (isMapExpanded ? "hidden" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px] xl:pr-[24px] xl:border-r xl:border-[rgba(0,0,0,0.10)] xl:max-h-[calc(100vh-140px)] xl:overflow-y-auto xl:overscroll-contain") : "grid grid-cols-4 gap-[24px]"}>
              {sortedProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="cursor-pointer group"
                >
                  {/* Image Container */}
                  <div 
                    className="relative mb-[12px] overflow-hidden group/carousel"
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
                      className="w-full h-[220px] object-cover object-center bg-[#F3F4F6]"
                    />
                    
                    {/* New Badge */}
                    {!property.images[1] && (
                      <div className="absolute top-[12px] left-[12px] bg-[#2563EB] text-white px-[12px] py-[4px]">
                        <span className="text-[12px] font-bold uppercase tracking-[0.05em]">New</span>
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
                  <div className="space-y-[8px]">
                    {/* Title */}
                    <h3 className="text-[#1A1A1A] text-[16px] font-bold leading-tight line-clamp-1">
                      {property.title}, {property.city}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-[4px]">
                      <Star className="w-[14px] h-[14px] text-[#0891B2] fill-[#0891B2]" />
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">Live</span>
                      <span className="text-[#6B6B6B] text-[14px]">listing</span>
                    </div>

                    {/* Size and Housemates */}
                    <div className="flex items-center gap-[12px] text-[#6B6B6B] text-[13px]">
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
                    <div className="flex items-baseline gap-[4px]">
                      <span className="text-[#1A1A1A] text-[18px] font-bold">€{property.monthlyRent}</span>
                      <span className="text-[#6B6B6B] text-[13px]">/month, excl. utilities</span>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-[6px]">
                      <div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]" />
                      <span className="text-[#1A1A1A] text-[13px] font-semibold">Available from {new Date(property.availableFrom).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </div>
              ))}
              </div>

              {viewMode === "map" && (
                <div className={`${isMapExpanded ? "fixed inset-x-0 bottom-0 top-[132px] md:top-[154px] z-[90] flex flex-col" : "xl:sticky xl:top-[76px] xl:-mt-[102px] xl:pl-[24px]"} border border-[rgba(0,0,0,0.08)] overflow-hidden bg-white`}>
                  <div className="relative">
                    <div className={`w-full ${isMapExpanded ? "h-[calc(100vh-206px)] md:h-[calc(100vh-228px)] min-h-[460px]" : "h-[68vh] min-h-[520px] xl:h-[calc(100vh-152px)]"} bg-[#E6EEF5]`}>
                      {mapPoints.length > 0 ? (
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
                        className="pointer-events-auto inline-flex items-center gap-[8px] px-[18px] py-[14px] bg-white text-[#12303B] text-[14px] font-semibold border border-[rgba(0,0,0,0.08)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:bg-[#F7F7F9] transition-colors rounded-[4px] z-[1201]"
                      >
                        <ChevronLeft className="w-[16px] h-[16px]" />
                        {isMapExpanded ? "View list" : "Expand map"}
                      </button>
                      <button
                        type="button"
                        onClick={handleShowRecommended}
                        className="pointer-events-auto inline-flex items-center gap-[8px] px-[18px] py-[14px] bg-white text-[#12303B] text-[14px] font-semibold border border-[rgba(0,0,0,0.08)] shadow-[0_8px_20px_rgba(0,0,0,0.08)] hover:bg-[#F7F7F9] transition-colors rounded-[4px] z-[1201]"
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

      <Footer />
    </div>
  );
}