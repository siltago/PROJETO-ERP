"use client";

import {
  useState, useRef, useEffect, ReactNode,
  createContext, useContext, KeyboardEvent,
} from "react";
import { cn } from "@/ui/lib/cn";

/* ── Context ─────────────────────────────────────────────── */
interface DropdownCtx { close: () => void }
const Ctx = createContext<DropdownCtx>({ close: () => {} });

/* ── Root ────────────────────────────────────────────────── */
interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
}

export function Dropdown({ trigger, children, align = "right", width = "180px", className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <Ctx.Provider value={{ close: () => setOpen(false) }}>
      <div ref={ref} className={cn("relative inline-block", className)}>
        <div onClick={() => setOpen(o => !o)}>{trigger}</div>
        {open && (
          <div
            className={cn(
              "absolute z-50 mt-1.5 py-1 overflow-hidden",
              "bg-surface border border-border rounded-lg shadow-lg",
              "animate-in fade-in zoom-in-95 duration-[120ms]",
              align === "right" ? "right-0" : "left-0"
            )}
            style={{ minWidth: width }}
          >
            {children}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

/* ── Item ────────────────────────────────────────────────── */
interface DropdownItemProps {
  onClick?: () => void;
  icon?: ReactNode;
  children: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
  closeOnClick?: boolean;
}

export function DropdownItem({
  onClick, icon, children, variant = "default", disabled, closeOnClick = true,
}: DropdownItemProps) {
  const { close } = useContext(Ctx);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
    if (closeOnClick) close();
  };

  const handleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") handleClick();
  };

  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKey}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-left",
        "transition-colors duration-[80ms]",
        variant === "danger"
          ? "text-danger hover:bg-danger-soft"
          : "text-text-2 hover:bg-surface-2 hover:text-text",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {icon && <span className="h-4 w-4 shrink-0 text-current/60">{icon}</span>}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <hr className="my-1 border-divider" />;
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-3">
      {children}
    </p>
  );
}
