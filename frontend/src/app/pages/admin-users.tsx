import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, ShieldOff, Shield, Users } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { API_BASE } from "../config";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "tenant" | "landlord";
  isBanned: boolean;
  createdAt: string;
}

interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  pages: number;
}

interface ConfirmModal {
  type: "ban" | "unban" | "role";
  userId: string;
  userName: string;
  newRole?: "tenant" | "landlord";
}

export function AdminUsers() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<ConfirmModal | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
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
  }, [page, search, roleFilter]);

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
      }
      setConfirm(null);
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
        <div className="mb-[28px]">
          <h1 className="text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Users</h1>
          <p className="text-neutral-gray text-[14px] mt-[4px]">Manage all registered users</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] mb-[16px] flex flex-wrap gap-[12px] items-center">
          <form onSubmit={handleSearch} className="flex items-center gap-[8px] flex-1 min-w-[200px]">
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
        </div>

        {error && (
          <div className="mb-[16px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">{error}</div>
        )}

        <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">User</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Role</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Status</th>
                  <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Joined</th>
                  <th className="text-right px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)] animate-pulse">
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[14px] w-[120px] bg-neutral-light-gray rounded-full mb-[6px]" />
                        <div className="h-[11px] w-[160px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[22px] w-[64px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[22px] w-[56px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="h-[13px] w-[80px] bg-neutral-light-gray rounded-full" />
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="flex items-center justify-end gap-[8px]">
                          <div className="h-[28px] w-[56px] bg-neutral-light-gray rounded-[8px]" />
                          <div className="h-[28px] w-[72px] bg-neutral-light-gray rounded-[8px]" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : data?.users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-[20px] py-[48px] text-center text-neutral-gray">
                      <Users className="w-[40px] h-[40px] mx-auto mb-[12px] opacity-40" />
                      No users found
                    </td>
                  </tr>
                ) : (
                  data?.users.map((u) => (
                    <tr key={u.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-neutral-light-gray transition-colors">
                      <td className="px-[20px] py-[14px]">
                        <p className="font-semibold text-neutral-black">{u.name}</p>
                        <p className="text-neutral-gray text-[12px]">{u.email}</p>
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <span className={`inline-flex px-[10px] py-[4px] rounded-full text-[12px] font-semibold capitalize ${
                          u.role === "landlord" ? "bg-blue-50 text-blue-700" : "bg-[#F1F5F9] text-neutral-gray"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <span className={`inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12px] font-semibold ${
                          u.isBanned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                        }`}>
                          <span className={`w-[6px] h-[6px] rounded-full ${u.isBanned ? "bg-red-500" : "bg-green-500"}`} />
                          {u.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-[20px] py-[14px] text-neutral-gray">
                        {new Date(u.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-[20px] py-[14px]">
                        <div className="flex items-center justify-end gap-[8px]">
                          <button
                            type="button"
                            onClick={() => setConfirm({ type: u.isBanned ? "unban" : "ban", userId: u.id, userName: u.name })}
                            className={`inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-colors ${
                              u.isBanned
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-red-50 text-red-600 hover:bg-red-100"
                            }`}
                          >
                            {u.isBanned ? <Shield className="w-[14px] h-[14px]" /> : <ShieldOff className="w-[14px] h-[14px]" />}
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirm({
                              type: "role",
                              userId: u.id,
                              userName: u.name,
                              newRole: u.role === "tenant" ? "landlord" : "tenant",
                            })}
                            className="inline-flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold bg-[#F1F5F9] text-neutral-black hover:bg-[#E2E8F0] transition-colors"
                          >
                            → {u.role === "tenant" ? "Landlord" : "Tenant"}
                          </button>
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
              <p className="text-[13px] text-neutral-gray">
                {((page - 1) * 20) + 1}–{Math.min(page * 20, data.total)} of {data.total} users
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

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-[24px]">
          <div className="w-full max-w-[420px] bg-white border border-[rgba(0,0,0,0.12)] rounded-[16px] p-[28px] shadow-xl">
            <h3 className="text-[18px] font-bold text-neutral-black mb-[8px]">
              {confirm.type === "ban" && "Ban User"}
              {confirm.type === "unban" && "Unban User"}
              {confirm.type === "role" && "Change Role"}
            </h3>
            <p className="text-neutral-gray text-[14px] leading-[1.6] mb-[24px]">
              {confirm.type === "ban" && <>Are you sure you want to <strong>ban</strong> <strong>{confirm.userName}</strong>? They will be unable to access the platform.</>}
              {confirm.type === "unban" && <>Unban <strong>{confirm.userName}</strong>? They will regain access to the platform.</>}
              {confirm.type === "role" && <>Change <strong>{confirm.userName}</strong>'s role to <strong>{confirm.newRole}</strong>?</>}
            </p>
            <div className="flex items-center justify-end gap-[10px]">
              <button
                onClick={() => setConfirm(null)}
                className="px-[16px] py-[10px] border border-[rgba(0,0,0,0.16)] text-neutral-black text-[13px] font-semibold rounded-[10px] hover:bg-neutral-light-gray transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { void executeAction(); }}
                disabled={actionLoading}
                className={`px-[16px] py-[10px] text-white text-[13px] font-semibold rounded-[10px] transition-colors disabled:opacity-60 ${
                  confirm.type === "ban" ? "bg-red-500 hover:bg-red-600" : "bg-brand-primary hover:bg-brand-primary-dark"
                }`}
              >
                {actionLoading ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPortalLayout>
  );
}
