import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Home, CalendarDays } from "lucide-react";

interface Booking {
  id: string;
  propertyTitle: string;
  propertyImage?: string;
  tenantName: string;
  moveInDate: string;
  moveOutDate: string;
  status: "pending" | "approved" | "rejected";
}

interface PropertyGroup {
  title: string;
  image?: string;
  bookings: Booking[];
}

interface CalendarSliderProps {
  bookings: Booking[];
  isLoading?: boolean;
}

type MonthYear = { month: number; year: number };

function getMonthsRange(startMonth: MonthYear, monthCount: number): MonthYear[] {
  const result: MonthYear[] = [];
  let current = { ...startMonth };

  for (let i = 0; i < monthCount; i++) {
    result.push({ ...current });
    current.month += 1;
    if (current.month > 11) {
      current.month = 0;
      current.year += 1;
    }
  }

  return result;
}

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatMonth(month: number, year: number): string {
  const date = new Date(year, month);
  const monthName = date.toLocaleDateString("en-GB", { month: "short" });
  return monthName;
}

function formatYear(year: number): string {
  return year.toString();
}

const statusStyles: Record<string, { dot: string; pill: string }> = {
  approved: { dot: "bg-brand-primary", pill: "bg-brand-primary" },
  rejected: { dot: "bg-[#9CA8B3]", pill: "bg-[#9CA8B3]" },
  pending: { dot: "bg-amber-500", pill: "bg-amber-500" },
};

function getStatusStyle(status: string) {
  return statusStyles[status] ?? statusStyles.rejected;
}

