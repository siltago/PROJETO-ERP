"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BackButton } from "@/modules/squadframe/components/back-button";
import { NovaAbaInline } from "@/app/catalogo/nova-aba-inline";

type Tipo = { id: string; nome: string; slug: string };
type Linha = { id: string; nome: string; tipo: string };

function SidebarInner({
  tipos,
  linhas,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: {
  tipos: Tipo[];
  linhas: Linha[];
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tipoParam = (searchParams.get("tipo") ?? searchParams.get("aba") ?? "").toLowerCase();
  const linhaParam = searchParams.get("linha") ?? "";
  const onCatalogRoot = pathname === "/catalogo";

  // Agrupa linhas por slug do tipo
  const linhasPorTipo: Record<string, Linha[]> = {};
  for (const l of linhas) {
    if (!linhasPorTipo[l.tipo]) linhasPorTipo[l.tipo] = [];
    linhasPorTipo[l.tipo].push(l);
  }

  const tiposComLinhas = tipos.filter((t) => (linhasPorTipo[t.slug]?.length ?? 0) > 0);
  // Cores RAL e tipos sem linhas ficam separados
  const tiposSemLinhas = tipos.filter((t) => (linhasPorTipo[t.slug]?.length ?? 0) === 0);

  const Header = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex items-center justify-between border-b border-line px-3 py-3">
      {!collapsed && (
        <div>
          <BackButton href="/" />
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-ink-faint">Catálogo</p>
        </div>
      )}
      <button
        onClick={onClose ?? (() => setCollapsed(!collapsed))}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-canvas transition-colors ${collapsed ? "mx-auto" : ""}`}
      >
        {onClose ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        )}
      </button>
    </div>
  );

  const NavContent = () => (
    <>
      {tiposComLinhas.map((tipo) => {
        const linhasDoTipo = linhasPorTipo[tipo.slug] ?? [];
        const tipoAtivo = onCatalogRoot && tipoParam === tipo.slug;
        return (
          <div key={tipo.slug} className="mb-1">
            {/* Label do tipo — clicável para ver todos */}
            <Link
              href={`/catalogo?tipo=${tipo.slug}`}
              title={collapsed ? tipo.nome : undefined}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 mx-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                tipoAtivo && !linhaParam
                  ? "text-steel"
                  : "text-ink-faint hover:text-ink-soft"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              {!collapsed && tipo.nome}
            </Link>
            {/* Linhas do tipo */}
            {!collapsed && linhasDoTipo.map((linha) => {
              const ativo = onCatalogRoot && tipoParam === tipo.slug && linhaParam === linha.id;
              return (
                <Link
                  key={linha.id}
                  href={`/catalogo?tipo=${tipo.slug}&linha=${linha.id}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 mx-2 rounded-lg pl-7 pr-3 py-2 text-sm transition-colors ${
                    ativo
                      ? "bg-steel/10 text-steel font-medium"
                      : "text-ink-soft hover:bg-canvas hover:text-ink"
                  }`}
                >
                  <span className="w-1 h-1 rounded-full shrink-0 bg-current opacity-40" />
                  {linha.nome}
                </Link>
              );
            })}
          </div>
        );
      })}

      {/* Tipos sem linhas (e Cores RAL) */}
      {(tiposSemLinhas.length > 0 || true) && (
        <>
          {tiposSemLinhas.map((tipo) => {
            const ativo = onCatalogRoot && tipoParam === tipo.slug;
            return (
              <Link
                key={tipo.slug}
                href={`/catalogo?tipo=${tipo.slug}`}
                title={collapsed ? tipo.nome : undefined}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 mx-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo ? "bg-steel/10 text-steel" : "text-ink-soft hover:bg-canvas hover:text-ink"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                {!collapsed && tipo.nome}
              </Link>
            );
          })}
          {/* Cores RAL */}
          <Link
            href="/catalogo?tipo=cores"
            title={collapsed ? "Cores RAL" : undefined}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 mx-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              onCatalogRoot && tipoParam === "cores" ? "bg-steel/10 text-steel" : "text-ink-soft hover:bg-canvas hover:text-ink"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            {!collapsed && "Cores RAL"}
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {/* FAB mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Menu do catálogo"
        className="fixed z-40 flex h-14 w-14 items-center justify-center rounded-full bg-steel text-white shadow-lg lg:hidden"
        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))", right: "calc(1.25rem + env(safe-area-inset-right))", boxShadow: "0 4px 20px rgba(15,76,129,0.4)" }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {/* Backdrop mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Drawer mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-2xl transition-transform duration-300 ease-out lg:hidden flex flex-col ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <Header onClose={() => setMobileOpen(false)} />
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          <NavContent />
        </nav>
        <div className="border-t border-line px-2 py-2">
          <NovaAbaInline />
        </div>
      </div>

      {/* Sidebar desktop */}
      <aside className={`hidden lg:flex flex-col shrink-0 border-r border-line bg-surface transition-all duration-200 overflow-hidden ${collapsed ? "w-16" : "w-60"}`}>
        <Header />
        <nav className="flex-1 overflow-y-auto py-2">
          <NavContent />
        </nav>
        <div className={`border-t border-line px-2 py-2 ${collapsed ? "flex justify-center" : ""}`}>
          <NovaAbaInline collapsed={collapsed} />
        </div>
      </aside>
    </>
  );
}

export function CatalogoSidebar({ tipos, linhas }: { tipos: Tipo[]; linhas: Linha[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <Suspense fallback={
      <aside className={`hidden lg:flex flex-col shrink-0 border-r border-line bg-surface ${collapsed ? "w-16" : "w-60"}`} />
    }>
      <SidebarInner
        tipos={tipos}
        linhas={linhas}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
    </Suspense>
  );
}
