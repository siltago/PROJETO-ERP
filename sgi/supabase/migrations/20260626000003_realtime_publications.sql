-- Habilita Supabase Realtime para as tabelas que precisam de reatividade na UI
-- Usa DO block para ser idempotente (ignora se tabela já é membro da publication)

DO $$
DECLARE
  tabelas TEXT[] := ARRAY['notificacoes','tarefas','pedidos_compra','solicitacoes_compra','lotes_obra','tipologias_obra'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tabelas LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
    END IF;
  END LOOP;
END;
$$;
