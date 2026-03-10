import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/auth-context";
import { 
  Home, 
  User, 
  Phone, 
  Building2, 
  FileText, 
  MapPin,
  CheckCircle,
} from "lucide-react";

export function LandlordRegister() {
  const navigate = useNavigate();
  const { registerAsLandlord } = useAuth();
  
  const [formData, setFormData] = useState({
    businessType: "individual" as "individual" | "dealer" | "agency",
    numberOfProperties: "",
    phoneNumber: "",
    businessName: "",
    licenseNumber: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Register as landlord
    registerAsLandlord({
      businessType: formData.businessType,
      numberOfProperties: parseInt(formData.numberOfProperties) || 0,
      phoneNumber: formData.phoneNumber,
      businessName: formData.businessName || undefined,
      licenseNumber: formData.licenseNumber || undefined,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
    });

    // Redirect to dashboard
    navigate("/landlord/dashboard");
  };

  return (
    <div className="min-h-screen bg-neutral-light-gray">
      {/* Header */}
      <nav className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1200px] mx-auto px-[32px] py-[16px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-[8px]">
            <div className="w-[32px] h-[32px] bg-brand-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-neutral-black text-[18px] font-bold">
              Easy<span className="text-brand-primary">Rent</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-[16px]">
            <Link to="/help" className="text-neutral-gray text-[14px] hover:text-neutral-black">
              Need Help?
            </Link>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1200px] mx-auto px-[32px] py-[24px]">
          <div className="flex items-center justify-between mb-[16px]">
            <div className="flex items-center gap-[8px]">
              <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[14px] ${
                step >= 1 ? "bg-brand-primary text-white" : "bg-neutral-light-gray text-neutral-gray"
              }`}>
                {step > 1 ? <CheckCircle className="w-[20px] h-[20px]" /> : "1"}
              </div>
              <span className={`text-[14px] font-semibold ${step >= 1 ? "text-neutral-black" : "text-neutral-gray"}`}>
                Business Type
              </span>
            </div>
            <div className={`flex-1 h-[2px] mx-[16px] ${step >= 2 ? "bg-brand-primary" : "bg-neutral-light-gray"}`}></div>
            <div className="flex items-center gap-[8px]">
              <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[14px] ${
                step >= 2 ? "bg-brand-primary text-white" : "bg-neutral-light-gray text-neutral-gray"
              }`}>
                {step > 2 ? <CheckCircle className="w-[20px] h-[20px]" /> : "2"}
              </div>
              <span className={`text-[14px] font-semibold ${step >= 2 ? "text-neutral-black" : "text-neutral-gray"}`}>
                Contact Details
              </span>
            </div>
            <div className={`flex-1 h-[2px] mx-[16px] ${step >= 3 ? "bg-brand-primary" : "bg-neutral-light-gray"}`}></div>
            <div className="flex items-center gap-[8px]">
              <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center font-bold text-[14px] ${
                step >= 3 ? "bg-brand-primary text-white" : "bg-neutral-light-gray text-neutral-gray"
              }`}>
                3
              </div>
              <span className={`text-[14px] font-semibold ${step >= 3 ? "text-neutral-black" : "text-neutral-gray"}`}>
                Address
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-[800px] mx-auto px-[32px] py-[48px]">
        <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[48px]">
          <div className="text-center mb-[48px]">
            <div className="w-[64px] h-[64px] bg-brand-light mx-auto mb-[16px] flex items-center justify-center">
              <Home className="w-[32px] h-[32px] text-brand-primary" />
            </div>
            <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
              Become a Landlord
            </h1>
            <p className="text-neutral-gray text-[16px]">
              Complete your profile to start listing properties
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Type */}
            {step === 1 && (
              <div className="space-y-[24px]">
                <div>
                  <label className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                    What type of landlord are you? *
                  </label>
                  <div className="space-y-[12px]">
                    <label className="flex items-start gap-[12px] p-[16px] border-[2px] cursor-pointer transition-colors hover:border-brand-primary">
                      <input
                        type="radio"
                        name="businessType"
                        value="individual"
                        checked={formData.businessType === "individual"}
                        onChange={handleChange}
                        className="mt-[2px] w-[20px] h-[20px] accent-brand-primary"
                      />
                      <div className="flex-1">
                        <div className="text-neutral-black text-[16px] font-bold mb-[4px]">
                          Individual Property Owner
                        </div>
                        <div className="text-neutral-gray text-[14px]">
                          I own one or more properties and rent them out privately
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-[12px] p-[16px] border-[2px] cursor-pointer transition-colors hover:border-brand-primary">
                      <input
                        type="radio"
                        name="businessType"
                        value="dealer"
                        checked={formData.businessType === "dealer"}
                        onChange={handleChange}
                        className="mt-[2px] w-[20px] h-[20px] accent-brand-primary"
                      />
                      <div className="flex-1">
                        <div className="text-neutral-black text-[16px] font-bold mb-[4px]">
                          Property Dealer
                        </div>
                        <div className="text-neutral-gray text-[14px]">
                          I am a licensed dealer managing properties for multiple owners
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-start gap-[12px] p-[16px] border-[2px] cursor-pointer transition-colors hover:border-brand-primary">
                      <input
                        type="radio"
                        name="businessType"
                        value="agency"
                        checked={formData.businessType === "agency"}
                        onChange={handleChange}
                        className="mt-[2px] w-[20px] h-[20px] accent-brand-primary"
                      />
                      <div className="flex-1">
                        <div className="text-neutral-black text-[16px] font-bold mb-[4px]">
                          Real Estate Agency
                        </div>
                        <div className="text-neutral-gray text-[14px]">
                          I represent a registered real estate agency or company
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="numberOfProperties" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                    How many properties do you manage? *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-[16px] top-[50%] translate-y-[-50%] w-[20px] h-[20px] text-neutral-gray" />
                    <input
                      type="number"
                      id="numberOfProperties"
                      name="numberOfProperties"
                      value={formData.numberOfProperties}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="e.g. 5"
                      className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  <p className="text-neutral-gray text-[12px] mt-[8px]">
                    Include all properties you currently own or manage
                  </p>
                </div>

                {(formData.businessType === "dealer" || formData.businessType === "agency") && (
                  <>
                    <div>
                      <label htmlFor="businessName" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                        Business Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-[16px] top-[50%] translate-y-[-50%] w-[20px] h-[20px] text-neutral-gray" />
                        <input
                          type="text"
                          id="businessName"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleChange}
                          required={formData.businessType !== "individual"}
                          placeholder="Your business or agency name"
                          className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="licenseNumber" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                        License Number *
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-[16px] top-[50%] translate-y-[-50%] w-[20px] h-[20px] text-neutral-gray" />
                        <input
                          type="text"
                          id="licenseNumber"
                          name="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          required={formData.businessType !== "individual"}
                          placeholder="Your business license number"
                          className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-[24px]">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.numberOfProperties}
                    className="px-[32px] py-[12px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:bg-neutral-gray disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {step === 2 && (
              <div className="space-y-[24px]">
                <div>
                  <label htmlFor="phoneNumber" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-[16px] top-[50%] translate-y-[-50%] w-[20px] h-[20px] text-neutral-gray" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      placeholder="+49 XXX XXX XXXX"
                      className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                  <p className="text-neutral-gray text-[12px] mt-[8px]">
                    Tenants will use this to contact you about properties
                  </p>
                </div>

                <div className="flex gap-[16px] pt-[24px]">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-[32px] py-[12px] border-[2px] border-neutral-black text-neutral-black font-semibold hover:bg-neutral-black hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!formData.phoneNumber}
                    className="flex-1 px-[32px] py-[12px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:bg-neutral-gray disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <div className="space-y-[24px]">
                <div>
                  <label htmlFor="address" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                    Street Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-[16px] top-[16px] w-[20px] h-[20px] text-neutral-gray" />
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Street name and number"
                      className="w-full pl-[48px] pr-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-[16px]">
                  <div>
                    <label htmlFor="city" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Berlin"
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-neutral-black text-[14px] font-bold mb-[8px]">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 10115"
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] focus:outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-brand-light border-l-[4px] border-brand-primary p-[16px]">
                  <p className="text-neutral-black text-[14px]">
                    <strong>Note:</strong> Your address will only be used for verification purposes and contract documentation. It will not be publicly displayed.
                  </p>
                </div>

                <div className="flex gap-[16px] pt-[24px]">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-[32px] py-[12px] border-[2px] border-neutral-black text-neutral-black font-semibold hover:bg-neutral-black hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.address || !formData.city || !formData.postalCode}
                    className="flex-1 px-[32px] py-[12px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark disabled:bg-neutral-gray disabled:cursor-not-allowed transition-colors"
                  >
                    Complete Registration
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-[32px] text-center">
          <p className="text-neutral-gray text-[14px]">
            Questions about becoming a landlord?{" "}
            <Link to="/help" className="text-brand-primary font-semibold hover:underline">
              Visit our Help Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}