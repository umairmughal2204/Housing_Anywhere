import { Link, useParams, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import {
  Share2,
  Heart,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Play,
  Home as HomeIcon,
  Square,
  Users,
  Sofa,
  Check,
  Calendar,
  MessageCircle,
  Info,
  Wifi,
  Tv,
  AirVent,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";

const fallbackPropertyImages = [
  "https://images.unsplash.com/photo-1649740718655-3c70b0e3d431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGFwYXJ0bWVudCUyMGJlZHJvb20lMjB3aW5kb3d8ZW58MXx8fHwxNzczMDg5ODczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1758548157747-285c7012db5b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZW50YWwlMjByb29tJTIwaW50ZXJpb3IlMjBicmlnaHR8ZW58MXx8fHwxNzczMDg5ODczfDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1767800766429-7179fd80948f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBiZWRyb29tJTIwZGVzayUyMHN0dWR5fGVufDF8fHx8MTc3MzA4OTg3NHww&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1594295800284-990f74bb6928?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzdHVkaW8lMjBhcGFydG1lbnQlMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzczMDg5NTY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
  "https://images.unsplash.com/photo-1730789442056-76dbcaab7dd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXJuaXNoZWQlMjBhcGFydG1lbnQlMjBsaXZpbmclMjBzcGFjZXxlbnwxfHx8fDE3NzMwODk1NjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
];

interface ListingDetails {
  id: string;
  propertyType: "apartment" | "studio" | "house" | "room";
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  monthlyRent: number;
  deposit: number;
  availableFrom: string;
  minStay: number;
  utilitiesIncluded: boolean;
  registrationPossible: boolean;
  amenities: string[];
  houseRules: string[];
  images: string[];
  landlord?: {
    id: string;
    name: string;
    initials: string;
  };
}

export function PropertyListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavoriteBusy, setIsFavoriteBusy] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/listings/${id}`);
        if (!response.ok) {
          throw new Error("Listing not found");
        }

        const payload = (await response.json()) as { listing: ListingDetails };
        setListing(payload.listing);
      } catch {
        setListing(null);
      } finally {
        setIsLoading(false);
      }
    };

    void loadListing();
  }, [apiBase, id]);

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
        const payload = (await response.json()) as { listingIds: string[] };
        setIsFavorited(payload.listingIds.includes(id));
      } catch {
        // Ignore; favorite button remains usable.
      }
    };

    void loadFavoriteState();
  }, [apiBase, id, isAuthenticated]);

  const propertyImages = useMemo(() => {
    if (listing && listing.images.length > 0) {
      return listing.images;
    }
    return fallbackPropertyImages;
  }, [listing]);

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1));
  };

  const handleApplyToRent = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?returnTo=/property/${id}/apply`);
    } else {
      navigate(`/property/${id}/apply`);
    }
  };

  const handleMessageLandlord = async () => {
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[12px]">
          <div className="flex items-center gap-[8px] text-[13px]">
            <Link to="/" className="text-brand-primary hover:underline font-semibold">
              EasyRent
            </Link>
            <span className="text-neutral-gray">&gt;</span>
            <Link to={`/s/${(listing?.city ?? "city").toLowerCase()}`} className="text-brand-primary hover:underline font-semibold">
              {listing?.city ?? "City"}
            </Link>
            <span className="text-neutral-gray">&gt;</span>
            <Link to={`/s/${(listing?.city ?? "city").toLowerCase()}`} className="text-brand-primary hover:underline font-semibold">
              Rooms
            </Link>
            <span className="text-neutral-gray">&gt;</span>
            <span className="text-neutral-black font-semibold">{listing?.title ?? "Listing"}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-[32px] py-[32px]">
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
                  className="w-full h-[480px] object-contain object-center bg-[#F3F4F6]"
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
                  <button className="w-[40px] h-[40px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors">
                    <Share2 className="w-[18px] h-[18px] text-[#1A1A1A]" />
                  </button>
                  <button
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
                <button className="absolute bottom-[16px] left-[16px] flex items-center gap-[8px] bg-white px-[16px] py-[10px] hover:bg-[#F7F7F9] transition-colors">
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
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain object-center bg-[#F3F4F6]" />
                  </button>
                ))}

                {/* More Photos Button */}
                <button className="w-[120px] h-[80px] bg-neutral-black text-white flex flex-col items-center justify-center hover:bg-brand-primary transition-colors">
                  <HomeIcon className="w-[20px] h-[20px] mb-[4px]" />
                  <span className="text-[12px] font-semibold">More photos</span>
                </button>

                {/* Videos Button */}
                <button className="w-[120px] h-[80px] bg-neutral-black text-white flex flex-col items-center justify-center hover:bg-brand-primary transition-colors">
                  <Play className="w-[20px] h-[20px] mb-[4px]" />
                  <span className="text-[12px] font-semibold">Videos</span>
                </button>
              </div>
            </div>

            {/* Property Title & Price */}
            <div className="mb-[24px]">
              <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
                {isLoading ? "Loading..." : listing?.title ?? "Listing unavailable"}
              </h1>
              <div className="flex items-baseline gap-[8px] mb-[16px]">
                <span className="text-[#1A1A1A] text-[28px] font-bold">€{listing?.monthlyRent ?? 0}</span>
                <span className="text-[#6B6B6B] text-[16px]">per month,</span>
                <span className="text-[#6B6B6B] text-[14px] underline cursor-pointer">
                  excludes bills, deposit required
                </span>
              </div>
            </div>

            {/* Property Details Row */}
            <div className="flex flex-wrap items-center gap-x-[24px] gap-y-[16px] pb-[24px] border-b border-[rgba(0,0,0,0.08)] mb-[24px]">
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <HomeIcon className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">{listing?.propertyType ?? "Room"}</span> {listing?.area ?? 0} m²
                </span>
              </div>
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <Square className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">Bedroom</span>
                </span>
              </div>
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <HomeIcon className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">Property:</span> 92 m²
                </span>
              </div>
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <Sofa className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">{listing?.amenities.includes("tv") ? "Furnished" : "Standard"}</span>
                </span>
              </div>
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <Users className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">Space for {listing?.bedrooms ?? 0} bedroom(s)</span>
                </span>
              </div>
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <HomeIcon className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">{listing?.bathrooms ?? 0} bathrooms</span>
                </span>
              </div>
              <div className="flex items-center gap-[8px] text-[#1A1A1A]">
                <Users className="w-[18px] h-[18px] text-[#6B6B6B]" />
                <span className="text-[14px]">
                  <span className="font-semibold">Located in {listing?.city ?? "city"}</span>
                </span>
              </div>
            </div>

            {/* About This Property */}
            <div className="mb-[32px]">
              <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">About this property</h2>
              <div className="text-[#1A1A1A] text-[15px] leading-[1.6] space-y-[16px]">
                <p>
                  {listing?.description ?? "No listing description available."}
                </p>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-[32px]">
              <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">What this place offers</h2>
              <div className="grid grid-cols-2 gap-[16px]">
                {[
                  ...(listing?.amenities.includes("wifi") ? [{ icon: Wifi, label: "High-speed WiFi" }] : []),
                  ...(listing?.amenities.includes("ac") ? [{ icon: AirVent, label: "Air conditioning" }] : []),
                  ...(listing?.amenities.includes("kitchen") ? [{ icon: Utensils, label: "Kitchen" }] : []),
                  ...(listing?.amenities.includes("tv") ? [{ icon: Tv, label: "TV" }] : []),
                  ...(listing?.amenities.includes("washer") ? [{ icon: Check, label: "Washing machine" }] : []),
                  ...(listing?.registrationPossible ? [{ icon: Check, label: "Registration possible" }] : []),
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-[12px]">
                    <item.icon className="w-[18px] h-[18px] text-[#6B6B6B]" />
                    <span className="text-[#1A1A1A] text-[15px]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="mb-[32px]">
              <h2 className="text-neutral-black text-[24px] font-bold mb-[16px]">House rules</h2>
              <div className="bg-neutral-light-gray p-[24px] space-y-[12px]">
                <div className="flex items-start gap-[12px]">
                  <Check className="w-[16px] h-[16px] text-accent-blue mt-[2px]" />
                  <div>
                    <span className="text-neutral-black text-[14px] font-semibold">Minimum stay: </span>
                    <span className="text-neutral-gray text-[14px]">{listing?.minStay ?? 1} months</span>
                  </div>
                </div>
                {listing?.houseRules.map((rule) => (
                  <div key={rule} className="flex items-start gap-[12px]">
                    <Check className="w-[16px] h-[16px] text-accent-blue mt-[2px]" />
                    <div>
                      <span className="text-neutral-black text-[14px] font-semibold">{rule}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="flex-[1]">
            <div className="sticky top-[100px] border border-[rgba(0,0,0,0.08)] p-[24px]">
              {/* Landlord Info */}
              <div className="flex items-center gap-[12px] mb-[24px] pb-[24px] border-b border-[rgba(0,0,0,0.08)]">
                <div className="w-[48px] h-[48px] bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-[18px]">
                  {listing?.landlord?.initials ?? "L"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-[8px] mb-[2px]">
                    <span className="text-neutral-black text-[16px] font-bold">{listing?.landlord?.name ?? "Landlord"}</span>
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <Check className="w-[12px] h-[12px] text-accent-blue" />
                    <span className="text-accent-blue text-[13px] font-semibold">Verified</span>
                  </div>
                </div>
              </div>

              {/* Date Selector */}
              <div className="mb-[24px]">
                <button className="w-full flex items-center gap-[12px] px-[16px] py-[14px] border border-[rgba(0,0,0,0.16)] hover:bg-neutral-light-gray transition-colors">
                  <Calendar className="w-[20px] h-[20px] text-neutral-black" />
                  <div className="flex-1 text-left">
                    <span className="text-neutral-black text-[14px] font-semibold">
                      {listing ? `Available from ${new Date(listing.availableFrom).toLocaleDateString("en-GB")}` : "Select dates"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-[16px] space-y-[12px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-neutral-black text-[14px]">First month's rent</span>
                    <Info className="w-[14px] h-[14px] text-neutral-gray" />
                  </div>
                    <span className="text-neutral-black text-[14px] font-semibold">€{listing?.monthlyRent ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-neutral-black text-[14px]">Tenant Protection</span>
                    <Info className="w-[14px] h-[14px] text-neutral-gray" />
                  </div>
                  <span className="text-neutral-black text-[14px] font-semibold">€{listing?.deposit ?? 0}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-[16px] border-t border-[rgba(0,0,0,0.08)] mb-[16px]">
                <span className="text-neutral-black text-[16px] font-bold">To confirm stay</span>
                <span className="text-neutral-black text-[20px] font-bold">€{(listing?.monthlyRent ?? 0) + (listing?.deposit ?? 0)}</span>
              </div>

              {/* View All Payments */}
              <button className="w-full flex items-center justify-center gap-[8px] text-neutral-black text-[14px] font-semibold mb-[24px] hover:text-brand-primary transition-colors">
                <Calendar className="w-[16px] h-[16px]" />
                View all payments
              </button>

              {/* Apply Button */}
              <button
                onClick={handleApplyToRent}
                className="w-full bg-brand-primary text-white font-bold py-[16px] mb-[24px] hover:bg-brand-primary-dark transition-colors text-[16px]"
              >
                Apply to rent
              </button>

              {/* Not Ready Section */}
              <div className="bg-neutral-light-gray p-[16px] mb-[16px]">
                <h4 className="text-neutral-black text-[14px] font-bold mb-[8px]">Not ready to apply?</h4>
                <p className="text-neutral-gray text-[13px] leading-[1.6] mb-[12px]">
                  Ask the landlord questions, share info, and see if there's a match. Get the answers you 
                  need to rent with peace of mind.
                </p>
              </div>

              {/* Message Landlord */}
              <button
                onClick={handleMessageLandlord}
                className="w-full flex items-center justify-center gap-[8px] border-[2px] border-neutral-black text-neutral-black font-bold py-[14px] hover:bg-neutral-black hover:text-white transition-colors"
              >
                <MessageCircle className="w-[18px] h-[18px]" />
                Message landlord
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}