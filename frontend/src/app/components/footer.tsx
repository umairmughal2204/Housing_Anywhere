import { Link } from "react-router";
import { Facebook, Youtube, Instagram, Linkedin, ChevronDown, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { changeSiteLanguage, getSavedLanguageLabel, SUPPORTED_LANGUAGES } from "../utils/translate";
import footerLogo from "../../assets/footer_logo.png";

interface FooterProps {
  variant?: "default" | "dashboard";
}

export function Footer({ variant = "default" }: FooterProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(getSavedLanguageLabel());
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDashboardVariant = variant === "dashboard";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <footer className={isDashboardVariant ? "bg-[#E4EAEE] border-t border-[#D4DEE5] pt-[68px] pb-[136px]" : "bg-[#E4EAEE] pt-[72px] pb-[144px]"}>
      <div className={isDashboardVariant ? "max-w-[1440px] mx-auto px-[20px] lg:px-[28px]" : "max-w-[1440px] mx-auto px-[16px] sm:px-[32px] lg:px-[44px]"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_auto] gap-[28px] sm:gap-[42px] lg:gap-[64px]">
          {/* Left Section - Logo, Language, App */}
          <div>
            {/* Logo */}
            <Link to="/" className="inline-flex items-center mb-[28px] pb-[8px]">
              <img src={footerLogo} alt="ReserveHousing" className="h-[80px] sm:h-[92px] w-auto object-contain" />
            </Link>

            {/* Language Selector */}
            <div ref={dropdownRef} className="relative">
              <button
                className="flex items-center gap-[10px] mb-[28px] text-[#052A3A] leading-none hover:text-brand-primary transition-colors"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <Globe className="w-[18px] h-[18px]" />
                <span className="font-medium text-[14px] sm:text-[15px] leading-none">{selectedLanguage}</span>
                <ChevronDown className="w-[16px] h-[16px]" />
              </button>
              {showLanguageDropdown && (
                <div className="absolute left-0 top-full bg-white border border-neutral p-[8px] z-10">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <button
                      key={language.code}
                      className="block w-full text-left px-[8px] py-[4px] hover:bg-brand-primary hover:text-white transition-colors"
                      onClick={() => {
                        setSelectedLanguage(language.label);
                        changeSiteLanguage(language.code);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Get app card */}
            <div className="max-w-[390px] rounded-[12px] border border-[rgba(5,42,58,0.35)] p-[22px] bg-transparent">
              <p className="text-[#052A3A] text-[18px] sm:text-[20px] font-bold leading-none mb-[12px]">Need help finding a place?</p>
              <p className="text-[#0E3444] text-[14px] sm:text-[15px] leading-[1.5] mb-[20px] max-w-[320px]">
                Explore verified listings, compare options, and message landlords directly from your dashboard.
              </p>
            </div>
          </div>

          {/* ReserveHousing Column */}
          <div>
            <h3 className="text-[#052A3A] text-[16px] sm:text-[18px] font-bold mb-[20px]">ReserveHousing</h3>
            <ul className="space-y-[12px]">
              <li>
                <Link to="/how-it-works" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Cookie policy
                </Link>
              </li>
              <li>
                <Link to="/listings" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Sitemap
                </Link>
              </li>
            </ul>
          </div>

          {/* Tenants Column */}
          <div>
            <h3 className="text-[#052A3A] text-[16px] sm:text-[18px] font-bold mb-[20px]">Tenants</h3>
            <ul className="space-y-[12px]">
              <li>
                <Link to="/how-it-works" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/payments" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Pay rent online
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Blog for tenants
                </Link>
              </li>
            </ul>
            
            <h4 className="text-[#052A3A] text-[16px] sm:text-[18px] font-bold mt-[28px] mb-[20px]">Support</h4>
            <ul className="space-y-[12px]">
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Help
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>

          {/* Landlords Column */}
          <div>
            <h3 className="text-[#052A3A] text-[16px] sm:text-[18px] font-bold mb-[20px]">Landlords</h3>
            <ul className="space-y-[12px]">
              <li>
                <Link to="/how-it-works" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/landlord" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Become a landlord
                </Link>
              </li>
              <li>
                <Link to="/landlord" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  ReserveHousing Rent Guarantee
                </Link>
              </li>
              <li>
                <Link to="/payments" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Collect rent online
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  How-to guides
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Success stories
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Blog for landlords
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-[#10394A] text-[14px] sm:text-[15px] hover:text-brand-primary transition-colors">
                  Sample rental contracts
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Icons - Right Column */}
          <div className="flex flex-row sm:flex-col items-start gap-[18px] sm:gap-[26px] lg:pt-[8px]">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#052A3A] hover:text-brand-primary transition-colors"
            >
              <Facebook className="w-[30px] h-[30px]" />
            </a>
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#052A3A] hover:text-brand-primary transition-colors"
            >
              <svg className="w-[30px] h-[30px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#052A3A] hover:text-brand-primary transition-colors"
            >
              <Linkedin className="w-[30px] h-[30px]" />
            </a>
            <a
              href="https://www.youtube.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#052A3A] hover:text-brand-primary transition-colors"
            >
              <Youtube className="w-[30px] h-[30px]" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#052A3A] hover:text-brand-primary transition-colors"
            >
              <Instagram className="w-[30px] h-[30px]" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className={isDashboardVariant ? "max-w-[1440px] mx-auto px-[20px] lg:px-[28px] mt-[44px] pt-[24px] border-t border-[rgba(5,42,58,0.15)]" : "max-w-[1440px] mx-auto px-[16px] sm:px-[32px] lg:px-[44px] mt-[44px] pt-[24px] border-t border-[rgba(5,42,58,0.15)]"}>
        <p className="text-[#10394A] text-[14px] sm:text-[15px] text-center">
          © 2026 ReserveHousing. All rights reserved.
        </p>
      </div>
    </footer>
  );
}