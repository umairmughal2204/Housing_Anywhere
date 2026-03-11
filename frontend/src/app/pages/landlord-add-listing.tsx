import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { 
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Upload,
  X,
  Plus,
  Wifi,
  Tv,
  Wind,
  Utensils,
  WashingMachine,
  ParkingCircle,
  Dog,
  Cigarette,
  Users,
  Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

type PropertyType = "apartment" | "studio" | "house" | "room";
type ListingStatus = "active" | "draft" | "inactive";

interface ListingPayload {
  propertyType: PropertyType;
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
  status: ListingStatus;
}

interface ListingResponse {
  id: string;
  propertyType: PropertyType;
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
  status: ListingStatus;
}

interface Amenity {
  id: string;
  label: string;
  icon: any;
}

const amenities: Amenity[] = [
  { id: "wifi", label: "WiFi", icon: Wifi },
  { id: "tv", label: "TV", icon: Tv },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
  { id: "washer", label: "Washing Machine", icon: WashingMachine },
  { id: "parking", label: "Parking", icon: ParkingCircle },
];

const houseRules: Amenity[] = [
  { id: "pets", label: "Pets Allowed", icon: Dog },
  { id: "smoking", label: "Smoking Allowed", icon: Cigarette },
  { id: "couples", label: "Couples Allowed", icon: Users },
];

export function LandlordAddListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [area, setArea] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [deposit, setDeposit] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [minStay, setMinStay] = useState(3);
  const [utilitiesIncluded, setUtilitiesIncluded] = useState(false);
  const [registrationPossible, setRegistrationPossible] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    const loadListing = async () => {
      if (!isEditMode || !id) {
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to edit listings");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`${apiBase}/api/listings/mine/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load listing");
        }

        const payload = (await response.json()) as { listing: ListingResponse };
        const listing = payload.listing;

        setPropertyType(listing.propertyType);
        setTitle(listing.title);
        setDescription(listing.description);
        setAddress(listing.address);
        setCity(listing.city);
        setPostalCode(listing.postalCode);
        setBedrooms(listing.bedrooms);
        setBathrooms(listing.bathrooms);
        setArea(String(listing.area));
        setMonthlyRent(String(listing.monthlyRent));
        setDeposit(String(listing.deposit));
        setAvailableFrom(String(listing.availableFrom).slice(0, 10));
        setMinStay(listing.minStay);
        setUtilitiesIncluded(listing.utilitiesIncluded);
        setRegistrationPossible(listing.registrationPossible);
        setSelectedAmenities(listing.amenities);
        setSelectedRules(listing.houseRules);
        setUploadedImages(listing.images);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setIsLoading(false);
      }
    };

    void loadListing();
  }, [apiBase, id, isEditMode]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleRule = (id: string) => {
    setSelectedRules(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to upload images");
      return;
    }

    const remainingSlots = Math.max(0, 10 - uploadedImages.length);
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    if (selectedFiles.length === 0) {
      setError("Maximum 10 images allowed");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    setIsUploadingImages(true);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/listings/upload-images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to upload images");
      }

      const payload = (await response.json()) as { urls: string[] };
      setUploadedImages((prev) => [...prev, ...payload.urls].slice(0, 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const hasRequiredPublishFields = () => {
    return (
      title.trim().length > 0 &&
      description.trim().length > 0 &&
      address.trim().length > 0 &&
      city.trim().length > 0 &&
      postalCode.trim().length > 0 &&
      Number(area) > 0 &&
      Number(monthlyRent) >= 0 &&
      Number(deposit) >= 0 &&
      availableFrom.trim().length > 0 &&
      minStay >= 1 &&
      uploadedImages.length > 0
    );
  };

  const saveListing = async (status: ListingStatus) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to manage listings");
      return;
    }

    if (status === "active" && !hasRequiredPublishFields()) {
      setError("Please complete all required fields and upload at least 1 image before publishing");
      return;
    }

    const payload: ListingPayload = {
      propertyType,
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      bedrooms,
      bathrooms,
      area: Number(area),
      monthlyRent: Number(monthlyRent),
      deposit: Number(deposit),
      availableFrom,
      minStay,
      utilitiesIncluded,
      registrationPossible,
      amenities: selectedAmenities,
      houseRules: selectedRules,
      images: uploadedImages,
      status,
    };

    setIsSaving(true);
    setError("");

    try {
      const endpoint = isEditMode && id ? `${apiBase}/api/listings/${id}` : `${apiBase}/api/listings`;
      const method = isEditMode && id ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = (await response.json()) as { message?: string };
        throw new Error(errorPayload.message ?? "Failed to save listing");
      }

      navigate("/landlord/listings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save listing");
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return title && description && propertyType;
    }
    if (currentStep === 2) {
      return address && city && postalCode && area;
    }
    if (currentStep === 3) {
      return monthlyRent && deposit && availableFrom;
    }
    return true;
  };

  return (
    <LandlordPortalLayout>
      <div className="min-h-[calc(100vh-73px)] bg-neutral-light-gray">
        {/* Header */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-[1000px] mx-auto px-[32px] py-[24px]">
            <h1 className="text-[28px] font-bold text-neutral-black mb-[4px]">
              {isEditMode ? "Edit Listing" : "Add New Listing"}
            </h1>
            <p className="text-[14px] text-neutral-gray">
              {isEditMode ? "Update your property details" : "Create a new property listing to attract quality tenants"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-[1000px] mx-auto px-[32px] py-[20px]">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Basic Info" },
                { num: 2, label: "Details" },
                { num: 3, label: "Pricing" },
                { num: 4, label: "Photos & Amenities" },
              ].map((step, index) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex items-center gap-[12px]">
                    <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center font-bold text-[16px] ${
                      currentStep === step.num
                        ? "bg-brand-primary text-white"
                        : currentStep > step.num
                        ? "bg-accent-blue text-white"
                        : "bg-neutral-light-gray text-neutral-gray"
                    }`}>
                      {currentStep > step.num ? <Check className="w-[20px] h-[20px]" /> : step.num}
                    </div>
                    <span className={`text-[14px] font-semibold ${
                      currentStep >= step.num ? "text-neutral-black" : "text-neutral-gray"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-[2px] mx-[16px] ${
                      currentStep > step.num ? "bg-accent-blue" : "bg-neutral-light-gray"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-[1000px] mx-auto px-[32px] py-[32px]">
          {error && (
            <div className="mb-[16px] p-[12px] rounded-[10px] bg-red-50 text-red-700 text-[14px] font-semibold">
              {error}
            </div>
          )}
          {isLoading && (
            <div className="mb-[16px] p-[12px] rounded-[10px] bg-neutral-light-gray text-neutral-gray text-[14px] font-semibold">
              Loading listing...
            </div>
          )}
          <div className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.08)] p-[32px]">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-[24px]">
                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-4 gap-[12px]">
                    {[
                      { type: "apartment" as PropertyType, label: "Apartment" },
                      { type: "studio" as PropertyType, label: "Studio" },
                      { type: "house" as PropertyType, label: "House" },
                      { type: "room" as PropertyType, label: "Room" },
                    ].map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setPropertyType(option.type)}
                        className={`p-[16px] rounded-[10px] border-2 text-[14px] font-semibold transition-all ${
                          propertyType === option.type
                            ? "border-brand-primary bg-brand-light text-brand-primary"
                            : "border-[rgba(0,0,0,0.08)] bg-white text-neutral-gray hover:border-brand-primary"
                        }`}
                      >
                        <Home className="w-[24px] h-[24px] mx-auto mb-[8px]" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Modern 2BR Apartment in City Center"
                    className="w-full px-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your property, highlight key features, nearby amenities..."
                    rows={6}
                    className="w-full px-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors resize-none"
                  />
                  <p className="text-[12px] text-neutral-gray mt-[4px]">
                    {description.length} / 1000 characters
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-[24px]">
                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street address"
                    className="w-full px-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Berlin"
                      className="w-full px-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g., 10115"
                      className="w-full px-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-[16px]">
                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Bedrooms
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <button
                        onClick={() => setBedrooms(Math.max(0, bedrooms - 1))}
                        className="w-[40px] h-[40px] rounded-[8px] bg-neutral-light-gray text-neutral-black font-bold hover:bg-[rgba(0,0,0,0.08)] transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-[20px] font-bold text-neutral-black">{bedrooms}</div>
                      </div>
                      <button
                        onClick={() => setBedrooms(bedrooms + 1)}
                        className="w-[40px] h-[40px] rounded-[8px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Bathrooms
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <button
                        onClick={() => setBathrooms(Math.max(1, bathrooms - 1))}
                        className="w-[40px] h-[40px] rounded-[8px] bg-neutral-light-gray text-neutral-black font-bold hover:bg-[rgba(0,0,0,0.08)] transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-[20px] font-bold text-neutral-black">{bathrooms}</div>
                      </div>
                      <button
                        onClick={() => setBathrooms(bathrooms + 1)}
                        className="w-[40px] h-[40px] rounded-[8px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Area (m²) *
                    </label>
                    <input
                      type="number"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="75"
                      className="w-full px-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing */}
            {currentStep === 3 && (
              <div className="space-y-[24px]">
                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Monthly Rent (€) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-[16px] top-[50%] -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                      <input
                        type="number"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        placeholder="1850"
                        className="w-full pl-[44px] pr-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Security Deposit (€) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-[16px] top-[50%] -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                      <input
                        type="number"
                        value={deposit}
                        onChange={(e) => setDeposit(e.target.value)}
                        placeholder="1850"
                        className="w-full pl-[44px] pr-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Available From *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-[16px] top-[50%] -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full pl-[44px] pr-[16px] py-[12px] bg-neutral-light-gray rounded-[10px] text-[14px] text-neutral-black placeholder:text-neutral-gray border-2 border-transparent focus:border-brand-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                      Minimum Stay (months)
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <button
                        onClick={() => setMinStay(Math.max(1, minStay - 1))}
                        className="w-[40px] h-[40px] rounded-[8px] bg-neutral-light-gray text-neutral-black font-bold hover:bg-[rgba(0,0,0,0.08)] transition-colors"
                      >
                        −
                      </button>
                      <div className="flex-1 text-center">
                        <div className="text-[20px] font-bold text-neutral-black">{minStay}</div>
                      </div>
                      <button
                        onClick={() => setMinStay(minStay + 1)}
                        className="w-[40px] h-[40px] rounded-[8px] bg-brand-primary text-white font-bold hover:bg-brand-primary-dark transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-light rounded-[10px] p-[16px] border border-brand-primary">
                  <div className="flex items-start gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-[20px] h-[20px] text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-bold text-neutral-black mb-[4px]">
                        Utilities & Additional Costs
                      </h4>
                      <p className="text-[13px] text-neutral-gray mb-[12px]">
                        Specify if utilities are included or add them as additional costs
                      </p>
                      <div className="flex items-center gap-[12px]">
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={utilitiesIncluded}
                            onChange={(e) => setUtilitiesIncluded(e.target.checked)}
                            className="w-[18px] h-[18px] accent-brand-primary"
                          />
                          <span className="text-[13px] text-neutral-black">Utilities Included</span>
                        </label>
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={registrationPossible}
                            onChange={(e) => setRegistrationPossible(e.target.checked)}
                            className="w-[18px] h-[18px] accent-brand-primary"
                          />
                          <span className="text-[13px] text-neutral-black">Registration Possible</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Photos & Amenities */}
            {currentStep === 4 && (
              <div className="space-y-[24px]">
                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[8px]">
                    Property Photos
                  </label>
                  <div className="grid grid-cols-3 gap-[16px]">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative aspect-[4/3] rounded-[10px] overflow-hidden group">
                        <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-contain object-center bg-[#F3F4F6]" />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-[8px] right-[8px] w-[32px] h-[32px] bg-neutral-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-[18px] h-[18px] text-white" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < 10 && (
                      <label className="aspect-[4/3] rounded-[10px] border-2 border-dashed border-[rgba(0,0,0,0.16)] bg-neutral-light-gray flex flex-col items-center justify-center cursor-pointer hover:border-brand-primary hover:bg-brand-light transition-all">
                        <Upload className="w-[32px] h-[32px] text-neutral-gray mb-[8px]" />
                        <span className="text-[13px] font-medium text-neutral-gray">Upload Photo</span>
                        <input
                          type="file"
                          onChange={(event) => {
                            void handleImageUpload(event);
                          }}
                          className="hidden"
                          accept="image/*"
                          multiple
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[12px] text-neutral-gray mt-[8px]">
                    Upload up to 10 photos. First photo will be the cover image.
                  </p>
                  {isUploadingImages && (
                    <p className="text-[12px] text-neutral-gray mt-[4px]">Uploading images...</p>
                  )}
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[12px]">
                    Amenities
                  </label>
                  <div className="grid grid-cols-3 gap-[12px]">
                    {amenities.map((amenity) => {
                      const Icon = amenity.icon;
                      return (
                        <button
                          key={amenity.id}
                          onClick={() => toggleAmenity(amenity.id)}
                          className={`flex items-center gap-[12px] p-[12px] rounded-[10px] border-2 text-[14px] font-medium transition-all ${
                            selectedAmenities.includes(amenity.id)
                              ? "border-brand-primary bg-brand-light text-brand-primary"
                              : "border-[rgba(0,0,0,0.08)] bg-white text-neutral-gray hover:border-brand-primary"
                          }`}
                        >
                          <Icon className="w-[20px] h-[20px]" />
                          {amenity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-neutral-black mb-[12px]">
                    House Rules
                  </label>
                  <div className="grid grid-cols-3 gap-[12px]">
                    {houseRules.map((rule) => {
                      const Icon = rule.icon;
                      return (
                        <button
                          key={rule.id}
                          onClick={() => toggleRule(rule.id)}
                          className={`flex items-center gap-[12px] p-[12px] rounded-[10px] border-2 text-[14px] font-medium transition-all ${
                            selectedRules.includes(rule.id)
                              ? "border-accent-blue bg-accent-blue-light text-accent-blue"
                              : "border-[rgba(0,0,0,0.08)] bg-white text-neutral-gray hover:border-accent-blue"
                          }`}
                        >
                          <Icon className="w-[20px] h-[20px]" />
                          {rule.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-[24px]">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="px-[24px] py-[12px] bg-white text-neutral-black font-semibold rounded-[10px] border-2 border-[rgba(0,0,0,0.08)] hover:border-brand-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>

            <div className="flex items-center gap-[12px]">
              <button
                onClick={() => {
                    if (!isSaving && !isUploadingImages) {
                    void saveListing("draft");
                  }
                }}
                  disabled={isSaving || isLoading || isUploadingImages}
                className="px-[24px] py-[12px] text-neutral-gray font-semibold hover:text-neutral-black transition-colors"
              >
                {isSaving ? "Saving..." : "Save as Draft"}
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="px-[32px] py-[12px] bg-brand-primary text-white font-semibold rounded-[10px] hover:bg-brand-primary-dark disabled:bg-neutral-gray disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (!isSaving && !isUploadingImages) {
                      void saveListing("active");
                    }
                  }}
                  disabled={isSaving || isLoading || isUploadingImages || !hasRequiredPublishFields()}
                  className="px-[32px] py-[12px] bg-accent-blue text-white font-semibold rounded-[10px] hover:bg-accent-blue-dark disabled:bg-neutral-gray disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? "Saving..." : isEditMode ? "Update Listing" : "Publish Listing"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </LandlordPortalLayout>
  );
}
