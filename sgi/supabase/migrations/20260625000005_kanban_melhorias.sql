-- =============================================================================
-- Migration: 20260625000005_kanban_melhorias.sql
-- Adiciona: participantes de tarefas, notificações, FTS e índices de performance.
-- Idempotente: IF NOT EXISTS em todos os DDLs.
-- Não altera dados existentes.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Participantes de tarefas
--    Permite múltiplos usuários por tarefa com papéis distintos.
--    Retrocompatível: usuario_responsavel_id em tarefas permanece.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tarefa_participantes (
  tarefa_id  uuid NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  papel      text NOT NULL DEFAULT 'colaborador'
             CHECK (papel IN ('responsavel', 'colaborador', 'observador')),
  criado_em  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tarefa_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_tarefa_participantes_usuario
  ON tarefa_participantes (usuario_id);

CREATE INDEX IF NOT EXISTS idx_tarefa_participantes_tarefa
  ON tarefa_participantes (tarefa_id);

-- ---------------------------------------------------------------------------
-- 2. Notificações in-app
--    Consumer OBSERVER — falha não interrompe fluxo principal.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notificacoes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id  uuid        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo        text        NOT NULL,
  tarefa_id   uuid        REFERENCES tarefas(id) ON DELETE CASCADE,
  payload     jsonb       NOT NULL DEFAULT '{}',
  lida        boolean     NOT NULL DEFAULT false,
  criado_em   timestamptz NOT NULL DEFAULT now()
);

-- Índice para badge (só não-lidas, ordenado por recente)
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_nao_lidas
  ON notificacoes (usuario_id, criado_em DESC)
  WHERE NOT lida;

-- Índice geral para histórico de notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_all
  ON notificacoes (usuario_id, criado_em DESC);

-- ---------------------------------------------------------------------------
-- 3. Índice de performance — query da Central Pessoal
--    SELECT ... WHERE usuario_responsavel_id = $uid AND deleted_at IS NULL
--      AND status NOT IN ('CONCLUIDA','CANCELADA')
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel_ativo
  ON tarefas (usuario_responsavel_id, status)
  WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- 4. Full-Text Search em títulos de tarefas
-- ---------------------------------------------------------------------------
ALTER TABLE tarefas ADD COLUMN IF NOT EXISTS titulo_tsv tsvector
  GENERATED ALWAYS AS (to_tsvector('portuguese', coalesce(titulo, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_tarefas_titulo_fts
  ON tarefas USING gin(titulo_tsv);

-- ---------------------------------------------------------------------------
-- 5. Índice para busca por setor (tarefas sem dono do setor)
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tarefas_setor_sem_dono
  ON tarefas (setor_id, status)
  WHERE deleted_at IS NULL AND status = 'SEM_DONO';
