import { useParams, Link, useNavigate, useSearchParams } from "react-router";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { 
  ChevronDown,
  MapPin,
  Users,
  Home as HomeIcon,
  Heart,
  Bell,
  Star,
  SlidersHorizontal,
  Map
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ListingItem {
  id: string;
  title: string;
  city: string;
  area: number;
  bedrooms: number;
  monthlyRent: number;
  availableFrom: string;
  minStay: number;
  images: string[];
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

export function SearchResults() {
  const { city } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [priceOpen, setPriceOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"anyone" | "students" | "professionals" | "families">("anyone");
  const [properties, setProperties] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestedStartDate = useMemo(() => parseFilterDate(searchParams.get("startDate")), [searchParams]);
  const requestedEndDate = useMemo(() => parseFilterDate(searchParams.get("endDate")), [searchParams]);
  const requestedStayMonths = useMemo(
    () => getRequestedStayMonths(requestedStartDate, requestedEndDate),
    [requestedEndDate, requestedStartDate],
  );
  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!requestedStartDate) {
        return true;
      }

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

      return true;
    });
  }, [properties, requestedStartDate, requestedStayMonths]);
  const activeFilters = requestedStartDate || requestedEndDate ? 1 : 0;
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
  const cityLabel = city ? city.charAt(0).toUpperCase() + city.slice(1) : "All cities";

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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Filter Bar */}
      <div className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-[64px] z-40">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          {/* Top Filter Row */}
          <div className="flex items-center gap-[16px] py-[16px]">
            {/* Date Display */}
            <div className="flex items-center gap-[8px] text-[#1A1A1A] text-[14px]">
              <span className="font-semibold">{dateRangeLabel}</span>
              {stayLengthLabel && <span className="text-[#6B6B6B]">({stayLengthLabel})</span>}
            </div>

            {/* Divider */}
            <div className="w-[1px] h-[24px] bg-[rgba(0,0,0,0.08)]" />

            {/* Price Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] transition-colors"
              >
                <span className="text-[#1A1A1A] text-[14px] font-semibold">Price</span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
            </div>

            {/* Property Type Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPropertyTypeOpen(!propertyTypeOpen)}
                className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] transition-colors"
              >
                <span className="text-[#1A1A1A] text-[14px] font-semibold">Property type</span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
            </div>

            {/* Neighborhoods Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNeighborhoodsOpen(!neighborhoodsOpen)}
                className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] transition-colors"
              >
                <span className="text-[#1A1A1A] text-[14px] font-semibold">Neighborhoods</span>
                <ChevronDown className="w-[16px] h-[16px] text-[#6B6B6B]" />
              </button>
            </div>

            {/* All Filters Button */}
            <button className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] transition-colors">
              <SlidersHorizontal className="w-[16px] h-[16px] text-[#1A1A1A]" />
              <span className="text-[#1A1A1A] text-[14px] font-semibold">All filters</span>
              {activeFilters > 0 && (
                <div className="w-[20px] h-[20px] rounded-full bg-[#1A1A1A] flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">{activeFilters}</span>
                </div>
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Get Alerts Button */}
            <button className="flex items-center gap-[8px] px-[24px] py-[10px] bg-[#1A1A1A] text-white font-semibold hover:bg-[#0891B2] transition-colors">
              <Bell className="w-[16px] h-[16px]" />
              Get alerts
            </button>
          </div>

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
                    src={property.images[0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                    alt={property.title}
                    className="w-full h-[220px] object-contain object-center bg-[#F3F4F6]"
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
                    }}
                    className="absolute top-[12px] right-[12px] w-[32px] h-[32px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                  >
                    <Heart className="w-[16px] h-[16px] text-[#1A1A1A]" />
                  </button>

                  {/* Image Dots */}
                  <div className="absolute bottom-[12px] left-1/2 -translate-x-1/2 flex items-center gap-[4px]">
                    {[1, 2, 3, 4, 5].map((dot) => (
                      <div
                        key={dot}
                        className={`w-[6px] h-[6px] rounded-full ${
                          dot === 1 ? "bg-white" : "bg-white/40"
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
              {requestedStartDate
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