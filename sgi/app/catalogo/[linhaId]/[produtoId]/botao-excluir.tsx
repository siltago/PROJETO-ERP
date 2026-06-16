"use client";

import { useTransition } from "react";
import { deletarProduto } from "@/app/catalogo/actions";

export function BotaoExcluir({
  linhaId,
  produtoId,
}: {
  linhaId: string;
  produtoId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (!confirm("Excluir este produto? Esta ação não pode ser desfeita.")) return;
        startTransition(() => deletarProduto(linhaId, produtoId));
      }}
      disabled={pending}
      className="text-sm font-medium text-red-500 hover:text-red-700 disabled:opacity-50"
    >
      {pending ? "Excluindo…" : "Excluir produto"}
    </button>
  );
}
