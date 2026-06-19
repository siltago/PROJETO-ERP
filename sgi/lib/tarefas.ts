import "server-only";
import { createAdminClient } from "./supabase-admin";

export async function criarTarefaAutomatica({
  titulo,
  descricao,
  origem,
  entidade_ref,
  entidade_ref_id,
  setor_id,
  obra_id,
  pedido_id,
  orcamento_id,
  prioridade = "MEDIA",
  criado_por,
  coluna_id,
}: {
  titulo: string;
  descricao?: string;
  origem: "MANUAL" | "COMPRA" | "PRODUCAO" | "QUALIDADE" | "EXPEDICAO" | "OBRA";
  entidade_ref?: string;
  entidade_ref_id?: string;
  setor_id?: string;
  obra_id?: string;
  pedido_id?: string;
  orcamento_id?: string;
  prioridade?: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  criado_por?: string;
  coluna_id?: string;
}): Promise<{ id: string } | null> {
  const admin = createAdminClient();

  let colunaId: string | null = null;

  if (setor_id) {
    const { data: colunas } = await admin
      .from("colunas_kanban")
      .select("id, aceita_automaticas")
      .eq("setor_id", setor_id)
      .order("ordem");

    const coluna = colunas?.find((c) => c.aceita_automaticas) ?? colunas?.[0] ?? null;
    colunaId = coluna?.id ?? null;
  }

  const { data, error } = await admin
    .from("tarefas")
    .insert({
      titulo,
      descricao: descricao ?? null,
      coluna_id: coluna_id ?? colunaId,
      origem,
      entidade_ref: entidade_ref ?? null,
      entidade_ref_id: entidade_ref_id ?? null,
      setor_id: setor_id ?? null,
      obra_id: obra_id ?? null,
      pedido_id: pedido_id ?? null,
      orcamento_id: orcamento_id ?? null,
      prioridade,
      status: "SEM_DONO",
      criado_por: criado_por ?? null,
    })
    .select("id")
    .single();

  if (error) return null;

  if (data?.id) {
    await admin.from("tarefa_historico").insert({
      tarefa_id: data.id,
      usuario_id: criado_por ?? null,
      acao: "CRIADA_AUTOMATICAMENTE",
      dados: { origem, entidade_ref, entidade_ref_id },
    });
  }

  return data;
}

export async function resolverTarefaAutomatica({
  entidade_ref,
  entidade_ref_id,
  usuario_id,
}: {
  entidade_ref: string;
  entidade_ref_id: string;
  usuario_id?: string;
}): Promise<void> {
  const admin = createAdminClient();

  const { data: tarefas } = await admin
    .from("tarefas")
    .select("id, coluna_id, setor_id")
    .eq("entidade_ref", entidade_ref)
    .eq("entidade_ref_id", entidade_ref_id)
    .is("deleted_at", null)
    .not("status", "in", '("CONCLUIDA","CANCELADA")');

  if (!tarefas || tarefas.length === 0) return;

  for (const tarefa of tarefas) {
    let colunaConcluidaId: string | null = null;

    if (tarefa.setor_id) {
      const { data: colunas } = await admin
        .from("colunas_kanban")
        .select("id, nome")
        .eq("setor_id", tarefa.setor_id);

      const colConcluida = colunas?.find((c) =>
        c.nome.toLowerCase().includes("conclu")
      );
      colunaConcluidaId = colConcluida?.id ?? null;
    }

    await admin
      .from("tarefas")
      .update({
        status: "CONCLUIDA",
        concluida_em: new Date().toISOString(),
        coluna_id: colunaConcluidaId ?? tarefa.coluna_id,
      })
      .eq("id", tarefa.id);

    await admin.from("tarefa_historico").insert({
      tarefa_id: tarefa.id,
      usuario_id: usuario_id ?? null,
      acao: "CONCLUIDA_AUTOMATICAMENTE",
      dados: { entidade_ref, entidade_ref_id },
    });
  }
}
