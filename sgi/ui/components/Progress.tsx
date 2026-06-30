import { cn } from "@/ui/lib/cn";

type ProgressVariant = "primary" | "success" | "warning" | "danger" | "accent";

interface ProgressProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

const variantBar: Record<ProgressVariant, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-danger",
  accent:  "bg-accent",
};

const heights = { sm: "h-1", md: "h-2", lg: "h-3" };

export function Progress({
  value, max = 100, variant = "primary", size = "md",
  label, showValue, className,
}: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-2">
          {label && <span>{label}</span>}
          {showValue && <span className="font-medium">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-surface-3", heights[size])}>
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-valuemin={0}
          className={cn("h-full rounded-full transition-all duration-500", variantBar[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
