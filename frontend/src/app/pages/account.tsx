import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { User, FileText, Mail, Key, Bell, Camera, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type TabType = "profile" | "documents" | "contact" | "password" | "notifications";

export function Account() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [gender, setGender] = useState("male");
  const [occupation, setOccupation] = useState("student");
  const [languages, setLanguages] = useState<string[]>([]);

  const addLanguage = () => {
    setLanguages([...languages, ""]);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F9]">
      <Header />

      <main className="flex-1 py-[40px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-[32px]">
            <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">
              Account
            </h1>
            <button className="px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
              VIEW PROFILE
            </button>
          </div>

          <div className="grid grid-cols-[240px_1fr] gap-[24px]">
            {/* Left Sidebar Navigation */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[16px] h-fit">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] text-left text-[14px] mb-[4px] transition-colors ${
                  activeTab === "profile"
                    ? "bg-[#F7F7F9] text-[#1A1A1A] font-semibold"
                    : "text-[#6B6B6B] hover:bg-[#F7F7F9]"
                }`}
              >
                <User className="w-[16px] h-[16px]" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] text-left text-[14px] mb-[4px] transition-colors ${
                  activeTab === "documents"
                    ? "bg-[#F7F7F9] text-[#1A1A1A] font-semibold"
                    : "text-[#6B6B6B] hover:bg-[#F7F7F9]"
                }`}
              >
                <FileText className="w-[16px] h-[16px]" />
                Supporting documents
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] text-left text-[14px] mb-[4px] transition-colors ${
                  activeTab === "contact"
                    ? "bg-[#F7F7F9] text-[#1A1A1A] font-semibold"
                    : "text-[#6B6B6B] hover:bg-[#F7F7F9]"
                }`}
              >
                <Mail className="w-[16px] h-[16px]" />
                Contact details
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] text-left text-[14px] mb-[4px] transition-colors ${
                  activeTab === "password"
                    ? "bg-[#F7F7F9] text-[#1A1A1A] font-semibold"
                    : "text-[#6B6B6B] hover:bg-[#F7F7F9]"
                }`}
              >
                <Key className="w-[16px] h-[16px]" />
                Change password
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-[12px] px-[12px] py-[10px] text-left text-[14px] transition-colors ${
                  activeTab === "notifications"
                    ? "bg-[#F7F7F9] text-[#1A1A1A] font-semibold"
                    : "text-[#6B6B6B] hover:bg-[#F7F7F9]"
                }`}
              >
                <Bell className="w-[16px] h-[16px]" />
                Notification settings
              </button>
            </div>

            {/* Main Content Area */}
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[32px]">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[32px]">
                    Personal information
                  </h2>

                  <form className="space-y-[24px]">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-[16px] mb-[32px]">
                      <div className="w-[80px] h-[80px] bg-[#E0E0E0] rounded-full flex items-center justify-center overflow-hidden">
                        <Camera className="w-[32px] h-[32px] text-[#6B6B6B]" />
                      </div>
                      <button
                        type="button"
                        className="text-[#FF4B27] text-[13px] font-semibold hover:underline"
                      >
                        Change profile picture
                      </button>
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                          First Name <span className="text-[#FF4B27]">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="Abdullah"
                          required
                          className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                          Last Name <span className="text-[#FF4B27]">*</span>
                        </label>
                        <input
                          type="text"
                          defaultValue="Afaq"
                          required
                          className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                        Date of birth
                      </label>
                      <div className="grid grid-cols-3 gap-[12px]">
                        <select className="px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]">
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <select className="px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]">
                          <option value="">Month</option>
                          <option value="1">January</option>
                          <option value="2">February</option>
                          <option value="3">March</option>
                          <option value="4">April</option>
                          <option value="5">May</option>
                          <option value="6">June</option>
                          <option value="7">July</option>
                          <option value="8">August</option>
                          <option value="9">September</option>
                          <option value="10">October</option>
                          <option value="11">November</option>
                          <option value="12">December</option>
                        </select>
                        <select className="px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]">
                          <option value="">Year</option>
                          {Array.from({ length: 80 }, (_, i) => {
                            const year = 2010 - i;
                            return (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[12px]">
                        Gender
                      </label>
                      <div className="flex items-center gap-[24px]">
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={gender === "male"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-[16px] h-[16px] accent-[#FF4B27]"
                          />
                          <span className="text-[#1A1A1A] text-[14px]">Male</span>
                        </label>
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={gender === "female"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-[16px] h-[16px] accent-[#FF4B27]"
                          />
                          <span className="text-[#1A1A1A] text-[14px]">Female</span>
                        </label>
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={gender === "other"}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-[16px] h-[16px] accent-[#FF4B27]"
                          />
                          <span className="text-[#1A1A1A] text-[14px]">Other</span>
                        </label>
                      </div>
                    </div>

                    {/* City and Nationality */}
                    <div className="grid grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                          City of residence <span className="text-[#FF4B27]">*</span>
                        </label>
                        <select className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]">
                          <option value="">Select city</option>
                          <option value="barcelona">Barcelona, Spain</option>
                          <option value="berlin">Berlin, Germany</option>
                          <option value="amsterdam">Amsterdam, Netherlands</option>
                          <option value="paris">Paris, France</option>
                          <option value="london">London, UK</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                          Nationality <span className="text-[#FF4B27]">*</span>
                        </label>
                        <select className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]">
                          <option value="">Select nationality</option>
                          <option value="spanish">Spanish</option>
                          <option value="german">German</option>
                          <option value="dutch">Dutch</option>
                          <option value="french">French</option>
                          <option value="british">British</option>
                          <option value="american">American</option>
                        </select>
                        <p className="text-[#FF4B27] text-[11px] mt-[4px]">This field is required</p>
                      </div>
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[12px]">
                        Occupation
                      </label>
                      <div className="flex items-center gap-[24px] mb-[16px]">
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="radio"
                            name="occupation"
                            value="student"
                            checked={occupation === "student"}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-[16px] h-[16px] accent-[#FF4B27]"
                          />
                          <span className="text-[#1A1A1A] text-[14px]">Student</span>
                        </label>
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="radio"
                            name="occupation"
                            value="working"
                            checked={occupation === "working"}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-[16px] h-[16px] accent-[#FF4B27]"
                          />
                          <span className="text-[#1A1A1A] text-[14px]">Working professional</span>
                        </label>
                        <label className="flex items-center gap-[8px] cursor-pointer">
                          <input
                            type="radio"
                            name="occupation"
                            value="other"
                            checked={occupation === "other"}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-[16px] h-[16px] accent-[#FF4B27]"
                          />
                          <span className="text-[#1A1A1A] text-[14px]">Other</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        placeholder="School / University"
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>

                    {/* About Me */}
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                        About me
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Tell us about yourself..."
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#FF4B27] resize-none"
                      />
                    </div>

                    {/* Spoken Languages */}
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[12px]">
                        Spoken Languages
                      </label>
                      <div className="space-y-[12px] mb-[12px]">
                        {languages.map((lang, index) => (
                          <div key={index} className="flex items-center gap-[12px]">
                            <select className="flex-1 px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]">
                              <option value="">Select language</option>
                              <option value="english">English</option>
                              <option value="spanish">Spanish</option>
                              <option value="german">German</option>
                              <option value="french">French</option>
                              <option value="dutch">Dutch</option>
                              <option value="italian">Italian</option>
                              <option value="portuguese">Portuguese</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeLanguage(index)}
                              className="p-[8px] text-[#FF4B27] hover:bg-[#F7F7F9] transition-colors"
                            >
                              <Trash2 className="w-[16px] h-[16px]" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="flex items-center gap-[8px] text-[#FF4B27] text-[13px] font-semibold hover:underline"
                      >
                        <Plus className="w-[14px] h-[14px]" />
                        Add languages
                      </button>
                    </div>

                    {/* Save Button */}
                    <div className="pt-[24px] border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                      <button
                        type="button"
                        className="text-[#FF4B27] text-[13px] font-semibold hover:underline"
                      >
                        Delete account
                      </button>
                      <button
                        type="submit"
                        className="px-[32px] py-[12px] bg-[#FF4B27] text-white text-[14px] font-bold hover:bg-[#E63E1C] transition-colors"
                      >
                        SAVE CHANGES
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "documents" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[32px]">
                    Supporting documents
                  </h2>
                  
                  <div className="space-y-[32px]">
                    {/* Rental agreements */}
                    <div className="pb-[32px] border-b border-[rgba(0,0,0,0.08)]">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">
                        Rental agreements
                      </h3>
                      <p className="text-[#6B6B6B] text-[14px] leading-[1.6] mb-[16px]">
                        Upload a copy of your rental agreements to easily share with future tenants.
                      </p>
                      <div className="flex items-start gap-[16px]">
                        <button className="px-[20px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                          UPLOAD
                        </button>
                        <div className="text-[#6B6B6B] text-[12px]">
                          <p>Maximum file size: 7 MB</p>
                          <p>Accepted formats: pdf, png, jpg, jpeg</p>
                        </div>
                      </div>
                    </div>

                    {/* Rules and requirements */}
                    <div className="pb-[32px] border-b border-[rgba(0,0,0,0.08)]">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">
                        Rules and requirements
                      </h3>
                      <p className="text-[#6B6B6B] text-[14px] leading-[1.6] mb-[16px]">
                        Upload documents that inform your future tenants about the requirements for renting your properties. E.g., house rules.
                      </p>
                      <div className="flex items-start gap-[16px]">
                        <button className="px-[20px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                          UPLOAD
                        </button>
                        <div className="text-[#6B6B6B] text-[12px]">
                          <p>Maximum file size: 7 MB</p>
                          <p>Accepted formats: pdf, png, jpg, jpeg</p>
                        </div>
                      </div>
                    </div>

                    {/* Other documents */}
                    <div>
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">
                        Other documents
                      </h3>
                      <p className="text-[#6B6B6B] text-[14px] leading-[1.6] mb-[16px]">
                        Upload other documents that relate to your account on HousingAnywhere.
                      </p>
                      <div className="flex items-start gap-[16px]">
                        <button className="px-[20px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                          UPLOAD
                        </button>
                        <div className="text-[#6B6B6B] text-[12px]">
                          <p>Maximum file size: 7 MB</p>
                          <p>Accepted formats: pdf, png, jpg, jpeg</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "contact" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[32px]">
                    Contact details
                  </h2>
                  
                  {/* Email Address Section */}
                  <div className="mb-[32px] pb-[32px] border-b border-[rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between mb-[16px]">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold">
                        Email address
                      </h3>
                      <div className="flex items-center gap-[6px] text-[#008A52] text-[13px] font-semibold">
                        <svg className="w-[14px] h-[14px]" viewBox="0 0 14 14" fill="none">
                          <circle cx="7" cy="7" r="7" fill="#008A52"/>
                          <path d="M4 7L6 9L10 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Verified
                      </div>
                    </div>
                    <p className="text-[#1A1A1A] text-[14px] mb-[16px]">
                      ****qq@gm******.com
                    </p>
                    <button className="px-[20px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                      Edit
                    </button>
                  </div>

                  {/* Mobile Number Section */}
                  <div>
                    <div className="flex items-center justify-between mb-[12px]">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold">
                        Mobile number
                      </h3>
                      <div className="flex items-center gap-[6px] px-[10px] py-[4px] bg-[#FFF4E6] text-[#FF8C00] text-[12px] font-semibold">
                        <svg className="w-[12px] h-[12px]" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="5" stroke="#FF8C00" strokeWidth="1"/>
                          <path d="M6 3V6.5M6 8.5V9" stroke="#FF8C00" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        Not Verified
                      </div>
                    </div>
                    <p className="text-[#1A1A1A] text-[14px] mb-[16px]">
                      Your mobile number is used for account verification. It's only shared with the person you rent with.
                    </p>
                    
                    <div>
                      <label className="block text-[#6B6B6B] text-[12px] mb-[8px]">
                        Mobile number
                      </label>
                      <label className="block text-[#6B6B6B] text-[12px] mb-[8px]">
                        Country code
                      </label>
                      <div className="flex items-center gap-[12px] mb-[16px]">
                        <select 
                          defaultValue="+92"
                          className="w-[120px] px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        >
                          <option value="+1">US, +1</option>
                          <option value="+31">NL, +31</option>
                          <option value="+32">BE, +32</option>
                          <option value="+33">FR, +33</option>
                          <option value="+34">ES, +34</option>
                          <option value="+39">IT, +39</option>
                          <option value="+44">UK, +44</option>
                          <option value="+49">DE, +49</option>
                          <option value="+92">PK, +92</option>
                        </select>
                        <input
                          type="tel"
                          defaultValue="3143328342"
                          className="flex-1 px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                      <div className="flex items-center gap-[12px]">
                        <button className="px-[20px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
                          Edit
                        </button>
                        <button className="px-[20px] py-[8px] bg-[#FF4B27] text-white text-[13px] font-semibold hover:bg-[#E63E1C] transition-colors">
                          Send code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "password" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">
                    Change password
                  </h2>
                  <form className="space-y-[24px]">
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                        Current password
                      </label>
                      <input
                        type="password"
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                        New password
                      </label>
                      <input
                        type="password"
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-[32px] py-[12px] bg-[#FF4B27] text-white text-[14px] font-bold hover:bg-[#E63E1C] transition-colors"
                    >
                      UPDATE PASSWORD
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">
                    Notification settings
                  </h2>
                  <div className="space-y-[20px]">
                    <div className="flex items-center justify-between py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                      <div>
                        <p className="text-[#1A1A1A] text-[14px] font-semibold mb-[4px]">
                          Email notifications
                        </p>
                        <p className="text-[#6B6B6B] text-[13px]">
                          Receive updates about messages and bookings
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-[20px] h-[20px] accent-[#FF4B27]"
                      />
                    </div>
                    <div className="flex items-center justify-between py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                      <div>
                        <p className="text-[#1A1A1A] text-[14px] font-semibold mb-[4px]">
                          SMS notifications
                        </p>
                        <p className="text-[#6B6B6B] text-[13px]">
                          Get text messages for important updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-[20px] h-[20px] accent-[#FF4B27]"
                      />
                    </div>
                    <div className="flex items-center justify-between py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                      <div>
                        <p className="text-[#1A1A1A] text-[14px] font-semibold mb-[4px]">
                          Marketing emails
                        </p>
                        <p className="text-[#6B6B6B] text-[13px]">
                          Receive tips, promotions, and special offers
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-[20px] h-[20px] accent-[#FF4B27]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}