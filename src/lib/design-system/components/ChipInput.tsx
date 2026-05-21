import { forwardRef, useState, useRef, type HTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — ChipInput (Molecule)
 *
 * Input field with inline chips/pills.
 * User types text + Enter to create a chip.
 * Backspace on empty field removes last chip.
 * Each chip has an × button to remove it.
 *
 * Visual specs follow Input atom:
 *   Border: radius-sm, border-xs neutral-200
 *   Focus ring: brand-400
 *   Chip: brand-100 bg, brand-800 text, radius-full
 * ────────────────────────────────────────────── */

export type ChipInputStatus = "default" | "error" | "success" | "disabled";

export interface ChipInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  label?: string;
  placeholder?: string;
  value?: string[];
  status?: ChipInputStatus;
  helperText?: string;
  icon?: ReactNode;
  normalize?: (raw: string) => string;
  onChange?: (values: string[]) => void;
}

const statusClass: Record<ChipInputStatus, string> = {
  default: "",
  error: "ds-chip-input--error",
  success: "ds-chip-input--success",
  disabled: "ds-chip-input--disabled",
};

export const ChipInput = forwardRef<HTMLDivElement, ChipInputProps>(
  (
    {
      label,
      placeholder = "Escribir y presionar Enter",
      value = [],
      status = "default",
      helperText,
      icon,
      normalize = (raw) => raw.trim().toUpperCase(),
      onChange,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const isDisabled = status === "disabled";

    const commit = () => {
      const normalized = normalize(draft);
      if (normalized && !value.includes(normalized)) {
        onChange?.([...value, normalized]);
      }
      setDraft("");
    };

    const remove = (chip: string) => {
      onChange?.(value.filter((v) => v !== chip));
    };

    return (
      <div
        ref={ref}
        className={`ds-chip-input ${statusClass[status]} ${className}`.trim()}
        {...rest}
      >
        {label && <label className="ds-chip-input__label">{label}</label>}

        <div
          className="ds-chip-input__trigger"
          onClick={() => inputRef.current?.focus()}
        >
          <span className="ds-chip-input__chips">
            {value.map((chip) => (
              <span key={chip} className="ds-chip-input__chip">
                {chip}
                <span
                  className="ds-chip-input__chip-x"
                  role="button"
                  tabIndex={0}
                  aria-label={`Quitar ${chip}`}
                  onClick={(e) => { e.stopPropagation(); remove(chip); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); remove(chip); } }}
                >
                  &times;
                </span>
              </span>
            ))}
            <input
              ref={inputRef}
              className="ds-chip-input__field"
              type="text"
              value={draft}
              placeholder={value.length === 0 ? placeholder : ""}
              disabled={isDisabled}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Backspace" && draft === "" && value.length > 0) {
                  remove(value[value.length - 1]);
                }
              }}
            />
          </span>
          {icon && <span className="ds-chip-input__icon">{icon}</span>}
        </div>

        {helperText && <span className="ds-chip-input__helper">{helperText}</span>}
      </div>
    );
  },
);

ChipInput.displayName = "ChipInput";
