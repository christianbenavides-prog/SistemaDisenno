import { forwardRef, useEffect, useState, type HTMLAttributes, type ReactNode } from "react";
import { Icon } from "../icons";

export interface ModuleShellProps extends HTMLAttributes<HTMLDivElement> {
  sidebar?: ReactNode;
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  topBarRight?: ReactNode;
  theme?: "light" | "dark";
}

export const ModuleShell = forwardRef<HTMLDivElement, ModuleShellProps>(
  (
    {
      sidebar,
      eyebrow,
      title,
      actions,
      topBarRight,
      theme = "light",
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
      if (!menuOpen) return;

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setMenuOpen(false);
      };

      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [menuOpen]);

    return (
      <div ref={ref} data-theme={theme} className={`ds-module-shell ${className}`.trim()} {...rest}>
        {sidebar}
        {sidebar && menuOpen && (
          <div className="ds-module-shell__drawer ds-module-shell__drawer--open">
            <button
              type="button"
              className="ds-module-shell__drawer-backdrop"
              aria-label="Cerrar menu"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="ds-module-shell__drawer-panel"
              role="dialog"
              aria-modal="true"
              onClickCapture={(event) => {
                if ((event.target as HTMLElement).closest(".ds-menu-item")) {
                  setMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                className="ds-module-shell__drawer-close"
                aria-label="Cerrar menu"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="x" size={20} />
              </button>
              {sidebar}
            </div>
          </div>
        )}
        <main className="ds-module-shell__main">
          <header className="ds-module-shell__topbar">
            <div className="ds-module-shell__title-group">
              {eyebrow && <p className="ds-module-shell__eyebrow">{eyebrow}</p>}
              <h1 className="ds-module-shell__title">{title}</h1>
            </div>
            {topBarRight && <div className="ds-module-shell__topbar-right">{topBarRight}</div>}
            {sidebar && (
              <button
                type="button"
                className="ds-module-shell__menu-button"
                aria-label="Abrir menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                <Icon name="menu" size={22} />
              </button>
            )}
          </header>
          {actions && <div className="ds-module-shell__actions">{actions}</div>}
          {children}
        </main>
      </div>
    );
  },
);

ModuleShell.displayName = "ModuleShell";
