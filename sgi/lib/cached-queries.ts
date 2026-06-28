import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase-admin";

// Cache de 60s para dados de referência que mudam raramente.
// Tags permitem revalidação manual via revalidateTag().

export const getTiposLinha = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("tipos_linha")
      .select("id, nome, slug, unidade")
      .order("ordem");
    return data ?? [];
  },
  ["tipos_linha"],
  { revalidate: 60, tags: ["tipos_linha"] }
);

export const getFornecedores = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("fornecedores")
      .select("id, nome, tipos, email, telefone")
      .eq("ativo", true)
      .order("nome");
    return data ?? [];
  },
  ["fornecedores"],
  { revalidate: 60, tags: ["fornecedores"] }
);

export const getFormasPagamento = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("formas_pagamento")
      .select("id, nome")
      .order("nome");
    return data ?? [];
  },
  ["formas_pagamento"],
  { revalidate: 60, tags: ["formas_pagamento"] }
);

export const getCoresRal = unstable_cache(
  async () => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("cores_ral")
      .select("id, codigo_ral, nome, hex")
      .order("codigo_ral");
    return data ?? [];
  },
  ["cores_ral"],
  { revalidate: 300, tags: ["cores_ral"] }
);
