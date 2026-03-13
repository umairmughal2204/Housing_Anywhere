import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Heart, MapPin, MessageCircle, CalendarDays, BedDouble, Ruler } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { API_BASE } from "../config";
import { toast } from "sonner";

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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-[#F5F6FA] py-[64px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          {/* Header */}
          <div className="mb-[36px] rounded-[16px] bg-gradient-to-r from-[#0E7490] to-[#155E75] p-[28px] text-white border border-[rgba(255,255,255,0.15)]">
            <h1 className="text-[34px] font-bold tracking-[-0.02em] mb-[8px]">Your Favorites</h1>
            <p className="text-[14px] text-white/90">
              {isLoading ? "Loading your saved homes..." : `${favorites.length} saved properties ready for your next move`}
            </p>
          </div>

          {/* Favorites Grid */}
          {favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {favorites.map((property) => (
                <div key={property.id} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] overflow-hidden group hover:shadow-[0_14px_36px_rgba(0,0,0,0.12)] transition-shadow">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={property.image || fallbackImage}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => void removeFavorite(property.id)}
                      className="absolute top-[16px] right-[16px] w-[40px] h-[40px] bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart className="w-[20px] h-[20px] text-[#FF4B27] fill-[#FF4B27]" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-[24px]">
                    <Link to={`/property/${property.id}`}>
                      <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[8px] hover:text-brand-primary transition-colors leading-[1.3]">
                        {property.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-[8px] text-[#6B6B6B] text-[14px] mb-[16px]">
                      <MapPin className="w-[14px] h-[14px]" />
                      {property.address}, {property.city}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-[16px] mb-[16px] pb-[16px] border-b border-[rgba(0,0,0,0.08)]">
                      <div className="flex items-center gap-[6px] text-[#6B6B6B] text-[14px]">
                        <BedDouble className="w-[14px] h-[14px]" />
                        {property.bedrooms} bed
                      </div>
                      <div className="w-[4px] h-[4px] bg-[#6B6B6B] rounded-full"></div>
                      <div className="flex items-center gap-[6px] text-[#6B6B6B] text-[14px]">
                        <Ruler className="w-[14px] h-[14px]" />
                        {property.area}m²
                      </div>
                    </div>

                    {/* Price & Availability */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-brand-primary text-[24px] font-bold">
                          €{property.monthlyRent.toLocaleString()}
                        </div>
                        <div className="text-[#6B6B6B] text-[12px]">per month</div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-[5px] text-[#008A52] text-[12px] font-semibold">
                          <CalendarDays className="w-[12px] h-[12px]" />
                          {new Date(property.availableFrom).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-[8px] mt-[16px] pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                      <Link
                        to={`/property/${property.id}`}
                        className="flex-1 px-[16px] py-[10px] bg-brand-primary text-white text-[14px] font-semibold text-center hover:bg-brand-primary-dark transition-colors rounded-[8px]"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => void openConversation(property.id)}
                        disabled={openingConversationFor === property.id}
                        className="px-[16px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] font-semibold hover:bg-[#F7F7F9] transition-colors rounded-[8px] inline-flex items-center gap-[6px]"
                      >
                        <MessageCircle className="w-[14px] h-[14px]" />
                        {openingConversationFor === property.id ? "Opening..." : "Message"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] p-[64px] text-center">
              <Heart className="w-[64px] h-[64px] text-[#6B6B6B] mx-auto mb-[24px]" />
              <h2 className="text-[#1A1A1A] text-[24px] font-bold mb-[16px]">
                No Favorites Yet
              </h2>
              <p className="text-[#6B6B6B] text-[16px] mb-[32px] max-w-[500px] mx-auto">
                Start saving properties you love to keep track of them and get notifications when they become available.
              </p>
              <Link
                to="/s/berlin"
                className="inline-block px-[24px] py-[12px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors rounded-[8px]"
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
