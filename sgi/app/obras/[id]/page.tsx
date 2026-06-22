import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient as createClient } from "@/lib/supabase-admin";
import { AbaProducao } from "./aba-producao";
import { StatusObraSelector } from "./status-selector";
import { BackButton } from "@/components/back-button";
import { STATUS_PED_COR, STATUS_PED_LABEL, STATUS_SOL_COR, STATUS_SOL_LABEL } from "@/types/compras";
import { PRIORIDADE_COR, PRIORIDADE_LABEL } from "@/types/kanban";
import { BtnExcluirTarefa } from "./btn-excluir-tarefa";

/*
  SQL — rodar no Supabase para ativar a aba Produção:

  CREATE TABLE tipologias_obra (
    id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    obra_id    uuid         NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
    nome       varchar(200) NOT NULL,
    quantidade int          NOT NULL DEFAULT 1,
    criado_em  timestamptz  NOT NULL DEFAULT now()
  );
*/

export const dynamic = "force-dynamic";

const ABAS = [
  { label: "Resumo",     slug: "resumo" },
  { label: "Pedidos",    slug: "pedidos" },
  { label: "Produção",   slug: "producao" },
  { label: "Compras",    slug: "compras" },
  { label: "Tarefas",    slug: "tarefas" },
  { label: "Documentos", slug: "documentos" },
  { label: "Histórico",  slug: "historico" },
];

