import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { DatePicker } from "../components/date-picker";
import { buildOfferMessage } from "../components/chat-offer-message";
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
import { API_BASE } from "../config";

type RequestStatus = "pending" | "approved" | "rejected";

interface ApplicationDocument {
  id: string;
  type: "enrollment" | "employment" | "income" | "profile";
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
  moveInDate?: string | null;
  moveOutDate?: string | null;
  billingAddress?: {
    country?: string;
    city?: string;
  } | null;
  paymentDetails?: {
    method?: "card" | "ideal" | "bancontact";
    cardLast4?: string;
    isPaid?: boolean;
    paidAmount?: number;
    currency?: string;
    addRentGuarantee?: boolean;
    rentGuaranteeFee?: number;
    tenantProtectionFee?: number;
    rentForSelectedPeriod?: number;
    totalAmount?: number;
  } | null;
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
  profile: "Profile picture",
};

function formatDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const MAX_REPLY_CHARACTERS = 4000;

function formatOptionalDate(dateValue?: string | null) {
  if (!dateValue) {
    return "Not provided";
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "Not provided";
  }
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAgeFromDateOfBirth(dateOfBirth?: string) {
  if (!dateOfBirth) {
    return null;
  }
  const parts = dateOfBirth.split("/").map((part) => Number(part));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part) || part <= 0)) {
    return null;
  }

  const [day, month, year] = parts;
  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age > 0 ? age : null;
}

