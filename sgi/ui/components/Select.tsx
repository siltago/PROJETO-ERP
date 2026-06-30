"use client";

import { forwardRef, SelectHTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, fullWidth = true, className, id, placeholder, children, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = !!error;

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "field appearance-none pr-9 cursor-pointer",
            hasError && "border-danger",
            className
          )}
          aria-invalid={hasError || undefined}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </div>
      {hint  && !error && <p className="text-[13px] text-text-3">{hint}</p>}
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
    </div>
  );
});
