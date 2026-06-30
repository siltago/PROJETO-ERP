import { HTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingStyles = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padding = "md", hoverable, className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "card",
        paddingStyles[padding],
        hoverable && "transition-shadow duration-[120ms] hover:shadow-lg cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-text", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-text-2", className)} {...props}>
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-4 border-t border-divider pt-4 flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  color?: string;
  href?: string;
  trend?: { value: number; label?: string };
  className?: string;
}

export function StatCard({ label, value, sub, icon, color, href, trend, className }: StatCardProps) {
  const Wrapper = href ? "a" : "div";
  return (
    <Wrapper
      href={href}
      className={cn(
        "card p-5 flex flex-col gap-3",
        href && "transition-shadow duration-[120ms] hover:shadow-lg cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-text-2 leading-snug">{label}</p>
        {icon && (
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: color ? `${color}18` : undefined, color: color ?? "rgb(var(--color-primary))" }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-bold leading-none" style={{ color: color ?? "rgb(var(--color-text))" }}>
          {value}
        </p>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 rounded-full",
            trend.value >= 0 ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          )}>
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-text-3">{sub}</p>}
    </Wrapper>
  );
}
