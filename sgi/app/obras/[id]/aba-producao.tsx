"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adicionarTipologia, importarTipologias, excluirLote, editarTipologia } from "@/app/obras/actions";

// ── Tipos ─────────────────────────────────────────────────────────

const STATUS_TIP = {
  pendente:    { label: "Pendente",    cor: "#94a3b8" },
  em_producao: { label: "Em produção", cor: "#3b82f6" },
  pronto:      { label: "Pronto",      cor: "#22c55e" },
  entregue:    { label: "Entregue",    cor: "#a855f7" },
  cancelado:   { label: "Cancelado",   cor: "#ef4444" },
} as const;
type StatusKey = keyof typeof STATUS_TIP;

type Tipologia = {
  id: string;
  nome: string;
  quantidade: number;
  status?: string | null;
  codigo_esquadria?: string | null;
  tipo?: string | null;
  largura_mm?: number | null;
  altura_mm?: number | null;
  tratamento?: string | null;
  descricao?: string | null;
  peso_unit?: number | null;
  preco_unit?: number | null;
};

type Lote = {
  id: string;
  nome: string;
  criado_em: string;
  tipologias: Tipologia[];
};

type Rascunho = Omit<Tipologia, "id"> & { _key: number };

// ── Helpers ───────────────────────────────────────────────────────

function lerArquivoXml(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.onload = (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const head = new TextDecoder("iso-8859-1").decode(buffer.slice(0, 200));
      const match = head.match(/encoding=["']([^"']+)["']/i);
      const enc = match?.[1] ?? "utf-8";
      try {
        resolve(new TextDecoder(enc, { fatal: true }).decode(buffer));
      } catch {
        resolve(new TextDecoder("windows-1252").decode(buffer));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function parseXml(text: string): Rascunho[] {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const nodes = Array.from(doc.querySelectorAll("TIPOLOGIA"));
  const t = (node: Element, tag: string) =>
    node.querySelector(tag)?.textContent?.trim() ?? "";

  return nodes.map((node, idx) => {
    const tipo = t(node, "TIPO");
    return {
      _key: idx,
      nome: tipo || "Sem tipo",
      quantidade: parseInt(t(node, "QTDE")) || 1,
      codigo_esquadria: t(node, "CODESQD") || null,
      tipo: tipo || null,
      largura_mm: parseInt(t(node, "LARGURA")) || null,
      altura_mm: parseInt(t(node, "ALTURA")) || null,
      tratamento: t(node, "TRAT_PERF") || null,
      descricao: t(node, "DESCR") || null,
      peso_unit: parseFloat(t(node, "PESO_UNIT").replace(",", ".")) || null,
      preco_unit: parseFloat(t(node, "PRECO_UNIT").replace(",", ".")) || null,
    };
  });
}

// ── Sub-componentes ───────────────────────────────────────────────

function TratamentoBadge({ texto }: { texto: string }) {
  const lower = texto.toLowerCase();
  let cls = "bg-canvas text-ink-soft";
  if (lower.includes("incolor"))                              cls = "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400";
  else if (lower.includes("fume") || lower.includes("fumê")) cls = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  else if (lower.includes("preto"))                          cls = "bg-zinc-800 text-zinc-100";
  else if (lower.includes("pintura"))                        cls = "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
  return <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>{texto}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_TIP[status as StatusKey] ?? { label: status, cor: "#94a3b8" };
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ backgroundColor: s.cor + "22", color: s.cor }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.cor }} />
      {s.label}
    </span>
  );
}

