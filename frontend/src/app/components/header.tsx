import { Link, useNavigate } from "react-router";
import { Globe, MessageCircle, Heart, CreditCard, HelpCircle, Settings, LogOut, TrendingUp, LayoutDashboard, FileText, Menu, X, House, BadgeDollarSign, Headset, ChevronDown, LogIn, UserRoundPlus, Bell, KeyRound, Star, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/auth-context";
import { UserAvatar } from "./user-avatar";
import { changeSiteLanguage, getSavedLanguageLabel, SUPPORTED_LANGUAGES } from "../utils/translate";
import { API_BASE } from "../config";
import { useLocation } from "react-router";
import { BrandLogo } from "./brand-logo";
import faviconLogo from "../../assets/favicon.png";

interface HeaderConversationItem {
  unread: number;
}

interface HeaderProps {
  variant?: "default" | "dashboard";
  logoVariant?: "brand" | "favicon" | "mobile-favicon";
  forceSearchBar?: boolean;
  searchPlaceholder?: string;
}

export function Header({ variant = "default", logoVariant = "brand", forceSearchBar = false, searchPlaceholder = "Search" }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardVariant = variant === "dashboard";
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileLanguageOptions, setShowMobileLanguageOptions] = useState(false);
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

  useEffect(() => {
    setShowMobileMenu(false);
    setShowMobileLanguageOptions(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!showMobileMenu) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileMenu]);

  const inboxHref = user?.role === "landlord" ? "/landlord/inbox" : "/tenant/inbox";
  const isOnLandlordDashboard = location.pathname.startsWith("/landlord/dashboard");
  const isHowItWorksPage = location.pathname.startsWith("/how-it-works");
  const isSearchHeaderVariant = isDashboardVariant && (forceSearchBar || location.pathname.startsWith("/listings"));
  const searchPlaceholderText = searchPlaceholder.trim().length > 0 ? searchPlaceholder : "Search";
  const useDashboardSizedButton = isDashboardVariant || isHowItWorksPage;
  const useFilledDashboardButton = isHowItWorksPage && !isDashboardVariant;
  const showMobileFaviconLogo = logoVariant === "favicon" || logoVariant === "mobile-favicon";
  const showDesktopBrandLogo = logoVariant !== "favicon";
  const isPathActive = (paths: string[]) =>
    paths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const mobileItemBaseClass = "flex items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-[16px] font-medium transition-colors";
  const mobileItemClass = (active: boolean) =>
    `${mobileItemBaseClass} ${active ? "bg-[#DCE4EC] text-[#11354B]" : "text-[#11354B] hover:bg-[#F3F6F9]"}`;
  const mobileBottomNavItems = [
    {
      label: "Dashboard",
      href: user?.isLandlord ? "/landlord/dashboard" : "/",
      icon: LayoutDashboard,
      active: isPathActive(["/landlord/dashboard"]),
    },
    {
      label: "Messages",
      href: inboxHref,
      icon: MessageCircle,
      active: isPathActive(["/landlord/inbox", "/tenant/inbox"]),
    },
    {
      label: "Listings",
      href: user?.isLandlord ? "/landlord/listings" : "/listings",
      icon: House,
      active: isPathActive(["/landlord/listings", "/listings", "/property"]),
    },
    {
      label: "Rentals",
      href: user?.isLandlord ? "/landlord/rentals" : "/tenant/applications",
      icon: KeyRound,
      active: isPathActive(["/landlord/rentals", "/tenant/applications"]),
    },
  ];
  const getInitialSearchValue = () => {
    const cityMatch = location.pathname.match(/^\/listings\/([^/]+)/i);
    if (cityMatch?.[1]) {
      return decodeURIComponent(cityMatch[1]).replace(/-/g, " ");
    }

    return "";
  };
  const [headerSearchValue, setHeaderSearchValue] = useState(getInitialSearchValue());

  useEffect(() => {
    setHeaderSearchValue(getInitialSearchValue());
  }, [location.pathname]);

  const handleHeaderSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextValue = headerSearchValue.trim();
    if (!nextValue) {
      return;
    }

    const normalizedCity = nextValue.toLowerCase().replace(/\s+/g, "-");
    navigate(`/listings/${normalizedCity}`);
  };

  return (
    <header className={isDashboardVariant ? "bg-white border-b border-[#E3E8EE] shadow-[0_1px_2px_rgba(15,23,42,0.04)] sticky top-0 z-[80]" : "sticky top-0 z-[80] bg-white/96 backdrop-blur-md shadow-[0_10px_30px_rgba(2,22,33,0.08)] rounded-b-[30px] border-b border-[rgba(11,165,199,0.14)]"}>
      <div className={isDashboardVariant ? "max-w-[1440px] mx-auto px-[10px] sm:px-[20px] lg:px-[28px] py-[12px] sm:py-[16px] flex items-center justify-between gap-[10px] sm:gap-[20px]" : "relative max-w-[1440px] mx-auto px-[16px] sm:px-[32px] py-[14px] sm:py-[18px] flex items-center justify-between"}>
        {!isDashboardVariant && (
          <div className="pointer-events-none absolute inset-x-[18px] bottom-[8px] h-[1px] bg-[linear-gradient(90deg,transparent,rgba(11,165,199,0.26),transparent)]" />
        )}
        {/* Logo */}
        <Link to="/" className={`flex items-center gap-[8px] ${isDashboardVariant ? "pl-[2px] sm:pl-0" : "pl-[6px] sm:pl-[28px]"}`}>
          {showMobileFaviconLogo ? (
            <img
              src={faviconLogo}
              alt="ReserveHousing"
              className={`${showDesktopBrandLogo ? "md:hidden" : ""} h-[34px] w-[34px] object-contain`}
            />
          ) : (
            <BrandLogo className={isDashboardVariant ? "h-[48px] sm:h-[62px] lg:h-[72px]" : isAuthenticated ? "h-[56px] sm:h-[72px] lg:h-[90px]" : "h-[48px] sm:h-[62px] lg:h-[72px]"} />
          )}
          {showMobileFaviconLogo && showDesktopBrandLogo && (
            <BrandLogo className="hidden md:block h-[48px] sm:h-[62px] lg:h-[72px]" />
          )}
        </Link>

        {isAuthenticated ? (
          <div className={`md:hidden flex items-center ${isSearchHeaderVariant ? "gap-[8px]" : "gap-[10px]"}`}>
            {isSearchHeaderVariant && (
              <form onSubmit={handleHeaderSearchSubmit} className="min-w-0 flex-1">
                <label className="flex h-[40px] w-full items-center gap-[10px] rounded-[14px] border border-[#AFC1D3] bg-white px-[10px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <Search className="h-[18px] w-[18px] flex-shrink-0 text-[#0F2D36]" />
                  <input
                    type="text"
                    value={headerSearchValue}
                    onChange={(event) => setHeaderSearchValue(event.target.value)}
                    placeholder={searchPlaceholderText}
                    aria-label="Search city"
                    className="min-w-0 w-full bg-transparent text-[14px] font-medium text-[#0F2D36] placeholder:text-[#0F2D36] outline-none"
                  />
                </label>
              </form>
            )}
            <Link
              to={inboxHref}
              className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-[#11354B] hover:bg-[#EEF2F7]"
              aria-label="Open messages"
            >
              <Bell className="h-[22px] w-[22px]" />
              {unreadMessages > 0 && (
                <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full ring-2 ring-[#9CB2C7]"
              aria-label="Open account menu"
            >
              <UserAvatar
                name={user?.name}
                profilePictureUrl={user?.profilePictureUrl}
                sizeClassName="w-full h-full rounded-full"
                textClassName="text-white text-[18px] font-semibold bg-[#334E60]"
              />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMobileMenu(true)}
            className="md:hidden inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-[#6C95C4] bg-[#EDF3FA] text-[#143B53] shadow-[0_3px_10px_rgba(20,59,83,0.16)]"
            aria-label="Open menu"
          >
            <Menu className="h-[24px] w-[24px]" />
          </button>
        )}

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
          <div className="hidden md:flex items-center gap-[12px] sm:gap-[16px]">
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
          <div className="hidden md:flex items-center gap-[16px]">
            {isSearchHeaderVariant && (
              <form onSubmit={handleHeaderSearchSubmit} className="min-w-0 w-[320px] lg:w-[380px] xl:w-[440px] mr-[4px] lg:mr-[8px]">
                <label className="flex h-[62px] items-center gap-[14px] rounded-[18px] border border-[#AFC1D3] bg-white px-[14px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <Search className="h-[20px] w-[20px] flex-shrink-0 text-[#0F2D36]" />
                  <input
                    type="text"
                    value={headerSearchValue}
                    onChange={(event) => setHeaderSearchValue(event.target.value)}
                    placeholder={searchPlaceholderText}
                    aria-label="Search city"
                    className="min-w-0 w-full bg-transparent text-[20px] font-medium text-[#0F2D36] placeholder:text-[#0F2D36] outline-none"
                  />
                </label>
              </form>
            )}
            {/* Show appropriate landlord button based on status */}
            {user?.isLandlord ? (
              <Link 
                to={isOnLandlordDashboard ? "/landlord/add-listing" : "/landlord/dashboard"}
                className={useDashboardSizedButton
                  ? useFilledDashboardButton
                    ? "inline-flex items-center gap-[8px] rounded-[14px] px-[16px] py-[11px] bg-brand-primary text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-brand-primary-dark transition-colors"
                    : "inline-flex items-center gap-[8px] rounded-[14px] border border-[#8C99A8] px-[16px] py-[11px] bg-white text-[#1F2937] text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F5F7FA] hover:border-[#7A8898] hover:text-[#1F2937] transition-colors"
                  : "inline-flex items-center gap-[8px] rounded-full px-[18px] py-[10px] bg-brand-primary text-white text-[14px] font-semibold leading-[1] hover:bg-brand-primary-dark transition-colors"}
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

      {showMobileMenu && typeof document !== "undefined" && createPortal(
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setShowMobileMenu(false)}
            className="fixed inset-0 z-[110] bg-[rgba(16,26,34,0.58)] backdrop-blur-[1px] md:hidden"
          />

          <aside className="fixed right-0 top-0 z-[111] h-full w-[84vw] max-w-[360px] bg-white shadow-[-12px_0_36px_rgba(0,0,0,0.22)] md:hidden">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] px-[20px] py-[16px]">
              <Link to="/" onClick={() => setShowMobileMenu(false)} className="flex items-center">
                <BrandLogo className="h-[44px]" />
              </Link>
              <button
                type="button"
                onClick={() => setShowMobileMenu(false)}
                className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#143B53] hover:bg-[#EFF3F7]"
                aria-label="Close menu"
              >
                <X className="h-[24px] w-[24px]" />
              </button>
            </div>

            <div className="h-[calc(100%-76px)] overflow-y-auto px-[14px] py-[16px]">
              {isAuthenticated && (
                <>
                  <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] p-[12px]">
                    <div className="flex items-center gap-[12px]">
                      <UserAvatar
                        name={user?.name}
                        profilePictureUrl={user?.profilePictureUrl}
                        sizeClassName="h-[64px] w-[64px] rounded-full"
                        textClassName="text-white text-[24px] font-semibold bg-[#334E60]"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[20px] font-bold text-[#102E43]">{user?.name ?? "Account"}</p>
                        <p className="truncate text-[14px] text-[#26485D]">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to={user?.isLandlord ? "/landlord/add-listing" : "/landlord"}
                      onClick={() => setShowMobileMenu(false)}
                      className="mt-[12px] flex items-center justify-center rounded-[12px] border border-[#A1B4C7] px-[12px] py-[11px] text-[16px] font-semibold text-[#11354B]"
                    >
                      {user?.isLandlord ? "Add listing" : "Become landlord"}
                    </Link>
                  </div>

                  <nav className="mt-[10px]">
                    <Link
                      to={user?.isLandlord ? "/landlord/dashboard" : "/"}
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/landlord/dashboard"]))}
                    >
                      <LayoutDashboard className="h-[20px] w-[20px]" />
                      Dashboard
                    </Link>
                    <Link
                      to={inboxHref}
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/landlord/inbox", "/tenant/inbox"]))}
                    >
                      <MessageCircle className="h-[20px] w-[20px]" />
                      Messages
                    </Link>
                    <Link
                      to={user?.isLandlord ? "/landlord/listings" : "/listings"}
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/landlord/listings", "/listings", "/property"]))}
                    >
                      <House className="h-[20px] w-[20px]" />
                      Listings
                    </Link>
                    <Link
                      to={user?.isLandlord ? "/landlord/rentals" : "/tenant/applications"}
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/landlord/rentals", "/tenant/applications"]))}
                    >
                      <KeyRound className="h-[20px] w-[20px]" />
                      Rentals
                    </Link>
                    <Link
                      to="/payments"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/payments"]))}
                    >
                      <CreditCard className="h-[20px] w-[20px]" />
                      <span className="flex-1">Payments</span>
                      <ChevronDown className="h-[18px] w-[18px]" />
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(false)}
                    >
                      <Star className="h-[20px] w-[20px]" />
                      Reviews
                    </Link>
                    <Link
                      to="/account"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/account"]))}
                    >
                      <Settings className="h-[20px] w-[20px]" />
                      Account
                    </Link>
                  </nav>

                  <div className="my-[10px] border-t border-[rgba(0,0,0,0.08)]" />

                  <nav>
                    <Link
                      to="/how-it-works"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/how-it-works"]))}
                    >
                      <House className="h-[20px] w-[20px]" />
                      How it works
                    </Link>
                    <Link
                      to="/pricing"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/pricing"]))}
                    >
                      <BadgeDollarSign className="h-[20px] w-[20px]" />
                      Pricing
                    </Link>
                    <Link
                      to="/landlord"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(false)}
                    >
                      <FileText className="h-[20px] w-[20px]" />
                      Collect rent online
                    </Link>
                    <Link
                      to="/landlord"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(false)}
                    >
                      <FileText className="h-[20px] w-[20px]" />
                      Blog for landlords
                    </Link>
                    <Link
                      to="/landlord"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(false)}
                    >
                      <FileText className="h-[20px] w-[20px]" />
                      How-to guides
                    </Link>
                  </nav>

                  <div className="my-[10px] border-t border-[rgba(0,0,0,0.08)]" />

                  <nav>
                    <Link
                      to="/help"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(isPathActive(["/help"]))}
                    >
                      <HelpCircle className="h-[20px] w-[20px]" />
                      Help
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(false)}
                    >
                      <MessageCircle className="h-[20px] w-[20px]" />
                      Live chat support
                    </Link>
                    <Link
                      to="/help"
                      onClick={() => setShowMobileMenu(false)}
                      className={mobileItemClass(false)}
                    >
                      <Headset className="h-[20px] w-[20px]" />
                      Contact us
                    </Link>
                  </nav>

                  <div className="my-[10px] border-t border-[rgba(0,0,0,0.08)]" />

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setShowMobileMenu(false);
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-left text-[16px] font-medium text-[#11354B] transition-colors hover:bg-[#F3F6F9]"
                  >
                    <LogOut className="h-[20px] w-[20px]" />
                    Log out
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="mb-[22px] grid grid-cols-2 gap-[12px]">
                  <Link
                    to="/signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="inline-flex items-center justify-center gap-[8px] rounded-[14px] border border-[#A1B4C7] px-[10px] py-[12px] text-[16px] font-semibold text-[#143B53]"
                  >
                    <UserRoundPlus className="h-[18px] w-[18px]" />
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="inline-flex items-center justify-center gap-[8px] rounded-[14px] border border-[#A1B4C7] px-[10px] py-[12px] text-[16px] font-semibold text-[#143B53]"
                  >
                    <LogIn className="h-[18px] w-[18px]" />
                    Log in
                  </Link>
                </div>
              )}

              {!isAuthenticated && (
                <nav className="space-y-[4px]">
                  <Link
                    to="/how-it-works"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-[12px] rounded-[12px] px-[8px] py-[10px] text-[16px] text-[#173E53]"
                  >
                    <House className="h-[20px] w-[20px]" />
                    How it works
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-[12px] rounded-[12px] px-[8px] py-[10px] text-[16px] text-[#173E53]"
                  >
                    <BadgeDollarSign className="h-[20px] w-[20px]" />
                    Pricing
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-[12px] rounded-[12px] px-[8px] py-[10px] text-[16px] text-[#173E53]"
                  >
                    <HelpCircle className="h-[20px] w-[20px]" />
                    Help
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-[12px] rounded-[12px] px-[8px] py-[10px] text-[16px] text-[#173E53]"
                  >
                    <MessageCircle className="h-[20px] w-[20px]" />
                    Live chat support
                  </Link>
                  <Link
                    to="/help"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-[12px] rounded-[12px] px-[8px] py-[10px] text-[16px] text-[#173E53]"
                  >
                    <Headset className="h-[20px] w-[20px]" />
                    Contact us
                  </Link>
                </nav>
              )}

              <div className="mt-[18px] border-t border-[rgba(0,0,0,0.08)] pt-[18px]">
                <button
                  type="button"
                  onClick={() => setShowMobileLanguageOptions((prev) => !prev)}
                  className="flex w-full items-center justify-between rounded-[14px] border border-[#A1B4C7] px-[14px] py-[12px] text-[#173E53]"
                >
                  <span className="inline-flex items-center gap-[10px] text-[16px]">
                    <Globe className="h-[18px] w-[18px]" />
                    {selectedLanguage}
                  </span>
                  <ChevronDown className={`h-[18px] w-[18px] transition-transform ${showMobileLanguageOptions ? "rotate-180" : ""}`} />
                </button>

                {showMobileLanguageOptions && (
                  <div className="mt-[8px] overflow-hidden rounded-[12px] border border-[rgba(0,0,0,0.1)]">
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <button
                        key={language.code}
                        type="button"
                        onClick={() => {
                          setPendingLanguage({ code: language.code, label: language.label });
                          setShowMobileLanguageOptions(false);
                        }}
                        className={`flex w-full items-center justify-between px-[14px] py-[11px] text-left text-[13px] text-[#173E53] hover:bg-[#F5F8FB] ${
                          selectedLanguage === language.label ? "bg-[#F5F8FB]" : "bg-white"
                        }`}
                      >
                        {language.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>,
        document.body
      )}

      {isAuthenticated && typeof document !== "undefined" && createPortal(
        <nav className="fixed bottom-0 left-0 right-0 z-[79] border-t border-[rgba(0,0,0,0.1)] bg-white md:hidden" aria-label="Mobile quick navigation">
          <div className="grid grid-cols-4 px-[6px] pt-[8px] pb-[max(10px,env(safe-area-inset-bottom))]">
            {mobileBottomNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-[6px] rounded-[8px] px-[4px] py-[6px] text-center transition-colors ${
                    item.active ? "text-[#11354B] bg-[#ECF2F7]" : "text-[#3A5568]"
                  }`}
                >
                  <Icon className="h-[20px] w-[20px]" />
                  <span className="text-[11px] font-medium leading-[1.1]">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>,
        document.body
      )}

      {pendingLanguage && (
        <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-[24px]">
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