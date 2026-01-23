"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Odaberi...",
  id,
  required = false,
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pronađi odabranu opciju
  const selectedOption = options.find((opt) => opt.value === value);

  // Zatvori dropdown kada se klikne izvan
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

  // Keyboard navigacija
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const currentIndex = options.findIndex((opt) => opt.value === value);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].value);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].value);
      } else if (event.key === "Enter") {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, value, options, onChange]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Prikazni input */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full cursor-pointer items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-2 text-left transition-all focus:border-gf-cta focus:outline-none focus:ring-2 focus:ring-gf-cta/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 ${className}`}
      >
        <span className={`flex items-center gap-2 ${selectedOption ? "text-gf-text-primary dark:text-neutral-100" : "text-gf-text-secondary dark:text-neutral-400"}`}>
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gf-text-secondary transition-transform dark:text-neutral-400 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Hidden input za form submission */}
      <input
        type="hidden"
        name={id}
        value={value}
        required={required}
      />

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-center text-sm text-gf-text-secondary dark:text-neutral-400">
              Nema opcija
            </div>
          ) : (
            options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-gf-cta/10 text-gf-cta dark:bg-gf-cta/20"
                      : "text-gf-text-primary hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.icon}
                    {option.label}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-gf-cta" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
