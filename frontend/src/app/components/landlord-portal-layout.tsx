import { Link, useLocation, useNavigate } from "react-router";
import { createPortal } from "react-dom";
import { 
  LayoutDashboard, 
  Home, 
  ClipboardList,
  FileText,
  MessageSquare, 
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../config";
import { changeSiteLanguage, getSavedLanguageLabel, SUPPORTED_LANGUAGES } from "../utils/translate";
import { UserAvatar } from "./user-avatar";
import { BrandLogo } from "./brand-logo";
import { Footer } from "./footer";

interface LandlordPortalLayoutProps {
  children: React.ReactNode;
  headerLeadingAction?: React.ReactNode;
  hideSidebar?: boolean;
  hideFooter?: boolean;
}

export function LandlordPortalLayout({
  children,
  headerLeadingAction,
  hideSidebar = false,
  hideFooter = false,
}: LandlordPortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileLanguageOptions, setShowMobileLanguageOptions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getSavedLanguageLabel());
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<{
    code: (typeof SUPPORTED_LANGUAGES)[number]["code"];
    label: string;
  } | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [hasLoadedSummary, setHasLoadedSummary] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: "Dashboard", href: "/landlord/dashboard", icon: LayoutDashboard },
    { name: "Listings", href: "/landlord/listings", icon: Home },
    { name: "Rentals", href: "/landlord/rentals", icon: ClipboardList },
    { name: "Messages", href: "/landlord/inbox", icon: MessageSquare },
  ];

  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUnreadMessages(0);
      setPendingApplications(0);
      setTotalProperties(0);
      setHasLoadedSummary(false);
      return;
    }

    let isCancelled = false;

    const loadSummary = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/landlord/dashboard`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (!isCancelled) {
            setUnreadMessages(0);
            setPendingApplications(0);
            setTotalProperties(0);
            setHasLoadedSummary(true);
          }
          return;
        }

        const payload = (await response.json()) as {
          stats?: {
            totalProperties?: number;
            pendingApplications?: number;
            unreadMessages?: number;
          };
        };

        if (!isCancelled) {
          setUnreadMessages(payload.stats?.unreadMessages ?? 0);
          setPendingApplications(payload.stats?.pendingApplications ?? 0);
          setTotalProperties(payload.stats?.totalProperties ?? 0);
          setHasLoadedSummary(true);
        }
      } catch {
        if (!isCancelled) {
          setUnreadMessages(0);
          setPendingApplications(0);
          setTotalProperties(0);
          setHasLoadedSummary(true);
        }
      }
    };

    const interval = window.setInterval(() => {
      void loadSummary();
    }, 15000);

    const handleWindowFocus = () => {
      void loadSummary();
    };

    void loadSummary();
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(target)) {
        setShowNotifications(false);
      }

      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }

      if (showLanguageDropdown && languageDropdownRef.current && !languageDropdownRef.current.contains(target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguageDropdown, showNotifications, showUserMenu]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowMobileLanguageOptions(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const confirmLanguageChange = () => {
    if (!pendingLanguage) {
      return;
    }

    setSelectedLanguage(pendingLanguage.label);
    changeSiteLanguage(pendingLanguage.code);
    setPendingLanguage(null);
  };

  const notificationCount = unreadMessages + pendingApplications;
  const propertyCountLabel = hasLoadedSummary
    ? totalProperties
    : (user?.landlordProfile?.numberOfProperties ?? 0);
  const mobileBottomNavItems = [
    { label: "Dashboard", href: "/landlord/dashboard", icon: LayoutDashboard },
    { label: "Messages", href: "/landlord/inbox", icon: MessageSquare },
    { label: "Listings", href: "/landlord/listings", icon: Home },
    { label: "Rentals", href: "/landlord/rentals", icon: ClipboardList },
  ];
  const defaultHeaderAction = (
    <Link
      to="/landlord/listings/add"
      className="hidden md:inline-flex items-center gap-[8px] rounded-[20px] border border-[#8C99A8] px-[24px] py-[12px] bg-white text-[#1F2937] text-[16px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F5F7FA] hover:border-[#7A8898] transition-colors"
    >
      <FileText className="w-[18px] h-[18px]" />
      Add Listing
    </Link>
  );

  return (
    <div className="min-h-screen bg-neutral-light-gray">
      {/* Top Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-50">
        <div className="px-[32px] py-[16px] flex items-center justify-between">
          {/* Left: Logo & Portal Title */}
          <div className="flex items-center gap-[24px]">
            <Link to="/" className="flex items-center gap-[8px]">
              <BrandLogo className="h-[68px] sm:h-[80px]" />
            </Link>
            
            <div className="hidden md:block h-[24px] w-[1px] bg-[rgba(0,0,0,0.08)]"></div>
            
            <div className="hidden md:block">
              <div className="text-neutral-black text-[14px] font-bold">Landlord Portal</div>
              {user?.landlordProfile && (
                <div className="text-neutral-gray text-[12px]">
                  {propertyCountLabel} {propertyCountLabel === 1 ? "Property" : "Properties"}
                </div>
              )}
            </div>

          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-[16px]">
            {headerLeadingAction ?? defaultHeaderAction}

            {/* Language */}
            <div className="relative hidden md:block" ref={languageDropdownRef}>
              <button
                onClick={() => setShowLanguageDropdown((prev) => !prev)}
                className="p-[8px] hover:bg-neutral-light-gray transition-colors"
                aria-label="Change language"
              >
                <Globe className="w-[20px] h-[20px] text-neutral-gray" />
              </button>

              {showLanguageDropdown && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[180px] max-h-[260px] overflow-y-auto bg-white border border-[rgba(0,0,0,0.08)] shadow-lg">
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

            {/* Notifications */}
            <div className="relative hidden md:block" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className="relative p-[8px] hover:bg-neutral-light-gray transition-colors"
              >
                <Bell className="w-[20px] h-[20px] text-neutral-gray" />
                {notificationCount > 0 && (
                  <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[320px] bg-white border border-[rgba(0,0,0,0.08)] shadow-lg">
                  <div className="px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                    <div className="text-neutral-black text-[14px] font-bold">Notifications</div>
                    <div className="text-neutral-gray text-[12px]">Messages and applications</div>
                  </div>

                  <div className="py-[8px]">
                    <Link
                      to="/landlord/inbox"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-neutral-light-gray transition-colors"
                    >
                      <div className="w-[32px] h-[32px] bg-brand-light flex items-center justify-center">
                        <MessageSquare className="w-[16px] h-[16px] text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-black text-[14px] font-semibold">Unread messages</div>
                        <div className="text-neutral-gray text-[12px] truncate">Go to your inbox</div>
                      </div>
                      <div className="text-[12px] font-bold text-neutral-black">
                        {unreadMessages}
                      </div>
                    </Link>

                    <Link
                      to="/landlord/rentals"
                      onClick={() => setShowNotifications(false)}
                      className="flex items-center gap-[12px] px-[16px] py-[12px] hover:bg-neutral-light-gray transition-colors"
                    >
                      <div className="w-[32px] h-[32px] bg-brand-light flex items-center justify-center">
                        <FileText className="w-[16px] h-[16px] text-brand-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-neutral-black text-[14px] font-semibold">Pending applications</div>
                        <div className="text-neutral-gray text-[12px] truncate">Review rental requests</div>
                      </div>
                      <div className="text-[12px] font-bold text-neutral-black">
                        {pendingApplications}
                      </div>
                    </Link>

                    {notificationCount === 0 && (
                      <div className="px-[16px] py-[12px] text-neutral-gray text-[12px]">
                        You're all caught up.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-[12px] p-[8px] hover:bg-neutral-light-gray transition-colors"
              >
                <UserAvatar
                  name={user?.name}
                  profilePictureUrl={user?.profilePictureUrl}
                  sizeClassName="w-[32px] h-[32px]"
                  textClassName="text-white text-[14px] font-bold bg-brand-primary"
                />
                {user && (
                  <div className="hidden md:block text-left">
                    <div className="text-neutral-black text-[14px] font-bold">{user?.name}</div>
                    <div className="text-neutral-gray text-[12px]">
                      {user?.landlordProfile?.businessType === "individual" ? "Property Owner" : 
                       user?.landlordProfile?.businessType === "dealer" ? "Dealer" : ""}
                    </div>
                  </div>
                )}
                <ChevronDown className="hidden md:block w-[16px] h-[16px] text-neutral-gray" />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[240px] bg-white border border-[rgba(0,0,0,0.08)] shadow-lg">
                  <div className="py-[8px]">
                    <Link
                      to="/account"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-[16px] h-[16px] text-neutral-gray" />
                      Account Settings
                    </Link>
                    <Link
                      to="/"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Home className="w-[16px] h-[16px] text-neutral-gray" />
                      View as Tenant
                    </Link>
                  </div>
                  <div className="border-t border-[rgba(0,0,0,0.08)]"></div>
                  <div className="py-[8px]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                    >
                      <LogOut className="w-[16px] h-[16px] text-neutral-gray" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center gap-[10px]">
              <Link
                to="/landlord/inbox"
                className="relative inline-flex h-[42px] w-[42px] items-center justify-center rounded-full text-[#11354B] hover:bg-[#EEF2F7]"
                aria-label="Open messages"
              >
                <Bell className="h-[22px] w-[22px]" />
                {notificationCount > 0 && (
                  <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
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
          </div>
        </div>
      </header>

      {isMobileMenuOpen && typeof document !== "undefined" && createPortal(
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-[110] bg-[rgba(16,26,34,0.58)] backdrop-blur-[1px] md:hidden"
          />

          <aside className="fixed right-0 top-0 z-[111] h-full w-[84vw] max-w-[360px] bg-white shadow-[-12px_0_36px_rgba(0,0,0,0.22)] md:hidden">
            <div className="flex items-center justify-between border-b border-[rgba(0,0,0,0.08)] px-[20px] py-[16px]">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                <BrandLogo className="h-[44px]" />
              </Link>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full text-[#143B53] hover:bg-[#EFF3F7]"
                aria-label="Close menu"
              >
                <X className="h-[24px] w-[24px]" />
              </button>
            </div>

            <div className="h-[calc(100%-76px)] overflow-y-auto px-[14px] py-[16px]">
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
                  to="/landlord/listings/add"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="mt-[12px] flex items-center justify-center rounded-[12px] border border-[#A1B4C7] px-[12px] py-[11px] text-[16px] font-semibold text-[#11354B]"
                >
                  Add listing
                </Link>
              </div>

              <nav className="mt-[10px]">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-[16px] font-medium transition-colors ${
                        active ? "bg-[#DCE4EC] text-[#11354B]" : "text-[#11354B] hover:bg-[#F3F6F9]"
                      }`}
                    >
                      <Icon className="h-[20px] w-[20px]" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <div className="my-[10px] border-t border-[rgba(0,0,0,0.08)]" />

              <nav>
                <Link
                  to="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-[16px] font-medium transition-colors ${
                    isActive("/account") ? "bg-[#DCE4EC] text-[#11354B]" : "text-[#11354B] hover:bg-[#F3F6F9]"
                  }`}
                >
                  <Settings className="h-[20px] w-[20px]" />
                  Account Settings
                </Link>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-[16px] font-medium text-[#11354B] transition-colors hover:bg-[#F3F6F9]"
                >
                  <Home className="h-[20px] w-[20px]" />
                  View as Tenant
                </Link>
              </nav>

              <div className="my-[10px] border-t border-[rgba(0,0,0,0.08)]" />

              <div className="mt-[12px] border-t border-[rgba(0,0,0,0.08)] pt-[12px]">
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

              <button
                type="button"
                onClick={handleLogout}
                className="mt-[12px] flex w-full items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-left text-[16px] font-medium text-[#11354B] transition-colors hover:bg-[#F3F6F9]"
              >
                <LogOut className="h-[20px] w-[20px]" />
                Log Out
              </button>
            </div>
          </aside>
        </>,
        document.body
      )}

      {typeof document !== "undefined" && createPortal(
        <nav className="fixed bottom-0 left-0 right-0 z-[79] border-t border-[rgba(0,0,0,0.1)] bg-white md:hidden" aria-label="Mobile quick navigation">
          <div className="grid grid-cols-4 px-[6px] pt-[8px] pb-[max(10px,env(safe-area-inset-bottom))]">
            {mobileBottomNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-[6px] rounded-[8px] px-[4px] py-[6px] text-center transition-colors ${
                    active ? "text-[#11354B] bg-[#ECF2F7]" : "text-[#3A5568]"
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

      <div className="flex">
        {!hideSidebar && (
          <aside className="hidden md:block w-[240px] bg-white border-r border-[rgba(0,0,0,0.08)] min-h-[calc(100vh-73px)] sticky top-[73px]">
            <nav className="py-[24px]">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-[12px] px-[24px] py-[12px] text-[14px] font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-brand-light text-brand-primary border-l-[4px] border-brand-primary"
                        : "text-neutral-gray hover:bg-neutral-light-gray border-l-[4px] border-transparent"
                    }`}
                  >
                    <Icon className="w-[20px] h-[20px]" />
                    {item.name}
                    {item.name === "Messages" && (
                      unreadMessages > 0 ? (
                        <span className="ml-auto bg-brand-primary text-white text-[12px] font-bold px-[6px] py-[2px] rounded-full">
                          {unreadMessages > 99 ? "99+" : unreadMessages}
                        </span>
                      ) : null
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
        )}

        <main className="flex-1 min-h-[calc(100vh-73px)] pb-[86px] md:pb-0">
          {children}
        </main>
      </div>

      {!hideFooter && <Footer variant="dashboard" />}
    </div>
  );
}