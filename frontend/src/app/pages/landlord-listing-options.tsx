import { useEffect, useState } from "react";
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
  const [myListings, setMyListings] = useState<MineListing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState("");
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedOption !== "duplicate") {
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
        setMyListings(data.listings);
        if (data.listings.length > 0) {
          setSelectedListingId(data.listings[0].id);
        }
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "Unable to load your listings";
        setError(message);
      } finally {
        setIsLoadingListings(false);
      }
    };

    void fetchMine();
  }, [selectedOption, apiBase]);

  const handleCreateNew = () => {
    navigate("/landlord/add-listing/new");
  };

  const handleContinue = async () => {
    setError(null);
    if (selectedOption === "new") {
      handleCreateNew();
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
    <LandlordPortalLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-[32px]">
        <div className="w-full max-w-[800px]">
          {/* Header */}
          <div className="mb-[48px]">
            <h1 className="text-neutral-black text-[40px] font-bold tracking-[-0.02em] mb-[16px]">
              Listing options
            </h1>
            <p className="text-neutral-gray text-[16px] leading-[1.6]">
              Select one of the options below to start listing your property.
            </p>
          </div>

          {/* Options */}
          <div className="space-y-[24px]">
            {/* Create New Listing */}
            <div
              onClick={() => setSelectedOption("new")}
              className="cursor-pointer border-[2px] border-neutral-light-gray hover:border-brand-primary transition-colors p-[32px] rounded-[8px] hover:bg-neutral-lighter-gray"
            >
              <div className="flex items-start gap-[24px]">
                <div className={`w-[24px] h-[24px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 mt-[4px] ${selectedOption === "new" ? "border-brand-primary" : "border-neutral-light-gray"}`}>
                  {selectedOption === "new" && <div className="w-[12px] h-[12px] rounded-full bg-brand-primary" />}
                </div>
                <div>
                  <h2 className="text-neutral-black text-[18px] font-bold mb-[8px]">
                    Create new listing
                  </h2>
                  <p className="text-neutral-gray text-[14px] leading-[1.6]">
                    Select this option to create a new listing from scratch.
                  </p>
                </div>
              </div>
            </div>

            {/* Duplicate Listing */}
            <div
              onClick={() => setSelectedOption("duplicate")}
              className="cursor-pointer border-[2px] border-neutral-light-gray hover:border-brand-primary transition-colors p-[32px] rounded-[8px] hover:bg-neutral-lighter-gray"
            >
              <div className="flex items-start gap-[24px]">
                <div className={`w-[24px] h-[24px] rounded-full border-[2px] flex items-center justify-center flex-shrink-0 mt-[4px] ${selectedOption === "duplicate" ? "border-brand-primary" : "border-neutral-light-gray"}`}>
                  {selectedOption === "duplicate" && <div className="w-[12px] h-[12px] rounded-full bg-brand-primary" />}
                </div>
                <div>
                  <h2 className="text-neutral-black text-[18px] font-bold mb-[8px]">
                    Duplicate an existing listing
                  </h2>
                  <p className="text-neutral-gray text-[14px] leading-[1.6]">
                    Select this option if you want to create a listing that is quite similar to a listing that you already listed on HousingAnywhere.
                  </p>
                </div>
              </div>
            </div>

            {selectedOption === "duplicate" && (
              <div className="border border-neutral-light-gray rounded-[8px] p-[20px] bg-white">
                <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                  Select listing to duplicate
                </label>
                <select
                  className="w-full border border-neutral-light-gray rounded-[6px] px-[12px] py-[10px] text-[14px] text-neutral-black"
                  value={selectedListingId}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                  disabled={isLoadingListings || myListings.length === 0}
                >
                  {myListings.length === 0 ? (
                    <option value="">No listings available</option>
                  ) : (
                    myListings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.title || "Untitled listing"} - {listing.city || "Unknown city"}
                      </option>
                    ))
                  )}
                </select>
                {isLoadingListings && (
                  <div className="mt-[10px] space-y-[8px]">
                    <Skeleton className="h-[12px] w-[60%]" />
                    <Skeleton className="h-[12px] w-[40%]" />
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-[13px] text-brand-primary">{error}</p>}
          </div>

          {/* Continue Button */}
          <div className="flex justify-end mt-[48px]">
            <Button
              type="button"
              onClick={handleContinue}
              disabled={isContinuing || (selectedOption === "duplicate" && myListings.length === 0)}
              className="bg-brand-primary text-white px-[32px] py-[16px] font-bold hover:bg-brand-primary-dark transition-colors"
            >
              {isContinuing ? "PLEASE WAIT..." : "CONTINUE"}
            </Button>
          </div>
        </div>
      </div>
    </LandlordPortalLayout>
  );
}
