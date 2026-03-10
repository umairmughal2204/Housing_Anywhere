import { Link } from "react-router";
import { Facebook, Youtube, Instagram, Linkedin, ChevronDown, Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Footer() {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    "English",
    "Español",
    "Français",
    "Deutsch",
    "Italiano",
    "Nederlands",
    "Português",
    "Polski",
    "Türkçe",
    "中文",
    "日本語",
    "한국어"
  ];

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
    <footer className="bg-neutral-light-gray py-[64px]">
      <div className="max-w-[1440px] mx-auto px-[32px]">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-[64px]">
          {/* Left Section - Logo, Language, App */}
          <div>
            {/* Logo */}
            <div className="flex items-center gap-[8px] mb-[32px]">
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
              <span className="text-neutral-black text-[16px] font-bold">
                Easy<span className="text-brand-primary">Rent</span>
              </span>
            </div>

            {/* Language Selector */}
            <div ref={dropdownRef} className="relative">
              <button
                className="flex items-center gap-[8px] mb-[32px] text-neutral-black hover:text-brand-primary transition-colors"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <Globe className="w-[16px] h-[16px]" />
                <span className="text-[14px] font-semibold">{selectedLanguage}</span>
                <ChevronDown className="w-[14px] h-[14px]" />
              </button>
              {showLanguageDropdown && (
                <div className="absolute left-0 top-full bg-white border border-neutral p-[8px] z-10">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      className="block w-full text-left px-[8px] py-[4px] hover:bg-brand-primary hover:text-white transition-colors"
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setShowLanguageDropdown(false);
                      }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="border border-neutral p-[16px] bg-white">
              <p className="text-neutral-gray text-[14px] leading-[1.6]">
                EasyRent connects international students, expats, and digital nomads with verified mid-to-long-term rental properties worldwide. Find your perfect home with trusted landlords.
              </p>
            </div>
          </div>

          {/* Easyrent Column */}
          <div>
            <h3 className="text-neutral-black text-[14px] font-bold mb-[24px]">Easyrent</h3>
            <ul className="space-y-[12px]">
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Cookie policy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

          {/* Tenants Column */}
          <div>
            <h3 className="text-neutral-black text-[14px] font-bold mb-[24px]">Tenants</h3>
            <ul className="space-y-[12px]">
              <li>
                <Link to="/how-it-works" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Pay rent online
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Blog for tenants
                </a>
              </li>
            </ul>
            
            <h4 className="text-neutral-black text-[14px] font-bold mt-[32px] mb-[24px]">Support</h4>
            <ul className="space-y-[12px]">
              <li>
                <Link to="/help" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Help
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          {/* Landlords Column */}
          <div>
            <h3 className="text-neutral-black text-[14px] font-bold mb-[24px]">Landlords</h3>
            <ul className="space-y-[12px]">
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/landlord" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Become a landlord
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Easyrent Rent Guarantee
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Collect rent online
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  How-to guides
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Success stories
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Blog for landlords
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-gray text-[14px] hover:text-brand-primary transition-colors">
                  Sample rental contracts
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media Icons - Right Column */}
          <div className="flex flex-col gap-[16px]">
            <a
              href="#"
              className="w-[40px] h-[40px] border border-[rgba(0,0,0,0.12)] flex items-center justify-center hover:border-brand-primary hover:bg-brand-primary group transition-all"
            >
              <Facebook className="w-[18px] h-[18px] text-neutral-black group-hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="w-[40px] h-[40px] border border-[rgba(0,0,0,0.12)] flex items-center justify-center hover:border-brand-primary hover:bg-brand-primary group transition-all"
            >
              <svg className="w-[18px] h-[18px] text-neutral-black group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-[40px] h-[40px] border border-[rgba(0,0,0,0.12)] flex items-center justify-center hover:border-brand-primary hover:bg-brand-primary group transition-all"
            >
              <Linkedin className="w-[18px] h-[18px] text-neutral-black group-hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="w-[40px] h-[40px] border border-[rgba(0,0,0,0.12)] flex items-center justify-center hover:border-brand-primary hover:bg-brand-primary group transition-all"
            >
              <Youtube className="w-[18px] h-[18px] text-neutral-black group-hover:text-white transition-colors" />
            </a>
            <a
              href="#"
              className="w-[40px] h-[40px] border border-[rgba(0,0,0,0.12)] flex items-center justify-center hover:border-brand-primary hover:bg-brand-primary group transition-all"
            >
              <Instagram className="w-[18px] h-[18px] text-neutral-black group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="max-w-[1440px] mx-auto px-[32px] mt-[48px] pt-[24px] border-t border-neutral">
        <p className="text-neutral-gray text-[14px] text-center">
          © 2026 EasyRent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}