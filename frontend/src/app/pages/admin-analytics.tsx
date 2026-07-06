import { useEffect, useState, useCallback } from "react";
import { Eye, Users2, MousePointerClick, Layers } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { AdminPortalLayout } from "../components/admin-portal-layout";
import { StatCard } from "../components/stat-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../components/ui/chart";
import { API_BASE } from "../config";

interface Overview {
  range: number;
  totalPageviews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  avgPagesPerSession: number;
  series: { date: string; pageviews: number; visitors: number }[];
  topPages: { path: string; count: number }[];
  referrers: { host: string; count: number }[];
  devices: { device: string; count: number }[];
}

interface TopListing {
  id: string;
  title: string;
  city: string;
  views: number;
  inquiries: number;
}

const chartConfig: ChartConfig = {
  pageviews: { label: "Pageviews", color: "var(--brand-primary, #2563eb)" },
  visitors: { label: "Visitors", color: "#93c5fd" },
};

const RANGE_OPTIONS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function RankedList({ items, emptyLabel }: { items: { label: string; count: number }[]; emptyLabel: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  if (items.length === 0) {
    return <p className="text-neutral-gray text-[13px] py-[8px]">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-[10px]">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-[13px] mb-[4px]">
            <span className="text-neutral-black font-medium truncate max-w-[70%]">{item.label}</span>
            <span className="text-neutral-gray">{item.count.toLocaleString()}</span>
          </div>
          <div className="h-[6px] rounded-full bg-neutral-light-gray overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-primary"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminAnalytics() {
  const [range, setRange] = useState(30);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [topListings, setTopListings] = useState<TopListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    setIsLoading(true);
    setError(null);
    try {
      const [overviewRes, listingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/analytics/overview?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/admin/analytics/top-listings?limit=8`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!overviewRes.ok || !listingsRes.ok) throw new Error("Failed to load analytics");
      setOverview((await overviewRes.json()) as Overview);
      setTopListings(((await listingsRes.json()) as { listings: TopListing[] }).listings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = (date: string) => {
    // Parse "YYYY-MM-DD" as local calendar components, not UTC — otherwise
    // `new Date(date)` treats it as UTC midnight and toLocaleDateString can
    // shift the displayed day back one in timezones behind UTC.
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <AdminPortalLayout>
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-[20px] sm:mb-[28px] flex flex-wrap items-end justify-between gap-[16px]">
          <div>
            <h1 className="text-[22px] sm:text-[28px] font-bold text-neutral-black tracking-[-0.02em]">Analytics</h1>
            <p className="text-neutral-gray text-[13px] sm:text-[14px] mt-[4px]">Site visitor traffic and engagement</p>
          </div>
          <div className="flex gap-[8px]">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRange(opt.value)}
                className={`px-[14px] py-[8px] rounded-[10px] text-[13px] font-semibold transition-colors ${
                  range === opt.value
                    ? "bg-brand-primary text-white"
                    : "bg-white border border-[rgba(0,0,0,0.1)] text-neutral-gray hover:bg-neutral-light-gray"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-[24px] px-[16px] py-[12px] bg-red-50 border border-red-200 rounded-[12px] text-red-600 text-[14px]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px] sm:gap-[16px]">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[24px] flex items-start gap-[16px] animate-pulse">
                <div className="w-[48px] h-[48px] rounded-[12px] bg-neutral-light-gray flex-shrink-0" />
                <div className="flex-1 space-y-[8px] pt-[4px]">
                  <div className="h-[12px] w-[60%] bg-neutral-light-gray rounded-full" />
                  <div className="h-[28px] w-[40%] bg-neutral-light-gray rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : overview ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[12px] sm:gap-[16px] mb-[16px]">
              <StatCard
                label="Total Visitors"
                value={overview.uniqueVisitors.toLocaleString()}
                icon={<Users2 className="w-[22px] h-[22px] text-brand-primary" />}
              />
              <StatCard
                label="Total Pageviews"
                value={overview.totalPageviews.toLocaleString()}
                icon={<Eye className="w-[22px] h-[22px] text-brand-primary" />}
              />
              <StatCard
                label="Sessions"
                value={overview.uniqueSessions.toLocaleString()}
                icon={<MousePointerClick className="w-[22px] h-[22px] text-brand-primary" />}
              />
              <StatCard
                label="Avg. Pages / Session"
                value={overview.avgPagesPerSession.toFixed(1)}
                icon={<Layers className="w-[22px] h-[22px] text-brand-primary" />}
              />
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] sm:p-[24px] mb-[16px]">
              <h2 className="text-[16px] font-bold text-neutral-black mb-[16px]">Traffic Trend</h2>
              {overview.series.length === 0 ? (
                <p className="text-neutral-gray text-[13px] py-[24px] text-center">
                  No visitor data yet for this range — traffic will appear here as the site is visited.
                </p>
              ) : (
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                  <AreaChart data={overview.series} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => formatDate(String(v))} />} />
                    <Area
                      type="monotone"
                      dataKey="pageviews"
                      stroke="var(--color-pageviews)"
                      fill="var(--color-pageviews)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="var(--color-visitors)"
                      fill="var(--color-visitors)"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-[16px] mb-[16px]">
              <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] sm:p-[24px]">
                <h2 className="text-[16px] font-bold text-neutral-black mb-[16px]">Top Pages</h2>
                <RankedList
                  items={overview.topPages.map((p) => ({ label: p.path, count: p.count }))}
                  emptyLabel="No page visits recorded yet."
                />
              </div>
              <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] sm:p-[24px]">
                <h2 className="text-[16px] font-bold text-neutral-black mb-[16px]">Referrers</h2>
                <RankedList
                  items={overview.referrers.map((r) => ({ label: r.host, count: r.count }))}
                  emptyLabel="No referrer data recorded yet."
                />
              </div>
              <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] p-[16px] sm:p-[24px]">
                <h2 className="text-[16px] font-bold text-neutral-black mb-[16px]">Devices</h2>
                <RankedList
                  items={overview.devices.map((d) => ({ label: d.device, count: d.count }))}
                  emptyLabel="No device data recorded yet."
                />
              </div>
            </div>

            <div className="bg-white border border-[rgba(0,0,0,0.06)] rounded-[16px] overflow-hidden">
              <div className="px-[16px] sm:px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.06)]">
                <h2 className="text-[16px] font-bold text-neutral-black">Most Viewed Listings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead>
                    <tr className="border-b border-[rgba(0,0,0,0.06)]">
                      <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Listing</th>
                      <th className="text-left px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">City</th>
                      <th className="text-right px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Views</th>
                      <th className="text-right px-[20px] py-[14px] text-neutral-gray font-semibold text-[12px] uppercase tracking-wider">Inquiries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topListings.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-[20px] py-[24px] text-center text-neutral-gray text-[13px]">
                          No listings yet.
                        </td>
                      </tr>
                    ) : (
                      topListings.map((listing) => (
                        <tr key={listing.id} className="border-b border-[rgba(0,0,0,0.04)] last:border-0">
                          <td className="px-[20px] py-[14px] text-neutral-black font-medium">{listing.title}</td>
                          <td className="px-[20px] py-[14px] text-neutral-gray">{listing.city}</td>
                          <td className="px-[20px] py-[14px] text-right text-neutral-black">{listing.views.toLocaleString()}</td>
                          <td className="px-[20px] py-[14px] text-right text-neutral-gray">{listing.inquiries.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminPortalLayout>
  );
}
