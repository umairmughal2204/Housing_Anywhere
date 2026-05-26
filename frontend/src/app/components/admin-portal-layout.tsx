import { Link, useLocation, useNavigate } from "react-router";
import { createPortal } from "react-dom";
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { useState, useEffect } from "react";
import { UserAvatar } from "./user-avatar";
import { BrandLogo } from "./brand-logo";

interface AdminPortalLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Listings", href: "/admin/listings", icon: Home },
  { name: "Bookings", href: "/admin/applications", icon: FileText },
];

export function AdminPortalLayout({ children }: AdminPortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(href);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-neutral-light-gray">
      {/* Top Header */}
      <header className="bg-white border-b border-[rgba(0,0,0,0.08)] sticky top-0 z-50">
        <div className="px-[16px] sm:px-[32px] py-[12px] sm:py-[16px] flex items-center justify-between">
          {/* Left: Logo & Portal Title */}
          <div className="flex items-center gap-[24px]">
            <Link to="/admin" className="flex items-center gap-[8px]">
              <BrandLogo className="h-[48px] sm:h-[68px]" />
            </Link>

            <div className="hidden md:block h-[24px] w-[1px] bg-[rgba(0,0,0,0.08)]" />

            <div className="hidden md:flex items-center gap-[8px]">
              <ShieldCheck className="w-[16px] h-[16px] text-brand-primary" />
              <div>
                <div className="text-neutral-black text-[14px] font-bold">Admin Portal</div>
                <div className="text-neutral-gray text-[12px]">Super Administrator</div>
              </div>
            </div>
          </div>

          {/* Right: User + logout */}
          <div className="hidden md:flex items-center gap-[16px]">
            <div className="flex items-center gap-[12px] px-[8px] py-[8px]">
              <UserAvatar
                name={user?.name}
                profilePictureUrl={user?.profilePictureUrl}
                sizeClassName="w-[32px] h-[32px]"
                textClassName="text-white text-[14px] font-bold bg-brand-primary"
              />
              <div className="text-left">
                <div className="text-neutral-black text-[14px] font-bold">{user?.name}</div>
                <div className="text-neutral-gray text-[12px]">Admin</div>
              </div>
            </div>

            <div className="h-[24px] w-[1px] bg-[rgba(0,0,0,0.08)]" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-[8px] px-[16px] py-[8px] text-neutral-gray text-[14px] font-medium hover:bg-neutral-light-gray transition-colors rounded-[8px]"
            >
              <LogOut className="w-[16px] h-[16px]" />
              Log Out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden inline-flex h-[46px] w-[46px] items-center justify-center rounded-full ring-2 ring-[#9CB2C7]"
            aria-label="Open menu"
          >
            <UserAvatar
              name={user?.name}
              profilePictureUrl={user?.profilePictureUrl}
              sizeClassName="w-full h-full rounded-full"
              textClassName="text-white text-[18px] font-semibold bg-[#334E60]"
            />
          </button>
        </div>
      </header>

      {/* Mobile slide-in menu */}
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
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
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
              <div className="rounded-[12px] border border-[rgba(0,0,0,0.08)] p-[12px] mb-[10px]">
                <div className="flex items-center gap-[12px]">
                  <UserAvatar
                    name={user?.name}
                    profilePictureUrl={user?.profilePictureUrl}
                    sizeClassName="h-[56px] w-[56px] rounded-full"
                    textClassName="text-white text-[20px] font-semibold bg-[#334E60]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[18px] font-bold text-[#102E43]">{user?.name ?? "Admin"}</p>
                    <p className="truncate text-[13px] text-[#26485D]">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav>
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

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-[12px] rounded-[10px] px-[14px] py-[11px] text-left text-[16px] font-medium text-[#11354B] transition-colors hover:bg-[#F3F6F9]"
              >
                <LogOut className="h-[20px] w-[20px]" />
                Log Out
              </button>
            </div>
          </aside>
        </>,
        document.body
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-[240px] bg-white border-r border-[rgba(0,0,0,0.08)] h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto flex-shrink-0">
          <nav className="py-[24px] flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-[12px] px-[24px] py-[12px] text-[14px] font-medium transition-colors ${
                    active
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

          {/* Mobile bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 p-[16px] border-t border-[rgba(0,0,0,0.08)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-[12px] px-[16px] py-[10px] text-neutral-gray text-[14px] font-medium hover:bg-neutral-light-gray transition-colors rounded-[8px]"
            >
              <LogOut className="w-[16px] h-[16px]" />
              Log Out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-h-[calc(100vh-73px)] p-[14px] sm:p-[24px] md:p-[32px] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
