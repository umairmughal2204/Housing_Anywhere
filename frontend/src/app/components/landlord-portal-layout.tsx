import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Home, 
  ClipboardList,
  FileText,
  MessageSquare,
  MessageCircle,
  Heart,
  Settings,
  TrendingUp,
  CreditCard,
  HelpCircle,
  LogOut,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../config";
import { changeSiteLanguage, getSavedLanguageLabel, SUPPORTED_LANGUAGES } from "../utils/translate";
import { UserAvatar } from "./user-avatar";
import { Footer } from "./footer";

interface LandlordPortalLayoutProps {
  children: React.ReactNode;
  headerLeadingAction?: React.ReactNode;
  hideSidebar?: boolean;
}

export function LandlordPortalLayout({
  children,
  headerLeadingAction,
  hideSidebar = false,
}: LandlordPortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(getSavedLanguageLabel());
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<{
    code: (typeof SUPPORTED_LANGUAGES)[number]["code"];
    label: string;
  } | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalProperties, setTotalProperties] = useState(0);
  const [hasLoadedSummary, setHasLoadedSummary] = useState(false);
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
          setTotalProperties(payload.stats?.totalProperties ?? 0);
          setHasLoadedSummary(true);
        }
      } catch {
        if (!isCancelled) {
          setUnreadMessages(0);
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

      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }

      if (showLanguageDropdown && languageDropdownRef.current && !languageDropdownRef.current.contains(target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLanguageDropdown, showUserMenu]);

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

  const propertyCountLabel = hasLoadedSummary
    ? totalProperties
    : (user?.landlordProfile?.numberOfProperties ?? 0);
  const isOnLandlordDashboard = location.pathname.startsWith("/landlord/dashboard");

  return (
    <div className="min-h-screen bg-neutral-light-gray">
      {/* Top Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[16px] flex items-center justify-between">
          <div className="flex items-center gap-[12px]">
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
          </div>

          <div className="flex items-center gap-[16px]">
            {headerLeadingAction}

            <Link
              to={isOnLandlordDashboard ? "/landlord/add-listing" : "/landlord/dashboard"}
              className="flex items-center gap-[8px] px-[16px] py-[8px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors"
            >
              {isOnLandlordDashboard ? <FileText className="w-[16px] h-[16px]" /> : <LayoutDashboard className="w-[16px] h-[16px]" />}
              {isOnLandlordDashboard ? "Add Listing" : "Go to Dashboard"}
            </Link>

            <Link to="/landlord/inbox" className="relative p-[8px] hover:bg-neutral-light-gray transition-colors">
              <MessageCircle className="w-[20px] h-[20px] text-neutral-gray" />
              {unreadMessages > 0 && (
                <span className="absolute top-[4px] right-[4px] min-w-[16px] h-[16px] px-[4px] bg-brand-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>

            <Link to="/favorites" className="p-[8px] hover:bg-neutral-light-gray transition-colors">
              <Heart className="w-[20px] h-[20px] text-neutral-gray" />
            </Link>

            {/* Language */}
            <div className="relative" ref={languageDropdownRef}>
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

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-[8px] hover:bg-neutral-light-gray transition-colors"
              >
                <UserAvatar
                  name={user?.name}
                  profilePictureUrl={user?.profilePictureUrl}
                  sizeClassName="w-[40px] h-[40px]"
                  textClassName="text-white text-[16px] font-semibold bg-neutral-gray"
                />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-[240px] bg-white border border-[rgba(0,0,0,0.08)] shadow-lg">
                  <div className="py-[8px]">
                    <Link
                      to="/landlord/dashboard"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <LayoutDashboard className="w-[16px] h-[16px] text-neutral-gray" />
                      Dashboard
                    </Link>
                    <Link
                      to="/account"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="w-[16px] h-[16px] text-neutral-gray" />
                      Account
                    </Link>
                    <Link
                      to="/how-it-works"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <TrendingUp className="w-[16px] h-[16px] text-neutral-gray" />
                      How it works
                    </Link>
                    <Link
                      to="/pricing"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <CreditCard className="w-[16px] h-[16px] text-neutral-gray" />
                      Pricing
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center gap-[12px] px-[16px] py-[12px] text-neutral-black text-[14px] hover:bg-neutral-light-gray transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <HelpCircle className="w-[16px] h-[16px] text-neutral-gray" />
                      Help
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

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-[8px] hover:bg-neutral-light-gray transition-colors"
              aria-label="Toggle navigation"
            >
              {isMobileMenuOpen ? (
                <X className="w-[20px] h-[20px] text-neutral-black" />
              ) : (
                <Menu className="w-[20px] h-[20px] text-neutral-black" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[rgba(0,0,0,0.08)] bg-white">
            <nav className="py-[8px]">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-[12px] px-[32px] py-[12px] text-[14px] font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-brand-light text-brand-primary border-l-[4px] border-brand-primary"
                        : "text-neutral-gray hover:bg-neutral-light-gray border-l-[4px] border-transparent"
                    }`}
                  >
                    <Icon className="w-[20px] h-[20px]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

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

            <div className="px-[24px] py-[16px] border-t border-[rgba(0,0,0,0.08)]">
              <Link
                to="/landlord/listings/add"
                className="block w-full px-[16px] py-[10px] bg-brand-primary text-white text-[14px] font-bold text-center hover:bg-brand-primary-dark transition-colors"
              >
                + Add Listing
              </Link>
            </div>
          </aside>
        )}

        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
}