function maskEmail(email?: string) {
  if (!email) {
    return "Not provided";
  }
  const [local, domain] = email.split("@");
  if (!local || !domain) {
    return "Not provided";
  }
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(4, local.length - visible.length))}@${domain}`;
}

function formatCurrency(amount?: number, currency = "EUR") {
  if (typeof amount !== "number" || Number.isNaN(amount)) {
    return "Not provided";
  }
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function calculateApplicationTotal(paymentDetails?: ApplicationRecord["paymentDetails"]) {
  if (!paymentDetails) {
    return 0;
  }

  const rentForSelectedPeriod = paymentDetails.rentForSelectedPeriod ?? 0;
  const tenantProtectionFee = paymentDetails.tenantProtectionFee ?? 0;
  const rentGuaranteeFee = paymentDetails.addRentGuarantee ? paymentDetails.rentGuaranteeFee ?? 0 : 0;
  const computedTotal = rentForSelectedPeriod + tenantProtectionFee + rentGuaranteeFee;

  if (computedTotal > 0) {
    return computedTotal;
  }

  return paymentDetails.totalAmount ?? paymentDetails.paidAmount ?? 0;
}

export function LandlordRentals() {
  const apiBase = API_BASE;
  const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("pending");
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ applicationId: string; status: "approved" | "rejected" } | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplySending, setIsReplySending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");
  const [isTemplateSending, setIsTemplateSending] = useState<"invite" | "decline" | null>(null);
  const [templateFeedback, setTemplateFeedback] = useState("");
  const [showContactInfoHint, setShowContactInfoHint] = useState(false);
  const [isSpecialOfferOpen, setIsSpecialOfferOpen] = useState(false);
  const [isSpecialOfferCalendarOpen, setIsSpecialOfferCalendarOpen] = useState(false);
  const [specialOfferRent, setSpecialOfferRent] = useState("");
  const [specialOfferMoveInDate, setSpecialOfferMoveInDate] = useState<Date | null>(null);
  const [specialOfferMoveOutDate, setSpecialOfferMoveOutDate] = useState<Date | null>(null);
  const [specialOfferMessage, setSpecialOfferMessage] = useState("");
  const [specialOfferFeedback, setSpecialOfferFeedback] = useState("");
  const [isSpecialOfferSending, setIsSpecialOfferSending] = useState(false);
  const selectedApplication = useMemo(
    () => applications.find((app) => app.id === selectedApplicationId),
    [applications, selectedApplicationId]
  );

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

  useEffect(() => {
    setReplyMessage("");
    setReplyError("");
    setReplySuccess("");
    setTemplateFeedback("");
    setShowContactInfoHint(false);
    setIsSpecialOfferOpen(false);
    setIsSpecialOfferCalendarOpen(false);
    setSpecialOfferRent("");
    setSpecialOfferMoveInDate(null);
    setSpecialOfferMoveOutDate(null);
    setSpecialOfferMessage("");
    setSpecialOfferFeedback("");
  }, [selectedApplicationId]);

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
      return false;
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
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request status");
      return false;
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!confirmTarget) {
      return;
    }

    await updateStatus(confirmTarget.applicationId, confirmTarget.status);
    setConfirmTarget(null);
  };

  const openConversationForApplication = async (applicationId: string, token: string) => {
    const conversationResponse = await fetch(`${apiBase}/api/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ applicationId }),
    });

    if (!conversationResponse.ok) {
      const payload = (await conversationResponse.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? "Failed to open conversation");
    }

    const conversationPayload = (await conversationResponse.json()) as { conversationId: string };
    return conversationPayload.conversationId;
  };

  const postConversationMessage = async (conversationId: string, body: string, token: string) => {
    const messageResponse = await fetch(`${apiBase}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ body }),
    });

    if (!messageResponse.ok) {
      const payload = (await messageResponse.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? "Failed to send message");
    }
  };

  const buildInvitationMessage = (application: ApplicationRecord) => {
    return buildOfferMessage({
      version: 1,
      kind: "invitation",
      listingTitle: application.listing.title,
      tenantName: application.tenant.name,
      monthlyRent: application.listing.monthlyRent,
      deposit: application.listing.deposit,
      moveInDate: application.moveInDate,
      moveOutDate: application.moveOutDate,
      note: "Please complete your booking in EasyRent within 24 hours.",
    });
  };

  const buildDeclineMessage = (application: ApplicationRecord) => {
    return buildOfferMessage({
      version: 1,
      kind: "decline",
      listingTitle: application.listing.title,
      tenantName: application.tenant.name,
      note: "After review, we are unable to proceed with this application at the moment. You can still apply to other listings that better match your profile and timing.",
    });
  };

  const handleSpecialOfferDateChange = (start: Date | null, end: Date | null) => {
    setSpecialOfferMoveInDate(start);
    setSpecialOfferMoveOutDate(end);
  };

  const sendTemplateAction = async (action: "invite" | "decline") => {
    const token = localStorage.getItem("authToken");
    if (!token || !selectedApplication) {
      setTemplateFeedback("Unable to send right now.");
      return;
    }

    setIsTemplateSending(action);
    setTemplateFeedback("");
    setReplyError("");
    setReplySuccess("");

    try {
      const conversationId = await openConversationForApplication(selectedApplication.id, token);
      const templateBody = action === "invite" ? buildInvitationMessage(selectedApplication) : buildDeclineMessage(selectedApplication);
      await postConversationMessage(conversationId, templateBody, token);

      const nextStatus = action === "invite" ? "approved" : "rejected";
      const statusUpdated = await updateStatus(selectedApplication.id, nextStatus);

      if (!statusUpdated) {
        setTemplateFeedback(
          action === "invite"
            ? `Invitation message sent to ${selectedApplication.tenant.name}, but status update failed.`
            : `Decline message sent to ${selectedApplication.tenant.name}, but status update failed.`
        );
        return;
      }

      setTemplateFeedback(
        action === "invite"
          ? `Invitation sent to ${selectedApplication.tenant.name} and application marked as approved.`
          : `Decline message sent to ${selectedApplication.tenant.name} and application marked as rejected.`
      );
    } catch (err) {
      setTemplateFeedback(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsTemplateSending(null);
    }
  };

  const sendReplyFromModal = async () => {
    const token = localStorage.getItem("authToken");
    const messageBody = replyMessage.trim();
    const selectedApplicationRecord = applications.find((item) => item.id === selectedApplicationId);

    if (!selectedApplicationId) {
      return;
    }

    if (!token) {
      setReplyError("Missing auth token");
      return;
    }

    if (!messageBody) {
      setReplyError("Please write a reply before sending.");
      return;
    }

    if (messageBody.length > MAX_REPLY_CHARACTERS) {
      setReplyError(`Message is too long. Maximum ${MAX_REPLY_CHARACTERS} characters.`);
      return;
    }

    setIsReplySending(true);
    setReplyError("");
    setReplySuccess("");

    try {
      const conversationId = await openConversationForApplication(selectedApplicationId, token);
      await postConversationMessage(conversationId, messageBody, token);

      setReplyMessage("");
      setReplySuccess(`Reply sent to ${selectedApplicationRecord?.tenant.name ?? "tenant"}.`);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsReplySending(false);
    }
  };

  const sendSpecialOffer = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !selectedApplication) {
      setSpecialOfferFeedback("Unable to send special offer right now.");
      return;
    }

    const offerRent = Number.parseFloat(specialOfferRent);
    if (Number.isNaN(offerRent) || offerRent <= 0) {
      setSpecialOfferFeedback("Please enter a valid new rent amount.");
      return;
    }

    setIsSpecialOfferSending(true);
    setSpecialOfferFeedback("");

    try {
      const conversationId = await openConversationForApplication(selectedApplication.id, token);
      await postConversationMessage(
        conversationId,
        buildOfferMessage({
          version: 1,
          kind: "special_offer",
          listingTitle: selectedApplication.listing.title,
          tenantName: selectedApplication.tenant.name,
          updatedRent: offerRent,
          moveInDate: specialOfferMoveInDate?.toISOString() ?? null,
          moveOutDate: specialOfferMoveOutDate?.toISOString() ?? null,
          note: specialOfferMessage.trim() || "Please review the updated offer and reply in HousingAnywhere.",
        }),
        token
      );
      setSpecialOfferFeedback(`Special offer sent to ${selectedApplication.tenant.name}.`);
      setIsSpecialOfferOpen(false);
    } catch (err) {
      setSpecialOfferFeedback(err instanceof Error ? err.message : "Failed to send special offer");
    } finally {
      setIsSpecialOfferSending(false);
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

        <div className="space-y-[12px]">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              onClick={() => setSelectedApplicationId(application.id)}
              className="bg-white border border-[rgba(0,0,0,0.08)] p-[16px] cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex gap-[16px]">
                {/* Property Image */}
                <div className="w-[120px] h-[90px] overflow-hidden bg-neutral-light-gray flex-shrink-0 rounded">
                  <ImageWithFallback
                    src={application.listing.image}
                    alt={application.listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-[12px] mb-[8px]">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-neutral-black text-[14px] font-bold">{application.listing.title}</h3>
                      <div className="flex items-center gap-[4px] text-neutral-gray text-[12px]">
                        <MapPin className="w-[12px] h-[12px] flex-shrink-0" />
                        <span className="truncate">{application.listing.city}</span>
                      </div>
                    </div>
                    <span className={`px-[12px] py-[4px] text-[10px] font-bold uppercase tracking-[0.05em] flex-shrink-0 whitespace-nowrap rounded-full ${statusStyle[application.status]}`}>
                      {statusLabel[application.status]}
                    </span>
                  </div>

                  {/* Tenant and Key Details */}
                  <div className="grid grid-cols-3 gap-[12px] text-[12px]">
                    <div>
                      <div className="text-neutral-gray text-[10px] uppercase font-semibold mb-[2px]">Tenant</div>
                      <div className="text-neutral-black font-semibold">{application.tenant.name}</div>
                    </div>
                    <div>
                      <div className="text-neutral-gray text-[10px] uppercase font-semibold mb-[2px]">Dates</div>
                      <div className="text-neutral-black font-semibold">
                        {application.moveInDate ? formatOptionalDate(application.moveInDate).split(" ").slice(0, 2).join(" ") : "Not set"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-neutral-gray text-[10px] uppercase font-semibold mb-[2px]">Rent / Deposit</div>
                      <div className="text-neutral-black font-semibold">€{application.listing.monthlyRent.toLocaleString()} / €{application.listing.deposit.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="flex items-center justify-between gap-[12px] mt-[8px] pt-[8px] border-t border-[rgba(0,0,0,0.04)]">
                    <div className="flex items-center gap-[16px] text-[11px] text-neutral-gray">
                      <div className="flex items-center gap-[4px]">
                        <User className="w-[12px] h-[12px]" />
                        {application.moveInCount} person{application.moveInCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center gap-[4px]">
                        <span>{application.withPets ? '🐾' : 'No'} pets</span>
                      </div>
                      <div className="flex items-center gap-[4px]">
                        <FileText className="w-[12px] h-[12px]" />
                        {application.documents.length} doc{application.documents.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-[11px] text-neutral-gray">
                      Applied {formatDate(application.createdAt)}
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

        {confirmTarget && (
          <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-[24px]">
            <div className="w-full max-w-[520px] bg-white border border-[rgba(0,0,0,0.12)] p-[24px]">
              <h3 className="text-neutral-black text-[20px] font-bold mb-[8px]">
                Confirm {confirmTarget.status === "approved" ? "Approval" : "Rejection"}
              </h3>
              <p className="text-neutral-gray text-[14px] leading-[1.6] mb-[20px]">
                Are you sure you want to mark this rental request as
                <span className="font-semibold text-neutral-black"> {confirmTarget.status === "approved" ? "Approved" : "Rejected"}</span>?
              </p>

              <div className="flex items-center justify-end gap-[10px]">
                <button
                  onClick={() => setConfirmTarget(null)}
                  disabled={updatingApplicationId === confirmTarget.applicationId}
                  className="px-[16px] py-[10px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[13px] font-semibold hover:bg-neutral-light-gray transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    void confirmStatusUpdate();
                  }}
                  disabled={updatingApplicationId === confirmTarget.applicationId}
                  className={`px-[16px] py-[10px] text-white text-[13px] font-semibold transition-colors disabled:opacity-60 ${
                    confirmTarget.status === "approved" ? "bg-accent-blue hover:opacity-90" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {updatingApplicationId === confirmTarget.applicationId
                    ? "Updating..."
                    : confirmTarget.status === "approved"
                    ? "Approve request"
                    : "Reject request"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      {selectedApplication && (
        <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
          <div className="flex items-center justify-between px-[32px] py-[16px] border-b border-[rgba(0,0,0,0.08)] sticky top-0 bg-white">
            <h2 className="text-neutral-black text-[20px] font-bold">Application</h2>
            <button
              onClick={() => setSelectedApplicationId(null)}
              className="text-neutral-gray hover:text-neutral-black transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="max-w-[1400px] mx-auto px-[32px] py-[32px]">
            <div className="grid grid-cols-3 gap-[40px]">
              {/* Main content - 2 columns */}
              <div className="col-span-2 space-y-[32px]">
                {/* Progress bar */}
                <div className="pb-[24px]">
                  <div className="flex items-center justify-between mb-[24px]">
                    {[
                      { step: 1, label: "Receive message", completed: true },
                      { step: 2, label: "Send invitation to book", completed: false, active: true },
                      { step: 3, label: "Wait for confirmation", completed: false },
                      { step: 4, label: "Booking confirmed", completed: false },
                    ].map((item, index, array) => (
                      <div key={item.step} className="flex items-center flex-1">
                        {/* Step circle */}
                        <div className={`flex items-center justify-center w-[40px] h-[40px] rounded-full font-bold text-[14px] flex-shrink-0 ${
                          item.completed
                            ? "bg-accent-blue text-white"
                            : item.active
                            ? "bg-accent-blue text-white"
                            : "bg-neutral-light-gray text-neutral-gray"
                        }`}>
                          {item.completed ? "✓" : item.step}
                        </div>
                        
                        {/* Connector line */}
                        {index < array.length - 1 && (
                          <div className={`flex-1 h-[2px] mx-[16px] ${
                            item.completed ? "bg-accent-blue" : "bg-neutral-light-gray"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Labels */}
                  <div className="flex items-start justify-between gap-[16px]">
                    {[
                      "Receive message",
                      "Send invitation to book",
                      "Wait for confirmation",
                      "Booking confirmed",
                    ].map((label) => (
                      <div key={label} className="flex-1 text-center">
                        <p className="text-neutral-gray text-[12px] font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invitation section */}
                <div className="bg-[#f6f7f8] border border-[rgba(0,0,0,0.08)] rounded-[6px] px-[24px] py-[28px]">
                  <div className="text-center mb-[24px]">
                    <h3 className="text-neutral-black text-[28px] leading-[1.1] font-bold mb-[10px]">Send {selectedApplication.tenant.name} an invitation to book</h3>
                    <p className="text-neutral-gray text-[14px] leading-[1.5] max-w-[760px] mx-auto">
                      {selectedApplication.tenant.name} will have 24 hours to accept it. To suggest new dates or adjust the rent, send a special offer.
                    </p>
                  </div>

                  <div className="max-w-[520px] mx-auto border border-[rgba(0,0,0,0.12)] rounded-[6px] bg-white overflow-hidden mb-[26px]">
                    <div className="px-[20px] py-[18px] border-b border-[rgba(0,0,0,0.12)]">
                      <h4 className="text-neutral-black text-[28px] leading-[1.1] font-bold">{selectedApplication.listing.title}</h4>
                    </div>
                    <div className="p-[20px]">
                      <div className="grid grid-cols-2 gap-[24px]">
                        <div>
                          <p className="text-neutral-gray text-[13px] font-semibold mb-[6px]">Move-in date</p>
                          <p className="text-neutral-black text-[14px] font-bold">{formatOptionalDate(selectedApplication.moveInDate)}</p>
                        </div>
                        <div>
                          <p className="text-neutral-gray text-[13px] font-semibold mb-[6px]">Move-out date</p>
                          <p className="text-neutral-black text-[14px] font-bold">{formatOptionalDate(selectedApplication.moveOutDate)}</p>
                        </div>
                      </div>
                      <button className="mt-[18px] text-neutral-black text-[16px] leading-[1.1] font-semibold flex items-center gap-[8px] hover:underline" title="Move-in dates come from the tenant application and can be adjusted from listing availability.">
                        <Calendar className="w-[20px] h-[20px]" />
                        Update availability
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-[10px] flex-wrap">
                    <button
                      type="button"
                      aria-label="Help with invitation actions"
                      title="Help with invitation actions"
                      className="w-[30px] h-[30px] rounded-full border border-[rgba(0,0,0,0.2)] text-neutral-gray text-[14px] font-bold flex items-center justify-center transition-all duration-200 hover:bg-neutral-black hover:text-white hover:border-neutral-black hover:shadow-sm hover:-translate-y-[1px]"
                    >
                      ?
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void sendTemplateAction("invite");
                      }}
                      disabled={isTemplateSending !== null}
                      className="px-[20px] py-[12px] bg-brand-primary text-white text-[14px] font-semibold rounded-[6px] border border-brand-primary transition-all duration-200 hover:bg-brand-primary-dark hover:shadow-md hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isTemplateSending === "invite" ? "Sending invitation..." : "Send invitation to book"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void sendTemplateAction("decline");
                      }}
                      disabled={isTemplateSending !== null}
                      className="px-[20px] py-[12px] bg-white text-neutral-black text-[14px] font-semibold rounded-[6px] border border-[rgba(0,0,0,0.18)] transition-all duration-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 hover:shadow-md hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                      {isTemplateSending === "decline" ? "Sending decline..." : "Decline"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSpecialOfferOpen(true)}
                      className="px-[20px] py-[12px] bg-white text-neutral-black text-[14px] font-semibold rounded-[6px] border border-[rgba(0,0,0,0.18)] transition-all duration-200 hover:bg-neutral-light-gray hover:shadow-md hover:-translate-y-[1px]"
                    >
                      Special offer
                    </button>
                    <button
                      type="button"
                      aria-label="Help with booking actions"
                      title="Help with booking actions"
                      className="w-[30px] h-[30px] rounded-full border border-[rgba(0,0,0,0.2)] text-neutral-gray text-[14px] font-bold flex items-center justify-center transition-all duration-200 hover:bg-neutral-black hover:text-white hover:border-neutral-black hover:shadow-sm hover:-translate-y-[1px]"
                    >
                      ?
                    </button>
                  </div>
                  {templateFeedback && (
                    <p className="text-center text-[12px] text-neutral-gray mt-[10px]">{templateFeedback}</p>
                  )}
                </div>

                {isSpecialOfferOpen && selectedApplication && (
                  <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-[24px]">
                    <div className="w-full max-w-[680px] bg-white border border-[rgba(0,0,0,0.12)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden rounded-[8px]">
                      <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[rgba(0,0,0,0.08)] bg-[#f8f9fa]">
                        <div>
                          <h3 className="text-neutral-black text-[22px] font-bold">Create special offer</h3>
                          <p className="text-neutral-gray text-[13px] mt-[4px]">Send a new rental proposal to {selectedApplication.tenant.name}.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsSpecialOfferOpen(false)}
                          className="text-neutral-gray hover:text-neutral-black transition-colors text-[20px]"
                          aria-label="Close special offer modal"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="grid grid-cols-[1.2fr_1fr] gap-[0px]">
                        <div className="p-[24px] space-y-[16px]">
                          <div>
                            <label className="block text-[13px] font-semibold text-neutral-black mb-[6px]">New rent</label>
                            <input
                              value={specialOfferRent}
                              onChange={(event) => setSpecialOfferRent(event.target.value)}
                              type="number"
                              min="0"
                              step="1"
                              placeholder="Enter new monthly rent"
                              className="w-full px-[14px] py-[11px] border border-[rgba(0,0,0,0.14)] rounded-[6px] text-[14px] outline-none focus:border-brand-primary"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-[12px]">
                            <div>
                              <label className="block text-[13px] font-semibold text-neutral-black mb-[6px]">Move-in and move-out dates</label>
                              <button
                                type="button"
                                onClick={() => setIsSpecialOfferCalendarOpen(true)}
                                className="w-full px-[14px] py-[11px] border border-[rgba(0,0,0,0.14)] rounded-[6px] text-[14px] text-left outline-none focus:border-brand-primary hover:bg-neutral-light-gray transition-colors"
                              >
                                {specialOfferMoveInDate && specialOfferMoveOutDate
                                  ? `${formatOptionalDate(specialOfferMoveInDate.toISOString())} - ${formatOptionalDate(specialOfferMoveOutDate.toISOString())}`
                                  : "Choose dates from calendar"}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[13px] font-semibold text-neutral-black mb-[6px]">Message</label>
                            <textarea
                              value={specialOfferMessage}
                              onChange={(event) => setSpecialOfferMessage(event.target.value)}
                              placeholder="Add a short note for the tenant"
                              rows={5}
                              className="w-full px-[14px] py-[11px] border border-[rgba(0,0,0,0.14)] rounded-[6px] text-[14px] outline-none focus:border-brand-primary resize-y"
                            />
                          </div>
                          {specialOfferFeedback && <p className="text-[12px] text-neutral-gray">{specialOfferFeedback}</p>}
                        </div>

                        <div className="bg-[#f7f8f9] border-l border-[rgba(0,0,0,0.08)] p-[24px] space-y-[16px]">
                          <div className="bg-white border border-[rgba(0,0,0,0.10)] rounded-[8px] p-[16px]">
                            <p className="text-[12px] text-neutral-gray uppercase tracking-[0.08em] mb-[6px]">Preview</p>
                            <h4 className="text-neutral-black text-[18px] font-bold mb-[8px]">HousingAnywhere Special Offer</h4>
                            <p className="text-[13px] text-neutral-gray leading-[1.6]">
                              {selectedApplication.tenant.name} can review the updated terms directly in chat.
                            </p>
                            <div className="mt-[12px] space-y-[6px] text-[13px] text-neutral-gray">
                              <p>New rent: {specialOfferRent ? formatCurrency(Number.parseFloat(specialOfferRent)) : "Not set"}</p>
                              <p>Move-in: {specialOfferMoveInDate ? formatOptionalDate(specialOfferMoveInDate.toISOString()) : "Not set"}</p>
                              <p>Move-out: {specialOfferMoveOutDate ? formatOptionalDate(specialOfferMoveOutDate.toISOString()) : "Not set"}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              void sendSpecialOffer();
                            }}
                            disabled={isSpecialOfferSending}
                            className="w-full px-[16px] py-[12px] bg-brand-primary text-white text-[14px] font-semibold rounded-[6px] transition-all duration-200 hover:bg-brand-primary-dark hover:shadow-md disabled:opacity-60"
                          >
                            {isSpecialOfferSending ? "Sending special offer..." : "Send special offer"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isSpecialOfferCalendarOpen && (
                  <div className="fixed inset-0 z-[90] bg-black/40 flex items-start justify-center p-[24px] pt-[48px]">
                    <div className="w-full max-w-[980px] relative">
                      <div className="mb-[8px] flex justify-end">
                        <button
                          type="button"
                          onClick={() => setIsSpecialOfferCalendarOpen(false)}
                          className="w-[38px] h-[38px] rounded-[8px] bg-white/95 hover:bg-white transition-colors flex items-center justify-center shadow-sm"
                        >
                          <XCircle className="w-[18px] h-[18px] text-[#0F2D36]" />
                        </button>
                      </div>

                      <DatePicker
                        isOpen={isSpecialOfferCalendarOpen}
                        onClose={() => setIsSpecialOfferCalendarOpen(false)}
                        startDate={specialOfferMoveInDate}
                        endDate={specialOfferMoveOutDate}
                        onDateChange={handleSpecialOfferDateChange}
                        onClearSelection={() => {
                          setSpecialOfferMoveInDate(null);
                          setSpecialOfferMoveOutDate(null);
                        }}
                        initializeFromSelection
                        isModal
                        minStayMonths={1}
                      />
                    </div>
                  </div>
                )}

                {/* Supporting message */}
                <div className="border border-[rgba(0,0,0,0.08)] bg-[#f7f8f9] rounded-[6px] overflow-hidden">
                  <div className="border-l-[4px] border-neutral-black px-[16px] py-[12px] border-b border-[rgba(0,0,0,0.08)]">
                    <p className="text-neutral-black text-[14px] font-semibold flex items-center gap-[8px]">
                      <FileText className="w-[15px] h-[15px]" />
                      View {selectedApplication.tenant.name}'s documents ({selectedApplication.documents.length})
                    </p>
                    <p className="text-neutral-gray text-[12px] mt-[4px]">
                      Replying here sends a direct message to {selectedApplication.tenant.name} for this application.
                    </p>
                  </div>
                  <div className="p-[14px]">
                    <div className="flex gap-[12px] items-start">
                      <div className="w-[54px] h-[54px] rounded-full bg-white border border-[rgba(0,0,0,0.12)] flex items-center justify-center text-neutral-black font-bold text-[16px] flex-shrink-0">
                        {selectedApplication.tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={replyMessage}
                          onChange={(event) => setReplyMessage(event.target.value.slice(0, MAX_REPLY_CHARACTERS))}
                          placeholder="Write a reply"
                          className="w-full min-h-[140px] px-[14px] py-[12px] border border-[rgba(0,0,0,0.12)] rounded-[4px] text-[14px] text-neutral-black resize-y"
                        />
                        <p className="text-right text-neutral-gray text-[12px] mt-[6px]">({replyMessage.length}/{MAX_REPLY_CHARACTERS} characters)</p>
                        <div className="mt-[10px] flex justify-end">
                          <button
                            onClick={() => {
                              void sendReplyFromModal();
                            }}
                            disabled={isReplySending || !replyMessage.trim()}
                            className="inline-flex items-center gap-[8px] px-[14px] py-[8px] bg-accent-blue text-white text-[13px] font-semibold rounded-[4px] hover:opacity-90 transition-opacity disabled:opacity-60"
                          >
                            <MessageSquare className="w-[14px] h-[14px]" />
                            {isReplySending ? "Sending..." : "Send reply"}
                          </button>
                        </div>
                        {replyError && <p className="text-red-600 text-[12px] mt-[8px]">{replyError}</p>}
                        {replySuccess && <p className="text-accent-blue text-[12px] mt-[8px]">{replySuccess}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right sidebar - 1 column */}
              <div className="space-y-[16px]">
                <div className="flex items-start justify-between border-b border-[rgba(0,0,0,0.10)] pb-[14px]">
                  <div>
                    <h4 className="text-neutral-black text-[30px] leading-[1.05] font-bold mb-[6px]">{selectedApplication.tenant.name}</h4>
                    <p className="text-neutral-black text-[14px]">
                      From {selectedApplication.billingAddress?.city || selectedApplication.listing.city || "Not specified"}
                    </p>
                    <p className="text-neutral-gray text-[13px] mt-[4px]">Applied on {formatDate(selectedApplication.createdAt)}</p>
                  </div>
                  <ImageWithFallback
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedApplication.tenant.name)}&background=e8ecef&color=1a1a1a&size=128`}
                    alt={selectedApplication.tenant.name}
                    className="w-[64px] h-[64px] rounded-full object-cover border border-[rgba(0,0,0,0.10)]"
                  />
                </div>

                {/* <div className="border-b border-[rgba(0,0,0,0.10)] pb-[14px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <h5 className="text-neutral-black text-[15px] font-bold">ID {selectedApplication.idVerified ? "verified" : "not verified"}</h5>
                    <span className="w-[16px] h-[16px] rounded-full border border-[rgba(0,0,0,0.35)] text-[10px] text-neutral-gray flex items-center justify-center" title="Government ID verification status for this tenant">i</span>
                  </div>
                  <p className="text-neutral-gray text-[13px] mb-[10px]">Ask {selectedApplication.tenant.name} to verify before final confirmation.</p>

                </div> */}

                <div className="border-b border-[rgba(0,0,0,0.10)] pb-[14px]">
                  <div className="flex items-center justify-between mb-[8px]">
                    <h5 className="text-neutral-black text-[15px] font-bold">About</h5>
                    <span className="w-[16px] h-[16px] rounded-full border border-[rgba(0,0,0,0.35)] text-[10px] text-neutral-gray flex items-center justify-center" title="Personal and application profile details provided by tenant">i</span>
                  </div>
                  <p className="text-neutral-gray text-[13px] mb-[6px]">
                    {selectedApplication.occupation
                      ? `Occupation: ${selectedApplication.occupation.charAt(0).toUpperCase() + selectedApplication.occupation.slice(1)}`
                      : "No tenant preferences for this listing."}
                  </p>
                  <p className="text-neutral-gray text-[12px]">Move-in people: {selectedApplication.moveInCount} | Pets: {selectedApplication.withPets ? "Yes" : "No"}</p>
                  {selectedApplication.visaStatus && (
                    <p className="text-neutral-gray text-[12px] mt-[4px]">Visa status: {selectedApplication.visaStatus}</p>
                  )}
                  {selectedApplication.tenant.universityName && (
                    <p className="text-neutral-gray text-[12px] mt-[4px]">University: {selectedApplication.tenant.universityName}</p>
                  )}
                  {selectedApplication.tenant.employerName && (
                    <p className="text-neutral-gray text-[12px] mt-[4px]">Employer: {selectedApplication.tenant.employerName}</p>
                  )}
                  {selectedApplication.tenant.income && (
                    <p className="text-neutral-gray text-[12px] mt-[4px]">Income: {selectedApplication.tenant.income}</p>
                  )}
                  {selectedApplication.tenant.monthlyBudget && (
                    <p className="text-neutral-gray text-[12px] mt-[4px]">Budget: {selectedApplication.tenant.monthlyBudget}</p>
                  )}
                  {selectedApplication.tenant.dateOfBirth && (
                    <p className="text-neutral-gray text-[12px] mt-[4px]">Date of birth: {selectedApplication.tenant.dateOfBirth}</p>
                  )}
                  <div className="flex flex-wrap gap-[8px] mt-[10px]">
                    {selectedApplication.tenant.gender && (
                      <span className="px-[12px] py-[6px] bg-[#002e3d] text-white text-[12px] font-semibold rounded-full">
                        ✓ {selectedApplication.tenant.gender.charAt(0).toUpperCase() + selectedApplication.tenant.gender.slice(1)}
                      </span>
                    )}
                    {selectedApplication.occupation && (
                      <span className="px-[12px] py-[6px] bg-[#002e3d] text-white text-[12px] font-semibold rounded-full">
                        ✓ {selectedApplication.occupation.charAt(0).toUpperCase() + selectedApplication.occupation.slice(1)}
                      </span>
                    )}
                    {getAgeFromDateOfBirth(selectedApplication.tenant.dateOfBirth) && (
                      <span className="px-[12px] py-[6px] bg-[#002e3d] text-white text-[12px] font-semibold rounded-full">
                        ✓ {getAgeFromDateOfBirth(selectedApplication.tenant.dateOfBirth)} years old
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-b border-[rgba(0,0,0,0.10)] pb-[14px]">
                  <div className="flex items-center justify-between mb-[10px]">
                    <h5 className="text-neutral-black text-[15px] font-bold">Documents</h5>
                    <span className="w-[16px] h-[16px] rounded-full border border-[rgba(0,0,0,0.35)] text-[10px] text-neutral-gray flex items-center justify-center" title="Uploaded files shared by tenant with this application">i</span>
                  </div>
                  <div className="space-y-[8px] text-[13px]">
                    <div className="flex items-center gap-[8px] text-neutral-black">
                      {selectedApplication.documents.some((doc) => doc.type === "income") ? (
                        <CheckCircle className="w-[16px] h-[16px] text-[#0d3a4a]" />
                      ) : (
                        <XCircle className="w-[16px] h-[16px] text-neutral-gray" />
                      )}
                      <span>Proof of income</span>
                    </div>
                    <div className="flex items-center gap-[8px] text-neutral-black">
                      {selectedApplication.documents.some((doc) => doc.type === "employment") ? (
                        <CheckCircle className="w-[16px] h-[16px] text-[#0d3a4a]" />
                      ) : (
                        <XCircle className="w-[16px] h-[16px] text-neutral-gray" />
                      )}
                      <span>Proof of occupation</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-gray">
                      <div className="flex items-center gap-[8px]">
                        {selectedApplication.documents.some((doc) => doc.type === "enrollment" || doc.type === "profile") ? (
                          <CheckCircle className="w-[16px] h-[16px] text-[#0d3a4a]" />
                        ) : (
                          <XCircle className="w-[16px] h-[16px] text-neutral-gray" />
                        )}
                        <span>Proof of identity</span>
                      </div>
                      {!selectedApplication.documents.some((doc) => doc.type === "enrollment" || doc.type === "profile") && (
                        <span className="text-[12px]">Missing</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-[10px] space-y-[8px]">
                    {selectedApplication.documents.length > 0 ? (
                      <a
                        href={selectedApplication.documents[0].url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-[#0d3a4a] text-[13px] font-semibold underline decoration-dotted underline-offset-4 hover:opacity-80"
                      >
                        View {selectedApplication.tenant.name}'s documents ({selectedApplication.documents.length})
                      </a>
                    ) : (
                      <p className="text-neutral-gray text-[12px]">No documents uploaded.</p>
                    )}
                    {selectedApplication.documents.length > 0 && (
                      <div className="flex flex-wrap gap-[8px]">
                        {selectedApplication.documents.map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-[6px] px-[10px] py-[6px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[11px] font-semibold hover:bg-neutral-light-gray"
                          >
                            <FileText className="w-[12px] h-[12px]" />
                            {documentTypeLabel[doc.type]}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-b border-[rgba(0,0,0,0.10)] pb-[14px]">
                  <div className="flex items-center justify-between mb-[10px]">
                    <h5 className="text-neutral-black text-[15px] font-bold">Payment details</h5>
                    <span className="w-[16px] h-[16px] rounded-full border border-[rgba(0,0,0,0.35)] text-[10px] text-neutral-gray flex items-center justify-center" title="Payment and guarantee details submitted in the application">i</span>
                  </div>
                  <div className="space-y-[5px] text-[12px] text-neutral-gray">
                    <p>Method: {selectedApplication.paymentDetails?.method ? selectedApplication.paymentDetails.method.toUpperCase() : "Not provided"}</p>
                    <p>Card: {selectedApplication.paymentDetails?.cardLast4 ? `**** ${selectedApplication.paymentDetails.cardLast4}` : "Not provided"}</p>
                    <p>Paid: {selectedApplication.paymentDetails?.isPaid ? "Yes" : "No"}</p>
                    <p>Rent for selected period: {formatCurrency(selectedApplication.paymentDetails?.rentForSelectedPeriod, selectedApplication.paymentDetails?.currency || "EUR")}</p>
                    <p>Tenant protection fee: {formatCurrency(selectedApplication.paymentDetails?.tenantProtectionFee, selectedApplication.paymentDetails?.currency || "EUR")}</p>
                    <p>Rent guarantee fee: {selectedApplication.paymentDetails?.addRentGuarantee ? formatCurrency(selectedApplication.paymentDetails?.rentGuaranteeFee, selectedApplication.paymentDetails?.currency || "EUR") : formatCurrency(0, selectedApplication.paymentDetails?.currency || "EUR")}</p>
                    <p>Total amount: {formatCurrency(calculateApplicationTotal(selectedApplication.paymentDetails), selectedApplication.paymentDetails?.currency || "EUR")}</p>
                    <p>Paid amount: {formatCurrency(selectedApplication.paymentDetails?.paidAmount ?? calculateApplicationTotal(selectedApplication.paymentDetails), selectedApplication.paymentDetails?.currency || "EUR")}</p>
                    <p>Rent guarantee: {selectedApplication.paymentDetails?.addRentGuarantee ? "Included" : "Not included"}</p>
                  </div>
                </div>

                <div className="border-b border-[rgba(0,0,0,0.10)] pb-[14px]">
                  <div className="flex items-center justify-between mb-[10px]">
                    <h5 className="text-neutral-black text-[15px] font-bold">Billing address</h5>
                    <span className="w-[16px] h-[16px] rounded-full border border-[rgba(0,0,0,0.35)] text-[10px] text-neutral-gray flex items-center justify-center" title="Billing details entered by tenant">i</span>
                  </div>
                  <div className="space-y-[5px] text-[12px] text-neutral-gray">
                    <p>City: {selectedApplication.billingAddress?.city || "Not provided"}</p>
                    <p>Country: {selectedApplication.billingAddress?.country || "Not provided"}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-[10px]">
                    <h5 className="text-neutral-black text-[15px] font-bold">Contact details</h5>
                    <button
                      onClick={() => setShowContactInfoHint((prev) => !prev)}
                      className="w-[18px] h-[18px] rounded-full border border-[rgba(0,0,0,0.35)] text-[11px] text-neutral-gray flex items-center justify-center"
                      title="Toggle contact details info"
                    >
                      i
                    </button>
                  </div>
                  {showContactInfoHint && (
                    <p className="text-neutral-gray text-[12px] mb-[8px]">Contact details are partially masked until booking confirmation.</p>
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-[4px]">
                      <p className="text-neutral-black text-[13px] font-semibold">Email</p>
                      <p className="text-[#188a4d] text-[13px] font-semibold">Verified</p>
                    </div>
                    <p className="text-neutral-black text-[12px] tracking-[0.02em]">{maskEmail(selectedApplication.tenant.email)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </LandlordPortalLayout>
  );
}