function TipologiaCard({ t, obraId }: { t: Tipologia; obraId: string }) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState(t);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function f(field: keyof Tipologia, value: any) {
    setDraft((p) => ({ ...p, [field]: value === "" ? null : value }));
  }

  function salvar() {
    startTransition(async () => {
      await editarTipologia(t.id, obraId, {
        nome:             draft.tipo || draft.nome,
        quantidade:       draft.quantidade,
        status:           draft.status || "pendente",
        codigo_esquadria: draft.codigo_esquadria ?? null,
        tipo:             draft.tipo ?? null,
        largura_mm:       draft.largura_mm ?? null,
        altura_mm:        draft.altura_mm ?? null,
        tratamento:       draft.tratamento ?? null,
        descricao:        draft.descricao ?? null,
        peso_unit:        draft.peso_unit ?? null,
        preco_unit:       draft.preco_unit ?? null,
      });
      setEditando(false);
      router.refresh();
    });
  }

  if (editando) {
    return (
      <div className="rounded-xl border-2 border-steel/40 bg-surface p-4 space-y-3">
        {/* Status — destaque no topo */}
        <div>
          <label className="label">Status</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {(Object.entries(STATUS_TIP) as [StatusKey, { label: string; cor: string }][]).map(([key, s]) => (
              <button
                key={key}
                type="button"
                onClick={() => f("status", key)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border-2 transition-all"
                style={
                  (draft.status || "pendente") === key
                    ? { backgroundColor: s.cor + "22", borderColor: s.cor, color: s.cor }
                    : { backgroundColor: "transparent", borderColor: "#e2e8f0", color: "#94a3b8" }
                }
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.cor }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Tipo / Nome *</label>
            <input autoFocus value={draft.tipo ?? ""} onChange={(e) => f("tipo", e.target.value)} className="field text-sm" />
          </div>
          <div>
            <label className="label">Código (CODESQD)</label>
            <input value={draft.codigo_esquadria ?? ""} onChange={(e) => f("codigo_esquadria", e.target.value)} className="field text-sm font-mono" />
          </div>
          <div>
            <label className="label">Qtde</label>
            <input type="number" min="1" value={draft.quantidade} onChange={(e) => f("quantidade", parseInt(e.target.value) || 1)} className="field text-sm" />
          </div>
          <div>
            <label className="label">Largura (mm)</label>
            <input type="number" value={draft.largura_mm ?? ""} onChange={(e) => f("largura_mm", parseInt(e.target.value))} className="field text-sm" />
          </div>
          <div>
            <label className="label">Altura (mm)</label>
            <input type="number" value={draft.altura_mm ?? ""} onChange={(e) => f("altura_mm", parseInt(e.target.value))} className="field text-sm" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Tratamento</label>
            <input value={draft.tratamento ?? ""} onChange={(e) => f("tratamento", e.target.value)} className="field text-sm" />
          </div>
          <div className="col-span-2">
            <label className="label">Descrição</label>
            <input value={draft.descricao ?? ""} onChange={(e) => f("descricao", e.target.value)} className="field text-sm" />
          </div>
          <div>
            <label className="label">Peso unit (kg)</label>
            <input type="number" step="0.01" value={draft.peso_unit ?? ""} onChange={(e) => f("peso_unit", parseFloat(e.target.value))} className="field text-sm" />
          </div>
          <div>
            <label className="label">Preço unit (R$)</label>
            <input type="number" step="0.01" value={draft.preco_unit ?? ""} onChange={(e) => f("preco_unit", parseFloat(e.target.value))} className="field text-sm" />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={salvar} disabled={pending} className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50">
            {pending ? "Salvando…" : "Salvar"}
          </button>
          <button onClick={() => { setDraft(t); setEditando(false); }} disabled={pending} className="btn-ghost text-sm py-1.5 px-4">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex gap-3 p-3 group cursor-pointer hover:border-steel/30 transition-colors" onClick={() => setEditando(true)}>
      {/* Dimensões */}
      <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-canvas px-2.5 py-2 text-center min-w-[60px]">
        {t.largura_mm && t.altura_mm ? (
          <>
            <span className="font-mono text-xs font-bold text-ink">{t.largura_mm}</span>
            <span className="font-mono text-[9px] text-ink-faint leading-none">×</span>
            <span className="font-mono text-xs font-bold text-ink">{t.altura_mm}</span>
            <span className="mt-0.5 text-[9px] text-ink-faint">mm</span>
          </>
        ) : (
          <span className="text-xs text-ink-faint">—</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-ink">{t.tipo || t.nome}</span>
          {t.codigo_esquadria && <span className="font-mono text-[11px] text-ink-faint">{t.codigo_esquadria}</span>}
          <StatusBadge status={t.status || "pendente"} />
        </div>
        {t.descricao && <p className="mt-0.5 text-xs text-ink-soft leading-snug line-clamp-1">{t.descricao}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ink-soft"><span className="font-semibold text-ink">{t.quantidade}</span> {t.quantidade === 1 ? "peça" : "peças"}</span>
          {t.tratamento && <TratamentoBadge texto={t.tratamento} />}
          {t.peso_unit != null && t.peso_unit > 0 && <span className="text-ink-faint">{t.peso_unit} kg/un</span>}
          {t.preco_unit != null && t.preco_unit > 0 && <span className="font-medium text-ink">{t.preco_unit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/un</span>}
        </div>
      </div>

      {/* Ícone de edição */}
      <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-faint">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </div>
    </div>
  );
}

function LoteCard({ lote, obraId, defaultOpen }: { lote: Lote; obraId: string; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const total = lote.tipologias.length;
  const totalPeso = lote.tipologias.reduce((s, t) => s + (t.peso_unit ?? 0) * t.quantidade, 0);
  const totalPreco = lote.tipologias.reduce((s, t) => s + (t.preco_unit ?? 0) * t.quantidade, 0);
  const data = new Date(lote.criado_em).toLocaleDateString("pt-BR");

  function handleExcluir() {
    startTransition(async () => {
      await excluirLote(lote.id, obraId);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface overflow-hidden">
      {/* Header da pasta */}
      <div className="flex items-center gap-2 px-4 py-3 bg-canvas/60">
        <button
          onClick={() => setOpen((p) => !p)}
          className="flex flex-1 items-center gap-2 text-left min-w-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="shrink-0 text-ink-faint"
          >
            <path d="M20 6H12l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
          </svg>
          <span className="font-medium text-sm text-ink truncate">{lote.nome}</span>
          <span className="shrink-0 rounded-full bg-line px-2 py-0.5 text-[10px] font-semibold text-ink-faint">
            {total}
          </span>
          {totalPeso > 0 && (
            <span className="hidden sm:inline shrink-0 text-xs text-ink-faint">{totalPeso.toFixed(1)} kg</span>
          )}
          {totalPreco > 0 && (
            <span className="hidden sm:inline shrink-0 text-xs font-medium text-ink">
              {totalPreco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          )}
          <span className="shrink-0 text-xs text-ink-faint ml-auto">{data}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Botão excluir lote */}
        {confirmarExcluir ? (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={handleExcluir}
              disabled={pending}
              className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              {pending ? "…" : "Excluir tudo"}
            </button>
            <button
              onClick={() => setConfirmarExcluir(false)}
              className="rounded-md px-2 py-1 text-xs text-ink-faint hover:bg-canvas"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmarExcluir(true); }}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-red-50 hover:text-red-400 transition-colors"
            title="Excluir lote"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        )}
      </div>

      {/* Tipologias */}
      {open && (
        <div className="p-3 space-y-2">
          {lote.tipologias.map((t) => (
            <TipologiaCard key={t.id} t={t} obraId={obraId} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Card de revisão (edição inline) ──────────────────────────────

function RascunhoCard({
  item,
  onUpdate,
  onRemove,
}: {
  item: Rascunho;
  onUpdate: (u: Rascunho) => void;
  onRemove: () => void;
}) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft] = useState<Rascunho>(item);

  function f(field: keyof Rascunho, value: any) {
    setDraft((p) => ({ ...p, [field]: value === "" ? null : value }));
  }

  function salvar() {
    onUpdate({ ...draft, nome: draft.tipo || draft.nome || "Sem tipo" });
    setEditando(false);
  }

  if (editando) {
    return (
      <div className="rounded-xl border-2 border-steel bg-surface p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Tipo / Nome *</label>
            <input autoFocus value={draft.tipo ?? ""} onChange={(e) => f("tipo", e.target.value)} className="field text-sm" />
          </div>
          <div>
            <label className="label">Código (CODESQD)</label>
            <input value={draft.codigo_esquadria ?? ""} onChange={(e) => f("codigo_esquadria", e.target.value)} className="field text-sm font-mono" />
          </div>
          <div>
            <label className="label">Qtde</label>
            <input type="number" min="1" value={draft.quantidade} onChange={(e) => f("quantidade", parseInt(e.target.value) || 1)} className="field text-sm" />
          </div>
          <div>
            <label className="label">Largura (mm)</label>
            <input type="number" value={draft.largura_mm ?? ""} onChange={(e) => f("largura_mm", parseInt(e.target.value))} className="field text-sm" />
          </div>
          <div>
            <label className="label">Altura (mm)</label>
            <input type="number" value={draft.altura_mm ?? ""} onChange={(e) => f("altura_mm", parseInt(e.target.value))} className="field text-sm" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="label">Tratamento</label>
            <input value={draft.tratamento ?? ""} onChange={(e) => f("tratamento", e.target.value)} className="field text-sm" />
          </div>
          <div className="col-span-2">
            <label className="label">Descrição</label>
            <input value={draft.descricao ?? ""} onChange={(e) => f("descricao", e.target.value)} className="field text-sm" />
          </div>
          <div>
            <label className="label">Peso unit (kg)</label>
            <input type="number" step="0.01" value={draft.peso_unit ?? ""} onChange={(e) => f("peso_unit", parseFloat(e.target.value))} className="field text-sm" />
          </div>
          <div>
            <label className="label">Preço unit (R$)</label>
            <input type="number" step="0.01" value={draft.preco_unit ?? ""} onChange={(e) => f("preco_unit", parseFloat(e.target.value))} className="field text-sm" />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={salvar} className="btn-primary text-sm py-1.5 px-4">Salvar</button>
          <button onClick={() => { setDraft(item); setEditando(false); }} className="btn-ghost text-sm py-1.5 px-4">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card flex gap-3 p-3 group">
      <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-canvas px-2.5 py-2 text-center min-w-[60px]">
        {item.largura_mm && item.altura_mm ? (
          <>
            <span className="font-mono text-xs font-bold text-ink">{item.largura_mm}</span>
            <span className="font-mono text-[9px] text-ink-faint leading-none">×</span>
            <span className="font-mono text-xs font-bold text-ink">{item.altura_mm}</span>
            <span className="mt-0.5 text-[9px] text-ink-faint">mm</span>
          </>
        ) : (
          <span className="text-xs text-ink-faint">—</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-ink">{item.tipo || item.nome}</span>
          {item.codigo_esquadria && <span className="font-mono text-[11px] text-ink-faint">{item.codigo_esquadria}</span>}
        </div>
        {item.descricao && <p className="mt-0.5 text-xs text-ink-soft leading-snug">{item.descricao}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-ink-soft"><span className="font-semibold text-ink">{item.quantidade}</span> {item.quantidade === 1 ? "peça" : "peças"}</span>
          {item.tratamento && <TratamentoBadge texto={item.tratamento} />}
          {item.peso_unit != null && item.peso_unit > 0 && <span className="text-ink-faint">{item.peso_unit} kg/un</span>}
          {item.preco_unit != null && item.preco_unit > 0 && <span className="font-medium text-ink">{item.preco_unit.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/un</span>}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditando(true)} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-canvas hover:text-steel transition-colors" title="Editar">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button onClick={onRemove} className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-faint hover:bg-red-50 hover:text-red-500 transition-colors" title="Excluir">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────

export function AbaProducao({
  obraId,
  lotes,
  semLote,
  migracaoPendente,
}: {
  obraId: string;
  lotes: Lote[];
  semLote: Array<{ id: string; nome: string; quantidade: number }>;
  migracaoPendente?: boolean;
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [rascunhos, setRascunhos] = useState<Rascunho[] | null>(null);
  const [loteNome, setLoteNome] = useState("");
  // Lote recém-importado (mostrado imediatamente, antes do server refresh)
  const [localLote, setLocalLote] = useState<Lote | null>(null);
  const [erroXml, setErroXml] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const prevLotesLen = useRef(lotes.length);

  // Quando o servidor retornar os novos lotes, descarta estado local
  useEffect(() => {
    if (localLote && lotes.length !== prevLotesLen.current) {
      setLocalLote(null);
    }
    prevLotesLen.current = lotes.length;
  }, [lotes, localLote]);

  function handleXmlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const nome = file.name.replace(/\.[^.]+$/, ""); // remove extensão
    e.target.value = "";
    setErroXml(null);
    setLoteNome(nome);

    lerArquivoXml(file)
      .then((text) => {
        const parsed = parseXml(text);
        if (parsed.length === 0) { setErroXml("Nenhuma tipologia encontrada no XML."); return; }
        setRascunhos(parsed);
      })
      .catch(() => setErroXml("Erro ao ler o arquivo XML."));
  }

  function handleUpdate(key: number, updated: Rascunho) {
    setRascunhos((prev) => prev?.map((r) => r._key === key ? updated : r) ?? null);
  }

  function handleRemove(key: number) {
    setRascunhos((prev) => {
      const next = prev?.filter((r) => r._key !== key) ?? null;
      return next?.length === 0 ? null : next;
    });
  }

  function handleConfirmar() {
    if (!rascunhos?.length) return;
    const snapshot = rascunhos;
    const nome = loteNome || `Importação ${new Date().toLocaleDateString("pt-BR")}`;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = snapshot.map(({ _key, nome: _n, ...rest }) => ({
      nome: rest.tipo || _n,
      ...rest,
    }));
    startTransition(async () => {
      try {
        const res = await importarTipologias(obraId, nome, JSON.stringify(payload));
        // Mostra o lote imediatamente sem esperar o servidor
        setLocalLote({
          id: res.loteId,
          nome,
          criado_em: new Date().toISOString(),
          tipologias: payload.map((t, i) => ({ ...t, id: `local-${i}` })),
        });
        setRascunhos(null);
        setResultado(`${res.importadas} tipologia${res.importadas !== 1 ? "s" : ""} importada${res.importadas !== 1 ? "s" : ""}.`);
        setTimeout(() => setResultado(null), 5000);
        router.refresh();
      } catch (err: any) {
        setErroXml(`Erro ao salvar: ${err.message}`);
      }
    });
  }

  function handleSubmitManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await adicionarTipologia(obraId, fd);
      setMostrarForm(false);
      router.refresh();
    });
  }

  // Todos os lotes a exibir (server + local recém-importado)
  const todosLotes = localLote
    ? [...lotes, localLote]
    : lotes;

  // ── Painel de revisão do XML ──────────────────────────────────
  if (rascunhos !== null) {
    return (
      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-steel/30 bg-steel/5 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink">
              Revisão do XML — {rascunhos.length} tipologia{rascunhos.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <label className="shrink-0 text-xs text-ink-faint">Nome da pasta:</label>
              <input
                value={loteNome}
                onChange={(e) => setLoteNome(e.target.value)}
                placeholder="Ex: Lote 01 – Janelas"
                className="field text-sm flex-1"
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleConfirmar} disabled={pending || rascunhos.length === 0} className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50">
              {pending ? "Salvando…" : "Confirmar importação"}
            </button>
            <button onClick={() => { setRascunhos(null); setErroXml(null); }} disabled={pending} className="btn-ghost text-sm py-1.5 px-4">
              Cancelar
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {rascunhos.map((r) => (
            <RascunhoCard
              key={r._key}
              item={r}
              onUpdate={(updated) => handleUpdate(r._key, updated)}
              onRemove={() => handleRemove(r._key)}
            />
          ))}
        </div>
        {erroXml && <p className="text-sm text-red-500">{erroXml}</p>}
      </div>
    );
  }

  // ── Vista normal ─────────────────────────────────────────────
  return (
    <div className="mt-6 space-y-4">
      {/* Aviso de migração pendente */}
      {migracaoPendente && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-amber-500">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Migração SQL necessária</p>
            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
              Rode o arquivo <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">supabase/lotes-producao.sql</code> no Supabase SQL Editor para ativar esta aba.
            </p>
          </div>
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-sm font-medium text-ink-soft hover:border-steel hover:text-steel transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar tipologia
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-steel/40 bg-steel/5 px-3 py-2 text-sm font-medium text-steel hover:bg-steel/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          Importar XML
        </button>
        <input ref={fileRef} type="file" accept=".xml,text/xml" className="hidden" onChange={handleXmlChange} />

        {erroXml && <span className="text-sm text-red-500">{erroXml}</span>}
        {resultado && <span className="text-sm font-medium text-green-600">{resultado}</span>}
      </div>

      {/* Estado vazio */}
      {todosLotes.length === 0 && semLote.length === 0 && !mostrarForm && (
        <div className="card p-10 text-center text-sm text-ink-faint">
          Nenhuma tipologia cadastrada. Importe um XML ou adicione manualmente.
        </div>
      )}

      {/* Lotes (pastas) */}
      {todosLotes.length > 0 && (
        <div className="space-y-2">
          {todosLotes.map((lote, i) => (
            <LoteCard
              key={lote.id}
              lote={lote}
              obraId={obraId}
              defaultOpen={i === todosLotes.length - 1}
            />
          ))}
        </div>
      )}

      {/* Tipologias sem lote (adicionadas manualmente) */}
      {semLote.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint px-1">Adicionadas manualmente</p>
          {semLote.map((t) => (
            <div key={t.id} className="card p-3">
              <p className="font-medium text-sm text-ink">{t.nome}</p>
              <p className="mt-0.5 text-xs text-ink-soft">{t.quantidade} {t.quantidade === 1 ? "peça" : "peças"}</p>
            </div>
          ))}
        </div>
      )}

      {/* Formulário manual */}
      {mostrarForm && (
        <form onSubmit={handleSubmitManual} className="card divide-y divide-line">
          <div className="px-6 py-4">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">Nova tipologia</p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nome" className="label">Nome da tipologia</label>
              <input id="nome" name="nome" type="text" required placeholder="Ex: Porta WC" className="field" />
            </div>
            <div>
              <label htmlFor="quantidade" className="label">Quantidade de peças</label>
              <input id="quantidade" name="quantidade" type="number" min="1" defaultValue={1} required className="field" />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-4">
            <button type="button" onClick={() => setMostrarForm(false)} disabled={pending} className="btn-ghost text-sm">Cancelar</button>
            <button type="submit" disabled={pending} className="btn-primary text-sm">{pending ? "Salvando…" : "Salvar"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
