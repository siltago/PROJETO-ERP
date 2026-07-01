"use client";

import { useState } from "react";
import { Button } from "@/ui/components/Button";
import type { ButtonVariant } from "@/ui/components/Button";

export function BtnAcaoProtegida({
  href,
  label,
  temPermissao,
  acao,
  className,
  variant,
}: {
  href: string;
  label: React.ReactNode;
  temPermissao: boolean;
  acao?: string;
  className?: string;
  variant?: ButtonVariant;
}) {
  const [aberto, setAberto] = useState(false);

  if (temPermissao) {
    return <Button as="a" href={href} variant={variant} className={className}>{label}</Button>;
  }

  return (
    <>
      <Button type="button" variant={variant} className={className} onClick={() => setAberto(true)}>
        {label}
      </Button>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="text-danger">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-text">Acesso restrito</h2>
                <p className="mt-1 text-sm text-text-2">
                  Você não tem permissão para{" "}
                  <span className="font-medium text-text">{acao ?? "realizar esta ação"}</span>.
                  Solicite ao administrador do sistema.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="ghost" onClick={() => setAberto(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
