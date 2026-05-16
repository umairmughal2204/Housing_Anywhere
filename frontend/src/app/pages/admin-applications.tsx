import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { API_BASE } from "../config";

type AppStatus = "pending" | "approved" | "rejected" | "paid";

interface AdminApplication {
  id: string;
  status: AppStatus;
  isPaid: boolean;
  paidAmount: number;
  currency: string;
  createdAt: string;
  tenant: { id: string; name: string; email: string } | null;
  landlord: { id: string; name: string; email: string } | null;
  listing: { id: string; title: string; city: string } | null;
}

interface ApplicationsResponse {
  applications: AdminApplication[];
  total: number;
  page: number;
  pages: number;
}

const statusStyles: Record<AppStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-600",
  paid: "bg-green-50 text-green-700",
};

export function AdminApplications() {
  const [data, setData] = useState<ApplicationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API_BASE}/api/admin/applications?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load applications");
      setData((await res.json()) as ApplicationsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { void load(); }, [load]);

  return (
    <AdminPortalLayout>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-[28px]">
          <h1 className="text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Applications</h1>
          <p className="text-neutral-gray text-[14px] mt-[4px]">View all rental applications across the platform</p>
        </div>

        {/* Filter */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] mb-[16px] flex gap-[12px]">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {error && (
          <div className="mb-[16px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">{error}</div>
        )}

        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Tenant</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Listing</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Landlord</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Status</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Payment</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)] animate-pulse">
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[13px] w-[130px] bg-neutral-light-gray rounded-full mb-[6px]" />
                        <div className="h-[11px] w-[100px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[13px] w-[120px] bg-neutral-light-gray rounded-full mb-[6px]" />
                        <div className="h-[11px] w-[90px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[13px] w-[140px] bg-neutral-light-gray rounded-full mb-[6px]" />
                        <div className="h-[11px] w-[70px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[22px] w-[68px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[13px] w-[56px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[13px] w-[72px] bg-neutral-light-gray rounded-full" />
                      </td>
                    </tr>
                  ))
                ) : data?.applications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-[20px] py-[48px] text-center text-neutral-gray">
                      <FileText className="w-[40px] h-[40px] mx-auto mb-[12px] opacity-40" />
                      No applications found
                    </td>
                  </tr>
                ) : (
                  data?.applications.map((a) => (
                    <tr key={a.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-neutral-light-gray transition-colors">
                      <td className="px-[20px] py-[14px]">
                        {a.tenant ? (
                          <>
                            <p className="font-semibold text-neutral-black">{a.tenant.name}</p>
                            <p className="text-neutral-gray text-[12px]">{a.tenant.email}</p>
                          </>
                        ) : <span className="text-neutral-gray">—</span>}
                      </td>
                      <td className="px-[20px] py-[14px]">
                        {a.listing ? (
                          <>
                            <p className="font-medium text-neutral-black line-clamp-1 max-w-[180px]">{a.listing.title}</p>
                            <p className="text-neutral-gray text-[12px]">{a.listing.city}</p>
                          </>
                        ) : <span className="text-neutral-gray">—</span>}
                      </td>
                      <td className="px-[20px] py-[14px]">
                        {a.landlord ? (
                          <>
                            <p className="font-medium text-neutral-black">{a.landlord.name}</p>
                            <p className="text-neutral-gray text-[12px]">{a.landlord.email}</p>
                          </>
                        ) : <span className="text-neutral-gray">—</span>}
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold capitalize ${statusStyles[a.status]}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-[20px] py-[14px]">
                        {a.isPaid ? (
                          <div>
                            <span className="inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-full text-[12px] font-semibold bg-green-50 text-green-700">
                              <span className="w-[6px] h-[6px] bg-green-500 rounded-full" />
                              Paid
                            </span>
                            <p className="text-neutral-gray text-[12px] mt-[2px]">{a.currency} {a.paidAmount.toFixed(2)}</p>
                          </div>
                        ) : (
                          <span className="inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold bg-[#F1F5F9] text-neutral-gray">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-[20px] py-[14px] text-neutral-gray">
                        {new Date(a.createdAt).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {data && data.pages > 1 && (
            <div className="flex items-center justify-between px-[20px] py-[14px] border-t border-[rgba(0,0,0,0.06)]">
              <p className="text-[13px] text-neutral-gray">
                {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total} applications
              </p>
              <div className="flex items-center gap-[8px]">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-[8px] rounded-[8px] text-neutral-gray hover:bg-neutral-light-gray disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-[16px] h-[16px]" />
                </button>
                <span className="text-[13px] text-neutral-black font-medium px-[8px]">{page} / {data.pages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages}
                  className="p-[8px] rounded-[8px] text-neutral-gray hover:bg-neutral-light-gray disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-[16px] h-[16px]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminPortalLayout>
  );
}
