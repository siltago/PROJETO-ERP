"use client";

import { useState, createContext, useContext, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

/* ── Context ─────────────────────────────────────────── */
interface AccordionCtx {
  value: string | null;
  setValue: (v: string | null) => void;
  multiple: boolean;
  openItems: Set<string>;
  toggleItem: (v: string) => void;
}
const Ctx = createContext<AccordionCtx | null>(null);

/* ── Root ─────────────────────────────────────────────── */
interface AccordionProps {
  defaultValue?: string;
  multiple?: boolean;
  className?: string;
  children: ReactNode;
}

export function Accordion({ defaultValue, multiple = false, className, children }: AccordionProps) {
  const [value, setValue]       = useState<string | null>(defaultValue ?? null);
  const [openItems, setOpen]    = useState<Set<string>>(
    defaultValue ? new Set([defaultValue]) : new Set()
  );

  const toggleItem = (v: string) => {
    if (multiple) {
      setOpen(prev => {
        const next = new Set(prev);
        next.has(v) ? next.delete(v) : next.add(v);
        return next;
      });
    } else {
      setValue(prev => (prev === v ? null : v));
    }
  };

  return (
    <Ctx.Provider value={{ value, setValue, multiple, openItems, toggleItem }}>
      <div className={cn("flex flex-col divide-y divide-divider", className)}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

/* ── Item ─────────────────────────────────────────────── */
interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionItem({ value, className, children, ...props }: AccordionItemProps) {
  return (
    <div data-accordion-item={value} className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

/* ── Trigger ──────────────────────────────────────────── */
interface AccordionTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children: ReactNode;
}

export function AccordionTrigger({ value, className, children, ...props }: AccordionTriggerProps) {
  const ctx = useContext(Ctx)!;
  const isOpen = ctx.multiple ? ctx.openItems.has(value) : ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.toggleItem(value)}
      aria-expanded={isOpen}
      className={cn(
        "flex w-full items-center justify-between gap-3 py-3.5 text-left",
        "text-sm font-semibold text-text transition-colors duration-[120ms]",
        "hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
        className
      )}
      {...props}
    >
      <span className="flex-1">{children}</span>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={cn("shrink-0 text-text-3 transition-transform duration-[180ms]", isOpen && "rotate-180")}
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

/* ── Content ──────────────────────────────────────────── */
interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function AccordionContent({ value, className, children, ...props }: AccordionContentProps) {
  const ctx = useContext(Ctx)!;
  const isOpen = ctx.multiple ? ctx.openItems.has(value) : ctx.value === value;

  if (!isOpen) return null;
  return (
    <div
      className={cn("pb-4 text-sm text-text-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
