"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { criarAba } from "@/app/catalogo/actions";

export function NovaAbaInline() {
  const [aberta, setAberta] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setErro(null);
    startTransition(async () => {
      try {
        await criarAba(fd);
        setAberta(false);
        router.refresh();
      } catch (err: any) {
        setErro(err.message);
      }
    });
  }

  if (!aberta) {
    return (
      <button
        onClick={() => setAberta(true)}
        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-ink-faint transition-colors hover:bg-canvas hover:text-ink-soft"
        title="Nova aba"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nova aba
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <input
        name="nome"
        autoFocus
        required
        placeholder="Nome da aba…"
        disabled={pending}
        className="h-8 rounded border border-steel px-2.5 text-sm outline-none focus:ring-1 focus:ring-steel"
      />
      <button
        type="submit"
        disabled={pending}
        className="h-8 rounded bg-steel px-3 text-xs font-medium text-white hover:bg-steel/90 disabled:opacity-50"
      >
        {pending ? "…" : "Criar"}
      </button>
      <button
        type="button"
        onClick={() => { setAberta(false); setErro(null); }}
        disabled={pending}
        className="h-8 rounded px-2 text-xs text-ink-faint hover:text-ink"
      >
        Cancelar
      </button>
      {erro && <span className="text-xs text-red-500">{erro}</span>}
    </form>
  );
}
