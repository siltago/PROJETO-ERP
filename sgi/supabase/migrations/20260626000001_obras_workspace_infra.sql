-- ============================================================
-- FASE 0: Infraestrutura para Obra como Workspace Central
-- ============================================================
-- 1. atualizado_em em pedidos_compra e solicitacoes_compra
--    → trigger function reutilizável, seguro com OR REPLACE
-- 2. Índices parciais para queries do workspace
-- 3. Índice de expressão em eventos_dominio para Timeline
-- ============================================================

-- Função trigger reutilizável (idempotente)
CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- ── pedidos_compra ───────────────────────────────────────────
ALTER TABLE pedidos_compra
  ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_pedidos_compra_atualizado_em ON pedidos_compra;
CREATE TRIGGER trg_pedidos_compra_atualizado_em
  BEFORE UPDATE ON pedidos_compra
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ── solicitacoes_compra ──────────────────────────────────────
ALTER TABLE solicitacoes_compra
  ADD COLUMN IF NOT EXISTS atualizado_em timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS trg_solicitacoes_compra_atualizado_em ON solicitacoes_compra;
CREATE TRIGGER trg_solicitacoes_compra_atualizado_em
  BEFORE UPDATE ON solicitacoes_compra
  FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();

-- ── Índices para performance do workspace ───────────────────
-- Parciais: excluem NULLs (maioria dos pedidos/solicitações/tarefas tem obra_id)
CREATE INDEX IF NOT EXISTS idx_pedidos_compra_obra_id
  ON pedidos_compra (obra_id)
  WHERE obra_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_solicitacoes_compra_obra_id
  ON solicitacoes_compra (obra_id)
  WHERE obra_id IS NOT NULL;

-- Tarefas: índice parcial exclui deletadas (principal filtro operacional)
CREATE INDEX IF NOT EXISTS idx_tarefas_obra_id_ativo
  ON tarefas (obra_id)
  WHERE obra_id IS NOT NULL AND deleted_at IS NULL;

-- Índice de expressão para Timeline via eventos_dominio
-- Sem este índice, filtrar por payload->>'obra_id' faz full-scan
CREATE INDEX IF NOT EXISTS idx_eventos_dominio_obra_id
  ON eventos_dominio ((payload->>'obra_id'))
  WHERE payload->>'obra_id' IS NOT NULL;
