import Link from "next/link";
import { cn } from "@/ui/lib/cn";

interface PaginationProps {
  currentPage: number;
  total: number;
  perPage: number;
  buildUrl: (page: number) => string;
  className?: string;
}

export function Pagination({ currentPage, total, perPage, buildUrl, className }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to   = Math.min(currentPage * perPage, total);

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className={cn("flex items-center justify-between border-t border-divider px-5 py-3 text-sm", className)}>
      <span className="text-xs text-text-3">
        {from}–{to} de {total}
      </span>
      <div className="flex items-center gap-1">
        <PageLink href={buildUrl(currentPage - 1)} disabled={currentPage <= 1} label="‹" />
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="flex h-8 w-8 items-center justify-center text-xs text-text-3">…</span>
          ) : (
            <PageLink
              key={p}
              href={buildUrl(p as number)}
              active={p === currentPage}
              label={String(p)}
            />
          )
        )}
        <PageLink href={buildUrl(currentPage + 1)} disabled={currentPage >= totalPages} label="›" />
      </div>
    </div>
  );
}

function PageLink({
  href, label, active, disabled,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded text-xs text-text-3/40">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors duration-[120ms]",
        active
          ? "bg-primary text-white"
          : "text-text-2 hover:bg-surface-2 hover:text-text"
      )}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}
