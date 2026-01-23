"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  className?: string;
}

const MONTHS_HR = [
  "Siječanj",
  "Veljača",
  "Ožujak",
  "Travanj",
  "Svibanj",
  "Lipanj",
  "Srpanj",
  "Kolovoz",
  "Rujan",
  "Listopad",
  "Studeni",
  "Prosinac",
];

const DAYS_HR = ["Pon", "Uto", "Sri", "Čet", "Pet", "Sub", "Ned"];

export function DatePicker({
  value,
  onChange,
  id,
  required = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Formatiraj datum za prikaz (DD.MM.YYYY.)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}.`;
  };

  // Ažuriraj prikaz kada se value promijeni
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(value));
    if (value) {
      setCurrentMonth(new Date(value + "T00:00:00"));
    }
  }, [value]);

  // Zatvori kalendar kada se klikne izvan
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Zatvori na Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  const handleDisplayClick = () => {
    setIsOpen(!isOpen);
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Formatiraj datum lokalno bez UTC konverzije
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(dateString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleToday = () => {
    const today = new Date();
    // Formatiraj datum lokalno bez UTC konverzije
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    onChange(dateString);
    setIsOpen(false);
  };

  // Generiraj dane u mjesecu
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Ponedjeljak = 0

    const days = [];
    
    // Prazni dani na početku
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Dani u mjesecu
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const days = getDaysInMonth();

  return (
    <div ref={containerRef} className="relative">
      {/* Prikazni input (format DD.MM.YYYY.) */}
      <div className="relative">
        <input
          type="text"
          id={id}
          name={id || "date"}
          value={displayValue}
          readOnly
          onClick={handleDisplayClick}
          placeholder="DD.MM.YYYY."
          required={required}
          className={`w-full cursor-pointer rounded-lg border border-neutral-300 bg-white px-4 py-2 pr-10 text-gf-text-primary focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 ${className}`}
        />
        {/* Hidden input za stvarnu vrijednost (za form submission) */}
        <input
          type="hidden"
          name={id ? `${id}_value` : "date_value"}
          value={value}
          required={required}
        />
        <button
          type="button"
          onClick={handleDisplayClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gf-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-700"
          aria-label="Otvori kalendar"
        >
          <Calendar className="h-5 w-5" />
        </button>
      </div>

      {/* Custom kalendar */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
          {/* Header s mjesecom i godinom */}
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="rounded p-1 text-gf-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label="Prethodni mjesec"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-lg font-semibold text-gf-text-primary dark:text-neutral-100">
              {MONTHS_HR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="rounded p-1 text-gf-text-secondary hover:bg-neutral-100 dark:hover:bg-neutral-700"
              aria-label="Sljedeći mjesec"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Dani u tjednu */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS_HR.map((day) => (
              <div
                key={day}
                className="py-2 text-center text-xs font-medium text-gf-text-secondary dark:text-neutral-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Kalendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="py-2" />;
              }

              const isSelected =
                selectedDate &&
                selectedDate.getDate() === day &&
                selectedDate.getMonth() === currentMonth.getMonth() &&
                selectedDate.getFullYear() === currentMonth.getFullYear();

              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() === currentMonth.getMonth() &&
                new Date().getFullYear() === currentMonth.getFullYear();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`py-2 text-sm transition-colors ${
                    isSelected
                      ? "rounded-full bg-gf-cta text-white hover:bg-gf-cta-hover"
                      : isToday
                      ? "rounded-full bg-gf-safe/20 text-gf-safe hover:bg-gf-safe/30 dark:bg-gf-safe/30 dark:text-gf-safe"
                      : "rounded text-gf-text-primary hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Danas gumb */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleToday}
              className="rounded-lg bg-gf-safe/20 px-4 py-2 text-sm font-medium text-gf-safe transition-colors hover:bg-gf-safe/30 dark:bg-gf-safe/30 dark:text-gf-safe"
            >
              Danas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

