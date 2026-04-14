import { Link, useNavigate } from "react-router";
import { Calendar, CheckCircle2, Clock, CreditCard, FileText, Home, MapPin, MessageCircle, Search, XCircle } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { API_BASE } from "../config";
import { useAuth } from "../contexts/auth-context";

type ApplicationStatus = "pending" | "approved" | "rejected";

interface TenantApplication {
  id: string;
  listingId: string;
  status: ApplicationStatus;
  createdAt: string;
  listing: {
    isAvailable: boolean;
    title: string;
    city: string;
    address: string;
    monthlyRent: number;
    image: string;
  };
}

interface TenantApplicationsResponse {
  applications: TenantApplication[];
}

const statusStyle: Record<ApplicationStatus, string> = {
  pending: "bg-brand-light text-brand-primary",
  approved: "bg-accent-blue/10 text-accent-blue",
  rejected: "bg-red-50 text-red-600",
};

function ApplicationsSkeleton() {
  return (
    <div className="space-y-[16px]" aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="bg-white border border-[rgba(0,0,0,0.08)] p-[20px] animate-pulse">
          <div className="flex gap-[16px]">
            <div className="w-[180px] h-[120px] bg-[#E8E8E8] overflow-hidden flex-shrink-0" />

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-[12px] mb-[8px]">
                <div className="flex-1 min-w-0">
                  <div className="h-[22px] w-[55%] bg-[#E8E8E8] mb-[8px]" />
                  <div className="h-[16px] w-[72%] bg-[#E8E8E8]" />
                </div>
                <div className="h-[24px] w-[90px] bg-[#E8E8E8] flex-shrink-0 rounded-full" />
              </div>

              <div className="flex items-center gap-[18px] mb-[14px]">
                <div className="h-[16px] w-[170px] bg-[#E8E8E8]" />
                <div className="h-[16px] w-[150px] bg-[#E8E8E8]" />
              </div>

              <div className="h-[48px] bg-[#F1F1F1] rounded-[4px] mb-[14px]" />

              <div className="flex items-center gap-[10px]">
                <div className="h-[36px] w-[146px] bg-[#E8E8E8] rounded-[4px]" />
                <div className="h-[36px] w-[120px] bg-[#E8E8E8] rounded-[4px]" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TenantApplications() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingConversationId, setStartingConversationId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (user?.isLandlord) {
      setIsLoading(false);
      setApplications([]);
      setError("");
      return;
    }

    const loadApplications = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your applications.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/rental-applications/tenant`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load your applications");
        }

        const payload = (await response.json()) as TenantApplicationsResponse;
        setApplications(payload.applications);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load your applications");
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [isAuthLoading, user?.isLandlord]);

  const handleMessageLandlord = async (applicationId: string, listingId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to message the landlord.");
      return;
    }

    setStartingConversationId(listingId);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId, applicationId }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to open the conversation");
      }

      const payload = (await response.json()) as { conversationId: string };
      navigate(`/tenant/inbox/conversation/${payload.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open the conversation");
    } finally {
      setStartingConversationId(null);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 bg-[#F7F7F9] py-[48px]">
        <div className="max-w-[1100px] mx-auto px-[32px]">
          {!isAuthLoading && user?.isLandlord && (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[32px] mb-[24px]">
              <h1 className="text-[#1A1A1A] text-[30px] font-bold tracking-[-0.02em] mb-[10px]">
                Tenant applications are not available for landlord accounts
              </h1>
              <p className="text-[#6B6B6B] text-[15px] mb-[20px]">
                Landlords cannot submit rental applications. You can review tenant requests in your rentals section.
              </p>
              <button
                type="button"
                onClick={() => navigate("/landlord/rentals")}
                className="px-[20px] py-[10px] bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                Go to Rentals
              </button>
            </div>
          )}

          {!user?.isLandlord && (
            <>
          <div className="mb-[24px]">
            <h1 className="text-[#1A1A1A] text-[34px] font-bold tracking-[-0.02em] mb-[8px]">My Applications</h1>
            <p className="text-[#6B6B6B] text-[15px]">Track the status of the rental requests you sent to landlords.</p>
            {isLoading && <p className="text-[#6B6B6B] text-[14px] mt-[8px]">Loading your applications...</p>}
            {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
          </div>

          <div className="space-y-[16px]">
            {isLoading && <ApplicationsSkeleton />}

            {!isLoading && applications.map((application) => (
              <div key={application.id} className="bg-white border border-[rgba(0,0,0,0.08)] p-[20px]">
                <div className="flex gap-[16px]">
                  <div className="w-[180px] h-[120px] bg-[#F1F1F1] overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={application.listing.image} alt={application.listing.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-[8px]">
                      <div>
                        <h2 className="text-[#1A1A1A] text-[20px] font-bold mb-[4px]">{application.listing.title}</h2>
                        <div className="flex items-center gap-[6px] text-[#6B6B6B] text-[14px]">
                          <MapPin className="w-[14px] h-[14px]" />
                          <span>{application.listing.address}, {application.listing.city}</span>
                        </div>
                      </div>
                      <span className={`px-[12px] py-[6px] text-[12px] font-bold uppercase tracking-[0.04em] ${statusStyle[application.status]}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-[18px] text-[14px] text-[#6B6B6B] mb-[14px]">
                      <div className="flex items-center gap-[6px]">
                        <Calendar className="w-[14px] h-[14px]" />
                        Applied on {new Date(application.createdAt).toLocaleDateString("en-GB")}
                      </div>
                      <div className="flex items-center gap-[6px]">
                        <Home className="w-[14px] h-[14px]" />
                        €{application.listing.monthlyRent.toLocaleString()} / month
                      </div>
                    </div>

                    {/* Status-aware next-step banner */}
                    {application.status === "approved" && (
                      <div className="flex items-start gap-[10px] bg-green-50 border border-green-200 rounded-[4px] px-[14px] py-[10px] mb-[14px]">
                        <CheckCircle2 className="w-[16px] h-[16px] text-green-600 mt-[1px] flex-shrink-0" />
                        <p className="text-[13px] text-green-800 font-medium">
                          Your application has been approved! Complete your booking by proceeding to payment.
                        </p>
                      </div>
                    )}
                    {application.status === "pending" && (
                      <div className="flex items-start gap-[10px] bg-brand-light border border-brand-primary/20 rounded-[4px] px-[14px] py-[10px] mb-[14px]">
                        <Clock className="w-[16px] h-[16px] text-brand-primary mt-[1px] flex-shrink-0" />
                        <p className="text-[13px] text-brand-primary font-medium">
                          Under review — the landlord will respond to your request soon. You can message them directly if you have questions.
                        </p>
                      </div>
                    )}
                    {application.status === "rejected" && (
                      <div className="flex items-start gap-[10px] bg-red-50 border border-red-200 rounded-[4px] px-[14px] py-[10px] mb-[14px]">
                        <XCircle className="w-[16px] h-[16px] text-red-500 mt-[1px] flex-shrink-0" />
                        <p className="text-[13px] text-red-700 font-medium">
                          Your application was not approved. Don't worry — browse other available properties to find your next home.
                        </p>
                      </div>
                    )}
                    {!application.listing.isAvailable && (
                      <div className="flex items-start gap-[10px] bg-[#FFF7ED] border border-[#FDBA74] rounded-[4px] px-[14px] py-[10px] mb-[14px]">
                        <Clock className="w-[16px] h-[16px] text-[#C2410C] mt-[1px] flex-shrink-0" />
                        <p className="text-[13px] text-[#9A3412] font-medium">
                          This listing is no longer available. Your application is still saved, but new bookings are closed.
                        </p>
                      </div>
                    )}

                    {/* Status-aware action buttons */}
                    <div className="flex items-center gap-[10px]">
                      {application.status === "approved" && (
                        <Link
                          to={`/property/${application.listingId}/payment`}
                          className="inline-flex items-center gap-[8px] px-[16px] py-[9px] bg-green-600 text-white text-[13px] font-semibold hover:bg-green-700 transition-colors"
                        >
                          <CreditCard className="w-[13px] h-[13px]" />
                          Proceed to payment
                        </Link>
                      )}
                      {application.status === "pending" && (
                        <button
                          type="button"
                          onClick={() => void handleMessageLandlord(application.id, application.listingId)}
                          disabled={startingConversationId === application.listingId}
                          className="inline-flex items-center gap-[8px] px-[16px] py-[9px] bg-brand-primary text-white text-[13px] font-semibold hover:bg-brand-primary-dark transition-colors disabled:opacity-60"
                        >
                          <MessageCircle className="w-[13px] h-[13px]" />
                          {startingConversationId === application.listingId ? "Opening chat..." : "Message landlord"}
                        </button>
                      )}
                      {application.status === "rejected" && (
                        <Link
                          to="/"
                          className="inline-flex items-center gap-[8px] px-[16px] py-[9px] bg-brand-primary text-white text-[13px] font-semibold hover:bg-brand-primary-dark transition-colors"
                        >
                          <Search className="w-[13px] h-[13px]" />
                          Browse other properties
                        </Link>
                      )}
                      {(application.status === "approved" || application.status === "rejected") && (
                        <button
                          type="button"
                          onClick={() => void handleMessageLandlord(application.id, application.listingId)}
                          disabled={startingConversationId === application.listingId}
                          className="inline-flex items-center gap-[8px] px-[16px] py-[9px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors disabled:opacity-60"
                        >
                          <MessageCircle className="w-[13px] h-[13px]" />
                          {startingConversationId === application.listingId ? "Opening chat..." : "Message landlord"}
                        </button>
                      )}
                      <Link
                        to={`/property/${application.listingId}`}
                        className="px-[14px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors"
                      >
                        {application.listing.isAvailable ? "View listing" : "View status"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {!isLoading && !error && applications.length === 0 && (
              <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[56px] text-center">
                <FileText className="w-[48px] h-[48px] text-[#B5B5B5] mx-auto mb-[14px]" />
                <h3 className="text-[#1A1A1A] text-[20px] font-bold mb-[8px]">No applications yet</h3>
                <p className="text-[#6B6B6B] text-[14px] mb-[20px]">When you apply for a property, it will show up here.</p>
                <Link
                  to="/"
                  className="inline-flex px-[22px] py-[10px] bg-brand-primary text-white font-semibold hover:bg-brand-primary-dark transition-colors"
                >
                  Browse properties
                </Link>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
