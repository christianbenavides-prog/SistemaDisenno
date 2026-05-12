import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

/* ──────────────────────────────────────────────
 * Design System SM — Button (Atom)
 *
 * Variants from Figma:
 *   Type:  Principal | Secundario | Ghost | Link
 *   Size:  xs (32px) | sm (40px) | md (48px) | lg (60px)
 *   State: default | hover | active | disabled
 *
 * Principal uses a gradient background (brand-400 → brand-600).
 * Secundario uses a 2px border with transparent fill.
 * Ghost has no border/background.
 * All use pill shape (border-radius: 120px).
 * ────────────────────────────────────────────── */

export type ButtonVariant = "principal" | "secundario" | "ghost" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeStyles: Record<ButtonSize, string> = {
  xs: "ds-btn--xs",
  sm: "ds-btn--sm",
  md: "ds-btn--md",
  lg: "ds-btn--lg",
};

const variantStyles: Record<ButtonVariant, string> = {
  principal: "ds-btn--principal",
  secundario: "ds-btn--secundario",
  ghost: "ds-btn--ghost",
  link: "ds-btn--link",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "principal",
      size = "md",
      leftIcon,
      rightIcon,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={`ds-btn ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? "ds-btn--disabled" : ""} ${className}`.trim()}
        disabled={disabled}
        {...rest}
      >
        {leftIcon && <span className="ds-btn__icon">{leftIcon}</span>}
        {children && <span className="ds-btn__label">{children}</span>}
        {rightIcon && <span className="ds-btn__icon">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";
