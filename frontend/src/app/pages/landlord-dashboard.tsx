import { Link } from "react-router";
import { useEffect, useState } from "react";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { useAuth } from "../contexts/auth-context";
import { API_BASE } from "../config";
import { Skeleton } from "../components/ui/skeleton";

interface DashboardStats {
  unreadMessages: number;
  pendingApplications: number;
}

interface DashboardResponse {
  stats: DashboardStats;
}

export function LandlordDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    unreadMessages: 0,
    pendingApplications: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      if (!isAuthenticated || user?.role !== "landlord") {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/landlord/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load landlord dashboard");
        }

        const payload = (await response.json()) as DashboardResponse;
        setStats({
          unreadMessages: payload.stats?.unreadMessages ?? 0,
          pendingApplications: payload.stats?.pendingApplications ?? 0,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load landlord dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, [isAuthenticated, user?.role]);

  return (
    <LandlordPortalLayout>
      <main className="flex-1 p-[32px]">
        <div className="mb-[28px]">
          <h1 className="text-neutral-black text-[24px] font-bold tracking-[-0.02em] mb-[8px]">
            Stay connected with interested tenants
          </h1>
          <p className="text-neutral-gray text-[14px]">
            Faster replies improve your performance score. A higher score means better visibility in search results.
          </p>
          {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-[24px]">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-[28px] space-y-[14px]">
              <Skeleton className="h-[30px] w-[300px]" />
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[52px] w-[200px]" />
            </div>
            <div className="space-y-[16px]">
              <Skeleton className="h-[110px] w-full" />
              <Skeleton className="h-[110px] w-full" />
              <Skeleton className="h-[120px] w-full" />
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-[24px] items-start">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-[28px]">
              <h2 className="text-[#12303B] text-[34px] font-bold leading-[1.05] mb-[16px]">Ready for your first request?</h2>

              <div className="w-[92px] h-[92px] mx-auto my-[8px]">
                <img
                  src="/src/assets/business-report.svg"
                  alt="Business report illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[#35515D] text-[16px] leading-[1.45] text-center max-w-[560px] mx-auto">
                To get started, make sure your listings are published and looking their best.
              </p>

              <div className="mt-[26px] flex justify-center">
                <Link
                  to="/landlord/listings"
                  className="h-[48px] min-w-[220px] px-[24px] bg-brand-primary text-white text-[18px] font-bold inline-flex items-center justify-center hover:bg-brand-primary-dark transition-colors"
                >
                  Go to listings
                </Link>
              </div>
            </div>

            <div className="space-y-[18px]">
              <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-[20px]">
                <p className="text-[#35515D] text-[15px] mb-[10px]">Response time</p>
                <p className="text-[#12303B] text-[22px] font-bold leading-[1]">-</p>
                <span className="mt-[12px] inline-flex px-[12px] py-[4px] rounded-full text-[13px] font-semibold bg-[#E9EEF2] text-[#35515D]">
                  Pending
                </span>
              </div>

              <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-[20px]">
                <p className="text-[#35515D] text-[15px] mb-[10px]">Response rate</p>
                <p className="text-[#12303B] text-[22px] font-bold leading-[1]">-</p>
                <span className="mt-[12px] inline-flex px-[12px] py-[4px] rounded-full text-[13px] font-semibold bg-[#E9EEF2] text-[#35515D]">
                  Pending
                </span>
              </div>

              <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-[20px]">
                <h3 className="text-[#12303B] text-[22px] font-bold leading-[1.2] mb-[8px]">Stay competitive</h3>
                <p className="text-[#35515D] text-[15px] leading-[1.55]">
                  High scores, high ranking. Landlords with fast replies and a 100% response rate appear higher in search results.
                </p>
                {(stats.unreadMessages > 0 || stats.pendingApplications > 0) && (
                  <p className="mt-[12px] text-[14px] text-[#35515D]">
                    You currently have {stats.unreadMessages} unread message(s) and {stats.pendingApplications} pending application(s).
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </LandlordPortalLayout>
  );
}
