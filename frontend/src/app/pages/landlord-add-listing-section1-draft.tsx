import { ChevronDown, Info, Upload } from "lucide-react";
import { useState } from "react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";

type TernaryArea = "no" | "shared" | "private";
type YesNo = "yes" | "no";

const kinds = ["Room", "Studio", "Apartment", "House"];
const propertyTypes = ["Private", "Shared", "Entire place"];
const currencies = ["EUR", "USD", "GBP"];
const minRentalOptions = ["No minimum", "1 month", "3 months", "6 months", "12 months"];
const maxRentalOptions = ["No maximum", "6 months", "12 months", "24 months"];
const bedroomsOptions = ["Select", "0", "1", "2", "3", "4", "5+"];
const bathroomOptions = ["Select", "Private", "Shared"];
const bathroomsCountOptions = ["Select", "1", "2", "3", "4+"];
const heatingOptions = ["Select", "Central heating", "Electric", "Gas", "District heating", "Floor heating"];
const flooringOptions = ["Select", "Wood", "Laminate", "Tiles", "Carpet", "Vinyl"];
const costTypeOptions = ["Electricity", "Water", "Gas", "Internet", "Broadcasting fee", "Cleaning", "Administration", "Membership fee", "Other"];
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
const agePreferenceOptions = ["No preference", "18", "21", "25", "30", "35", "40", "45", "50", "55", "60+"];

interface CostLine {
  type: string;
  includedInRent: "Included in rent" | "Excluded";
  frequency: "every month" | "one-time";
  estimateType: "Estimate" | "Exact";
  amount: string;
}

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

