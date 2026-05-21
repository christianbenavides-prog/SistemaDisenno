import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — Sidebar (Organism)
 *
 * Figma specs:
 *   Width: 16.75rem (full) / 4rem (collapsed)
 *   Background: white
 *   Border-radius: 1rem (radius-lg)
 *   Padding: 1.5rem
 *   Gap: 3rem between logo and nav
 *   Uses MenuItem molecule for items
 * ────────────────────────────────────────────── */

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  logo?: ReactNode;
  footer?: ReactNode;
  watermark?: ReactNode;
}

export const Sidebar = forwardRef<HTMLElement, SidebarProps>(
  (
    {
      collapsed = false,
      logo,
      footer,
      watermark,
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    return (
      <aside
        ref={ref}
        className={`ds-sidebar ${collapsed ? "ds-sidebar--collapsed" : ""} ${className}`.trim()}
        {...rest}
      >
        {watermark && <div className="ds-sidebar__watermark">{watermark}</div>}
        {logo && <div className="ds-sidebar__logo">{logo}</div>}
        <nav className="ds-sidebar__nav">{children}</nav>
        {footer && <div className="ds-sidebar__footer">{footer}</div>}
      </aside>
    );
  },
);

Sidebar.displayName = "Sidebar";
