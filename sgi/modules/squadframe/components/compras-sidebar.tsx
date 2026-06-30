"use client";

import Link from "next/link";
import { AppSidebar, SidebarSection } from "@/ui/layout/AppSidebar";
import { usePode } from "@/modules/squadframe/components/user-provider";

const IconGrid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);
const IconBuilding = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconBriefcase = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    <line x1="12" y1="12" x2="12" y2="17"/>
    <line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/>
  </svg>
);
const IconCard = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <rect x="1" y="4" width="22" height="16" rx="2"/>
    <line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);
const IconDollar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-full h-full">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export function ComprasSidebar() {
  const podeCriarPedido      = usePode("compras.pedido.criar");
  const podeCriarSolicitacao = usePode("compras.solicitacao.criar");

  const sections: SidebarSection[] = [
    {
      items: [
        { href: "/compras",              label: "Painel",          icon: <IconGrid />,   exact: true },
        { href: "/compras/solicitacoes", label: "Solicitações",    icon: <IconDoc />   },
        { href: "/compras/pedidos",      label: "Pedidos",         icon: <IconBox />   },
        { href: "/compras/fornecedores", label: "Fornecedores",    icon: <IconBuilding /> },
        { href: "/compras/financeiro",   label: "Financeiro",      icon: <IconDollar /> },
      ],
    },
    {
      title: "Configurações",
      items: [
        { href: "/compras/empresa",          label: "Empresa",         icon: <IconBriefcase /> },
        { href: "/compras/formas-pagamento", label: "Formas de Pgto.", icon: <IconCard /> },
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
