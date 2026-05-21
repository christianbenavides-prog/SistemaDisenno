import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — MapLayout (Template)
 *
 * Map view template: map area + side panel with cards.
 * Use inside AppShell content area.
 * ────────────────────────────────────────────── */

export interface MapLayoutProps extends HTMLAttributes<HTMLDivElement> {
  map?: ReactNode;
  /** Optional header rendered above the cards area (e.g. search input). */
  panelHeader?: ReactNode;
  cards?: ReactNode;
  actions?: ReactNode;
  panelWidth?: string;
}

export const MapLayout = forwardRef<HTMLDivElement, MapLayoutProps>(
  ({ map, panelHeader, cards, actions, panelWidth, className = "", ...rest }, ref) => {
    return (
      <div ref={ref} className={`ds-map-layout ${className}`.trim()} {...rest}>
        <div className="ds-map-layout__map">{map}</div>
        <div
          className="ds-map-layout__panel"
          style={panelWidth ? { width: panelWidth } : undefined}
        >
          {panelHeader && (
            <div className="ds-map-layout__panel-header">{panelHeader}</div>
          )}
          <div className="ds-map-layout__cards">{cards}</div>
          {actions && <div className="ds-map-layout__actions">{actions}</div>}
        </div>
      </div>
    );
  },
);

MapLayout.displayName = "MapLayout";
