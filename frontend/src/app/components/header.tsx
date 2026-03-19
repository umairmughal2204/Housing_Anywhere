import { Link } from "react-router";
import { Globe, MessageCircle, Heart, User, CreditCard, HelpCircle, Settings, LogOut, TrendingUp, LayoutDashboard, FileText } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/auth-context";
import { changeSiteLanguage, getSavedLanguageLabel, SUPPORTED_LANGUAGES } from "../utils/translate";
import { API_BASE } from "../config";

interface HeaderConversationItem {
  unread: number;
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
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

  // Get user initials
  const getUserInitials = () => {
    if (!user) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
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

  return (
    <header className="border-b border-neutral bg-white sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-[32px] py-[16px] flex items-center justify-between">
        {/* Logo */}
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

        {/* Center Navigation - Only show when NOT logged in */}
        {!isAuthenticated && (
          <nav className="flex items-center gap-[32px]">
            <Link
              to="/how-it-works"
              className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              How it works
            </Link>
            <Link
              to="/pricing"
              className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/help"
              className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              Help
            </Link>
          </nav>
        )}

        {/* Right Actions - Logged Out */}
        {!isAuthenticated && (
          <div className="flex items-center gap-[24px]">
            <Link 
              to="/login"
              className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors"
            >
              Log in
            </Link>
            <Link to="/signup" className="text-neutral-black text-[14px] font-medium hover:text-brand-primary transition-colors">
              Sign up
            </Link>
            <Link to="/landlord" className="px-[16px] py-[8px] border border-neutral-hover text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors">
              I'm a landlord
            </Link>
            <div className="relative" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="p-[8px] hover:bg-neutral-light-gray transition-colors"
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
                to="/landlord/dashboard" 
                className="flex items-center gap-[8px] px-[16px] py-[8px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                <LayoutDashboard className="w-[16px] h-[16px]" />
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                to="/landlord" 
                className="px-[16px] py-[8px] border border-neutral-hover text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors"
              >
                I'm a landlord
              </Link>
            )}

            {/* Messages Icon with Badge */}
            <Link to={inboxHref} className="relative p-[8px] hover:bg-neutral-light-gray transition-colors">
              <MessageCircle className="w-[20px] h-[20px] text-neutral-gray" />
              {unreadMessages > 0 && (
                <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>

            {/* Favorites Icon */}
            <Link to="/favorites" className="p-[8px] hover:bg-neutral-light-gray transition-colors">
              <Heart className="w-[20px] h-[20px] text-neutral-gray" />
            </Link>

            {/* User Avatar with Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-[40px] h-[40px] bg-neutral-gray rounded-full flex items-center justify-center text-white text-[16px] font-semibold hover:bg-neutral-black transition-colors"
              >
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getUserInitials()
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-white border border-neutral shadow-lg">
                  {/* User Info */}
                  <div className="p-[16px] border-b border-neutral">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[48px] h-[48px] bg-neutral-gray rounded-full flex items-center justify-center text-white text-[20px] font-semibold">
                        {user?.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getUserInitials()
                        )}
                      </div>
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
                    <Link
                      to="/payments"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <CreditCard className="w-[16px] h-[16px] text-neutral-gray" />
                      Payments
                    </Link>
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
                      to="/how-it-works"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <TrendingUp className="w-[16px] h-[16px] text-neutral-gray" />
                      How it works
                    </Link>
                    <Link
                      to="/pricing"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <CreditCard className="w-[16px] h-[16px] text-neutral-gray" />
                      Pricing
                    </Link>
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
                className="p-[8px] hover:bg-neutral-light-gray transition-colors"
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