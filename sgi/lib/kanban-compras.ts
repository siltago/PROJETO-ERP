import "server-only";
import { createAdminClient } from "./supabase-admin";

// Colunas específicas do fluxo de Compras
export const COLUNAS_COMPRAS = [
  { nome: "Solicitações abertas",  ordem: 0, tipo: "PADRAO" as const, aceita_automaticas: true  },
  { nome: "Rascunho",              ordem: 1, tipo: "PADRAO" as const, aceita_automaticas: true  },
  { nome: "Aguard. Aprovação",     ordem: 2, tipo: "PADRAO" as const, aceita_automaticas: true  },
  { nome: "Aprovados",             ordem: 3, tipo: "PADRAO" as const, aceita_automaticas: false },
  { nome: "Em Recebimento",        ordem: 4, tipo: "PADRAO" as const, aceita_automaticas: false },
  { nome: "Concluído",             ordem: 5, tipo: "PADRAO" as const, aceita_automaticas: false },
];

// Mapeamento de status do pedido → nome da coluna
const STATUS_PEDIDO_COLUNA: Record<string, string> = {
  RASCUNHO:               "Rascunho",
  AGUARDANDO_APROVACAO:   "Aguard. Aprovação",
  APROVADO:               "Aprovados",
  AGUARDANDO_RECEBIMENTO: "Em Recebimento",
  RECEBIMENTO_PARCIAL:    "Em Recebimento",
  RECEBIDO:               "Concluído",
  FINALIZADO:             "Concluído",
  CANCELADO:              "Concluído",
};

export async function getSetorComprasId(): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("setores")
    .select("id")
    .ilike("nome", "%compra%")
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

// Garante que as colunas de Compras existem; retorna mapa nome→id
export async function garantirColunasCompras(setorId: string): Promise<Record<string, string>> {
  const admin = createAdminClient();

  const { data: existentes } = await admin
    .from("colunas_kanban")
    .select("id, nome")
    .eq("setor_id", setorId)
    .eq("tipo", "PADRAO");

  const mapa: Record<string, string> = {};
  for (const c of existentes ?? []) mapa[c.nome] = c.id;

  // Cria as que faltam
  const faltam = COLUNAS_COMPRAS.filter((c) => !mapa[c.nome]);
  if (faltam.length > 0) {
    const { data: criadas } = await admin
      .from("colunas_kanban")
      .insert(faltam.map((c) => ({ ...c, setor_id: setorId, usuario_id: null, cor: null })))
      .select("id, nome");
    for (const c of criadas ?? []) mapa[c.nome] = c.id;
  }

  return mapa;
}

// Retorna o coluna_id correto para um status de pedido
export async function colunaPorStatusPedido(setorId: string, status: string): Promise<string | null> {
  const nomeColuna = STATUS_PEDIDO_COLUNA[status];
  if (!nomeColuna) return null;
  const mapa = await garantirColunasCompras(setorId);
  return mapa[nomeColuna] ?? null;
}

// Move a tarefa vinculada a um pedido para a coluna correta
export async function moverTarefaPedido(pedidoId: string, novoStatus: string, usuarioId?: string) {
  const admin = createAdminClient();

  const setorId = await getSetorComprasId();
  if (!setorId) return;

  const colunaId = await colunaPorStatusPedido(setorId, novoStatus);
  if (!colunaId) return;

  const { data: tarefa } = await admin
    .from("tarefas")
    .select("id, coluna_id")
    .eq("entidade_ref", "pedido")
    .eq("entidade_ref_id", pedidoId)
    .is("deleted_at", null)
    .not("status", "in", '("CANCELADA")')
    .maybeSingle();

  if (!tarefa || tarefa.coluna_id === colunaId) return;

  const isFinal = ["RECEBIDO", "FINALIZADO", "CANCELADO"].includes(novoStatus);

  await admin.from("tarefas").update({
    coluna_id: colunaId,
    ...(isFinal ? { status: "CONCLUIDA", concluida_em: new Date().toISOString() } : {}),
  }).eq("id", tarefa.id);

  await admin.from("tarefa_historico").insert({
    tarefa_id: tarefa.id,
    usuario_id: usuarioId ?? null,
    acao: "MOVIDA_AUTOMATICAMENTE",
    dados: { status: novoStatus, coluna_id: colunaId },
  });
}
