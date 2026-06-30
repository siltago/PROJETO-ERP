// Badge de status com cor vinda do banco (obra_status.cor).
export function StatusBadge({ nome, cor }: { nome: string; cor: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${cor}1A`, // ~10% de opacidade
        color: cor,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: cor }}
      />
      {nome}
    </span>
  );
}
