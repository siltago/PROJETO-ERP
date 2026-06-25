import { redirect, notFound } from "next/navigation";
import { getUsuarioAtual } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { TarefaStandaloneWrapper } from "@/components/kanban/tarefa-standalone-wrapper";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("tarefas")
    .select("titulo")
    .eq("id", params.id)
    .single();
  return { title: data?.titulo ? `${data.titulo} — Tarefas` : "Tarefa" };
}

export default async function TarefaPage({ params }: PageProps) {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  const admin = createAdminClient();
  const { data: tarefa } = await admin
    .from("tarefas")
    .select("id, titulo, setor_id, deleted_at, setor:setores(nome)")
    .eq("id", params.id)
    .single();

  if (!tarefa || tarefa.deleted_at) notFound();

  const setorNome = (tarefa.setor as any)?.nome ?? null;

  return (
    <div className="min-h-screen bg-canvas">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-line bg-surface text-sm">
        <a href="/tarefas" className="text-steel hover:underline">Tarefas</a>
        {setorNome && (
          <>
            <span className="text-ink-faint">/</span>
            <span className="text-ink-faint">{setorNome}</span>
          </>
        )}
        <span className="text-ink-faint">/</span>
        <span className="text-ink font-medium truncate max-w-xs">{tarefa.titulo}</span>
      </div>
      <TarefaStandaloneWrapper tarefaId={params.id} />
    </div>
  );
}
