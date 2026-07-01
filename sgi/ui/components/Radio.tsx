"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hint?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, hint, className, id, disabled, ...props },
  ref
) {
  const inputId = id ?? (label ? `r-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

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
            type="radio"
            disabled={disabled}
            className={cn(
              "peer h-4 w-4 cursor-pointer appearance-none rounded-full",
              "border-2 border-border bg-surface transition-all duration-[120ms]",
              "checked:border-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              "disabled:cursor-not-allowed"
            )}
            {...props}
          />
          <span className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
        {label && <span className="text-sm font-medium text-text">{label}</span>}
      </label>
      {hint && <p className="pl-6 text-[13px] text-text-3">{hint}</p>}
    </div>
  );
});

interface RadioGroupProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({ label, error, hint, children, className }: RadioGroupProps) {
  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      {label && <legend className="label mb-0.5">{label}</legend>}
      {children}
      {hint && !error && <p className="text-[13px] text-text-3">{hint}</p>}
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
    </fieldset>
  );
}
