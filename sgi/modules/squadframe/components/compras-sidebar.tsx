"use client";

import Link from "next/link";
import { AppSidebar, SidebarSection } from "@/ui/layout/AppSidebar";
import {
  DashboardIcon, DocumentIcon, PackageIcon, BuildingIcon,
  BriefcaseIcon, CreditCardIcon, DollarSignIcon,
} from "@/ui/icons";
import { usePode } from "@/modules/squadframe/components/user-provider";

export function ComprasSidebar() {
  const podeCriarPedido      = usePode("compras.pedido.criar");
  const podeCriarSolicitacao = usePode("compras.solicitacao.criar");

  const sections: SidebarSection[] = [
    {
      items: [
        { href: "/compras",              label: "Painel",          icon: <DashboardIcon />,  exact: true },
        { href: "/compras/solicitacoes", label: "Solicitações",    icon: <DocumentIcon />  },
        { href: "/compras/pedidos",      label: "Pedidos",         icon: <PackageIcon />   },
        { href: "/compras/fornecedores", label: "Fornecedores",    icon: <BuildingIcon />  },
        { href: "/compras/financeiro",   label: "Financeiro",      icon: <DollarSignIcon /> },
      ],
    },
    {
      title: "Configurações",
      items: [
        { href: "/compras/empresa",          label: "Empresa",         icon: <BriefcaseIcon />  },
        { href: "/compras/formas-pagamento", label: "Formas de Pgto.", icon: <CreditCardIcon /> },
      ],
    },
  ];

  const footer = (podeCriarSolicitacao || podeCriarPedido) ? (
    <div className="space-y-2">
      {podeCriarSolicitacao && (
        <Link href="/compras/solicitacoes/nova" className="btn-primary w-full text-center text-sm block">
          Nova solicitação
        </Link>
      )}
      {podeCriarPedido && (
        <Link href="/compras/pedidos/novo" className="btn-ghost w-full text-center text-sm block">
          Novo pedido
        </Link>
      )}
    </div>
  ) : undefined;

  return <AppSidebar sections={sections} footer={footer} storageKey="squad-compras-sidebar" />;
}
