import { ChevronDown, Info, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { DateOnlyPicker } from "../components/date-only-picker";
import { API_BASE } from "../config";

type TernaryArea = "" | "no" | "shared" | "private";
type YesNo = "" | "yes" | "no";

const kinds = ["Entire place", "Private room", "Shared room"];
const propertyTypes = ["House", "Building", "Apartment"];
const minRentalOptions = [
  "No minimum",
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "5 months",
  "6 months",
  "7 months",
  "8 months",
  "9 months",
  "10 months",
  "11 months",
  "12 months",
  "1.5 years",
  "2 years",
];
const maxRentalOptions = [
  "No maximum",
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "5 months",
  "6 months",
  "7 months",
  "8 months",
  "9 months",
  "10 months",
  "11 months",
  "12 months",
  "1.5 years",
  "2 years",
];
const bedroomsOptions = ["Select", "Studio", "1", "2", "3", "4", "5", "6", "7", "8+"];
const bathroomOptions = ["Select", "No", "Private", "Male", "Female", "Mixed"];
const bathroomsCountOptions = ["Select", "None", "1", "2", "3+"];
const heatingOptions = ["Select", "Central heating", "Electric", "Gas", "District heating", "Floor heating"];
const flooringOptions = ["Select", "Laminate", "Carpet", "Stone", "Wood", "Plastic", "Other"];
const costTypeOptions = ["Electricity", "Water", "Gas", "Internet", "Broadcasting fee", "Cleaning", "Administration", "Membership fee", "Other"];
const utilityAddOptions = [
  "Broadcasting fee",
];
const additionalRequiredCostOptions = ["Administration", "Membership fee", "Cleaning", "Other"];
const optionalServicesOptions = [
  "Bike rent",
  "Cleaning",
  "Early move-in",
  "Early move-out",
  "Final cleaning",
  "Full board",
  "Gym",
  "Half board",
  "Late move-in",
  "Late move-out",
  "Overnight guests",
  "Other optional costs",
  "Parking",
  "Towels/Bedding",
  "End-early fee",
];
const depositOptions = ["Security deposit", "Bedding deposit", "Towel deposit", "Other deposits"];
const advancedPricingMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const agePreferenceOptions = [
  "No preference",
  ...Array.from({ length: 33 }, (_, index) => String(index + 18)),
];

interface CostLine {
  type: string;
  includedInRent: "Included in rent" | "Paid separately";
  frequency: "every month" | "one-time";
  estimateType: "Estimate" | "Exact";
  amount: string;
}

interface OptionalServiceLine {
  type: string;
  includedInRent: "Included in rent" | "Paid separately";
  frequency: "At move-in" | "every month" | "one-time";
  amount: string;
}

interface DepositLine {
  type: string;
  requirement: "Required" | "Optional";
  amount: string;
}

interface UploadedMediaItem {
  url: string;
  type: "photo";
}

interface ApiListing {
  kind?: string;
  propertyType?: string;
  city?: string;
  country?: string;
  address?: string;
  apartmentNumber?: string;
  floorNumber?: string;
  isGroundFloor?: boolean;
  rentalRegistrationNumber?: string;
  availableFrom?: string;
  monthlyRent?: number;
  currency?: string;
  minimumRentalPeriod?: number;
  maximumRentalPeriod?: number;
  propertySize?: number;
  suitablePeopleCount?: number;
  spaceDescription?: string;
  bedroomsCount?: number;
  bedroomFurnished?: boolean;
  lockOnBedroom?: boolean;
  kitchen?: TernaryArea;
  toilet?: TernaryArea;
  bathroomStructure?: { count?: number; type?: string };
  livingRoom?: TernaryArea;
  balconyTerrace?: TernaryArea;
  garden?: TernaryArea;
  basement?: TernaryArea;
  parking?: TernaryArea;
  wheelchairAccessible?: boolean;
  elevator?: boolean;
  allergyFriendly?: boolean;
  amenities?: {
    bed?: boolean;
    wifi?: boolean;
    desk?: boolean;
    closet?: boolean;
    tv?: boolean;
    washingMachine?: boolean;
    dryer?: boolean;
    dishwasher?: boolean;
    kitchenware?: TernaryArea;
    heating?: string;
    airConditioning?: boolean;
    flooring?: string;
    livingRoomFurniture?: boolean;
  };
  rentCalculation?: "daily" | "half-monthly" | "monthly";
  cancellationPolicy?: "strict" | "flexible";
  utilities?: Array<{ type?: string; included?: boolean; frequency?: string; amount?: number }>;
  deposits?: Array<{ type?: string; requirement?: string; amount?: number }>;
  optionalServices?: Array<{ type?: string; frequency?: string; amount?: number }>;
  preferredGender?: "male" | "female" | "no-preference";
  minimumAgePreference?: number;
  maximumAgePreference?: number;
  preferredTenantType?: "any" | "students" | "working";
  couplesAllowed?: boolean;
  registrationPossible?: boolean;
  petsPolicy?: "no" | "yes" | "negotiable";
  musicPolicy?: "no" | "yes" | "negotiable";
  smokingPolicy?: "no" | "yes" | "negotiable" | "outside-only";
  requireProofOfIdentity?: boolean;
  requireProofOfOccupation?: boolean;
  requireProofOfIncome?: boolean;
  media?: Array<{ url?: string; type?: string }>;
  agreedToTerms?: string;
  status?: "active" | "draft" | "inactive";
}

const kindToUiValue: Record<string, string> = {
  "entire-place": "Entire place",
  "private-room": "Private room",
  "shared-room": "Shared room",
};

const propertyTypeToUiValue: Record<string, string> = {
  house: "House",
  apartment: "Apartment",
  building: "Building",
};

const heatingToUiValue: Record<string, string> = {
  "central-heating": "Central heating",
  electric: "Electric",
  gas: "Gas",
  "district-heating": "District heating",
  "floor-heating": "Floor heating",
};

const flooringToUiValue: Record<string, string> = {
  laminate: "Laminate",
  carpet: "Carpet",
  stone: "Stone",
  wood: "Wood",
  plastic: "Plastic",
  other: "Other",
};

function TernaryRadioGroup({
  name,
  value,
  onChange,
}: {
  name: string;
  value: TernaryArea;
  onChange: (value: TernaryArea) => void;
}) {
  return (
    <div className="flex items-center gap-[16px] text-[13px] text-[#244A57]">
      <label className="inline-flex items-center gap-[8px] cursor-pointer">
        <input type="radio" name={name} checked={value === "no"} onChange={() => onChange("no")} className="w-[14px] h-[14px] accent-brand-primary" />
        <span>No</span>
      </label>
      <label className="inline-flex items-center gap-[8px] cursor-pointer">
        <input type="radio" name={name} checked={value === "shared"} onChange={() => onChange("shared")} className="w-[14px] h-[14px] accent-brand-primary" />
        <span>Shared</span>
      </label>
      <label className="inline-flex items-center gap-[8px] cursor-pointer">
        <input type="radio" name={name} checked={value === "private"} onChange={() => onChange("private")} className="w-[14px] h-[14px] accent-brand-primary" />
        <span>Private</span>
      </label>
    </div>
  );
}

function YesNoRadioGroup({
  name,
  value,
  onChange,
}: {
  name: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
}) {
  return (
    <div className="flex items-center gap-[16px] text-[13px] text-[#244A57]">
      <label className="inline-flex items-center gap-[8px] cursor-pointer">
        <input type="radio" name={name} checked={value === "no"} onChange={() => onChange("no")} className="w-[14px] h-[14px] accent-brand-primary" />
        <span>No</span>
      </label>
      <label className="inline-flex items-center gap-[8px] cursor-pointer">
        <input type="radio" name={name} checked={value === "yes"} onChange={() => onChange("yes")} className="w-[14px] h-[14px] accent-brand-primary" />
        <span>Yes</span>
      </label>
    </div>
  );
}

function InfoTooltip({
  text,
  iconClassName,
}: {
  text: string;
  iconClassName?: string;
}) {
  return (
    <span className="relative inline-flex items-center group">
      <Info aria-label={text} className={iconClassName ?? "w-[14px] h-[14px] text-[#5A7380] cursor-help"} />
      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] hidden group-hover:block z-50 w-[220px] rounded-[6px] bg-[#12303B] text-white text-[11px] leading-[1.35] px-[10px] py-[8px] shadow-md">
        {text}
      </span>
    </span>
  );
}

export function LandlordAddListing() {
  const apiBase = API_BASE;
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const totalSections = 7;
  const completionPercentage = Math.max(
    0,
    Math.min(100, ((currentSection - 2) / (totalSections - 2)) * 100)
  );

  const [kind, setKind] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [cityCountry, setCityCountry] = useState("");
  const [streetHouse, setStreetHouse] = useState("");
  const [rentalRegistrationNumber, setRentalRegistrationNumber] = useState("");
  const [apartmentNumber, setApartmentNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [isGroundFloor, setIsGroundFloor] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("");
  const [isAvailableFromPickerOpen, setIsAvailableFromPickerOpen] = useState(false);
  const [monthlyRent, setMonthlyRent] = useState("");
  const [currency, setCurrency] = useState("");
  const [minimumRentalPeriod, setMinimumRentalPeriod] = useState("");
  const [maximumRentalPeriod, setMaximumRentalPeriod] = useState("");

  const [propertySize, setPropertySize] = useState("");
  const [suitablePeopleCount, setSuitablePeopleCount] = useState("0");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [bedroomsCount, setBedroomsCount] = useState("Select");
  const [bedroomFurnished, setBedroomFurnished] = useState<YesNo>("");
  const [lockOnBedroom, setLockOnBedroom] = useState<YesNo>("");

  const [kitchen, setKitchen] = useState<TernaryArea>("");
  const [toilet, setToilet] = useState<TernaryArea>("");
  const [bathroom, setBathroom] = useState("Select");
  const [bathroomsCount, setBathroomsCount] = useState("Select");
  const [livingRoom, setLivingRoom] = useState<TernaryArea>("");
  const [balconyTerrace, setBalconyTerrace] = useState<TernaryArea>("");
  const [garden, setGarden] = useState<TernaryArea>("");
  const [basement, setBasement] = useState<TernaryArea>("");
  const [parking, setParking] = useState<TernaryArea>("");
  const [wheelchairAccessible, setWheelchairAccessible] = useState<YesNo>("");
  const [elevator, setElevator] = useState<YesNo>("");
  const [allergyFriendly, setAllergyFriendly] = useState<YesNo>("");

  const [bedAmenity, setBedAmenity] = useState<YesNo>("");
  const [wifiAmenity, setWifiAmenity] = useState<YesNo>("");
  const [deskAmenity, setDeskAmenity] = useState<YesNo>("");
  const [closetAmenity, setClosetAmenity] = useState<YesNo>("");
  const [tvAmenity, setTvAmenity] = useState<YesNo>("");
  const [washingMachineAmenity, setWashingMachineAmenity] = useState<YesNo>("");
  const [dryerAmenity, setDryerAmenity] = useState<YesNo>("");
  const [dishwasherAmenity, setDishwasherAmenity] = useState<YesNo>("");
  const [kitchenwareAmenity, setKitchenwareAmenity] = useState<TernaryArea>("");
  const [heatingAmenity, setHeatingAmenity] = useState("Select");
  const [airConditioningAmenity, setAirConditioningAmenity] = useState<YesNo>("");
  const [flooringAmenity, setFlooringAmenity] = useState("Select");
  const [livingRoomFurnitureAmenity, setLivingRoomFurnitureAmenity] = useState<YesNo>("");

  const rentCalculation: "monthly" = "monthly";
  const [cancellationPolicy, setCancellationPolicy] = useState<"" | "strict" | "flexible">("");
  const [rentPricingMode, setRentPricingMode] = useState<"" | "basic" | "advanced">("");
  const [advancedMonthlyRates, setAdvancedMonthlyRates] = useState<Record<string, string>>({});
  const [utilityLines, setUtilityLines] = useState<CostLine[]>([
    { type: "Electricity", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
    { type: "Water", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
    { type: "Gas", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
    { type: "Internet", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
  ]);
  const [openCostMenu, setOpenCostMenu] = useState<null | "utility" | "required" | "optional" | "deposit">(null);
  const costMenusRef = useRef<HTMLDivElement | null>(null);
  const [additionalRequiredLines, setAdditionalRequiredLines] = useState<OptionalServiceLine[]>([]);
  const [optionalServiceLines, setOptionalServiceLines] = useState<OptionalServiceLine[]>([]);
  const [depositLines, setDepositLines] = useState<DepositLine[]>([]);

  const [preferredGender, setPreferredGender] = useState<"" | "male" | "female" | "no-preference">("");
  const [minimumAgePreference, setMinimumAgePreference] = useState("No preference");
  const [maximumAgePreference, setMaximumAgePreference] = useState("No preference");
  const [preferredTenantType, setPreferredTenantType] = useState<"" | "any" | "students" | "working">("");
  const [couplesAllowed, setCouplesAllowed] = useState<YesNo>("");
  const [registrationPossible, setRegistrationPossible] = useState<YesNo>("");
  const [petsPolicy, setPetsPolicy] = useState<"" | "no" | "yes" | "negotiable">("");
  const [musicPolicy, setMusicPolicy] = useState<"" | "no" | "yes" | "negotiable">("");
  const [smokingPolicy, setSmokingPolicy] = useState<"" | "no" | "yes" | "negotiable" | "outside-only">("");
  const [requireProofOfIdentity, setRequireProofOfIdentity] = useState(false);
  const [requireProofOfOccupationOrEnrollment, setRequireProofOfOccupationOrEnrollment] = useState(false);
  const [requireProofOfIncome, setRequireProofOfIncome] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToDocumentPrivacyPolicy, setAgreedToDocumentPrivacyPolicy] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMediaItem[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingListing, setIsLoadingListing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [listingStatus, setListingStatus] = useState<"active" | "inactive">("active");

  const { id: listingId } = useParams();
  const isEditMode = !!listingId;

  const updateUtilityLine = <K extends keyof CostLine>(index: number, key: K, value: CostLine[K]) => {
    setUtilityLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  };

  const updateOptionalServiceLine = <K extends keyof OptionalServiceLine>(
    index: number,
    key: K,
    value: OptionalServiceLine[K]
  ) => {
    setOptionalServiceLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  };

  const updateAdditionalRequiredLine = <K extends keyof OptionalServiceLine>(
    index: number,
    key: K,
    value: OptionalServiceLine[K]
  ) => {
    setAdditionalRequiredLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  };

  const updateDepositLine = <K extends keyof DepositLine>(index: number, key: K, value: DepositLine[K]) => {
    setDepositLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  };

  useEffect(() => {
    if (!isEditMode || !listingId) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setSubmitError("Please log in to edit your listing");
      return;
    }

    const toDateValue = (input?: string) => {
      if (!input) {
        return "";
      }
      const parsed = new Date(input);
      if (Number.isNaN(parsed.getTime())) {
        return "";
      }
      const year = parsed.getFullYear();
      const month = `${parsed.getMonth() + 1}`.padStart(2, "0");
      const day = `${parsed.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const mapMonthsToOption = (fallback: string, months?: number) => {
      if (!months || months < 1) {
        return fallback;
      }
      return months === 1 ? "1 month" : `${months} months`;
    };

    const loadListingForEdit = async () => {
      setIsLoadingListing(true);
      setSubmitError(null);

      try {
        const response = await fetch(`${apiBase}/api/listings/mine/${listingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load listing for edit");
        }

        const payload = (await response.json()) as { listing?: ApiListing };
        const listing = payload.listing;
        if (!listing) {
          throw new Error("Listing data is missing");
        }

        setKind(kindToUiValue[listing.kind ?? ""] ?? "");
        setPropertyType(propertyTypeToUiValue[listing.propertyType ?? ""] ?? "");
        setCityCountry(`${listing.city ?? ""}, ${listing.country ?? "Netherlands"}`.replace(/^,\s*/, "").trim());
        setStreetHouse(listing.address ?? "");
        setApartmentNumber(listing.apartmentNumber ?? "");
        setFloorNumber(listing.floorNumber ?? "");
        setIsGroundFloor(Boolean(listing.isGroundFloor));
        setRentalRegistrationNumber(listing.rentalRegistrationNumber ?? "");
        setAvailableFrom(toDateValue(listing.availableFrom));
        setMonthlyRent(listing.monthlyRent !== undefined ? String(listing.monthlyRent) : "");
        setCurrency("EUR");
        setMinimumRentalPeriod(mapMonthsToOption("No minimum", listing.minimumRentalPeriod));
        setMaximumRentalPeriod(
          listing.maximumRentalPeriod && listing.maximumRentalPeriod > 0
            ? mapMonthsToOption("No maximum", listing.maximumRentalPeriod)
            : "No maximum"
        );

        setPropertySize(listing.propertySize !== undefined ? String(listing.propertySize) : "");
        setSuitablePeopleCount(listing.suitablePeopleCount !== undefined ? String(listing.suitablePeopleCount) : "1");
        setSpaceDescription(listing.spaceDescription ?? "");
        setBedroomsCount(
          listing.bedroomsCount === undefined
            ? "Select"
            : listing.bedroomsCount === 0
            ? "Studio"
            : listing.bedroomsCount >= 8
            ? "8+"
            : String(listing.bedroomsCount)
        );
        setBedroomFurnished(listing.bedroomFurnished ? "yes" : "no");
        setLockOnBedroom(listing.lockOnBedroom ? "yes" : "no");

        setKitchen(listing.kitchen ?? "no");
        setToilet(listing.toilet ?? "no");
        setBathroom(listing.bathroomStructure?.type ? listing.bathroomStructure.type[0].toUpperCase() + listing.bathroomStructure.type.slice(1) : "Select");
        setBathroomsCount(
          listing.bathroomStructure?.count === undefined
            ? "Select"
            : listing.bathroomStructure.count === 0
            ? "None"
            : listing.bathroomStructure.count >= 3
            ? "3+"
            : String(listing.bathroomStructure.count)
        );
        setLivingRoom(listing.livingRoom ?? "no");
        setBalconyTerrace(listing.balconyTerrace ?? "no");
        setGarden(listing.garden ?? "no");
        setBasement(listing.basement ?? "no");
        setParking(listing.parking ?? "no");
        setWheelchairAccessible(listing.wheelchairAccessible ? "yes" : "no");
        setElevator(listing.elevator ? "yes" : "no");
        setAllergyFriendly(listing.allergyFriendly ? "yes" : "no");

        setBedAmenity(listing.amenities?.bed ? "yes" : listing.amenities?.bed === false ? "no" : "");
        setWifiAmenity(listing.amenities?.wifi ? "yes" : listing.amenities?.wifi === false ? "no" : "");
        setDeskAmenity(listing.amenities?.desk ? "yes" : listing.amenities?.desk === false ? "no" : "");
        setClosetAmenity(listing.amenities?.closet ? "yes" : listing.amenities?.closet === false ? "no" : "");
        setTvAmenity(listing.amenities?.tv ? "yes" : listing.amenities?.tv === false ? "no" : "");
        setWashingMachineAmenity(listing.amenities?.washingMachine ? "yes" : listing.amenities?.washingMachine === false ? "no" : "");
        setDryerAmenity(listing.amenities?.dryer ? "yes" : listing.amenities?.dryer === false ? "no" : "");
        setDishwasherAmenity(listing.amenities?.dishwasher ? "yes" : listing.amenities?.dishwasher === false ? "no" : "");
        setKitchenwareAmenity(listing.amenities?.kitchenware ?? "");
        setHeatingAmenity(heatingToUiValue[listing.amenities?.heating ?? ""] ?? "Select");
        setAirConditioningAmenity(listing.amenities?.airConditioning ? "yes" : listing.amenities?.airConditioning === false ? "no" : "");
        setFlooringAmenity(flooringToUiValue[listing.amenities?.flooring ?? ""] ?? "Select");
        setLivingRoomFurnitureAmenity(listing.amenities?.livingRoomFurniture ? "yes" : listing.amenities?.livingRoomFurniture === false ? "no" : "");

        setCancellationPolicy(listing.cancellationPolicy ?? "");
        setUtilityLines(
          listing.utilities?.length
            ? listing.utilities.map((line) => ({
                type: line.type ?? "Other",
                includedInRent: line.included ? "Included in rent" : "Paid separately",
                frequency: line.frequency === "one-time" ? "one-time" : "every month",
                estimateType: "Estimate",
                amount: String(line.amount ?? 0),
              }))
            : []
        );
        setDepositLines(
          listing.deposits?.map((line) => ({
            type: line.type ?? "Security deposit",
            requirement: line.requirement === "Optional" ? "Optional" : "Required",
            amount: String(line.amount ?? 0),
          })) ?? []
        );
        setOptionalServiceLines(
          listing.optionalServices?.map((line) => ({
            type: line.type ?? "Other optional costs",
            includedInRent: "Paid separately",
            frequency: line.frequency === "monthly" ? "every month" : "one-time",
            amount: String(line.amount ?? 0),
          })) ?? []
        );

        setPreferredGender(listing.preferredGender ?? "");
        setMinimumAgePreference(listing.minimumAgePreference ? String(listing.minimumAgePreference) : "No preference");
        setMaximumAgePreference(listing.maximumAgePreference ? String(listing.maximumAgePreference) : "No preference");
        setPreferredTenantType(listing.preferredTenantType ?? "");
        setCouplesAllowed(listing.couplesAllowed ? "yes" : listing.couplesAllowed === false ? "no" : "");
        setRegistrationPossible(listing.registrationPossible ? "yes" : listing.registrationPossible === false ? "no" : "");
        setPetsPolicy(listing.petsPolicy ?? "");
        setMusicPolicy(listing.musicPolicy ?? "");
        setSmokingPolicy(listing.smokingPolicy ?? "");
        setRequireProofOfIdentity(Boolean(listing.requireProofOfIdentity));
        setRequireProofOfOccupationOrEnrollment(Boolean(listing.requireProofOfOccupation));
        setRequireProofOfIncome(Boolean(listing.requireProofOfIncome));

        setUploadedMedia(
          (listing.media ?? [])
            .filter((item) => item.url)
            .map((item) => ({
              url: item.url as string,
              type: "photo" as const,
            }))
        );

        setAgreedToTerms(Boolean(listing.agreedToTerms));
        setListingStatus(listing.status === "inactive" ? "inactive" : "active");
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Failed to load listing for edit");
      } finally {
        setIsLoadingListing(false);
      }
    };

    void loadListingForEdit();
  }, [apiBase, isEditMode, listingId]);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setUploadError("Please log in to upload photos.");
      return;
    }

    const selectedFiles = Array.from(files).slice(0, 10);
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    setIsUploadingPhotos(true);
    setUploadError(null);

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
        throw new Error(payload.message ?? "Failed to upload photos");
      }

      const payload = (await response.json()) as { urls?: string[] };
      const nextMedia = (payload.urls ?? []).map((url) => ({ url, type: "photo" as const }));
      setUploadedMedia((prev) => [...prev, ...nextMedia]);
      setSectionError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload photos");
    } finally {
      setIsUploadingPhotos(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const parseCityAndCountry = () => {
    const [cityPart, ...countryParts] = cityCountry.split(",");
    const city = cityPart?.trim() || "Rotterdam";
    const country = countryParts.join(",").trim() || "Netherlands";
    return { city, country };
  };

  const parseAvailableFromDate = () => {
    if (!availableFrom) {
      return null;
    }

    const parsed = new Date(`${availableFrom}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseBathroomsCount = () => {
    if (bathroomsCount === "None" || bathroomsCount === "Select") {
      return 0;
    }
    if (bathroomsCount === "3+") {
      return 3;
    }
    return Number.parseInt(bathroomsCount, 10) || 0;
  };

  const isMultiUnitProperty = propertyType === "Apartment" || propertyType === "Building";

  const getSectionValidationErrors = (section: 1 | 2 | 3 | 4 | 5 | 6 | 7): string[] => {
    const errors: string[] = [];

    if (section === 1) {
      if (!kind) errors.push("What kind of place are you listing?");
      if (!propertyType) errors.push("What type of property is this?");
      if (!cityCountry.trim()) errors.push("City, country");
      if (!streetHouse.trim()) errors.push("Street, house number");
      if (!availableFrom) errors.push("Available from");
      if (!monthlyRent || Number.parseFloat(monthlyRent) <= 0) errors.push("Monthly rent must be greater than 0");
      if (!currency) errors.push("Currency");
    }

    if (section === 2) {
      if (!propertySize || Number.parseFloat(propertySize) <= 0) errors.push("Property size must be greater than 0");
      if (!suitablePeopleCount || Number.parseInt(suitablePeopleCount, 10) < 1) errors.push("Suitable for how many? must be at least 1");
      if (!spaceDescription.trim()) errors.push("Description");
      if (bedroomsCount === "Select") errors.push("Number of bedrooms");
      if (!bedroomFurnished) errors.push("Bedroom furnished");
    }

    if (section === 3) {
      if (!kitchen) errors.push("Kitchen");
      if (!toilet) errors.push("Toilet");
    }

    if (section === 4) {
      if (!bedAmenity) errors.push("Bed");
      if (!wifiAmenity) errors.push("WiFi");
    }

    if (section === 5) {
      if (!cancellationPolicy) errors.push("Cancellation policy");
    }

    if (section === 7) {
      if (uploadedMedia.length === 0) errors.push("Photos");
      if (!agreedToTerms) errors.push("HousingAnywhere terms & conditions agreement");
      if (!agreedToDocumentPrivacyPolicy) errors.push("Document usage and Privacy Policy agreement");
    }

    return errors;
  };

  const validateSectionOrShowError = (section: 1 | 2 | 3 | 4 | 5 | 6 | 7) => {
    const errors = getSectionValidationErrors(section);
    if (errors.length === 0) {
      setSectionError(null);
      return true;
    }

    setSectionError(`Please complete required fields: ${errors.join(", ")}.`);
    return false;
  };

  const handleSubmitListing = async () => {
    if (!validateSectionOrShowError(7)) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSectionError(null);

    try {
      // Transform form data to API schema
      const payload = {
        kind: kind.toLowerCase().replace(" ", "-"),
        propertyType: propertyType.toLowerCase(),
        address: streetHouse,
        city: parseCityAndCountry().city,
        country: parseCityAndCountry().country,
        apartmentNumber: isMultiUnitProperty ? apartmentNumber : undefined,
        floorNumber: isMultiUnitProperty ? floorNumber : undefined,
        isGroundFloor: isMultiUnitProperty ? isGroundFloor : false,
        rentalRegistrationNumber: rentalRegistrationNumber.trim() || undefined,
        availableFrom: availableFrom,
        monthlyRent: parseFloat(monthlyRent) || 0,
        currency: "EUR",
        minimumRentalPeriod: Math.max(1, parseInt(minimumRentalPeriod.match(/\d+/)?.[0] || "1")),
        maximumRentalPeriod: maximumRentalPeriod === "No maximum" ? undefined : parseInt(maximumRentalPeriod.match(/\d+/)?.[0] || ""),
        propertySize: parseFloat(propertySize) || 0,
        suitablePeopleCount: parseInt(suitablePeopleCount) || 1,
        spaceDescription,
        bedroomsCount: bedroomsCount === "Select" ? 0 : bedroomsCount === "Studio" ? 0 : parseInt(bedroomsCount),
        bedroomFurnished: bedroomFurnished === "yes",
        lockOnBedroom: lockOnBedroom === "yes",
        kitchen: kitchen || "no",
        toilet: toilet || "no",
        bathroomStructure: {
          count: parseBathroomsCount(),
          type: bathroom === "Select" ? "private" : bathroom.toLowerCase(),
        },
        livingRoom: livingRoom || "no",
        balconyTerrace: balconyTerrace || "no",
        garden: garden || "no",
        basement: basement || "no",
        parking: parking || "no",
        wheelchairAccessible: wheelchairAccessible === "yes",
        elevator: elevator === "yes",
        allergyFriendly: allergyFriendly === "yes",
        amenities: {
          bed: bedAmenity === "yes",
          wifi: wifiAmenity === "yes",
          desk: deskAmenity === "yes",
          closet: closetAmenity === "yes",
          tv: tvAmenity === "yes",
          washingMachine: washingMachineAmenity === "yes",
          dryer: dryerAmenity === "yes",
          dishwasher: dishwasherAmenity === "yes",
          kitchenware: kitchenwareAmenity || "no",
          heating: heatingAmenity === "Select" ? "central-heating" : heatingAmenity.toLowerCase().replace(" ", "-"),
          airConditioning: airConditioningAmenity === "yes",
          flooring: flooringAmenity === "Select" ? "laminate" : flooringAmenity.toLowerCase(),
          livingRoomFurniture: livingRoomFurnitureAmenity === "yes",
        },
        rentCalculation,
        cancellationPolicy: cancellationPolicy || "flexible",
        utilities: utilityLines.map(line => ({
          type: line.type,
          // Backend only accepts monthly/quarterly/yearly for utilities.
          frequency: "monthly",
          included: line.includedInRent === "Included in rent",
          amount: parseFloat(line.amount) || 0,
        })),
        deposits: depositLines.map(line => ({
          type: line.type,
          requirement: line.requirement,
          amount: parseFloat(line.amount) || 0,
        })),
        optionalServices: optionalServiceLines.map(line => ({
          type: line.type,
          category: "other",
          frequency: line.frequency === "every month" ? "monthly" : "one-time",
          amount: parseFloat(line.amount) || 0,
        })),
        preferredGender: preferredGender || "no-preference",
        minimumAgePreference: minimumAgePreference === "No preference" ? undefined : parseInt(minimumAgePreference),
        maximumAgePreference: maximumAgePreference === "No preference" ? undefined : parseInt(maximumAgePreference),
        preferredTenantType: preferredTenantType || "any",
        couplesAllowed: couplesAllowed === "yes",
        registrationPossible: registrationPossible === "yes",
        petsPolicy: petsPolicy || "no",
        musicPolicy: musicPolicy || "no",
        smokingPolicy: smokingPolicy || "no",
        requireProofOfIdentity,
        requireProofOfOccupation: requireProofOfOccupationOrEnrollment,
        requireProofOfIncome,
        media: uploadedMedia.map((item, index) => ({
          url: item.url,
          type: item.type,
          order: index,
        })),
        agreedToTerms: agreedToTerms ? new Date().toISOString() : undefined,
        title: `${propertyType} in ${cityCountry}`,
        status: listingStatus,
      };

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please log in to publish your listing");
      }

      const endpoint = isEditMode ? `${apiBase}/api/listings/${listingId}` : `${apiBase}/api/listings`;
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        const fieldErrors = error?.errors?.fieldErrors as Record<string, string[] | undefined> | undefined;
        const summarizedFieldErrors = fieldErrors
          ? Object.entries(fieldErrors)
              .flatMap(([field, messages]) => (messages ?? []).map((message) => `${field}: ${message}`))
              .join(", ")
          : "";
        const finalMessage = summarizedFieldErrors
          ? `${error.message || "Failed to save listing"} (${summarizedFieldErrors})`
          : error.message || "Failed to save listing";
        throw new Error(finalMessage);
      }

      const data = await response.json();
      navigate("/landlord/listings");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!costMenusRef.current) {
        return;
      }

      if (!costMenusRef.current.contains(event.target as Node)) {
        setOpenCostMenu(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [currentSection]);

  useEffect(() => {
    if (submitError || sectionError || uploadError) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [submitError, sectionError, uploadError]);

  const availableUtilityAddOptions = utilityAddOptions.filter(
    (option) => !utilityLines.some((line) => line.type === option)
  );
  const availableAdditionalRequiredCostOptions = additionalRequiredCostOptions.filter(
    (option) => !additionalRequiredLines.some((line) => line.type === option)
  );
  const availableOptionalServicesOptions = optionalServicesOptions.filter(
    (option) => !optionalServiceLines.some((line) => line.type === option)
  );
  const availableDepositOptions = depositOptions.filter(
    (option) => !depositLines.some((line) => line.type === option)
  );
  const contentBottomPaddingClass = currentSection === 1 ? "pb-[44px] md:pb-[56px]" : "pb-[120px] md:pb-[130px]";
  const sectionLayoutClass = "max-w-[760px] mr-auto w-full";

  return (
    <LandlordPortalLayout hideSidebar>
      <div className={`bg-[#F7F7F9] min-h-[calc(100vh-74px)] px-[20px] md:px-[28px] py-[24px] md:py-[32px] ${contentBottomPaddingClass}`}>
        <div className={sectionLayoutClass}>
        {submitError && (
          <div className="mb-[20px] p-[12px] bg-red-50 border border-red-200 rounded text-red-700 text-[13px]">
            {submitError}
          </div>
        )}
        {isEditMode && isLoadingListing && (
          <div className="mb-[20px] p-[12px] bg-slate-50 border border-slate-200 rounded text-slate-700 text-[13px]">
            Loading listing details...
          </div>
        )}
        {sectionError && (
          <div className="mb-[20px] p-[12px] bg-amber-50 border border-amber-200 rounded text-amber-800 text-[13px]">
            {sectionError}
          </div>
        )}
        {uploadError && (
          <div className="mb-[20px] p-[12px] bg-red-50 border border-red-200 rounded text-red-700 text-[13px]">
            {uploadError}
          </div>
        )}
        {currentSection === 1 && (
          <div className="w-full">
            <h1 className="text-[32px] leading-[1.1] font-bold text-neutral-black tracking-[-0.02em]">Create your listing</h1>

            <div className="mt-[30px]">
              <h2 className="text-[22px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Property</h2>

              <div className="mt-[16px] space-y-[18px]">
                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">What kind of place are you listing?*</label>
                  <div className="relative">
                    <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      <option value="">Select kind</option>
                      {kinds.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">What type of property is this?*</label>
                  <div className="relative">
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      <option value="">Select type</option>
                      {propertyTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[34px]">
              <h2 className="text-[22px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Address</h2>

              <div className="mt-[14px] space-y-[18px]">
                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">City, country*</label>
                  <div className="flex items-center gap-[8px]">
                    <input value={cityCountry} onChange={(e) => setCityCountry(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-brand-primary" placeholder="Rotterdam, Netherlands" />
                    <InfoTooltip text="Enter city and country for your listing" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">Street, house number*</label>
                  <input value={streetHouse} onChange={(e) => setStreetHouse(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-brand-primary" placeholder="Mathenesserlaan 22" />
                </div>

                {streetHouse.trim().length > 0 && isMultiUnitProperty && (
                  <div className="pt-[18px] max-w-[980px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block text-[12px] text-[#5A7380] mb-[6px]">Apartment number</label>
                        <input
                          value={apartmentNumber}
                          onChange={(e) => setApartmentNumber(e.target.value)}
                          className="w-full h-[44px] bg-white border border-[rgba(15,61,73,0.35)] px-[12px] text-[20px] text-[#1A1A1A] focus:outline-none focus:border-brand-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[12px] text-[#5A7380] mb-[6px]">Floor number</label>
                        <input
                          value={floorNumber}
                          onChange={(e) => setFloorNumber(e.target.value)}
                          className="w-full h-[44px] bg-white border border-[rgba(15,61,73,0.35)] px-[12px] text-[20px] text-[#1A1A1A] focus:outline-none focus:border-brand-primary"
                        />

                        <label className="mt-[10px] inline-flex items-center gap-[8px] cursor-pointer text-[12px] text-[#12303B]">
                          <input
                            type="checkbox"
                            checked={isGroundFloor}
                            onChange={(e) => setIsGroundFloor(e.target.checked)}
                            className="w-[14px] h-[14px] accent-brand-primary"
                          />
                          <span>Ground floor</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {streetHouse.trim().length > 0 && (
                  <div className="pt-[18px] max-w-[980px]">
                    <label className="block text-[12px] text-[#5A7380] mb-[6px]">Rental registration number</label>
                    <input
                      value={rentalRegistrationNumber}
                      onChange={(e) => setRentalRegistrationNumber(e.target.value)}
                      className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] text-[#1A1A1A] focus:outline-none focus:border-brand-primary"
                      placeholder=""
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[36px]">
              <h2 className="text-[22px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Pricing and availability</h2>

              <div className="mt-[14px] space-y-[18px]">
                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">Available from*</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsAvailableFromPickerOpen((prev) => !prev)}
                      className="w-full h-[40px] flex items-center justify-between bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[16px] text-[#1A1A1A] focus:outline-none focus:border-brand-primary"
                    >
                      <span>
                        {parseAvailableFromDate()?.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) ?? "Select date"}
                      </span>
                      <ChevronDown className="w-[16px] h-[16px] text-[#5A7380]" />
                    </button>
                    <DateOnlyPicker
                      isOpen={isAvailableFromPickerOpen}
                      onClose={() => setIsAvailableFromPickerOpen(false)}
                      selectedDate={parseAvailableFromDate()}
                      onDateChange={(date) => {
                        setAvailableFrom(toDateInputValue(date));
                        setSectionError(null);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[12px] text-[#5A7380] mb-[6px]">Monthly rent*</label>
                      <input type="number" min="1" step="0.01" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-brand-primary" placeholder="0" />
                  </div>

                  <div>
                    <label className="block text-[12px] text-[#5A7380] mb-[6px]">Currency</label>
                    <div className="flex items-center gap-[8px]">
                      <div className="relative w-full">
                        <select
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value)}
                          className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary"
                        >
                          <option value="">Select currency</option>
                          <option value="EUR">EUR</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                      </div>
                      <InfoTooltip text="All listing payments are processed in EUR." />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-[8px] text-[#5A7380]">
                  <InfoTooltip text="Advanced pricing can be configured in later steps" iconClassName="w-[14px] h-[14px] mt-[2px] cursor-help" />
                  <p className="text-[12px] leading-[1.5]">In the later steps, you can choose advanced price to set different rates for different months.</p>
                </div>
              </div>
            </div>

            <div className="mt-[36px]">
              <h2 className="text-[22px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Rental period</h2>

              <div className="mt-[14px] grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">Minimum rental period</label>
                  <div className="relative">
                    <select value={minimumRentalPeriod} onChange={(e) => setMinimumRentalPeriod(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      {minRentalOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[#5A7380] mb-[6px]">Maximum rental period</label>
                  <div className="relative">
                    <select value={maximumRentalPeriod} onChange={(e) => setMaximumRentalPeriod(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      {maxRentalOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[34px] flex items-center justify-between gap-[12px]">
              <button
                type="button"
                onClick={() => navigate("/landlord/dashboard")}
                className="h-[40px] px-[16px] border border-[rgba(0,0,0,0.16)] bg-white text-[#12303B] text-[11px] font-semibold hover:bg-neutral-light-gray transition-colors"
              >
                BACK
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateSectionOrShowError(1)) {
                    setCurrentSection(2);
                  }
                }}
                className="h-[40px] px-[16px] bg-brand-primary text-white text-[11px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                NEXT
              </button>
            </div>
          </div>
        )}

        {currentSection === 2 && (
          <div className="w-full">
            <h1 className="text-[32px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Space Overview</h1>

            <div className="mt-[30px] space-y-[24px]">
              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Property size m2*</label>
                <input type="number" min="1" step="0.1" value={propertySize} onChange={(e) => setPropertySize(e.target.value)} className="w-full h-[46px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[22px] leading-[1] text-[#1A1A1A] focus:outline-none focus:border-brand-primary" />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Suitable for how many? *</label>
                <input type="number" min="1" step="1" value={suitablePeopleCount} onChange={(e) => setSuitablePeopleCount(e.target.value)} className="w-full h-[46px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[22px] leading-[1] text-[#1A1A1A] focus:outline-none focus:border-brand-primary" />
                <p className="text-[18px] mt-[8px] text-[#4A6673]">How many people can live in this space (room, studio, apartment, etc.)?</p>
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Description *</label>
                <textarea value={spaceDescription} onChange={(e) => setSpaceDescription(e.target.value)} className="w-full h-[150px] resize-none bg-[#F2F2F3] border border-[rgba(0,0,0,0.10)] p-[16px] text-[20px] leading-[1.24] text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:border-brand-primary" placeholder="Write down anything else you would like to mention about the property (such as distances to nearby shops, information about tenants, conditions etc.)" />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Number of bedrooms *</label>
                <div className="relative">
                  <select value={bedroomsCount} onChange={(e) => setBedroomsCount(e.target.value)} className="w-full h-[46px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[22px] leading-[1] text-[#1A1A1A] appearance-none pr-[36px] focus:outline-none focus:border-brand-primary">
                    {bedroomsOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[4px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-[#5A7380]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[10px]">Bedroom furnished *</label>
                <YesNoRadioGroup name="bedroom-furnished" value={bedroomFurnished} onChange={setBedroomFurnished} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[10px]">Lock on bedroom</label>
                <YesNoRadioGroup name="lock-on-bedroom" value={lockOnBedroom} onChange={setLockOnBedroom} />
              </div>
            </div>
          </div>
        )}

        {currentSection === 3 && (
          <div className="w-full">
            <h1 className="text-[32px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Areas</h1>

            <div className="mt-[20px] space-y-[20px]">
              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Kitchen*</label>
                <TernaryRadioGroup name="kitchen" value={kitchen} onChange={setKitchen} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Toilet*</label>
                <TernaryRadioGroup name="toilet" value={toilet} onChange={setToilet} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[6px]">Bathroom</label>
                <div className="relative">
                  <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {bathroomOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-0 right-0 bottom-0 h-[4px] bg-[rgba(0,0,0,0.18)]"></div>
                  <div className="absolute left-0 bottom-0 h-[4px] w-[38%] bg-[#0F3D49]"></div>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[6px]">Number of bathrooms</label>
                <div className="relative">
                  <select value={bathroomsCount} onChange={(e) => setBathroomsCount(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {bathroomsCountOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Living room</label>
                <TernaryRadioGroup name="living-room" value={livingRoom} onChange={setLivingRoom} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Balcony/Terrace</label>
                <TernaryRadioGroup name="balcony-terrace" value={balconyTerrace} onChange={setBalconyTerrace} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Garden</label>
                <TernaryRadioGroup name="garden" value={garden} onChange={setGarden} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Basement</label>
                <TernaryRadioGroup name="basement" value={basement} onChange={setBasement} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Parking</label>
                <TernaryRadioGroup name="parking" value={parking} onChange={setParking} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Wheelchair accessible</label>
                <YesNoRadioGroup name="wheelchair" value={wheelchairAccessible} onChange={setWheelchairAccessible} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Elevator</label>
                <YesNoRadioGroup name="elevator" value={elevator} onChange={setElevator} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Allergy friendly</label>
                <YesNoRadioGroup name="allergy" value={allergyFriendly} onChange={setAllergyFriendly} />
              </div>
            </div>
          </div>
        )}

        {currentSection === 4 && (
          <div className="w-full">

            <h1 className="text-[32px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Amenities</h1>

            <div className="mt-[18px] space-y-[18px]">
              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Bed*</label>
                <YesNoRadioGroup name="amenity-bed" value={bedAmenity} onChange={setBedAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">WiFi*</label>
                <YesNoRadioGroup name="amenity-wifi" value={wifiAmenity} onChange={setWifiAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Desk</label>
                <YesNoRadioGroup name="amenity-desk" value={deskAmenity} onChange={setDeskAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Closet</label>
                <YesNoRadioGroup name="amenity-closet" value={closetAmenity} onChange={setClosetAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">TV</label>
                <YesNoRadioGroup name="amenity-tv" value={tvAmenity} onChange={setTvAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Washing machine</label>
                <YesNoRadioGroup name="amenity-washing-machine" value={washingMachineAmenity} onChange={setWashingMachineAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Dryer</label>
                <YesNoRadioGroup name="amenity-dryer" value={dryerAmenity} onChange={setDryerAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Dishwasher</label>
                <YesNoRadioGroup name="amenity-dishwasher" value={dishwasherAmenity} onChange={setDishwasherAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Kitchenware</label>
                <TernaryRadioGroup name="amenity-kitchenware" value={kitchenwareAmenity} onChange={setKitchenwareAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[6px]">Heating</label>
                <div className="relative max-w-[440px]">
                  <select value={heatingAmenity} onChange={(e) => setHeatingAmenity(e.target.value)} className="w-full h-[42px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {heatingOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Air conditioning</label>
                <YesNoRadioGroup name="amenity-air-conditioning" value={airConditioningAmenity} onChange={setAirConditioningAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[6px]">Flooring</label>
                <div className="relative max-w-[440px]">
                  <select value={flooringAmenity} onChange={(e) => setFlooringAmenity(e.target.value)} className="w-full h-[42px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[20px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {flooringOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#5A7380]" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-[#5A7380] mb-[8px]">Living room furniture</label>
                <YesNoRadioGroup name="amenity-living-room-furniture" value={livingRoomFurnitureAmenity} onChange={setLivingRoomFurnitureAmenity} />
              </div>
            </div>
          </div>
        )}

        {currentSection === 5 && (
          <div className="w-full" ref={costMenusRef}>

            <h1 className="text-[22px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Rental conditions</h1>

            <div className="mt-[16px]">
              <p className="text-[12px] font-semibold text-[#12303B] mb-[8px]">How rent is calculated</p>

              <div className="max-w-[620px] border border-[#0F3D49] bg-[#F8FBFC] p-[12px]">
                <p className="text-[12px] font-semibold text-[#12303B]">Monthly basis</p>
                <p className="text-[11px] text-[#35515D] mt-[4px]">The tenant always pays the full month's rent, regardless of their move-in or move-out dates. E.g., If the tenant moves out on 10 April, they'll pay for the full month of April.</p>
              </div>
            </div>

            <div className="mt-[16px]">
              <p className="text-[12px] font-semibold text-[#12303B] mb-[8px]">Cancellation Policy</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px] max-w-[620px]">
                <label className={`border p-[12px] cursor-pointer ${cancellationPolicy === "strict" ? "border-[#0F3D49] bg-[#F8FBFC]" : "border-[rgba(0,0,0,0.16)] bg-[#F7F7F9]"}`}>
                  <div className="flex items-start gap-[8px]">
                    <input type="radio" name="cancel-policy" checked={cancellationPolicy === "strict"} onChange={() => setCancellationPolicy("strict")} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#12303B]">Strict cancellation</p>
                      <ul className="mt-[6px] text-[11px] text-[#35515D] list-disc pl-[14px] space-y-[3px]">
                        <li>If tenant cancels:</li>
                        <li>Within 24 hours of confirmation - Full refund of first month's rent</li>
                        <li>After 24 hours of confirmation - No refund</li>
                      </ul>
                    </div>
                  </div>
                </label>

                <label className={`border p-[12px] cursor-pointer ${cancellationPolicy === "flexible" ? "border-[#0F3D49] bg-[#F8FBFC]" : "border-[rgba(0,0,0,0.16)] bg-[#F7F7F9]"}`}>
                  <div className="flex items-start gap-[8px]">
                    <input type="radio" name="cancel-policy" checked={cancellationPolicy === "flexible"} onChange={() => setCancellationPolicy("flexible")} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#12303B]">Flexible cancellation</p>
                      <ul className="mt-[6px] text-[11px] text-[#35515D] list-disc pl-[14px] space-y-[3px]">
                        <li>If tenant cancels within 24 hours of confirmation - Full refund of first month's rent.</li>
                        <li>If tenant cancels when the move-in date is:</li>
                        <li>More than 30 days away - Full refund of first month's rent</li>
                        <li>30 to 7 days away - 50% refund of first month's rent</li>
                        <li>Less than 7 days away - No refund</li>
                      </ul>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-[14px] max-w-[760px] border border-[#D7CF8B] bg-[#F3EDB7] px-[12px] py-[10px] relative">
              <button type="button" className="absolute right-[8px] top-[6px] text-[#7C7444] text-[16px] leading-none">x</button>
              <p className="text-[13px] font-semibold text-[#4D4728]">Advanced pricing</p>
              <p className="text-[11px] text-[#5B5634] mt-[2px]">Get ready for the high season by setting custom monthly prices. How it works</p>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Rent</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Which type of price do you want to set?</p>
              <div className="flex flex-wrap items-center gap-[14px] mt-[8px] text-[12px] text-[#244A57]">
                <label className="inline-flex items-center gap-[6px] cursor-pointer">
                  <input type="radio" name="rent-pricing" checked={rentPricingMode === "basic"} onChange={() => setRentPricingMode("basic")} className="w-[13px] h-[13px] accent-brand-primary" />
                  <span>Basic price</span>
                </label>
                <label className="inline-flex items-center gap-[6px] cursor-pointer">
                  <input type="radio" name="rent-pricing" checked={rentPricingMode === "advanced"} onChange={() => setRentPricingMode("advanced")} className="w-[13px] h-[13px] accent-brand-primary" />
                  <span>Advanced price (set monthly rates)</span>
                </label>
              </div>

              <div className="mt-[8px] max-w-[180px]">
                <label className="block text-[10px] text-[#5A7380] mb-[2px]">Monthly rent</label>
                <input value={monthlyRent} readOnly className="w-full h-[30px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.35)] text-[16px] text-[#1A1A1A] focus:outline-none" />
              </div>

              {rentPricingMode === "advanced" && (
                <div className="mt-[14px] max-w-[760px] border border-[rgba(0,0,0,0.14)] bg-white overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#F5F6F7]">
                      <tr>
                        <th className="px-[16px] py-[14px] text-[13px] font-semibold text-[#38586A]">Month</th>
                        <th className="px-[16px] py-[14px] text-[13px] font-semibold text-[#38586A]">Rent (EUR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advancedPricingMonths.map((month) => (
                        <tr key={month} className="border-t border-[rgba(0,0,0,0.10)]">
                          <td className="px-[16px] py-[12px] text-[13px] text-[#38586A]">{month}</td>
                          <td className="px-[16px] py-[12px]">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={advancedMonthlyRates[month] ?? monthlyRent}
                              onChange={(event) => {
                                const nextValue = event.target.value;
                                setAdvancedMonthlyRates((prev) => ({ ...prev, [month]: nextValue }));
                              }}
                              className="w-[116px] h-[28px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.25)] text-[14px] text-[#38586A] focus:outline-none focus:border-brand-primary"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Utility costs *</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Specify how much utility the tenant will pay per utility, how often, and if the cost is already included in the rent.</p>

              <div className="mt-[8px] border border-[rgba(0,0,0,0.18)] max-w-[760px] overflow-x-auto">
                <table className="min-w-[720px] w-full text-left text-[11px]">
                  <thead className="bg-[#F2F3F5] text-[#12303B]">
                    <tr>
                      <th className="px-[8px] py-[7px] font-semibold">Type *</th>
                      <th className="px-[8px] py-[7px] font-semibold">Included in rent?</th>
                      <th className="px-[8px] py-[7px] font-semibold">How often?</th>
                      <th className="px-[8px] py-[7px] font-semibold">Estimate or exact?</th>
                      <th className="px-[8px] py-[7px] font-semibold">Amount</th>
                      <th className="px-[8px] py-[7px] font-semibold w-[44px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {utilityLines.map((line, index) => (
                      <tr key={`${line.type}-${index}`} className="border-t border-[rgba(0,0,0,0.14)]">
                        <td className="px-[8px] py-[6px]">
                          <select value={line.type} onChange={(e) => updateUtilityLine(index, "type", e.target.value)} className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none">
                            {costTypeOptions.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <select value={line.includedInRent} onChange={(e) => updateUtilityLine(index, "includedInRent", e.target.value as CostLine["includedInRent"])} className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none">
                            <option value="Included in rent">Included in rent</option>
                            <option value="Paid separately">Paid separately</option>
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <select
                            value={line.frequency}
                            onChange={(e) => updateUtilityLine(index, "frequency", e.target.value as CostLine["frequency"])}
                            disabled={line.includedInRent === "Included in rent"}
                            className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="every month">every month</option>
                            <option value="one-time">one-time</option>
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <select
                            value={line.estimateType}
                            onChange={(e) => updateUtilityLine(index, "estimateType", e.target.value as CostLine["estimateType"])}
                            disabled={line.includedInRent === "Included in rent"}
                            className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <option value="Estimate">Estimate</option>
                            <option value="Exact">Exact</option>
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <div className="flex items-center gap-[4px]">
                            <span>EUR</span>
                            <input
                              value={line.amount}
                              onChange={(e) => updateUtilityLine(index, "amount", e.target.value)}
                              disabled={line.includedInRent === "Included in rent"}
                              className="w-[76px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                          </div>
                        </td>
                        <td className="px-[8px] py-[6px] text-right">
                          {line.type === "Broadcasting fee" && (
                            <button
                              type="button"
                              onClick={() => setUtilityLines((prev) => prev.filter((_, i) => i !== index))}
                              className="text-[#6E7E87] hover:text-[#12303B]"
                              aria-label="Remove utility cost"
                            >
                              <Trash2 className="w-[16px] h-[16px]" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-[6px] relative inline-block">
                <button
                  type="button"
                  onClick={() => setOpenCostMenu((prev) => (prev === "utility" ? null : "utility"))}
                  disabled={availableUtilityAddOptions.length === 0}
                  className="text-[11px] text-[#12303B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                  + Add New Cost
                </button>
                {openCostMenu === "utility" && (
                  <div className="absolute left-0 mt-[6px] min-w-[240px] bg-white border border-[rgba(0,0,0,0.16)] shadow-[0_8px_18px_rgba(0,0,0,0.14)] z-50 max-h-[320px] overflow-y-auto">
                    {availableUtilityAddOptions.map((option) => (
                      <button
                        key={`utility-add-${option}`}
                        type="button"
                        onClick={() => {
                          setUtilityLines((prev) => [
                            ...prev,
                            { type: option, includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
                          ]);
                          setOpenCostMenu(null);
                        }}
                        className="w-full text-left px-[10px] py-[8px] text-[12px] text-[#12303B] hover:bg-[#F5F8FA]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Additional required costs</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Are there other costs the tenant must pay (e.g. membership fees for gym or building services)</p>

              {additionalRequiredLines.length > 0 && (
                <div className="mt-[8px] border border-[rgba(0,0,0,0.18)] max-w-[760px] overflow-x-auto">
                  <table className="min-w-[720px] w-full text-left text-[11px]">
                    <thead className="bg-[#F2F3F5] text-[#12303B]">
                      <tr>
                        <th className="px-[8px] py-[7px] font-semibold">Type</th>
                        <th className="px-[8px] py-[7px] font-semibold">Included in rent?</th>
                        <th className="px-[8px] py-[7px] font-semibold">How often?</th>
                        <th className="px-[8px] py-[7px] font-semibold">Amount</th>
                        <th className="px-[8px] py-[7px] font-semibold w-[44px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {additionalRequiredLines.map((line, index) => (
                        <tr key={`${line.type}-${index}`} className="border-t border-[rgba(0,0,0,0.14)]">
                          <td className="px-[8px] py-[6px]">{line.type}</td>
                          <td className="px-[8px] py-[6px]">
                            <select
                              value={line.includedInRent}
                              onChange={(e) => updateAdditionalRequiredLine(index, "includedInRent", e.target.value as OptionalServiceLine["includedInRent"])}
                              className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                            >
                              <option value="Included in rent">Included in rent</option>
                              <option value="Paid separately">Paid separately</option>
                            </select>
                          </td>
                          <td className="px-[8px] py-[6px]">
                            <select
                              value={line.frequency}
                              onChange={(e) => updateAdditionalRequiredLine(index, "frequency", e.target.value as OptionalServiceLine["frequency"])}
                              className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                            >
                              <option value="At move-in">At move-in</option>
                              <option value="every month">every month</option>
                              <option value="one-time">one-time</option>
                            </select>
                          </td>
                          <td className="px-[8px] py-[6px]">
                            <div className="flex items-center gap-[4px]">
                              <span>EUR</span>
                              <input
                                value={line.amount}
                                onChange={(e) => updateAdditionalRequiredLine(index, "amount", e.target.value)}
                                className="w-[76px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-[8px] py-[6px] text-right">
                            <button
                              type="button"
                              onClick={() => setAdditionalRequiredLines((prev) => prev.filter((_, i) => i !== index))}
                              className="text-[#6E7E87] hover:text-[#12303B]"
                              aria-label="Remove additional required cost"
                            >
                              <Trash2 className="w-[16px] h-[16px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-[6px] relative inline-block">
                <button
                  type="button"
                  onClick={() => setOpenCostMenu((prev) => (prev === "required" ? null : "required"))}
                  disabled={availableAdditionalRequiredCostOptions.length === 0}
                  className="text-[11px] text-[#12303B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                  + Add New Cost
                </button>
                {openCostMenu === "required" && (
                  <div className="absolute left-0 mt-[6px] min-w-[220px] bg-white border border-[rgba(0,0,0,0.16)] shadow-[0_8px_18px_rgba(0,0,0,0.14)] z-50">
                    {availableAdditionalRequiredCostOptions.map((option) => (
                      <button
                        key={`additional-required-${option}`}
                        type="button"
                        onClick={() => {
                          setAdditionalRequiredLines((prev) => {
                            if (prev.some((line) => line.type === option)) {
                              return prev;
                            }

                            return [...prev, { type: option, includedInRent: "Included in rent", frequency: "At move-in", amount: "0" }];
                          });
                          setOpenCostMenu(null);
                        }}
                        className="w-full text-left px-[10px] py-[8px] text-[12px] text-[#12303B] hover:bg-[#F5F8FA]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Optional services</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Besides the costs above, are there optional services the tenant could choose to pay for? E.g. early move-in</p>

              {optionalServiceLines.length > 0 && (
                <div className="mt-[8px] border border-[rgba(0,0,0,0.18)] max-w-[760px] overflow-x-auto">
                  <table className="min-w-[720px] w-full text-left text-[11px]">
                    <thead className="bg-[#F2F3F5] text-[#12303B]">
                      <tr>
                        <th className="px-[8px] py-[7px] font-semibold">Type</th>
                        <th className="px-[8px] py-[7px] font-semibold">Included in rent?</th>
                        <th className="px-[8px] py-[7px] font-semibold">How often?</th>
                        <th className="px-[8px] py-[7px] font-semibold">Amount</th>
                        <th className="px-[8px] py-[7px] font-semibold w-[44px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {optionalServiceLines.map((line, index) => (
                        <tr key={`${line.type}-${index}`} className="border-t border-[rgba(0,0,0,0.14)]">
                          <td className="px-[8px] py-[6px]">{line.type}</td>
                          <td className="px-[8px] py-[6px]">
                            <select
                              value={line.includedInRent}
                              onChange={(e) => updateOptionalServiceLine(index, "includedInRent", e.target.value as OptionalServiceLine["includedInRent"])}
                              className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                            >
                              <option value="Included in rent">Included in rent</option>
                              <option value="Paid separately">Paid separately</option>
                            </select>
                          </td>
                          <td className="px-[8px] py-[6px]">
                            <select
                              value={line.frequency}
                              onChange={(e) => updateOptionalServiceLine(index, "frequency", e.target.value as OptionalServiceLine["frequency"])}
                              className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                            >
                              <option value="At move-in">At move-in</option>
                              <option value="every month">every month</option>
                              <option value="one-time">one-time</option>
                            </select>
                          </td>
                          <td className="px-[8px] py-[6px]">
                            <div className="flex items-center gap-[4px]">
                              <span>EUR</span>
                              <input
                                value={line.amount}
                                onChange={(e) => updateOptionalServiceLine(index, "amount", e.target.value)}
                                className="w-[76px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-[8px] py-[6px] text-right">
                            <button
                              type="button"
                              onClick={() => setOptionalServiceLines((prev) => prev.filter((_, i) => i !== index))}
                              className="text-[#6E7E87] hover:text-[#12303B]"
                              aria-label="Remove optional service"
                            >
                              <Trash2 className="w-[16px] h-[16px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-[6px] relative inline-block">
                <button
                  type="button"
                  onClick={() => setOpenCostMenu((prev) => (prev === "optional" ? null : "optional"))}
                  disabled={availableOptionalServicesOptions.length === 0}
                  className="text-[11px] text-[#12303B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                  + Add New Cost
                </button>
                {openCostMenu === "optional" && (
                  <div className="absolute left-0 mt-[6px] min-w-[260px] bg-white border border-[rgba(0,0,0,0.16)] shadow-[0_8px_18px_rgba(0,0,0,0.14)] z-50 max-h-[260px] overflow-y-auto">
                    {availableOptionalServicesOptions.map((option) => (
                      <button
                        key={`optional-service-${option}`}
                        type="button"
                        onClick={() => {
                          setOptionalServiceLines((prev) => {
                            if (prev.some((line) => line.type === option)) {
                              return prev;
                            }

                            return [...prev, { type: option, includedInRent: "Included in rent", frequency: "At move-in", amount: "0" }];
                          });
                          setOpenCostMenu(null);
                        }}
                        className="w-full text-left px-[10px] py-[8px] text-[12px] text-[#12303B] hover:bg-[#F5F8FA]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Deposits</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Are you charging any deposits?</p>

              {depositLines.length > 0 && (
                <div className="mt-[8px] border border-[rgba(0,0,0,0.18)] max-w-[760px] overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#F2F3F5] text-[#12303B]">
                      <tr>
                        <th className="px-[8px] py-[7px] font-semibold">Type</th>
                        <th className="px-[8px] py-[7px] font-semibold">Required/Optional?</th>
                        <th className="px-[8px] py-[7px] font-semibold">Amount</th>
                        <th className="px-[8px] py-[7px] font-semibold w-[44px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {depositLines.map((line, index) => (
                        <tr key={`${line.type}-${index}`} className="border-t border-[rgba(0,0,0,0.14)]">
                          <td className="px-[8px] py-[6px]">{line.type}</td>
                          <td className="px-[8px] py-[6px]">
                            <select
                              value={line.requirement}
                              onChange={(e) => updateDepositLine(index, "requirement", e.target.value as DepositLine["requirement"])}
                              className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                            >
                              <option value="Required">Required</option>
                              <option value="Optional">Optional</option>
                            </select>
                          </td>
                          <td className="px-[8px] py-[6px]">
                            <div className="flex items-center gap-[4px]">
                              <span>EUR</span>
                              <input
                                value={line.amount}
                                onChange={(e) => updateDepositLine(index, "amount", e.target.value)}
                                className="w-[76px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none"
                              />
                            </div>
                          </td>
                          <td className="px-[8px] py-[6px] text-right">
                            <button
                              type="button"
                              onClick={() => setDepositLines((prev) => prev.filter((_, i) => i !== index))}
                              className="text-[#6E7E87] hover:text-[#12303B]"
                              aria-label="Remove deposit cost"
                            >
                              <Trash2 className="w-[16px] h-[16px]" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-[6px] relative inline-block">
                <button
                  type="button"
                  onClick={() => setOpenCostMenu((prev) => (prev === "deposit" ? null : "deposit"))}
                  disabled={availableDepositOptions.length === 0}
                  className="text-[11px] text-[#12303B] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                >
                  + Add New Cost
                </button>
                {openCostMenu === "deposit" && (
                  <div className="absolute left-0 mt-[6px] min-w-[220px] bg-white border border-[rgba(0,0,0,0.16)] shadow-[0_8px_18px_rgba(0,0,0,0.14)] z-50">
                    {availableDepositOptions.map((option) => (
                      <button
                        key={`deposit-${option}`}
                        type="button"
                        onClick={() => {
                          setDepositLines((prev) => {
                            if (prev.some((line) => line.type === option)) {
                              return prev;
                            }

                            return [...prev, { type: option, requirement: "Required", amount: "0" }];
                          });
                          setOpenCostMenu(null);
                        }}
                        className="w-full text-left px-[10px] py-[8px] text-[12px] text-[#12303B] hover:bg-[#F5F8FA]"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentSection === 6 && (
          <div className="w-full">

            <h1 className="text-[22px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Rules and Preferences</h1>

            <div className="mt-[14px] space-y-[16px]">
              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">Do you prefer tenants have a specific gender?</p>
                <div className="flex flex-wrap items-center gap-[14px] text-[12px] text-[#244A57]">
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="preferred-gender" checked={preferredGender === "male"} onChange={() => setPreferredGender("male")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Male</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="preferred-gender" checked={preferredGender === "female"} onChange={() => setPreferredGender("female")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Female</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="preferred-gender" checked={preferredGender === "no-preference"} onChange={() => setPreferredGender("no-preference")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>No Preference</span>
                  </label>
                </div>
                <p className="mt-[6px] text-[10px] text-[#5A7380] max-w-[620px]">This is used together with housemate gender to match your listing in tenant search. Mismatched selections may reduce your listing's visibility.</p>
              </div>

              <div className="max-w-[340px]">
                <p className="text-[12px] text-[#12303B] mb-[6px]">What's the minimum age of your preferred tenants?</p>
                <div className="relative">
                  <select value={minimumAgePreference} onChange={(e) => setMinimumAgePreference(e.target.value)} className="w-full h-[34px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[18px] leading-[1] text-[#1A1A1A] appearance-none pr-[24px] focus:outline-none">
                    {agePreferenceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#5A7380]" />
                </div>
              </div>

              <div className="max-w-[340px]">
                <p className="text-[12px] text-[#12303B] mb-[6px]">What's the maximum age of your preferred tenants?</p>
                <div className="relative">
                  <select value={maximumAgePreference} onChange={(e) => setMaximumAgePreference(e.target.value)} className="w-full h-[34px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[18px] leading-[1] text-[#1A1A1A] appearance-none pr-[24px] focus:outline-none">
                    {agePreferenceOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#5A7380]" />
                </div>
              </div>

              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">What type of tenants would you prefer?</p>
                <div className="flex flex-wrap items-center gap-[14px] text-[12px] text-[#244A57]">
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="preferred-tenant-type" checked={preferredTenantType === "any"} onChange={() => setPreferredTenantType("any")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Any</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="preferred-tenant-type" checked={preferredTenantType === "students"} onChange={() => setPreferredTenantType("students")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Students only</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="preferred-tenant-type" checked={preferredTenantType === "working"} onChange={() => setPreferredTenantType("working")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Working professionals only</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">Are couples allowed to rent your property?</p>
                <YesNoRadioGroup name="couples-allowed" value={couplesAllowed} onChange={setCouplesAllowed} />
              </div>

              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">Can tenants register at your property's address? (inschrijven)</p>
                <YesNoRadioGroup name="registration-possible" value={registrationPossible} onChange={setRegistrationPossible} />
              </div>

              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">Are your tenants allowed to have pets in your property?</p>
                <div className="flex flex-wrap items-center gap-[14px] text-[12px] text-[#244A57]">
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="pets-policy" checked={petsPolicy === "no"} onChange={() => setPetsPolicy("no")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>No</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="pets-policy" checked={petsPolicy === "yes"} onChange={() => setPetsPolicy("yes")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="pets-policy" checked={petsPolicy === "negotiable"} onChange={() => setPetsPolicy("negotiable")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Negotiable</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">Can your tenants play musical instruments in your property?</p>
                <div className="flex flex-wrap items-center gap-[14px] text-[12px] text-[#244A57]">
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="music-policy" checked={musicPolicy === "no"} onChange={() => setMusicPolicy("no")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>No</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="music-policy" checked={musicPolicy === "yes"} onChange={() => setMusicPolicy("yes")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="music-policy" checked={musicPolicy === "negotiable"} onChange={() => setMusicPolicy("negotiable")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Negotiable</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="text-[12px] text-[#12303B] mb-[8px]">Are your tenants allowed to smoke in your property?</p>
                <div className="flex flex-wrap items-center gap-[14px] text-[12px] text-[#244A57]">
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="smoking-policy" checked={smokingPolicy === "no"} onChange={() => setSmokingPolicy("no")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>No</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="smoking-policy" checked={smokingPolicy === "yes"} onChange={() => setSmokingPolicy("yes")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="smoking-policy" checked={smokingPolicy === "negotiable"} onChange={() => setSmokingPolicy("negotiable")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Negotiable</span>
                  </label>
                  <label className="inline-flex items-center gap-[6px] cursor-pointer">
                    <input type="radio" name="smoking-policy" checked={smokingPolicy === "outside-only"} onChange={() => setSmokingPolicy("outside-only")} className="w-[13px] h-[13px] accent-brand-primary" />
                    <span>Outside only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-[30px]">
              <h2 className="text-[22px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Documents from tenant</h2>
              <p className="mt-[8px] text-[12px] text-[#35515D] max-w-[640px]">Select which documents you need from the tenant to accept their rental application. If you don't select required documents now, you can still ask the tenant for these documents later.</p>

              <div className="mt-[12px] space-y-[14px]">
                <label className="flex items-start gap-[8px] cursor-pointer">
                  <input type="checkbox" checked={requireProofOfIdentity} onChange={(e) => setRequireProofOfIdentity(e.target.checked)} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                  <span>
                    <span className="block text-[12px] text-[#12303B]">Proof of identity</span>
                    <span className="block text-[11px] text-[#5A7380] mt-[3px]">Government-issued ID or passport.</span>
                  </span>
                </label>

                <label className="flex items-start gap-[8px] cursor-pointer">
                  <input type="checkbox" checked={requireProofOfOccupationOrEnrollment} onChange={(e) => setRequireProofOfOccupationOrEnrollment(e.target.checked)} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                  <span>
                    <span className="block text-[12px] text-[#12303B]">Proof of occupation or enrollment</span>
                    <span className="block text-[11px] text-[#5A7380] mt-[3px]">University enrollment certificate, internship or employment contract.</span>
                  </span>
                </label>

                <label className="flex items-start gap-[8px] cursor-pointer">
                  <input type="checkbox" checked={requireProofOfIncome} onChange={(e) => setRequireProofOfIncome(e.target.checked)} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                  <span>
                    <span className="block text-[12px] text-[#12303B]">Proof of income</span>
                    <span className="block text-[11px] text-[#5A7380] mt-[3px]">Salary slip or bank statements from the tenant or their sponsor.</span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {currentSection === 7 && (
          <div className="w-full">

            <h1 className="text-[22px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Media</h1>

            <div className="mt-[16px]">
              <h2 className="text-[16px] font-semibold text-[#12303B]">Photos<span className="text-[#C0392B]">*</span></h2>
              <p className="mt-[4px] text-[11px] text-[#5A7380]">Add stunning photos to your listing. You can add regular photos, 360-degree photos, and floor plans.</p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  void handlePhotoUpload(e.target.files);
                }}
              />

              <div className="mt-[10px] border border-dashed border-[rgba(0,0,0,0.20)] p-[12px] bg-[#F8F9FA] min-h-[300px]">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-[8px] bg-[#EEF1F3] p-[8px] min-h-[190px]">
                  {uploadedMedia.map((item, index) => (
                    <div key={`${item.url}-${index}`} className="relative h-[95px] bg-white overflow-hidden">
                      <img src={item.url} alt={`Uploaded listing photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedMedia((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-[4px] right-[4px] w-[22px] h-[22px] bg-white/90 text-[#12303B] text-[13px] leading-none border border-[rgba(0,0,0,0.16)]"
                        aria-label="Remove photo"
                      >
                        x
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 12 - uploadedMedia.length) }).map((_, index) => (
                    <div key={`placeholder-${index}`} className="h-[95px] bg-white/55"></div>
                  ))}
                </div>
                <div className="-mt-[86px] h-[86px] flex flex-col items-center justify-center">
                  <button
                    type="button"
                    disabled={isUploadingPhotos}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-[34px] px-[14px] border border-[#0F3D49] bg-white text-[10px] font-semibold text-[#12303B] hover:bg-[#F3F7F9] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isUploadingPhotos ? "UPLOADING..." : "UPLOAD PHOTOS"}
                  </button>
                  <p className="mt-[7px] text-[12px] text-[#35515D]">Add up to 10 photos</p>
                </div>
              </div>

              <div className="mt-[8px] flex items-center gap-[6px] text-[11px] text-[#5A7380]">
                <InfoTooltip text="Use JPG or PNG images under 12MB" iconClassName="w-[12px] h-[12px] cursor-help" />
                <span>Use JPG or PNG images with a file size less than 12MB.</span>
              </div>
            </div>

            <div className="mt-[28px]">
              <h2 className="text-[16px] font-semibold text-[#12303B]">Permissions<span className="text-[#C0392B]">*</span></h2>
              <label className="mt-[8px] inline-flex items-center gap-[8px] cursor-pointer text-[12px] text-[#244A57]">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-[13px] h-[13px] accent-brand-primary"
                />
                <span>
                  I agree with the <a href="#" className="underline text-[#12303B]">HousingAnywhere terms &amp; conditions</a>
                </span>
              </label>

              <label className="mt-[8px] inline-flex items-start gap-[8px] cursor-pointer text-[12px] text-[#244A57] max-w-[980px]">
                <input
                  type="checkbox"
                  checked={agreedToDocumentPrivacyPolicy}
                  onChange={(e) => setAgreedToDocumentPrivacyPolicy(e.target.checked)}
                  className="mt-[2px] w-[13px] h-[13px] accent-brand-primary"
                />
                <span>
                  I agree that I will only use the required documents to create a rental agreement. I will destroy the copies within 48 hours if the person won't be renting the property. Read our{" "}
                  <a href="#" className="underline text-[#12303B]">Privacy Policy</a>.
                </span>
              </label>
            </div>
          </div>
        )}
        </div>
      </div>

      {currentSection > 1 && (
        <div className="fixed left-0 right-0 bottom-0 z-40 bg-[#F7F7F9] border-t border-[rgba(0,0,0,0.12)]">
          <div className="h-[6px] bg-[rgba(0,0,0,0.16)]">
            <div
              className="h-full bg-[#0F3D49] transition-[width] duration-200"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="px-[20px] md:px-[28px] py-[14px] flex items-center justify-end gap-[12px]">
            <button
              type="button"
              onClick={() => setCurrentSection((currentSection - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
              className="h-[40px] px-[16px] border border-[rgba(0,0,0,0.16)] bg-white text-[#12303B] text-[11px] font-semibold hover:bg-neutral-light-gray transition-colors"
            >
              BACK
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentSection === 7) {
                  handleSubmitListing();
                  return;
                }

                if (!validateSectionOrShowError(currentSection)) {
                  return;
                }

                if (currentSection < 7) {
                  setCurrentSection((currentSection + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
                }
              }}
              disabled={isSubmitting}
              className="h-[40px] px-[16px] bg-brand-primary text-white text-[11px] font-semibold hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "PUBLISHING..." : currentSection === 7 ? "PUBLISH" : "NEXT"}
            </button>
          </div>
        </div>
      )}
    </LandlordPortalLayout>
  );
}

