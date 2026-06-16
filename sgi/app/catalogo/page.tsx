import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { AbaCoresCatalogo } from "./aba-cores-catalogo";
import { NovaAbaInline } from "./nova-aba-inline";

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { aba?: string };
}) {
  const supabase = createClient();

  // Carrega tipos de linha do banco (abas dinâmicas)
  const { data: tipos } = await supabase
    .from("tipos_linha")
    .select("id, nome, slug")
    .order("ordem");

  const tiposList = tipos ?? [];

  // Determina aba ativa: slug de um tipo ou "cores" (sempre última)
  const slugsValidos = tiposList.map((t) => t.slug);
  const aba =
    searchParams.aba === "cores"
      ? "cores"
      : slugsValidos.find((s) => s === searchParams.aba) ?? tiposList[0]?.slug ?? "cores";

  let linhas: any[] = [];
  let cores: any[] = [];
  let acabamentos: any[] = [];

  if (aba !== "cores") {
    const { data } = await supabase
      .from("linhas")
      .select("id, nome, fabricante, produtos(count)")
      .eq("ativo", true)
      .eq("tipo", aba)
      .order("nome");
    linhas = data ?? [];
  } else {
    const [{ data: coresData }, { data: acabamentosData }] = await Promise.all([
      supabase
        .from("cores_ral")
        .select("id, codigo_ral, nome, hex, acabamento_id")
        .order("codigo_ral"),
      supabase.from("acabamentos").select("id, nome").order("nome"),
    ]);
    cores = coresData ?? [];
    acabamentos = acabamentosData ?? [];
  }

  const tipoAtual = tiposList.find((t) => t.slug === aba);
  const labelNova = tipoAtual ? `Nova linha de ${tipoAtual.nome.toLowerCase()}` : "Nova linha";

  return (
    <div className="px-8 py-8">
      {/* Cabeçalho */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
            Catálogo
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {aba === "cores" ? "Cores RAL" : (tipoAtual?.nome ?? "Catálogo")}
          </h1>
        </div>
        {aba !== "cores" && (
          <Link
            href={`/catalogo/nova-linha?tipo=${aba}`}
            className="btn-primary"
          >
            {labelNova}
          </Link>
        )}
      </div>

      {/* Abas */}
      <div className="mt-6 flex items-center border-b border-line">
        <div className="flex overflow-x-auto">
          {tiposList.map((tab) => (
            <Link
              key={tab.slug}
              href={`/catalogo?aba=${tab.slug}`}
              className={`-mb-px whitespace-nowrap border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                aba === tab.slug
                  ? "border-steel text-steel"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {tab.nome}
            </Link>
          ))}
          <Link
            href="/catalogo?aba=cores"
            className={`-mb-px whitespace-nowrap border-b-2 px-5 py-2.5 text-sm font-medium transition-colors ${
              aba === "cores"
                ? "border-steel text-steel"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            Cores RAL
          </Link>
        </div>

        {/* Botão nova aba — alinhado à direita */}
        <div className="ml-auto shrink-0 pl-4 pb-px">
          <NovaAbaInline />
        </div>
      </div>

      {/* ── Linhas ─────────────────────────────────────────────── */}
      {aba !== "cores" && (
        <div className="mt-8">
          {linhas.length === 0 ? (
            <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
              <p className="font-display text-lg font-semibold">
                Nenhuma linha cadastrada
              </p>
              <p className="mt-1 max-w-sm text-sm text-ink-soft">
                Linhas agrupam {tipoAtual?.nome.toLowerCase() ?? "itens"} por série ou fabricante.
              </p>
              <Link
                href={`/catalogo/nova-linha?tipo=${aba}`}
                className="btn-primary mt-5"
              >
                {labelNova}
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {linhas.map((linha: any) => {
                const qtd =
                  (linha.produtos as Array<{ count: number }>)?.[0]?.count ?? 0;
                return (
                  <Link
                    key={linha.id}
                    href={`/catalogo/${linha.id}`}
                    className="card p-5 transition-all hover:border-steel/20 hover:shadow-md"
                  >
                    <p className="font-display text-base font-semibold text-ink">
                      {linha.nome}
                    </p>
                    {linha.fabricante && (
                      <p className="mt-0.5 text-sm text-ink-soft">
                        {linha.fabricante}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-ink-faint">
                      {qtd} {qtd === 1 ? "produto" : "produtos"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Cores RAL ──────────────────────────────────────────── */}
      {aba === "cores" && <AbaCoresCatalogo cores={cores} acabamentos={acabamentos} />}
    </div>
  );
}
