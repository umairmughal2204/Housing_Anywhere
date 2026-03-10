import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { ChevronLeft, Send, Paperclip, Info, Shield, Check, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import propertyImage from "../../assets/2db5a7303bce6c3d85b53a7866c4838e88cb5e61.png";
import { DatePicker } from "../components/date-picker";

export function TenantConversation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "landlord",
      text: "Hi! Thanks for your interest in my property. I'd be happy to answer any questions you have.",
      timestamp: "10 minutes ago",
      senderName: "Serdal"
    },
    {
      id: 2,
      sender: "tenant",
      text: "Hi, I'm interested in renting your place. I'd love to connect, and hope to hear from you soon.",
      timestamp: "5 minutes ago",
      senderName: "You"
    }
  ]);

  // Dropdown states
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Date picker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [moveInDate, setMoveInDate] = useState<Date | null>(new Date(2026, 2, 14)); // March 14, 2026
  const [moveOutDate, setMoveOutDate] = useState<Date | null>(new Date(2026, 5, 1)); // June 1, 2026

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "tenant",
          text: message,
          timestamp: "Just now",
          senderName: "You"
        }
      ]);
      setMessage("");
    }
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setMoveInDate(start);
    setMoveOutDate(end);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const calculateRentalPeriod = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "N/A";
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-dropdown') && !target.closest('.user-menu-dropdown')) {
        setIsLanguageOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-[rgba(0,0,0,0.08)] bg-white sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[16px] flex items-center justify-between">
          <button
            onClick={() => navigate("/tenant/inbox")}
            className="flex items-center gap-[8px] text-neutral-black hover:text-brand-primary transition-colors"
          >
            <ChevronLeft className="w-[16px] h-[16px]" />
            <span className="text-[14px] font-semibold">Back</span>
          </button>

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

          <div className="flex items-center gap-[16px]">
            {/* Language Dropdown */}
            <div className="relative language-dropdown">
              <button
                onClick={() => {
                  setIsLanguageOpen(!isLanguageOpen);
                  setIsUserMenuOpen(false);
                }}
                className="w-[40px] h-[40px] bg-neutral-light-gray rounded-full flex items-center justify-center hover:bg-neutral transition-colors"
              >
                <span className="text-neutral-black text-[14px] font-bold">
                  {selectedLanguage === "English" ? "EN" : 
                   selectedLanguage === "Español" ? "ES" :
                   selectedLanguage === "Français" ? "FR" :
                   selectedLanguage === "Deutsch" ? "DE" :
                   selectedLanguage === "Italiano" ? "IT" :
                   selectedLanguage === "Nederlands" ? "NL" :
                   selectedLanguage === "Português" ? "PT" :
                   selectedLanguage === "Polski" ? "PL" :
                   selectedLanguage === "Türkçe" ? "TR" :
                   selectedLanguage === "中文" ? "ZH" :
                   selectedLanguage === "日本語" ? "JA" :
                   selectedLanguage === "한국어" ? "KO" : "EN"}
                </span>
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 top-[48px] bg-white border border-neutral shadow-lg min-w-[160px] z-50">
                  {["English", "Español", "Français", "Deutsch", "Italiano", "Nederlands", "Português", "Polski", "Türkçe", "中文", "日本語", "한국어"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] hover:bg-neutral-light-gray transition-colors ${
                        selectedLanguage === lang ? "bg-neutral-light-gray font-semibold text-brand-primary" : "text-neutral-black"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative user-menu-dropdown">
              <button
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsLanguageOpen(false);
                }}
                className="w-[40px] h-[40px] bg-brand-primary rounded-full flex items-center justify-center hover:bg-brand-primary-dark transition-colors"
              >
                <span className="text-white text-[14px] font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-[48px] bg-white border border-neutral shadow-lg min-w-[200px] z-50">
                  <div className="px-[16px] py-[12px] border-b border-neutral">
                    <p className="text-neutral-black text-[14px] font-bold">{user?.name || "User"}</p>
                    <p className="text-neutral-gray text-[12px]">{user?.email || "user@example.com"}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/account");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <User className="w-[16px] h-[16px]" />
                    My Account
                  </button>
                  <button
                    onClick={() => {
                      navigate("/favorites");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <Check className="w-[16px] h-[16px]" />
                    My Favorites
                  </button>
                  <button
                    onClick={() => {
                      navigate("/tenant/inbox");
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                  >
                    <Info className="w-[16px] h-[16px]" />
                    My Messages
                  </button>
                  <div className="border-t border-neutral">
                    <button
                      onClick={() => {
                        logout();
                        navigate("/login");
                      }}
                      className="w-full px-[16px] py-[12px] text-left text-[14px] text-neutral-black hover:bg-neutral-light-gray transition-colors flex items-center gap-[8px]"
                    >
                      <LogOut className="w-[16px] h-[16px]" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)]">
        <div className="max-w-[1440px] mx-auto px-[32px] py-[24px]">
          <div className="flex items-center justify-between max-w-[600px]">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-[40px] h-[40px] bg-brand-primary rounded-full flex items-center justify-center mb-[8px]">
                <Check className="w-[20px] h-[20px] text-white" />
              </div>
              <span className="text-neutral-black text-[13px] font-semibold">Send message</span>
            </div>

            <div className="flex-1 h-[2px] bg-[rgba(0,0,0,0.08)] mx-[16px]"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-[40px] h-[40px] bg-brand-primary rounded-full flex items-center justify-center mb-[8px]">
                <span className="text-white text-[16px] font-bold">2</span>
              </div>
              <span className="text-neutral-black text-[13px] font-semibold">Apply to rent</span>
            </div>

            <div className="flex-1 h-[2px] bg-[rgba(0,0,0,0.08)] mx-[16px]"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-[40px] h-[40px] bg-white border-[2px] border-[rgba(0,0,0,0.08)] rounded-full flex items-center justify-center mb-[8px]">
                <span className="text-neutral-gray text-[16px] font-bold">3</span>
              </div>
              <span className="text-neutral-gray text-[13px] font-semibold">Receive confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-[32px] py-[32px]">
        <div className="flex gap-[32px]">
          {/* Left Column - Chat */}
          <div className="flex-[2]">
            {/* Call to Action Banner */}
            <div className="bg-neutral-light-gray border border-[rgba(0,0,0,0.08)] p-[24px] mb-[24px]">
              <h2 className="text-neutral-black text-[20px] font-bold mb-[12px]">
                Want to call this place home?
              </h2>
              <p className="text-neutral-gray text-[14px] leading-[1.6] mb-[16px]">
                When you've completed your due diligence and you're ready to rent, complete an application. You'll be the
                first to know if you're approved and you can book this place.
              </p>
              <div className="flex items-center gap-[16px]">
                <button
                  onClick={() => setIsDatePickerOpen(true)}
                  className="border-[2px] border-neutral-black text-neutral-black px-[32px] py-[12px] font-bold hover:bg-neutral-black hover:text-white transition-colors"
                >Edit Stay Days</button>
                <button
                  onClick={() => navigate(`/property/${id}/payment`)}
                  className="bg-brand-primary text-white px-[32px] py-[12px] font-bold hover:bg-brand-primary-dark transition-colors"
                >
                  Proceed to payment
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="border border-[rgba(0,0,0,0.08)] rounded-[4px] overflow-hidden">
              {/* Message Header */}
              <div className="bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)] px-[24px] py-[16px]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[40px] h-[40px] bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-white text-[16px] font-bold">S</span>
                  </div>
                  <div>
                    <h3 className="text-neutral-black text-[16px] font-bold">Serdal</h3>
                    <div className="flex items-center gap-[6px]">
                      <div className="w-[8px] h-[8px] bg-accent-blue rounded-full"></div>
                      <span className="text-accent-blue text-[13px] font-semibold">Usually replies fast</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="p-[24px] bg-white min-h-[400px] max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`mb-[24px] flex ${msg.sender === "tenant" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] ${msg.sender === "tenant" ? "items-end" : "items-start"} flex flex-col`}>
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <span className="text-[#6B6B6B] text-[12px] font-semibold">{msg.senderName}</span>
                        <span className="text-[#6B6B6B] text-[12px]">•</span>
                        <span className="text-[#6B6B6B] text-[12px]">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`px-[16px] py-[12px] rounded-[8px] ${
                          msg.sender === "tenant"
                            ? "bg-[#0066CC] text-white"
                            : "bg-[#F7F7F9] text-[#1A1A1A]"
                        }`}
                      >
                        <p className="text-[14px] leading-[1.6]">{msg.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-[rgba(0,0,0,0.08)] p-[16px] bg-[#FAFAFA]">
                <div className="flex items-center gap-[12px] mb-[8px]">
                  <button className="text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors">
                    <Paperclip className="w-[20px] h-[20px]" />
                  </button>
                  <span className="text-[#6B6B6B] text-[13px]">Documents</span>
                </div>
                <div className="flex items-end gap-[12px]">
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Write a reply"
                      rows={3}
                      className="w-full px-[16px] py-[12px] border border-[rgba(0,0,0,0.16)] rounded-[4px] text-[#1A1A1A] text-[14px] leading-[1.6] resize-none bg-white"
                    />
                    <div className="flex items-center justify-between mt-[8px]">
                      <button className="text-[#0066CC] text-[13px] font-semibold hover:underline flex items-center gap-[4px]">
                        <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                          <path d="M2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M8 6V10M8 10L6 8M8 10L10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Translate message to: English
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className={`flex items-center gap-[8px] px-[24px] py-[10px] font-semibold transition-colors ${
                          message.trim()
                            ? "bg-brand-primary text-white hover:bg-brand-primary-dark"
                            : "bg-[#EDEDED] text-neutral-gray cursor-not-allowed"
                        }`}
                      >
                        <Send className="w-[16px] h-[16px]" />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rental Help */}
            <div className="mt-[24px] bg-[#F7F7F9] border border-[rgba(0,0,0,0.08)] p-[24px]">
              <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[12px]">Rental help</h3>
              <div className="space-y-[12px]">
                <details className="cursor-pointer">
                  <summary className="text-[#1A1A1A] text-[14px] font-semibold flex items-center justify-between">
                    Can I rent without a guarantor?
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </summary>
                  <p className="text-[#6B6B6B] text-[13px] mt-[8px] leading-[1.6]">
                    Yes! If you're an EU citizen, you can rent in most cases without a guarantor.
                  </p>
                </details>

                <details className="cursor-pointer">
                  <summary className="text-[#1A1A1A] text-[14px] font-semibold flex items-center justify-between">
                    How much does HousingAnywhere cost?
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </summary>
                </details>

                <details className="cursor-pointer">
                  <summary className="text-[#1A1A1A] text-[14px] font-semibold flex items-center justify-between">
                    Why can't I following contact details?
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </summary>
                </details>

                <details className="cursor-pointer">
                  <summary className="text-[#1A1A1A] text-[14px] font-semibold flex items-center justify-between">
                    Why are landlords not replying?
                    <svg className="w-[16px] h-[16px]" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </summary>
                </details>
              </div>
            </div>
          </div>

          {/* Right Column - Landlord & Property Info */}
          <div className="flex-[1]">
            <div className="sticky top-[100px]">
              {/* Landlord Profile */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px] mb-[24px]">
                <div className="flex items-center gap-[12px] mb-[16px]">
                  <div className="w-[64px] h-[64px] bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-full flex items-center justify-center">
                    <span className="text-white text-[24px] font-bold">S</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-neutral-black text-[16px] font-bold mb-[4px]">Serdal</h3>
                    <div className="flex items-center gap-[4px] mb-[4px]">
                      <Check className="w-[12px] h-[12px] text-accent-blue" />
                      <span className="text-accent-blue text-[12px] font-semibold">Verified ID badge</span>
                    </div>
                    <span className="text-neutral-gray text-[12px]">Last seen a few ago</span>
                  </div>
                </div>

                <div className="space-y-[8px] text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray">Response rate:</span>
                    <span className="text-neutral-black font-semibold">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray">Response time:</span>
                    <span className="text-neutral-black font-semibold">within 2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray">Email verified:</span>
                    <Check className="w-[14px] h-[14px] text-accent-blue" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-gray">Phone verified:</span>
                    <Check className="w-[14px] h-[14px] text-accent-blue" />
                  </div>
                </div>

                <div className="mt-[16px] pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                  <button className="text-[#0066CC] text-[13px] font-semibold hover:underline">
                    Report this user
                  </button>
                  <br />
                  <button className="text-[#0066CC] text-[13px] font-semibold hover:underline mt-[4px]">
                    Contact customer care
                  </button>
                </div>
              </div>

              {/* Property Card */}
              <div className="border border-[rgba(0,0,0,0.08)] p-[16px]">
                <img src={propertyImage} alt="Property" className="w-full h-[160px] object-cover mb-[12px] rounded-[4px]" />
                
                <h3 className="text-[#1A1A1A] text-[16px] font-bold mb-[8px]">
                  Rue Clément Ader, Rosny-sous-Bois
                </h3>

                <div className="space-y-[8px] text-[13px] mb-[16px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B6B]">Move-in date:</span>
                    <span className="text-[#1A1A1A] font-semibold">{formatDate(moveInDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B6B]">Move-out date:</span>
                    <span className="text-[#1A1A1A] font-semibold">{formatDate(moveOutDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B6B]">Rental period:</span>
                    <span className="text-[#1A1A1A] font-semibold">{calculateRentalPeriod(moveInDate, moveOutDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B6B6B]">Rent total:</span>
                    <span className="text-[#1A1A1A] font-semibold">€2,154.00</span>
                  </div>
                </div>

                <div className="border-t border-[rgba(0,0,0,0.08)] pt-[16px] mb-[16px]">
                  <h4 className="text-[#1A1A1A] text-[14px] font-bold mb-[12px]">Payments</h4>
                  <div className="space-y-[8px] text-[13px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#6B6B6B]">First month's rent</span>
                      <span className="text-[#1A1A1A] font-semibold">€600.00</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-[4px]">
                        <span className="text-[#6B6B6B]">Tenant Protection</span>
                        <Info className="w-[12px] h-[12px] text-[#6B6B6B]" />
                      </div>
                      <span className="text-[#1A1A1A] font-semibold">€210.00</span>
                    </div>
                    <div className="flex items-center justify-between pt-[8px] border-t border-[rgba(0,0,0,0.08)]">
                      <span className="text-[#1A1A1A] font-bold">Total payment</span>
                      <span className="text-[#1A1A1A] text-[16px] font-bold">€810.00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#F7F9FC] border border-[#0066CC] p-[12px]">
                  <div className="flex items-start gap-[8px]">
                    <Shield className="w-[16px] h-[16px] text-[#0066CC] flex-shrink-0 mt-[2px]" />
                    <div>
                      <h4 className="text-[#1A1A1A] text-[13px] font-bold mb-[4px]">Covered by Tenant Protection</h4>
                      <p className="text-[#1A1A1A] text-[12px] leading-[1.5] mb-[8px]">
                        You're guaranteed a stress-free move-in or your money back.
                      </p>
                      <button className="text-[#0066CC] text-[12px] font-semibold hover:underline">
                        How you're protected →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="bg-neutral-light-gray border-t border-[rgba(0,0,0,0.08)] py-[24px]">
        <div className="max-w-[1440px] mx-auto px-[32px]">
          <div className="flex items-start gap-[12px] max-w-[800px]">
            <Info className="w-[20px] h-[20px] text-brand-primary flex-shrink-0 mt-[2px]" />
            <div>
              <p className="text-neutral-black text-[14px] leading-[1.6]">
                <strong>Rent safely with EasyRent!</strong> Messages are safe protected by our platform and third-
                party payments. When you use EasyRent to message and pay, you're protected by our secure payments system.{" "}
                <button className="text-[#0066CC] underline hover:no-underline font-semibold">Read more here</button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-[32px]">
          <div className="bg-white max-w-[1100px] w-full relative shadow-2xl">
            <div className="bg-white border-b border-[rgba(0,0,0,0.08)] px-[32px] py-[20px] flex items-center justify-between">
              <h2 className="text-[#1A1A1A] text-[24px] font-bold">Select Your Stay Dates</h2>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[#F7F7F9] rounded-full transition-colors"
              >
                <svg className="w-[20px] h-[20px]" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="p-[32px]">
              <DatePicker
                isOpen={true}
                onClose={() => setIsDatePickerOpen(false)}
                startDate={moveInDate}
                endDate={moveOutDate}
                onDateChange={handleDateChange}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}