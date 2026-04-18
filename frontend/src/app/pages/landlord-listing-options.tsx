import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { Button } from "../components/ui/button";
import { API_BASE } from "../config";
import { Skeleton } from "../components/ui/skeleton";

interface MineListing {
  id: string;
  title?: string;
  address?: string;
  city?: string;
}

export function LandlordListingOptions() {
  const apiBase = API_BASE;
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<"new" | "duplicate">("new");
  const [flowStep, setFlowStep] = useState<"options" | "duplicate-select">("options");
  const [myListings, setMyListings] = useState<MineListing[]>([]);
  const [hasExistingListings, setHasExistingListings] = useState<boolean | null>(null);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [listingSearchQuery, setListingSearchQuery] = useState("");
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in again to continue.");
      setHasExistingListings(false);
      return;
    }

    const fetchMineForGate = async () => {
      setIsLoadingListings(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/listings/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load your listings");
        }

        const data = (await response.json()) as { listings: MineListing[] };
        const listings = data.listings ?? [];
        setMyListings(listings);

        if (listings.length === 0) {
          setHasExistingListings(false);
          navigate("/landlord/add-listing/new", { replace: true });
          return;
        }

        setHasExistingListings(true);
        setSelectedListingId((current) => current || listings[0].id);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unable to load your listings";
        setError(message);
        setHasExistingListings(true);
      } finally {
        setIsLoadingListings(false);
      }
    };

    void fetchMineForGate();
  }, [apiBase, navigate]);

  useEffect(() => {
    if (selectedOption !== "duplicate") {
      return;
    }

    if (flowStep !== "duplicate-select") {
      return;
    }

    if (myListings.length > 0) {
      if (!selectedListingId) {
        setSelectedListingId(myListings[0].id);
      }
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    const fetchMine = async () => {
      setIsLoadingListings(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/listings/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load your listings");
        }

        const data = (await response.json()) as { listings: MineListing[] };
        const listings = data.listings ?? [];
        setMyListings(listings);
        if (listings.length > 0) {
          setSelectedListingId(listings[0].id);
        }
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unable to load your listings";
        setError(message);
      } finally {
        setIsLoadingListings(false);
      }
    };

    void fetchMine();
  }, [flowStep, selectedOption, apiBase, myListings, selectedListingId]);

  const filteredMyListings = useMemo(() => {
    const searchValue = listingSearchQuery.trim().toLowerCase();
    if (!searchValue) {
      return myListings;
    }

    return myListings.filter((listing) => {
      const title = (listing.title ?? "").toLowerCase();
      const city = (listing.city ?? "").toLowerCase();
      const address = (listing.address ?? "").toLowerCase();
      return title.includes(searchValue) || city.includes(searchValue) || address.includes(searchValue);
    });
  }, [listingSearchQuery, myListings]);

  if (hasExistingListings === null) {
    return (
      <LandlordPortalLayout hideSidebar hideFooter>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-[32px]">
          <div className="w-full max-w-[800px] space-y-[10px]">
            <Skeleton className="h-[40px] w-[280px]" />
            <Skeleton className="h-[20px] w-[520px]" />
            <Skeleton className="h-[130px] w-full" />
            <Skeleton className="h-[130px] w-full" />
          </div>
        </div>
      </LandlordPortalLayout>
    );
  }

  const handleCreateNew = () => {
    navigate("/landlord/add-listing/new");
  };

  const handleContinue = async () => {
    setError(null);
    if (selectedOption === "new") {
      if (flowStep === "options") {
        handleCreateNew();
        return;
      }

      handleCreateNew();
      return;
    }

    if (flowStep === "options") {
      setFlowStep("duplicate-select");
      return;
    }

    if (!selectedListingId) {
      setError("Select a listing to duplicate.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in again to continue.");
      return;
    }

    setIsContinuing(true);
    try {
      const response = await fetch(`${apiBase}/api/listings/${selectedListingId}/duplicate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Unable to duplicate the selected listing");
      }

      const data = (await response.json()) as { listing?: { id: string } };
      const newListingId = data.listing?.id;
      if (!newListingId) {
        throw new Error("Duplicate listing was created but no ID was returned");
      }

      navigate(`/landlord/listings/${newListingId}/edit`);
    } catch (duplicateError) {
      const message = duplicateError instanceof Error ? duplicateError.message : "Unable to duplicate listing";
      setError(message);
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <LandlordPortalLayout hideSidebar hideFooter>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-[24px] py-[16px]">
        <div className="w-full max-w-[720px]">
          {/* Header */}
          <div className="mb-[32px]">
            {flowStep === "options" ? (
              <>
                <h1 className="text-neutral-black text-[34px] font-bold tracking-[-0.02em] mb-[10px]">
                  Listing options
                </h1>
                <p className="text-neutral-gray text-[14px] leading-[1.6] max-w-[620px]">
                  Select one of the options below to start listing your property.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-neutral-black text-[34px] font-bold tracking-[-0.02em] mb-[10px]">
                  Duplicate an existing listing
                </h1>
                <p className="text-neutral-gray text-[14px] leading-[1.6] max-w-[620px]">
                  Search and select one of your existing listings below for duplication.
                </p>
              </>
            )}
          </div>

          {flowStep === "options" ? (
            <div className="space-y-[16px]">
            {/* Create New Listing */}
            <div
              onClick={() => setSelectedOption("new")}
              className="cursor-pointer border-[1.5px] border-neutral-light-gray hover:border-brand-primary transition-colors p-[24px] rounded-[10px] hover:bg-neutral-lighter-gray"
            >
              <div className="flex items-start gap-[18px]">
                <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 mt-[3px] ${selectedOption === "new" ? "border-brand-primary" : "border-neutral-light-gray"}`}>
                  {selectedOption === "new" && <div className="w-[11px] h-[11px] rounded-full bg-brand-primary" />}
                </div>
                <div>
                  <h2 className="text-neutral-black text-[16px] font-bold mb-[6px]">
                    Create new listing
                  </h2>
                  <p className="text-neutral-gray text-[13px] leading-[1.6] max-w-[580px]">
                    Select this option to create a new listing from scratch.
                  </p>
                </div>
              </div>
            </div>
            {/* Duplicate Listing */}
            <div
              onClick={() => setSelectedOption("duplicate")}
              className="cursor-pointer border-[1.5px] border-neutral-light-gray hover:border-brand-primary transition-colors p-[24px] rounded-[10px] hover:bg-neutral-lighter-gray"
            >
              <div className="flex items-start gap-[18px]">
                <div className={`w-[22px] h-[22px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 mt-[3px] ${selectedOption === "duplicate" ? "border-brand-primary" : "border-neutral-light-gray"}`}>
                  {selectedOption === "duplicate" && <div className="w-[11px] h-[11px] rounded-full bg-brand-primary" />}
                </div>
                <div>
                  <h2 className="text-neutral-black text-[16px] font-bold mb-[6px]">
                    Duplicate an existing listing
                  </h2>
                  <p className="text-neutral-gray text-[13px] leading-[1.6] max-w-[620px]">
                    Select this option if you want to create a listing that is quite similar to a listing that you already listed on ReserveHousing.
                  </p>
                </div>
              </div>
            </div>

            {error && <p className="text-[13px] text-brand-primary">{error}</p>}
          </div>
          ) : (
            <div className="space-y-[16px]">
              <div className="border border-neutral-light-gray rounded-[10px] p-[16px] bg-white">
                <div className="mb-[14px]">
                  <label className="block text-[13px] font-semibold text-neutral-black mb-[8px]">
                    Search your listings
                  </label>
                  <input
                    type="text"
                    value={listingSearchQuery}
                    onChange={(event) => setListingSearchQuery(event.target.value)}
                    placeholder="Search by address, city or title"
                    className="w-full rounded-[8px] border border-neutral-light-gray px-[12px] py-[10px] text-[14px] text-neutral-black outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-[10px] max-h-[280px] overflow-y-auto pr-[4px]">
                  {isLoadingListings && (
                    <div className="space-y-[8px]">
                      <Skeleton className="h-[54px] w-full" />
                      <Skeleton className="h-[54px] w-full" />
                    </div>
                  )}

                  {!isLoadingListings && filteredMyListings.length === 0 && (
                    <p className="text-[13px] text-neutral-gray">
                      {listingSearchQuery ? "No listings match your search." : "No listings available."}
                    </p>
                  )}

                  {!isLoadingListings && filteredMyListings.map((listing) => {
                    const isSelected = selectedListingId === listing.id;
                    return (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() => setSelectedListingId(listing.id)}
                        className={`w-full text-left rounded-[10px] border p-[14px] transition-colors ${
                          isSelected
                            ? "border-brand-primary bg-brand-light"
                            : "border-neutral-light-gray hover:border-brand-primary hover:bg-neutral-lighter-gray"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-[12px]">
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-neutral-black truncate">
                              {listing.title || "Untitled listing"}
                            </p>
                            <p className="text-[12px] text-neutral-gray mt-[3px] truncate">
                              {listing.address || "No address"} {listing.city ? `• ${listing.city}` : ""}
                            </p>
                          </div>
                          <span className={`shrink-0 rounded-full px-[10px] py-[4px] text-[11px] font-semibold ${isSelected ? "bg-brand-primary text-white" : "bg-neutral-light-gray text-neutral-black"}`}>
                            {isSelected ? "Selected" : "Choose"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-[12px] text-[12px] text-neutral-gray">
                  Pick a listing to duplicate, then make the changes you need.
                </p>
              </div>

              {error && <p className="text-[13px] text-brand-primary">{error}</p>}
            </div>
          )}

          {/* Continue Button */}
          <div className="flex items-center justify-between mt-[28px]">
            {flowStep === "duplicate-select" ? (
              <Button
                type="button"
                onClick={() => {
                  setFlowStep("options");
                  setError(null);
                }}
                className="h-[46px] border border-brand-primary bg-white px-[22px] text-[14px] font-bold text-brand-primary hover:bg-brand-light transition-colors"
              >
                BACK
              </Button>
            ) : (
              <div />
            )}

            <Button
              type="button"
              onClick={handleContinue}
              disabled={isContinuing || (flowStep === "duplicate-select" && myListings.length === 0)}
              className="h-[46px] bg-brand-primary px-[22px] text-[14px] font-bold text-white hover:bg-brand-primary-dark transition-colors"
            >
              {isContinuing ? "PLEASE WAIT..." : flowStep === "duplicate-select" ? "DUPLICATE" : "CONTINUE"}
            </Button>
          </div>
        </div>
      </div>
    </LandlordPortalLayout>
  );
}
