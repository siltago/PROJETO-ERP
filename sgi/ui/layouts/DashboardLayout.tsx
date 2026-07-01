import { ReactNode } from "react";
import { cn } from "@/ui/lib/cn";

interface DashboardLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Layout base para páginas com sidebar lateral.
 * O AppHeader global já está em app/layout.tsx — este componente
 * gerencia apenas a área abaixo do header (sidebar + conteúdo).
 */
export function DashboardLayout({ sidebar, children, className }: DashboardLayoutProps) {
  return (
    <div className={cn("flex min-h-[calc(100vh-56px)]", className)}>
      {sidebar}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

interface DashboardContentProps {
  children: ReactNode;
  className?: string;
}

export function DashboardContent({ children, className }: DashboardContentProps) {
  return (
    <main className={cn("flex-1 px-4 py-6 sm:px-6 lg:px-8", className)}>
      {children}
    </main>
  );
}
