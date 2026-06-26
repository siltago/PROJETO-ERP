"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";

export type Filters = {
  tipo: string;
  q: string;
  fornecedor: string;
  linha: string;
  categoria: string;
  status: string;
  ordem: string;
};

type Props = {
  fornecedores: string[];
  linhas: { id: string; nome: string }[];
  categorias: string[];
  current: Filters;
};

export function FilterBar({ fornecedores, linhas, categorias, current }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  const buildUrl = (overrides: Partial<Record<keyof Filters, string | null>>) => {
    const next: Record<string, string> = {};
    const base: Filters = { ...current };

    // Apply overrides
    for (const [k, v] of Object.entries(overrides)) {
      (base as any)[k] = v ?? "";
    }

    if (base.tipo) next.tipo = base.tipo;
    if (base.q) next.q = base.q;
    if (base.fornecedor) next.fornecedor = base.fornecedor;
    if (base.linha) next.linha = base.linha;
    if (base.categoria) next.categoria = base.categoria;
    if (base.status) next.status = base.status;
    if (base.ordem) next.ordem = base.ordem;

    const params = new URLSearchParams(next);
    return `/catalogo?${params.toString()}`;
  };

  const go = (overrides: Partial<Record<keyof Filters, string | null>>) => {
    startTransition(() => router.push(buildUrl(overrides)));
  };

  const handleFornecedor = (v: string) =>
    go({ fornecedor: v || null, linha: null, categoria: null, q: null });

  const handleLinha = (v: string) =>
    go({ linha: v || null, categoria: null, q: null });

  const handleCategoria = (v: string) => go({ categoria: v || null, q: null });

  const handleStatus = (v: string) => go({ status: v || null });

  const handleOrdem = (v: string) => go({ ordem: v || null });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = searchRef.current?.value.trim() || null;
    go({ q });
  };

  const clearAll = () =>
    go({ q: null, fornecedor: null, linha: null, categoria: null, status: null });

  const hasFilters =
    current.q || current.fornecedor || current.linha || current.categoria || current.status;

  return (
    <div
      className={`rounded-xl border border-line bg-surface p-4 transition-opacity ${
        isPending ? "pointer-events-none opacity-60" : ""
      }`}
    >
      {/* Busca */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            defaultValue={current.q}
            placeholder="Buscar por código, nome ou alias…"
            className="h-10 w-full rounded-lg border border-line bg-canvas pl-9 pr-4 text-sm placeholder:text-ink-faint focus:border-steel focus:outline-none focus:ring-2 focus:ring-steel/10"
          />
        </div>
        <button type="submit" className="btn-primary h-10 px-4 text-sm shrink-0">
          Buscar
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="h-10 rounded-lg border border-line px-3 text-xs text-ink-soft hover:bg-canvas shrink-0"
          >
            Limpar
          </button>
        )}
      </form>

      {/* Filtros dependentes */}
      <div className="mt-3 flex flex-wrap gap-2">
        {fornecedores.length > 0 && (
          <select
            value={current.fornecedor}
            onChange={(e) => handleFornecedor(e.target.value)}
            className="h-9 rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:border-steel focus:outline-none"
          >
            <option value="">Todos os fornecedores</option>
            {fornecedores.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}

        {linhas.length > 0 && (
          <select
            value={current.linha}
            onChange={(e) => handleLinha(e.target.value)}
            className="h-9 rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:border-steel focus:outline-none"
          >
            <option value="">Todas as linhas</option>
            {linhas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </select>
        )}

        {categorias.length > 0 && (
          <select
            value={current.categoria}
            onChange={(e) => handleCategoria(e.target.value)}
            className="h-9 rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:border-steel focus:outline-none"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <select
          value={current.status}
          onChange={(e) => handleStatus(e.target.value)}
          className="h-9 rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:border-steel focus:outline-none"
        >
          <option value="">Somente ativos</option>
          <option value="todos">Todos</option>
          <option value="inativo">Somente inativos</option>
        </select>

        <select
          value={current.ordem}
          onChange={(e) => handleOrdem(e.target.value)}
          className="h-9 rounded-lg border border-line bg-canvas px-3 text-sm text-ink focus:border-steel focus:outline-none"
        >
          <option value="">Ordenar por nome</option>
          <option value="codigo">Ordenar por código</option>
          <option value="categoria">Ordenar por categoria</option>
        </select>
      </div>

      {/* Chips de filtros ativos */}
      {hasFilters && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {current.q && (
            <Chip label={`"${current.q}"`} onRemove={() => go({ q: null })} />
          )}
          {current.fornecedor && (
            <Chip
              label={current.fornecedor}
              onRemove={() => go({ fornecedor: null, linha: null, categoria: null })}
            />
          )}
          {current.linha && (
            <Chip
              label={linhas.find((l) => l.id === current.linha)?.nome ?? current.linha}
              onRemove={() => go({ linha: null, categoria: null })}
            />
          )}
          {current.categoria && (
            <Chip label={current.categoria} onRemove={() => go({ categoria: null })} />
          )}
          {current.status === "inativo" && (
            <Chip label="Somente inativos" onRemove={() => go({ status: null })} />
          )}
          {current.status === "todos" && (
            <Chip label="Incluindo inativos" onRemove={() => go({ status: null })} />
          )}
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-steel/10 px-2.5 py-0.5 text-xs font-medium text-steel">
      {label}
      <button
        onClick={onRemove}
        className="flex h-3.5 w-3.5 items-center justify-center rounded-full hover:bg-steel/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="9"
          height="9"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}
