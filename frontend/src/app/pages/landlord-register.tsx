import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { COUNTRY_OPTIONS, PROPERTY_COUNT_OPTIONS } from "../utils/country-data";
import { Header } from "../components/header";
import image1Svg from "/src/assets/image1.svg?url";

type PhoneLengthRule = {
  min: number;
  max: number;
};

const DEFAULT_PHONE_RULE: PhoneLengthRule = { min: 6, max: 12 };

const COUNTRY_PHONE_RULES: Record<string, PhoneLengthRule> = {
  AU: { min: 9, max: 9 },
  AT: { min: 7, max: 13 },
  BE: { min: 8, max: 9 },
  CA: { min: 10, max: 10 },
  CN: { min: 11, max: 11 },
  CZ: { min: 9, max: 9 },
  DK: { min: 8, max: 8 },
  FI: { min: 7, max: 12 },
  FR: { min: 9, max: 9 },
  DE: { min: 10, max: 11 },
  GR: { min: 10, max: 10 },
  HK: { min: 8, max: 8 },
  IN: { min: 10, max: 10 },
  IE: { min: 7, max: 9 },
  IT: { min: 9, max: 10 },
  JP: { min: 10, max: 10 },
  MY: { min: 9, max: 10 },
  NL: { min: 9, max: 9 },
  NZ: { min: 8, max: 10 },
  NO: { min: 8, max: 8 },
  PL: { min: 9, max: 9 },
  PT: { min: 9, max: 9 },
  RO: { min: 9, max: 9 },
  SG: { min: 8, max: 8 },
  ES: { min: 9, max: 9 },
  SE: { min: 7, max: 9 },
  CH: { min: 9, max: 9 },
  TH: { min: 9, max: 9 },
  TR: { min: 10, max: 10 },
  AE: { min: 9, max: 9 },
  GB: { min: 10, max: 11 },
  US: { min: 10, max: 10 },
};

function getCountryPhoneRule(countryCode?: string) {
  if (!countryCode) {
    return DEFAULT_PHONE_RULE;
  }

  return COUNTRY_PHONE_RULES[countryCode] ?? DEFAULT_PHONE_RULE;
}

