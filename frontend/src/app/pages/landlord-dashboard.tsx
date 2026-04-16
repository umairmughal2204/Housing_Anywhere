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
      <main className="flex-1 py-[32px] px-[20px] md:px-[110px] xl:px-[150px]">
        <div className="mb-[28px]">
          <h1 className="text-neutral-black text-[28px] font-bold tracking-[-0.03em] mb-[8px]">
            Stay connected with interested tenants
          </h1>
          <p className="text-neutral-gray text-[14px]">
            Faster replies improve your performance score. A higher score means better visibility in search results.
          </p>
          {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-[24px] max-w-[860px] mx-auto">
            <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] p-[28px] space-y-[14px]">
              <Skeleton className="h-[30px] w-[300px]" />
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-[52px] w-[200px]" />
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-1 gap-[24px] items-start max-w-[860px] mx-auto">
            <div className="bg-white border border-[#E3E8EE] rounded-[14px] p-[28px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h2 className="text-[#12303B] text-[22px] font-bold leading-[1.15] mb-[12px] text-center">Ready for your first request?</h2>

              <div className="w-[68px] h-[68px] mx-auto my-[6px]">
                <img
                  src="/src/assets/business-report.svg"
                  alt="Business report illustration"
                  className="w-full h-full object-contain"
                />
              </div>

              <p className="text-[#35515D] text-[14px] leading-[1.45] text-center max-w-[520px] mx-auto">
                To get started, make sure your listings are published and looking their best.
              </p>

              <div className="mt-[18px] flex justify-center">
                <Link
                  to="/landlord/listings"
                  className="h-[40px] min-w-[180px] px-[18px] inline-flex items-center justify-center rounded-[12px] border border-[#0BA5C7] bg-[#0BA5C7] text-white text-[14px] font-semibold shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#0897B5] hover:border-[#0897B5] transition-colors"
                >
                  Go to listings
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </LandlordPortalLayout>
  );
}
