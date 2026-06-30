import { ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { wrap: "py-8",   icon: "h-10 w-10 text-text-3", title: "text-sm font-semibold",  desc: "text-xs" },
  md: { wrap: "py-14",  icon: "h-12 w-12 text-text-3", title: "text-base font-semibold", desc: "text-sm" },
  lg: { wrap: "py-20",  icon: "h-16 w-16 text-text-3", title: "text-lg font-semibold",   desc: "text-sm" },
};

export function EmptyState({ icon, title, description, action, className, size = "md" }: EmptyStateProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex flex-col items-center justify-center text-center gap-4", s.wrap, className)}>
      {icon && (
        <div className={cn("opacity-40", s.icon)}>
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <p className={cn("text-text", s.title)}>{title}</p>
        {description && <p className={cn("text-text-2 max-w-sm mx-auto", s.desc)}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/* Ícones prontos para EmptyState */
export const EmptyIcons = {
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Doc: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
};
