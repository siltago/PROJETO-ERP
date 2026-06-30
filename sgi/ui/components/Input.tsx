"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, prefixIcon, suffixIcon, fullWidth = true, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = !!error;

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixIcon && (
          <span className="pointer-events-none absolute left-3 text-text-3">
            {prefixIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "field",
            prefixIcon  ? "pl-9" : undefined,
            suffixIcon  ? "pr-9" : undefined,
            hasError    && "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgb(var(--color-danger)/0.15)]",
            className
          )}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {suffixIcon && (
          <span className="pointer-events-none absolute right-3 text-text-3">
            {suffixIcon}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-[13px] text-text-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
});

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, fullWidth = true, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const hasError = !!error;

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea
        ref={ref}
        id={inputId}
        rows={props.rows ?? 3}
        className={cn(
          "field resize-y min-h-[80px]",
          hasError && "border-danger",
          className
        )}
        aria-invalid={hasError || undefined}
        {...props}
      />
      {hint  && !error && <p className="text-[13px] text-text-3">{hint}</p>}
      {error && <p role="alert" className="text-[13px] text-danger">{error}</p>}
    </div>
  );
});
