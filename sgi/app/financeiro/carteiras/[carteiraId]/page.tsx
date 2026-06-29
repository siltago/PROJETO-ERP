import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { getUsuarioAtual } from "@/lib/auth";
import { PERMISSIONS } from "@/core/permissions/permissions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function CarteiraDetailPage({
  params,
}: {
  params: { carteiraId: string };
}) {
  const usuario = await getUsuarioAtual();
  if (!usuario) notFound();

  const podeVer = usuario.permissoes?.includes("*") || usuario.permissoes?.includes(PERMISSIONS.FINANCEIRO_CARTEIRA_VER);
  if (!podeVer) notFound();

  const admin = createAdminClient();

  const { data: carteira } = await admin
    .from("carteiras")
    .select(`
      id, saldo_atual, criado_em, atualizado_em,
      obra:obras(id, nome, codigo),
      fornecedor:fornecedores(id, nome)
    `)
    .eq("id", params.carteiraId)
    .single();

  if (!carteira) notFound();

  const { data: movimentacoes } = await admin
    .from("carteira_movimentacoes")
    .select(`
      id, tipo, valor, referencia_tipo, referencia_id, descricao, criado_em,
      usuario:usuarios(nome)
    `)
    .eq("carteira_id", params.carteiraId)
    .order("criado_em", { ascending: false })
    .limit(200);

  const obra = carteira.obra as any;
  const forn = carteira.fornecedor as any;

  const totalDepositos = (movimentacoes ?? [])
    .filter((m) => m.tipo === "DEPOSITO")
    .reduce((s, m) => s + m.valor, 0);

  const totalDebitos = (movimentacoes ?? [])
    .filter((m) => m.tipo === "DEBITO")
    .reduce((s, m) => s + m.valor, 0);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <Link href="/financeiro?aba=carteiras" className="text-xs text-ink-faint hover:text-ink-soft">
        ← Voltar às carteiras
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{forn?.nome ?? "—"}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {obra?.codigo && <span className="font-mono mr-1">[{obra.codigo}]</span>}
            {obra?.nome ?? "Sem obra"}
          </p>
        </div>
        <div className="card p-4 text-right">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Saldo atual</p>
          <p className={`mt-1 text-3xl font-bold ${carteira.saldo_atual > 0 ? "text-green-700" : "text-red-500"}`}>
            {fmt(carteira.saldo_atual)}
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Total depositado</p>
          <p className="mt-1 text-xl font-bold text-green-700">{fmt(totalDepositos)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Total debitado</p>
          <p className="mt-1 text-xl font-bold text-red-600">{fmt(totalDebitos)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-faint">Movimentações</p>
          <p className="mt-1 text-xl font-bold text-ink">{(movimentacoes ?? []).length}</p>
        </div>
      </div>

      {/* Ledger */}
      <div className="mt-8 card overflow-x-auto">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold text-ink">Extrato</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
              <th className="px-5 py-2 font-medium">Data</th>
              <th className="px-5 py-2 font-medium">Tipo</th>
              <th className="px-5 py-2 font-medium">Descrição</th>
              <th className="px-5 py-2 font-medium">Usuário</th>
              <th className="px-5 py-2 font-medium text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {(movimentacoes ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-ink-faint">
                  Nenhuma movimentação.
                </td>
              </tr>
            ) : (movimentacoes ?? []).map((m) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-canvas/50">
                <td className="px-5 py-2.5 text-xs text-ink-faint">
                  {new Date(m.criado_em).toLocaleString("pt-BR")}
                </td>
                <td className="px-5 py-2.5">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    m.tipo === "DEPOSITO"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}>
                    {m.tipo === "DEPOSITO" ? "▲ Depósito" : "▼ Débito"}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-ink-soft">
                  {m.descricao ?? (m.referencia_tipo === "pedido" ? (
                    <Link
                      href={`/compras/pedidos/${m.referencia_id}`}
                      className="text-steel hover:underline text-xs font-mono"
                    >
                      Ver pedido
                    </Link>
                  ) : "—")}
                </td>
                <td className="px-5 py-2.5 text-xs text-ink-faint">
                  {(m.usuario as any)?.nome ?? "—"}
                </td>
                <td className="px-5 py-2.5 text-right font-semibold">
                  <span className={m.tipo === "DEPOSITO" ? "text-green-700" : "text-red-600"}>
                    {m.tipo === "DEBITO" ? "−" : "+"}{fmt(m.valor)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
