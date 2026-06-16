"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarCorRal, deletarCor } from "@/app/catalogo/actions";

type CorRal = {
  id: string;
  codigo_ral: string;
  nome: string | null;
  hex: string | null;
  acabamento_id: string | null;
};
type Acabamento = { id: string; nome: string };

export function AbaCoresCatalogo({
  cores,
  acabamentos,
}: {
  cores: CorRal[];
  acabamentos: Acabamento[];
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const acabamentoMap = new Map(acabamentos.map((a) => [a.id, a.nome]));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErro(null);
    startTransition(async () => {
      try {
        await criarCorRal(fd);
        setMostrarForm(false);
        router.refresh();
      } catch (err: any) {
        setErro(err.message);
      }
    });
  }

  function handleDeletar(corId: string, nome: string) {
    if (!confirm(`Excluir a cor ${nome}? Ela será removida de todos os produtos.`)) return;
    startTransition(async () => {
      try {
        await deletarCor(corId);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Tabela de cores */}
      {cores.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3 font-medium">Código RAL</th>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Hex</th>
                <th className="px-4 py-3 font-medium">Acabamento</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {cores.map((cor) => (
                <tr
                  key={cor.id}
                  className="border-b border-line last:border-0 hover:bg-canvas"
                >
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block h-5 w-5 rounded border border-line"
                      style={{ backgroundColor: cor.hex ?? "#e5e7eb" }}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs font-medium">
                    {cor.codigo_ral}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">{cor.nome ?? "—"}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-ink-faint">
                    {cor.hex ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {cor.acabamento_id
                      ? (acabamentoMap.get(cor.acabamento_id) ?? "—")
                      : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => handleDeletar(cor.id, cor.codigo_ral)}
                      disabled={pending}
                      className="text-ink-faint hover:text-red-500 disabled:opacity-40"
                      title="Excluir cor"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cores.length === 0 && !mostrarForm && (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-faint">Nenhuma cor RAL cadastrada.</p>
        </div>
      )}

      {/* Formulário inline */}
      {mostrarForm ? (
        <form onSubmit={handleSubmit} className="card max-w-sm space-y-4 p-5">
          <p className="font-display text-sm font-semibold text-ink">Nova cor RAL</p>

          <div>
            <label className="label">Código RAL</label>
            <input name="codigo_ral" required className="field font-mono" placeholder="Ex: RAL9010" />
          </div>
          <div>
            <label className="label">
              Nome <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <input name="nome" className="field" placeholder="Ex: Branco puro" />
          </div>
          <div>
            <label className="label">
              Hex <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <div className="flex items-center gap-2">
              <input name="hex" className="field font-mono" placeholder="#F4F4F4" maxLength={7} />
              <input
                type="color"
                className="h-9 w-10 cursor-pointer rounded border border-line bg-surface p-1"
                onChange={(e) => {
                  const hex = e.currentTarget
                    .closest("div")
                    ?.querySelector<HTMLInputElement>("input[name=hex]");
                  if (hex) hex.value = e.currentTarget.value;
                }}
              />
            </div>
          </div>

          {acabamentos.length > 0 && (
            <div>
              <label className="label">
                Acabamento <span className="font-normal text-ink-soft">(opcional)</span>
              </label>
              <select name="acabamento_id" className="field">
                <option value="">Sem acabamento</option>
                {acabamentos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          {erro && <p className="text-xs text-red-500">{erro}</p>}

          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="btn-primary">
              {pending ? "Salvando…" : "Cadastrar"}
            </button>
            <button
              type="button"
              onClick={() => { setMostrarForm(false); setErro(null); }}
              disabled={pending}
              className="btn-ghost"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-2 rounded-md border border-dashed border-line px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-steel hover:text-steel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova cor RAL
        </button>
      )}
    </div>
  );
}
