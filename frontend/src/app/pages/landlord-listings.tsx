import { Link } from "react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Bath,
  Bed,
  Calendar,
  ChevronDown,
  Edit,
  Eye,
  Home,
  Loader2,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  Settings2,
  Square,
  Trash2,
} from "lucide-react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { API_BASE } from "../config";
import houseImage from "../../assets/house_image.svg";

type ListingStatus = "active" | "inactive";
type ActiveInactiveStatus = "active" | "inactive";

interface Listing {
  id: string;
  propertyType: "apartment" | "studio" | "house" | "room";
  title: string;
  description: string;
  address: string;
  city: string;
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

type ApiListing = Partial<Listing> & {
  media?: Array<{ url?: string }>;
  deposits?: Array<{ amount?: number }>;
  bedroomsCount?: number;
  bathroomStructure?: { count?: number };
  propertySize?: number;
};

function normalizeListing(raw: ApiListing): Listing {
  const mediaImages = Array.isArray(raw.media)
    ? raw.media.map((item) => item?.url).filter((url): url is string => Boolean(url))
    : [];

  return {
    id: raw.id ?? "",
    propertyType: raw.propertyType ?? "apartment",
    title: raw.title ?? "Untitled listing",
    description: raw.description ?? "",
    address: raw.address ?? "",
    city: raw.city ?? "",
    monthlyRent: raw.monthlyRent ?? 0,
    deposit: raw.deposit ?? raw.deposits?.[0]?.amount ?? 0,
    bedrooms: raw.bedrooms ?? raw.bedroomsCount ?? 0,
    bathrooms: raw.bathrooms ?? raw.bathroomStructure?.count ?? 0,
    area: raw.area ?? raw.propertySize ?? 0,
    images: Array.isArray(raw.images) ? raw.images : mediaImages,
    availableFrom: raw.availableFrom ?? new Date().toISOString(),
    minStay: raw.minStay ?? 1,
    utilitiesIncluded: raw.utilitiesIncluded ?? false,
    registrationPossible: raw.registrationPossible ?? false,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    houseRules: Array.isArray(raw.houseRules) ? raw.houseRules : [],
    status: raw.status === "active" ? "active" : "inactive",
    views: raw.views ?? 0,
    inquiries: raw.inquiries ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export function LandlordListings() {
  const apiBase = API_BASE;
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const LIMIT = 12;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");

  const loadListings = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to view listings");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (searchQuery) params.set("search", searchQuery);
      if (filterStatus !== "all") params.set("status", filterStatus);

      const response = await fetch(`${apiBase}/api/listings/mine?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to load listings");
      }

      const payload = (await response.json()) as { listings: ApiListing[]; total: number; page: number; pages: number };
      setListings((payload.listings ?? []).map(normalizeListing));
      setTotal(payload.total ?? 0);
      setPages(payload.pages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, page, searchQuery, filterStatus]);

  useEffect(() => { void loadListings(); }, [loadListings]);

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

      setDeleteTarget(null);
      setDeleteConfirmationText("");
      void loadListings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchQuery(searchInput);
  };

  const handleStatusChange = (val: ListingStatus | "all") => {
    setFilterStatus(val);
    setPage(1);
  };

  const renderSkeletonCard = (index: number) => (
    <div
      key={index}
      className="rounded-[24px] border border-[rgba(11,45,58,0.08)] bg-white px-[16px] py-[16px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
    >
      <div className="animate-pulse flex flex-col gap-[14px] xl:flex-row xl:items-center">
        <div className="h-[132px] w-full rounded-[16px] bg-[#D5E0EA] xl:w-[180px] xl:flex-shrink-0" />
        <div className="flex-1 space-y-[10px]">
          <div className="h-[16px] w-[62%] rounded-full bg-[#D5E0EA]" />
          <div className="h-[14px] w-[38%] rounded-full bg-[#D5E0EA]" />
          <div className="flex flex-wrap gap-[8px] pt-[4px]">
            <div className="h-[12px] w-[84px] rounded-full bg-[#D5E0EA]" />
            <div className="h-[12px] w-[106px] rounded-full bg-[#D5E0EA]" />
            <div className="h-[12px] w-[96px] rounded-full bg-[#D5E0EA]" />
          </div>
        </div>
        <div className="flex items-center gap-[10px] xl:justify-end">
          <div className="h-[34px] w-[150px] rounded-full bg-[#D5E0EA]" />
          <div className="h-[38px] w-[38px] rounded-full bg-[#D5E0EA]" />
        </div>
      </div>
    </div>
  );

  return (
    <LandlordPortalLayout>
      <main className="flex-1 px-[20px] py-[20px] lg:px-[28px] lg:py-[24px]">
        <div className="flex flex-col gap-[16px] xl:flex-row xl:items-start xl:justify-between xl:gap-[20px]">
          <div>
            <h1 className="text-neutral-black text-[28px] font-bold tracking-[-0.03em]">
              Listings
            </h1>
          </div>

          <div className="flex flex-col gap-[10px] sm:flex-row sm:items-center">
            <Link
              to="/landlord/dashboard"
              className="inline-flex items-center justify-center gap-[8px] rounded-[18px] border-2 border-[#AFC1D3] bg-white px-[16px] py-[12px] text-[14px] font-semibold text-[#0B2D3A] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:bg-[#F7FBFE]"
            >
              <Settings2 className="w-[16px] h-[16px]" />
              Manage all listings
            </Link>
            <Link
              to="/landlord/add-listing"
              className="inline-flex items-center justify-center rounded-[18px] bg-brand-primary px-[18px] py-[12px] text-[14px] font-bold text-white transition-colors hover:bg-brand-primary-dark"
            >
              Add listing
            </Link>
          </div>
        </div>

        <div className="mt-[20px] grid grid-cols-1 gap-[12px] xl:grid-cols-[minmax(0,220px)_minmax(0,220px)_minmax(0,1fr)]">
          <div className="relative min-w-0">
            <select
              value={filterStatus}
              onChange={(event) => handleStatusChange(event.target.value as ListingStatus | "all")}
              className="h-[54px] w-full min-w-0 appearance-none rounded-[14px] border border-[#A8B2BF] bg-white px-[14px] pr-[36px] text-[14px] font-medium text-[#0B2D3A] outline-none transition-colors focus:border-brand-primary sm:h-[58px] sm:px-[16px] sm:pr-[40px] sm:text-[15px]"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-[16px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#0B2D3A]" />
          </div>

          <form onSubmit={handleSearchSubmit} className="col-span-full xl:col-span-2 flex items-center gap-[8px]">
            <label className="flex flex-1 h-[54px] min-w-0 items-center gap-[10px] rounded-[14px] border border-[#A8B2BF] bg-white px-[14px] sm:h-[58px] sm:px-[16px]">
              <Search className="h-[18px] w-[18px] text-[#0B2D3A] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title, city or address"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="w-full min-w-0 border-0 bg-transparent text-[14px] font-medium text-[#0B2D3A] outline-none placeholder:text-[#9AA7B4] sm:text-[15px]"
              />
            </label>
            <button type="submit" className="h-[54px] px-[18px] rounded-[14px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors sm:h-[58px] flex-shrink-0">
              Search
            </button>
          </form>
        </div>

        {isLoading && <div className="mt-[20px] space-y-[14px]">{[0, 1, 2].map(renderSkeletonCard)}</div>}

        {!isLoading && error && (
          <div className="mt-[18px] rounded-[16px] border border-[#F3C4BE] bg-[#FFF7F5] px-[16px] py-[12px] text-[13px] font-medium text-brand-primary">
            {error}
          </div>
        )}

        {!isLoading && !error && listings.length === 0 && (
          <div className="mt-[20px] rounded-[22px] border border-[rgba(11,45,58,0.08)] bg-white px-[22px] py-[40px] text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="flex justify-center mb-[16px]">
              <img src={houseImage} alt="No listings" className="w-[100px] h-[100px] object-contain" />
            </div>
            <h2 className="text-[18px] font-bold text-neutral-black">
              You can view and manage all your listings here.
            </h2>
            <p className="mx-auto mt-[6px] max-w-[520px] text-[14px] text-neutral-gray">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first listing to get started and start earning!"}
            </p>
            <Link
              to="/landlord/add-listing"
              className="mt-[18px] inline-flex items-center gap-[8px] rounded-[14px] bg-brand-primary px-[18px] py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-brand-primary-dark"
            >
              <Plus className="h-[14px] w-[14px]" />
              Add listing
            </Link>
          </div>
        )}

        {!isLoading && !error && listings.length > 0 && (
          <div className="mt-[20px] space-y-[14px]">
            {listings.map((listing) => (
              <article
                key={listing.id}
                className="rounded-[22px] border border-[rgba(11,45,58,0.08)] bg-white px-[16px] py-[16px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-col gap-[14px] xl:flex-row xl:items-center">
                  <div className="overflow-hidden rounded-[16px] bg-[#EEF3F7] xl:h-[132px] xl:w-[180px] xl:flex-shrink-0">
                    <ImageWithFallback
                      src={
                        listing.images[0] ??
                        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
                      }
                      alt={listing.title}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-[8px] lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <h2 className="truncate text-[17px] font-bold leading-[1.2] text-neutral-black">
                          {listing.title}
                        </h2>
                        <div className="mt-[6px] flex items-center gap-[6px] text-[13px] text-neutral-gray">
                          <MapPin className="h-[14px] w-[14px] flex-shrink-0" />
                          <span className="truncate">
                            {listing.address}, {listing.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start gap-[6px] lg:items-end">
                        <span
                          className={`inline-flex rounded-full px-[10px] py-[4px] text-[10px] font-bold uppercase tracking-[0.08em] ${
                            listing.status === "active"
                              ? "bg-[#EAF8F1] text-[#0E7A4D]"
                              : "bg-[#F4F6F8] text-[#7B8794]"
                          }`}
                        >
                          {listing.status === "active" ? "Active" : "Inactive"}
                        </span>
                        <button
                          onClick={() => {
                            void handleStatusToggle(listing.id, listing.status);
                          }}
                          disabled={updatingStatusId === listing.id}
                          className={`inline-flex items-center gap-[6px] rounded-[12px] border px-[12px] py-[7px] text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                            listing.status === "active"
                              ? "border-[#F0B4AA] bg-[#FFF7F5] text-brand-primary hover:bg-[#FFEDE9]"
                              : "border-[#B7DDC8] bg-[#F1FBF5] text-[#0E7A4D] hover:bg-[#E5F7EC]"
                          }`}
                        >
                          {updatingStatusId === listing.id ? (
                            <Loader2 className="h-[13px] w-[13px] animate-spin" />
                          ) : null}
                          {updatingStatusId === listing.id
                            ? "Updating…"
                            : listing.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-[14px] flex flex-wrap items-center gap-[14px] text-[13px] font-semibold text-neutral-black">
                      <span className="inline-flex items-center gap-[6px]">
                        <Bed className="h-[14px] w-[14px] text-neutral-gray" />
                        {listing.bedrooms} {listing.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                      </span>
                      <span className="inline-flex items-center gap-[6px]">
                        <Bath className="h-[14px] w-[14px] text-neutral-gray" />
                        {listing.bathrooms} {listing.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
                      </span>
                      <span className="inline-flex items-center gap-[6px]">
                        <Square className="h-[14px] w-[14px] text-neutral-gray" />
                        {listing.area}m²
                      </span>
                      <span className="inline-flex items-center gap-[6px] text-brand-primary">
                        €{listing.monthlyRent.toLocaleString()} / month
                      </span>
                    </div>

                    <div className="mt-[14px] flex flex-col gap-[10px] border-t border-[rgba(11,45,58,0.08)] pt-[12px] lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-[12px] text-[11px] text-neutral-gray">
                        <span className="inline-flex items-center gap-[5px]">
                          <Eye className="h-[12px] w-[12px]" />
                          {listing.views.toLocaleString()} views
                        </span>
                        <span className="inline-flex items-center gap-[5px]">
                          <MessageSquare className="h-[12px] w-[12px]" />
                          {listing.inquiries} {listing.inquiries === 1 ? "inquiry" : "inquiries"}
                        </span>
                        <span className="inline-flex items-center gap-[5px]">
                          <Calendar className="h-[12px] w-[12px]" />
                          {new Date(listing.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-[8px]">
                        <Link
                          to={`/property/${listing.id}`}
                          className="inline-flex items-center gap-[6px] rounded-[12px] border border-[rgba(11,45,58,0.16)] px-[12px] py-[7px] text-[12px] font-semibold text-neutral-black transition-colors hover:bg-neutral-light-gray"
                        >
                          <Eye className="h-[13px] w-[13px]" />
                          View
                        </Link>
                        <Link
                          to={`/landlord/listings/${listing.id}/edit`}
                          className="inline-flex items-center gap-[6px] rounded-[12px] border border-[rgba(11,45,58,0.16)] px-[12px] py-[7px] text-[12px] font-semibold text-neutral-black transition-colors hover:bg-neutral-light-gray"
                        >
                          <Edit className="h-[13px] w-[13px]" />
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            setError("");
                            setDeleteConfirmationText("");
                            setDeleteTarget(listing);
                          }}
                          disabled={deletingId === listing.id}
                          className="inline-flex items-center gap-[6px] rounded-[12px] border border-[rgba(255,75,39,0.35)] px-[12px] py-[7px] text-[12px] font-semibold text-brand-primary transition-colors hover:bg-brand-light disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-[13px] w-[13px]" />
                          {deletingId === listing.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && pages > 1 && (
          <div className="mt-[24px] flex items-center justify-between">
            <p className="text-[13px] text-neutral-gray">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total} listings
            </p>
            <div className="flex items-center gap-[8px]">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-[14px] py-[8px] rounded-[12px] border border-[#A8B2BF] text-[13px] font-semibold text-[#0B2D3A] hover:bg-neutral-light-gray disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="text-[13px] font-medium text-neutral-black px-[8px]">{page} / {pages}</span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="px-[14px] py-[8px] rounded-[12px] border border-[#A8B2BF] text-[13px] font-semibold text-[#0B2D3A] hover:bg-neutral-light-gray disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

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