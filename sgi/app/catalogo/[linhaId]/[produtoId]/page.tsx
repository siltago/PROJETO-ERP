import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AbaCores } from "./aba-cores";
import { AbaAliases } from "./aba-aliases";
import { AbaFornecedores } from "./aba-fornecedores";
import { AbaArquivos } from "./aba-arquivos";
import { BotaoExcluir } from "./botao-excluir";

export const dynamic = "force-dynamic";

export default async function ProdutoPage({
  params,
  searchParams,
}: {
  params: { linhaId: string; produtoId: string };
  searchParams: { aba?: string };
}) {
  const abaAtiva = searchParams.aba ?? "geral";
  const supabase = createClient();

  const { data: produto } = await supabase
    .from("produtos")
    .select(
      `id, codigo_mestre, nome, unidade, status, descricao, observacoes,
       linha:linhas(nome, fabricante),
       categoria:categorias_perfil(nome)`
    )
    .eq("id", params.produtoId)
    .eq("linha_id", params.linhaId)
    .single();

  if (!produto) notFound();

  const linha = produto.linha as unknown as { nome: string; fabricante: string | null } | null;
  const categoria = produto.categoria as unknown as { nome: string } | null;

  // ── Contagem de arquivos (sempre carregada) ─────────────────

  const { count: arquivoCount } = await supabase
    .from("produto_arquivos")
    .select("*", { count: "exact", head: true })
    .eq("produto_id", params.produtoId);

  const abas = [
    { label: "Geral",        slug: "geral" },
    { label: "Cores",        slug: "cores" },
    { label: "Aliases",      slug: "aliases" },
    { label: "Fornecedores", slug: "fornecedores" },
    { label: arquivoCount ? `Arquivos (${arquivoCount})` : "Arquivos", slug: "arquivos" },
  ];

  // ── Dados por aba ───────────────────────────────────────────

  let cores: any[] = [];
  let coresDisponiveis: any[] = [];
  let acabamentos: any[] = [];

  let aliases: any[] = [];

  let fornecedoresVinculados: any[] = [];
  let fornecedoresDisponiveis: any[] = [];

  let arquivos: any[] = [];

  if (abaAtiva === "cores") {
    const results = await Promise.all([
      supabase
        .from("produto_cores")
        .select("cor:cores_ral(id, codigo_ral, nome, hex), acabamento:acabamentos(id, nome)")
        .eq("produto_id", params.produtoId)
        .order("cor_id"),
      supabase
        .from("cores_ral")
        .select("id, codigo_ral, nome, hex")
        .order("codigo_ral"),
      supabase.from("acabamentos").select("id, nome").order("nome"),
    ]);
    cores = results[0].data ?? [];
    coresDisponiveis = results[1].data ?? [];
    acabamentos = results[2].data ?? [];
  }

  if (abaAtiva === "aliases") {
    const { data } = await supabase
      .from("produto_aliases")
      .select("id, alias")
      .eq("produto_id", params.produtoId)
      .order("alias");
    aliases = data ?? [];
  }

  if (abaAtiva === "fornecedores") {
    const results = await Promise.all([
      supabase
        .from("produto_fornecedores")
        .select(
          "id, fornecedor:fornecedores(id, nome), codigo_fornecedor, preco_referencia"
        )
        .eq("produto_id", params.produtoId)
        .order("criado_em"),
      supabase
        .from("fornecedores")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),
    ]);
    fornecedoresVinculados = results[0].data ?? [];
    fornecedoresDisponiveis = results[1].data ?? [];
  }

  if (abaAtiva === "arquivos") {
    const { data } = await supabase
      .from("produto_arquivos")
      .select("id, nome_original, url, url_preview, tipo, criado_em")
      .eq("produto_id", params.produtoId)
      .order("criado_em", { ascending: false });
    arquivos = data ?? [];
  }

  return (
    <div className="px-8 py-8">
      <Link
        href={`/catalogo/${params.linhaId}`}
        className="text-sm text-ink-soft hover:text-ink hover:underline"
      >
        ← {linha?.nome ?? "Linha"}
      </Link>

      {/* Cabeçalho */}
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-medium text-ink-faint">
            {produto.codigo_mestre}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              produto.status
                ? "bg-green-50 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                produto.status ? "bg-green-500" : "bg-slate-400"
              }`}
            />
            {produto.status ? "Ativo" : "Inativo"}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {produto.nome}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {linha?.nome}
          {categoria?.nome ? ` · ${categoria.nome}` : ""}
          {` · ${produto.unidade}`}
        </p>
      </div>

      {/* Navegação de abas */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-line">
        {abas.map(({ label, slug }) => (
          <Link
            key={slug}
            href={`/catalogo/${params.linhaId}/${params.produtoId}?aba=${slug}`}
            className={
              abaAtiva === slug
                ? "shrink-0 border-b-2 border-steel px-4 py-2.5 text-sm font-medium text-ink"
                : "shrink-0 px-4 py-2.5 text-sm font-medium text-ink-faint hover:text-ink-soft"
            }
          >
            {label}
          </Link>
        ))}
      </div>

      {/* ── Aba: Geral ─────────────────────────────────────── */}
      {abaAtiva === "geral" && (
        <div className="mt-6 max-w-2xl">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Dados do produto
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Campo rotulo="Código mestre" valor={produto.codigo_mestre} mono />
              <Campo rotulo="Unidade" valor={produto.unidade} />
              <Campo rotulo="Linha" valor={linha?.nome} />
              <Campo rotulo="Fabricante" valor={linha?.fabricante} />
              <Campo rotulo="Categoria" valor={categoria?.nome} />
              {produto.descricao && (
                <div className="col-span-2">
                  <Campo rotulo="Descrição" valor={produto.descricao} />
                </div>
              )}
              {produto.observacoes && (
                <div className="col-span-2">
                  <Campo rotulo="Observações" valor={produto.observacoes} />
                </div>
              )}
            </dl>
          </div>
          <div className="mt-4 flex justify-end">
            <BotaoExcluir linhaId={params.linhaId} produtoId={params.produtoId} />
          </div>
        </div>
      )}

      {/* ── Aba: Cores ─────────────────────────────────────── */}
      {abaAtiva === "cores" && (
        <AbaCores
          produtoId={params.produtoId}
          linhaId={params.linhaId}
          cores={cores}
          coresDisponiveis={coresDisponiveis}
          acabamentos={acabamentos}
        />
      )}

      {/* ── Aba: Aliases ───────────────────────────────────── */}
      {abaAtiva === "aliases" && (
        <AbaAliases
          produtoId={params.produtoId}
          linhaId={params.linhaId}
          aliases={aliases}
        />
      )}

      {/* ── Aba: Fornecedores ──────────────────────────────── */}
      {abaAtiva === "fornecedores" && (
        <AbaFornecedores
          produtoId={params.produtoId}
          linhaId={params.linhaId}
          fornecedoresVinculados={fornecedoresVinculados}
          fornecedoresDisponiveis={fornecedoresDisponiveis}
        />
      )}

      {/* ── Aba: Arquivos ──────────────────────────────────── */}
      {abaAtiva === "arquivos" && (
        <AbaArquivos
          produtoId={params.produtoId}
          linhaId={params.linhaId}
          arquivos={arquivos}
        />
      )}
    </div>
  );
}

function Campo({
  rotulo,
  valor,
  mono = false,
}: {
  rotulo: string;
  valor?: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-faint">
        {rotulo}
      </dt>
      <dd
        className={`mt-0.5 font-medium text-ink ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {valor || "—"}
      </dd>
    </div>
  );
}
