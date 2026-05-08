import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type SummaryTileTone = "brand" | "success" | "warning" | "error" | "neutral";

export interface SummaryTileProps extends HTMLAttributes<HTMLElement> {
  label: string;
  value: ReactNode;
  tone?: SummaryTileTone;
  meta?: ReactNode;
  selected?: boolean;
  onPress?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}

export const SummaryTile = forwardRef<HTMLElement, SummaryTileProps>(
  ({ label, value, tone = "brand", meta, selected = false, onPress, className = "", ...rest }, ref) => {
    const classes = `ds-summary-tile ds-summary-tile--${tone} ${selected ? "ds-summary-tile--selected" : ""} ${onPress ? "ds-summary-tile--interactive" : ""} ${className}`.trim();
    const content = (
      <>
        <span className="ds-summary-tile__label">{label}</span>
        <strong className="ds-summary-tile__value">{value}</strong>
        {meta && <span className="ds-summary-tile__meta">{meta}</span>}
      </>
    );

    if (onPress) {
      return (
        <button
          ref={ref as ForwardedRef<HTMLButtonElement>}
          type="button"
          className={classes}
          aria-pressed={selected}
          onClick={onPress}
          {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      );
    }

    return (
      <article
        ref={ref}
        className={classes}
        {...rest}
      >
        {content}
      </article>
    );
  },
);

SummaryTile.displayName = "SummaryTile";
