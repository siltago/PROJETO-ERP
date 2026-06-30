import { HTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "accent" | "ghost";
export type BadgeSize    = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-3 text-text-2",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger:  "bg-danger-soft text-danger",
  info:    "bg-info-soft text-info",
  accent:  "bg-accent-soft text-accent",
  ghost:   "border border-border text-text-2 bg-transparent",
};

const dotVariant: Record<BadgeVariant, string> = {
  default: "bg-text-2",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-danger",
  info:    "bg-info",
  accent:  "bg-accent",
  ghost:   "bg-text-3",
};

export function Badge({ variant = "default", size = "md", dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn("inline-block w-1.5 h-1.5 rounded-full shrink-0", dotVariant[variant])} />
      )}
      {children}
    </span>
  );
}

/* Badge com cor hexadecimal arbitrária (ex: status colorido do sistema) */
export function ColorBadge({
  color,
  label,
  size = "md",
  className,
}: {
  color: string;
  label: string;
  size?: BadgeSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]",
        className
      )}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
