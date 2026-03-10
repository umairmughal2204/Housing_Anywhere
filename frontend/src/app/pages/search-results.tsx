import { useParams, Link, useNavigate } from "react-router";
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
import { useState } from "react";

// Mock property data matching the design
const mockProperties = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1594295800284-990f74bb6928?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkaW8lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMDg5NTY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Boulevard Michelet",
    location: "Noisy-le-Sec",
    rating: 3.9,
    reviews: 23,
    size: 11,
    housemates: 11,
    price: 425,
    available: "Available now",
    isNew: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1743008019164-2d810a54915e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYmVkcm9vbSUyMGFwYXJ0bWVudCUyMHJlbnRhbHxlbnwxfHx8fDE3NzMwNTA5MTN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Rue Clément Ader",
    location: "Rosny-sous-Bois",
    rating: null,
    reviews: null,
    size: 13,
    housemates: 6,
    price: 600,
    available: "Available now",
    isNew: false,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1730789442056-76dbcaab7dd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXNoZWQlMjBhcGFydG1lbnQlMjBsaXZpbmclMjBzcGFjZXxlbnwxfHx8fDE3NzMwODk1NjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Rue Louis Lebrun",
    location: "Sarcelles",
    rating: 4.5,
    reviews: 10,
    size: 10,
    housemates: 4,
    price: 580,
    available: "Available from 16 March",
    isNew: false,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlnaHQlMjBzdHVkZW50JTIwYXBhcnRtZW50JTIwcm9vbXxlbnwxfHx8fDE3NzMwODk1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Boulevard Michelet",
    location: "Noisy-le-Sec",
    rating: 3.9,
    reviews: 23,
    size: 22,
    housemates: 11,
    price: 605,
    available: "Available now",
    isNew: true,
  },
  {
    id: "5",
    image: "https://images.unsplash.com/photo-1611234688667-76b6d8fadd75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGFyZWQlMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwbWluaW1hbHxlbnwxfHx8fDE3NzMwODk1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Avenue Jean Jaurès",
    location: "Pantin",
    rating: 4.2,
    reviews: 15,
    size: 15,
    housemates: 5,
    price: 550,
    available: "Available now",
    isNew: false,
  },
  {
    id: "6",
    image: "https://images.unsplash.com/photo-1769063238167-d00e112147c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFwYXJ0bWVudCUyMHJvb20lMjBpbnRlcmlvcnxlbnwxfHx8fDE3NzMwODk1NjV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Rue du Général Leclerc",
    location: "Montreuil",
    rating: 4.7,
    reviews: 32,
    size: 18,
    housemates: 7,
    price: 620,
    available: "Available now",
    isNew: true,
  },
  {
    id: "7",
    image: "https://images.unsplash.com/photo-1760067538068-03d10481bacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHlsaXNoJTIwYmVkcm9vbSUyMHJlbnRhbCUyMHByb3BlcnR5fGVufDF8fHx8MTc3MzA4OTU2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Boulevard de Strasbourg",
    location: "Saint-Denis",
    rating: 3.8,
    reviews: 19,
    size: 14,
    housemates: 6,
    price: 490,
    available: "Available from 1 April",
    isNew: false,
  },
  {
    id: "8",
    image: "https://images.unsplash.com/photo-1771328756051-dff10c3feaab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwdmlld3xlbnwxfHx8fDE3NzMwODk1NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Private room in Rue Victor Hugo",
    location: "Aubervilliers",
    rating: 4.1,
    reviews: 27,
    size: 16,
    housemates: 8,
    price: 575,
    available: "Available now",
    isNew: false,
  },
];

export function SearchResults() {
  const { city } = useParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [priceOpen, setPriceOpen] = useState(false);
  const [propertyTypeOpen, setPropertyTypeOpen] = useState(false);
  const [neighborhoodsOpen, setNeighborhoodsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(3);
  const [activeTab, setActiveTab] = useState<"anyone" | "students" | "professionals" | "families">("anyone");

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
              <span className="font-semibold">9 Mar – 1 Jun 2026</span>
              <span className="text-[#6B6B6B]">(1 week)</span>
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
              <div className="w-[20px] h-[20px] rounded-full bg-[#1A1A1A] flex items-center justify-center">
                <span className="text-white text-[11px] font-bold">{activeFilters}</span>
              </div>
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
              {city ? `${city.charAt(0).toUpperCase() + city.slice(1)} Housing` : "Noisy-le-Sec Housing"}
            </span>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[24px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[#1A1A1A] text-[20px] font-semibold">
              667 rooms, studios and apartments for rent in {city ? city.charAt(0).toUpperCase() + city.slice(1) : "Noisy-le-Sec"}, France
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
            {mockProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => navigate(`/property/${property.id}`)}
                className="cursor-pointer group"
              >
                {/* Image Container */}
                <div className="relative mb-[12px] overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-[220px] object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* New Badge */}
                  {property.isNew && (
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
                    {property.title}, {property.location}
                  </h3>

                  {/* Rating */}
                  {property.rating && (
                    <div className="flex items-center gap-[4px]">
                      <Star className="w-[14px] h-[14px] text-[#0891B2] fill-[#0891B2]" />
                      <span className="text-[#1A1A1A] text-[14px] font-semibold">{property.rating}</span>
                      <span className="text-[#6B6B6B] text-[14px]">({property.reviews})</span>
                    </div>
                  )}

                  {/* Size and Housemates */}
                  <div className="flex items-center gap-[12px] text-[#6B6B6B] text-[13px]">
                    <div className="flex items-center gap-[4px]">
                      <HomeIcon className="w-[14px] h-[14px]" />
                      <span>{property.size} m²</span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <Users className="w-[14px] h-[14px]" />
                      <span>{property.housemates} housemates</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-[4px]">
                    <span className="text-[#1A1A1A] text-[18px] font-bold">€{property.price}</span>
                    <span className="text-[#6B6B6B] text-[13px]">/month, excl. utilities</span>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-[6px]">
                    <div className="w-[6px] h-[6px] rounded-full bg-[#2563EB]" />
                    <span className="text-[#1A1A1A] text-[13px] font-semibold">{property.available}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}