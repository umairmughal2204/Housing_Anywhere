import { Link } from "react-router";
import { LandlordPortalLayout } from "../components/landlord-portal-layout";
import { useEffect, useState } from "react";
import { 
  Home,
  MessageSquare,
  TrendingUp,
  Users,
  Euro,
  Calendar,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { API_BASE } from "../config";

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  occupancyRate: number;
  occupancyChange: number;
  monthlyRevenue: number;
  revenueChange: number;
  unreadMessages: number;
  pendingApplications: number;
  upcomingCheckouts: number;
}

interface ActivityItem {
  id: number;
  type: "message" | "application" | "booking" | "viewing";
  text: string;
  time: string;
}

interface UpcomingEvent {
  id: number;
  type: "checkout" | "checkin" | "inspection";
  property: string;
  tenant: string;
  date: string;
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
  recentActivity: ActivityItem[];
  upcomingEvents: UpcomingEvent[];
  topProperties: TopProperty[];
}

export function LandlordDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    occupancyRate: 0,
    occupancyChange: 0,
    monthlyRevenue: 0,
    revenueChange: 0,
    unreadMessages: 0,
    pendingApplications: 0,
    upcomingCheckouts: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = (await response.json()) as { message?: string };
          throw new Error(payload.message ?? "Failed to load landlord dashboard");
        }

        const payload = (await response.json()) as DashboardResponse;
        setStats(payload.stats);
        setRecentActivity(payload.recentActivity);
        setUpcomingEvents(payload.upcomingEvents);
        setTopProperties(payload.topProperties);
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
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="text-neutral-black text-[32px] font-bold tracking-[-0.02em] mb-[8px]">
            Dashboard
          </h1>
          <p className="text-neutral-gray text-[16px]">
            Overview of your rental business
          </p>
          {isLoading && <p className="text-neutral-gray text-[14px] mt-[8px]">Loading dashboard...</p>}
          {!isLoading && error && <p className="text-brand-primary text-[14px] mt-[8px]">{error}</p>}
        </div>

        {/* Key Metrics */}
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
            <div className="mt-[12px] text-[13px] text-accent-blue font-semibold">
              {stats.activeListings} active listings
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
              {stats.occupancyChange >= 0 ? "+" : ""}{stats.occupancyChange}% from last month
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
              +{stats.revenueChange}% vs last month
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
            <div className="mt-[12px] text-[13px] text-brand-primary font-semibold">
              Review now →
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-[24px]">
          {/* Top Performing Properties */}
          <div className="col-span-2 bg-white border border-[rgba(0,0,0,0.08)]">
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
                          <span className="text-neutral-black text-[14px] font-semibold">
                            {property.title}
                          </span>
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

          {/* Upcoming Events */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)]">
            <div className="px-[24px] py-[20px] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-neutral-black text-[18px] font-bold">Upcoming Events</h2>
              <p className="text-neutral-gray text-[13px] mt-[4px]">Next 7 days</p>
            </div>
            <div className="p-[24px] space-y-[16px]">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex gap-[12px]">
                  <div className="w-[40px] h-[40px] bg-brand-light flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-[20px] h-[20px] text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-black text-[14px] font-semibold mb-[2px]">
                      {event.type === "checkout" && "Check-out"}
                      {event.type === "checkin" && "Check-in"}
                      {event.type === "inspection" && "Property Inspection"}
                    </div>
                    <div className="text-neutral-gray text-[13px] mb-[4px] truncate">
                      {event.property}
                    </div>
                    {event.tenant !== "-" && (
                      <div className="text-neutral-gray text-[12px]">
                        Tenant: {event.tenant}
                      </div>
                    )}
                    <div className="text-accent-blue text-[12px] font-semibold mt-[4px]">
                      {event.date}
                    </div>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-neutral-gray text-[14px]">No upcoming events.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="col-span-2 bg-white border border-[rgba(0,0,0,0.08)]">
            <div className="px-[24px] py-[20px] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-neutral-black text-[18px] font-bold">Recent Activity</h2>
              <p className="text-neutral-gray text-[13px] mt-[4px]">Latest updates</p>
            </div>
            <div className="p-[24px] space-y-[16px]">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-[12px] pb-[16px] border-b border-[rgba(0,0,0,0.08)] last:border-0 last:pb-0">
                  <div className={`w-[8px] h-[8px] rounded-full ${
                    activity.type === "message" ? "bg-brand-primary" :
                    activity.type === "application" ? "bg-accent-blue" :
                    activity.type === "booking" ? "bg-accent-blue" :
                    "bg-neutral-gray"
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-neutral-black text-[14px]">{activity.text}</div>
                    <div className="text-neutral-gray text-[12px] mt-[2px]">{activity.time}</div>
                  </div>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-neutral-gray text-[14px]">No recent activity yet.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-[rgba(0,0,0,0.08)]">
            <div className="px-[24px] py-[20px] border-b border-[rgba(0,0,0,0.08)]">
              <h2 className="text-neutral-black text-[18px] font-bold">Quick Actions</h2>
            </div>
            <div className="p-[24px] space-y-[12px]">
              <Link
                to="/landlord/listings/add"
                className="flex items-center justify-center gap-[8px] w-full bg-brand-primary text-white py-[12px] font-semibold hover:bg-brand-primary-dark transition-colors"
              >
                <Home className="w-[16px] h-[16px]" />
                Create New Listing
              </Link>
              <Link
                to="/landlord/inbox"
                className="flex items-center justify-center gap-[8px] w-full border-[2px] border-neutral-black text-neutral-black py-[12px] font-semibold hover:bg-neutral-black hover:text-gray-500 transition-colors"
              >
                <MessageSquare className="w-[16px] h-[16px]" />
                View Messages ({stats.unreadMessages})
              </Link>
              <Link
                to="/landlord/analytics"
                className="flex items-center justify-center gap-[8px] w-full border border-[rgba(0,0,0,0.16)] text-neutral-black py-[12px] font-semibold hover:text-gray-500 transition-colors"
              >
                <Eye className="w-[16px] h-[16px]" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>
      </main>
    </LandlordPortalLayout>
  );
}