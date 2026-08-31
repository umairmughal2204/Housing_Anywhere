import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../contexts/auth-context";
import { Link } from "react-router";
import {
  Home,
  Search,
  Building,
  HelpCircle,
  Shield,
  FileText,
  Users,
  Briefcase,
  BookOpen,
  DollarSign,
  Compass,
} from "lucide-react";

export function Sitemap() {
  const { isAuthenticated } = useAuth();

  const sitemapGroups = [
    {
      title: "Main Navigation",
      icon: Home,
      links: [
        { label: "Home", path: "/" },
        { label: "Search Listings", path: "/listings" },
        { label: "How It Works", path: "/how-it-works" },
        { label: "Pricing", path: "/pricing" },
        { label: "About Us", path: "/about" },
        { label: "Help & Support", path: "/help" },
      ],
    },
    {
      title: "For Tenants",
      icon: Users,
      links: [
        { label: "Tenant Dashboard", path: "/tenant/inbox" },
        { label: "My Applications", path: "/tenant/applications" },
        { label: "Saved Favorites", path: "/favorites" },
        { label: "Pay Rent Online", path: "/payments" },
        { label: "Blog for Tenants", path: "/blog/tenants" },
      ],
    },
    {
      title: "For Landlords",
      icon: Building,
      links: [
        { label: "Become a Landlord", path: "/landlord" },
        { label: "Landlord Register", path: "/landlord/register" },
        { label: "Landlord Dashboard", path: "/landlord/dashboard" },
        { label: "Listings Management", path: "/landlord/listings" },
        { label: "Rent Guarantee", path: "/rent-guarantee" },
        { label: "How-to Guides", path: "/guides" },
        { label: "Success Stories", path: "/success-stories" },
        { label: "Blog for Landlords", path: "/blog/landlords" },
        { label: "Integrations", path: "/integrations" },
        { label: "Sample Rental Contracts", path: "/sample-contracts" },
      ],
    },
    {
      title: "Company & Media",
      icon: Briefcase,
      links: [
        { label: "About EzzyStay", path: "/about" },
        { label: "Careers", path: "/careers" },
        { label: "Press & Newsroom", path: "/press" },
        { label: "Partnerships", path: "/partners" },
        { label: "Contact Us", path: "/contact" },
      ],
    },
    {
      title: "Legal & Trust",
      icon: Shield,
      links: [
        { label: "Terms & Conditions", path: "/terms" },
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Cookie Policy", path: "/cookies" },
      ],
    },
    {
      title: "Account & Authentication",
      icon: FileText,
      links: [
        { label: "Log In", path: "/login" },
        { label: "Sign Up", path: "/signup" },
        { label: "Forgot Password", path: "/forgot-password" },
        { label: "Account Settings", path: "/account" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header
        variant={isAuthenticated ? "dashboard" : "default"}
        dashboardButtonFilled={false}
      />

      {/* Header Banner */}
      <section className="bg-[#0F2D36] text-white py-[56px] md:py-[72px] px-[16px] text-center">
        <Compass className="w-[40px] h-[40px] mx-auto mb-[16px] text-[#0891B2]" />
        <h1 className="text-[32px] md:text-[48px] font-bold tracking-tight mb-[12px]">
          Site Map
        </h1>
        <p className="text-[16px] md:text-[18px] text-white/80 max-w-[550px] mx-auto leading-[1.5]">
          A complete directory of all pages on the EzzyStay platform.
        </p>
      </section>

      {/* Grid of Links */}
      <main className="max-w-[1100px] mx-auto px-[16px] py-[72px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
          {sitemapGroups.map((group) => (
            <div
              key={group.title}
              className="bg-[#F8FAFB] border border-[#E5E7EB] rounded-[16px] p-[28px]"
            >
              <div className="flex items-center gap-[10px] mb-[20px]">
                <div className="w-[36px] h-[36px] bg-[#E0F2FE] rounded-[10px] flex items-center justify-center">
                  <group.icon className="w-[20px] h-[20px] text-[#0891B2]" />
                </div>
                <h2 className="text-[#0F2D36] text-[18px] font-bold">
                  {group.title}
                </h2>
              </div>
              <ul className="space-y-[10px]">
                {group.links.map((link) => (
                  <li key={link.path + link.label}>
                    <Link
                      to={link.path}
                      className="text-[#374151] text-[15px] font-medium hover:text-[#0891B2] transition-colors flex items-center gap-[6px]"
                    >
                      <span className="w-[6px] h-[6px] rounded-full bg-[#0891B2] flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}
