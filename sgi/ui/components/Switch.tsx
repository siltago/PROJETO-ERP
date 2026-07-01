"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: "sm" | "md";
  labelPosition?: "left" | "right";
}

const trackSize = { sm: "h-5 w-9", md: "h-6 w-11" };
const thumbSize = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5" };
const thumbTranslate = { sm: "translate-x-4", md: "translate-x-5" };

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, hint, error, size = "md", labelPosition = "right", className, id, disabled, ...props },
  ref
) {
  const inputId = id ?? (label ? `sw-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  const track = (
    <div className="relative flex shrink-0 items-center">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        role="switch"
        disabled={disabled}
        className="peer sr-only"
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      <div className={cn(
        "rounded-full border-2 border-transparent transition-colors duration-[120ms]",
        "bg-surface-3 peer-checked:bg-primary",
        "peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
        trackSize[size]
      )} />
      <span className={cn(
        "pointer-events-none absolute left-0.5 rounded-full bg-white shadow",
        "transition-transform duration-[120ms]",
        thumbSize[size],
        `peer-checked:${thumbTranslate[size]}`
      )} />
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-center gap-2.5 cursor-pointer select-none",
          labelPosition === "left" && "flex-row-reverse justify-end",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {track}
        {label && <span className="text-sm font-medium text-text">{label}</span>}
      </label>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-[13px] text-text-3">{hint}</p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-[13px] text-danger">{error}</p>
      )}
    </div>
  );
});