export function CalendarSlider({ bookings, isLoading = false }: CalendarSliderProps) {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const months = useMemo(() => {
    const startMonth = { month: today.getMonth(), year: today.getFullYear() };
    return getMonthsRange(startMonth, 24);
  }, []);

  const displayMonths = useMemo(() => {
    return months.slice(monthOffset, monthOffset + 6);
  }, [monthOffset, months]);

  const groupedByProperty = useMemo(() => {
    const groups: Record<string, PropertyGroup> = {};
    bookings.forEach((booking) => {
      if (!groups[booking.propertyTitle]) {
        groups[booking.propertyTitle] = {
          title: booking.propertyTitle,
          image: booking.propertyImage,
          bookings: [],
        };
      }
      groups[booking.propertyTitle].bookings.push(booking);
    });
    return Object.values(groups);
  }, [bookings]);

  const handlePrev = () => {
    if (monthOffset > 0) {
      setMonthOffset(monthOffset - 1);
    }
  };

  const handleNext = () => {
    setMonthOffset(monthOffset + 1);
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-[24px] animate-pulse">
        <div className="h-[20px] w-[160px] bg-neutral-light-gray rounded-full mb-[24px]" />
        <div className="h-[340px] rounded-[12px] bg-neutral-light-gray" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-[24px]">
        <div className="h-[340px] flex flex-col items-center justify-center gap-[14px]">
          <div className="w-[64px] h-[64px] rounded-full bg-brand-light flex items-center justify-center">
            <CalendarDays className="w-[28px] h-[28px] text-brand-primary" />
          </div>
          <p className="text-neutral-black text-[15px] font-semibold">No bookings yet</p>
          <p className="text-neutral-gray text-[13px]">Create listings to see their bookings here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[16px] shadow-[0_1px_2px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col h-[520px]">
      {/* Header with controls */}
      <div className="px-[20px] sm:px-[24px] py-[16px] border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-neutral-black text-[17px] font-bold tracking-[-0.01em]">Calendar</h2>
          <p className="text-neutral-gray text-[12px] mt-[2px]">
            {displayMonths.length > 0
              ? `${formatMonth(displayMonths[0].month, displayMonths[0].year)} ${formatYear(displayMonths[0].year)} — ${formatMonth(
                  displayMonths[displayMonths.length - 1].month,
                  displayMonths[displayMonths.length - 1].year
                )} ${formatYear(displayMonths[displayMonths.length - 1].year)}`
              : ""}
          </p>
        </div>
        <div className="flex items-center gap-[6px]">
          <button
            onClick={handlePrev}
            disabled={monthOffset === 0}
            aria-label="Previous months"
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[rgba(0,0,0,0.1)] hover:bg-neutral-light-gray disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-[16px] h-[16px] text-neutral-black" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next months"
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[rgba(0,0,0,0.1)] hover:bg-neutral-light-gray transition-colors"
          >
            <ChevronRight className="w-[16px] h-[16px] text-neutral-black" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-[20px] sm:px-[24px] py-[10px] border-b border-[rgba(0,0,0,0.06)] flex items-center gap-[16px] flex-shrink-0 bg-[#FAFBFC]">
        {(["approved", "pending", "rejected"] as const).map((status) => (
          <div key={status} className="flex items-center gap-[6px]">
            <div className={`w-[8px] h-[8px] rounded-full ${getStatusStyle(status).dot}`} />
            <span className="text-neutral-gray text-[12px] capitalize">{status}</span>
          </div>
        ))}
      </div>

      {/* Calendar body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Properties sidebar with cards */}
        <div className="w-[220px] border-r border-[rgba(0,0,0,0.08)] overflow-y-auto flex-shrink-0 bg-[#FAFBFC]">
          <div className="sticky top-0 bg-[#FAFBFC] border-b border-[rgba(0,0,0,0.08)] px-[16px] py-[12px] z-[6]">
            <h3 className="text-neutral-black text-[11px] font-bold uppercase tracking-[0.06em]">
              Properties ({groupedByProperty.length})
            </h3>
          </div>
          <div className="space-y-[10px] p-[12px]">
            {groupedByProperty.map((property) => (
              <div
                key={property.title}
                className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[10px] overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-brand-primary/40 hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)] transition-all"
              >
                <div className="relative w-full aspect-[16/9] bg-neutral-light-gray overflow-hidden">
                  {property.image ? (
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-[22px] h-[22px] text-neutral-gray" />
                    </div>
                  )}
                  <div className="absolute top-[8px] right-[8px] rounded-full bg-brand-primary text-white px-[8px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.04em] shadow-[0_2px_6px_rgba(8,145,178,0.35)]">
                    Listed
                  </div>
                </div>
                <div className="p-[10px]">
                  <div className="text-neutral-black text-[12px] font-semibold truncate mb-[3px]">{property.title}</div>
                  <div className="text-neutral-gray text-[11px]">
                    {property.bookings.length} booking{property.bookings.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-auto relative">
          {/* Today indicator line */}
          {(() => {
            const daysSinceMonthStart = today.getDate() - 1;
            const colWidth = 96;
            const leftOffset = daysSinceMonthStart * (colWidth / getDaysInMonth(today.getMonth(), today.getFullYear()));
            return (
              <div
                className="absolute top-[52px] bottom-0 w-[2px] bg-brand-primary z-10 pointer-events-none"
                style={{ left: `${220 + leftOffset}px` }}
              >
                <div className="absolute -top-[6px] -left-[4px] w-[10px] h-[10px] rounded-full bg-brand-primary shadow-[0_0_0_3px_rgba(8,145,178,0.18)]" />
              </div>
            );
          })()}
          <div className="inline-block min-w-full">
            {/* Month headers */}
            <div className="flex bg-[#FAFBFC] sticky top-0 z-[5] border-b border-[rgba(0,0,0,0.08)]">
              <div className="w-[220px] flex-shrink-0 border-r border-[rgba(0,0,0,0.08)]" />
              {displayMonths.map((monthData) => (
                <div
                  key={`${monthData.year}-${monthData.month}`}
                  className="flex-shrink-0 border-r border-[rgba(0,0,0,0.08)] px-[8px] py-[12px] text-center w-[96px]"
                >
                  <div className="text-neutral-black font-bold text-[13px]">{formatMonth(monthData.month, monthData.year)}</div>
                  <div className="text-neutral-gray text-[11px] mt-[2px]">{formatYear(monthData.year)}</div>
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="divide-y divide-[rgba(0,0,0,0.06)]">
              {groupedByProperty.map((property) => (
                <div key={property.title} className="flex hover:bg-brand-light/20 transition-colors">
                  <div className="w-[220px] px-[14px] py-[12px] border-r border-[rgba(0,0,0,0.08)] flex-shrink-0 bg-white flex items-center min-h-[84px]">
                    <span className="text-neutral-black text-[12px] font-medium line-clamp-2">{property.title}</span>
                  </div>

                  {displayMonths.map((monthData) => (
                    <div
                      key={`${property.title}-${monthData.year}-${monthData.month}`}
                      className="w-[96px] flex-shrink-0 border-r border-[rgba(0,0,0,0.08)] p-[6px] relative min-h-[84px] bg-white"
                    >
                      {property.bookings
                        .filter((booking) => {
                          const moveIn = new Date(booking.moveInDate);
                          const moveOut = new Date(booking.moveOutDate);
                          const monthStart = new Date(monthData.year, monthData.month, 1);
                          const monthEnd = new Date(monthData.year, monthData.month + 1, 0);

                          return !(moveOut < monthStart || moveIn > monthEnd);
                        })
                        .map((booking, idx) => {
                          const moveIn = new Date(booking.moveInDate);
                          const moveOut = new Date(booking.moveOutDate);
                          const style = getStatusStyle(booking.status);

                          return (
                            <div
                              key={booking.id}
                              className={`absolute left-[6px] right-[6px] px-[6px] py-[4px] text-[10px] font-semibold text-white ${style.pill} rounded-[6px] whitespace-nowrap overflow-hidden text-ellipsis shadow-[0_2px_6px_rgba(15,23,42,0.14)]`}
                              style={{ top: `${6 + idx * 22}px` }}
                              title={`${booking.tenantName}: ${moveIn.toLocaleDateString("en-GB")} - ${moveOut.toLocaleDateString("en-GB")}`}
                            >
                              {booking.tenantName.split(" ")[0]}
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
