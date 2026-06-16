"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adicionarAlias } from "@/app/catalogo/actions";

type Alias = { id: string; alias: string };

export function AbaAliases({
  produtoId,
  linhaId,
  aliases,
}: {
  produtoId: string;
  linhaId: string;
  aliases: Alias[];
}) {
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valor.trim()) return;
    setErro(null);
    startTransition(async () => {
      try {
        await adicionarAlias(produtoId, linhaId, valor.trim());
        setValor("");
        router.refresh();
      } catch (err: any) {
        setErro(err.message);
      }
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Lista de aliases */}
      {aliases.length > 0 ? (
        <div className="card overflow-hidden">
          <ul>
            {aliases.map((a, i) => (
              <li
                key={a.id}
                className={`flex items-center px-4 py-2.5 text-sm ${
                  i < aliases.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <span className="mr-2 text-ink-faint">#</span>
                <span className="font-medium text-ink">{a.alias}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-sm text-ink-faint">
            Nenhum alias cadastrado. Aliases permitem localizar o produto por
            nomes alternativos.
          </p>
        </div>
      )}

      {/* Formulário de adição */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
        <div className="flex-1 min-w-[200px]">
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Novo alias de busca"
            className="field"
            disabled={pending}
          />
          {erro && <p className="mt-1 text-xs text-red-500">{erro}</p>}
        </div>
        <button
          type="submit"
          disabled={pending || !valor.trim()}
          className="btn-primary"
        >
          {pending ? "Adicionando…" : "Adicionar"}
        </button>
      </form>
    </div>
  );
}
