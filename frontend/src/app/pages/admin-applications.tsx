import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, FileText, CheckCircle2, XCircle, Banknote, AlertTriangle } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { API_BASE } from "../config";

type AppStatus = "pending" | "approved" | "rejected" | "paid";
type ApprovalStatus = "pending" | "approved" | "rejected";
type PayoutStatus = "not_ready" | "ready" | "released" | "blocked";

interface AdminApplication {
  id: string;
  status: AppStatus;
  isPaid: boolean;
  paymentStatus: string;
  paidAmount: number;
  currency: string;
  rentAmount: number;
  tenantProtectionFee: number;
  rentGuaranteeFee: number;
  totalAmount: number;
  adminApprovalStatus: ApprovalStatus;
  tenantMoveInConfirmed: boolean;
  keyReceivedConfirmed: boolean;
  payoutStatus: PayoutStatus;
  moveInDate?: string;
  moveOutDate?: string;
  createdAt: string;
  tenant: { id: string; name: string; email: string; verificationStatus: string } | null;
  landlord: { id: string; name: string; email: string; verificationStatus: string } | null;
  listing: { id: string; title: string; city: string } | null;
}

interface ApplicationsResponse {
  applications: AdminApplication[];
  total: number;
  page: number;
  pages: number;
}

type ActionModal =
  | { type: "approval"; application: AdminApplication; status: ApprovalStatus }
  | { type: "payout"; application: AdminApplication; status: PayoutStatus };

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-600",
  paid: "bg-green-50 text-green-700",
  verified: "bg-green-50 text-green-700",
  flagged: "bg-red-50 text-red-600",
  not_ready: "bg-[#F1F5F9] text-neutral-gray",
  ready: "bg-blue-50 text-blue-700",
  released: "bg-green-50 text-green-700",
  blocked: "bg-red-50 text-red-600",
};

