import { createAdminClient } from "@/shared/database/supabase-admin";
import { EmpresaForm } from "./empresa-form";

export const dynamic = "force-dynamic";

export default async function EmpresaPage() {
  const admin = createAdminClient();
  const { data } = await admin.from("empresa").select("*").eq("id", "default").single();

  const empresa = data ?? {
    nome: null, nome_fantasia: null, cnpj: null, ie: null, telefone: null,
    email: null, site: null, endereco: null, numero: null,
    complemento: null, bairro: null, cidade: null, estado: null,
    cep: null, logo_url: null,
  };

  return (
    <div className="px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Compras</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Dados da Empresa</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Essas informações serão usadas nos pedidos de compra e outros documentos gerados pelo sistema.
        </p>
      </div>
      <EmpresaForm empresa={empresa} />
    </div>
  );
}
