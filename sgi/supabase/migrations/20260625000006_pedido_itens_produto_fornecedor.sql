-- Adiciona coluna produto_fornecedor_id em pedido_itens
-- Referenciada nos RPCs criar_pedido e editar_pedido mas ausente do schema de produção.
ALTER TABLE pedido_itens
  ADD COLUMN IF NOT EXISTS produto_fornecedor_id uuid
    REFERENCES produto_fornecedores(id) ON DELETE SET NULL;
