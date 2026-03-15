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
  User as UserIcon
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";

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

const cities = [
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

function toDateQueryValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function resolveCityQuery(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return null;
  }

  const exactMatch = cities.find((city) => city.name.toLowerCase() === normalizedQuery);
  if (exactMatch) {
    return exactMatch.name;
  }

  const startsWithMatch = cities.find((city) => city.name.toLowerCase().startsWith(normalizedQuery));
  if (startsWithMatch) {
    return startsWithMatch.name;
  }

  const partialNameMatch = cities.find((city) => city.name.toLowerCase().includes(normalizedQuery));
  if (partialNameMatch) {
    return partialNameMatch.name;
  }

  const countryMatch = cities.find((city) => city.country.toLowerCase().includes(normalizedQuery));
  return countryMatch?.name ?? query.trim();
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

export function Home() {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const [searchCity, setSearchCity] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(new Date(2026, 2, 1)); // March 1, 2026
  const [endDate, setEndDate] = useState<Date | null>(new Date(2026, 5, 1)); // June 1, 2026
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommendations" | "recently" | "favorites">("recently");
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recentlyViewed, setRecentlyViewed] = useState<HomeListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  useEffect(() => {
    const loadHomeListings = async () => {
      if (!isAuthenticated) {
        setRecentlyViewed([]);
        return;
      }

      setIsLoadingListings(true);
      try {
        const response = await fetch(`${apiBase}/api/listings`);
        if (!response.ok) {
          throw new Error("Failed to load home listings");
        }

        const payload = (await response.json()) as { listings: HomeListing[] };
        setRecentlyViewed(payload.listings.slice(0, 3));
      } catch {
        setRecentlyViewed([]);
      } finally {
        setIsLoadingListings(false);
      }
    };

    void loadHomeListings();
  }, [apiBase, isAuthenticated]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites([]);
        return;
      }
      const token = localStorage.getItem("authToken");
      if (!token) return;
      setIsLoadingFavorites(true);
      try {
        const response = await fetch(`${apiBase}/api/auth/me/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to load favorites");
        const payload = (await response.json()) as { favorites: FavoriteListing[] };
        setFavorites(payload.favorites);
      } catch {
        setFavorites([]);
      } finally {
        setIsLoadingFavorites(false);
      }
    };
    void loadFavorites();
  }, [apiBase, isAuthenticated]);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedCity = resolveCityQuery(searchCity);
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
      pathname: `/s/${resolvedCity.toLowerCase()}`,
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

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchCity.toLowerCase()) ||
    city.country.toLowerCase().includes(searchCity.toLowerCase())
  );

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
                          <img
                            src={city.image}
                            alt={city.name}
                            className="w-full h-full object-cover"
                          />
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
                {isLoadingListings && (
                  <div className="text-[#6B6B6B] text-[14px] py-[8px]">Loading properties...</div>
                )}
                <div className="grid grid-cols-3 gap-[24px]">
                  {recentlyViewed.map((property) => (
                    <Link
                      key={property.id}
                      to={`/listing/${property.id}`}
                      className="group bg-white hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F9]">
                        <img
                          src={property.images[0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                          alt={property.title}
                          className="w-full h-full object-contain object-center bg-[#F3F4F6]"
                        />
                        {Date.now() - new Date(property.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7 && (
                          <div className="absolute top-[12px] left-[12px] bg-[#FFD93D] text-[#1A1A1A] px-[8px] py-[4px] text-[11px] font-bold uppercase tracking-[0.05em] flex items-center gap-[4px]">
                            <Star className="w-[10px] h-[10px] fill-current" />
                            New
                          </div>
                        )}
                        <div className="absolute bottom-[12px] left-0 right-0 flex items-center justify-center gap-[4px]">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <div key={dot} className={`w-[6px] h-[6px] rounded-full ${dot === 1 ? "bg-white" : "bg-white/40"}`} />
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
                {!isLoadingListings && recentlyViewed.length === 0 && (
                  <div className="text-[#6B6B6B] text-[14px] py-[8px]">No live listings available yet.</div>
                )}
              </>
            )}

            {activeTab === "favorites" && (
              <>
                {isLoadingFavorites && (
                  <div className="text-[#6B6B6B] text-[14px] py-[8px]">Loading favorites...</div>
                )}
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
                          className="w-full h-full object-contain object-center bg-[#F3F4F6]"
                        />
                        <div className="absolute bottom-[12px] left-0 right-0 flex items-center justify-center gap-[4px]">
                          {[1, 2, 3, 4, 5].map((dot) => (
                            <div key={dot} className={`w-[6px] h-[6px] rounded-full ${dot === 1 ? "bg-white" : "bg-white/40"}`} />
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
              to="/s/berlin"
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
                to={`/s/${city.name.toLowerCase()}`}
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