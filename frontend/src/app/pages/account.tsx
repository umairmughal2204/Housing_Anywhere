import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { User, FileText, Mail, Key, Bell, Camera, Plus, Trash2 } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth-context";

type TabType = "profile" | "documents" | "contact" | "password" | "notifications";
type Gender = "male" | "female" | "other";
type Occupation = "student" | "working" | "other";

interface ProfileFormState {
  firstName: string;
  lastName: string;
  gender: Gender;
  cityOfResidence: string;
  nationality: string;
  occupation: Occupation;
  organization: string;
  aboutMe: string;
  languages: string[];
  day: string;
  month: string;
  year: string;
}

interface ContactFormState {
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
}

const DEFAULT_PROFILE: ProfileFormState = {
  firstName: "",
  lastName: "",
  gender: "male",
  cityOfResidence: "",
  nationality: "",
  occupation: "student",
  organization: "",
  aboutMe: "",
  languages: [],
  day: "",
  month: "",
  year: "",
};

const COUNTRY_CODES = ["+1", "+31", "+32", "+33", "+34", "+39", "+44", "+49", "+92"];
const LANGUAGE_OPTIONS = ["english", "spanish", "german", "french", "dutch", "italian", "portuguese"];

function splitDate(dateOfBirth?: string) {
  if (!dateOfBirth) {
    return { day: "", month: "", year: "" };
  }

  const date = new Date(dateOfBirth);
  if (Number.isNaN(date.getTime())) {
    return { day: "", month: "", year: "" };
  }

  return {
    day: String(date.getUTCDate()),
    month: String(date.getUTCMonth() + 1),
    year: String(date.getUTCFullYear()),
  };
}

