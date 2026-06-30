import { HTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
}

const roundedMap = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" };

export function Skeleton({ width, height, rounded = "md", className, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-3",
        roundedMap[rounded],
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          rounded="md"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("card p-5 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton width={40} height={40} rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} rounded="md" style={{ width: "60%" }} />
          <Skeleton height={12} rounded="md" style={{ width: "40%" }} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-divider px-5 py-3">
        <Skeleton height={14} rounded="md" style={{ width: "30%" }} />
      </div>
      <div>
        {Array.from({ length: rows }).map((_, ri) => (
          <div key={ri} className="flex gap-4 border-b border-divider last:border-0 px-5 py-3.5">
            {Array.from({ length: cols }).map((_, ci) => (
              <Skeleton
                key={ci}
                height={13}
                rounded="md"
                style={{ flex: ci === 0 ? 2 : 1, width: "auto" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