export function LandlordRegister() {
  const navigate = useNavigate();
  const { registerAsLandlord, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    businessType: "" as "" | "individual" | "dealer" | "agency",
    numberOfProperties: "",
    countryOfRegistration: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRegistrationCountry = COUNTRY_OPTIONS.find((country) => country.name === formData.countryOfRegistration);
  const selectedPhoneRule = getCountryPhoneRule(selectedRegistrationCountry?.code);
  const phoneDigits = formData.phoneNumber.replace(/\D/g, "");
  const isPhoneNumberValid =
    phoneDigits.length >= selectedPhoneRule.min && phoneDigits.length <= selectedPhoneRule.max;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "countryOfRegistration") {
      const matchedCountry = COUNTRY_OPTIONS.find((country) => country.name === value);
      setFormData((prev) => ({
        ...prev,
        countryOfRegistration: value,
        phoneCountryCode: matchedCountry?.dialCode ?? prev.phoneCountryCode,
      }));
      return;
    }

    if (name === "phoneNumber") {
      setFormData((prev) => ({
        ...prev,
        phoneNumber: value,
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!formData.businessType) {
      setError("Please select what type of landlord you are.");
      return;
    }

    if (!selectedRegistrationCountry) {
      setError("Please select your country of registration.");
      return;
    }

    if (!isPhoneNumberValid) {
      setError(
        `Phone number for ${selectedRegistrationCountry.name} should be between ${selectedPhoneRule.min} and ${selectedPhoneRule.max} digits.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await registerAsLandlord({
        businessType: formData.businessType,
        numberOfProperties: parseInt(formData.numberOfProperties, 10) || 0,
        countryOfRegistration: formData.countryOfRegistration,
        phoneCountryCode: formData.phoneCountryCode,
        phoneNumber: formData.phoneNumber,
      });

      navigate("/landlord/add-listing");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete landlord registration";
      if (message.toLowerCase().includes("logged in") || message.toLowerCase().includes("session expired")) {
        navigate("/login");
        return;
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canContinue =
    formData.businessType.length > 0 &&
    formData.numberOfProperties.length > 0 &&
    formData.countryOfRegistration.length > 0 &&
    formData.phoneCountryCode.length > 0 &&
    phoneDigits.length >= selectedPhoneRule.min &&
    phoneDigits.length <= selectedPhoneRule.max;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-[1440px] px-[32px] py-[24px] lg:py-[32px]">
        <div className="grid items-start gap-[28px] lg:grid-cols-[minmax(0,620px)_minmax(0,1fr)]">
          <div className="max-w-[620px]">
          <div className="mb-[24px] lg:mb-[32px]">
            <h1 className="mb-[8px] text-[#244A57] text-[26px] lg:text-[30px] font-bold leading-[1.15]">
              Welcome to ReserveHousing!
            </h1>
            <p className="text-[#6C7A89] text-[15px] lg:text-[16px]">
              We need some basic information before you can start listing properties
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-[20px] rounded-[10px] border border-[rgba(133,155,175,0.42)] bg-white p-[18px] lg:p-[20px]"
          >
            <div className="space-y-[10px]">
              <h2 className="text-[#244A57] text-[16px] font-bold">What type of landlord are you?</h2>
              <p className="text-[#6C7A89] text-[14px]">
                This helps us verify your account and describe you to tenants.
              </p>
            </div>

            <div className="space-y-[10px]">
              <label
                className={`block cursor-pointer rounded-[2px] border px-[16px] py-[16px] transition-colors ${
                  formData.businessType === "individual" ? "border-[#284D61] bg-white" : "border-[#C0CDD8] bg-white"
                }`}
              >
                <div className="flex items-start gap-[12px]">
                  <input
                    type="radio"
                    name="businessType"
                    value="individual"
                    checked={formData.businessType === "individual"}
                    onChange={handleChange}
                    className="mt-[2px] h-[16px] w-[16px] accent-[#284D61]"
                  />
                  <div>
                    <div className="text-[#244A57] text-[14px] font-semibold">Private landlord</div>
                    <div className="mt-[4px] max-w-[520px] text-[#7D8A96] text-[13px] leading-[1.5]">
                      Choose this if: You're renting out as an individual, private owner, or subletter. Your listings will show as 'Private landlord'.
                    </div>
                  </div>
                </div>
              </label>

              <label
                className={`block cursor-pointer rounded-[2px] border px-[16px] py-[16px] transition-colors ${
                  formData.businessType === "dealer" ? "border-[#284D61] bg-white" : "border-[#C0CDD8] bg-white"
                }`}
              >
                <div className="flex items-start gap-[12px]">
                  <input
                    type="radio"
                    name="businessType"
                    value="dealer"
                    checked={formData.businessType === "dealer"}
                    onChange={handleChange}
                    className="mt-[2px] h-[16px] w-[16px] accent-[#284D61]"
                  />
                  <div>
                    <div className="text-[#244A57] text-[14px] font-semibold">Rental company, property manager, agency, or other company</div>
                    <div className="mt-[4px] max-w-[600px] text-[#7D8A96] text-[13px] leading-[1.5]">
                      Choose this if: You're managing properties on behalf of a business. Your listings will show as 'Rental company'.
                    </div>
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-[28px]">
              <div className="max-w-[420px]">
                <label htmlFor="numberOfProperties" className="mb-[8px] block text-[#244A57] text-[14px] font-semibold">
                  How many properties do you have?
                </label>
                <div className="relative">
                  <select
                    id="numberOfProperties"
                    name="numberOfProperties"
                    value={formData.numberOfProperties}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-[2px] border border-[rgba(0,0,0,0.14)] bg-white px-[12px] py-[12px] pr-[40px] text-[#244A57] text-[14px] focus:outline-none focus:border-[#284D61]"
                  >
                    {PROPERTY_COUNT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value} disabled={option.value === ""}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#244A57]" />
                </div>
              </div>

              <div className="max-w-[420px]">
                <label htmlFor="countryOfRegistration" className="mb-[8px] block text-[#244A57] text-[14px] font-semibold">
                  Where are you registered?
                </label>
                <div className="relative">
                  <select
                    id="countryOfRegistration"
                    name="countryOfRegistration"
                    value={formData.countryOfRegistration}
                    onChange={handleChange}
                    required
                    className="w-full appearance-none rounded-[2px] border border-[rgba(0,0,0,0.14)] bg-white px-[12px] py-[12px] pr-[40px] text-[#244A57] text-[14px] focus:outline-none focus:border-[#284D61]"
                  >
                    <option value="">Country of registration *</option>
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#244A57]" />
                </div>
              </div>

              <div className="max-w-[420px]">
                <label htmlFor="phoneNumber" className="mb-[8px] block text-[#244A57] text-[14px] font-semibold">
                  What is your phone number?
                </label>
                <div className="grid gap-[12px] sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="relative">
                    <select
                      id="phoneCountryCode"
                      name="phoneCountryCode"
                      value={formData.phoneCountryCode}
                      onChange={handleChange}
                      disabled={!selectedRegistrationCountry}
                      className="w-full appearance-none rounded-[2px] border border-[rgba(0,0,0,0.14)] bg-white px-[12px] py-[12px] pr-[40px] text-[#244A57] text-[14px] focus:outline-none focus:border-[#284D61]"
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={`${country.code}-${country.dialCode}`} value={country.dialCode}>
                          {country.code} {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-[#244A57]" />
                  </div>

                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    placeholder="Phone number"
                    className="w-full rounded-[2px] border border-[rgba(0,0,0,0.14)] px-[12px] py-[12px] text-[#244A57] text-[14px] focus:outline-none focus:border-[#284D61]"
                  />
                </div>
                <p className="mt-[10px] flex items-center gap-[8px] text-[#8A96A3] text-[12px]">
                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#E7EAEE] text-[11px] font-bold text-[#8A96A3]">
                    i
                  </span>
                  {selectedRegistrationCountry
                    ? `Phone code matched to ${selectedRegistrationCountry.name}. Use a ${selectedPhoneRule.min === selectedPhoneRule.max ? `${selectedPhoneRule.min}` : `${selectedPhoneRule.min}-${selectedPhoneRule.max}`} digit number.`
                    : "Select your country first, then the phone code will be matched automatically."}
                </p>
              </div>
            </div>

            {error && <div className="text-brand-primary text-[14px] font-semibold">{error}</div>}

            <div className="flex justify-start pt-[8px]">
              <button
                type="submit"
                disabled={!canContinue || isSubmitting}
                className="min-w-[116px] rounded-[4px] bg-brand-primary px-[24px] py-[14px] text-white font-semibold uppercase tracking-[0.01em] shadow-[0_6px_16px_rgba(0,146,132,0.24)] hover:bg-brand-primary-dark disabled:cursor-not-allowed disabled:bg-[#D8DDE3] disabled:text-white disabled:shadow-none transition-colors"
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </button>
            </div>
          </form>
          </div>

          <div className="hidden justify-center pt-[34px] lg:flex lg:pt-[54px]">
            <img
              src={image1Svg}
              alt="Landlord registration illustration"
              className="w-full max-w-[320px] h-auto"
            />
          </div>
        </div>
      </main>
    </div>
  );
}