"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Coluna, Tarefa } from "@/modules/squadframe/types/kanban";
import { KanbanCard } from "./kanban-card";

interface Props {
  coluna: Coluna;
  tarefas: Tarefa[];
  onNovaTarefa: () => void;
  onCardClick: (tarefaId: string) => void;
}

export function KanbanColumn({ coluna, tarefas, onNovaTarefa, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });

  const nomeMin = coluna.nome.toLowerCase();
  const isFinalCol =
    nomeMin.includes("conclu") ||
    nomeMin.includes("cancelad") ||
    nomeMin === "done";

  const bgClass = coluna.tipo === "PADRAO" ? "bg-surface" : "bg-bg";

  return (
    <div
      className={`flex flex-col shrink-0 rounded-2xl border border-border ${bgClass} transition-colors`}
      style={{
        width: 280,
        minHeight: 200,
        outline: isOver ? "2px solid var(--color-primary)" : "none",
        outlineOffset: 2,
      }}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          {coluna.cor && (
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: coluna.cor }}
            />
          )}
          <span className="text-sm font-semibold text-text truncate" title={coluna.nome}>
            {coluna.nome}
          </span>
          <span className="shrink-0 rounded-full bg-bg px-1.5 py-0.5 text-xs font-medium text-text-3 border border-border">
            {tarefas.length}
          </span>
        </div>
        <button
          onClick={onNovaTarefa}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-text-3 hover:bg-bg hover:text-text transition-colors"
          title="Nova tarefa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <SortableContext
        items={tarefas.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 overflow-y-auto p-2 space-y-2 ${isFinalCol ? "opacity-80" : ""}`}
          style={{ minHeight: 80 }}
        >
          {tarefas.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-xs text-text-3 select-none">
              Nenhuma tarefa
            </div>
          ) : (
            tarefas.map((tarefa) => (
              <KanbanCard
                key={tarefa.id}
                tarefa={tarefa}
                onClick={() => onCardClick(tarefa.id)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
