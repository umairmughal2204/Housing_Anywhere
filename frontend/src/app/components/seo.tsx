import { useEffect } from "react";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = "EzzyStay | Rent Verified Apartments & Rooms Online";
const DEFAULT_DESCRIPTION =
  "Find and rent verified rooms, apartments, and studios worldwide with 24/7 support and EzzyStay Tenant Protection.";
const DEFAULT_SITE_URL = "https://ezzystay.com";
const DEFAULT_OG_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = "housing anywhere, rent room, student housing, apartment rental, ezzy stay, long term rental",
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | EzzyStay` : DEFAULT_TITLE;
  const targetUrl = canonicalUrl || (typeof window !== "undefined" ? window.location.href : DEFAULT_SITE_URL);

  useEffect(() => {
    // 1. Update Document Title
    document.title = fullTitle;

    // Helper to update or set meta tag
    const updateMetaTag = (selector: string, attributeName: string, attributeVal: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attributeName, attributeVal);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 2. Standard Meta Tags
    updateMetaTag('meta[name="description"]', "name", "description", description);
    updateMetaTag('meta[name="keywords"]', "name", "keywords", keywords);

    // 3. Open Graph Meta Tags
    updateMetaTag('meta[property="og:title"]', "property", "og:title", fullTitle);
    updateMetaTag('meta[property="og:description"]', "property", "og:description", description);
    updateMetaTag('meta[property="og:url"]', "property", "og:url", targetUrl);
    updateMetaTag('meta[property="og:image"]', "property", "og:image", ogImage);
    updateMetaTag('meta[property="og:type"]', "property", "og:type", ogType);
    updateMetaTag('meta[property="og:site_name"]', "property", "og:site_name", "EzzyStay");

    // 4. Twitter Card Meta Tags
    updateMetaTag('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    updateMetaTag('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    updateMetaTag('meta[name="twitter:description"]', "name", "twitter:description", description);
    updateMetaTag('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", targetUrl);

    // 6. JSON-LD Structured Data
    const scriptId = "ezzystay-jsonld";
    let jsonLdScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (jsonLd) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement("script");
        jsonLdScript.id = scriptId;
        jsonLdScript.type = "application/ld+json";
        document.head.appendChild(jsonLdScript);
      }
      jsonLdScript.text = JSON.stringify(jsonLd);
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [fullTitle, description, keywords, targetUrl, ogImage, ogType, jsonLd]);

  return null;
}
