"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importarPerfisXml, atualizarPesosXml } from "@/app/catalogo/actions";

type Item = { codigo: string; peso: number };

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

function parseXml(text: string): Item[] {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  return Array.from(doc.querySelectorAll("Perfil"))
    .map((n) => ({
      codigo: n.getAttribute("codigo")?.trim() ?? "",
      peso: parseFloat(n.getAttribute("peso_kg_m") ?? "0"),
    }))
    .filter((n) => n.codigo);
}

type Modo = "importar" | "pesos";

export function ImportarXml({ linhaId }: { linhaId: string }) {
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState<Modo>("importar");
  const [itens, setItens] = useState<Item[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setErro(null);
    setResultado(null);

    lerArquivoXml(file)
      .then((text) => {
        const parsed = parseXml(text);
        if (parsed.length === 0) { setErro("Nenhum <Perfil> encontrado no XML."); return; }
        setItens(parsed);
        setAberto(true);
      })
      .catch(() => setErro("Erro ao ler o arquivo XML."));
  }

  function handleConfirmar() {
    if (!itens?.length) return;
    startTransition(async () => {
      try {
        if (modo === "importar") {
          const res = await importarPerfisXml(linhaId, JSON.stringify(itens));
          const msg = res.importados > 0
            ? `${res.importados} perfil${res.importados !== 1 ? "is" : ""} importado${res.importados !== 1 ? "s" : ""}${res.duplicatas > 0 ? ` · ${res.duplicatas} ignorado${res.duplicatas !== 1 ? "s" : ""} (já existem)` : ""}.`
            : `Todos os ${res.duplicatas} perfis já existem no catálogo.`;
          setResultado(msg);
        } else {
          const res = await atualizarPesosXml(linhaId, JSON.stringify(itens));
          setResultado(`Peso atualizado em ${res.atualizados} perfil${res.atualizados !== 1 ? "is" : ""}.`);
        }
        setItens(null);
        setAberto(false);
        router.refresh();
      } catch (err: any) {
        setErro(`Erro: ${err.message}`);
      }
    });
  }

  function fechar() {
    setAberto(false);
    setItens(null);
    setErro(null);
  }

  return (
    <>
      {/* Botão trigger */}
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 rounded-lg border border-steel/40 bg-steel/5 px-3 py-2 text-sm font-medium text-steel hover:bg-steel/10 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
        </svg>
        Importar XML
      </button>
      <input ref={fileRef} type="file" accept=".xml,text/xml" className="hidden" onChange={handleFile} />

      {/* Feedback fora do modal */}
      {resultado && !aberto && (
        <span className="text-sm font-medium text-green-600">{resultado}</span>
      )}
      {erro && !aberto && (
        <span className="text-sm text-red-500">{erro}</span>
      )}

      {/* Modal de preview */}
      {aberto && itens && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={fechar} />

          {/* Painel */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-surface shadow-2xl flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="px-5 pt-4 pb-3 border-b border-line shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink">
                  {itens.length} perfil{itens.length !== 1 ? "is" : ""} no XML
                </p>
                <button onClick={fechar} className="text-ink-faint hover:text-ink transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              {/* Toggle de modo */}
              <div className="flex rounded-lg border border-line overflow-hidden text-sm">
                <button
                  onClick={() => setModo("importar")}
                  className={`flex-1 py-1.5 font-medium transition-colors ${modo === "importar" ? "bg-steel text-white" : "text-ink-soft hover:bg-canvas"}`}
                >
                  Importar novos
                </button>
                <button
                  onClick={() => setModo("pesos")}
                  className={`flex-1 py-1.5 font-medium transition-colors ${modo === "pesos" ? "bg-steel text-white" : "text-ink-soft hover:bg-canvas"}`}
                >
                  Atualizar pesos
                </button>
              </div>
              <p className="text-xs text-ink-faint">
                {modo === "importar"
                  ? "Cria perfis novos. Os que já existem são ignorados."
                  : "Sobrescreve apenas o peso (kg/m) dos perfis existentes pelo código."}
              </p>
            </div>

            {/* Lista */}
            <div className="overflow-y-auto flex-1 px-5 py-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-faint border-b border-line">
                    <th className="pb-2 font-medium">Código</th>
                    <th className="pb-2 font-medium text-right">Peso (kg/m)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {itens.map((item) => (
                    <tr key={item.codigo}>
                      <td className="py-1.5 font-mono text-xs text-ink">{item.codigo}</td>
                      <td className="py-1.5 text-right text-xs text-ink-soft">{item.peso.toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-line shrink-0">
              {erro && <p className="text-xs text-red-500 flex-1">{erro}</p>}
              {!erro && <p className="text-xs text-ink-faint flex-1">Os já existentes serão ignorados automaticamente.</p>}
              <div className="flex gap-2">
                <button onClick={fechar} disabled={pending} className="btn-ghost text-sm py-1.5 px-4">Cancelar</button>
                <button onClick={handleConfirmar} disabled={pending} className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50">
                  {pending
                    ? (modo === "pesos" ? "Atualizando…" : "Importando…")
                    : (modo === "pesos" ? `Atualizar ${itens.length} pesos` : `Importar ${itens.length}`)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
