import { type HTMLAttributes, type ReactNode, forwardRef } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — Badge (Atom)
 *
 * Figma specs:
 *   Colors: primary | secondary | success | error | warning
 *   Shape: square (4px radius) | rounded (12px radius)
 *   Padding: 8px horizontal, 4px vertical
 *   Font: Body (16px) semibold
 * ────────────────────────────────────────────── */

export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning";
export type BadgeShape = "square" | "rounded" | "pill";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  shape?: BadgeShape;
  icon?: ReactNode;
}

const colorClass: Record<BadgeColor, string> = {
  primary: "ds-badge--primary",
  secondary: "ds-badge--secondary",
  success: "ds-badge--success",
  error: "ds-badge--error",
  warning: "ds-badge--warning",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { color = "primary", shape = "square", icon, children, className = "", ...rest },
    ref,
  ) => {
    const shapeClass = shape === "square" ? "ds-badge--square" : "ds-badge--rounded";

    return (
      <span
        ref={ref}
        className={`ds-badge ${colorClass[color]} ${shapeClass} ${className}`.trim()}
        {...rest}
      >
        {icon && <span className="ds-badge__icon">{icon}</span>}
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
