"use client";

import { useState, ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

export type AlertVariant = "info" | "success" | "warning" | "danger";

const styles: Record<AlertVariant, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: "bg-info-soft border-info/30 text-info",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
  },
  success: {
    wrap: "bg-success-soft border-success/30 text-success",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  warning: {
    wrap: "bg-warning-soft border-warning/30 text-warning",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  danger: {
    wrap: "bg-danger-soft border-danger/30 text-danger",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children?: ReactNode;
  dismissible?: boolean;
  className?: string;
}

export function Alert({ variant = "info", title, children, dismissible, className }: AlertProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  const s = styles[variant];

  return (
    <div
      role="alert"
      className={cn("flex gap-3 rounded-lg border p-4 text-sm", s.wrap, className)}
    >
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="opacity-90">{children}</div>}
      </div>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          aria-label="Fechar"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  );
}
