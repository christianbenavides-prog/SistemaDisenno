import { forwardRef, useState, useRef, useEffect, type HTMLAttributes, type ReactNode } from "react";
import { Calendar } from "./Calendar";
import { Input } from "./Input";

/* ──────────────────────────────────────────────
 * Design System SM — DatePicker (Organism)
 *
 * Composes Input (trigger) + Calendar (dropdown).
 * Click on input opens Calendar; selecting a date
 * formats it as dd/mm/yyyy, closes the dropdown.
 *
 * Visual specs:
 *   Trigger: Input atom with calendar icon (right)
 *   Dropdown: Calendar component, absolute positioned
 *   Close on outside click
 * ────────────────────────────────────────────── */

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  placeholder?: string;
  value?: string;
  icon?: ReactNode;
  format?: (date: Date) => string;
  onChange?: (formatted: string, date: Date) => void;
}

function defaultFormat(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      label,
      placeholder = "Seleccionar fecha",
      value = "",
      icon,
      format = defaultFormat,
      onChange,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);

    /* ── Close on outside click ── */
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const handleSelect = (date: Date) => {
      setSelectedDate(date);
      const formatted = format(date);
      onChange?.(formatted, date);
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        className={`ds-date-picker ${className}`.trim()}
        {...rest}
      >
        <div ref={containerRef} style={{ position: "relative" }}>
          <div
            className="ds-date-picker__trigger"
            onClick={() => setOpen((o) => !o)}
          >
            <Input
              label={label}
              placeholder={placeholder}
              value={value}
              rightIcon={icon}
              readOnly
            />
          </div>

          {open && (
            <div className="ds-date-picker__dropdown">
              <Calendar value={selectedDate} onChange={handleSelect} />
            </div>
          )}
        </div>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";
