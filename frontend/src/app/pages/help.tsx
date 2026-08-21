import { Header } from "../components/header";
import { useAuth } from "../contexts/auth-context";
import { Footer } from "../components/footer";
import { Search, MessageCircle, UserRound, ShieldCheck, Lock, CreditCard, House, Gift, AlertTriangle, ChevronRight, ChevronLeft, X, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router";

type HelpCategory = {
  label: string;
  icon: typeof UserRound;
};

const HELP_CATEGORIES: HelpCategory[] = [
  { label: "Account", icon: UserRound },
  { label: "Privacy", icon: ShieldCheck },
  { label: "Security", icon: Lock },
  { label: "Refunds & Charges", icon: CreditCard },
  { label: "Vacation Rentals", icon: House },
  { label: "Loyalty & Rewards", icon: Gift },
  { label: "Travel Alerts", icon: AlertTriangle },
];

const HELP_DATA: Record<string, {
  topics: Array<{
    title: string;
    description: string;
    steps?: string[];
    extra?: string;
  }>;
}> = {
  "Account": {
    topics: [
      {
        title: "Correct or update your account information",
        description: "You can keep your login information, payment methods, and email preferences up to date on our website or in our app.",
        steps: [
          "On our website, sign in to your account and select your name. Select Account or Profile, and then use the tabs on the left to find what you want to update.",
          "If you're using our app, select Account or Profile in the bottom navigation bar."
        ],
        extra: "If you don't have an account or need help correcting or updating your personal information, please contact us."
      },
      {
        title: "Sign in to your account",
        description: "Sign in to access your bookings, messages with landlords, applications, and saved lists.",
        steps: [
          "Click 'Log in' at the top-right corner of the page.",
          "Enter your registered email address and password, or use Google / Apple login.",
          "Click the blue Sign In button to verify your credentials."
        ],
        extra: "If you forgot your password, use the 'Forgot Password' link to request a reset link via email."
      },
      {
        title: "Delete your account",
        description: "If you wish to permanently delete your account and all associated personal data from our platform:",
        steps: [
          "Go to Account settings and scroll to the bottom section.",
          "Select 'Delete account' and follow the confirmation prompts.",
          "Once completed, your account cannot be recovered and active reservations will be cancelled."
        ],
        extra: "Please contact support if you need assistance with pending refund payouts before account closure."
      },
      {
        title: "Unsubscribe from marketing emails, SMS and push notifications",
        description: "You can manage your notification preferences at any time to control which communications you receive.",
        steps: [
          "Navigate to Account Settings > Notifications.",
          "Toggle off marketing, recommendations, or SMS alerts based on your preferences.",
          "Click Save changes to update your profile preferences."
        ],
        extra: "Transactional notifications regarding active applications or bookings cannot be disabled."
      }
    ]
  },
  "Privacy": {
    topics: [
      {
        title: "Correct or update your account information",
        description: "You can keep your login information, payment methods, and email preferences up to date on our website or in our app.",
        steps: [
          "On our website, sign in to your account and select your name. Select Account or Profile, and then use the tabs on the left to find what you want to update.",
          "If you're using our app, select Account or Profile in the bottom navigation bar."
        ],
        extra: "If you don't have an account or need help correcting or updating your personal information, please contact us."
      },
      {
        title: "Information about your privacy",
        description: "We are committed to protecting your privacy. This guide outlines how we collect, use, and safe-keep your personal details.",
        steps: [
          "We process personal data to verify landlord and tenant profiles, manage secure rental payments, and facilitate trusted chat communications.",
          "We use standard industry encryption protocols and hold all files securely on European server infrastructures."
        ],
        extra: "For further details, you can review our complete privacy guidelines from the account portal."
      },
      {
        title: "What privacy and data subject rights are available?",
        description: "Under the General Data Protection Regulation (GDPR) and other international standards, you hold specific rights over your personal data.",
        steps: [
          "Right of Access: You can request details and copies of all personal information we store about you.",
          "Right to Rectification: You can ask us to correct or edit any outdated or incorrect details.",
          "Right to Portability: Transfer your data easily to other platforms."
        ],
        extra: "Please submit a request to our data protection team if you wish to exercise any of these subject rights."
      },
      {
        title: "Use of surveillance policy",
        description: "To ensure safety while respecting tenant privacy, we enforce strict rules regarding surveillance and safety devices.",
        steps: [
          "Landlords are required to fully disclose the presence and location of any surveillance devices in the property description before booking.",
          "Surveillance cameras or monitoring devices are strictly prohibited in private areas such as bedrooms and bathrooms."
        ],
        extra: "If you notice an undisclosed camera in a property, please report it to our trust and safety team immediately."
      },
      {
        title: "Manage the use of your personal data for direct marketing",
        description: "You have complete control over whether your personal data is utilized for direct marketing and promotions.",
        steps: [
          "Navigate to Account Settings > Privacy preferences.",
          "Toggle off marketing communications and personalized recommendations.",
          "Click Save to instantly apply your new settings."
        ]
      },
      {
        title: "Request or delete your personal data",
        description: "You have the right to request a complete export of your personal data archive, or request permanent deletion of your account.",
        steps: [
          "Go to Settings > Data Privacy to download a backup copy of your data.",
          "If you decide to delete your account, click 'Delete account' to permanently erase all records."
        ],
        extra: "Note: Permanent data deletion is irreversible and will cancel any active tenant bookings."
      },
      {
        title: "Unsubscribe from marketing emails, SMS and push notifications",
        description: "You can manage your notification preferences at any time to control which communications you receive.",
        steps: [
          "Navigate to Account Settings > Notifications.",
          "Toggle off marketing, recommendations, or SMS alerts based on your preferences.",
          "Click Save changes to update your profile preferences."
        ],
        extra: "Transactional notifications regarding active applications or bookings cannot be disabled."
      },
      {
        title: "Other questions and concerns about your personal data",
        description: "If you have any other custom data queries or specific privacy concerns, please contact our data privacy officer.",
        extra: "You can send an email query to our support team at any time."
      }
    ]
  },
  "Security": {
    topics: [
      {
        title: "Payment security",
        description: "All payments made through our secure checkout are encrypted and processed by industry-leading secure payment gateways.",
        steps: [
          "Always pay through our official checkout system using credit card, direct bank transfer, or other verified methods.",
          "We hold your first month's rent in escrow for 48 hours after your move-in date before releasing it to the landlord."
        ],
        extra: "If a landlord requests payment outside the platform (Western Union, direct bank wire), please report it to us immediately."
      },
      {
        title: "About weapons at a property",
        description: "Our policy strictly prohibits the presence of weapons or dangerous devices in any listing property to ensure guest safety.",
        steps: [
          "All weapons must be declared in advance by the host and secured safely in locked compartments.",
          "Violation of this policy will result in immediate booking cancellation and account suspension."
        ]
      },
      {
        title: "Report a concern about a ReserveHousing property",
        description: "If you notice health hazards, unsafe conditions, or listing mismatches at a property, let our support team know.",
        steps: [
          "Navigate to the property listing page.",
          "Click the 'Report Listing' button.",
          "Provide details and upload photos if necessary to help our trust and safety team investigate."
        ]
      },
      {
        title: "Natural disaster impacts booking",
        description: "In the event of a natural disaster, severe weather conditions, or local emergencies impacting your check-in:",
        steps: [
          "Review our Extenuating Circumstances cancellation policy.",
          "Contact your host to discuss safety options or check if check-in is delayed.",
          "Reach out to our customer support team to request a booking cancellation or relocation."
        ]
      },
      {
        title: "Use of surveillance policy",
        description: "To ensure safety while respecting tenant privacy, we enforce strict rules regarding surveillance and safety devices.",
        steps: [
          "Landlords are required to fully disclose the presence and location of any surveillance devices in the property description before booking.",
          "Surveillance cameras or monitoring devices are strictly prohibited in private areas such as bedrooms and bathrooms."
        ],
        extra: "If you notice an undisclosed camera in a property, please report it to our trust and safety team immediately."
      },
      {
        title: "ReserveHousing's approach to reviews and review manipulation",
        description: "Reviews are critical to maintaining trust. We enforce strict policies against fake reviews, extortion, and manipulation.",
        steps: [
          "Only tenants who have booked and stayed at a property can write reviews.",
          "Hosts are strictly prohibited from offering discounts or cash incentives in exchange for positive ratings.",
          "We automatically scan and remove reviews that violate our community standards."
        ]
      },
      {
        title: "About two-factor authentication",
        description: "Add an extra layer of protection to your ReserveHousing account to prevent unauthorized access.",
        steps: [
          "Go to Account settings > Security.",
          "Click 'Enable Two-Factor Authentication'.",
          "Scan the QR code using Google Authenticator, Duo, or another TOTP application."
        ]
      },
      {
        title: "Beware of email scams (phishing)",
        description: "Phishing emails try to mimic official ReserveHousing emails to steal your password or credit card details.",
        steps: [
          "Always check the sender email address. Official emails only come from @reservehousing.com domains.",
          "Never click links that prompt you to enter passwords or credit cards on unofficial domains."
        ]
      },
      {
        title: "Beware of phone call scams",
        description: "Scammers may call posing as support agents or hosts asking for payment details or immediate transfers.",
        steps: [
          "ReserveHousing support agents will never ask for your password or full credit card numbers over the phone.",
          "Never authorize bank transfers based on a phone call. All transactions should be handled in the online portal."
        ]
      },
      {
        title: "Property safety tips",
        description: "Ensure your safety and check the basic security systems when arriving at a new rental property.",
        steps: [
          "Locate emergency exits, smoke detectors, and carbon monoxide alarms.",
          "Ensure door and window locks work properly before leaving the property.",
          "Keep contact information for local emergency services handy."
        ]
      },
      {
        title: "Beware of fraud attempts",
        description: "Recognize common red flags of fraudulent landlords and stay protected.",
        steps: [
          "Be skeptical of listings with prices far below market value.",
          "Never agree to landlord demands to chat or transfer money outside of the ReserveHousing platform.",
          "Report any requests to pay via gift cards, wire transfers, or cryptocurrency."
        ]
      }
    ]
  },
  "Refunds & Charges": {
    topics: [
      {
        title: "Payment security",
        description: "All payments made through our secure checkout are encrypted and processed by industry-leading secure payment gateways.",
        steps: [
          "Always pay through our official checkout system using credit card, direct bank transfer, or other verified methods.",
          "We hold your first month's rent in escrow for 48 hours after your move-in date before releasing it to the landlord."
        ],
        extra: "If a landlord requests payment outside the platform, please report it to us immediately."
      },
      {
        title: "Failed transactions and split payments",
        description: "If your transaction failed, it could be due to card limits, bank security blocks, or insufficient funds.",
        steps: [
          "Check your bank's daily transaction limit or contact them to authorize our payment gateway.",
          "We support split payments for long-term lease bookings to make payments more manageable."
        ]
      },
      {
        title: "Download the service fee invoice",
        description: "You can download your official ReserveHousing service fee invoice directly from your profile portal.",
        steps: [
          "Go to Account settings > Bookings.",
          "Select the booking you need the invoice for.",
          "Click 'Download service fee invoice' to download it as a PDF."
        ]
      },
      {
        title: "Cancel a reservation and receive a refund",
        description: "Cancellation terms are defined by the host's policy selected during listing creation.",
        steps: [
          "Go to your booking overview page.",
          "Click 'Cancel booking'.",
          "The refund amount will be automatically calculated based on the policy rules."
        ]
      },
      {
        title: "Get your refund status",
        description: "Track the status of your processing refund after cancellation or booking rejection.",
        steps: [
          "Card refunds take 5 to 10 business days to appear on your bank statement.",
          "Bank transfer payouts are processed within 3 days."
        ]
      },
      {
        title: "Book online and pay securely",
        description: "Our payment protection holds all booking funds safely in escrow to protect both tenants and landlords.",
        steps: [
          "Search for verified properties and click 'Book Now'.",
          "Fill in your tenant details and payment details.",
          "Payment is only charged after the landlord accepts your reservation."
        ]
      },
      {
        title: "About Affirm flexible payment options",
        description: "We partner with Affirm to offer flexible payment plans allowing you to spread rental costs over time.",
        steps: [
          "Select Affirm as your payment method during checkout.",
          "Choose your payment schedule (3, 6, or 12 monthly payments).",
          "Complete a quick application to see your personalized interest rates and terms."
        ]
      },
      {
        title: "About failed final payments",
        description: "If a subsequent monthly rent payment fails, your booking status might be impacted.",
        steps: [
          "You will receive an automated email notifying you of the payment failure.",
          "Update your payment method or retry the transaction within 48 hours to prevent booking cancellation."
        ]
      },
      {
        title: "About the service fee",
        description: "The service fee helps us run our platform, verify listings, and offer 24/7 tenant protection support.",
        steps: [
          "The fee is a small percentage of your booking value, charged only when a reservation is confirmed.",
          "It is fully refunded if the landlord rejects your application or cancels the stay."
        ]
      },
      {
        title: "About damage deposits",
        description: "Hosts may request a refundable damage deposit to cover potential issues during your lease stay.",
        steps: [
          "The damage deposit is held securely and fully refunded within 14 days of checkout, minus any damage claims.",
          "All deposit claims must be accompanied by photos and repair cost documentation."
        ]
      },
      {
        title: "Redeem your ReserveHousing gift card",
        description: "Apply your gift card balance to reduce the total amount due during your next checkout booking.",
        steps: [
          "Go to Checkout > Payment details.",
          "Select 'Add promo code or gift card'.",
          "Enter your code and click Apply to see the discount deducted from your balance."
        ]
      },
      {
        title: "About my card on file and property damage charges",
        description: "Your card details are kept securely on file to cover authorized damage claims according to our policies.",
        steps: [
          "Hosts have up to 14 days after checkout to report property damage.",
          "We will notify you and request verification before charging your card for any damage claims."
        ]
      },
      {
        title: "How ReserveHousing shows up on a bank statement",
        description: "When reviewing your bank statement, transactions processed by us are clearly labeled.",
        steps: [
          "Most card transactions will show as 'RESERVEHOUSING* [City Name]'.",
          "Bank transfer receipts will list our legal payment beneficiary name."
        ]
      }
    ]
  },
  "Vacation Rentals": {
    topics: [
      {
        title: "About Secret Escapes",
        description: "Explore our curated list of unique handpicked escapes, premium retreats, and boutique listings.",
        steps: [
          "Navigate to the 'Secret Escapes' tag or filter option on our homepage search.",
          "Enjoy premium guest amenities and dedicated concierge service included with these listings."
        ]
      },
      {
        title: "Cancellation policies",
        description: "Each listing has a specific cancellation policy chosen by the landlord, which determines your refund eligibility.",
        steps: [
          "Flexible: Full refund up to 14 days before move-in.",
          "Moderate: Full refund up to 30 days before move-in.",
          "Strict: Non-refundable service fee, rent refund depends on replacement tenant search."
        ]
      },
      {
        title: "Trouble checking in to a property after support hours",
        description: "If you experience trouble arriving at a property after hours, follow these critical steps:",
        steps: [
          "Call or message your host directly using the contact details in your booking confirmation.",
          "Check the check-in instructions for smart-lock codes or lockbox keys.",
          "If you cannot contact the host, email or message our emergency night support desk."
        ]
      },
      {
        title: "About ReserveCare™",
        description: "ReserveCare™ is our premium safety and relocation guarantee included with eligible vacation rental bookings.",
        steps: [
          "In the rare event of listing mismatches or host check-in failure, we will relocate you to a similar property.",
          "Coverage is active starting 24 hours before your scheduled check-in time."
        ]
      },
      {
        title: "Write a review about your rental experience",
        description: "Share feedback about the property condition, accuracy, and host communication after your stay.",
        steps: [
          "You will receive an email invitation to review the listing 1 day after check-out.",
          "Provide star ratings and write comments on your stay experience.",
          "Submit your review to help future traveler search."
        ]
      },
      {
        title: "Edit or cancel a damage claim",
        description: "If a landlord files a property damage claim, you can review, accept, dispute, or negotiate the claim.",
        steps: [
          "Navigate to the resolution center link in your notification email.",
          "Submit counter-evidence, photos, or agree to settle the claim fee.",
          "Contact support if you need mediation assistance."
        ]
      },
      {
        title: "Change your reservation",
        description: "Request dates extension, shorten stays, or update guest numbers for confirmed bookings.",
        steps: [
          "Go to Bookings overview and select your reservation card.",
          "Click 'Change reservation dates/guests'.",
          "Submit your request. The landlord has 48 hours to accept or decline the requested changes."
        ]
      },
      {
        title: "Create, delete, and manage your Saved Listings",
        description: "Save lists of properties you love to organize your trip search and share them with friends.",
        steps: [
          "Click the Heart icon on any listing thumbnail card to save it.",
          "Create custom list folders (e.g. 'Amsterdam Summer').",
          "Remove listings by untoggling the heart icon."
        ]
      },
      {
        title: "About your vacation rental reservation",
        description: "Overview details on what is included, check-in timelines, and house guidelines.",
        steps: [
          "Review the booking confirmation PDF emailed to you.",
          "Verify included amenities (Wi-Fi details, bed linen, utility caps) from the details panel."
        ]
      },
      {
        title: "About travel insurance",
        description: "Optional trip cancellation and medical coverage plans designed specifically for lease protection.",
        steps: [
          "You can purchase travel insurance during checkout or via our partner links.",
          "Covers medical emergencies, sudden cancellations, or luggage loss."
        ]
      },
      {
        title: "Invite others to your Saved Listings",
        description: "Collaborate on trip planning by inviting friends or family to view and vote on your saved properties.",
        steps: [
          "Open your saved lists from your profile settings.",
          "Click 'Share' or 'Invite collaborators'.",
          "Enter their email addresses or copy the direct sharing link."
        ]
      },
      {
        title: "Book online and pay securely",
        description: "Our payment protection holds all booking funds safely in escrow to protect both tenants and landlords.",
        steps: [
          "Search for verified properties and click 'Book Now'.",
          "Fill in your tenant details and payment details.",
          "Payment is only charged after the landlord accepts your reservation."
        ]
      },
      {
        title: "Extenuating Circumstances Policy",
        description: "Guidance on cancellation refunds for emergency situations, government travel bans, or natural disasters.",
        steps: [
          "Submit supporting documents (medical certificates, government notices) to verify your circumstance.",
          "Our trust and safety team will review claims within 24 hours to process full service fee refunds."
        ]
      },
      {
        title: "About Accidental Damage Protection",
        description: "Protection plan to cover minor accidental damage that might occur during your rental stay.",
        steps: [
          "Covers accidental spills, broken kitchenware, or minor wall scuffs.",
          "Filing claims is managed directly inside your booking resolution portal."
        ]
      },
      {
        title: "About the service animal policy",
        description: "We are committed to accessibility, requiring all hosts to accommodate service animals without extra pet deposits.",
        steps: [
          "Hosts cannot refuse bookings or charge extra cleaning fees for verified service animals.",
          "Guests must notify hosts of service animals in advance out of courtesy."
        ]
      },
      {
        title: "View your check-in details",
        description: "Access door codes, key retrieval instructions, check-in window times, and property coordinates.",
        steps: [
          "Sign in to your profile and click 'Bookings'.",
          "Click 'Check-in instructions' inside your active reservation card.",
          "Details become available exactly 7 days before your arrival date."
        ]
      },
      {
        title: "Property not as described",
        description: "If you arrive and find severe discrepancies between the listing details and the physical property:",
        steps: [
          "Report the issue to us within 48 hours of move-in.",
          "Provide photo and video evidence showing the mismatches.",
          "We will withhold payment from the host and assist in relocation or refund processing."
        ]
      },
      {
        title: "Rental listing no longer visible on site",
        description: "If a property you saved or applied to is no longer showing up in search results:",
        steps: [
          "This usually means the property has been fully booked for those dates or is temporarily deactivated by the host.",
          "Confirmed bookings are unaffected even if the listing is deactivated."
        ]
      },
      {
        title: "Submit a property review",
        description: "Share feedback about the property condition, accuracy, and host communication after your stay.",
        steps: [
          "You will receive an email invitation to review the listing 1 day after check-out.",
          "Provide star ratings and write comments on your stay experience.",
          "Submit your review to help future traveler search."
        ]
      },
      {
        title: "View reservation receipt",
        description: "Retrieve complete tax invoices and billing receipts detailing rent, taxes, and service fees paid.",
        steps: [
          "Go to Bookings dashboard.",
          "Select the reservation and click 'View payment receipt'.",
          "Download or print the receipt page for your records."
        ]
      },
      {
        title: "Contact a host",
        description: "Send inquiries to hosts regarding property details, custom rental dates, or check-in coordination.",
        steps: [
          "On the listing page, click 'Contact host'.",
          "Enter your questions and proposed lease dates.",
          "Use the platform chat interface to communicate safely."
        ]
      },
      {
        title: "Locate a booking request response",
        description: "Check the status of pending booking applications submitted to hosts.",
        steps: [
          "You will receive email and push notifications immediately when a host replies.",
          "Open your inbox to view messages or complete payment once approved."
        ]
      }
    ]
  },
  "Loyalty & Rewards": {
    topics: [
      {
        title: "One Key Credit Cards",
        description: "Earn reward points and OneKeyCash faster on everyday purchases and bookings with the One Key Credit Card.",
        steps: [
          "Apply online through the One Key Rewards portal.",
          "Receive instant bonus points upon card approval and first purchase.",
          "Enjoy automatic tier upgrades and no foreign transaction fees."
        ]
      },
      {
        title: "View and claim missing OneKeyCash and trip elements",
        description: "If a past booking or reward is not showing up in your account balance, you can claim it manually.",
        steps: [
          "Go to Rewards > Claim Missing Rewards.",
          "Enter your booking confirmation code and checkout date.",
          "Submit your claim request. The balance will be reviewed and updated within 5 business days."
        ]
      },
      {
        title: "Earn One Key tiers",
        description: "Unlock premium rewards, free room upgrades, and priority customer service as you move up tiers.",
        steps: [
          "Blue Tier: Entry level when you register an account.",
          "Silver Tier: Complete 5 trip elements in a calendar year.",
          "Gold & Platinum Tiers: Achieve higher booking counts to unlock maximum privileges."
        ]
      },
      {
        title: "Earn and use OneKeyCash",
        description: "OneKeyCash is our easy rewards currency that you can spend like real cash on eligible property bookings.",
        steps: [
          "Earn 2% or more back in OneKeyCash on every eligible checkout booking.",
          "Apply your accrued OneKeyCash balance at checkout to discount your booking total."
        ]
      },
      {
        title: "What is One Key?",
        description: "One Key is our unified loyalty program designed to reward you across all your travels and accommodation bookings.",
        steps: [
          "It is completely free to join and automatically active upon registration.",
          "Earn and spend rewards seamlessly across all our affiliate rental and vacation platforms."
        ]
      }
    ]
  },
  "Travel Alerts": {
    topics: [
      {
        title: "Travel disruptions",
        description: "Get real-time updates and emergency notifications regarding municipal safety announcements, transit strikes, and severe weather warnings.",
        steps: [
          "Check local government alerts and travel safety advisories daily.",
          "Coordinate directly with your host if transport delays will impact your scheduled arrival time."
        ],
        extra: "If your stay is heavily impacted by an emergency, you may qualify for cancellation protection under our Extenuating Circumstances Policy."
      }
    ]
  }
};

export function Help() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{
    title: string;
    description: string;
    steps?: string[];
    extra?: string;
  } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [helpfulFeedback, setHelpfulFeedback] = useState<"up" | "down" | null>(null);

  // Search Modal States
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResultQuery, setSearchResultQuery] = useState("");

  // Chat Bot States
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "bot" | "user"; text: string; timestamp: Date }>>([
    {
      sender: "bot",
      text: "Hello! I am your ReserveHousing virtual assistant. How can I help you today?",
      timestamp: new Date()
    }
  ]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const queryFromUrl = new URLSearchParams(location.search).get("q");
    if (queryFromUrl !== null) {
      setSearchQuery(queryFromUrl);
    }
  }, [location.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchResultQuery(searchQuery);
      setIsSearchModalOpen(true);
    }
  };

  const getSearchResults = () => {
    if (!searchResultQuery.trim()) return [];
    const normalized = searchResultQuery.toLowerCase().trim();
    const results: Array<{
      category: string;
      topic: {
        title: string;
        description: string;
        steps?: string[];
        extra?: string;
      };
    }> = [];

    Object.entries(HELP_DATA).forEach(([category, data]) => {
      data.topics.forEach((topic) => {
        const matchString = `${category} ${topic.title} ${topic.description} ${(topic.steps || []).join(" ")}`.toLowerCase();
        if (matchString.includes(normalized)) {
          results.push({ category, topic });
        }
      });
    });

    return results;
  };

  const searchResults = getSearchResults();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = {
      sender: "user" as const,
      text: chatInput,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    const normalizedInput = chatInput.toLowerCase().trim();
    setChatInput("");

    setTimeout(() => {
      let botResponse = "I'm sorry, I couldn't find a direct answer to that. Try asking about things like 'payment security', 'refunds', 'two-factor authentication', 'surveillance cameras', or contact our human support team.";
      
      let bestMatch: { title: string; description: string; steps?: string[]; extra?: string; } | null = null;
      let highestMatchCount = 0;

      Object.values(HELP_DATA).forEach((categoryData) => {
        categoryData.topics.forEach((topic) => {
          const keywords = `${topic.title} ${topic.description} ${(topic.steps || []).join(" ")}`.toLowerCase();
          const words = normalizedInput.split(/\s+/);
          let matchCount = 0;
          words.forEach((word) => {
            if (word.length > 2 && keywords.includes(word)) {
              matchCount++;
            }
          });
          if (matchCount > highestMatchCount) {
            highestMatchCount = matchCount;
            bestMatch = topic;
          }
        });
      });

      if (bestMatch && highestMatchCount > 0) {
        const matchTopic = bestMatch as { title: string; description: string; steps?: string[]; extra?: string; };
        let textResponse = `${matchTopic.description}`;
        if (matchTopic.steps && matchTopic.steps.length > 0) {
          textResponse += `\n\nHow it works:\n` + matchTopic.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
        }
        if (matchTopic.extra) {
          textResponse += `\n\nNote: ${matchTopic.extra}`;
        }
        botResponse = textResponse;
      }

      setMessages((prev) => [...prev, {
        sender: "bot" as const,
        text: botResponse,
        timestamp: new Date()
      }]);
    }, 600);
  };

  const handleHelpFloatClick = () => {
    if (!isAuthenticated) {
      setIsAuthPromptOpen(true);
    } else {
      setIsChatBotOpen(!isChatBotOpen);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedTopic(null);
    setHelpfulFeedback(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedCategory(null);
      setSelectedTopic(null);
      setHelpfulFeedback(null);
    }, 300);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setHelpfulFeedback(null);
  };

  return (
    <div className="min-h-screen bg-white relative pb-[120px]">
      <Header variant={isAuthenticated ? "dashboard" : "default"} dashboardButtonFilled={false} />

      <main className="max-w-[1440px] mx-auto px-[16px] sm:px-[32px] md:px-[64px] pt-[48px] pb-[80px]">
        {/* Title & Greeting */}
        <div className="w-full mb-[24px]">
          <h1 className="text-[#0F2D36] text-[34px] md:text-[38px] font-bold tracking-tight mb-[4px]">
            Help Center
          </h1>
          <h2 className="text-[#1F2937] text-[20px] md:text-[22px] font-semibold text-left">
            Hi, {user?.name ? user.name.split(" ")[0] : "Traveler"}
          </h2>
        </div>

        {/* Full-width Search Bar Form */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-[12px] w-full mb-[48px]">
          <label className="flex-1 flex h-[52px] items-center gap-[12px] rounded-[10px] border border-[#CBD5E1] bg-white px-[18px] shadow-sm relative">
            <Search className="h-[20px] w-[20px] flex-shrink-0 text-[#1F2937]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="How can we help?"
              aria-label="Search help topics"
              className="min-w-0 w-full bg-transparent text-[15px] font-medium text-[#1F2937] placeholder:text-[#6B6B6B] outline-none pr-[32px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-[16px] text-neutral-gray hover:text-[#1F2937] transition-colors"
                aria-label="Clear search input"
              >
                <X className="w-[16px] h-[16px] bg-[#E2E8F0] hover:bg-[#CBD5E1] rounded-full p-[2px]" />
              </button>
            )}
          </label>
          <button
            type="submit"
            className="h-[52px] px-[36px] bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-full transition-colors whitespace-nowrap text-[15px] shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Explore Help Articles Section */}
        <div className="w-full">
          <h3 className="text-[#0F2D36] text-[24px] font-bold mb-[24px] text-left">
            Explore help articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] md:gap-[20px]">
            {HELP_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.label}
                  onClick={() => handleCategoryClick(category.label)}
                  className="group flex items-center justify-between border border-[#E2E8F0] bg-white rounded-[14px] px-[20px] py-[16px] hover:bg-[#F8FAFC] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)] cursor-pointer"
                >
                  <div className="flex items-center gap-[12px]">
                    <Icon className="w-[18px] h-[18px] text-[#1F2937]" />
                    <span className="text-[#1F2937] text-[15px] font-bold">
                      {category.label}
                    </span>
                  </div>
                  <ChevronRight className="w-[18px] h-[18px] text-[#1F2937] transition-transform group-hover:translate-x-[2px]" />
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Drawer Overlay Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[140] transition-opacity duration-300"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Drawer Container Panel */}
      <div 
        className={`fixed top-0 right-0 h-screen w-full max-w-[480px] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.12)] z-[150] transition-transform duration-300 ease-in-out transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="flex items-center gap-[12px] border-b border-[#F1F5F9] px-[24px] py-[20px] shrink-0">
          <button 
            onClick={selectedTopic ? handleBackToTopics : handleCloseDrawer}
            className="w-[36px] h-[36px] border border-[#E2E8F0] rounded-full flex items-center justify-center hover:bg-[#F8FAFC] transition-colors active:scale-95 text-[#1F2937]"
            aria-label={selectedTopic ? "Back to topics" : "Close drawer"}
          >
            {selectedTopic ? (
              <ChevronLeft className="w-[18px] h-[18px]" />
            ) : (
              <X className="w-[18px] h-[18px]" />
            )}
          </button>
          <span className="text-[#1F2937] text-[18px] font-bold">
            {selectedCategory}
          </span>
        </div>

        {/* Drawer Content Area */}
        <div className="flex-1 overflow-y-auto p-[24px]">
          {selectedCategory && HELP_DATA[selectedCategory] && (
            <>
              {!selectedTopic ? (
                /* Topics List View */
                <div className="space-y-[16px]">
                  {HELP_DATA[selectedCategory].topics.map((topic) => (
                    <button
                      key={topic.title}
                      onClick={() => setSelectedTopic(topic)}
                      className="w-full text-left flex items-center justify-between border border-[#E2E8F0] bg-white rounded-[12px] px-[18px] py-[16px] hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                    >
                      <span className="text-[#2563EB] text-[15px] font-semibold leading-[1.4] pr-[8px]">
                        {topic.title}
                      </span>
                      <ChevronRight className="w-[16px] h-[16px] text-[#2563EB] shrink-0 transition-transform group-hover:translate-x-[2px]" />
                    </button>
                  ))}
                </div>
              ) : (
                /* Topic Detail View */
                <div>
                  {/* Breadcrumb path */}
                  <div className="flex items-center gap-[6px] text-[12px] font-semibold text-[#2563EB] mb-[20px] select-none">
                    <span className="cursor-pointer hover:underline" onClick={handleBackToTopics}>
                      {selectedCategory}
                    </span>
                    <span className="text-[#94A3B8]">&gt;</span>
                    <span className="text-[#6B7280] truncate max-w-[200px]">
                      {selectedTopic.title}
                    </span>
                  </div>

                  {/* Heading */}
                  <h4 className="text-[#1F2937] text-[22px] font-bold leading-[1.3] mb-[16px] text-left">
                    {selectedTopic.title}
                  </h4>

                  {/* Description */}
                  <p className="text-[#4B5563] text-[15px] leading-[1.6] mb-[24px] text-left">
                    {selectedTopic.description}
                  </p>

                  {/* Steps / Bullet list */}
                  {selectedTopic.steps && selectedTopic.steps.length > 0 && (
                    <div className="mb-[24px] text-left">
                      <h5 className="text-[#1F2937] text-[15px] font-bold mb-[12px]">
                        How it works
                      </h5>
                      <ul className="space-y-[12px] pl-[18px] list-disc text-[#4B5563] text-[14px] leading-[1.6]">
                        {selectedTopic.steps.map((step, idx) => (
                          <li key={idx} className="marker:text-[#94A3B8]">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Extra text link */}
                  {selectedTopic.extra && (
                    <div className="border-t border-[#F1F5F9] pt-[20px] mb-[32px] text-left">
                      <h5 className="text-[#1F2937] text-[15px] font-bold mb-[8px]">
                        Still need help?
                      </h5>
                      <p className="text-[#4B5563] text-[14px] leading-[1.6]">
                        {selectedTopic.extra.split("contact us")[0]}
                        <a href="mailto:support@reservehousing.com" className="text-[#2563EB] hover:underline font-semibold">
                          contact us
                        </a>
                        {selectedTopic.extra.split("contact us")[1]}
                      </p>
                    </div>
                  )}

                  {/* Rating / Feedback */}
                  <div className="border-t border-[#F1F5F9] pt-[24px] text-center flex flex-col items-center">
                    <span className="text-[#1F2937] text-[14px] font-bold mb-[12px]">
                      Was this topic helpful?
                    </span>
                    <div className="flex gap-[12px] mb-[12px]">
                      <button
                        onClick={() => setHelpfulFeedback("up")}
                        className={`w-[40px] h-[40px] border rounded-full flex items-center justify-center transition-all ${
                          helpfulFeedback === "up" 
                            ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB]" 
                            : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#4B5563]"
                        }`}
                        aria-label="Helpful"
                      >
                        <ThumbsUp className="w-[18px] h-[18px]" />
                      </button>
                      <button
                        onClick={() => setHelpfulFeedback("down")}
                        className={`w-[40px] h-[40px] border rounded-full flex items-center justify-center transition-all ${
                          helpfulFeedback === "down" 
                            ? "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]" 
                            : "border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#4B5563]"
                        }`}
                        aria-label="Not helpful"
                      >
                        <ThumbsDown className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                    {helpfulFeedback !== null && (
                      <span className="text-[#10B981] text-[14px] font-bold transition-all duration-300">
                        Thank you for your feedback!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Search Results Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-[16px] animate-fade-in">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsSearchModalOpen(false)} />

          {/* Modal Container */}
          <div className="bg-white rounded-[24px] w-full max-w-[640px] p-[32px] relative shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[210] animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute top-[24px] left-[24px] w-[36px] h-[36px] border border-[#E2E8F0] rounded-full flex items-center justify-center hover:bg-[#F8FAFC] transition-colors active:scale-95 text-[#1F2937]"
              aria-label="Close search results"
            >
              <X className="w-[18px] h-[18px]" />
            </button>

            {/* Query Title */}
            <h3 className="text-[#1F2937] text-[28px] font-bold mt-[24px] mb-[16px] text-left">
              {searchResultQuery}
            </h3>

            {/* Divider line */}
            <div className="border-t border-[#F1F5F9] mb-[20px]" />

            {/* Content Switcher */}
            {searchResults.length === 0 ? (
              /* No Results layout matching user screenshot */
              <div className="text-left">
                <h4 className="text-[#1F2937] text-[16px] font-bold mb-[8px]">
                  We couldn't find anything related to {searchResultQuery}
                </h4>
                <p className="text-[#4B5563] text-[14px] mb-[12px]">
                  Here are some things you can try:
                </p>
                <ul className="list-disc pl-[18px] text-[#4B5563] text-[14px] space-y-[6px]">
                  <li className="marker:text-[#94A3B8]">Double-check your search for typos or spelling errors</li>
                  <li className="marker:text-[#94A3B8]">Try a different search term</li>
                </ul>
              </div>
            ) : (
              /* Matching results list layout matching side drawer lists */
              <div className="text-left max-h-[300px] overflow-y-auto space-y-[12px] pr-[4px]">
                <h4 className="text-[#4B5563] text-[14px] font-semibold mb-[12px]">
                  We found {searchResults.length} topic{searchResults.length > 1 ? "s" : ""} matching your search:
                </h4>
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsSearchModalOpen(false);
                      setSelectedCategory(result.category);
                      setSelectedTopic(result.topic);
                      setHelpfulFeedback(null);
                      setIsDrawerOpen(true);
                    }}
                    className="w-full flex items-center justify-between border border-[#E2E8F0] bg-white rounded-[12px] px-[18px] py-[14px] hover:bg-[#F8FAFC] transition-colors group cursor-pointer"
                  >
                    <div className="flex flex-col gap-[2px]">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        {result.category}
                      </span>
                      <span className="text-[#2563EB] text-[15px] font-semibold leading-[1.4] pr-[8px]">
                        {result.topic.title}
                      </span>
                    </div>
                    <ChevronRight className="w-[16px] h-[16px] text-[#2563EB] shrink-0 transition-transform group-hover:translate-x-[2px]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Prompt Modal if not logged in */}
      {isAuthPromptOpen && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-[16px] animate-fade-in">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={() => setIsAuthPromptOpen(false)} />

          {/* Modal Container */}
          <div className="bg-white rounded-[24px] w-full max-w-[380px] p-[32px] text-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[210] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            {/* Circular Lock icon with soft background */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#EFF6FF] flex items-center justify-center mb-[20px]">
              <Lock className="w-[32px] h-[32px] text-[#2563EB]" />
            </div>

            <h3 className="text-[#1F2937] text-[20px] font-bold mb-[8px]">
              Please sign in
            </h3>
            <p className="text-[#6B7280] text-[14px] leading-[1.5] mb-[24px]">
              You need to sign in to access support chat assistance.
            </p>

            <Link
              to="/login"
              className="w-full h-[46px] flex items-center justify-center bg-[#0F2D36] hover:bg-[#081B20] text-white font-bold rounded-full transition-colors mb-[12px] text-[15px]"
            >
              Sign in
            </Link>
            <button
              onClick={() => setIsAuthPromptOpen(false)}
              className="text-[#6B7280] hover:text-[#1F2937] font-semibold text-[14px] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Bot Widget if logged in */}
      {isChatBotOpen && isAuthenticated && (
        <div className="fixed bottom-[90px] right-[24px] z-[100] w-[360px] h-[480px] bg-white rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#E2E8F0] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
          {/* Header */}
          <div className="bg-[#0F2D36] px-[20px] py-[16px] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-[8px]">
              <div className="w-[10px] h-[10px] rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[16px] font-bold">ReserveHousing Bot</span>
            </div>
            <button
              onClick={() => setIsChatBotOpen(false)}
              className="w-[28px] h-[28px] hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-white/80 hover:text-white"
              aria-label="Close chat assistant"
            >
              <X className="w-[16px] h-[16px]" />
            </button>
          </div>

          {/* Chat History Messages */}
          <div className="flex-1 overflow-y-auto p-[16px] space-y-[12px] bg-[#F8FAFC]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`px-[14px] py-[10px] rounded-[16px] text-[14px] leading-[1.4] whitespace-pre-line text-left ${
                    msg.sender === "user"
                      ? "bg-[#0F2D36] text-white rounded-tr-none"
                      : "bg-[#E2E8F0] text-[#1F2937] rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#94A3B8] mt-[3px] px-[4px]">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSendMessage} className="border-t border-[#E2E8F0] p-[12px] bg-white flex gap-[8px] items-center shrink-0">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 min-w-0 bg-[#F1F5F9] rounded-full px-[16px] py-[8px] text-[14px] text-[#1F2937] placeholder:text-[#94A3B8] outline-none border border-transparent focus:border-[#0F2D36]/40 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="w-[36px] h-[36px] bg-[#0F2D36] hover:bg-[#081B20] disabled:bg-[#94A3B8]/40 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors active:scale-95 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-[16px] h-[16px]" />
            </button>
          </form>
        </div>
      )}

      {/* Floating help widget bottom right */}
      <button
        onClick={handleHelpFloatClick}
        className="fixed bottom-[24px] right-[24px] bg-white border border-[#E2E8F0] shadow-[0_6px_20px_rgba(0,0,0,0.08)] rounded-full px-[20px] py-[10px] flex items-center gap-[8px] hover:bg-[#F8FAFC] transition-all z-[90] active:scale-95"
      >
        <MessageCircle className="w-[18px] h-[18px] text-[#2563EB]" />
        <span className="text-[#1F2937] text-[14px] font-bold">Help</span>
      </button>

      <Footer variant={isAuthenticated ? "dashboard" : "default"} />
    </div>
  );
}