import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Navegação estrutural" className={cn("flex items-center", className)}>
      <ol className="flex flex-wrap items-center gap-0.5">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-0.5">
              {i > 0 && (
                <svg
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-text-3 shrink-0"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm text-text-2 hover:text-text transition-colors duration-[120ms] truncate"
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1 text-sm truncate",
                    isLast ? "font-medium text-text" : "text-text-2"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
