import { useEffect, useState } from "react";
import { Users, Home, FileText, DollarSign, UserCheck, UserX } from "lucide-react";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { API_BASE } from "../config";

interface Stats {
  totalUsers: number;
  totalLandlords: number;
  totalTenants: number;
  totalListings: number;
  totalApplications: number;
  paidApplications: number;
  revenue: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  sub?: string;
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[24px] flex items-start gap-[16px]">
      <div className="w-[48px] h-[48px] rounded-[12px] bg-brand-light flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-neutral-gray text-[13px] font-medium mb-[4px]">{label}</p>
        <p className="text-neutral-black text-[28px] font-bold leading-none">{value}</p>
        {sub && <p className="text-neutral-gray text-[12px] mt-[4px]">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load stats");
        setStats((await res.json()) as Stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-EU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <AdminPortalLayout>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-[32px]">
          <h1 className="text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Dashboard</h1>
          <p className="text-neutral-gray text-[14px] mt-[4px]">Platform overview and key metrics</p>
        </div>

        {error && (
          <div className="mb-[24px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[24px] h-[100px] animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
              <StatCard
                label="Total Users"
                value={stats.totalUsers.toLocaleString()}
                icon={<Users className="w-[22px] h-[22px] text-brand-primary" />}
              />
              <StatCard
                label="Landlords"
                value={stats.totalLandlords.toLocaleString()}
                icon={<UserCheck className="w-[22px] h-[22px] text-brand-primary" />}
                sub={`${stats.totalTenants.toLocaleString()} tenants`}
              />
              <StatCard
                label="Tenants"
                value={stats.totalTenants.toLocaleString()}
                icon={<UserX className="w-[22px] h-[22px] text-brand-primary" />}
              />
              <StatCard
                label="Total Listings"
                value={stats.totalListings.toLocaleString()}
                icon={<Home className="w-[22px] h-[22px] text-brand-primary" />}
              />
              <StatCard
                label="Applications"
                value={stats.totalApplications.toLocaleString()}
                icon={<FileText className="w-[22px] h-[22px] text-brand-primary" />}
                sub={`${stats.paidApplications.toLocaleString()} paid`}
              />
              <StatCard
                label="Revenue"
                value={formatCurrency(stats.revenue)}
                icon={<DollarSign className="w-[22px] h-[22px] text-brand-primary" />}
                sub="from paid applications"
              />
            </div>
          </>
        ) : null}
      </div>
    </AdminPortalLayout>
  );
}
