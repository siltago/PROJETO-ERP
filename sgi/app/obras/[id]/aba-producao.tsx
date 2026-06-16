"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adicionarTipologia } from "@/app/obras/actions";

type Tipologia = {
  id: string;
  nome: string;
  quantidade: number;
};

export function AbaProducao({
  obraId,
  tipologias,
}: {
  obraId: string;
  tipologias: Tipologia[];
}) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await adicionarTipologia(obraId, fd);
      setMostrarForm(false);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {tipologias.length === 0 && !mostrarForm && (
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-faint">
            Nenhuma tipologia cadastrada. Clique em "Adicionar tipologia" para começar.
          </p>
        </div>
      )}

      {tipologias.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tipologias.map((t) => (
            <div key={t.id} className="card p-4">
              <p className="font-medium text-ink">{t.nome}</p>
              <p className="mt-1 text-sm text-ink-soft">
                {t.quantidade} {t.quantidade === 1 ? "peça" : "peças"}
              </p>
            </div>
          ))}
        </div>
      )}

      {mostrarForm ? (
        <form onSubmit={handleSubmit} className="card divide-y divide-line">
          <div className="px-6 py-4">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Nova tipologia
            </p>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="nome"
                className="block text-xs uppercase tracking-wide text-ink-faint"
              >
                Nome da tipologia
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                placeholder="Ex: Porta WC"
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel"
              />
            </div>
            <div>
              <label
                htmlFor="quantidade"
                className="block text-xs uppercase tracking-wide text-ink-faint"
              >
                Quantidade de peças
              </label>
              <input
                id="quantidade"
                name="quantidade"
                type="number"
                min="1"
                defaultValue={1}
                required
                className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-steel focus:outline-none focus:ring-1 focus:ring-steel"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 px-6 py-4">
            <button
              type="button"
              onClick={() => setMostrarForm(false)}
              disabled={pending}
              className="rounded-md px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-steel px-4 py-2 text-sm font-medium text-white hover:bg-[#0C3E6B] disabled:opacity-60"
            >
              {pending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-2 rounded-md border border-dashed border-line px-4 py-3 text-sm font-medium text-ink-soft hover:border-steel hover:text-steel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar tipologia
        </button>
      )}
    </div>
  );
}
