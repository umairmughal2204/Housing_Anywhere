import { Link } from "react-router";
import { Calendar, CheckCircle2, Clock, CreditCard, FileText, Home, MapPin, MessageCircle, Search, XCircle } from "lucide-react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type ApplicationStatus = "pending" | "approved" | "rejected";

interface TenantApplication {
  id: string;
  listingId: string;
  status: ApplicationStatus;
  createdAt: string;
  listing: {
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

export function TenantApplications() {
  const apiBase = "http://localhost:4000";
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplications = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your applications.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/rental-applications/tenant`, {
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
  }, [apiBase]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 bg-[#F7F7F9] py-[48px]">
        <div className="max-w-[1100px] mx-auto px-[32px]">
          <div className="mb-[24px]">
            <h1 className="text-[#1A1A1A] text-[34px] font-bold tracking-[-0.02em] mb-[8px]">My Applications</h1>
            <p className="text-[#6B6B6B] text-[15px]">Track the status of the rental requests you sent to landlords.</p>
            {isLoading && <p className="text-[#6B6B6B] text-[14px] mt-[8px]">Loading your applications...</p>}
            {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
          </div>

          <div className="space-y-[16px]">
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
                        <Link
                          to="/tenant/inbox"
                          className="inline-flex items-center gap-[8px] px-[16px] py-[9px] bg-brand-primary text-white text-[13px] font-semibold hover:bg-brand-primary-dark transition-colors"
                        >
                          <MessageCircle className="w-[13px] h-[13px]" />
                          Message landlord
                        </Link>
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
                      <Link
                        to={`/property/${application.listingId}`}
                        className="px-[14px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors"
                      >
                        View listing
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
