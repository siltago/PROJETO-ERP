import Link from "next/link";

interface Props {
  paginaAtual: number;
  total: number;
  porPagina: number;
  buildUrl: (pagina: number) => string;
}

export function Paginacao({ paginaAtual, total, porPagina, buildUrl }: Props) {
  const totalPaginas = Math.ceil(total / porPagina);
  if (totalPaginas <= 1) return null;

  const inicio = (paginaAtual - 1) * porPagina + 1;
  const fim = Math.min(paginaAtual * porPagina, total);

  const paginas: (number | "...")[] = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaAtual - 1 && i <= paginaAtual + 1)) {
      paginas.push(i);
    } else if (paginas[paginas.length - 1] !== "...") {
      paginas.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between border-t border-border px-5 py-3 text-sm">
      <span className="text-text-3 text-xs">
        {inicio}–{fim} de {total}
      </span>
      <div className="flex items-center gap-1">
        <PagLink href={buildUrl(paginaAtual - 1)} disabled={paginaAtual <= 1} label="‹" />
        {paginas.map((p, i) =>
          p === "..." ? (
            <span key={`e${i}`} className="px-2 text-text-3">…</span>
          ) : (
            <PagLink key={p} href={buildUrl(p as number)} active={p === paginaAtual} label={String(p)} />
          ),
        )}
        <PagLink href={buildUrl(paginaAtual + 1)} disabled={paginaAtual >= totalPaginas} label="›" />
      </div>
    </div>
  );
}

function PagLink({ href, label, active, disabled }: { href: string; label: string; active?: boolean; disabled?: boolean }) {
  if (disabled) {
    return <span className="flex h-9 w-9 items-center justify-center rounded text-xs text-text-3/40">{label}</span>;
  }
  return (
    <Link
      href={href}
      className={`flex h-9 w-9 items-center justify-center rounded text-xs font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-text-2 hover:bg-bg"
      }`}
    >
      {label}
    </Link>
  );
}
