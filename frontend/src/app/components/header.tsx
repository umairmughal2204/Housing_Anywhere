import { Link, useNavigate } from "react-router";
import { Globe, MessageCircle, Heart, User, CreditCard, HelpCircle, Settings, LogOut, TrendingUp, LayoutDashboard, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { UserAvatar } from "./user-avatar";
import { changeSiteLanguage, getSavedLanguageLabel, SUPPORTED_LANGUAGES } from "../utils/translate";
import { API_BASE } from "../config";
import { useLocation } from "react-router";

interface HeaderConversationItem {
  unread: number;
}

interface HeaderProps {
  variant?: "default" | "dashboard";
}

export function Header({ variant = "default" }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardVariant = variant === "dashboard";
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getSavedLanguageLabel());
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<{
    code: (typeof SUPPORTED_LANGUAGES)[number]["code"];
    label: string;
  } | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const confirmLanguageChange = () => {
    if (!pendingLanguage) {
      return;
    }

    setSelectedLanguage(pendingLanguage.label);
    changeSiteLanguage(pendingLanguage.code);
    setPendingLanguage(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessages(0);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setUnreadMessages(0);
      return;
    }

    let isCancelled = false;

    const loadUnreadMessages = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to load conversations");
        }

        const payload = (await response.json()) as { conversations: HeaderConversationItem[] };
        if (!isCancelled) {
          setUnreadMessages(payload.conversations.reduce((sum, conversation) => sum + conversation.unread, 0));
        }
      } catch {
        if (!isCancelled) {
          setUnreadMessages(0);
        }
      }
    };

    const interval = window.setInterval(() => {
      void loadUnreadMessages();
    }, 15000);

    const handleWindowFocus = () => {
      void loadUnreadMessages();
    };

    void loadUnreadMessages();
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [isAuthenticated]);

  const inboxHref = user?.role === "landlord" ? "/landlord/inbox" : "/tenant/inbox";
  const isOnLandlordDashboard = location.pathname.startsWith("/landlord/dashboard");

  return (
    <header className={isDashboardVariant ? "bg-white border-b border-[#E3E8EE] shadow-[0_1px_2px_rgba(15,23,42,0.04)] sticky top-0 z-50" : "sticky top-0 z-50 bg-white/96 backdrop-blur-md shadow-[0_10px_30px_rgba(2,22,33,0.08)] rounded-b-[30px] border-b border-[rgba(11,165,199,0.14)]"}>
      <div className={isDashboardVariant ? "max-w-[1440px] mx-auto px-[12px] sm:px-[20px] lg:px-[28px] py-[12px] sm:py-[16px] flex items-center justify-between" : "relative max-w-[1440px] mx-auto px-[16px] sm:px-[32px] py-[14px] sm:py-[18px] flex items-center justify-between"}>
        {!isDashboardVariant && (
          <div className="pointer-events-none absolute inset-x-[18px] bottom-[8px] h-[1px] bg-[linear-gradient(90deg,transparent,rgba(11,165,199,0.26),transparent)]" />
        )}
        {/* Logo */}
        <Link to="/" className="flex items-center gap-[8px]">
          <div className={isDashboardVariant ? "w-[32px] sm:w-[36px] h-[32px] sm:h-[36px] bg-brand-primary rounded-[8px] flex items-center justify-center" : "w-[32px] sm:w-[38px] h-[32px] sm:h-[38px] bg-brand-primary rounded-[14px] flex items-center justify-center shadow-[0_8px_18px_rgba(11,165,199,0.22)]"}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="sm:w-[20px] sm:h-[20px]">
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
          <span className="text-neutral-black text-[16px] sm:text-[18px] font-bold tracking-[-0.02em]">
            Easy<span className="text-brand-primary">Rent</span>
          </span>
        </Link>

        {/* Center Navigation - Only show when NOT logged in */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-[28px] rounded-full border border-[rgba(11,165,199,0.14)] bg-white px-[22px] py-[10px] shadow-[0_8px_20px_rgba(2,22,33,0.04)]">
            <Link
              to="/how-it-works"
              className="text-neutral-black text-[12px] sm:text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              How it works
            </Link>
            <Link
              to="/pricing"
              className="text-neutral-black text-[12px] sm:text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/help"
              className="text-neutral-black text-[12px] sm:text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              Help
            </Link>
          </nav>
        )}

        {/* Right Actions - Logged Out */}
        {!isAuthenticated && (
          <div className="hidden sm:flex items-center gap-[12px] sm:gap-[16px]">
            <Link 
              to="/login"
              className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              Log in
            </Link>
            <Link to="/signup" className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors">
              Sign up
            </Link>
            <Link to="/landlord" className="rounded-full px-[16px] py-[9px] border border-neutral-hover text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors">
              I'm a landlord
            </Link>
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="rounded-full p-[10px] hover:bg-neutral-light-gray transition-colors"
              >
                <Globe className="w-[20px] h-[20px] text-neutral-gray" />
              </button>

              {/* Language Dropdown Menu */}
              {showLanguageDropdown && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[180px] max-h-[260px] overflow-y-auto bg-white border border-neutral shadow-lg">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setPendingLanguage({ code: language.code, label: language.label });
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors ${
                        selectedLanguage === language.label ? "bg-neutral-light-gray" : ""
                      }`}
                    >
                      <span>{language.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Actions - Logged In */}
        {isAuthenticated && (
          <div className="flex items-center gap-[16px]">
            {/* Show appropriate landlord button based on status */}
            {user?.isLandlord ? (
              <Link 
                to={isOnLandlordDashboard ? "/landlord/add-listing" : "/landlord/dashboard"}
                className={isDashboardVariant ? "inline-flex items-center gap-[8px] rounded-[14px] border border-[#8C99A8] px-[16px] py-[11px] bg-white text-[#1F2937] text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F5F7FA] hover:border-[#7A8898] hover:text-[#1F2937] transition-colors" : "inline-flex items-center gap-[8px] rounded-full px-[14px] py-[8px] bg-brand-primary text-white text-[13px] font-semibold leading-[1] hover:bg-brand-primary-dark transition-colors"}
              >
                {isOnLandlordDashboard ? <FileText className="w-[16px] h-[16px]" /> : <LayoutDashboard className="w-[16px] h-[16px]" />}
                {isOnLandlordDashboard ? "Add Listing" : "Go to Dashboard"}
              </Link>
            ) : (
              <Link 
                to="/landlord" 
                className="px-[16px] py-[10px] border border-neutral-hover text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors"
              >
                I'm a landlord
              </Link>
            )}

            {/* Messages Icon with Badge */}
            <Link to={inboxHref} className="relative p-[10px] hover:bg-neutral-light-gray transition-colors">
              <MessageCircle className="w-[20px] h-[20px] text-neutral-gray" />
              {unreadMessages > 0 && (
                <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>

            {/* Favorites Icon */}
            <Link to="/favorites" className="p-[10px] hover:bg-neutral-light-gray transition-colors">
              <Heart className="w-[20px] h-[20px] text-neutral-gray" />
            </Link>

            {/* User Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-[44px] h-[44px] bg-neutral-gray rounded-full flex items-center justify-center text-white text-[16px] font-semibold hover:bg-neutral-black transition-colors"
              >
                <UserAvatar
                  name={user?.name}
                  profilePictureUrl={user?.profilePictureUrl}
                  sizeClassName="w-full h-full"
                  textClassName="text-white text-[16px] font-semibold bg-neutral-gray"
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-[calc(100%+10px)] right-0 w-[280px] max-w-[calc(100vw-16px)] max-h-[80vh] overflow-y-auto bg-white border border-neutral shadow-lg">
                  {/* User Info */}
                  <div className="p-[16px] border-b border-neutral">
                    <div className="flex items-center gap-[12px]">
                      <UserAvatar
                        name={user?.name}
                        profilePictureUrl={user?.profilePictureUrl}
                        sizeClassName="w-[48px] h-[48px]"
                        textClassName="text-white text-[20px] font-semibold bg-neutral-gray"
                      />
                      <div>
                        <div className="text-neutral-black text-[14px] font-bold">{user?.name}</div>
                        <div className="text-neutral-gray text-[12px]">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-[8px]">
                    {user?.isLandlord && (
                      <Link
                        to="/landlord/dashboard"
                        className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LayoutDashboard className="w-[16px] h-[16px] text-neutral-gray" />
                        Landlord Dashboard
                      </Link>
                    )}
                    <Link
                      to={inboxHref}
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <MessageCircle className="w-[16px] h-[16px] text-neutral-gray" />
                      Messages
                    </Link>
                    {!user?.isLandlord && (
                      <Link
                        to="/tenant/applications"
                        className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FileText className="w-[16px] h-[16px] text-neutral-gray" />
                        My Applications
                      </Link>
                    )}
                    <Link
                      to="/favorites"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Heart className="w-[16px] h-[16px] text-neutral-gray" />
                      Favorites
                    </Link>
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full flex items-center gap-[12px] px-[16px] py-[12px] text-[14px] text-neutral-gray cursor-not-allowed"
                    >
                      <CreditCard className="w-[16px] h-[16px] text-neutral-gray" />
                      Payments
                    </button>
                    <Link
                      to="/account"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings className="w-[16px] h-[16px] text-neutral-gray" />
                      Account
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral"></div>

                  <div className="py-[8px]">
                    <Link
                      to={user?.role ? `/how-it-works?audience=${user.role}` : "/how-it-works"}
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <TrendingUp className="w-[16px] h-[16px] text-neutral-gray" />
                      How it works
                    </Link>
                    {user?.isLandlord ? (
                      <Link
                        to="/pricing"
                        className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <CreditCard className="w-[16px] h-[16px] text-neutral-gray" />
                        Pricing
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="w-full flex items-center gap-[12px] px-[16px] py-[12px] text-[14px] text-neutral-gray cursor-not-allowed"
                      >
                        <CreditCard className="w-[16px] h-[16px] text-neutral-gray" />
                        Pricing
                      </button>
                    )}
                    <Link
                      to="/help"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HelpCircle className="w-[16px] h-[16px] text-neutral-gray" />
                      Help
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral"></div>

                  {/* Log Out */}
                  <div className="py-[8px]">
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                    >
                      <LogOut className="w-[16px] h-[16px] text-neutral-gray" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Icon with Dropdown */}
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="p-[10px] hover:bg-neutral-light-gray transition-colors"
              >
                <Globe className="w-[20px] h-[20px] text-neutral-gray" />
              </button>

              {/* Language Dropdown Menu */}
              {showLanguageDropdown && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[180px] max-h-[260px] overflow-y-auto bg-white border border-neutral shadow-lg">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setPendingLanguage({ code: language.code, label: language.label });
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors ${
                        selectedLanguage === language.label ? "bg-neutral-light-gray" : ""
                      }`}
                    >
                      <span>{language.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {pendingLanguage && (
        <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-[24px]">
          <div className="w-full max-w-[460px] bg-white border border-[rgba(0,0,0,0.12)] p-[24px]">
            <h3 className="text-neutral-black text-[20px] font-bold mb-[8px]">Change Language</h3>
            <p className="text-neutral-gray text-[14px] leading-[1.6] mb-[20px]">
              Switch site language to <span className="font-semibold text-neutral-black">{pendingLanguage.label}</span>?
            </p>
            <div className="flex items-center justify-end gap-[10px]">
              <button
                onClick={() => setPendingLanguage(null)}
                className="px-[16px] py-[10px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[13px] font-semibold hover:bg-neutral-light-gray transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLanguageChange}
                className="px-[16px] py-[10px] bg-brand-primary text-white text-[13px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}