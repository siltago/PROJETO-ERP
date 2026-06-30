"use client";

import { useState } from "react";
import Link from "next/link";

export function BtnAcaoProtegida({
  href,
  label,
  temPermissao,
  acao,
  className,
}: {
  href: string;
  label: React.ReactNode;
  temPermissao: boolean;
  acao?: string;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);

  if (temPermissao) {
    return <Link href={href} className={className}>{label}</Link>;
  }

  return (
    <>
      <button type="button" onClick={() => setAberto(true)} className={className}>
        {label}
      </button>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-ink">Acesso restrito</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Você não tem permissão para{" "}
                  <span className="font-medium text-ink">{acao ?? "realizar esta ação"}</span>.
                  Solicite ao administrador do sistema.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setAberto(false)} className="btn-ghost text-sm">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
