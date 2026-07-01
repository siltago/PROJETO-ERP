"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, className, id, disabled, ...props },
  ref
) {
  const inputId = id ?? (label ? `cb-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-center gap-2.5 cursor-pointer select-none",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="relative flex shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            disabled={disabled}
            className={cn(
              "peer h-4.5 w-4.5 cursor-pointer appearance-none rounded",
              "border border-border bg-surface transition-all duration-[120ms]",
              "checked:border-primary checked:bg-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed",
              error && "border-danger"
            )}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          <svg
            className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity"
            width="10" height="10" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="1.5 6 4.5 9 10.5 3" />
          </svg>
        </div>
        {label && <span className="text-sm font-medium text-text">{label}</span>}
      </label>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="pl-7 text-[13px] text-text-3">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="pl-7 text-[13px] text-danger">{error}</p>
      )}
    </div>
  );
});

interface CheckboxGroupProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function CheckboxGroup({ label, error, hint, children, className }: CheckboxGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      {label && <legend className="label mb-0.5">{label}</legend>}
      {children}
      {hint && !error && <p className="text-[13px] text-text-3">{hint}</p>}
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
    </fieldset>
  );
}
