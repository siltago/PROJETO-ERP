import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

export type ChipVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "accent";

const variantStyles: Record<ChipVariant, string> = {
  default: "bg-surface-3 text-text-2 border-border",
  primary: "bg-primary-soft text-primary border-primary/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger:  "bg-danger-soft text-danger border-danger/20",
  info:    "bg-info-soft text-info border-info/20",
  accent:  "bg-accent-soft text-accent border-accent/20",
};

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  icon?: ReactNode;
  onRemove?: () => void;
  disabled?: boolean;
}

export function Chip({
  variant = "default",
  icon,
  onRemove,
  disabled,
  className,
  children,
  ...props
}: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-semibold transition-colors duration-[120ms]",
        variantStyles[variant],
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0 opacity-70">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          aria-label="Remover"
          className="shrink-0 rounded-full opacity-60 hover:opacity-100 transition-opacity ml-0.5"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </span>
  );
}
