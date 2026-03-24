import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { 
  ChevronDown,
  Calendar,
  MapPin,
  Users,
  Home as HomeIcon,
  Heart,
  Bell,
  Star,
  SlidersHorizontal,
  X,
  Map
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE } from "../config";
import { toast } from "sonner";

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
  const [properties, setProperties] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteListingIds, setFavoriteListingIds] = useState<Set<string>>(new Set());
  const [favoriteBusyId, setFavoriteBusyId] = useState<string | null>(null);
  const [minPriceDraft, setMinPriceDraft] = useState("");
  const [maxPriceDraft, setMaxPriceDraft] = useState("");
  const [minBedroomsDraft, setMinBedroomsDraft] = useState("");
  const filtersRef = useRef<HTMLDivElement>(null);
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

        const payload = (await response.json()) as { listings: ListingItem[] };
        setProperties(payload.listings);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Filter Bar */}
      <div className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-[64px] z-40">
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

            {/* Get Alerts Button */}
            <button className="flex items-center gap-[8px] px-[24px] py-[10px] bg-[#1A1A1A] text-white font-semibold hover:bg-[#0891B2] transition-colors">
              <Bell className="w-[16px] h-[16px]" />
              Get alerts
            </button>
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
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[24px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[#1A1A1A] text-[20px] font-semibold">
              {filteredProperties.length} rooms, studios and apartments for rent in {cityLabel}
            </h1>

            <div className="flex items-center gap-[8px]">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] border transition-colors ${
                  viewMode === "list"
                    ? "bg-[#F7F7F9] border-[rgba(0,0,0,0.16)]"
                    : "bg-white border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <HomeIcon className="w-[16px] h-[16px] text-[#1A1A1A]" />
                <span className="text-[#1A1A1A] text-[14px] font-semibold">Recommended</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] border transition-colors ${
                  viewMode === "map"
                    ? "bg-[#F7F7F9] border-[rgba(0,0,0,0.16)]"
                    : "bg-white border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)]"
                }`}
              >
                <Map className="w-[16px] h-[16px] text-[#1A1A1A]" />
                <span className="text-[#1A1A1A] text-[14px] font-semibold">Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[32px]">
          <div className="grid grid-cols-4 gap-[24px]">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => navigate(`/property/${property.id}`)}
                className="cursor-pointer group"
              >
                {/* Image Container */}
                <div className="relative mb-[12px] overflow-hidden">
                  <img
                    src={resolveListingImageUrl(property.images[0], apiBase)}
                    alt={property.title}
                    className="w-full h-[220px] object-cover object-center bg-[#F3F4F6]"
                  />
                  
                  {/* New Badge */}
                  {!property.images[1] && (
                    <div className="absolute top-[12px] left-[12px] bg-[#2563EB] text-white px-[12px] py-[4px]">
                      <span className="text-[12px] font-bold uppercase tracking-[0.05em]">New</span>
                    </div>
                  )}

                  {/* Favorite Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleToggleFavorite(property.id);
                    }}
                    type="button"
                    disabled={favoriteBusyId === property.id}
                    aria-label={favoriteListingIds.has(property.id) ? "Remove from favorites" : "Add to favorites"}
                    className="absolute top-[12px] right-[12px] w-[32px] h-[32px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Heart
                      className={`w-[16px] h-[16px] ${
                        favoriteListingIds.has(property.id)
                          ? "fill-[#FF4B27] text-[#FF4B27]"
                          : "text-[#1A1A1A]"
                      }`}
                    />
                  </button>

                  {/* Image Dots */}
                  <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
                    {Array.from({ length: getImageDotCount(property.images) }, (_, index) => (
                      <div
                        key={index}
                        className={`w-[6px] h-[6px] rounded-full ${
                          index === 0 ? "bg-white" : "bg-white/40"
                        }`}
                      />
                    ))}
                  </div>
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