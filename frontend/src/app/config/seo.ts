// SEO Configuration for Reserve Housing
// Use this file to maintain consistent meta tags across all pages

export const SEO_CONFIG = {
  // Base site configuration
  site: {
    name: 'Reserve Housing',
    domain: 'https://reservehousing.com',
    description: 'Discover verified rental properties, connect with trusted landlords, and secure your next home with Reserve Housing.',
    locale: 'en_US',
    twitterHandle: '@ReserveHousing',
  },

  // Default meta tags for all pages
  defaults: {
    title: 'Reserve Housing - Find Your Perfect Rental Home | Trusted Rental Marketplace',
    description: 'Discover verified rental properties, connect with trusted landlords, and secure your next home with Reserve Housing. Browse thousands of apartments and houses with transparent pricing and guaranteed peace of mind.',
    image: 'https://reservehousing.com/og-image.png',
    imageWidth: 1200,
    imageHeight: 630,
    type: 'website',
  },

  // Page-specific configurations
  pages: {
    home: {
      title: 'Reserve Housing - Find Your Perfect Rental Home | Trusted Rental Marketplace',
      description: 'Discover verified rental properties, connect with trusted landlords, and secure your next home with Reserve Housing. Browse thousands of apartments and houses with transparent pricing.',
      path: '/',
      priority: 1.0,
      changefreq: 'weekly',
    },
    listings: {
      title: 'Browse Rental Listings | Reserve Housing',
      description: 'Browse verified rental properties across major cities. Find apartments, houses, and studios with transparent pricing and guaranteed landlord verification.',
      path: '/listings',
      priority: 0.9,
      changefreq: 'daily',
    },
    howItWorks: {
      title: 'How Reserve Housing Works | Simple Rental Process',
      description: 'Learn how Reserve Housing simplifies the rental process for tenants and landlords. Discover our transparent, secure booking steps.',
      path: '/how-it-works',
      priority: 0.8,
      changefreq: 'monthly',
    },
    pricing: {
      title: 'Reserve Housing Pricing | Transparent Rental Fees',
      description: 'Understand our transparent pricing for both tenants and landlords. No hidden fees, guaranteed peace of mind with Reserve Housing.',
      path: '/pricing',
      priority: 0.8,
      changefreq: 'monthly',
    },
    help: {
      title: 'Help & Support | Reserve Housing',
      description: 'Get answers to common questions about renting, landlord management, payments, and more on Reserve Housing support center.',
      path: '/help',
      priority: 0.7,
      changefreq: 'weekly',
    },
    login: {
      title: 'Login to Reserve Housing',
      description: 'Sign in to your Reserve Housing account to access your rental applications, messages, and property listings.',
      path: '/login',
      priority: 0.6,
      changefreq: 'never',
      noindex: true, // Don't index login page
    },
    signup: {
      title: 'Create Your Reserve Housing Account',
      description: 'Join thousands of happy tenants on Reserve Housing. Create your free account in minutes and start finding your perfect home.',
      path: '/signup',
      priority: 0.6,
      changefreq: 'never',
      noindex: true, // Don't index signup page
    },
    landlordRegister: {
      title: 'List Your Property | Reserve Housing for Landlords',
      description: 'Are you a landlord? List your property on Reserve Housing and connect with verified tenants. Simple, transparent, and secure.',
      path: '/landlord/register',
      priority: 0.7,
      changefreq: 'never',
    },
    favorites: {
      title: 'My Favorite Listings | Reserve Housing',
      description: 'View and manage your favorite rental listings on Reserve Housing. Save properties and organize your rental search.',
      path: '/favorites',
      priority: 0.6,
      changefreq: 'daily',
      noindex: true, // Don't index user-specific pages
    },
    account: {
      title: 'My Account | Reserve Housing',
      description: 'Manage your Reserve Housing account, applications, messages, and rental history.',
      path: '/account',
      priority: 0.5,
      changefreq: 'monthly',
      noindex: true, // Don't index user-specific pages
    },
    propertyListing: {
      title: 'View Property Details | Reserve Housing',
      description: 'View detailed property information, amenities, and rental terms. Apply now or message the landlord.',
      path: '/listing/:id',
      priority: 0.8,
      changefreq: 'daily',
      dynamic: true, // This is a dynamic page
    },
  },

  // Social Media Tags
  social: {
    facebook: 'https://www.facebook.com/reservehousing',
    twitter: 'https://www.twitter.com/reservehousing',
    instagram: 'https://www.instagram.com/reservehousing',
    linkedin: 'https://www.linkedin.com/company/reserve-housing',
  },

  // Keywords by category
  keywords: {
    general: ['rental housing', 'apartment rentals', 'house rentals', 'find rent', 'rental marketplace'],
    tenant: ['find apartment', 'rental application', 'housing search', 'verified landlords'],
    landlord: ['list property', 'rental management', 'tenant screening', 'property landlord'],
    features: ['transparent pricing', 'guaranteed landlord verification', 'secure booking', 'no hidden fees'],
  },

  // Structured Data (Schema.org)
  schema: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'Reserve Housing',
      'url': 'https://reservehousing.com',
      'logo': 'https://reservehousing.com/logo.png',
      'description': 'Trusted rental marketplace connecting tenants with verified landlords',
      'sameAs': [
        'https://www.facebook.com/reservehousing',
        'https://www.twitter.com/reservehousing',
        'https://www.instagram.com/reservehousing',
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'Customer Support',
        'email': 'support@reservehousing.com',
        'url': 'https://reservehousing.com/help',
      },
    },
    searchAction: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Reserve Housing',
      'url': 'https://reservehousing.com',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://reservehousing.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [], // Will be populated dynamically
    },
  },

  // Helper functions
  buildPageUrl: (path: string): string => {
    return `${SEO_CONFIG.site.domain}${path}`;
  },

  buildSocialMetaTags: (pageTitle: string, pageDescription: string, pageImage?: string) => {
    return {
      'og:title': pageTitle,
      'og:description': pageDescription,
      'og:image': pageImage || SEO_CONFIG.defaults.image,
      'og:url': typeof window !== 'undefined' ? window.location.href : SEO_CONFIG.site.domain,
      'twitter:title': pageTitle,
      'twitter:description': pageDescription,
      'twitter:image': pageImage || SEO_CONFIG.defaults.image,
    };
  },
};

export default SEO_CONFIG;
