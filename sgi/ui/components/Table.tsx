"use client";

import { ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes, useState } from "react";
import { cn } from "@/ui/lib/cn";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

/* ── Types ─────────────────────────────────────────────────── */

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  rowKey?: (row: T, i: number) => string | number;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectChange?: (keys: Set<string>) => void;
  className?: string;
  stickyHeader?: boolean;
}

/* ── Table Component ───────────────────────────────────────── */

export function DataTable<T extends Record<string, unknown>>({
  columns, data, loading, emptyTitle = "Nenhum resultado",
  emptyDescription, emptyIcon, rowKey, onRowClick,
  selectable, selectedKeys, onSelectChange, className, stickyHeader,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const getKey = (row: T, i: number) => rowKey?.(row, i) ?? i;

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey]; const vb = b[sortKey];
        const cmp = String(va ?? "").localeCompare(String(vb ?? ""), "pt", { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const allSelected = data.length > 0 && data.every((r, i) => selectedKeys?.has(String(getKey(r, i))));
  const toggleAll = () => {
    if (!onSelectChange) return;
    if (allSelected) onSelectChange(new Set());
    else onSelectChange(new Set(data.map((r, i) => String(getKey(r, i)))));
  };
  const toggleRow = (key: string) => {
    if (!onSelectChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    next.has(key) ? next.delete(key) : next.add(key);
    onSelectChange(next);
  };

  if (loading) {
    return <div className={className}><SkeletonTableRows cols={columns.length + (selectable ? 1 : 0)} /></div>;
  }

  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-full text-sm">
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr className="border-b border-border bg-surface-2">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-3 whitespace-nowrap",
                    col.align === "center" && "text-center",
                    col.align === "right"  && "text-right",
                    col.sortable && "cursor-pointer select-none hover:text-text transition-colors"
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    size="sm"
                  />
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => {
                const key = String(getKey(row, i));
                const isSelected = selectedKeys?.has(key);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "border-b border-divider last:border-0 transition-colors duration-[80ms]",
                      onRowClick && "cursor-pointer hover:bg-surface-2",
                      isSelected && "bg-primary-soft/30"
                    )}
                  >
                    {selectable && (
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleRow(key)}
                          onClick={e => e.stopPropagation()}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-text",
                          col.align === "center" && "text-center",
                          col.align === "right"  && "text-right"
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row, i)
                          : String(row[col.key] ?? "—")
                        }
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      className={cn("transition-opacity", active ? "opacity-100 text-primary" : "opacity-30")}
    >
      {(!active || dir === "asc")  && <polyline points="18 15 12 9 6 15" />}
      {active && dir === "desc" && <polyline points="6 9 12 15 18 9" />}
    </svg>
  );
}

function SkeletonTableRows({ cols }: { cols: number }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-divider px-4 py-3 bg-surface-2">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} height={12} rounded="md" style={{ flex: 1 }} />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, ri) => (
        <div key={ri} className="flex gap-4 border-b border-divider last:border-0 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton key={ci} height={12} rounded="md" style={{ flex: ci === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Primitive table components (for custom tables) ──────── */

export function Th({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-3 whitespace-nowrap", className)} {...props}>
      {children}
    </th>
  );
}

export function Td({ className, children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 py-3 text-sm text-text", className)} {...props}>
      {children}
    </td>
  );
}

export function Tr({ className, children, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-divider last:border-0", className)} {...props}>
      {children}
    </tr>
  );
}
