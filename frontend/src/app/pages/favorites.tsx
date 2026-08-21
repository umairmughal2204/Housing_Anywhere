import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Heart, MapPin, MessageCircle, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { API_BASE } from "../config";
import { toast } from "sonner";
import { useAuth } from "../contexts/auth-context";

interface FavoriteListing {
  id: string;
  title: string;
  city: string;
  address: string;
  monthlyRent: number;
  bedrooms: number;
  area: number;
  availableFrom: string;
  image: string;
}

const fallbackImage = "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200";

export function Favorites() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openingConversationFor, setOpeningConversationFor] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/me/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Failed to load favorites");
        }

        const payload = (await response.json()) as { favorites: FavoriteListing[] };
        setFavorites(payload.favorites);
      } catch {
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadFavorites();
  }, []);

  const removeFavorite = async (listingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    setFavorites((prev) => prev.filter((item) => item.id !== listingId));

    const response = await fetch(`${API_BASE}/api/auth/me/favorites/${listingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      // Restore on failure.
      toast.error("Could not remove favorite. Please try again.");
      setIsLoading(true);
      try {
        const refresh = await fetch(`${API_BASE}/api/auth/me/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (refresh.ok) {
          const payload = (await refresh.json()) as { favorites: FavoriteListing[] };
          setFavorites(payload.favorites);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.success("Removed from favorites");
    }
  };

  const openConversation = async (listingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate(`/login?returnTo=/favorites`);
      return;
    }

    setOpeningConversationFor(listingId);
    try {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        toast.error("Could not open chat right now");
        navigate("/tenant/inbox");
        return;
      }

      const payload = (await response.json()) as { conversationId: string };
      toast.success("Opening chat");
      navigate(`/tenant/inbox/conversation/${payload.conversationId}`);
    } catch {
      toast.error("Could not open chat right now");
      navigate("/tenant/inbox");
    } finally {
      setOpeningConversationFor(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6FA]">
      <Header variant={isAuthenticated ? "dashboard" : "default"} dashboardButtonFilled={false} />
      
      <main className="flex-1 py-[64px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          {/* Header */}
          <div className="mb-[36px] rounded-[24px] bg-[#0F2D36] p-[28px] text-white border border-[rgba(255,255,255,0.06)] shadow-sm">
            <h1 className="text-[34px] font-bold tracking-[-0.02em] mb-[8px]">Your Favorites</h1>
            <p className="text-[14px] text-white/90 font-medium">
              {isLoading ? "Loading your saved homes..." : `${favorites.length} saved properties ready for your next move`}
            </p>
          </div>

          {/* Favorites Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-4 animate-pulse">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#E8EDF2] rounded-t-[24px]" />
                  <div className="px-[16px] pt-[14px] pb-[12px]">
                    <div className="mb-[6px] h-[16px] w-[85%] rounded-[4px] bg-[#E8EDF2]" />
                    <div className="mb-[10px] h-[16px] w-[55%] rounded-[4px] bg-[#E8EDF2]" />
                    <div className="mb-[12px] flex items-center gap-[12px]">
                      <div className="h-[13px] w-[60px] rounded-[4px] bg-[#E8EDF2]" />
                      <div className="h-[13px] w-[80px] rounded-[4px] bg-[#E8EDF2]" />
                    </div>
                    <div className="mb-[10px] h-[18px] w-[70%] rounded-[4px] bg-[#E8EDF2]" />
                    <div className="mt-[8px] flex items-center gap-[8px] border-t border-[rgba(15,45,54,0.12)] pt-[12px]">
                      <div className="h-[10px] w-[10px] rounded-full bg-[#E8EDF2]" />
                      <div className="h-[13px] w-[65%] rounded-[4px] bg-[#E8EDF2]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-4">
              {favorites.map((property) => (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-[24px] border border-[rgba(0,0,0,0.06)] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[2px]"
                >
                  {/* Image */}
                  <Link to={`/listing/${property.id}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F7F9] rounded-t-[24px]">
                      <img
                        src={property.image || fallbackImage}
                        alt={property.title}
                        className="w-full h-full object-cover object-center bg-[#F3F4F6]"
                      />
                      <button
                        onClick={(e) => { e.preventDefault(); void removeFavorite(property.id); }}
                        className="absolute top-[12px] right-[12px] w-[36px] h-[36px] bg-white hover:bg-white/95 flex items-center justify-center transition-all rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:scale-105 active:scale-95 z-10"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="w-[18px] h-[18px] fill-red-500 text-red-500" />
                      </button>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="px-[16px] pt-[14px] pb-[12px]">
                    <Link to={`/listing/${property.id}`}>
                      <h3 className="mb-[10px] line-clamp-2 text-[16px] font-semibold leading-[1.25] text-[#12303B] hover:text-[#0D263B] transition-colors">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="mb-[12px] flex items-center gap-[12px] text-[13px] text-[#3E5963]">
                      <div className="flex items-center gap-[4px]"><MapPin className="h-[12px] w-[12px]" /><span>{property.area} m²</span></div>
                      <div className="flex items-center gap-[4px]"><UserIcon className="h-[12px] w-[12px]" /><span>{property.bedrooms} bedrooms</span></div>
                    </div>
                    <div className="mb-[10px] flex items-baseline gap-[4px]">
                      <span className="text-[18px] font-bold text-[#12303B]">€{property.monthlyRent.toLocaleString()}</span>
                      <span className="text-[14px] text-[#4F6771]">/month</span>
                    </div>
                    <div className="mt-[8px] flex items-center gap-[8px] border-t border-[rgba(15,45,54,0.12)] pt-[12px] text-[14px] font-semibold text-[#12303B]">
                      <div className="h-[10px] w-[10px] rounded-full bg-[#17A45A] flex-shrink-0" />
                      Available from {new Date(property.availableFrom).toLocaleDateString("en-GB")}
                    </div>

                    {/* Message button */}
                    <button
                      onClick={() => void openConversation(property.id)}
                      disabled={openingConversationFor === property.id || user?.role === "landlord"}
                      title={user?.role === "landlord" ? "Landlords cannot message about listings" : undefined}
                      className="mt-[12px] w-full flex items-center justify-center gap-[6px] px-[14px] py-[9px] border border-[rgba(15,45,54,0.16)] text-[#12303B] text-[13px] font-bold hover:bg-[#F7F9FC] transition-colors rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                      <MessageCircle className="w-[14px] h-[14px]" />
                      {openingConversationFor === property.id ? "Opening..." : "Message landlord"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[24px] p-[64px] text-center shadow-sm">
              <Heart className="w-[64px] h-[64px] text-[#94A3B8] mx-auto mb-[24px]" />
              <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[12px]">
                No Favorites Yet
              </h2>
              <p className="text-[#6B7280] text-[15px] mb-[32px] max-w-[500px] mx-auto leading-[1.6]">
                Start saving properties you love to keep track of them and get notifications when they become available.
              </p>
              <Link
                to="/listings"
                className="inline-block px-[28px] py-[12px] bg-[#0F2D36] hover:bg-[#081B20] text-white font-bold transition-colors rounded-full shadow-md text-[14px]"
              >
                Browse Properties
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
