import { useState, useRef, useEffect } from "react";
import { MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  isModal?: boolean; // Add prop to control whether it's in a modal or dropdown
}

export function DatePicker({ isOpen, onClose, startDate, endDate, onDateChange, isModal }: DatePickerProps) {
  const [viewMode, setViewMode] = useState<"month" | "date">("month");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);
  
  // For "by month" mode
  const [selectedMoveInMonth, setSelectedMoveInMonth] = useState<Date>(startDate || new Date(2026, 2, 1)); // Default March 2026
  const [durationMonths, setDurationMonths] = useState(3);
  const [monthScrollOffset, setMonthScrollOffset] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderMonth = (monthOffset: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const daysCount = daysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days = [];

    const monthName = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-[8px]"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysCount; day++) {
      const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
      const isSelected =
        (tempStartDate && currentDate.toDateString() === tempStartDate.toDateString()) ||
        (tempEndDate && currentDate.toDateString() === tempEndDate.toDateString());
      const isInRange =
        tempStartDate &&
        tempEndDate &&
        currentDate >= tempStartDate &&
        currentDate <= tempEndDate;
      const isToday = currentDate.toDateString() === new Date().toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(currentDate)}
          className={`
            p-[8px] text-[14px] hover:bg-[#F7F7F9] transition-colors
            ${isSelected ? "bg-[#1A1A1A] text-white font-bold" : "text-[#1A1A1A]"}
            ${isInRange && !isSelected ? "bg-[#FFBBAE]" : ""}
            ${isToday && !isSelected ? "border border-[#1A1A1A]" : ""}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        <h3 className="text-[#1A1A1A] text-[18px] font-bold mb-[16px] text-center">
          {monthName}
        </h3>
        <div className="grid grid-cols-7 gap-[4px] mb-[8px]">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day} className="text-[#6B6B6B] text-[12px] text-center p-[8px] font-semibold">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[4px]">{days}</div>
      </div>
    );
  };

  const renderMonthSelector = () => {
    const months = [];
    const startYear = 2026;
    const startMonth = 0; // January
    
    // Generate 12 months starting from current offset
    for (let i = 0; i < 7; i++) {
      const monthIndex = startMonth + monthScrollOffset + i;
      const year = startYear + Math.floor(monthIndex / 12);
      const month = monthIndex % 12;
      const date = new Date(year, month, 1);
      
      const isSelected = 
        selectedMoveInMonth.getMonth() === month && 
        selectedMoveInMonth.getFullYear() === year;
      
      months.push(
        <button
          key={i}
          onClick={() => setSelectedMoveInMonth(date)}
          className={`
            flex flex-col items-center justify-center px-[24px] py-[16px] min-w-[120px]
            border-[2px] transition-colors
            ${isSelected 
              ? "border-[#1A1A1A] bg-white" 
              : "border-[rgba(0,0,0,0.08)] bg-white hover:border-[rgba(0,0,0,0.16)]"
            }
          `}
        >
          <span className="text-[#1A1A1A] text-[16px] font-bold">
            {date.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-[#6B6B6B] text-[14px]">
            {year}
          </span>
        </button>
      );
    }
    
    return months;
  };

  const handleDateClick = (date: Date) => {
    if (selectingStart || !tempStartDate) {
      setTempStartDate(date);
      setTempEndDate(null);
      setSelectingStart(false);
    } else {
      if (date < tempStartDate) {
        setTempStartDate(date);
        setTempEndDate(tempStartDate);
      } else {
        setTempEndDate(date);
      }
    }
  };

  const handleShowPlaces = () => {
    if (viewMode === "month") {
      // Calculate end date based on move-in month + duration
      const endDate = new Date(selectedMoveInMonth);
      endDate.setMonth(endDate.getMonth() + durationMonths);
      onDateChange(selectedMoveInMonth, endDate);
    } else {
      onDateChange(tempStartDate, tempEndDate);
    }
    onClose();
  };

  const handleClearDates = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectingStart(true);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const scrollMonthsLeft = () => {
    if (monthScrollOffset > 0) {
      setMonthScrollOffset(monthScrollOffset - 1);
    }
  };

  const scrollMonthsRight = () => {
    setMonthScrollOffset(monthScrollOffset + 1);
  };

  const decrementDuration = () => {
    if (durationMonths > 1) {
      setDurationMonths(durationMonths - 1);
    }
  };

  const incrementDuration = () => {
    setDurationMonths(durationMonths + 1);
  };

  return (
    <div
      ref={dropdownRef}
      className={isModal 
        ? "bg-white w-full" 
        : "absolute top-full left-0 right-0 mt-[8px] bg-white border border-[rgba(0,0,0,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 p-[32px]"
      }
    >
      {/* Toggle */}
      <div className="flex items-center justify-center gap-[16px] mb-[32px]">
        <button
          onClick={() => setViewMode("month")}
          className={`px-[32px] py-[12px] text-[14px] font-semibold transition-colors rounded-full ${
            viewMode === "month"
              ? "bg-[#1A1A1A] text-white"
              : "bg-[#F7F7F9] text-[#6B6B6B] hover:bg-[#E5E5E5]"
          }`}
        >
          By month
        </button>
        <button
          onClick={() => setViewMode("date")}
          className={`px-[32px] py-[12px] text-[14px] font-semibold transition-colors rounded-full ${
            viewMode === "date"
              ? "bg-[#1A1A1A] text-white"
              : "bg-[#F7F7F9] text-[#6B6B6B] hover:bg-[#E5E5E5]"
          }`}
        >
          By date
        </button>
      </div>

      {/* By Month View */}
      {viewMode === "month" && (
        <div>
          {/* When's the move-in? */}
          <div className="mb-[48px]">
            <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">
              When's the move-in?
            </h3>
            <div className="flex items-center gap-[16px] relative">
              <button
                onClick={scrollMonthsLeft}
                disabled={monthScrollOffset === 0}
                className={`flex-shrink-0 w-[48px] h-[48px] flex items-center justify-center border border-[rgba(0,0,0,0.08)] hover:bg-[#F7F7F9] transition-colors ${
                  monthScrollOffset === 0 ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <ChevronLeft className="w-[20px] h-[20px] text-[#1A1A1A]" />
              </button>
              
              <div className="flex items-center gap-[16px] overflow-hidden">
                {renderMonthSelector()}
              </div>
              
              <button
                onClick={scrollMonthsRight}
                className="flex-shrink-0 w-[48px] h-[48px] flex items-center justify-center border border-[rgba(0,0,0,0.08)] hover:bg-[#F7F7F9] transition-colors"
              >
                <ChevronRight className="w-[20px] h-[20px] text-[#1A1A1A]" />
              </button>
            </div>
          </div>

          {/* How long will you stay? */}
          <div className="mb-[32px]">
            <h3 className="text-[#1A1A1A] text-[24px] font-bold mb-[24px]">
              How long will you stay?
            </h3>
            <div className="flex items-center gap-[24px]">
              <span className="text-[#1A1A1A] text-[16px] font-semibold">Month</span>
              <button
                onClick={decrementDuration}
                disabled={durationMonths <= 1}
                className={`w-[40px] h-[40px] flex items-center justify-center border border-[rgba(0,0,0,0.16)] hover:bg-[#F7F7F9] transition-colors ${
                  durationMonths <= 1 ? "opacity-30 cursor-not-allowed" : ""
                }`}
              >
                <span className="text-[#1A1A1A] text-[20px] font-bold">−</span>
              </button>
              <div className="w-[80px] h-[48px] flex items-center justify-center border-[2px] border-[rgba(0,0,0,0.16)] bg-white">
                <span className="text-[#1A1A1A] text-[20px] font-bold">{durationMonths}</span>
              </div>
              <button
                onClick={incrementDuration}
                className="w-[40px] h-[40px] flex items-center justify-center border border-[rgba(0,0,0,0.16)] hover:bg-[#F7F7F9] transition-colors"
              >
                <span className="text-[#1A1A1A] text-[20px] font-bold">+</span>
              </button>
            </div>
          </div>

          {/* Show places button */}
          <div className="flex justify-end">
            <button
              onClick={handleShowPlaces}
              className="px-[48px] py-[16px] bg-brand-primary text-white text-[16px] font-bold hover:bg-brand-primary-dark transition-colors"
            >Confirm</button>
          </div>
        </div>
      )}

      {/* By Date View */}
      {viewMode === "date" && (
        <div>
          {/* Calendar */}
          <div className="relative">
            <button
              onClick={previousMonth}
              className="absolute left-[-16px] top-[40px] w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F7F7F9] transition-colors"
            >
              <ChevronLeft className="w-[20px] h-[20px] text-[#1A1A1A]" />
            </button>

            <div className="grid grid-cols-2 gap-[48px] mb-[24px]">
              {renderMonth(0)}
              {renderMonth(1)}
            </div>

            <button
              onClick={nextMonth}
              className="absolute right-[-16px] top-[40px] w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F7F7F9] transition-colors"
            >
              <ChevronRight className="w-[20px] h-[20px] text-[#1A1A1A]" />
            </button>
          </div>

          {/* Minimum stay notice */}
          <div className="flex items-center gap-[8px] text-[#6B6B6B] text-[13px] mb-[24px]">
            <Calendar className="w-[16px] h-[16px]" />
            <span>1-month minimum</span>
          </div>

          {/* Quick selects */}
          <div className="flex items-center gap-[8px] mb-[24px]">
            <button className="px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
              Exact dates
            </button>
            <button className="px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
              ± 1 week
            </button>
            <button className="px-[16px] py-[8px] border border-[rgba(0,0,0,0.16)] text-[#1A1A1A] text-[13px] font-semibold hover:bg-[#F7F7F9] transition-colors">
              ± 2 weeks
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleClearDates}
              className="px-[24px] py-[12px] text-[#1A1A1A] text-[14px] font-bold hover:bg-[#F7F7F9] transition-colors"
            >
              Clear dates
            </button>
            <button
              onClick={handleShowPlaces}
              className="px-[32px] py-[12px] bg-[#FF4B27] text-white text-[14px] font-bold hover:bg-[#E63E1C] transition-colors"
            >
              Show places
            </button>
          </div>
        </div>
      )}
    </div>
  );
}