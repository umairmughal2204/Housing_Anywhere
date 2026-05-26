import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { Heart, MapPin, MessageCircle, User as UserIcon } from "lucide-react";
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
            <div className="grid grid-cols-1 gap-[24px] md:grid-cols-2 xl:grid-cols-4">
              {favorites.map((property) => (
                <div
                  key={property.id}
                  className="group overflow-hidden rounded-[8px] border border-[rgba(15,45,54,0.16)] bg-white transition-shadow duration-200 hover:shadow-[0_10px_24px_rgba(15,45,54,0.10)]"
                >
                  {/* Image */}
                  <Link to={`/listing/${property.id}`} className="block">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#F7F7F9]">
                      <img
                        src={property.image || fallbackImage}
                        alt={property.title}
                        className="w-full h-full object-cover object-center"
                      />
                      <button
                        onClick={(e) => { e.preventDefault(); void removeFavorite(property.id); }}
                        className="absolute top-[12px] right-[12px] w-[32px] h-[32px] bg-white/90 hover:bg-white flex items-center justify-center transition-colors rounded-full"
                        aria-label="Remove from favorites"
                      >
                        <Heart className="w-[16px] h-[16px] fill-[#0891B2] text-[#0891B2]" />
                      </button>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="px-[16px] pt-[14px] pb-[12px]">
                    <Link to={`/listing/${property.id}`}>
                      <h3 className="mb-[10px] line-clamp-2 text-[16px] font-semibold leading-[1.25] text-[#12303B] hover:text-brand-primary transition-colors">
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
                      disabled={openingConversationFor === property.id}
                      className="mt-[10px] w-full flex items-center justify-center gap-[6px] px-[14px] py-[9px] border border-[rgba(15,45,54,0.16)] text-[#12303B] text-[13px] font-semibold hover:bg-[#F7F9FC] transition-colors rounded-[8px]"
                    >
                      <MessageCircle className="w-[14px] h-[14px]" />
                      {openingConversationFor === property.id ? "Opening..." : "Message landlord"}
                    </button>
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
                to="/listings/berlin"
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
