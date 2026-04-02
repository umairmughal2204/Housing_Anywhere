import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

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

function getStatusColor(status: string): string {
  switch (status) {
    case "approved":
      return "bg-blue-700";
    case "rejected":
      return "bg-gray-400";
    case "pending":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
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
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg p-[24px]">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-neutral-gray">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg p-[24px]">
        <div className="h-[300px] flex flex-col items-center justify-center gap-[12px]">
          <Home className="w-[32px] h-[32px] text-neutral-gray" />
          <p className="text-neutral-gray text-[14px]">No bookings yet. Create listings to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden flex flex-col h-[480px]">
      {/* Header with controls */}
      <div className="px-[24px] py-[14px] border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-neutral-black text-[16px] font-bold">Calendar</h2>
          <p className="text-neutral-gray text-[11px] mt-[2px]">{displayMonths.length > 0 ? `${formatMonth(displayMonths[0].month, displayMonths[0].year)} ${formatYear(displayMonths[0].year)} - ${formatMonth(displayMonths[displayMonths.length - 1].month, displayMonths[displayMonths.length - 1].year)} ${formatYear(displayMonths[displayMonths.length - 1].year)}` : ""}</p>
        </div>
        <div className="flex items-center gap-[4px]">
          <button
            onClick={handlePrev}
            disabled={monthOffset === 0}
            className="p-[4px] hover:bg-neutral-light-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-[16px] h-[16px] text-neutral-black" />
          </button>
          <button
            onClick={handleNext}
            className="p-[4px] hover:bg-neutral-light-gray transition-colors"
          >
            <ChevronRight className="w-[16px] h-[16px] text-neutral-black" />
          </button>
        </div>
      </div>

      {/* Calendar body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Properties sidebar with cards - reduced size */}
        <div className="w-[200px] border-r border-[rgba(0,0,0,0.08)] overflow-y-auto flex-shrink-0 bg-neutral-light-gray">
          <div className="sticky top-0 bg-neutral-light-gray border-b border-[rgba(0,0,0,0.08)] px-[16px] py-[12px]">
            <h3 className="text-neutral-black text-[11px] font-bold uppercase tracking-[0.05em]">Properties ({groupedByProperty.length})</h3>
          </div>
          <div className="space-y-[12px] p-[12px]">
            {groupedByProperty.map((property) => (
              <div key={property.title} className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[8px] overflow-hidden hover:border-[rgba(0,0,0,0.16)] transition-all">
                  <div className="relative w-full aspect-[16/9] bg-neutral-light-gray overflow-hidden">
                  {property.image ? (
                    <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-[24px] h-[24px] text-neutral-gray" />
                    </div>
                  )}
                  <div className="absolute top-[8px] right-[8px] bg-green-600 text-white px-[8px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em]">
                    Listed
                  </div>
                </div>
                {/* Property Info */}
                <div className="p-[8px]">
                  <div className="text-neutral-black text-[11px] font-semibold truncate mb-[3px]">{property.title}</div>
                  <div className="text-neutral-gray text-[9px]">{property.bookings.length} booking{property.bookings.length !== 1 ? "s" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="flex-1 overflow-hidden relative">
          {/* Today indicator line */}
          {(() => {
            const daysSinceMonthStart = today.getDate() - 1;
            const colWidth = 90;
            const leftOffset = daysSinceMonthStart * (colWidth / getDaysInMonth(today.getMonth(), today.getFullYear()));
            return (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-yellow-500 z-10 pointer-events-none"
                style={{
                  left: `${200 + leftOffset}px`,
                }}
              />
            );
          })()}
          <div className="inline-block min-w-full">
            {/* Month headers */}
            <div className="flex bg-gradient-to-b from-neutral-light-gray to-white sticky top-0 z-5">
              <div className="w-[200px] flex-shrink-0 border-r border-[rgba(0,0,0,0.08)]"></div>
              {displayMonths.map((monthData, idx) => (
                <div
                  key={`${monthData.year}-${monthData.month}`}
                  className="flex-shrink-0 border-r border-[rgba(0,0,0,0.08)] px-[8px] py-[12px] text-center w-[90px]"
                >
                  <div className="text-neutral-black font-bold text-[12px]">{formatMonth(monthData.month, monthData.year)}</div>
                  <div className="text-neutral-gray text-[10px] mt-[2px]">{formatYear(monthData.year)}</div>
                </div>
              ))}
            </div>

            {/* Timeline rows */}
            <div className="divide-y divide-[rgba(0,0,0,0.08)]">
              {groupedByProperty.map((property) => (
                <div key={property.title} className="flex hover:bg-neutral-light-gray/20 transition-colors">
                  <div className="w-[200px] px-[12px] py-[12px] border-r border-[rgba(0,0,0,0.08)] flex-shrink-0 bg-white flex items-center min-h-[80px]">
                    <span className="text-neutral-gray text-[11px] truncate line-clamp-2">{property.title}</span>
                  </div>

                  {displayMonths.map((monthData) => (
                    <div
                      key={`${property.title}-${monthData.year}-${monthData.month}`}
                      className="w-[90px] flex-shrink-0 border-r border-[rgba(0,0,0,0.08)] p-[6px] relative min-h-[80px] bg-white"
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
                          const statusColor = getStatusColor(booking.status);

                          return (
                            <div
                              key={booking.id}
                              className={`absolute px-[4px] py-[3px] text-[10px] font-semibold text-white ${statusColor} rounded-[3px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[78px]`}
                              style={{
                                top: `${6 + idx * 18}px`,
                              }}
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