export function AdminApplications() {
  const [data, setData] = useState<ApplicationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("");
  const [payoutFilter, setPayoutFilter] = useState("");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<ActionModal | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (approvalFilter) params.set("approvalStatus", approvalFilter);
      if (payoutFilter) params.set("payoutStatus", payoutFilter);
      const res = await fetch(`${API_BASE}/api/admin/applications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load bookings");
      setData((await res.json()) as ApplicationsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, approvalFilter, payoutFilter]);

  useEffect(() => { void load(); }, [load]);

  const openAction = (nextAction: ActionModal) => {
    setAction(nextAction);
    setNotes("");
  };

  const executeAction = async () => {
    if (!action) return;
    const token = localStorage.getItem("authToken");
    setActionLoading(true);
    setError(null);
    try {
      const endpoint = action.type === "approval" ? "approval" : "payout";
      const body = action.type === "approval"
        ? { adminApprovalStatus: action.status, adminNotes: notes }
        : { payoutStatus: action.status, payoutNotes: notes };
      const res = await fetch(`${API_BASE}/api/admin/applications/${action.application.id}/${endpoint}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "Action failed");
      }
      setAction(null);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const badge = (value: string) => (
    <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold capitalize ${statusStyles[value] ?? "bg-[#F1F5F9] text-neutral-gray"}`}>
      {value.replace("_", " ")}
    </span>
  );

  return (
    <AdminPortalLayout>
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-[20px] sm:mb-[28px]">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Bookings Control</h1>
          <p className="text-neutral-gray text-[13px] sm:text-[14px] mt-[4px]">Monitor payments, tenant key confirmation, and landlord payout release</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[12px] sm:p-[16px] mb-[16px] flex flex-col sm:flex-row flex-wrap gap-[10px] sm:gap-[12px]">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex-1 min-w-0 px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white">
            <option value="">All booking statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
          <select value={approvalFilter} onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }} className="flex-1 min-w-0 px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white">
            <option value="">All admin approvals</option>
            <option value="pending">Pending approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={payoutFilter} onChange={(e) => { setPayoutFilter(e.target.value); setPage(1); }} className="flex-1 min-w-0 px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white">
            <option value="">All payout statuses</option>
            <option value="not_ready">Not ready</option>
            <option value="ready">Ready</option>
            <option value="released">Released</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {error && <div className="mb-[16px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">{error}</div>}

        {/* Mobile card list */}
        <div className="flex flex-col gap-[12px] lg:hidden">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[14px] p-[16px] animate-pulse">
                <div className="h-[13px] w-[60%] bg-neutral-light-gray rounded-full mb-[8px]" />
                <div className="h-[11px] w-[80%] bg-neutral-light-gray rounded-full mb-[12px]" />
                <div className="flex gap-[6px]"><div className="h-[26px] w-[64px] bg-neutral-light-gray rounded-[8px]" /><div className="h-[26px] w-[64px] bg-neutral-light-gray rounded-[8px]" /></div>
              </div>
            ))
          ) : data?.applications.length === 0 ? (
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[14px] p-[40px] text-center text-neutral-gray">
              <FileText className="w-[36px] h-[36px] mx-auto mb-[10px] opacity-40" />
              No bookings found
            </div>
          ) : (
            data?.applications.map((a) => (
              <div key={a.id} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[14px] p-[16px]">
                {/* Header row */}
                <div className="flex items-start justify-between gap-[10px] mb-[10px]">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-black text-[14px] truncate">{a.listing?.title ?? "No listing"}</p>
                    <p className="text-neutral-gray text-[12px]">{a.listing?.city ?? "—"}</p>
                  </div>
                  <div className="flex-shrink-0">{badge(a.payoutStatus)}</div>
                </div>
                {/* People */}
                <div className="grid grid-cols-2 gap-[8px] mb-[10px] text-[12px]">
                  <div>
                    <p className="text-neutral-gray text-[11px] uppercase tracking-wider font-semibold mb-[2px]">Tenant</p>
                    <p className="font-medium text-neutral-black truncate">{a.tenant?.name ?? "—"}</p>
                    <p className="text-neutral-gray truncate">{a.tenant?.email ?? ""}</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray text-[11px] uppercase tracking-wider font-semibold mb-[2px]">Landlord</p>
                    <p className="font-medium text-neutral-black truncate">{a.landlord?.name ?? "—"}</p>
                    <p className="text-neutral-gray truncate">{a.landlord?.email ?? ""}</p>
                  </div>
                </div>
                {/* Status row */}
                <div className="flex flex-wrap gap-[6px] items-center mb-[10px]">
                  {a.isPaid ? badge("paid") : badge(a.paymentStatus || "pending")}
                  {badge(a.adminApprovalStatus)}
                  <span className="text-[12px] text-neutral-gray">Move-in: {a.tenantMoveInConfirmed ? "✓" : "waiting"} · Key: {a.keyReceivedConfirmed ? "✓" : "waiting"}</span>
                </div>
                <p className="text-neutral-gray text-[12px]">
                  {a.moveInDate ? new Date(a.moveInDate).toLocaleDateString("en-GB") : "No move-in"} → {a.moveOutDate ? new Date(a.moveOutDate).toLocaleDateString("en-GB") : "No move-out"}
                </p>
                {a.isPaid && (
                  <div className="text-[12px] text-neutral-gray mb-[10px] mt-[4px] bg-neutral-light-gray rounded-[8px] px-[10px] py-[8px]">
                    <div className="flex justify-between"><span>Rent (owed to landlord)</span><span className="font-semibold text-neutral-black">{a.currency} {a.rentAmount.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Platform fees</span><span>{a.currency} {(a.tenantProtectionFee + a.rentGuaranteeFee).toFixed(2)}</span></div>
                    <div className="flex justify-between pt-[4px] mt-[4px] border-t border-[rgba(0,0,0,0.08)]"><span>Total collected</span><span className="font-semibold text-neutral-black">{a.currency} {a.totalAmount.toFixed(2)}</span></div>
                  </div>
                )}
                {/* Actions */}
                <div className="flex flex-wrap gap-[6px] pt-[10px] border-t border-[rgba(0,0,0,0.06)]">
                  <button type="button" onClick={() => openAction({ type: "approval", application: a, status: "approved" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"><CheckCircle2 className="w-[12px] h-[12px]" />Approve</button>
                  <button type="button" onClick={() => openAction({ type: "approval", application: a, status: "rejected" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-red-50 text-red-600 hover:bg-red-100"><XCircle className="w-[12px] h-[12px]" />Reject</button>
                  <button type="button" onClick={() => openAction({ type: "payout", application: a, status: "released" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-brand-primary text-white hover:bg-brand-primary-dark"><Banknote className="w-[12px] h-[12px]" />Release</button>
                  <button type="button" onClick={() => openAction({ type: "payout", application: a, status: "blocked" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-[#F1F5F9] text-neutral-black hover:bg-[#E2E8F0]"><AlertTriangle className="w-[12px] h-[12px]" />Block</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">People</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Listing / Dates</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Safety</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Payout</th>
                  <th className="text-right px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)] animate-pulse">
                      <td colSpan={6} className="px-[16px] py-[18px]"><div className="h-[18px] bg-neutral-light-gray rounded-full" /></td>
                    </tr>
                  ))
                ) : data?.applications.length === 0 ? (
                  <tr><td colSpan={6} className="px-[20px] py-[48px] text-center text-neutral-gray"><FileText className="w-[40px] h-[40px] mx-auto mb-[12px] opacity-40" />No bookings found</td></tr>
                ) : (
                  data?.applications.map((a) => (
                    <tr key={a.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-neutral-light-gray transition-colors align-top">
                      <td className="px-[16px] py-[14px] min-w-[230px]">
                        <p className="font-semibold text-neutral-black">{a.tenant?.name ?? "No tenant"}</p>
                        <p className="text-neutral-gray text-[12px]">{a.tenant?.email ?? "—"}</p>
                        <div className="mt-[8px]">
                          <p className="font-medium text-neutral-black">{a.landlord?.name ?? "No landlord"}</p>
                          <p className="text-neutral-gray text-[12px]">{a.landlord?.email ?? "—"}</p>
                          <div className="mt-[4px]">{badge(a.landlord?.verificationStatus ?? "pending")}</div>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[210px]">
                        <p className="font-medium text-neutral-black line-clamp-1">{a.listing?.title ?? "No listing"}</p>
                        <p className="text-neutral-gray text-[12px]">{a.listing?.city ?? "—"}</p>
                        <p className="text-neutral-gray text-[12px] mt-[6px]">{a.moveInDate ? new Date(a.moveInDate).toLocaleDateString("en-GB") : "No move-in"} → {a.moveOutDate ? new Date(a.moveOutDate).toLocaleDateString("en-GB") : "No move-out"}</p>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[180px]">
                        {a.isPaid ? badge("paid") : badge(a.paymentStatus || "pending")}
                        {a.isPaid ? (
                          <div className="text-[12px] text-neutral-gray mt-[6px] space-y-[2px]">
                            <div className="flex justify-between gap-[10px]"><span>Rent</span><span className="font-semibold text-neutral-black">{a.currency} {a.rentAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between gap-[10px]"><span>Fees</span><span>{a.currency} {(a.tenantProtectionFee + a.rentGuaranteeFee).toFixed(2)}</span></div>
                            <div className="flex justify-between gap-[10px] pt-[2px] border-t border-[rgba(0,0,0,0.06)]"><span>Total</span><span className="font-semibold text-neutral-black">{a.currency} {a.totalAmount.toFixed(2)}</span></div>
                          </div>
                        ) : (
                          <p className="text-neutral-gray text-[12px] mt-[4px]">{a.currency} {a.paidAmount.toFixed(2)}</p>
                        )}
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[170px]">
                        {badge(a.adminApprovalStatus)}
                        <p className="text-neutral-gray text-[12px] mt-[6px]">Move-in: {a.tenantMoveInConfirmed ? "Confirmed" : "Waiting"}</p>
                        <p className="text-neutral-gray text-[12px]">Key: {a.keyReceivedConfirmed ? "Received" : "Waiting"}</p>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[140px]">
                        {badge(a.payoutStatus)}
                        {a.isPaid && (
                          <p className="text-neutral-gray text-[12px] mt-[6px]">
                            Owe landlord: <span className="font-semibold text-neutral-black">{a.currency} {a.rentAmount.toFixed(2)}</span>
                          </p>
                        )}
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <div className="flex flex-wrap justify-end gap-[8px] min-w-[220px]">
                          <button type="button" onClick={() => openAction({ type: "approval", application: a, status: "approved" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"><CheckCircle2 className="w-[13px] h-[13px]" />Approve</button>
                          <button type="button" onClick={() => openAction({ type: "approval", application: a, status: "rejected" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-red-50 text-red-600 hover:bg-red-100"><XCircle className="w-[13px] h-[13px]" />Reject</button>
                          <button type="button" onClick={() => openAction({ type: "payout", application: a, status: "ready" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-green-50 text-green-700 hover:bg-green-100"><Banknote className="w-[13px] h-[13px]" />Ready</button>
                          <button type="button" onClick={() => openAction({ type: "payout", application: a, status: "released" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-brand-primary text-white hover:bg-brand-primary-dark"><Banknote className="w-[13px] h-[13px]" />Release</button>
                          <button type="button" onClick={() => openAction({ type: "payout", application: a, status: "blocked" })} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-[#F1F5F9] text-neutral-black hover:bg-[#E2E8F0]"><AlertTriangle className="w-[13px] h-[13px]" />Block</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-[20px] py-[14px] border-t border-[rgba(0,0,0,0.06)]">
              <p className="text-[13px] text-neutral-gray">{((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total} bookings</p>
              <div className="flex items-center gap-[8px]">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-[8px] rounded-[8px] text-neutral-gray hover:bg-neutral-light-gray disabled:opacity-40 transition-colors"><ChevronLeft className="w-[16px] h-[16px]" /></button>
                <span className="text-[13px] text-neutral-black font-medium px-[8px]">{page} / {data.pages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-[8px] rounded-[8px] text-neutral-gray hover:bg-neutral-light-gray disabled:opacity-40 transition-colors"><ChevronRight className="w-[16px] h-[16px]" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile pagination */}
        {data && data.pages > 1 && (
          <div className="flex lg:hidden items-center justify-between mt-[12px] px-[4px]">
            <p className="text-[13px] text-neutral-gray">{((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total}</p>
            <div className="flex items-center gap-[8px]">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-[8px] rounded-[8px] bg-white border border-[rgba(0,0,0,0.08)] text-neutral-gray disabled:opacity-40"><ChevronLeft className="w-[16px] h-[16px]" /></button>
              <span className="text-[13px] font-medium">{page} / {data.pages}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-[8px] rounded-[8px] bg-white border border-[rgba(0,0,0,0.08)] text-neutral-gray disabled:opacity-40"><ChevronRight className="w-[16px] h-[16px]" /></button>
            </div>
          </div>
        )}
      </div>

      {action && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-[24px]"
          onClick={(e) => { if (e.target === e.currentTarget) { setAction(null); setNotes(""); } }}
        >
          <div className="w-full sm:max-w-[480px] bg-white border border-[rgba(0,0,0,0.12)] rounded-t-[20px] sm:rounded-[20px] p-[24px] sm:p-[28px] shadow-xl">
            {/* Icon */}
            <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center mb-[16px] mx-auto ${
              action.type === "approval" && action.status === "approved" ? "bg-blue-50" :
              action.type === "approval" && action.status === "rejected" ? "bg-red-100" :
              action.status === "released" ? "bg-green-100" :
              action.status === "blocked" ? "bg-amber-100" : "bg-blue-50"
            }`}>
              {action.type === "approval" && action.status === "approved" && <CheckCircle2 className="w-[26px] h-[26px] text-blue-600" />}
              {action.type === "approval" && action.status === "rejected" && <XCircle className="w-[26px] h-[26px] text-red-500" />}
              {action.type === "payout" && action.status === "released" && <Banknote className="w-[26px] h-[26px] text-green-600" />}
              {action.type === "payout" && action.status === "blocked" && <AlertTriangle className="w-[26px] h-[26px] text-amber-600" />}
              {action.type === "payout" && action.status === "ready" && <Banknote className="w-[26px] h-[26px] text-blue-600" />}
            </div>

            <h3 className="text-[18px] font-bold text-neutral-black mb-[8px] text-center">
              {action.type === "approval" ? "Update Booking Approval" : "Update Landlord Payout"}
            </h3>

            <p className="text-neutral-gray text-[14px] leading-[1.65] mb-[16px] text-center">
              Set booking for <strong>{action.application.listing?.title ?? "this listing"}</strong> ({action.application.tenant?.name ?? "tenant"}) to <strong className={action.status === "rejected" || action.status === "blocked" ? "text-red-600" : action.status === "released" ? "text-green-700" : ""}>{action.status.replace("_", " ")}</strong>.
            </p>

            {(action.status === "released") && (
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-[14px] py-[10px] mb-[16px] text-[13px] text-amber-800">
                ⚠️ Releasing the payout sends funds to the landlord. This action cannot be undone.
              </div>
            )}
            {(action.status === "rejected" || action.status === "blocked") && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-[14px] py-[10px] mb-[16px] text-[13px] text-red-700">
                ⚠️ This will prevent the booking from proceeding. Add a note explaining the reason.
              </div>
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Admin notes (optional)…"
              className="w-full min-h-[88px] px-[12px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary mb-[20px] resize-none"
            />

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-[10px]">
              <button onClick={() => { setAction(null); setNotes(""); }} className="px-[16px] py-[11px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold rounded-[10px] hover:bg-neutral-light-gray transition-colors text-center">Cancel</button>
              <button
                onClick={() => { void executeAction(); }}
                disabled={actionLoading}
                className={`px-[20px] py-[11px] text-white text-[14px] font-semibold rounded-[10px] transition-colors disabled:opacity-60 text-center ${
                  action.status === "rejected" || action.status === "blocked" ? "bg-red-500 hover:bg-red-600" :
                  action.status === "released" ? "bg-green-600 hover:bg-green-700" :
                  "bg-brand-primary hover:bg-brand-primary-dark"
                }`}
              >
                {actionLoading ? "Processing…" : (
                  action.status === "approved" ? "Approve Booking" :
                  action.status === "rejected" ? "Reject Booking" :
                  action.status === "released" ? "Release Payout" :
                  action.status === "blocked" ? "Block Payout" :
                  "Mark as Ready"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
}
