import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { criarLinha } from "../actions";

export const dynamic = "force-dynamic";

export default async function NovaLinhaPage({
  searchParams,
}: {
  searchParams: { tipo?: string };
}) {
  const supabase = createClient();
  const { data: tipos } = await supabase
    .from("tipos_linha")
    .select("nome, slug")
    .order("ordem");

  const tiposList = tipos ?? [];
  const slugParam = searchParams.tipo?.toUpperCase() ?? "";
  const tipoAtual = tiposList.find((t) => t.slug === slugParam) ?? tiposList[0] ?? { nome: "Linha", slug: "PERFIL" };
  const tipo = tipoAtual.slug;
  const labelTipo = tipoAtual.nome;

  return (
    <div className="px-8 py-8">
      <Link
        href={`/catalogo?aba=${tipo}`}
        className="text-sm text-ink-soft hover:text-ink hover:underline"
      >
        ← {labelTipo}
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">
        Nova linha de {labelTipo.toLowerCase()}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Linhas agrupam {labelTipo.toLowerCase()} de uma mesma série ou fabricante.
      </p>

      <form action={criarLinha} className="card mt-6 max-w-2xl p-6">
        <input type="hidden" name="tipo" value={tipo} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Nome da linha</label>
            <input
              name="nome"
              required
              className="field"
              placeholder={`Ex: ${labelTipo} Premium 45`}
            />
          </div>

          <div>
            <label className="label">
              Fabricante{" "}
              <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <input name="fabricante" className="field" placeholder="Ex: Alumínio São Paulo" />
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              Descrição{" "}
              <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <textarea
              name="descricao"
              rows={3}
              className="field"
              placeholder="Informações gerais sobre a linha"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" className="btn-primary">
            Criar linha
          </button>
          <Link href={`/catalogo?aba=${tipo}`} className="btn-ghost">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
