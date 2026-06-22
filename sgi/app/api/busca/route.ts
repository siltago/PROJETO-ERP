import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ resultados: [] });

  const admin = createAdminClient();
  const like = `%${q}%`;

  const [obras, produtos, fornecedores, pedidos] = await Promise.all([
    admin.from("obras")
      .select("id, nome, codigo, numero, cliente:clientes(nome)")
      .ilike("nome", like)
      .is("deleted_at", null)
      .limit(5),
    admin.from("produtos")
      .select("id, codigo_mestre, nome, linha:linhas(id, nome)")
      .or(`codigo_mestre.ilike.${like},nome.ilike.${like}`)
      .limit(5),
    admin.from("fornecedores")
      .select("id, nome")
      .ilike("nome", like)
      .eq("ativo", true)
      .limit(4),
    admin.from("pedidos_compra")
      .select("id, numero, status, fornecedor:fornecedores(nome)")
      .ilike("numero", like)
      .limit(4),
  ]);

  const resultados = [
    ...(obras.data ?? []).map((o: any) => ({
      tipo: "obra" as const,
      id: o.id,
      titulo: o.nome,
      subtitulo: [o.cliente?.nome, o.codigo].filter(Boolean).join(" · "),
      href: `/obras/${o.id}`,
    })),
    ...(produtos.data ?? []).map((p: any) => ({
      tipo: "produto" as const,
      id: p.id,
      titulo: p.nome,
      subtitulo: [p.codigo_mestre, p.linha?.nome].filter(Boolean).join(" · "),
      href: `/catalogo/${p.linha?.id}/${p.id}`,
    })),
    ...(fornecedores.data ?? []).map((f: any) => ({
      tipo: "fornecedor" as const,
      id: f.id,
      titulo: f.nome,
      subtitulo: "Fornecedor",
      href: `/compras/fornecedores`,
    })),
    ...(pedidos.data ?? []).map((p: any) => ({
      tipo: "pedido" as const,
      id: p.id,
      titulo: p.numero,
      subtitulo: p.fornecedor?.nome ?? "Pedido de compra",
      href: `/compras/pedidos/${p.id}`,
    })),
  ];

  return NextResponse.json({ resultados });
}
