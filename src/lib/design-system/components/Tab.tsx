import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — Tab (Molecule)
 *
 * Figma specs:
 *   Height: 2.75rem
 *   Padding: 1rem vertical, 1.25rem horizontal
 *   Gap: 0.5rem
 *   Icon: 0.75x0.75rem (Lucide)
 *   Text: Body (1rem)
 *   States:
 *     enable: pill, white bg, neutral-400 text regular
 *     hover: pill, brand-50 bg, brand-800 text
 *     pressed: pill, white bg, 0.25rem brand-100 border
 *     selected: flat bottom, white bg, 0.125rem brand-600 bottom border, brand-800 semibold
 *     disabled: pill, neutral-100 bg, neutral-400 text
 * ────────────────────────────────────────────── */

export type TabState = "enable" | "hover" | "pressed" | "selected" | "disabled";

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tabState?: TabState;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const stateClass: Record<TabState, string> = {
  enable: "",
  hover: "ds-tab--hover",
  pressed: "ds-tab--pressed",
  selected: "ds-tab--selected",
  disabled: "ds-tab--disabled",
};

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  (
    {
      tabState = "enable",
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref,
  ) => {
    const resolvedState = disabled ? "disabled" : tabState;

    return (
      <button
        ref={ref}
        className={`ds-tab ${stateClass[resolvedState]} ${className}`.trim()}
        role="tab"
        aria-selected={resolvedState === "selected"}
        aria-disabled={resolvedState === "disabled"}
        disabled={disabled}
        {...rest}
      >
        {leftIcon && <span className="ds-tab__icon">{leftIcon}</span>}
        {children && <span className="ds-tab__label">{children}</span>}
        {rightIcon && <span className="ds-tab__icon">{rightIcon}</span>}
      </button>
    );
  },
);

Tab.displayName = "Tab";
