import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  onClearSelection?: () => void;
  initializeFromSelection?: boolean;
  moveInAvailableChecked?: boolean;
  onMoveInAvailableChange?: (checked: boolean) => void;
  isModal?: boolean;
  minStayMonths?: number;
  maxStayMonths?: number;
  availableFrom?: Date | null;
}

// --- Helpers ---
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isSameDay = (a: Date, b: Date) => a.getTime() === b.getTime();
const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

function addMonthsClamped(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function DatePicker({
  isOpen,
  onClose,
  startDate,
  endDate,
  onDateChange,
  onClearSelection,
  initializeFromSelection = false,
  moveInAvailableChecked = false,
  onMoveInAvailableChange,
  isModal,
  minStayMonths = 1,
  maxStayMonths,
  availableFrom,
}: DatePickerProps) {
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const baseAvailableDate = startOfDay(availableFrom ?? new Date());

  // Component State
  const [currentMonth, setCurrentMonth] = useState<Date>(() => monthStart(startDate ?? baseAvailableDate));
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  const [selectingStart, setSelectingStart] = useState(true);
  const [isMoveInBeforeMinStayChecked, setIsMoveInBeforeMinStayChecked] = useState(false);

  // Synchronize internal state ONLY when the picker opens
  useEffect(() => {
    if (isOpen) {
      const initialStart = startDate ? startOfDay(startDate) : null;
      const initialEnd = endDate ? startOfDay(endDate) : null;

      if (initializeFromSelection && initialStart) {
        setTempStartDate(initialStart);
        setTempEndDate(initialEnd);
        setCurrentMonth(monthStart(initialEnd ?? initialStart));
        setSelectingStart(!initialEnd);
      } else {
        // Default behavior: clean picker flow when opened.
        setTempStartDate(null);
        setTempEndDate(null);
        setCurrentMonth(monthStart(baseAvailableDate));
        setSelectingStart(true);
      }
    }
  }, [isOpen, initializeFromSelection, startDate, endDate]);

  // Keep checkbox value in sync with parent state without resetting selected dates.
  useEffect(() => {
    if (isOpen) {
      setIsMoveInBeforeMinStayChecked(moveInAvailableChecked);
    }
  }, [isOpen, moveInAvailableChecked]);

  // Handle Clicks Outside
  useEffect(() => {
    if (!isOpen || isModal) return;
    const clickOut = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, [isOpen, isModal, onClose]);

  const minAllowedMoveOut = useMemo(() => {
    if (!tempStartDate) return null;
    return startOfDay(addMonthsClamped(tempStartDate, minStayMonths));
  }, [tempStartDate, minStayMonths]);

  const maxAllowedMoveOut = useMemo(() => {
    if (!tempStartDate || !maxStayMonths) return null;
    return startOfDay(addMonthsClamped(tempStartDate, maxStayMonths));
  }, [tempStartDate, maxStayMonths]);

  const handleDateClick = (clickedDate: Date) => {
    const date = startOfDay(clickedDate);

    if (selectingStart) {
      if (date < baseAvailableDate) return;
      const autoMinMoveOutDate = startOfDay(addMonthsClamped(date, minStayMonths));
      const autoMaxMoveOutDate = maxStayMonths ? startOfDay(addMonthsClamped(date, maxStayMonths)) : null;
      const canKeepExistingMoveOut =
        tempEndDate !== null &&
        tempEndDate >= autoMinMoveOutDate &&
        (!autoMaxMoveOutDate || tempEndDate <= autoMaxMoveOutDate);

      setTempStartDate(date);
      setTempEndDate(canKeepExistingMoveOut ? tempEndDate : autoMinMoveOutDate);
      setSelectingStart(false); // Auto-switch to move-out step
      setCurrentMonth(monthStart(canKeepExistingMoveOut && tempEndDate ? tempEndDate : autoMinMoveOutDate));
    } else {
      // Move-out logic
      if (date < (minAllowedMoveOut || baseAvailableDate)) {
        // If they click an earlier date, treat it as a new Move-in date instead
        setTempStartDate(date);
        setTempEndDate(startOfDay(addMonthsClamped(date, minStayMonths)));
        setCurrentMonth(monthStart(addMonthsClamped(date, minStayMonths)));
        return;
      }
      if (maxAllowedMoveOut && date > maxAllowedMoveOut) return;
      setTempEndDate(date);
    }
  };

  const renderMonth = (monthOffset: number) => {
    const viewDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayIndex = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7;

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));

    return (
      <div className="flex-1 min-w-0">
        <h3 className="text-[#0F2D36] text-center font-bold mb-3 text-[15px]">
          {viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(d => (
            <div key={d} className="text-[10px] text-[#8AA0AD] font-semibold py-1.5">{d}</div>
          ))}
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} />;
            
            const isStart = tempStartDate && isSameDay(day, tempStartDate);
            const isEnd = tempEndDate && isSameDay(day, tempEndDate);
            const inRange = tempStartDate && tempEndDate && day > tempStartDate && day < tempEndDate;
            
            // Disable logic
            let isDisabled = false;
            if (selectingStart) {
                isDisabled = day < baseAvailableDate;
            } else {
              isDisabled = day < (minAllowedMoveOut ?? baseAvailableDate) || (maxAllowedMoveOut ? day > maxAllowedMoveOut : false);
            }

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={isDisabled}
                className={`h-8 w-full rounded-md text-[13px] transition-all ${
                  isStart || isEnd ? "bg-[#0F2D36] text-white font-bold" :
                  inRange ? "bg-[#E7F0F5] text-[#0F2D36]" :
                  "text-[#234652] hover:bg-[#EEF3F7]"
                } ${isDisabled ? "opacity-20 cursor-not-allowed" : ""}`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={`${isModal ? "w-full max-w-[780px] bg-white rounded-[28px] shadow-[0_24px_60px_rgba(15,45,54,0.16)] p-5 border border-[rgba(15,45,54,0.08)]" : "absolute z-50 top-[calc(100%+12px)] left-0 w-[calc(100vw-24px)] max-w-[780px] bg-white shadow-[0_24px_60px_rgba(15,45,54,0.16)] p-5 border border-[rgba(15,45,54,0.08)] rounded-[28px]"}`}
    >
      {/* Tabs */}
      <div className="mb-4 flex gap-3">
        <button 
          className={`min-w-[128px] px-5 py-3 rounded-full text-[14px] font-semibold transition-colors ${selectingStart ? 'bg-[#0F2D36] text-white shadow-[0_8px_18px_rgba(15,45,54,0.18)]' : 'bg-[#F2F5F7] text-[#5F7480] hover:bg-[#E9EEF2]'}`}
          onClick={() => {
            setSelectingStart(true);
            // Keep existing selection and focus on move-in month for easier editing.
            if (tempStartDate) {
              setCurrentMonth(monthStart(tempStartDate));
            }
          }}
        >
          Move-in
        </button>
        <button 
          disabled={!tempStartDate}
          className={`min-w-[128px] px-5 py-3 rounded-full text-[14px] font-semibold transition-colors ${!selectingStart ? 'bg-[#0F2D36] text-white shadow-[0_8px_18px_rgba(15,45,54,0.18)]' : 'bg-[#F2F5F7] text-[#5F7480] hover:bg-[#E9EEF2]'} disabled:opacity-30`}
          onClick={() => {
            setSelectingStart(false);
            if (tempEndDate) {
              setCurrentMonth(monthStart(tempEndDate));
            } else if (minAllowedMoveOut) {
              setCurrentMonth(monthStart(minAllowedMoveOut));
            } else if (tempStartDate) {
              setCurrentMonth(monthStart(tempStartDate));
            }
          }}
        >
          Move-out
        </button>
      </div>

      {/* Nav */}
      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(15,45,54,0.08)] transition-colors hover:bg-[#F4F7F9]">
          <ChevronLeft size={18} className="text-[#0F2D36]" />
        </button>
        <span className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-500">
            {selectingStart ? "Select Move-in" : "Select Move-out"}
        </span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(15,45,54,0.08)] transition-colors hover:bg-[#F4F7F9]">
          <ChevronRight size={18} className="text-[#0F2D36]" />
        </button>
      </div>

      <div className="flex flex-col gap-5 md:flex-row md:gap-6">
        {renderMonth(0)}
        {renderMonth(1)}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="inline-flex items-center gap-2 text-xs text-gray-600 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={isMoveInBeforeMinStayChecked}
              onChange={(event) => {
                const checked = event.target.checked;
                setIsMoveInBeforeMinStayChecked(checked);
                onMoveInAvailableChange?.(checked);
              }}
              className="h-4 w-4 rounded border-gray-300 text-[#0F2D36] focus:ring-[#0F2D36]"
            />
            Available for move-in
          </label>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar size={14} /> Min {minStayMonths} month stay
          </div>

        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setTempStartDate(null);
              setTempEndDate(null);
              setSelectingStart(true);
              onClearSelection?.();
            }}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[#0F2D36]"
          >
            Clear
          </button>
          <button 
            disabled={!tempStartDate || !tempEndDate}
            onClick={() => { onDateChange(tempStartDate, tempEndDate); onClose(); }}
            className="rounded-full bg-[#0F2D36] px-6 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_rgba(15,45,54,0.18)] disabled:opacity-40"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}