import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { criarProduto } from "../../actions";

export const dynamic = "force-dynamic";

export default async function NovoProdutoPage({
  params,
}: {
  params: { linhaId: string };
}) {
  const supabase = createClient();

  const [{ data: linha }, { data: categorias }] = await Promise.all([
    supabase
      .from("linhas")
      .select("id, nome")
      .eq("id", params.linhaId)
      .single(),
    supabase
      .from("categorias_perfil")
      .select("id, nome, tipo")
      .eq("linha_id", params.linhaId)
      .order("tipo, nome"),
  ]);

  if (!linha) notFound();

  const criarProdutoNaLinha = criarProduto.bind(null, params.linhaId);

  return (
    <div className="px-8 py-8">
      <Link
        href={`/catalogo/${params.linhaId}`}
        className="text-sm text-ink-soft hover:text-ink hover:underline"
      >
        ← {linha.nome}
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">Novo produto</h1>
      <p className="mt-1 text-sm text-ink-soft">Linha: {linha.nome}</p>

      <form action={criarProdutoNaLinha} className="card mt-6 max-w-2xl p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Código mestre</label>
            <input
              name="codigo_mestre"
              required
              className="field font-mono"
              placeholder="Ex: AL-1234"
            />
            <p className="mt-1 text-xs text-ink-faint">
              Deve ser único em todo o catálogo
            </p>
          </div>

          <div>
            <label className="label">Unidade</label>
            <select name="unidade" required className="field">
              <option value="UN">UN — Unidade</option>
              <option value="M">M — Metro linear</option>
              <option value="M²">M² — Metro quadrado</option>
              <option value="KG">KG — Quilograma</option>
              <option value="BARRA">BARRA</option>
              <option value="CX">CX — Caixa</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">Nome técnico</label>
            <input
              name="nome_tecnico"
              required
              className="field"
              placeholder="Ex: Perfil T 45mm — Batente superior"
            />
          </div>

          <div>
            <label className="label">
              Categoria{" "}
              <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <select name="categoria_id" className="field">
              <option value="">Sem categoria</option>
              {categorias?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.tipo ? `${cat.tipo} — ${cat.nome}` : cat.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              Descrição{" "}
              <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <textarea name="descricao" rows={3} className="field" />
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              Observações{" "}
              <span className="font-normal text-ink-soft">(opcional)</span>
            </label>
            <textarea name="observacoes" rows={2} className="field" />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button type="submit" className="btn-primary">
            Criar produto
          </button>
          <Link
            href={`/catalogo/${params.linhaId}`}
            className="btn-ghost"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
