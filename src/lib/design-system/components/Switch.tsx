import { forwardRef, type InputHTMLAttributes } from "react";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className = "", checked, disabled, ...rest }, ref) => {
    return (
      <label className={`ds-switch ${disabled ? "ds-switch--disabled" : ""} ${className}`.trim()}>
        <span className={`ds-switch__control ${checked ? "ds-switch__control--checked" : ""}`}>
          <span className="ds-switch__thumb" />
          <input
            ref={ref}
            type="checkbox"
            className="ds-switch__input"
            checked={checked}
            disabled={disabled}
            {...rest}
          />
        </span>
        {label && <span className="ds-switch__label">{label}</span>}
      </label>
    );
  },
);

Switch.displayName = "Switch";
