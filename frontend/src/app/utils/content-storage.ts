export interface BlogPost {
  id: string;
  title: string;
  audience: "tenant" | "landlord";
  category: string;
  author: string;
  readTime: string;
  excerpt: string;
  content: string;
  status: "published" | "draft";
  createdAt: string;
}

export interface ArticleGuide {
  id: string;
  title: string;
  targetRole: "landlord" | "tenant" | "all";
  category: string;
  readTime: string;
  summary: string;
  content: string;
  status: "published" | "draft";
  createdAt: string;
}

const DEFAULT_BLOGS: BlogPost[] = [
  {
    id: "blog-1",
    title: "10 Essential Tips for First-Time Renters in Europe",
    audience: "tenant",
    category: "Renting Advice",
    author: "EzzyStay Team",
    readTime: "5 min read",
    excerpt:
      "Navigating your first rental contract abroad? From understanding deposit schemes to utility bills, here is everything you need to know.",
    content:
      "Renting your first property in a new city or country can feel overwhelming, but with the right preparation, it becomes a seamless experience.\n\n1. Always inspect the inventory report before signing.\n2. Ensure your deposit is held in a protected bank account.\n3. Clarify utility inclusions (water, heating, Wi-Fi) prior to move-in.\n4. Understand notice periods and cancellation policies.\n5. Keep all communications with your landlord on official channels.\n\nFollowing these essential steps will protect your tenant rights and guarantee a peaceful stay.",
    status: "published",
    createdAt: "2026-08-24",
  },
  {
    id: "blog-2",
    title: "European Rental Market Trends & Projections",
    audience: "landlord",
    category: "Market Insights",
    author: "EzzyStay Editorial",
    readTime: "8 min read",
    excerpt:
      "An in-depth analysis of supply shortages, rent caps, inflation adjustments, and yield benchmarks in major European capitals.",
    content:
      "The rental housing landscape across Europe continues to evolve rapidly with high demand in metropolitan centers.\n\nKey Highlights:\n- Mid-term leases (3-12 months) are seeing highest tenant retention.\n- Energy efficiency ratings (EPC) are directly impacting rental property values.\n- Digital signing and verified tenant profiles reduce vacancy rates significantly.\n\nProperty owners using automated management platforms report lower turnover and consistent yield growth.",
    status: "published",
    createdAt: "2026-08-26",
  },
  {
    id: "blog-3",
    title: "How to Avoid Rental Scams When Booking Online",
    audience: "tenant",
    category: "Safety & Security",
    author: "EzzyStay Security",
    readTime: "7 min read",
    excerpt:
      "Learn key red flags when searching for housing, how verification badges protect you, and best practices for safe deposits.",
    content:
      "Online rental security is top priority when searching for mid-term or long-term accommodation.\n\nKey Red Flags:\n- Landlords asking for wire transfers outside platform secure payment channels.\n- Unusually low rent prices compared to market averages.\n- Refusal to provide video walkthroughs or verified identification.\n\nAlways use EzzyStay verified listings and protected payment channels to ensure 100% money-back security.",
    status: "published",
    createdAt: "2026-08-18",
  },
  {
    id: "blog-4",
    title: "How Mid-Term Rentals Outperform Traditional Leases",
    audience: "landlord",
    category: "Yield Optimization",
    author: "EzzyStay Research",
    readTime: "6 min read",
    excerpt:
      "Why accommodating corporate expats and remote workers delivers 25-40% higher annual returns with lower default risk.",
    content:
      "Flexible mid-term housing represents the fastest growing segment in urban real estate.\n\nBenefits for Landlords:\n- Higher rental yields per month.\n- Reliable corporate and professional tenants.\n- Lower risk of non-payment through upfront platform security deposits.",
    status: "published",
    createdAt: "2026-08-19",
  },
];

const DEFAULT_ARTICLES: ArticleGuide[] = [
  {
    id: "art-1",
    title: "How to Take High-Quality Listing Photos",
    targetRole: "landlord",
    category: "Listing Optimization",
    readTime: "4 min read",
    summary:
      "Simple camera hacks and staging tips to make your property stand out and attract 3x more bookings.",
    content:
      "High quality photos are the single most important factor for listing conversion.\n\n1. Shoot in bright daylight with natural sunlight.\n2. Clean and declutter all rooms before photographing.\n3. Take wide-angle shots from room corners.\n4. Highlight key amenities like workspace, high-speed Wi-Fi, and kitchen appliances.",
    status: "published",
    createdAt: "2026-08-20",
  },
  {
    id: "art-2",
    title: "Landlord Guide: Screen & Select Reliable Tenants",
    targetRole: "landlord",
    category: "Tenant Screening",
    readTime: "6 min read",
    summary:
      "How to evaluate employment proof, credit references, and former landlord reviews efficiently.",
    content:
      "Screening tenants protects your investment and ensures timely rental payments.\n\nStep-by-step evaluation:\n1. Verify employment contracts or proof of income.\n2. Review previous landlord references.\n3. Confirm identity documents matching applicant profile.",
    status: "published",
    createdAt: "2026-08-15",
  },
  {
    id: "art-3",
    title: "Understanding Local Rental Tax Regulations",
    targetRole: "landlord",
    category: "Legal & Taxes",
    readTime: "8 min read",
    summary:
      "A comprehensive breakdown of rental income tax declarations, VAT rules, and local tourism taxes.",
    content:
      "Tax regulations vary by municipality and rental duration. Consult local guidelines for tax deductions on maintenance expenses and mortgage interest.",
    status: "published",
    createdAt: "2026-08-10",
  },
  {
    id: "art-4",
    title: "Understanding Your Rights: Tenant Protection Explained",
    targetRole: "tenant",
    category: "Tenant Rights",
    readTime: "6 min read",
    summary:
      "What happens if your landlord raises rent or requests early move-out? Know your legal safeguards.",
    content:
      "Tenant laws protect renters against unfair eviction and unannounced rent hikes. Always ensure your rental agreement specifies exact notice periods and deposit refund terms.",
    status: "published",
    createdAt: "2026-08-05",
  },
];

const BLOGS_KEY = "ezzy_dynamic_blogs";
const ARTICLES_KEY = "ezzy_dynamic_articles";

export function getStoredBlogs(): BlogPost[] {
  try {
    const raw = localStorage.getItem(BLOGS_KEY);
    if (!raw) {
      localStorage.setItem(BLOGS_KEY, JSON.stringify(DEFAULT_BLOGS));
      return DEFAULT_BLOGS;
    }
    return JSON.parse(raw) as BlogPost[];
  } catch (e) {
    return DEFAULT_BLOGS;
  }
}

export function saveStoredBlogs(blogs: BlogPost[]) {
  try {
    localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
    window.dispatchEvent(new Event("ezzy_content_updated"));
  } catch (e) {
    console.error("Failed to save blogs", e);
  }
}

export function getStoredArticles(): ArticleGuide[] {
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (!raw) {
      localStorage.setItem(ARTICLES_KEY, JSON.stringify(DEFAULT_ARTICLES));
      return DEFAULT_ARTICLES;
    }
    return JSON.parse(raw) as ArticleGuide[];
  } catch (e) {
    return DEFAULT_ARTICLES;
  }
}

export function saveStoredArticles(articles: ArticleGuide[]) {
  try {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
    window.dispatchEvent(new Event("ezzy_content_updated"));
  } catch (e) {
    console.error("Failed to save articles", e);
  }
}
