"use client";

import { createContext, useContext, useState, ReactNode, HTMLAttributes } from "react";
import { cn } from "@/ui/lib/cn";

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue>({ active: "", setActive: () => {} });

interface TabsProps {
  defaultTab?: string;
  value?: string;
  onChange?: (id: string) => void;
  children: ReactNode;
  className?: string;
}

export function Tabs({ defaultTab, value, onChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultTab ?? "");
  const active = value ?? internal;
  const setActive = (id: string) => {
    setInternal(id);
    onChange?.(id);
  };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "underline" | "pills" | "boxed";
}

export function TabList({ variant = "underline", className, children, ...props }: TabListProps) {
  const variantStyles = {
    underline: "border-b border-border flex gap-1",
    pills:     "flex gap-1.5",
    boxed:     "flex gap-0 border border-border rounded-lg p-0.5 bg-surface-2 w-fit",
  };
  return (
    <div role="tablist" className={cn(variantStyles[variant], className)} {...props}>
      {children}
    </div>
  );
}

interface TabProps {
  id: string;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: number | string;
  variant?: "underline" | "pills" | "boxed";
}

export function Tab({ id, children, icon, disabled, badge, variant = "underline" }: TabProps) {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === id;

  const styles = {
    underline: cn(
      "inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors duration-[120ms]",
      isActive
        ? "border-primary text-primary"
        : "border-transparent text-text-2 hover:text-text hover:border-border"
    ),
    pills: cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-[120ms]",
      isActive ? "bg-primary-soft text-primary" : "text-text-2 hover:text-text hover:bg-surface-3"
    ),
    boxed: cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-[120ms]",
      isActive ? "bg-surface shadow-sm text-text" : "text-text-2 hover:text-text"
    ),
  };

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => !disabled && setActive(id)}
      disabled={disabled}
      className={cn(styles[variant], disabled && "opacity-40 cursor-not-allowed")}
    >
      {icon && <span className="h-4 w-4 shrink-0">{icon}</span>}
      {children}
      {badge !== undefined && (
        <span className={cn(
          "inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
          isActive ? "bg-primary/20 text-primary" : "bg-surface-3 text-text-3"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

interface TabPanelProps {
  id: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  const { active } = useContext(TabsContext);
  if (active !== id) return null;
  return (
    <div role="tabpanel" className={className}>
      {children}
    </div>
  );
}
