import { createAdminClient } from "@/shared/database/supabase-admin";

const ACAO_ICONE: Record<string, string> = {
  OBRA_CRIADA:     "✦",
  STATUS_ALTERADO: "↻",
  OBRA_EDITADA:    "✎",
  XML_IMPORTADO:   "↓",
};

function formatarAcao(acao: string): string {
  return acao.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export async function TimelineTab({ obraId }: { obraId: string }) {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("obra_historico")
    .select("id, acao, campo_alterado, valor_anterior, valor_novo, motivo, criado_em, usuario:usuarios(nome)")
    .eq("obra_id", obraId)
    .order("criado_em", { ascending: false })
    .limit(100);

  const registros = (data ?? []) as unknown as Array<{
    id: string; acao: string;
    campo_alterado: string | null; valor_anterior: Record<string, unknown> | null; valor_novo: Record<string, unknown> | null;
    motivo: string | null; criado_em: string;
    usuario: { nome: string } | null;
  }>;

  return (
    <div className="mt-6">
      <p className="mb-4 text-sm text-ink-soft">
        Histórico completo de alterações e eventos da obra.
      </p>

      {registros.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-ink-faint">Nenhum registro no histórico.</p>
        </div>
      ) : (
        <div className="relative ml-3">
          {/* Linha vertical */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-line" />

          <ol className="space-y-0">
            {registros.map((h, i) => {
              const icone = ACAO_ICONE[h.acao] ?? "·";
              const data = new Date(h.criado_em);
              return (
                <li key={h.id ?? i} className="relative flex gap-5 pb-6">
                  {/* Bolinha na linha do tempo */}
                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-xs text-ink-faint">
                    {icone}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-sm font-medium text-ink">{formatarAcao(h.acao)}</span>
                      {h.usuario && (
                        <span className="text-xs text-ink-faint">por {h.usuario.nome}</span>
                      )}
                      <span className="ml-auto text-xs text-ink-faint">
                        {data.toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {h.motivo && (
                      <p className="mt-0.5 text-xs text-ink-soft">{h.motivo}</p>
                    )}
                    {h.valor_novo && Object.keys(h.valor_novo).length > 0 && (
                      <p className="mt-0.5 font-mono text-xs text-ink-faint">
                        {JSON.stringify(h.valor_novo)}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