export function Account() {
  const { user, updateProfile, updateContactDetails, changePassword, uploadProfilePicture, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [profileForm, setProfileForm] = useState<ProfileFormState>(DEFAULT_PROFILE);
  const [contactForm, setContactForm] = useState<ContactFormState>({
    email: "",
    phoneCountryCode: "+1",
    phoneNumber: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role !== "landlord") {
      setActiveTab((prev) => (prev === "documents" ? "profile" : prev));
    }

    const parsedDate = splitDate(user.dateOfBirth);

    setProfileForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      gender: user.gender ?? "male",
      cityOfResidence: user.cityOfResidence ?? "",
      nationality: user.nationality ?? "",
      occupation: user.occupation ?? "student",
      organization: user.organization ?? "",
      aboutMe: user.aboutMe ?? "",
      languages: user.languages ?? [],
      day: parsedDate.day,
      month: parsedDate.month,
      year: parsedDate.year,
    });

    setContactForm({
      email: user.email ?? "",
      phoneCountryCode: user.phoneCountryCode ?? "+1",
      phoneNumber: user.phoneNumber ?? "",
    });
  }, [user]);

  const years = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => String(new Date().getFullYear() - i));
  }, []);

  const addLanguage = () => {
    setProfileForm((prev) => ({
      ...prev,
      languages: [...prev.languages, ""],
    }));
  };

  const removeLanguage = (index: number) => {
    setProfileForm((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const updateLanguage = (index: number, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      languages: prev.languages.map((lang, i) => (i === index ? value : lang)),
    }));
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileStatus(null);
    setProfileError(null);

    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileError("First name and last name are required.");
      return;
    }

    let dateOfBirth: string | undefined;
    if (profileForm.day && profileForm.month && profileForm.year) {
      const month = profileForm.month.padStart(2, "0");
      const day = profileForm.day.padStart(2, "0");
      dateOfBirth = `${profileForm.year}-${month}-${day}`;
    }

    setIsSavingProfile(true);

    try {
      await updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        dateOfBirth,
        gender: profileForm.gender,
        cityOfResidence: profileForm.cityOfResidence.trim() || undefined,
        nationality: profileForm.nationality.trim() || undefined,
        occupation: profileForm.occupation,
        organization: profileForm.organization.trim() || undefined,
        aboutMe: profileForm.aboutMe.trim() || undefined,
        languages: profileForm.languages.map((lang) => lang.trim()).filter(Boolean),
      });
      setProfileStatus("Profile updated successfully.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to update profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleProfilePictureSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select a valid image file.");
      setProfileStatus(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Profile picture must be 5 MB or smaller.");
      setProfileStatus(null);
      return;
    }

    setProfileError(null);
    setProfileStatus(null);
    setIsUploadingPicture(true);

    try {
      await uploadProfilePicture(file);
      setProfileStatus("Profile picture updated successfully.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to upload profile picture.");
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactStatus(null);
    setContactError(null);

    if (!contactForm.email.trim() || !contactForm.phoneNumber.trim()) {
      setContactError("Email and mobile number are required.");
      return;
    }

    setIsSavingContact(true);
    try {
      await updateContactDetails({
        email: contactForm.email.trim(),
        phoneCountryCode: contactForm.phoneCountryCode,
        phoneNumber: contactForm.phoneNumber.trim(),
      });
      setContactStatus("Contact details updated successfully.");
    } catch (error) {
      setContactError(error instanceof Error ? error.message : "Failed to update contact details.");
    } finally {
      setIsSavingContact(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordStatus(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatus("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setProfileError(null);
    setProfileStatus(null);
    setIsDeletingAccount(true);

    try {
      await deleteAccount();
      navigate("/");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Failed to delete account.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F9]">
      <Header />

      <main className="flex-1 py-[40px]">
        <div className="max-w-[1200px] mx-auto px-[32px]">
          <div className="flex items-center justify-between mb-[32px]">
            <h1 className="text-[#1A1A1A] text-[32px] font-bold tracking-[-0.02em]">Account</h1>
            <button className="px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] bg-white text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
              VIEW PROFILE
            </button>
          </div>

          <div className="grid grid-cols-[240px_1fr] gap-[24px]">
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
              {user?.role === "landlord" ? (
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
              ) : null}
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

            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[32px]">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[32px]">Personal information</h2>

                  <form className="space-y-[24px]" onSubmit={handleProfileSubmit}>
                    <input
                      ref={profilePictureInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureSelect}
                    />
                    <div className="flex items-center gap-[16px] mb-[32px]">
                      <div className="w-[80px] h-[80px] bg-[#E0E0E0] rounded-full flex items-center justify-center overflow-hidden">
                        {user?.profilePictureUrl ? (
                          <img
                            src={user.profilePictureUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-[32px] h-[32px] text-[#6B6B6B]" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => profilePictureInputRef.current?.click()}
                        disabled={isUploadingPicture}
                        className="text-[#FF4B27] text-[13px] font-semibold hover:underline disabled:opacity-60"
                      >
                        {isUploadingPicture ? "Uploading..." : "Change profile picture"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                          First Name <span className="text-[#FF4B27]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.firstName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">
                          Last Name <span className="text-[#FF4B27]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.lastName}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                          className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">Date of birth</label>
                      <div className="grid grid-cols-3 gap-[12px]">
                        <select
                          value={profileForm.day}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, day: e.target.value }))}
                          className="px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        >
                          <option value="">Day</option>
                          {Array.from({ length: 31 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                        <select
                          value={profileForm.month}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, month: e.target.value }))}
                          className="px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        >
                          <option value="">Month</option>
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={String(i + 1)}>
                              {new Date(2000, i, 1).toLocaleString("en-US", { month: "long" })}
                            </option>
                          ))}
                        </select>
                        <select
                          value={profileForm.year}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, year: e.target.value }))}
                          className="px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        >
                          <option value="">Year</option>
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[12px]">Gender</label>
                      <div className="flex items-center gap-[24px]">
                        {(["male", "female", "other"] as Gender[]).map((option) => (
                          <label key={option} className="flex items-center gap-[8px] cursor-pointer">
                            <input
                              type="radio"
                              name="gender"
                              value={option}
                              checked={profileForm.gender === option}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  gender: e.target.value as Gender,
                                }))
                              }
                              className="w-[16px] h-[16px] accent-[#FF4B27]"
                            />
                            <span className="text-[#1A1A1A] text-[14px] capitalize">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">City of residence</label>
                        <input
                          type="text"
                          value={profileForm.cityOfResidence}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              cityOfResidence: e.target.value,
                            }))
                          }
                          className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">Nationality</label>
                        <input
                          type="text"
                          value={profileForm.nationality}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              nationality: e.target.value,
                            }))
                          }
                          className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[12px]">Occupation</label>
                      <div className="flex items-center gap-[24px] mb-[16px]">
                        {(["student", "working", "other"] as Occupation[]).map((option) => (
                          <label key={option} className="flex items-center gap-[8px] cursor-pointer">
                            <input
                              type="radio"
                              name="occupation"
                              value={option}
                              checked={profileForm.occupation === option}
                              onChange={(e) =>
                                setProfileForm((prev) => ({
                                  ...prev,
                                  occupation: e.target.value as Occupation,
                                }))
                              }
                              className="w-[16px] h-[16px] accent-[#FF4B27]"
                            />
                            <span className="text-[#1A1A1A] text-[14px]">
                              {option === "working" ? "Working professional" : option.charAt(0).toUpperCase() + option.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={profileForm.organization}
                        placeholder="School / University / Company"
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            organization: e.target.value,
                          }))
                        }
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">About me</label>
                      <textarea
                        rows={5}
                        value={profileForm.aboutMe}
                        onChange={(e) =>
                          setProfileForm((prev) => ({
                            ...prev,
                            aboutMe: e.target.value,
                          }))
                        }
                        placeholder="Tell us about yourself..."
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] placeholder:text-[#6B6B6B] focus:outline-none focus:border-[#FF4B27] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[12px]">Spoken Languages</label>
                      <div className="space-y-[12px] mb-[12px]">
                        {profileForm.languages.map((lang, index) => (
                          <div key={index} className="flex items-center gap-[12px]">
                            <select
                              value={lang}
                              onChange={(e) => updateLanguage(index, e.target.value)}
                              className="flex-1 px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                            >
                              <option value="">Select language</option>
                              {LANGUAGE_OPTIONS.map((language) => (
                                <option key={language} value={language}>
                                  {language.charAt(0).toUpperCase() + language.slice(1)}
                                </option>
                              ))}
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

                    {profileError ? <p className="text-[#C81E1E] text-[13px]">{profileError}</p> : null}
                    {profileStatus ? <p className="text-[#008A52] text-[13px]">{profileStatus}</p> : null}

                    <div className="pt-[24px] border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        disabled={isDeletingAccount}
                        className="text-[#FF4B27] text-[13px] font-semibold hover:underline disabled:opacity-60"
                      >
                        {isDeletingAccount ? "Deleting account..." : "Delete account"}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="px-[32px] py-[12px] bg-[#FF4B27] text-white text-[14px] font-bold hover:bg-[#E63E1C] transition-colors disabled:opacity-70"
                      >
                        {isSavingProfile ? "SAVING..." : "SAVE CHANGES"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {user?.role === "landlord" && activeTab === "documents" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[32px]">Supporting documents</h2>

                  <div className="space-y-[32px]">
                    <div className="pb-[32px] border-b border-[rgba(0,0,0,0.08)]">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">Rental agreements</h3>
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

                    <div className="pb-[32px] border-b border-[rgba(0,0,0,0.08)]">
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">Rules and requirements</h3>
                      <p className="text-[#6B6B6B] text-[14px] leading-[1.6] mb-[16px]">
                        Upload documents that inform your future tenants about the requirements for renting your properties.
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

                    <div>
                      <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">Other documents</h3>
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
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[32px]">Contact details</h2>

                  <form className="space-y-[24px]" onSubmit={handleContactSubmit}>
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">Email address</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                      <p className="text-[#6B6B6B] text-[12px] mt-[6px]">
                        Status: {user?.emailVerified ? "Verified" : "Not Verified"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">Mobile number</label>
                      <div className="flex items-center gap-[12px] mb-[8px]">
                        <select
                          value={contactForm.phoneCountryCode}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              phoneCountryCode: e.target.value,
                            }))
                          }
                          className="w-[120px] px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        >
                          {COUNTRY_CODES.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          value={contactForm.phoneNumber}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              phoneNumber: e.target.value,
                            }))
                          }
                          className="flex-1 px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                        />
                      </div>
                      <p className="text-[#6B6B6B] text-[12px]">
                        Status: {user?.phoneVerified ? "Verified" : "Not Verified"}
                      </p>
                    </div>

                    {contactError ? <p className="text-[#C81E1E] text-[13px]">{contactError}</p> : null}
                    {contactStatus ? <p className="text-[#008A52] text-[13px]">{contactStatus}</p> : null}

                    <button
                      type="submit"
                      disabled={isSavingContact}
                      className="px-[32px] py-[12px] bg-[#FF4B27] text-white text-[14px] font-bold hover:bg-[#E63E1C] transition-colors disabled:opacity-70"
                    >
                      {isSavingContact ? "SAVING..." : "SAVE CONTACT DETAILS"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">Change password</h2>
                  <form className="space-y-[24px]" onSubmit={handlePasswordSubmit}>
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">Current password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">New password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1A1A1A] text-[13px] font-semibold mb-[8px]">Confirm new password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-[12px] py-[10px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[14px] focus:outline-none focus:border-[#FF4B27]"
                      />
                    </div>

                    {passwordError ? <p className="text-[#C81E1E] text-[13px]">{passwordError}</p> : null}
                    {passwordStatus ? <p className="text-[#008A52] text-[13px]">{passwordStatus}</p> : null}

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="px-[32px] py-[12px] bg-[#FF4B27] text-white text-[14px] font-bold hover:bg-[#E63E1C] transition-colors disabled:opacity-70"
                    >
                      {isSavingPassword ? "UPDATING..." : "UPDATE PASSWORD"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[24px]">Notification settings</h2>
                  <div className="space-y-[20px]">
                    <div className="flex items-center justify-between py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                      <div>
                        <p className="text-[#1A1A1A] text-[14px] font-semibold mb-[4px]">Email notifications</p>
                        <p className="text-[#6B6B6B] text-[13px]">Receive updates about messages and bookings</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-[20px] h-[20px] accent-[#FF4B27]" />
                    </div>
                    <div className="flex items-center justify-between py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                      <div>
                        <p className="text-[#1A1A1A] text-[14px] font-semibold mb-[4px]">SMS notifications</p>
                        <p className="text-[#6B6B6B] text-[13px]">Get text messages for important updates</p>
                      </div>
                      <input type="checkbox" className="w-[20px] h-[20px] accent-[#FF4B27]" />
                    </div>
                    <div className="flex items-center justify-between py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                      <div>
                        <p className="text-[#1A1A1A] text-[14px] font-semibold mb-[4px]">Marketing emails</p>
                        <p className="text-[#6B6B6B] text-[13px]">Receive tips, promotions, and special offers</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-[20px] h-[20px] accent-[#FF4B27]" />
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
