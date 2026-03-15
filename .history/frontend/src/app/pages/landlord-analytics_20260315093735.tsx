import { useEffect, useState } from "react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { useAuth } from "../contexts/auth-context";
import { Home, TrendingUp, Euro, Users } from "lucide-react";
import { API_BASE } from "../config";

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  inactiveListings: number;
  occupancyRate: number;
  occupancyChange: number;
  monthlyRevenue: number;
  revenueChange: number;
  unreadMessages: number;
  pendingApplications: number;
  upcomingCheckouts: number;
}

interface TopProperty {
  id: number;
  title: string;
  views: number;
  inquiries: number;
  bookingRate: number;
}

interface DashboardResponse {
  stats: DashboardStats;
  topProperties: TopProperty[];
}

export function LandlordAnalytics() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    inactiveListings: 0,
    occupancyRate: 0,
    occupancyChange: 0,
    monthlyRevenue: 0,
    revenueChange: 0,
    unreadMessages: 0,
    pendingApplications: 0,
    upcomingCheckouts: 0,
  });
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!isAuthenticated || user?.role !== "landlord") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("Missing auth token");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/landlord/dashboard`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load analytics");
        }

        const payload = (await response.json()) as DashboardResponse;
        setStats(payload.stats);
        setTopProperties(payload.topProperties);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, [isAuthenticated, user?.role]);

  return (
    <LandlordPortalLayout>
      <main className="flex-1 p-[32px]">
        <div className="mb-[32px]">
          <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
            Analytics
          </h1>
          <p className="text-neutral-gray text-[16px]">Performance overview for your listings</p>
          {isLoading && <p className="text-neutral-gray text-[14px] mt-[8px]">Loading analytics...</p>}
          {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
        </div>

        <div className="grid grid-cols-4 gap-[24px] mb-[32px]">
          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px]">
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-brand-light flex items-center justify-center">
                <Home className="w-[24px] h-[24px] text-brand-primary" />
              </div>
              <span className="text-[13px] text-neutral-gray">Total</span>
            </div>
            <div className="text-[36px] font-bold text-neutral-black tracking-[-0.02em] mb-[4px]">
              {stats.totalProperties}
            </div>
            <div className="text-[14px] text-neutral-gray">Properties</div>
            <div className="mt-[12px] flex items-center gap-[8px]">
              <span className="px-[8px] py-[3px] text-[11px] font-bold bg-accent-blue/10 text-accent-blue">
                Active {stats.activeListings}
              </span>
              <span className="px-[8px] py-[3px] text-[11px] font-bold bg-neutral-gray/10 text-neutral-gray">
                Inactive {stats.inactiveListings}
              </span>
            </div>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px]">
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-brand-light flex items-center justify-center">
                <TrendingUp className="w-[24px] h-[24px] text-brand-primary" />
              </div>
              <span className="text-[13px] text-neutral-gray">Rate</span>
            </div>
            <div className="text-[36px] font-bold text-neutral-black tracking-[-0.02em] mb-[4px]">
              {stats.occupancyRate}%
            </div>
            <div className="text-[14px] text-neutral-gray">Occupancy</div>
            <div className="mt-[12px] flex items-center gap-[4px] text-[13px] text-accent-blue font-semibold">
              <TrendingUp className="w-[14px] h-[14px]" />
              {stats.occupancyChange >= 0 ? "+" : ""}
              {stats.occupancyChange}% from last month
            </div>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px]">
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-brand-light flex items-center justify-center">
                <Euro className="w-[24px] h-[24px] text-brand-primary" />
              </div>
              <span className="text-[13px] text-neutral-gray">This month</span>
            </div>
            <div className="text-[36px] font-bold text-neutral-black tracking-[-0.02em] mb-[4px]">
              €{stats.monthlyRevenue.toLocaleString()}
            </div>
            <div className="text-[14px] text-neutral-gray">Revenue</div>
            <div className="mt-[12px] flex items-center gap-[4px] text-[13px] text-accent-blue font-semibold">
              <TrendingUp className="w-[14px] h-[14px]" />
              {stats.revenueChange >= 0 ? "+" : ""}
              {stats.revenueChange}% vs last month
            </div>
          </div>

          <div className="bg-white border border-[rgba(0,0,0,0.08)] p-[24px]">
            <div className="flex items-start justify-between mb-[16px]">
              <div className="w-[48px] h-[48px] bg-brand-light flex items-center justify-center">
                <Users className="w-[24px] h-[24px] text-brand-primary" />
              </div>
              <span className="text-[13px] text-neutral-gray">Pending</span>
            </div>
            <div className="text-[36px] font-bold text-neutral-black tracking-[-0.02em] mb-[4px]">
              {stats.pendingApplications}
            </div>
            <div className="text-[14px] text-neutral-gray">Applications</div>
            <div className="mt-[12px] text-[13px] text-brand-primary font-semibold">Review now →</div>
          </div>
        </div>

        <div className="bg-white border border-[rgba(0,0,0,0.08)]">
          <div className="px-[24px] py-[20px] border-b border-[rgba(0,0,0,0.08)]">
            <h2 className="text-neutral-black text-[18px] font-bold">Top Performing Properties</h2>
            <p className="text-neutral-gray text-[13px] mt-[4px]">Last 30 days</p>
          </div>
          <div className="p-[24px]">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[rgba(0,0,0,0.08)]">
                  <th className="pb-[12px] text-[12px] font-bold text-neutral-gray uppercase tracking-[0.05em]">
                    Property
                  </th>
                  <th className="pb-[12px] text-[12px] font-bold text-neutral-gray uppercase tracking-[0.05em] text-right">
                    Views
                  </th>
                  <th className="pb-[12px] text-[12px] font-bold text-neutral-gray uppercase tracking-[0.05em] text-right">
                    Inquiries
                  </th>
                  <th className="pb-[12px] text-[12px] font-bold text-neutral-gray uppercase tracking-[0.05em] text-right">
                    Booking Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProperties.map((property, index) => (
                  <tr key={property.id} className="border-b border-[rgba(0,0,0,0.08)]">
                    <td className="py-[16px]">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[32px] h-[32px] bg-brand-light flex items-center justify-center">
                          <span className="text-brand-primary text-[14px] font-bold">{index + 1}</span>
                        </div>
                        <span className="text-neutral-black text-[14px] font-semibold">{property.title}</span>
                      </div>
                    </td>
                    <td className="py-[16px] text-neutral-black text-[14px] font-semibold text-right">
                      {property.views.toLocaleString()}
                    </td>
                    <td className="py-[16px] text-neutral-black text-[14px] font-semibold text-right">
                      {property.inquiries}
                    </td>
                    <td className="py-[16px] text-right">
                      <span className="inline-flex items-center gap-[4px] text-accent-blue text-[14px] font-bold">
                        {property.bookingRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {topProperties.length === 0 && (
                  <tr>
                    <td className="py-[16px] text-neutral-gray text-[14px]" colSpan={4}>
                      No property analytics available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </LandlordPortalLayout>
  );
}
