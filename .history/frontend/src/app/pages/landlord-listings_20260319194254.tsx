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
import { API_BASE } from "../config";

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
  const apiBase = API_BASE;
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

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

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to delete listings");
      return;
    }

    if (deletingId) {
      return;
    }

    if (deleteConfirmationText.trim() !== "DELETE") {
      setError("Please type DELETE to confirm.");
      return;
    }

    const listingId = deleteTarget.id;
    setDeletingId(listingId);

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
      setDeleteTarget(null);
      setDeleteConfirmationText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing");
    } finally {
      setDeletingId(null);
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
            <p className="text-neutral-gray text-[16px] mb-[12px]">
              Manage your property listings
            </p>
            <div className="flex items-center gap-[8px]">
              <span className="px-[8px] py-[3px] text-[11px] font-bold bg-accent-blue/10 text-accent-blue">
                Active {statusCounts.active}
              </span>
              <span className="px-[8px] py-[3px] text-[11px] font-bold bg-neutral-gray/10 text-neutral-gray">
                Inactive {statusCounts.inactive}
              </span>
            </div>
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
                    <div className="flex-1 min-w-0 pr-[16px]">
                      <h3 className="text-neutral-black text-[20px] font-bold mb-[8px] leading-snug">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-[6px] text-neutral-gray text-[14px] mb-[16px]">
                        <MapPin className="w-[14px] h-[14px]" />
                        <span>{listing.address}, {listing.city}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-[8px] flex-shrink-0">
                      <span className={`px-[10px] py-[4px] text-[11px] font-bold uppercase tracking-[0.05em] ${
                        listing.status === "active"
                          ? "bg-accent-blue/10 text-accent-blue"
                          : listing.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-neutral-gray/10 text-neutral-gray"
                      }`}>
                        {listing.status === "active" ? "Active" : listing.status === "draft" ? "Draft" : "Inactive"}
                      </span>
                      <button
                      onClick={() => { void handleStatusToggle(listing.id, listing.status); }}
                      disabled={updatingStatusId === listing.id || listing.status === "draft"}
                      className={`inline-flex items-center gap-[6px] px-[14px] py-[7px] text-[13px] font-semibold border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        listing.status === "active"
                          ? "border-[#D03A2B]/40 text-[#D03A2B] bg-[#FFF5F3] hover:bg-[#FFE8E4]"
                          : "border-[#0E7A4D]/40 text-[#0E7A4D] bg-[#EEFAF4] hover:bg-[#D6F5E7]"
                      }`}
                    >
                      {updatingStatusId === listing.id ? (
                        <Loader2 className="w-[13px] h-[13px] animate-spin" />
                      ) : null}
                      {updatingStatusId === listing.id
                        ? "Updating…"
                        : listing.status === "active"
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                    </div>
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
                  <div className="flex items-center pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                    <div className="flex items-center gap-[16px] text-neutral-gray text-[12px]">
                      <span className="flex items-center gap-[5px]">
                        <Eye className="w-[13px] h-[13px]" />
                        {listing.views.toLocaleString()} views
                      </span>
                      <span className="text-[rgba(0,0,0,0.2)]">·</span>
                      <span className="flex items-center gap-[5px]">
                        <MessageSquare className="w-[13px] h-[13px]" />
                        {listing.inquiries} {listing.inquiries === 1 ? "inquiry" : "inquiries"}
                      </span>
                      <span className="text-[rgba(0,0,0,0.2)]">·</span>
                      <span className="flex items-center gap-[5px]">
                        <Calendar className="w-[13px] h-[13px]" />
                        {new Date(listing.createdAt).toLocaleDateString("en-GB", {
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
                          setError("");
                          setDeleteConfirmationText("");
                          setDeleteTarget(listing);
                        }}
                        disabled={deletingId === listing.id}
                        className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(255,75,39,0.35)] text-brand-primary text-[14px] font-semibold hover:bg-brand-light transition-colors"
                      >
                        <Trash2 className="w-[14px] h-[14px]" />
                        {deletingId === listing.id ? "Deleting..." : "Delete"}
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

        {deleteTarget && (
          <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-[24px]">
            <div className="w-full max-w-[520px] bg-white border border-[rgba(0,0,0,0.12)] p-[24px]">
              <h3 className="text-neutral-black text-[20px] font-bold mb-[8px]">Delete Listing</h3>
              <p className="text-neutral-gray text-[14px] leading-[1.6] mb-[16px]">
                You are about to permanently delete <span className="font-semibold text-neutral-black">{deleteTarget.title}</span>.
                This action cannot be undone.
              </p>

              <label className="block text-[13px] font-semibold text-neutral-black mb-[8px]">
                Type <span className="text-brand-primary">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(event) => setDeleteConfirmationText(event.target.value)}
                placeholder="DELETE"
                className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary"
              />

              <div className="flex items-center justify-end gap-[10px] mt-[20px]">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeleteConfirmationText("");
                  }}
                  disabled={deletingId === deleteTarget.id}
                  className="px-[16px] py-[10px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[13px] font-semibold hover:bg-neutral-light-gray transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    void handleDelete();
                  }}
                  disabled={deletingId === deleteTarget.id || deleteConfirmationText.trim() !== "DELETE"}
                  className="px-[16px] py-[10px] bg-brand-primary text-white text-[13px] font-semibold hover:bg-brand-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId === deleteTarget.id ? "Deleting..." : "Delete permanently"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </LandlordPortalLayout>
  );
}