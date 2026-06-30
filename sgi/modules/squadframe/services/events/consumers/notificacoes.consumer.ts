import "server-only";
import { createAdminClient } from "@/shared/database/supabase-admin";
import { DomainEvent, EVENTS } from "../event-types";

export async function notificacoesConsumerHandler(event: DomainEvent): Promise<void> {
  const admin = createAdminClient();
  const p = event.payload;

  switch (event.tipo) {
    // Pedido aprovado → notifica comprador
    case EVENTS.PURCHASE_ORDER_APPROVED: {
      const { order_id, usuario_id } = p;
      if (!order_id) break;

      const { data: pedido } = await admin
        .from("pedidos_compra")
        .select("comprador_id, numero")
        .eq("id", order_id)
        .single();

      if (pedido?.comprador_id && pedido.comprador_id !== usuario_id) {
        await admin.from("notificacoes").insert({
          usuario_id: pedido.comprador_id,
          tipo: "pedido_aprovado",
          payload: { numero: pedido.numero, order_id, aprovado_por: usuario_id },
        });
      }
      break;
    }

    // Pedido aguardando aprovação → notifica aprovadores com permissão
    case EVENTS.PURCHASE_ORDER_AWAITING_APPROVAL: {
      const { order_id, numero } = p;
      if (!order_id) break;

      // Busca IDs de permissão para aprovar pedidos
      const { data: perm } = await admin
        .from("permissoes")
        .select("id")
        .eq("chave", "compras.pedido.aprovar")
        .maybeSingle();

      if (!perm?.id) break;

      // Busca usuários que têm essa permissão via cargo
      const { data: cargoPerms } = await admin
        .from("cargo_permissoes")
        .select("cargo_id")
        .eq("permissao_id", perm.id);

      if (!cargoPerms?.length) break;

      const cargoIds = cargoPerms.map((cp) => cp.cargo_id);
      const { data: usuarios } = await admin
        .from("usuarios")
        .select("id")
        .in("cargo_id", cargoIds)
        .eq("ativo", true);

      if (!usuarios?.length) break;

      await admin.from("notificacoes").insert(
        usuarios.map((u) => ({
          usuario_id: u.id,
          tipo: "pedido_aguardando_aprovacao",
          payload: { numero, order_id },
        }))
      );
      break;
    }

    // Solicitação aprovada → notifica solicitante
    case EVENTS.PURCHASE_REQUEST_APPROVED: {
      const { request_id, usuario_id } = p;
      if (!request_id) break;

      const { data: sol } = await admin
        .from("solicitacoes_compra")
        .select("solicitante_id, numero")
        .eq("id", request_id)
        .single();

      if (sol?.solicitante_id && sol.solicitante_id !== usuario_id) {
        await admin.from("notificacoes").insert({
          usuario_id: sol.solicitante_id,
          tipo: "solicitacao_aprovada",
          payload: { numero: sol.numero, request_id },
        });
      }
      break;
    }

    // Solicitação rejeitada → notifica solicitante
    case EVENTS.PURCHASE_REQUEST_REJECTED: {
      const { request_id, usuario_id } = p;
      if (!request_id) break;

      const { data: sol } = await admin
        .from("solicitacoes_compra")
        .select("solicitante_id, numero")
        .eq("id", request_id)
        .single();

      if (sol?.solicitante_id && sol.solicitante_id !== usuario_id) {
        await admin.from("notificacoes").insert({
          usuario_id: sol.solicitante_id,
          tipo: "solicitacao_rejeitada",
          payload: { numero: sol.numero, request_id },
        });
      }
      break;
    }

    default:
      break;
  }
}
