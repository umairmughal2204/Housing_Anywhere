import { Link, useLocation, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Home, 
  Calendar, 
  MessageSquare, 
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { useState } from "react";

interface LandlordPortalLayoutProps {
  children: React.ReactNode;
}

export function LandlordPortalLayout({ children }: LandlordPortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/landlord/dashboard", icon: LayoutDashboard },
    { name: "Listings", href: "/landlord/listings", icon: Home },
    { name: "Rentals", href: "/landlord/rentals", icon: Calendar },
    { name: "Messages", href: "/landlord/inbox", icon: MessageSquare },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user) return "L";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-neutral-light-gray">
      {/* Top Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-50">
        <div className="px-[32px] py-[16px] flex items-center justify-between">
          {/* Left: Logo & Portal Title */}
          <div className="flex items-center gap-[24px]">
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
            
            <div className="hidden md:block h-[24px] w-[1px] bg-[rgba(0,0,0,0.08)]"></div>
            
            <div className="hidden md:block">
              <div className="text-neutral-black text-[14px] font-bold">Landlord Portal</div>
              {user?.landlordProfile && (
                <div className="text-neutral-gray text-[12px]">
                  {user.landlordProfile.numberOfProperties} {user.landlordProfile.numberOfProperties === 1 ? "Property" : "Properties"}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-[8px] hover:bg-neutral-light-gray transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-[20px] h-[20px] text-neutral-black" />
              ) : (
                <Menu className="w-[20px] h-[20px] text-neutral-black" />
              )}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-[16px]">
            {/* Notifications */}
            <button className="relative p-[8px] hover:bg-neutral-light-gray transition-colors">
              <Bell className="w-[20px] h-[20px] text-neutral-gray" />
              <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-brand-primary rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-[12px] p-[8px] hover:bg-neutral-light-gray transition-colors"
              >
                <div className="w-[32px] h-[32px] bg-brand-primary rounded-full flex items-center justify-center text-white text-[14px] font-bold">
                  {user?.profilePictureUrl ? (
                    <img src={user.profilePictureUrl} alt="User" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-neutral-black text-[14px] font-bold">{user?.name}</div>
                  <div className="text-neutral-gray text-[12px]">
                    {user?.landlordProfile?.businessType === "individual" ? "Property Owner" : 
                     user?.landlordProfile?.businessType === "dealer" ? "Dealer" : "Agency"}
                  </div>
                </div>
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

      <div className="flex">
        {/* Sidebar Navigation - Desktop Only */}
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
                    <span className="ml-auto bg-brand-primary text-white text-[12px] font-bold px-[6px] py-[2px] rounded-full">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="px-[24px] py-[16px] border-t border-[rgba(0,0,0,0.08)]">
            <Link
              to="/landlord/listings/add"
              className="block w-full px-[16px] py-[10px] bg-brand-primary text-white text-[14px] font-bold text-center hover:bg-brand-primary-dark transition-colors"
            >
              + Add Listing
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-73px)]">
          {children}
        </main>
      </div>
    </div>
  );
}