export function LandlordAddListingSection1Draft() {
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  const [kind, setKind] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [cityCountry, setCityCountry] = useState("Rotterdam, Netherlands");
  const [streetHouse, setStreetHouse] = useState("Mathenesserlaan 22");
  const [availableFrom, setAvailableFrom] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [currency, setCurrency] = useState("");
  const [minimumRentalPeriod, setMinimumRentalPeriod] = useState("No minimum");
  const [maximumRentalPeriod, setMaximumRentalPeriod] = useState("No maximum");

  const [propertySize, setPropertySize] = useState("");
  const [suitablePeopleCount, setSuitablePeopleCount] = useState("0");
  const [spaceDescription, setSpaceDescription] = useState("");
  const [bedroomsCount, setBedroomsCount] = useState("Select");
  const [bedroomFurnished, setBedroomFurnished] = useState<YesNo>("no");
  const [lockOnBedroom, setLockOnBedroom] = useState<YesNo>("no");

  const [kitchen, setKitchen] = useState<TernaryArea>("no");
  const [toilet, setToilet] = useState<TernaryArea>("no");
  const [bathroom, setBathroom] = useState("Select");
  const [bathroomsCount, setBathroomsCount] = useState("Select");
  const [livingRoom, setLivingRoom] = useState<TernaryArea>("no");
  const [balconyTerrace, setBalconyTerrace] = useState<TernaryArea>("no");
  const [garden, setGarden] = useState<TernaryArea>("no");
  const [basement, setBasement] = useState<TernaryArea>("no");
  const [parking, setParking] = useState<TernaryArea>("no");
  const [wheelchairAccessible, setWheelchairAccessible] = useState<YesNo>("no");
  const [elevator, setElevator] = useState<YesNo>("no");
  const [allergyFriendly, setAllergyFriendly] = useState<YesNo>("no");

  const [bedAmenity, setBedAmenity] = useState<YesNo>("no");
  const [wifiAmenity, setWifiAmenity] = useState<YesNo>("no");
  const [deskAmenity, setDeskAmenity] = useState<YesNo>("no");
  const [closetAmenity, setClosetAmenity] = useState<YesNo>("no");
  const [tvAmenity, setTvAmenity] = useState<YesNo>("no");
  const [washingMachineAmenity, setWashingMachineAmenity] = useState<YesNo>("no");
  const [dryerAmenity, setDryerAmenity] = useState<YesNo>("no");
  const [dishwasherAmenity, setDishwasherAmenity] = useState<YesNo>("no");
  const [kitchenwareAmenity, setKitchenwareAmenity] = useState<TernaryArea>("no");
  const [heatingAmenity, setHeatingAmenity] = useState("Select");
  const [airConditioningAmenity, setAirConditioningAmenity] = useState<YesNo>("no");
  const [flooringAmenity, setFlooringAmenity] = useState("Select");
  const [livingRoomFurnitureAmenity, setLivingRoomFurnitureAmenity] = useState<YesNo>("no");

  const [rentCalculation, setRentCalculation] = useState<"daily" | "half-monthly" | "monthly">("daily");
  const [cancellationPolicy, setCancellationPolicy] = useState<"strict" | "flexible">("flexible");
  const [rentPricingMode, setRentPricingMode] = useState<"basic" | "advanced">("basic");
  const [monthlyRentDisplay, setMonthlyRentDisplay] = useState("234");
  const [utilityLines, setUtilityLines] = useState<CostLine[]>([
    { type: "Electricity", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
    { type: "Water", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
    { type: "Gas", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
    { type: "Internet", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
  ]);
  const [selectedAdditionalRequiredCost, setSelectedAdditionalRequiredCost] = useState("");
  const [selectedOptionalService, setSelectedOptionalService] = useState("");
  const [selectedDepositType, setSelectedDepositType] = useState("");

  const [preferredGender, setPreferredGender] = useState<"male" | "female" | "no-preference">("no-preference");
  const [minimumAgePreference, setMinimumAgePreference] = useState("No preference");
  const [maximumAgePreference, setMaximumAgePreference] = useState("No preference");
  const [preferredTenantType, setPreferredTenantType] = useState<"any" | "students" | "working">("any");
  const [couplesAllowed, setCouplesAllowed] = useState<YesNo>("no");
  const [registrationPossible, setRegistrationPossible] = useState<YesNo>("no");
  const [petsPolicy, setPetsPolicy] = useState<"no" | "yes" | "negotiable">("no");
  const [musicPolicy, setMusicPolicy] = useState<"no" | "yes" | "negotiable">("no");
  const [smokingPolicy, setSmokingPolicy] = useState<"no" | "yes" | "negotiable" | "outside-only">("no");
  const [requireProofOfIdentity, setRequireProofOfIdentity] = useState(false);
  const [requireProofOfOccupationOrEnrollment, setRequireProofOfOccupationOrEnrollment] = useState(false);
  const [requireProofOfIncome, setRequireProofOfIncome] = useState(false);

  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const updateUtilityLine = <K extends keyof CostLine>(index: number, key: K, value: CostLine[K]) => {
    setUtilityLines((prev) => prev.map((line, i) => (i === index ? { ...line, [key]: value } : line)));
  };

  return (
    <LandlordPortalLayout>
      <div className="bg-[#F7F7F9] min-h-[calc(100vh-74px)] px-[20px] md:px-[28px] py-[24px] md:py-[32px] pb-[110px]">
        {currentSection === 1 && (
          <div className="max-w-[760px]">
            <h1 className="text-[36px] leading-[1.1] font-bold text-neutral-black tracking-[-0.02em]">Create your listing</h1>

            <div className="mt-[30px]">
              <h2 className="text-[26px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Property</h2>

              <div className="mt-[16px] space-y-[18px]">
                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">What kind of place are you listing?*</label>
                  <div className="relative">
                    <select value={kind} onChange={(e) => setKind(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      <option value="">Select kind</option>
                      {kinds.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">What type of property is this?*</label>
                  <div className="relative">
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      <option value="">Select type</option>
                      {propertyTypes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[34px]">
              <h2 className="text-[26px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Address</h2>

              <div className="mt-[14px] space-y-[18px]">
                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">City, country*</label>
                  <div className="flex items-center gap-[8px]">
                    <input value={cityCountry} onChange={(e) => setCityCountry(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-brand-primary" placeholder="Rotterdam, Netherlands" />
                    <Info className="w-[14px] h-[14px] text-neutral-gray" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">Street, house number*</label>
                  <input value={streetHouse} onChange={(e) => setStreetHouse(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-brand-primary" placeholder="Mathenesserlaan 22" />
                </div>
              </div>
            </div>

            <div className="mt-[36px]">
              <h2 className="text-[26px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Pricing and availability</h2>

              <div className="mt-[14px] space-y-[18px]">
                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">Available from*</label>
                  <input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] text-[#1A1A1A] focus:outline-none focus:border-brand-primary" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                  <div>
                    <label className="block text-[12px] text-neutral-gray mb-[6px]">Monthly rent*</label>
                    <input value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:border-brand-primary" placeholder="0" />
                  </div>

                  <div>
                    <label className="block text-[12px] text-neutral-gray mb-[6px]">Currency*</label>
                    <div className="flex items-center gap-[8px]">
                      <div className="relative w-full">
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                          <option value="">Select currency</option>
                          {currencies.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                      </div>
                      <Info className="w-[14px] h-[14px] text-neutral-gray" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-[10px] bg-brand-primary-light border border-[rgba(8,145,178,0.25)] px-[14px] py-[12px]">
                  <Info className="w-[16px] h-[16px] text-brand-primary" />
                  <p className="text-[13px] leading-[1.4] text-[#104A58]">
                    Complete KYC to choose from any of our supported currencies. <button type="button" className="underline font-semibold">Go to KYC</button>
                  </p>
                </div>

                <div className="flex items-start gap-[8px] text-neutral-gray">
                  <Info className="w-[14px] h-[14px] mt-[2px]" />
                  <p className="text-[12px] leading-[1.5]">In the later steps, you can choose advanced price to set different rates for different months.</p>
                </div>
              </div>
            </div>

            <div className="mt-[36px]">
              <h2 className="text-[26px] leading-[1.2] font-semibold text-[#12303B] tracking-[-0.01em]">Rental period</h2>

              <div className="mt-[14px] grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">Minimum rental period</label>
                  <div className="relative">
                    <select value={minimumRentalPeriod} onChange={(e) => setMinimumRentalPeriod(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      {minRentalOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-neutral-gray mb-[6px]">Maximum rental period</label>
                  <div className="relative">
                    <select value={maximumRentalPeriod} onChange={(e) => setMaximumRentalPeriod(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.30)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none focus:border-brand-primary">
                      {maxRentalOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentSection === 2 && (
          <div className="max-w-[760px]">
            <h1 className="text-[42px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Space Overview</h1>

            <div className="mt-[30px] space-y-[24px]">
              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Property size m2*</label>
                <input value={propertySize} onChange={(e) => setPropertySize(e.target.value)} className="w-full h-[46px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[30px] leading-[1] text-[#1A1A1A] focus:outline-none focus:border-brand-primary" />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Suitable for how many? *</label>
                <input value={suitablePeopleCount} onChange={(e) => setSuitablePeopleCount(e.target.value)} className="w-full h-[46px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[30px] leading-[1] text-[#1A1A1A] focus:outline-none focus:border-brand-primary" />
                <p className="text-[18px] mt-[8px] text-[#4A6673]">How many people can live in this space (room, studio, apartment, etc.)?</p>
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Description *</label>
                <textarea value={spaceDescription} onChange={(e) => setSpaceDescription(e.target.value)} className="w-full h-[150px] resize-none bg-[#F2F2F3] border border-[rgba(0,0,0,0.10)] p-[16px] text-[28px] leading-[1.24] text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:border-brand-primary" placeholder="Write down anything else you would like to mention about the property (such as distances to nearby shops, information about tenants, conditions etc.)" />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Number of bedrooms *</label>
                <div className="relative">
                  <select value={bedroomsCount} onChange={(e) => setBedroomsCount(e.target.value)} className="w-full h-[46px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[30px] leading-[1] text-[#1A1A1A] appearance-none pr-[36px] focus:outline-none focus:border-brand-primary">
                    {bedroomsOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[4px] top-1/2 -translate-y-1/2 w-[22px] h-[22px] text-neutral-gray" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[10px]">Bedroom furnished *</label>
                <YesNoRadioGroup name="bedroom-furnished" value={bedroomFurnished} onChange={setBedroomFurnished} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[10px]">Lock on bedroom</label>
                <YesNoRadioGroup name="lock-on-bedroom" value={lockOnBedroom} onChange={setLockOnBedroom} />
              </div>
            </div>
          </div>
        )}

        {currentSection === 3 && (
          <div className="max-w-[760px]">
            <h1 className="text-[42px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Areas</h1>

            <div className="mt-[20px] space-y-[20px]">
              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Kitchen*</label>
                <TernaryRadioGroup name="kitchen" value={kitchen} onChange={setKitchen} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Toilet*</label>
                <TernaryRadioGroup name="toilet" value={toilet} onChange={setToilet} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[6px]">Bathroom</label>
                <div className="relative">
                  <select value={bathroom} onChange={(e) => setBathroom(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[28px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {bathroomOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-0 right-0 bottom-0 h-[4px] bg-[rgba(0,0,0,0.18)]"></div>
                  <div className="absolute left-0 bottom-0 h-[4px] w-[38%] bg-[#0F3D49]"></div>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[6px]">Number of bathrooms</label>
                <div className="relative">
                  <select value={bathroomsCount} onChange={(e) => setBathroomsCount(e.target.value)} className="w-full h-[44px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[28px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {bathroomsCountOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Living room</label>
                <TernaryRadioGroup name="living-room" value={livingRoom} onChange={setLivingRoom} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Balcony/Terrace</label>
                <TernaryRadioGroup name="balcony-terrace" value={balconyTerrace} onChange={setBalconyTerrace} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Garden</label>
                <TernaryRadioGroup name="garden" value={garden} onChange={setGarden} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Basement</label>
                <TernaryRadioGroup name="basement" value={basement} onChange={setBasement} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Parking</label>
                <TernaryRadioGroup name="parking" value={parking} onChange={setParking} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Wheelchair accessible</label>
                <YesNoRadioGroup name="wheelchair" value={wheelchairAccessible} onChange={setWheelchairAccessible} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Elevator</label>
                <YesNoRadioGroup name="elevator" value={elevator} onChange={setElevator} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Allergy friendly</label>
                <YesNoRadioGroup name="allergy" value={allergyFriendly} onChange={setAllergyFriendly} />
              </div>
            </div>
          </div>
        )}

        {currentSection === 4 && (
          <div className="max-w-[760px]">
            <div className="-mx-[20px] md:-mx-[28px] mb-[16px] h-[6px] bg-[rgba(0,0,0,0.16)]">
              <div className="h-full w-[60%] bg-[#0F3D49]"></div>
            </div>

            <h1 className="text-[36px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Amenities</h1>

            <div className="mt-[18px] space-y-[18px]">
              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Bed*</label>
                <YesNoRadioGroup name="amenity-bed" value={bedAmenity} onChange={setBedAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">WiFi*</label>
                <YesNoRadioGroup name="amenity-wifi" value={wifiAmenity} onChange={setWifiAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Desk</label>
                <YesNoRadioGroup name="amenity-desk" value={deskAmenity} onChange={setDeskAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Closet</label>
                <YesNoRadioGroup name="amenity-closet" value={closetAmenity} onChange={setClosetAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">TV</label>
                <YesNoRadioGroup name="amenity-tv" value={tvAmenity} onChange={setTvAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Washing machine</label>
                <YesNoRadioGroup name="amenity-washing-machine" value={washingMachineAmenity} onChange={setWashingMachineAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Dryer</label>
                <YesNoRadioGroup name="amenity-dryer" value={dryerAmenity} onChange={setDryerAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Dishwasher</label>
                <YesNoRadioGroup name="amenity-dishwasher" value={dishwasherAmenity} onChange={setDishwasherAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Kitchenware</label>
                <TernaryRadioGroup name="amenity-kitchenware" value={kitchenwareAmenity} onChange={setKitchenwareAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[6px]">Heating</label>
                <div className="relative max-w-[440px]">
                  <select value={heatingAmenity} onChange={(e) => setHeatingAmenity(e.target.value)} className="w-full h-[42px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {heatingOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Air conditioning</label>
                <YesNoRadioGroup name="amenity-air-conditioning" value={airConditioningAmenity} onChange={setAirConditioningAmenity} />
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[6px]">Flooring</label>
                <div className="relative max-w-[440px]">
                  <select value={flooringAmenity} onChange={(e) => setFlooringAmenity(e.target.value)} className="w-full h-[42px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] text-[24px] leading-[1] text-[#1A1A1A] appearance-none pr-[28px] focus:outline-none">
                    {flooringOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-neutral-gray" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-neutral-gray mb-[8px]">Living room furniture</label>
                <YesNoRadioGroup name="amenity-living-room-furniture" value={livingRoomFurnitureAmenity} onChange={setLivingRoomFurnitureAmenity} />
              </div>
            </div>
          </div>
        )}

        {currentSection === 5 && (
          <div className="max-w-[760px]">
            <div className="-mx-[20px] md:-mx-[28px] mb-[16px] h-[6px] bg-[rgba(0,0,0,0.16)]">
              <div className="h-full w-[78%] bg-[#0F3D49]"></div>
            </div>

            <h1 className="text-[30px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Rental conditions</h1>

            <div className="mt-[16px]">
              <p className="text-[12px] font-semibold text-[#12303B] mb-[8px]">How rent is calculated</p>

              <div className="space-y-[10px] max-w-[620px]">
                <label className={`block border p-[12px] cursor-pointer ${rentCalculation === "daily" ? "border-[#0F3D49] bg-[#F8FBFC]" : "border-[rgba(0,0,0,0.16)] bg-[#F7F7F9]"}`}>
                  <div className="flex items-start gap-[8px]">
                    <input type="radio" name="rent-calc" checked={rentCalculation === "daily"} onChange={() => setRentCalculation("daily")} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#12303B]">Daily basis</p>
                      <p className="text-[11px] text-[#35515D] mt-[4px]">For day/month where tenant does not stay for the full duration (1st till end move-in or move-out month).</p>
                    </div>
                  </div>
                </label>

                <label className={`block border p-[12px] cursor-pointer ${rentCalculation === "half-monthly" ? "border-[#0F3D49] bg-[#F8FBFC]" : "border-[rgba(0,0,0,0.16)] bg-[#F7F7F9]"}`}>
                  <div className="flex items-start gap-[8px]">
                    <input type="radio" name="rent-calc" checked={rentCalculation === "half-monthly"} onChange={() => setRentCalculation("half-monthly")} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#12303B]">Half-monthly basis</p>
                      <p className="text-[11px] text-[#35515D] mt-[4px]">If tenant stays 14 nights or fewer in that month, they pay half month rent. If more, full month applies.</p>
                    </div>
                  </div>
                </label>

                <label className={`block border p-[12px] cursor-pointer ${rentCalculation === "monthly" ? "border-[#0F3D49] bg-[#F8FBFC]" : "border-[rgba(0,0,0,0.16)] bg-[#F7F7F9]"}`}>
                  <div className="flex items-start gap-[8px]">
                    <input type="radio" name="rent-calc" checked={rentCalculation === "monthly"} onChange={() => setRentCalculation("monthly")} className="mt-[2px] w-[14px] h-[14px] accent-brand-primary" />
                    <div>
                      <p className="text-[12px] font-semibold text-[#12303B]">Monthly basis</p>
                      <p className="text-[11px] text-[#35515D] mt-[4px]">Tenant always pays full month rent, regardless of move-in or move-out dates.</p>
                    </div>
                  </div>
                </label>
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
                        <li>Within 24 hours of confirmation: Full refund of first month</li>
                        <li>After 24 hours: No refund</li>
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
                        <li>More than 30 days away: Full refund</li>
                        <li>10 to 7 days away: 50% refund</li>
                        <li>Less than 7 days away: No refund</li>
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
                <label className="block text-[10px] text-neutral-gray mb-[2px]">Monthly rent</label>
                <input value={monthlyRentDisplay} onChange={(e) => setMonthlyRentDisplay(e.target.value)} className="w-full h-[30px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.35)] text-[16px] text-[#1A1A1A] focus:outline-none focus:border-brand-primary" />
              </div>
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
                            <option value="Excluded">Excluded</option>
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <select value={line.frequency} onChange={(e) => updateUtilityLine(index, "frequency", e.target.value as CostLine["frequency"])} className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none">
                            <option value="every month">every month</option>
                            <option value="one-time">one-time</option>
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <select value={line.estimateType} onChange={(e) => updateUtilityLine(index, "estimateType", e.target.value as CostLine["estimateType"])} className="w-full bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none">
                            <option value="Estimate">Estimate</option>
                            <option value="Exact">Exact</option>
                          </select>
                        </td>
                        <td className="px-[8px] py-[6px]">
                          <div className="flex items-center gap-[4px]">
                            <span>EUR</span>
                            <input value={line.amount} onChange={(e) => updateUtilityLine(index, "amount", e.target.value)} className="w-[76px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.20)] h-[24px] focus:outline-none" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={() =>
                  setUtilityLines((prev) => [
                    ...prev,
                    { type: "Broadcasting fee", includedInRent: "Included in rent", frequency: "every month", estimateType: "Estimate", amount: "0" },
                  ])
                }
                className="mt-[6px] text-[11px] text-[#12303B] hover:underline"
              >
                + Add New Cost
              </button>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Additional required costs</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Are there other costs the tenant must pay (e.g. membership fees for gym or building services)</p>
              <div className="mt-[6px] max-w-[240px]">
                <select value={selectedAdditionalRequiredCost} onChange={(e) => setSelectedAdditionalRequiredCost(e.target.value)} className="w-full h-[30px] bg-white border border-[rgba(0,0,0,0.20)] px-[8px] text-[11px] focus:outline-none focus:border-brand-primary">
                  <option value="">+ Add New Cost</option>
                  {additionalRequiredCostOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Optional services</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Besides the costs above, are there optional services the tenant could choose to pay for? E.g. early move-in</p>
              <div className="mt-[6px] max-w-[280px]">
                <select value={selectedOptionalService} onChange={(e) => setSelectedOptionalService(e.target.value)} className="w-full h-[30px] bg-white border border-[rgba(0,0,0,0.20)] px-[8px] text-[11px] focus:outline-none focus:border-brand-primary">
                  <option value="">+ Add New Cost</option>
                  {optionalServicesOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-[14px]">
              <p className="text-[12px] font-semibold text-[#12303B]">Deposits</p>
              <p className="text-[11px] text-[#35515D] mt-[2px]">Are you charging any deposits?</p>
              <div className="mt-[6px] max-w-[220px]">
                <select value={selectedDepositType} onChange={(e) => setSelectedDepositType(e.target.value)} className="w-full h-[30px] bg-white border border-[rgba(0,0,0,0.20)] px-[8px] text-[11px] focus:outline-none focus:border-brand-primary">
                  <option value="">+ Add New Cost</option>
                  {depositOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentSection === 6 && (
          <div className="max-w-[760px]">
            <div className="-mx-[20px] md:-mx-[28px] mb-[16px] h-[6px] bg-[rgba(0,0,0,0.16)]">
              <div className="h-full w-[92%] bg-[#0F3D49]"></div>
            </div>

            <h1 className="text-[30px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Rules and Preferences</h1>

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
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-neutral-gray" />
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
                  <ChevronDown className="pointer-events-none absolute right-[2px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-neutral-gray" />
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
              <h2 className="text-[30px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Documents from tenant</h2>
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
          <div className="max-w-[760px]">
            <div className="-mx-[20px] md:-mx-[28px] mb-[16px] h-[6px] bg-[rgba(0,0,0,0.16)]">
              <div className="h-full w-full bg-[#0F3D49]"></div>
            </div>

            <h1 className="text-[30px] leading-[1.08] font-bold text-[#12303B] tracking-[-0.02em]">Media</h1>

            <div className="mt-[16px]">
              <h2 className="text-[16px] font-semibold text-[#12303B]">Video</h2>
              <p className="mt-[4px] text-[11px] text-[#5A7380] max-w-[620px]">Rent out 3x faster and give tenants a better sense of the space. You can film a 1-2 minute video tour in landscape mode right from your phone.</p>

              <div className="mt-[10px] bg-[#E8EDF1] border border-[rgba(0,0,0,0.08)] p-[18px] h-[170px] flex flex-col items-center justify-center">
                <p className="self-start text-[12px] text-[#12303B] mb-[24px]">Upload a video</p>
                <button type="button" className="inline-flex items-center gap-[6px] h-[30px] px-[12px] border border-[#0F3D49] bg-white text-[10px] font-semibold text-[#12303B] hover:bg-[#F3F7F9]">
                  <Upload className="w-[13px] h-[13px]" />
                  <span>UPLOAD VIDEO</span>
                </button>
                <p className="mt-[8px] text-[12px] text-[#35515D]">or drag it here</p>
              </div>

              <div className="mt-[14px] max-w-[420px]">
                <label className="block text-[12px] text-[#12303B] mb-[4px]">Youtube video</label>
                <div className="flex items-end gap-[8px]">
                  <input
                    value={youtubeVideoUrl}
                    onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                    placeholder="Example: www.youtube.com/watch?v=..."
                    className="flex-1 h-[30px] bg-transparent border-0 border-b border-[rgba(0,0,0,0.28)] text-[12px] text-[#1A1A1A] placeholder:text-[#8A98A3] focus:outline-none focus:border-brand-primary"
                  />
                  <button
                    type="button"
                    className="h-[28px] px-[10px] border border-[rgba(0,0,0,0.14)] bg-[#F3F3F3] text-[10px] font-semibold text-[#9AA5AD]"
                  >
                    ADD VIDEO
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-[28px]">
              <h2 className="text-[16px] font-semibold text-[#12303B]">Photos<span className="text-[#C0392B]">*</span></h2>
              <p className="mt-[4px] text-[11px] text-[#5A7380]">Add stunning photos to your listing. You can add regular photos, 360-degree photos, and floor plans.</p>

              <div className="mt-[10px] border border-dashed border-[rgba(0,0,0,0.20)] p-[12px] bg-[#F8F9FA]">
                <div className="grid grid-cols-6 gap-[4px] bg-[#EEF1F3] p-[8px]">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={index} className="h-[44px] bg-white/55"></div>
                  ))}
                </div>
                <div className="-mt-[74px] h-[74px] flex flex-col items-center justify-center">
                  <button type="button" className="h-[30px] px-[12px] border border-[#0F3D49] bg-white text-[10px] font-semibold text-[#12303B] hover:bg-[#F3F7F9]">
                    UPLOAD PHOTOS
                  </button>
                  <p className="mt-[7px] text-[12px] text-[#35515D]">or drag them in</p>
                </div>
              </div>

              <div className="mt-[8px] flex items-center gap-[6px] text-[11px] text-[#5A7380]">
                <Info className="w-[12px] h-[12px]" />
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
            </div>
          </div>
        )}
      </div>

      <div className="fixed left-0 right-0 bottom-0 z-40 bg-[#F7F7F9] border-t border-[rgba(0,0,0,0.12)]">
        <div className="px-[20px] md:px-[28px] py-[14px] flex items-center justify-end gap-[12px]">
          {currentSection > 1 && (
            <button
              type="button"
              onClick={() => setCurrentSection((currentSection - 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7)}
              className="h-[40px] min-w-[86px] px-[16px] bg-[#D4D8DB] text-white text-[12px] font-semibold hover:bg-[#C7CDD1] transition-colors"
            >
              BACK
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (currentSection < 7) {
                setCurrentSection((currentSection + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7);
              }
            }}
            className="h-[40px] min-w-[86px] px-[16px] bg-brand-primary text-white text-[12px] font-semibold hover:bg-brand-primary-dark transition-colors"
          >
            {currentSection === 7 ? "PUBLISH" : "NEXT"}
          </button>
        </div>
      </div>
    </LandlordPortalLayout>
  );
}
