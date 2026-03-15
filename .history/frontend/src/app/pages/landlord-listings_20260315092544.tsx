import { Link } from "react-router";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { useEffect, useState } from "react";
import { 
  Home,
  MessageSquare,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Calendar,
  Loader2,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type ListingStatus = "active" | "draft" | "inactive";
type ActiveInactiveStatus = "active" | "inactive";

interface Listing {
  id: string;
  propertyType: "apartment" | "studio" | "house" | "room";
  title: string;
  description: string;
  address: string;
  city: string;
  postalCode: string;
  monthlyRent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  availableFrom: string;
  minStay: number;
  utilitiesIncluded: boolean;
  registrationPossible: boolean;
  amenities: string[];
  houseRules: string[];
  status: ListingStatus;
  views: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
}

export function LandlordListings() {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    const loadListings = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view listings");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${apiBase}/api/listings/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load listings");
        }

        const payload = (await response.json()) as { listings: Listing[] };
        setListings(payload.listings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings");
      } finally {
        setIsLoading(false);
      }
    };

    void loadListings();
  }, [apiBase]);

  const handleStatusToggle = async (listingId: string, currentStatus: ListingStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const newStatus: ActiveInactiveStatus = currentStatus === "active" ? "inactive" : "active";
    setUpdatingStatusId(listingId);

    try {
      const response = await fetch(`${apiBase}/api/listings/${listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to update status");
      }

      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: newStatus } : l))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async (listingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to delete listings");
      return;
    }

    const confirmed = window.confirm("Delete this listing permanently?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${apiBase}/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to delete listing");
      }

      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing");
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesStatus = filterStatus === "all" || listing.status === filterStatus;
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    inactive: listings.filter((l) => l.status === "inactive").length,
  };

  return (
    <LandlordPortalLayout>
      {/* Main Content */}
      <main className="flex-1 p-[32px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-[32px]">
          <div>
            <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
              Listings
            </h1>
            <p className="text-neutral-gray text-[16px]">
              Manage your property listings
            </p>
          </div>
          <Link
            to="/landlord/listings/add"
            className="flex items-center gap-[8px] bg-brand-primary text-white px-[24px] py-[12px] font-semibold hover:bg-brand-primary-dark transition-colors"
          >
            <Plus className="w-[16px] h-[16px]" />
            Create New Listing
          </Link>
        </div>

        {isLoading && (
          <div className="mb-[16px] text-[14px] text-neutral-gray">Loading listings...</div>
        )}
        {!isLoading && error && (
          <div className="mb-[16px] text-[14px] text-brand-primary font-semibold">{error}</div>
        )}

        {/* Filters and Search */}
        <div className="bg-white border border-[rgba(0,0,0,0.08)] mb-[24px]">
          <div className="px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between gap-[16px]">
            <div className="flex items-center gap-[16px] flex-1">
              <div className="flex items-center gap-[12px] bg-neutral-light-gray px-[16px] py-[10px] flex-1 max-w-[400px]">
                <Search className="w-[16px] h-[16px] text-neutral-gray" />
                <input
                  type="text"
                  placeholder="Search by title or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-neutral-black text-[14px] placeholder:text-neutral-gray"
                />
              </div>

              <div className="flex items-center gap-[8px]">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-[16px] py-[8px] text-[14px] font-semibold transition-colors ${
                    filterStatus === "all"
                      ? "bg-brand-primary text-white"
                      : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
                  }`}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setFilterStatus("active")}
                  className={`px-[16px] py-[8px] text-[14px] font-semibold transition-colors ${
                    filterStatus === "active"
                      ? "bg-brand-primary text-white"
                      : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
                  }`}
                >
                  Active ({statusCounts.active})
                </button>
                <button
                  onClick={() => setFilterStatus("inactive")}
                  className={`px-[16px] py-[8px] text-[14px] font-semibold transition-colors ${
                    filterStatus === "inactive"
                      ? "bg-brand-primary text-white"
                      : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
                  }`}
                >
                  Inactive ({statusCounts.inactive})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 gap-[24px]">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white border border-[rgba(0,0,0,0.08)] hover:border-[rgba(0,0,0,0.16)] transition-colors">
              <div className="flex gap-[24px] p-[24px]">
                {/* Image */}
                <div className="w-[240px] h-[180px] flex-shrink-0 overflow-hidden bg-neutral-light-gray">
                  <ImageWithFallback
                    src={listing.images[0] ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"}
                    alt={listing.title}
                    className="w-full h-full object-contain object-center bg-[#F3F4F6]"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-[12px]">
                    <div className="flex-1">
                      <div className="flex items-center gap-[12px] mb-[8px]">
                        <h3 className="text-neutral-black text-[20px] font-bold">
                          {listing.title}
                        </h3>
                        <span className={`px-[12px] py-[4px] text-[12px] font-bold uppercase tracking-[0.05em] ${
                          listing.status === "active"
                            ? "bg-accent-blue/10 text-accent-blue"
                            : "bg-neutral-gray/10 text-neutral-gray"
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-[6px] text-neutral-gray text-[14px] mb-[16px]">
                        <MapPin className="w-[14px] h-[14px]" />
                        <span>{listing.address}, {listing.city}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        void handleStatusToggle(listing.id, listing.status);
                      }}
                      disabled={updatingStatusId === listing.id}
                      title={listing.status === "active" ? "Deactivate listing" : "Activate listing"}
                      className={`inline-flex items-center gap-[8px] px-[14px] py-[8px] rounded-[8px] text-[12px] font-bold uppercase tracking-[0.04em] border transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                        listing.status === "active"
                          ? "border-[#D03A2B] text-[#D03A2B] bg-[#FFF5F3] hover:bg-[#FFE8E3]"
                          : "border-[#0E7A4D] text-[#0E7A4D] bg-[#EEFAF4] hover:bg-[#DDF4EA]"
                      }`}
                    >
                      {updatingStatusId === listing.id ? (
                        <Loader2 className="w-[14px] h-[14px] animate-spin" />
                      ) : null}
                      {updatingStatusId === listing.id
                        ? "Updating"
                        : listing.status === "active"
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </div>

                  {/* Property Details */}
                  <div className="flex items-center gap-[24px] mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <Bed className="w-[16px] h-[16px] text-neutral-gray" />
                      <span className="text-neutral-black text-[14px] font-semibold">
                        {listing.bedrooms} {listing.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <Bath className="w-[16px] h-[16px] text-neutral-gray" />
                      <span className="text-neutral-black text-[14px] font-semibold">
                        {listing.bathrooms} {listing.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <Square className="w-[16px] h-[16px] text-neutral-gray" />
                      <span className="text-neutral-black text-[14px] font-semibold">
                        {listing.area}m²
                      </span>
                    </div>
                    <div className="ml-auto">
                      <div className="text-brand-primary text-[24px] font-bold">
                        €{listing.monthlyRent.toLocaleString()}
                      </div>
                      <div className="text-neutral-gray text-[12px] text-right">per month</div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-[32px] pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-[8px]">
                      <Eye className="w-[14px] h-[14px] text-neutral-gray" />
                      <span className="text-neutral-gray text-[12px]">
                        {listing.views.toLocaleString()} views
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <MessageSquare className="w-[14px] h-[14px] text-neutral-gray" />
                      <span className="text-neutral-gray text-[12px]">
                        {listing.inquiries} inquiries
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px] text-neutral-gray text-[12px]">
                      <Calendar className="w-[14px] h-[14px] text-neutral-gray" />
                      <span>
                        Created: {new Date(listing.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="ml-auto flex items-center gap-[8px]">
                      <Link
                        to={`/property/${listing.id}`}
                        className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors"
                      >
                        <Eye className="w-[14px] h-[14px]" />
                        View
                      </Link>
                      <Link
                        to={`/landlord/listings/${listing.id}/edit`}
                        className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors"
                      >
                        <Edit className="w-[14px] h-[14px]" />
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          void handleDelete(listing.id);
                        }}
                        className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(255,75,39,0.35)] text-brand-primary text-[14px] font-semibold hover:bg-brand-light transition-colors"
                      >
                        <Trash2 className="w-[14px] h-[14px]" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredListings.length === 0 && (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[64px] text-center">
              <Home className="w-[48px] h-[48px] text-neutral-gray mx-auto mb-[16px]" />
              <h3 className="text-neutral-black text-[18px] font-bold mb-[8px]">
                No listings found
              </h3>
              <p className="text-neutral-gray text-[14px] mb-[24px]">
                {searchQuery ? "Try adjusting your search or filters" : "Create your first listing to get started"}
              </p>
              {!searchQuery && (
                <Link
                  to="/landlord/listings/add"
                  className="inline-flex items-center gap-[8px] bg-brand-primary text-white px-[24px] py-[12px] font-semibold hover:bg-brand-primary-dark transition-colors"
                >
                  <Plus className="w-[16px] h-[16px]" />
                  Create New Listing
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </LandlordPortalLayout>
  );
}