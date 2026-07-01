/**
 * Remove separadores (-  .  /  espaços etc.) e aplica lowercase.
 * Permite que "PR32516" e "PR-32.516" sejam tratados como equivalentes.
 */
export function normalizeSearch(str: string): string {
  return str.toLowerCase().replace(/[-.\s/()_,]+/g, "");
}

/**
 * Converte a query em um padrão ilike que tolera separadores entre caracteres.
 * Exemplo: "PR32516" → "%p%r%3%2%5%1%6%" — casa com "PR-32.516" no banco.
 * Use em todas as chamadas .ilike() / .or("campo.ilike.X").
 */
export function buildSearchPattern(query: string): string {
  const n = normalizeSearch(query);
  if (!n) return "%";
  return `%${n.split("").join("%")}%`;
}