export default async function ObraDetalhePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { aba?: string };
}) {
  const abaAtiva = searchParams.aba ?? "resumo";
  const supabase = createClient();

  const { data: obra } = await supabase
    .from("obras")
    .select(
      `*, numero, status_id, cliente:clientes(nome, documento),
       status:obra_status(nome, cor)`
    )
    .eq("id", params.id)
    .is("deleted_at", null)
    .single();

  if (!obra) notFound();

  let historico: any[] | null = null;
  let lotes: Array<{
    id: string; nome: string; criado_em: string;
    tipologias: Array<{ id: string; nome: string; quantidade: number; status?: string | null; codigo_esquadria?: string | null; tipo?: string | null; largura_mm?: number | null; altura_mm?: number | null; tratamento?: string | null; descricao?: string | null; peso_unit?: number | null; preco_unit?: number | null }>;
  }> = [];
  let semLote: Array<{ id: string; nome: string; quantidade: number }> = [];
  let migracaoPendente = false;
  let pedidos: any[] | null = null;
  let solicitacoes: any[] | null = null;
  let tarefasObra: any[] | null = null;

  if (abaAtiva === "resumo") {
    const { data } = await supabase
      .from("obra_historico")
      .select("acao, motivo, criado_em")
      .eq("obra_id", params.id)
      .order("criado_em", { ascending: false });
    historico = data;
  }

  if (abaAtiva === "historico") {
    const { data } = await supabase
      .from("obra_historico")
      .select("acao, campo_alterado, valor_anterior, valor_novo, motivo, criado_em, usuario:usuarios(nome)")
      .eq("obra_id", params.id)
      .order("criado_em", { ascending: false });
    historico = data;
  }

  if (abaAtiva === "compras") {
    const { data } = await supabase
      .from("solicitacoes_compra")
      .select("id, numero, status, prioridade, criado_em, solicitante:usuarios(nome)")
      .eq("obra_id", params.id)
      .order("criado_em", { ascending: false });
    solicitacoes = data ?? [];
  }

  if (abaAtiva === "tarefas") {
    const { data } = await supabase
      .from("tarefas")
      .select("id, titulo, status, prioridade, data_limite, criado_em, responsavel:usuarios!usuario_responsavel_id(nome)")
      .eq("obra_id", params.id)
      .is("deleted_at", null)
      .not("status", "in", "(CONCLUIDA,CANCELADA)")
      .order("criado_em", { ascending: false });
    tarefasObra = data ?? [];
  }

  if (abaAtiva === "producao") {
    const [resLotes, resSemLote] = await Promise.all([
      supabase
        .from("lotes_obra")
        .select("id, nome, criado_em, tipologias:tipologias_obra(id, nome, quantidade, status, codigo_esquadria, tipo, largura_mm, altura_mm, tratamento, descricao, peso_unit, preco_unit)")
        .eq("obra_id", params.id)
        .order("criado_em", { ascending: true }),
      supabase
        .from("tipologias_obra")
        .select("id, nome, quantidade")
        .eq("obra_id", params.id)
        .is("lote_id", null)
        .order("criado_em", { ascending: true }),
    ]);

    if (resLotes.error) {
      console.error("[lotes_obra] erro:", resLotes.error.message);
      migracaoPendente = true;
    } else {
      lotes = resLotes.data ?? [];
    }

    // Se a coluna lote_id não existe ainda, busca tudo sem o filtro IS NULL
    if (resSemLote.error) {
      const { data } = await supabase
        .from("tipologias_obra")
        .select("id, nome, quantidade")
        .eq("obra_id", params.id)
        .order("criado_em", { ascending: true });
      semLote = data ?? [];
    } else {
      semLote = resSemLote.data ?? [];
    }
  }

  if (abaAtiva === "pedidos") {
    const { data } = await supabase
      .from("pedidos_compra")
      .select("id, numero, status, tipo_linha, criado_em, fornecedor:fornecedores(nome), comprador:usuarios(nome)")
      .eq("obra_id", params.id)
      .order("criado_em", { ascending: false });
    pedidos = data ?? [];
  }

  const obraNumero = obra.numero ? String(obra.numero).padStart(4, "0") : null;

  return (
    <div className="px-8 py-8">
      <BackButton href="/obras" />

      {/* Cabeçalho da obra */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            {obraNumero && (
              <span className="font-mono text-sm font-bold text-steel">{obraNumero}</span>
            )}
            <span className="font-mono text-xs font-medium text-ink-faint">{obra.codigo}</span>
            {obra.status && (
              <StatusObraSelector
                obraId={params.id}
                statusAtual={{ id: obra.status_id, nome: obra.status.nome, cor: obra.status.cor }}
              />
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{obra.nome}</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {obra.cliente?.nome}
            {obra.cidade ? ` · ${obra.cidade}/${obra.estado ?? ""}` : ""}
          </p>
        </div>
        {abaAtiva === "pedidos" && (
          <Link
            href={`/compras/pedidos/novo?obra_id=${params.id}`}
            className="btn-primary"
          >
            Novo pedido
          </Link>
        )}
      </div>

      {/* Abas */}
      <div className="mt-6 flex gap-1 border-b border-line overflow-x-auto">
        {ABAS.map(({ label, slug }) => (
          <Link
            key={slug}
            href={`/obras/${params.id}?aba=${slug}`}
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

      {/* Aba: Resumo */}
      {abaAtiva === "resumo" && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Dados principais
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Campo rotulo="Cliente" valor={obra.cliente?.nome} />
              <Campo rotulo="Documento" valor={obra.cliente?.documento} />
              <Campo rotulo="Endereço" valor={obra.endereco} />
              <Campo
                rotulo="Cidade / UF"
                valor={obra.cidade ? `${obra.cidade}/${obra.estado ?? ""}` : null}
              />
              <Campo rotulo="CEP" valor={obra.cep} />
              <Campo
                rotulo="Entrega prevista"
                valor={
                  obra.data_prevista
                    ? new Date(obra.data_prevista).toLocaleDateString("pt-BR")
                    : null
                }
              />
              <div className="col-span-2">
                <Campo rotulo="Observações" valor={obra.observacoes} />
              </div>
            </dl>
          </div>

          {/* Linha do tempo */}
          <div className="card p-6">
            <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
              Histórico
            </h2>
            {!historico || historico.length === 0 ? (
              <p className="text-sm text-ink-faint">Sem registros.</p>
            ) : (
              <ol className="space-y-4">
                {historico.map((h, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-steel" />
                    <div>
                      <p className="text-sm font-medium">
                        {h.acao.replace(/_/g, " ").toLowerCase()}
                      </p>
                      <p className="text-xs text-ink-faint">
                        {new Date(h.criado_em).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Aba: Pedidos */}
      {abaAtiva === "pedidos" && (
        <div className="mt-6">
          {!pedidos || pedidos.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm font-medium text-ink">Nenhum pedido para esta obra</p>
              <p className="text-sm text-ink-faint">Crie o primeiro pedido vinculado a esta obra.</p>
              <Link href={`/compras/pedidos/novo?obra_id=${params.id}`} className="btn-primary mt-2">
                Criar pedido
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3 font-medium">Nº Pedido</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Tipo</th>
                    <th className="px-5 py-3 font-medium">Fornecedor</th>
                    <th className="px-5 py-3 font-medium">Comprador</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p: any) => {
                    const cor = STATUS_PED_COR[p.status as keyof typeof STATUS_PED_COR] ?? "#94a3b8";
                    return (
                      <tr key={p.id} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/compras/pedidos/${p.id}`}
                            className="font-mono text-sm font-bold text-steel hover:underline">
                            {p.numero}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: cor + "20", color: cor }}>
                            {STATUS_PED_LABEL[p.status as keyof typeof STATUS_PED_LABEL] ?? p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-soft">
                          {p.tipo_linha ?? <span className="text-ink-faint">—</span>}
                        </td>
                        <td className="px-5 py-3 text-ink-soft">
                          {(p.fornecedor as any)?.nome ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-ink-soft">
                          {(p.comprador as any)?.nome ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-ink-faint text-xs">
                          {new Date(p.criado_em).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Aba: Produção */}
      {abaAtiva === "producao" && (
        <AbaProducao
          obraId={params.id}
          lotes={lotes ?? []}
          semLote={semLote ?? []}
          migracaoPendente={migracaoPendente}
        />
      )}

      {/* Aba: Compras (Solicitações) */}
      {abaAtiva === "compras" && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-soft">Solicitações de compra vinculadas a esta obra.</p>
            <Link href={`/compras/solicitacoes/nova?obra_id=${params.id}`} className="btn-primary text-sm">
              Nova solicitação
            </Link>
          </div>
          {!solicitacoes || solicitacoes.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm font-medium text-ink">Nenhuma solicitação para esta obra</p>
              <Link href={`/compras/solicitacoes/nova?obra_id=${params.id}`} className="btn-primary mt-2">
                Criar solicitação
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3 font-medium">Nº</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Prioridade</th>
                    <th className="px-5 py-3 font-medium">Solicitante</th>
                    <th className="px-5 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((s: any) => {
                    const cor = STATUS_SOL_COR[s.status as keyof typeof STATUS_SOL_COR] ?? "#94a3b8";
                    return (
                      <tr key={s.id} className="border-b border-line last:border-0 hover:bg-canvas transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/compras/solicitacoes/${s.id}`} className="font-mono text-sm font-bold text-steel hover:underline">
                            {s.numero}
                          </Link>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: cor + "20", color: cor }}>
                            {STATUS_SOL_LABEL[s.status as keyof typeof STATUS_SOL_LABEL] ?? s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-soft text-xs">{s.prioridade ?? "—"}</td>
                        <td className="px-5 py-3 text-ink-soft">{s.solicitante?.nome ?? "—"}</td>
                        <td className="px-5 py-3 text-ink-faint text-xs">
                          {new Date(s.criado_em).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Aba: Tarefas */}
      {abaAtiva === "tarefas" && (
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-soft">Tarefas vinculadas a esta obra.</p>
            <Link href={`/tarefas`} className="text-sm text-steel hover:underline">
              Ver kanban completo →
            </Link>
          </div>
          {!tarefasObra || tarefasObra.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm font-medium text-ink">Nenhuma tarefa para esta obra</p>
              <p className="text-xs text-ink-faint">Crie tarefas no kanban e vincule a esta obra.</p>
              <Link href="/tarefas" className="btn-primary mt-2">Ir para Tarefas</Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-faint">
                    <th className="px-5 py-3 font-medium">Título</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Prioridade</th>
                    <th className="px-5 py-3 font-medium">Responsável</th>
                    <th className="px-5 py-3 font-medium">Prazo</th>
                    <th className="px-2 py-3 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {tarefasObra.map((t: any) => {
                    const priorCor = PRIORIDADE_COR[t.prioridade as keyof typeof PRIORIDADE_COR] ?? "#94a3b8";
                    const statusLabel: Record<string, string> = {
                      SEM_DONO: "Sem dono", ACEITA: "Aceita", EM_ANDAMENTO: "Em andamento",
                      AGUARDANDO: "Aguardando", CONCLUIDA: "Concluída", CANCELADA: "Cancelada",
                    };
                    const statusCor: Record<string, string> = {
                      SEM_DONO: "#94a3b8", ACEITA: "#3b82f6", EM_ANDAMENTO: "#f59e0b",
                      AGUARDANDO: "#8b5cf6", CONCLUIDA: "#10b981", CANCELADA: "#ef4444",
                    };
                    const sCor = statusCor[t.status] ?? "#94a3b8";
                    const vencida = t.data_limite && new Date(t.data_limite) < new Date() && !["CONCLUIDA","CANCELADA"].includes(t.status);
                    return (
                      <tr key={t.id} className="group border-b border-line last:border-0 hover:bg-canvas transition-colors">
                        <td className="px-5 py-3 font-medium text-ink max-w-xs truncate">{t.titulo}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{ backgroundColor: sCor + "20", color: sCor }}>
                            {statusLabel[t.status] ?? t.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: priorCor }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: priorCor }} />
                            {PRIORIDADE_LABEL[t.prioridade as keyof typeof PRIORIDADE_LABEL] ?? t.prioridade}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-ink-soft text-sm">{t.responsavel?.nome ?? <span className="text-ink-faint">—</span>}</td>
                        <td className={`px-5 py-3 text-xs ${vencida ? "text-red-500 font-medium" : "text-ink-faint"}`}>
                          {t.data_limite ? new Date(t.data_limite).toLocaleDateString("pt-BR") : "—"}
                        </td>
                        <td className="px-2 py-3">
                          <BtnExcluirTarefa tarefaId={t.id} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Aba: Histórico */}
      {abaAtiva === "historico" && (
        <div className="mt-6">
          {!historico || historico.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-sm text-ink-faint">Nenhum registro no histórico.</p>
            </div>
          ) : (
            <div className="card divide-y divide-line">
              {historico.map((h: any, i: number) => (
                <div key={i} className="flex gap-4 px-5 py-4">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-steel/10">
                    <div className="h-2 w-2 rounded-full bg-steel" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-medium text-ink">
                        {h.acao.replace(/_/g, " ").toLowerCase()}
                      </span>
                      {h.usuario?.nome && (
                        <span className="text-xs text-ink-faint">por {h.usuario.nome}</span>
                      )}
                      <span className="ml-auto text-xs text-ink-faint shrink-0">
                        {new Date(h.criado_em).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    {h.motivo && <p className="mt-0.5 text-xs text-ink-soft">{h.motivo}</p>}
                    {h.valor_novo && typeof h.valor_novo === "object" && Object.keys(h.valor_novo).length > 0 && (
                      <p className="mt-0.5 text-xs text-ink-faint font-mono">
                        {JSON.stringify(h.valor_novo)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Abas em construção */}
      {!["resumo", "pedidos", "producao", "compras", "tarefas", "historico"].includes(abaAtiva) && <AbaConstrucao />}
    </div>
  );
}

function AbaConstrucao() {
  return (
    <div className="mt-16 flex flex-col items-center gap-4 text-ink-faint">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
      <p className="text-sm">Este módulo está em construção</p>
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-faint">{rotulo}</dt>
      <dd className="mt-0.5 font-medium text-ink">{valor || "—"}</dd>
    </div>
  );
}
