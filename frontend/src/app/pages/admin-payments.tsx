import { useEffect, useState, useCallback } from "react";
import { Wallet, TrendingUp, Clock3, CheckCircle2, Banknote, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { StatCard } from "../components/stat-card";
import { API_BASE } from "../config";

type PayoutStatus = "not_ready" | "ready" | "released" | "blocked";

interface PaymentsSummary {
  totalPayments: number;
  totalCollected: number;
  platformProfit: number;
  totalRentOwed: number;
  pendingPayout: number;
  releasedToLandlords: number;
  blockedAmount: number;
  currency: string;
}

interface PaymentRecord {
  id: string;
  isPaid: boolean;
  paidAt?: string;
  currency: string;
  rentAmount: number;
  tenantProtectionFee: number;
  rentGuaranteeFee: number;
  totalAmount: number;
  tenantMoveInConfirmed: boolean;
  keyReceivedConfirmed: boolean;
  payoutStatus: PayoutStatus;
  payoutReleasedAt?: string;
  payoutNotes: string;
  tenant: { id: string; name: string; email: string } | null;
  landlord: { id: string; name: string; email: string } | null;
  listing: { id: string; title: string; city: string } | null;
}

interface PaymentsResponse {
  applications: PaymentRecord[];
  total: number;
  page: number;
  pages: number;
}

const payoutBadgeStyle: Record<PayoutStatus, string> = {
  not_ready: "bg-[#F1F5F9] text-neutral-gray",
  ready: "bg-blue-50 text-blue-700",
  released: "bg-green-50 text-green-700",
  blocked: "bg-red-50 text-red-600",
};

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

export function AdminPayments() {
  const [summary, setSummary] = useState<PaymentsSummary | null>(null);
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutFilter, setPayoutFilter] = useState("");
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<{ payment: PaymentRecord; status: PayoutStatus } | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", status: "paid" });
      if (payoutFilter) params.set("payoutStatus", payoutFilter);

      const [summaryRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/payments/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/admin/applications?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!summaryRes.ok || !listRes.ok) throw new Error("Failed to load payments");

      setSummary((await summaryRes.json()) as PaymentsSummary);
      setData((await listRes.json()) as PaymentsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, [page, payoutFilter]);

  useEffect(() => { void load(); }, [load]);

  const executeAction = async () => {
    if (!action) return;
    const token = localStorage.getItem("authToken");
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/applications/${action.payment.id}/payout`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ payoutStatus: action.status, payoutNotes: notes }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message ?? "Action failed");
      }
      setAction(null);
      setNotes("");
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="max-w-[1280px] mx-auto">
        <div className="mb-[20px] sm:mb-[28px]">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Payments</h1>
          <p className="text-neutral-gray text-[13px] sm:text-[14px] mt-[4px]">
            Every paid booking, the platform's profit, and what's still owed to landlords
          </p>
        </div>

        {error && (
          <div className="mb-[16px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">{error}</div>
        )}

        {/* KPI cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px] sm:gap-[16px] mb-[16px]">
            <StatCard
              label="Total Collected"
              value={formatCurrency(summary.totalCollected, summary.currency)}
              icon={<Wallet className="w-[22px] h-[22px] text-brand-primary" />}
              sub={`${summary.totalPayments.toLocaleString()} paid bookings`}
            />
            <StatCard
              label="Platform Profit"
              value={formatCurrency(summary.platformProfit, summary.currency)}
              icon={<TrendingUp className="w-[22px] h-[22px] text-green-600" />}
              sub="Tenant Protection + guarantee fees"
            />
            <StatCard
              label="Pending Payout"
              value={formatCurrency(summary.pendingPayout, summary.currency)}
              icon={<Clock3 className="w-[22px] h-[22px] text-amber-600" />}
              sub="Rent still owed to landlords"
            />
            <StatCard
              label="Released to Landlords"
              value={formatCurrency(summary.releasedToLandlords, summary.currency)}
              icon={<CheckCircle2 className="w-[22px] h-[22px] text-green-600" />}
              sub={summary.blockedAmount > 0 ? `${formatCurrency(summary.blockedAmount, summary.currency)} blocked` : "No blocked payouts"}
            />
          </div>
        )}

        {/* Filter */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[12px] sm:p-[16px] mb-[16px]">
          <select
            value={payoutFilter}
            onChange={(e) => { setPayoutFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white"
          >
            <option value="">All payout statuses</option>
            <option value="not_ready">Not ready</option>
            <option value="ready">Ready</option>
            <option value="released">Released</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">People</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Listing</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Payment breakdown</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Move-in</th>
                  <th className="text-left px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Payout</th>
                  <th className="text-right px-[16px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)] animate-pulse">
                      <td colSpan={6} className="px-[16px] py-[18px]"><div className="h-[18px] bg-neutral-light-gray rounded-full" /></td>
                    </tr>
                  ))
                ) : data?.applications.length === 0 ? (
                  <tr><td colSpan={6} className="px-[20px] py-[48px] text-center text-neutral-gray">
                    <Banknote className="w-[40px] h-[40px] mx-auto mb-[12px] opacity-40" />
                    No payments found
                  </td></tr>
                ) : (
                  data?.applications.map((p) => (
                    <tr key={p.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-neutral-light-gray transition-colors align-top">
                      <td className="px-[16px] py-[14px] min-w-[220px]">
                        <p className="font-semibold text-neutral-black">{p.tenant?.name ?? "No tenant"}</p>
                        <p className="text-neutral-gray text-[12px]">{p.tenant?.email ?? "—"}</p>
                        <div className="mt-[8px]">
                          <p className="font-medium text-neutral-black">{p.landlord?.name ?? "No landlord"}</p>
                          <p className="text-neutral-gray text-[12px]">{p.landlord?.email ?? "—"}</p>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[160px]">
                        <p className="font-medium text-neutral-black line-clamp-1">{p.listing?.title ?? "No listing"}</p>
                        <p className="text-neutral-gray text-[12px]">{p.listing?.city ?? "—"}</p>
                        <p className="text-neutral-gray text-[12px] mt-[6px]">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GB") : "—"}</p>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[190px]">
                        <div className="text-[12px] space-y-[2px]">
                          <div className="flex justify-between gap-[10px] text-neutral-gray"><span>Rent</span><span className="font-semibold text-neutral-black">{formatCurrency(p.rentAmount, p.currency)}</span></div>
                          <div className="flex justify-between gap-[10px] text-neutral-gray"><span>Fees (profit)</span><span className="font-semibold text-green-700">{formatCurrency(p.tenantProtectionFee + p.rentGuaranteeFee, p.currency)}</span></div>
                          <div className="flex justify-between gap-[10px] pt-[2px] border-t border-[rgba(0,0,0,0.06)] text-neutral-gray"><span>Total</span><span className="font-semibold text-neutral-black">{formatCurrency(p.totalAmount, p.currency)}</span></div>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[140px]">
                        <p className="text-neutral-gray text-[12px]">Move-in: {p.tenantMoveInConfirmed ? "Confirmed" : "Waiting"}</p>
                        <p className="text-neutral-gray text-[12px]">Key: {p.keyReceivedConfirmed ? "Received" : "Waiting"}</p>
                      </td>
                      <td className="px-[16px] py-[14px] min-w-[130px]">
                        <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold capitalize ${payoutBadgeStyle[p.payoutStatus]}`}>
                          {p.payoutStatus.replace("_", " ")}
                        </span>
                        <p className="text-neutral-gray text-[12px] mt-[6px]">
                          Owe: <span className="font-semibold text-neutral-black">{formatCurrency(p.rentAmount, p.currency)}</span>
                        </p>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <div className="flex flex-wrap justify-end gap-[8px] min-w-[200px]">
                          <button type="button" onClick={() => { setAction({ payment: p, status: "ready" }); setNotes(""); }} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100"><Banknote className="w-[13px] h-[13px]" />Ready</button>
                          <button type="button" onClick={() => { setAction({ payment: p, status: "released" }); setNotes(""); }} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-brand-primary text-white hover:bg-brand-primary-dark"><Banknote className="w-[13px] h-[13px]" />Release</button>
                          <button type="button" onClick={() => { setAction({ payment: p, status: "blocked" }); setNotes(""); }} className="inline-flex items-center gap-[4px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-[#F1F5F9] text-neutral-black hover:bg-[#E2E8F0]"><AlertTriangle className="w-[13px] h-[13px]" />Block</button>
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
              <p className="text-[13px] text-neutral-gray">{((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total} payments</p>
              <div className="flex items-center gap-[8px]">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-[8px] rounded-[8px] text-neutral-gray hover:bg-neutral-light-gray disabled:opacity-40 transition-colors"><ChevronLeft className="w-[16px] h-[16px]" /></button>
                <span className="text-[13px] text-neutral-black font-medium px-[8px]">{page} / {data.pages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-[8px] rounded-[8px] text-neutral-gray hover:bg-neutral-light-gray disabled:opacity-40 transition-colors"><ChevronRight className="w-[16px] h-[16px]" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {action && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-[24px]"
          onClick={(e) => { if (e.target === e.currentTarget) { setAction(null); setNotes(""); } }}
        >
          <div className="w-full sm:max-w-[480px] bg-white border border-[rgba(0,0,0,0.12)] rounded-t-[20px] sm:rounded-[20px] p-[24px] sm:p-[28px] shadow-xl">
            <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center mb-[16px] mx-auto ${
              action.status === "released" ? "bg-green-100" : action.status === "blocked" ? "bg-amber-100" : "bg-blue-50"
            }`}>
              {action.status === "released" && <Banknote className="w-[26px] h-[26px] text-green-600" />}
              {action.status === "blocked" && <AlertTriangle className="w-[26px] h-[26px] text-amber-600" />}
              {action.status === "ready" && <Banknote className="w-[26px] h-[26px] text-blue-600" />}
            </div>

            <h3 className="text-[18px] font-bold text-neutral-black mb-[8px] text-center">Update Landlord Payout</h3>
            <p className="text-neutral-gray text-[14px] leading-[1.65] mb-[16px] text-center">
              Set payout for <strong>{action.payment.listing?.title ?? "this booking"}</strong> ({action.payment.landlord?.name ?? "landlord"}) to{" "}
              <strong className={action.status === "blocked" ? "text-red-600" : action.status === "released" ? "text-green-700" : ""}>
                {action.status.replace("_", " ")}
              </strong>
              .
            </p>

            {action.status === "released" && (
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-[14px] py-[10px] mb-[16px] text-[13px] text-amber-800">
                ⚠️ This confirms you've sent {formatCurrency(action.payment.rentAmount, action.payment.currency)} to the landlord outside the app. This action cannot be undone.
              </div>
            )}
            {action.status === "blocked" && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-[14px] py-[10px] mb-[16px] text-[13px] text-red-700">
                ⚠️ This will prevent the payout from proceeding. Add a note explaining the reason.
              </div>
            )}

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payout notes (optional)…"
              className="w-full min-h-[88px] px-[12px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary mb-[20px] resize-none"
            />

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-[10px]">
              <button onClick={() => { setAction(null); setNotes(""); }} className="px-[16px] py-[11px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold rounded-[10px] hover:bg-neutral-light-gray transition-colors text-center">Cancel</button>
              <button
                onClick={() => { void executeAction(); }}
                disabled={actionLoading}
                className={`px-[20px] py-[11px] text-white text-[14px] font-semibold rounded-[10px] transition-colors disabled:opacity-60 text-center ${
                  action.status === "blocked" ? "bg-red-500 hover:bg-red-600" :
                  action.status === "released" ? "bg-green-600 hover:bg-green-700" :
                  "bg-brand-primary hover:bg-brand-primary-dark"
                }`}
              >
                {actionLoading ? "Processing…" : (
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
