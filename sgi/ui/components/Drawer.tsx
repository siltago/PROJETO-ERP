"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

export type DrawerSide = "left" | "right" | "bottom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: DrawerSide;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  hideClose?: boolean;
  className?: string;
}

const sideStyles: Record<DrawerSide, { panel: string; translate: string; enter: string }> = {
  right:  {
    panel:     "inset-y-0 right-0 flex-col",
    translate: "translate-x-full",
    enter:     "translate-x-0",
  },
  left:   {
    panel:     "inset-y-0 left-0 flex-col",
    translate: "-translate-x-full",
    enter:     "translate-x-0",
  },
  bottom: {
    panel:     "inset-x-0 bottom-0 flex-col",
    translate: "translate-y-full",
    enter:     "translate-y-0",
  },
};

const sizeWidth: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "w-72",
  md: "w-80 sm:w-96",
  lg: "w-full sm:w-[480px]",
  xl: "w-full sm:w-[600px]",
};

export function Drawer({
  open, onClose, side = "right", size = "md",
  title, children, footer, hideClose, className,
}: DrawerProps) {
  const s = sideStyles[side];

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-[220ms]",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "absolute flex bg-surface shadow-xl transition-transform",
          "overflow-hidden",
          s.panel,
          side !== "bottom" ? sizeWidth[size] : "max-h-[80vh]",
          open ? s.enter : s.translate,
          className
        )}
        style={{ transitionDuration: "var(--motion-modal)" }}
      >
        {/* Header */}
        {(title || !hideClose) && (
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-divider px-5 py-4">
            {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
            {!hideClose && (
              <button
                onClick={onClose}
                className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-text-2 hover:bg-surface-2 transition-colors"
                aria-label="Fechar"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 border-t border-divider px-5 py-4 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
