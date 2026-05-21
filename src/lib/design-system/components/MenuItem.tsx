import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — MenuItem (Molecule)
 *
 * Figma specs:
 *   Width: 13.75rem (flexible)
 *   Padding: 0.75rem
 *   Gap: 0.5rem
 *   Border radius: 0.5rem (radius-sm)
 *   Icon: 1.25x1.25rem (Lucide icons)
 *   Text: Body (1rem) regular
 *   States:
 *     enable: white bg, neutral-400 text
 *     hover: neutral-50 bg, neutral-400 text
 *     selected: gradient brand-400 → brand-50, brand-950 text
 * ────────────────────────────────────────────── */

export type MenuItemState = "enable" | "hover" | "selected";

export interface MenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: MenuItemState;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  label: string;
}

const stateClass: Record<MenuItemState, string> = {
  enable: "",
  hover: "ds-menu-item--hover",
  selected: "ds-menu-item--selected",
};

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  (
    { state = "enable", icon, rightIcon, label, className = "", type = "button", disabled, ...rest },
    ref,
  ) => {
    const resolvedState = disabled ? "enable" : state;

    return (
      <button
        ref={ref}
        type={type}
        className={`ds-menu-item ${stateClass[resolvedState]} ${className}`.trim()}
        role="menuitem"
        aria-current={resolvedState === "selected" ? "page" : undefined}
        disabled={disabled}
        {...rest}
      >
        {icon && <span className="ds-menu-item__icon">{icon}</span>}
        <span className="ds-menu-item__label">{label}</span>
        {rightIcon && (
          <span className="ds-menu-item__icon">{rightIcon}</span>
        )}
      </button>
    );
  },
);

MenuItem.displayName = "MenuItem";
