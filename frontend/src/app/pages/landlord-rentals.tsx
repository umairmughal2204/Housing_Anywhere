import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import {
  Calendar,
  Download,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type RequestStatus = "pending" | "approved" | "rejected";

interface ApplicationDocument {
  id: string;
  type: "enrollment" | "employment" | "income";
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

interface ApplicationRecord {
  id: string;
  status: RequestStatus;
  createdAt: string;
  supportingMessage: string;
  moveInCount: number;
  withPets: boolean;
  occupation?: "student" | "professional" | "other";
  visaStatus?: string;
  idVerified: boolean;
  documents: ApplicationDocument[];
  listing: {
    id: string;
    title: string;
    address: string;
    city: string;
    monthlyRent: number;
    deposit: number;
    image: string;
  };
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other";
    universityName?: string;
    monthlyBudget?: string;
    employerName?: string;
    income?: string;
    paymentMethods?: string[];
  };
}

interface RentalApplicationsResponse {
  applications: ApplicationRecord[];
}

const statusLabel: Record<RequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const statusStyle: Record<RequestStatus, string> = {
  pending: "bg-brand-light text-brand-primary",
  approved: "bg-accent-blue/10 text-accent-blue",
  rejected: "bg-red-50 text-red-600",
};

const documentTypeLabel: Record<ApplicationDocument["type"], string> = {
  enrollment: "Government ID",
  employment: "Enrollment/Employment proof",
  income: "Income proof",
};

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function LandlordRentals() {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("pending");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Missing auth token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiBase}/api/rental-applications/landlord`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load rental requests");
        }

        const payload = (await response.json()) as RentalApplicationsResponse;
        setApplications(payload.applications);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load rental requests");
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [apiBase]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => filterStatus === "all" || application.status === filterStatus);
  }, [applications, filterStatus]);

  const statusCounts = useMemo(
    () => ({
      all: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      approved: applications.filter((item) => item.status === "approved").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
    }),
    [applications]
  );

  const updateStatus = async (applicationId: string, status: "approved" | "rejected") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Missing auth token");
      return;
    }

    setUpdatingApplicationId(applicationId);
    setError("");

    try {
      const response = await fetch(`${apiBase}/api/rental-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "Failed to update request status");
      }

      setApplications((prev) =>
        prev.map((item) => (item.id === applicationId ? { ...item, status } : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request status");
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  return (
    <LandlordPortalLayout>
      <main className="flex-1 p-[32px]">
        <div className="mb-[32px]">
          <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">Rentals</h1>
          <p className="text-neutral-gray text-[16px]">Tenant rental requests received for your listings</p>
          {isLoading && <p className="text-neutral-gray text-[14px] mt-[8px]">Loading rental requests...</p>}
          {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.08)] mb-[24px]">
          <div className="flex items-center gap-[8px] px-[24px] py-[16px]">
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "pending"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              Pending ({statusCounts.pending})
            </button>
            <button
              onClick={() => setFilterStatus("approved")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "approved"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              Approved ({statusCounts.approved})
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "rejected"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              Rejected ({statusCounts.rejected})
            </button>
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-[24px] py-[10px] text-[14px] font-semibold transition-colors ${
                filterStatus === "all"
                  ? "bg-brand-primary text-white"
                  : "bg-neutral-light-gray text-neutral-black hover:bg-neutral-gray/20"
              }`}
            >
              All ({statusCounts.all})
            </button>
          </div>
        </div>

        <div className="space-y-[24px]">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px]">
              <div className="flex gap-[20px]">
                <div className="w-[200px] h-[150px] overflow-hidden bg-neutral-light-gray flex-shrink-0">
                  <ImageWithFallback
                    src={application.listing.image}
                    alt={application.listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-[12px]">
                    <div>
                      <h3 className="text-neutral-black text-[20px] font-bold mb-[4px]">{application.listing.title}</h3>
                      <div className="flex items-center gap-[6px] text-neutral-gray text-[14px]">
                        <MapPin className="w-[14px] h-[14px]" />
                        <span>{application.listing.address}, {application.listing.city}</span>
                      </div>
                    </div>
                    <span className={`px-[16px] py-[6px] text-[13px] font-bold uppercase tracking-[0.05em] ${statusStyle[application.status]}`}>
                      {statusLabel[application.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-[24px] mb-[16px]">
                    <div>
                      <div className="text-neutral-black text-[14px] font-bold mb-[8px] flex items-center gap-[8px]">
                        <User className="w-[14px] h-[14px]" /> Tenant details
                      </div>
                      <div className="text-neutral-black text-[14px] font-semibold">{application.tenant.name}</div>
                      <div className="flex items-center gap-[4px] text-neutral-gray text-[12px] mt-[4px]">
                        <Mail className="w-[12px] h-[12px]" />
                        <span className="truncate">{application.tenant.email || "No email"}</span>
                      </div>
                      <div className="flex items-center gap-[4px] text-neutral-gray text-[12px] mt-[2px]">
                        <Phone className="w-[12px] h-[12px]" />
                        <span>{application.tenant.phone || "No phone"}</span>
                      </div>
                      <div className="text-neutral-gray text-[12px] mt-[6px]">
                        Occupation: {application.occupation ?? "Not specified"}
                      </div>
                      <div className="text-neutral-gray text-[12px] mt-[2px]">
                        Move-in people: {application.moveInCount} | Pets: {application.withPets ? "Yes" : "No"}
                      </div>
                    </div>

                    <div>
                      <div className="text-neutral-black text-[14px] font-bold mb-[8px]">Request details</div>
                      <div className="flex items-center justify-between text-[14px]">
                        <span className="text-neutral-gray">Rent:</span>
                        <span className="text-neutral-black font-bold">€{application.listing.monthlyRent.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[14px] mt-[4px]">
                        <span className="text-neutral-gray">Deposit:</span>
                        <span className="text-neutral-black font-bold">€{application.listing.deposit.toLocaleString()}</span>
                      </div>
                      <div className="text-neutral-gray text-[12px] mt-[6px]">ID Verified: {application.idVerified ? "Yes" : "No"}</div>
                      {application.supportingMessage && (
                        <p className="text-neutral-gray text-[12px] mt-[6px] line-clamp-3">"{application.supportingMessage}"</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-[16px] border-t border-[rgba(0,0,0,0.08)]">
                    <div className="flex items-center justify-between gap-[16px] mb-[12px]">
                      <div className="flex items-center gap-[8px] text-neutral-gray text-[14px]">
                        <Calendar className="w-[16px] h-[16px]" />
                        <span>Applied on {formatDate(application.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-[8px]">
                        {application.status === "pending" && (
                          <>
                            <button
                              onClick={() => updateStatus(application.id, "approved")}
                              disabled={updatingApplicationId === application.id}
                              className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-accent-blue text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                            >
                              <CheckCircle className="w-[14px] h-[14px]" />
                              {updatingApplicationId === application.id ? "Updating..." : "Approve"}
                            </button>
                            <button
                              onClick={() => updateStatus(application.id, "rejected")}
                              disabled={updatingApplicationId === application.id}
                              className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                            >
                              <XCircle className="w-[14px] h-[14px]" />
                              {updatingApplicationId === application.id ? "Updating..." : "Reject"}
                            </button>
                          </>
                        )}

                        {application.status === "approved" && (
                          <button
                            onClick={() => updateStatus(application.id, "rejected")}
                            disabled={updatingApplicationId === application.id}
                            className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-red-600 text-white text-[13px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                          >
                            <XCircle className="w-[14px] h-[14px]" />
                            {updatingApplicationId === application.id ? "Updating..." : "Change to Rejected"}
                          </button>
                        )}

                        {application.status === "rejected" && (
                          <button
                            onClick={() => updateStatus(application.id, "approved")}
                            disabled={updatingApplicationId === application.id}
                            className="inline-flex items-center gap-[6px] px-[14px] py-[8px] bg-accent-blue text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                          >
                            <CheckCircle className="w-[14px] h-[14px]" />
                            {updatingApplicationId === application.id ? "Updating..." : "Change to Approved"}
                          </button>
                        )}

                        <Link
                          to="/landlord/inbox"
                          className="flex items-center gap-[8px] px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold hover:bg-neutral-light-gray transition-colors"
                        >
                          <MessageSquare className="w-[14px] h-[14px]" />
                          Message tenant
                        </Link>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-[10px]">
                      {application.documents.length === 0 && (
                        <span className="text-neutral-gray text-[13px]">No documents uploaded</span>
                      )}
                      {application.documents.map((doc) => (
                        <a
                          key={doc.id}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-[8px] px-[14px] py-[8px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[13px] font-semibold hover:bg-neutral-light-gray transition-colors"
                        >
                          <FileText className="w-[14px] h-[14px]" />
                          {documentTypeLabel[doc.type]}
                          <Download className="w-[13px] h-[13px]" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && filteredApplications.length === 0 && (
            <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[64px] text-center">
              <FileText className="w-[48px] h-[48px] text-neutral-gray mx-auto mb-[16px]" />
              <h3 className="text-neutral-black text-[18px] font-bold mb-[8px]">No rental requests found</h3>
              <p className="text-neutral-gray text-[14px]">
                {filterStatus === "all"
                  ? "No tenants have submitted a request yet."
                  : `No ${filterStatus} requests right now.`}
              </p>
            </div>
          )}
        </div>
      </main>
    </LandlordPortalLayout>
  );
}
