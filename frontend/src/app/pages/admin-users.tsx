import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldOff, Shield, Users, AlertTriangle, CheckCircle2, XCircle, Flag } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { API_BASE } from "../config";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "tenant" | "landlord";
  isBanned: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationStatus: "pending" | "verified" | "rejected" | "flagged";
  verificationNotes: string;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

interface ConfirmModal {
  type: "ban" | "unban" | "role" | "verification";
  userId: string;
  userName: string;
  newRole?: "tenant" | "landlord";
  verificationStatus?: "pending" | "verified" | "rejected" | "flagged";
}

export function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<ConfirmModal | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (verificationFilter) params.set("verificationStatus", verificationFilter);
      const res = await fetch(`${API_BASE}/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load users");
      setData((await res.json()) as UsersResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, roleFilter, verificationFilter]);

  useEffect(() => { void load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const executeAction = async () => {
    if (!confirm) return;
    const token = localStorage.getItem("authToken");
    setActionLoading(true);
    try {
      if (confirm.type === "ban" || confirm.type === "unban") {
        await fetch(`${API_BASE}/api/admin/users/${confirm.userId}/ban`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ isBanned: confirm.type === "ban" }),
        });
      } else if (confirm.type === "role" && confirm.newRole) {
        await fetch(`${API_BASE}/api/admin/users/${confirm.userId}/role`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ role: confirm.newRole }),
        });
      } else if (confirm.type === "verification" && confirm.verificationStatus) {
        await fetch(`${API_BASE}/api/admin/users/${confirm.userId}/verification`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ verificationStatus: confirm.verificationStatus, verificationNotes }),
        });
      }
      setConfirm(null);
      setVerificationNotes("");
      void load();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-[20px] sm:mb-[28px]">
          <h1 className="text-[22px] sm:text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Users</h1>
          <p className="text-neutral-gray text-[13px] sm:text-[14px] mt-[4px]">Manage all registered users</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[12px] sm:p-[16px] mb-[16px] flex flex-col sm:flex-row flex-wrap gap-[10px] sm:gap-[12px] items-stretch sm:items-center">
          <form onSubmit={handleSearch} className="flex items-center gap-[8px] flex-1 min-w-[0]">
            <div className="relative flex-1">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-neutral-gray" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name or email…"
                className="w-full pl-[38px] pr-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary"
              />
            </div>
            <button type="submit" className="px-[16px] py-[10px] bg-brand-primary text-white text-[14px] font-semibold rounded-[10px] hover:bg-brand-primary-dark transition-colors">
              Search
            </button>
          </form>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white"
          >
            <option value="">All roles</option>
            <option value="tenant">Tenants</option>
            <option value="landlord">Landlords</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
            className="px-[14px] py-[10px] border border-[rgba(0,0,0,0.1)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary bg-white"
          >
            <option value="">All verifications</option>
            <option value="pending">Pending review</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {error && (
          <div className="mb-[16px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">{error}</div>
        )}

        {/* Mobile card list */}
        <div className="flex flex-col gap-[12px] md:hidden">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[14px] p-[16px] animate-pulse">
                <div className="h-[14px] w-[140px] bg-neutral-light-gray rounded-full mb-[8px]" />
                <div className="h-[11px] w-[180px] bg-neutral-light-gray rounded-full mb-[12px]" />
                <div className="flex gap-[8px]">
                  <div className="h-[28px] w-[60px] bg-neutral-light-gray rounded-[8px]" />
                  <div className="h-[28px] w-[60px] bg-neutral-light-gray rounded-[8px]" />
                </div>
              </div>
            ))
          ) : data?.users.length === 0 ? (
            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[14px] p-[40px] text-center text-neutral-gray">
              <Users className="w-[36px] h-[36px] mx-auto mb-[10px] opacity-40" />
              No users found
            </div>
          ) : (
            data?.users.map((u) => (
              <div key={u.id} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[14px] p-[16px]">
                <div className="flex items-start justify-between gap-[12px] mb-[10px]">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-black text-[15px] truncate">{u.name}</p>
                    <p className="text-neutral-gray text-[12px] truncate">{u.email}</p>
                    <p className="text-neutral-gray text-[11px] mt-[2px]">Joined {new Date(u.createdAt).toLocaleDateString("en-GB")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-[4px] flex-shrink-0">
                    <span className={`inline-flex px-[8px] py-[3px] rounded-full text-[11px] font-semibold capitalize ${
                      u.role === "landlord" ? "bg-blue-50 text-blue-700" : "bg-[#F1F5F9] text-neutral-gray"
                    }`}>{u.role}</span>
                    <span className={`inline-flex items-center gap-[4px] px-[8px] py-[3px] rounded-full text-[11px] font-semibold ${
                      u.isBanned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                    }`}>
                      <span className={`w-[5px] h-[5px] rounded-full ${u.isBanned ? "bg-red-500" : "bg-green-500"}`} />
                      {u.isBanned ? "Banned" : "Active"}
                    </span>
                    <span className={`inline-flex px-[8px] py-[3px] rounded-full text-[11px] font-semibold capitalize ${
                      u.verificationStatus === "verified" ? "bg-green-50 text-green-700" :
                      u.verificationStatus === "flagged" || u.verificationStatus === "rejected" ? "bg-red-50 text-red-600" :
                      "bg-amber-50 text-amber-700"
                    }`}>{u.verificationStatus}</span>
                  </div>
                </div>
                {u.verificationNotes && <p className="text-neutral-gray text-[12px] mb-[10px] line-clamp-2 italic">{u.verificationNotes}</p>}
                <div className="flex flex-wrap gap-[6px] pt-[10px] border-t border-[rgba(0,0,0,0.06)]">
                  <button type="button" onClick={() => setConfirm({ type: u.isBanned ? "unban" : "ban", userId: u.id, userName: u.name })}
                    className={`inline-flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-colors ${
                      u.isBanned ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                    }`}>
                    {u.isBanned ? <Shield className="w-[13px] h-[13px]" /> : <ShieldOff className="w-[13px] h-[13px]" />}
                    {u.isBanned ? "Unban" : "Ban"}
                  </button>
                  <button type="button" onClick={() => setConfirm({ type: "role", userId: u.id, userName: u.name, newRole: u.role === "tenant" ? "landlord" : "tenant" })}
                    className="inline-flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-[#F1F5F9] text-neutral-black hover:bg-[#E2E8F0] transition-colors">
                    → {u.role === "tenant" ? "Landlord" : "Tenant"}
                  </button>
                  <button type="button" onClick={() => setConfirm({ type: "verification", userId: u.id, userName: u.name, verificationStatus: "verified" })}
                    className="inline-flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                    <CheckCircle2 className="w-[13px] h-[13px]" /> Verify
                  </button>
                  <button type="button" onClick={() => setConfirm({ type: "verification", userId: u.id, userName: u.name, verificationStatus: "flagged" })}
                    className="inline-flex items-center gap-[5px] px-[10px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                    <Flag className="w-[13px] h-[13px]" /> Flag
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">User</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Role</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Account</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Verification</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Joined</th>
                  <th className="text-right px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)] animate-pulse">
                      <td className="px-[20px] py-[14px]"><div className="h-[14px] w-[120px] bg-neutral-light-gray rounded-full mb-[6px]" /><div className="h-[11px] w-[160px] bg-neutral-light-gray rounded-full" /></td>
                      <td className="px-[20px] py-[14px]"><div className="h-[22px] w-[64px] bg-neutral-light-gray rounded-full" /></td>
                      <td className="px-[20px] py-[14px]"><div className="h-[22px] w-[56px] bg-neutral-light-gray rounded-full" /></td>
                      <td className="px-[20px] py-[14px]"><div className="h-[13px] w-[80px] bg-neutral-light-gray rounded-full" /></td>
                      <td className="px-[20px] py-[14px]"><div className="h-[13px] w-[72px] bg-neutral-light-gray rounded-full" /></td>
                      <td className="px-[20px] py-[14px]"><div className="flex justify-end gap-[8px]"><div className="h-[28px] w-[56px] bg-neutral-light-gray rounded-[8px]" /><div className="h-[28px] w-[72px] bg-neutral-light-gray rounded-[8px]" /></div></td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr><td colSpan={6} className="px-[20px] py-[48px] text-center text-neutral-gray"><Users className="w-[40px] h-[40px] mx-auto mb-[12px] opacity-40" />No users found</td></tr>
                ) : (
                  data?.users.map((u) => (
                    <tr key={u.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-neutral-light-gray transition-colors">
                      <td className="px-[20px] py-[14px]"><p className="font-semibold text-neutral-black">{u.name}</p><p className="text-neutral-gray text-[12px]">{u.email}</p></td>
                      <td className="px-[20px] py-[14px]"><span className={`inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold capitalize ${u.role === "landlord" ? "bg-blue-50 text-blue-700" : "bg-[#F1F5F9] text-neutral-gray"}`}>{u.role}</span></td>
                      <td className="px-[20px] py-[14px]">
                        <span className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] font-semibold ${u.isBanned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}><span className={`w-[6px] h-[6px] rounded-full ${u.isBanned ? "bg-red-500" : "bg-green-500"}`} />{u.isBanned ? "Banned" : "Active"}</span>
                        <p className="text-neutral-gray text-[12px] mt-[6px]">Email: {u.emailVerified ? "Verified" : "Pending"}</p>
                        <p className="text-neutral-gray text-[12px]">Phone: {u.phoneVerified ? "Verified" : "Pending"}</p>
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold capitalize ${u.verificationStatus === "verified" ? "bg-green-50 text-green-700" : u.verificationStatus === "flagged" || u.verificationStatus === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{u.verificationStatus}</span>
                        {u.verificationNotes && <p className="text-neutral-gray text-[12px] mt-[6px] max-w-[180px] line-clamp-2">{u.verificationNotes}</p>}
                      </td>
                      <td className="px-[20px] py-[14px] text-neutral-gray">{new Date(u.createdAt).toLocaleDateString("en-GB")}</td>
                      <td className="px-[20px] py-[14px]">
                        <div className="flex flex-wrap items-center justify-end gap-[8px]">
                          <button type="button" onClick={() => setConfirm({ type: u.isBanned ? "unban" : "ban", userId: u.id, userName: u.name })} className={`inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-colors ${u.isBanned ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>{u.isBanned ? <Shield className="w-[14px] h-[14px]" /> : <ShieldOff className="w-[14px] h-[14px]" />}{u.isBanned ? "Unban" : "Ban"}</button>
                          <button type="button" onClick={() => setConfirm({ type: "role", userId: u.id, userName: u.name, newRole: u.role === "tenant" ? "landlord" : "tenant" })} className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-[#F1F5F9] text-neutral-black hover:bg-[#E2E8F0] transition-colors">→ {u.role === "tenant" ? "Landlord" : "Tenant"}</button>
                          <button type="button" onClick={() => setConfirm({ type: "verification", userId: u.id, userName: u.name, verificationStatus: "verified" })} className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors"><CheckCircle2 className="w-[14px] h-[14px]" />Verify</button>
                          <button type="button" onClick={() => setConfirm({ type: "verification", userId: u.id, userName: u.name, verificationStatus: "flagged" })} className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"><Flag className="w-[14px] h-[14px]" />Flag</button>
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
              <p className="text-[13px] text-neutral-gray">{((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total} users</p>
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
          <div className="flex md:hidden items-center justify-between mt-[12px] px-[4px]">
            <p className="text-[13px] text-neutral-gray">{((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total}</p>
            <div className="flex items-center gap-[8px]">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-[8px] rounded-[8px] bg-white border border-[rgba(0,0,0,0.08)] text-neutral-gray disabled:opacity-40"><ChevronLeft className="w-[16px] h-[16px]" /></button>
              <span className="text-[13px] font-medium">{page} / {data.pages}</span>
              <button type="button" onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="p-[8px] rounded-[8px] bg-white border border-[rgba(0,0,0,0.08)] text-neutral-gray disabled:opacity-40"><ChevronRight className="w-[16px] h-[16px]" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-[80] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-[24px]"
          onClick={(e) => { if (e.target === e.currentTarget) { setConfirm(null); setVerificationNotes(""); } }}
        >
          <div className="w-full sm:max-w-[460px] bg-white border border-[rgba(0,0,0,0.12)] rounded-t-[20px] sm:rounded-[20px] p-[24px] sm:p-[28px] shadow-xl">
            {/* Icon */}
            <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center mb-[16px] mx-auto ${
              confirm.type === "ban" ? "bg-red-100" :
              confirm.type === "unban" ? "bg-green-100" :
              confirm.type === "verification" && confirm.verificationStatus === "flagged" ? "bg-amber-100" :
              "bg-blue-50"
            }`}>
              {confirm.type === "ban" && <AlertTriangle className="w-[26px] h-[26px] text-red-500" />}
              {confirm.type === "unban" && <Shield className="w-[26px] h-[26px] text-green-600" />}
              {confirm.type === "role" && <Users className="w-[26px] h-[26px] text-blue-600" />}
              {confirm.type === "verification" && confirm.verificationStatus === "verified" && <CheckCircle2 className="w-[26px] h-[26px] text-green-600" />}
              {confirm.type === "verification" && confirm.verificationStatus === "flagged" && <Flag className="w-[26px] h-[26px] text-amber-600" />}
              {confirm.type === "verification" && confirm.verificationStatus !== "verified" && confirm.verificationStatus !== "flagged" && <XCircle className="w-[26px] h-[26px] text-red-500" />}
            </div>

            <h3 className="text-[18px] font-bold text-neutral-black mb-[8px] text-center">
              {confirm.type === "ban" && "Ban User"}
              {confirm.type === "unban" && "Unban User"}
              {confirm.type === "role" && "Change Role"}
              {confirm.type === "verification" && "Update Verification"}
            </h3>

            <p className="text-neutral-gray text-[14px] leading-[1.65] mb-[20px] text-center">
              {confirm.type === "ban" && <><strong className="text-red-600">This will block {confirm.userName}</strong> from accessing the platform. You can unban them later.</>}
              {confirm.type === "unban" && <>Restore access for <strong>{confirm.userName}</strong>? They will be able to log in again.</>}
              {confirm.type === "role" && <>Change <strong>{confirm.userName}</strong>'s role to <strong>{confirm.newRole}</strong>? This affects what they can do on the platform.</>}
              {confirm.type === "verification" && <>Set <strong>{confirm.userName}</strong>'s verification status to <strong>{confirm.verificationStatus}</strong>.</>}
            </p>

            {confirm.type === "ban" && (
              <div className="bg-red-50 border border-red-200 rounded-[10px] px-[14px] py-[10px] mb-[20px] text-[13px] text-red-700">
                ⚠️ The user will immediately lose access to all features.
              </div>
            )}

            {confirm.type === "verification" && (
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add notes about this verification decision…"
                className="w-full min-h-[88px] px-[12px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] outline-none focus:border-brand-primary mb-[20px] resize-none"
              />
            )}

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-[10px]">
              <button
                onClick={() => { setConfirm(null); setVerificationNotes(""); }}
                className="px-[16px] py-[11px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[14px] font-semibold rounded-[10px] hover:bg-neutral-light-gray transition-colors text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => { void executeAction(); }}
                disabled={actionLoading}
                className={`px-[20px] py-[11px] text-white text-[14px] font-semibold rounded-[10px] transition-colors disabled:opacity-60 text-center ${
                  confirm.type === "ban" ? "bg-red-500 hover:bg-red-600" :
                  confirm.type === "unban" ? "bg-green-600 hover:bg-green-700" :
                  "bg-brand-primary hover:bg-brand-primary-dark"
                }`}
              >
                {actionLoading ? "Processing…" : (
                  confirm.type === "ban" ? "Yes, Ban User" :
                  confirm.type === "unban" ? "Yes, Restore Access" :
                  confirm.type === "role" ? "Change Role" :
                  `Set to ${confirm.verificationStatus ?? "update"}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
}
