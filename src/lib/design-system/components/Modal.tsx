import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — Modal (Organism)
 *
 * Figma specs:
 *   Width: flexible (38.9375rem reference)
 *   Border: 0.0625rem neutral-300, radius-md (0.75rem)
 *   Header: 1rem padding, title H6 (1.25rem) bold
 *   Body: 1.5rem padding, gap 1.5rem
 *     Icon: 2.5rem (Lucide)
 *     Subtitle: H5 (1.5rem) semibold
 *     Body text: Body L (1.25rem) regular
 *   Footer: 1rem padding, gap 1.5rem, right-aligned
 *     Secondary: ghost button
 *     Primary: gradient pill
 * ────────────────────────────────────────────── */

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  headerSubtitle?: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  showCloseButton?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
  onClose?: () => void;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  icon?: ReactNode;
  subtitle?: string;
  bodyText?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      title = "Modal Title",
      headerSubtitle,
      showHeader = true,
      showFooter = true,
      showCloseButton = true,
      primaryLabel = "Save Changes",
      secondaryLabel = "Close",
      onClose,
      onPrimaryClick,
      onSecondaryClick,
      icon,
      subtitle,
      bodyText,
      children,
      className = "",
      ...rest
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showHeader ? "ds-modal-title" : undefined}
        className={`ds-modal ${className}`.trim()}
        {...rest}
      >
        {showHeader && (
          <div className="ds-modal__header">
            <div className="ds-modal__header-content">
              <span id="ds-modal-title" className="ds-modal__title">{title}</span>
              {headerSubtitle && <span className="ds-modal__header-subtitle">{headerSubtitle}</span>}
            </div>
            {showCloseButton && (
              <button type="button" className="ds-modal__close" aria-label="Cerrar" onClick={onClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className="ds-modal__body">
          {icon && <span className="ds-modal__icon">{icon}</span>}
          {subtitle && <p className="ds-modal__subtitle">{subtitle}</p>}
          {bodyText && <p className="ds-modal__text">{bodyText}</p>}
          {children}
        </div>

        {showFooter && (
          <div className="ds-modal__footer">
            {secondaryLabel && (
              <button type="button" className="ds-modal__btn-secondary" onClick={onSecondaryClick ?? onClose}>
                {secondaryLabel}
              </button>
            )}
            {primaryLabel && (
              <button type="button" className="ds-modal__btn-primary" onClick={onPrimaryClick}>
                {primaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );
  },
);

Modal.displayName = "Modal";
