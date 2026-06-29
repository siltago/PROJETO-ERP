"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const ABAS = [
  { slug: "dashboard", label: "Dashboard" },
  { slug: "carteiras", label: "Carteiras" },
] as const;

export function FinanceiroTabNav({
  podeDashboard,
  podeCarteiras,
}: {
  podeDashboard: boolean;
  podeCarteiras: boolean;
}) {
  const searchParams = useSearchParams();
  const abaAtual = searchParams.get("aba") ?? "dashboard";

  return (
    <div className="flex gap-1 border-b border-line mt-6">
      {ABAS.map(({ slug, label }) => {
        const show = slug === "dashboard" ? podeDashboard : podeCarteiras;
        if (!show) return null;
        const active = abaAtual === slug;
        return (
          <Link
            key={slug}
            href={`/financeiro?aba=${slug}`}
            className={
              active
                ? "border-b-2 border-steel px-4 py-2.5 text-sm font-semibold text-ink shrink-0"
                : "px-4 py-2.5 text-sm font-medium text-ink-faint hover:text-ink-soft shrink-0"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
