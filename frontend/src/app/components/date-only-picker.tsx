import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface DateOnlyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
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

export function DateOnlyPicker({ isOpen, onClose, selectedDate, onDateChange }: DateOnlyPickerProps) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : new Date()
  );
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

  return (
    <div
      ref={pickerRef}
      className="absolute left-0 top-[calc(100%+8px)] z-[120] w-[280px] rounded-[8px] border border-[rgba(15,61,73,0.20)] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] p-[12px]"
    >
      <div className="mb-[10px] flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          className="h-[28px] w-[28px] flex items-center justify-center border border-[rgba(0,0,0,0.14)] hover:bg-[#F4F7F8]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-[14px] h-[14px] text-[#12303B]" />
        </button>

        <p className="text-[13px] font-semibold text-[#12303B]">{monthLabel}</p>

        <button
          type="button"
          onClick={() => setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          className="h-[28px] w-[28px] flex items-center justify-center border border-[rgba(0,0,0,0.14)] hover:bg-[#F4F7F8]"
          aria-label="Next month"
        >
          <ChevronRight className="w-[14px] h-[14px] text-[#12303B]" />
        </button>
      </div>

      <div className="mb-[6px] grid grid-cols-7 gap-[4px] text-[10px] font-semibold text-[#5A7380]">
        {[
          "Mon",
          "Tue",
          "Wed",
          "Thu",
          "Fri",
          "Sat",
          "Sun",
        ].map((weekday) => (
          <div key={weekday} className="h-[22px] flex items-center justify-center">
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-[4px]">
        {dayCells.map((cell) => {
          if (!cell.date) {
            return <div key={cell.key} className="h-[28px]" />;
          }

          const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => {
                onDateChange(cell.date as Date);
                onClose();
              }}
              className={`h-[28px] text-[12px] transition-colors ${
                isSelected
                  ? "bg-[#12303B] text-white"
                  : isToday
                  ? "border border-[#12303B] text-[#12303B]"
                  : "text-[#1A1A1A] hover:bg-[#F4F7F8]"
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
