"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "warning" | "accent";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  as?: "button" | "a";
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   "bg-primary text-white hover:bg-primary-hover border-transparent",
  secondary: "bg-surface-2 text-text hover:bg-surface-3 border-border",
  outline:   "bg-transparent text-primary hover:bg-primary-soft border-primary",
  ghost:     "bg-transparent text-text-2 hover:bg-surface-2 hover:text-text border-transparent",
  danger:    "bg-danger text-white hover:bg-danger-hover border-transparent",
  success:   "bg-success text-white hover:bg-success-hover border-transparent",
  warning:   "bg-warning text-white hover:bg-warning-hover border-transparent",
  accent:    "bg-accent text-white hover:bg-accent-hover border-transparent",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7  px-3   text-xs  gap-1.5",
  md: "h-9  px-4   text-sm  gap-2",
  lg: "h-11 px-5   text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold border",
        "transition-all duration-[120ms] active:scale-[0.97]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        "whitespace-nowrap select-none",
        "rounded-md",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
});

function Spinner({ size }: { size: ButtonSize }) {
  const dim = size === "sm" ? 12 : size === "lg" ? 18 : 14;
  return (
    <svg
      width={dim} height={dim}
      viewBox="0 0 24 24" fill="none"
      className="animate-spin opacity-70"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
    </svg>
  );
}
