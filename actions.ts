"use server";

import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function criarObra(formData: FormData) {
  const supabase = createClient();

  const nome = String(formData.get("nome") || "").trim();
  const cliente_id = String(formData.get("cliente_id") || "");
  const status_id = String(formData.get("status_id") || "");
  const endereco = String(formData.get("endereco") || "");
  const cidade = String(formData.get("cidade") || "");
  const estado = String(formData.get("estado") || "");
  const cep = String(formData.get("cep") || "");
  const data_prevista = String(formData.get("data_prevista") || "") || null;
  const observacoes = String(formData.get("observacoes") || "");

  // Regra central: obra precisa de nome, cliente e status.
  if (!nome || !cliente_id || !status_id) {
    throw new Error("Nome, cliente e status são obrigatórios.");
  }

  const { data, error } = await supabase
    .from("obras")
    .insert({
      nome,
      cliente_id,
      status_id,
      endereco,
      cidade,
      estado: estado || null,
      cep,
      data_prevista,
      observacoes,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Histórico imutável: registra a criação.
  await supabase.from("obra_historico").insert({
    obra_id: data.id,
    acao: "OBRA_CRIADA",
    valor_novo: { nome, cliente_id, status_id },
  });

  revalidatePath("/obras");
  redirect(`/obras/${data.id}`);
}
