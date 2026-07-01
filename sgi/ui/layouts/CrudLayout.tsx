import { ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

interface CrudLayoutProps {
  header?: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  size?: "md" | "lg" | "xl" | "full";
  className?: string;
}

const sizeStyles = {
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-7xl",
  full: "max-w-none",
};

/**
 * Layout para páginas de listagem/detalhe (CRUD).
 * Renderiza PageHeader + toolbar de filtros opcionais + conteúdo principal.
 */
export function CrudLayout({ header, toolbar, children, size = "xl", className }: CrudLayoutProps) {
  return (
    <div className={cn("mx-auto w-full px-4 py-6 sm:px-6 lg:px-8", sizeStyles[size], className)}>
      {header && <div className="mb-6">{header}</div>}
      {toolbar && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {toolbar}
        </div>
      )}
      {children}
    </div>
  );
}
