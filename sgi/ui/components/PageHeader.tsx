import { ReactNode } from "react";
import { cn } from "@/ui/lib/cn";
import { Breadcrumb, BreadcrumbItem } from "./Breadcrumb";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
  backHref?: string;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  backHref,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-1", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <Breadcrumb items={breadcrumb} className="mb-1" />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <a
              href={backHref}
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                "text-text-2 hover:bg-surface-2 hover:text-text transition-colors duration-[120ms]"
              )}
              aria-label="Voltar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </a>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-text leading-tight truncate">{title}</h1>
            {description && (
              <p className="mt-0.5 text-sm text-text-2 truncate">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, actions, children, className }: SectionProps) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-text">{title}</h2>}
            {description && <p className="text-sm text-text-2">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

interface ContainerProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

const containerSizes: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-7xl",
  full: "max-w-none",
};

export function Container({ children, size = "xl", className }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", containerSizes[size], className)}>
      {children}
    </div>
  );
}
