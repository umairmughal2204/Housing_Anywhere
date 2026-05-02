import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface DateOnlyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  minDate?: Date;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function DateOnlyPicker({ isOpen, onClose, selectedDate, onDateChange, minDate }: DateOnlyPickerProps) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  );
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!pickerRef.current) {
        return;
      }

      if (!pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  const monthLabel = visibleMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const dayCells = useMemo(() => {
    const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const monthStartsOn = (firstDayOfMonth.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();

    const cells: Array<{ key: string; date: Date | null }> = [];

    for (let index = 0; index < monthStartsOn; index += 1) {
      cells.push({ key: `empty-${index}`, date: null });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        key: `day-${day}`,
        date: new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day),
      });
    }

    return cells;
  }, [visibleMonth]);

  if (!isOpen) {
    return null;
  }

  const today = startOfDay(new Date());
  const normalizedMinDate = minDate ? startOfDay(minDate) : null;
  const currentYear = visibleMonth.getFullYear();
  const currentMonthIndex = visibleMonth.getMonth();
  const canGoToPreviousMonth = !normalizedMinDate || new Date(currentYear, currentMonthIndex - 1, 1) >= new Date(normalizedMinDate.getFullYear(), normalizedMinDate.getMonth(), 1);

  // Month/Year picker - generate years and months
  const yearRange = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div
      ref={pickerRef}
      className="absolute left-0 sm:left-auto top-[calc(100%+8px)] z-[120] w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] rounded-[12px] border border-[rgba(15,61,73,0.15)] bg-white shadow-[0_12px_32px_rgba(0,0,0,0.15)] p-[20px]"
    >
      {/* Header with Month/Year Selector */}
      <div className="mb-[20px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          disabled={!canGoToPreviousMonth}
          className="h-[36px] w-[36px] flex items-center justify-center border border-[rgba(15,61,73,0.15)] rounded-[6px] hover:bg-[#F0F6F7] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-[18px] h-[18px] text-[#0F2D36]" />
        </button>

        <button
          type="button"
          onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
          className="flex-1 text-center text-[16px] font-semibold text-[#0F2D36] hover:bg-[#F0F6F7] rounded-[6px] px-[8px] py-[8px] transition-colors"
        >
          {monthLabel}
        </button>

        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="h-[36px] w-[36px] flex items-center justify-center border border-[rgba(15,61,73,0.15)] rounded-[6px] hover:bg-[#F0F6F7] transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-[18px] h-[18px] text-[#0F2D36]" />
        </button>
      </div>

      {/* Month/Year Picker Modal */}
      {showMonthYearPicker && (
        <div className="mb-[20px] pb-[20px] border-b border-[rgba(15,61,73,0.1)]">
          <p className="text-[12px] font-semibold text-[#5A7380] mb-[12px] uppercase">Select Month</p>
          <div className="grid grid-cols-3 gap-[8px] mb-[16px]">
            {monthNames.map((month, index) => (
              <button
                key={month}
                type="button"
                onClick={() => {
                  setVisibleMonth(new Date(currentYear, index, 1));
                  setShowMonthYearPicker(false);
                }}
                className={`py-[8px] px-[6px] rounded-[6px] text-[13px] font-medium transition-colors ${
                  index === currentMonthIndex
                    ? "bg-[#0F2D36] text-white"
                    : "text-[#12303B] hover:bg-[#E8F0F2]"
                }`}
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>

          <p className="text-[12px] font-semibold text-[#5A7380] mb-[12px] uppercase">Select Year</p>
          <div className="grid grid-cols-5 gap-[8px]">
            {yearRange.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => {
                  setVisibleMonth(new Date(year, currentMonthIndex, 1));
                  setShowMonthYearPicker(false);
                }}
                className={`py-[8px] px-[4px] rounded-[6px] text-[13px] font-medium transition-colors ${
                  year === currentYear
                    ? "bg-[#0F2D36] text-white"
                    : "text-[#12303B] hover:bg-[#E8F0F2]"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekday Headers */}
      <div className="mb-[12px] grid grid-cols-7 gap-[6px] text-[12px] font-semibold text-[#5A7380]">
        {[
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ].map((weekday) => (
          <div key={weekday} className="h-[32px] flex items-center justify-center">
            {weekday}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-[6px]">
        {dayCells.map((cell) => {
          if (!cell.date) {
            return <div key={cell.key} className="h-[40px]" />;
          }

          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          const isToday = isSameDay(cell.date, today);
          const isDisabled = normalizedMinDate ? cell.date < normalizedMinDate : false;

          return (
            <button
              key={cell.key}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                onDateChange(cell.date as Date);
                onClose();
              }}
              className={`h-[40px] text-[14px] font-medium rounded-[6px] transition-colors ${
                isDisabled
                  ? "text-[#A7B3B9] bg-[#F5F7F8] cursor-not-allowed"
                  :
                isSelected
                  ? "bg-[#0F2D36] text-white"
                  : isToday
                  ? "border-2 border-[#0F2D36] text-[#0F2D36] font-semibold"
                  : "text-[#1A1A1A] hover:bg-[#F0F6F7]"
              }`}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
