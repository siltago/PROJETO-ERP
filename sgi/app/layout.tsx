import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getUsuarioAtual } from "@/lib/auth";
import { HeaderUser } from "@/components/header-user";
import { UserProvider } from "@/components/user-provider";
import { MobileNav } from "@/components/mobile-nav";
import { BuscaGlobal } from "@/components/busca-global";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((m) => m.ThemeToggle),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "SquadFrame",
  description: "Gestão Industrial Para Esquadrias",
  icons: { icon: "/icon.png" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioAtual();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {usuario && (
          <header
            className="fixed inset-x-0 top-0 z-50 flex items-center gap-2 px-3 sm:gap-3 sm:px-5"
            style={{ backgroundColor: "#0F4C81", height: 56 }}
          >
            {/* Hamburguer — só mobile */}
            <MobileNav />

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/icon.png" alt="SquadFrame" width={36} height={36} className="shrink-0" />
              <span className="text-base font-bold leading-none text-white">
                SquadFrame
              </span>
            </Link>

            {/* Navegação desktop */}
            <nav className="hidden sm:flex flex-1 items-center gap-0.5 px-2">
              {[
                { href: "/obras",    label: "Obras" },
                { href: "/catalogo", label: "Catálogo" },
                { href: "/compras",  label: "Compras" },
                { href: "/tarefas",  label: "Tarefas" },
                { href: "/usuarios", label: "Usuários" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Direita */}
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <BuscaGlobal />
              <ThemeToggle />
              <HeaderUser usuario={usuario} />
            </div>
          </header>
        )}

        <UserProvider usuario={usuario}>
          <ToastProvider>
            <main className={usuario ? "pt-14" : ""}>{children}</main>
          </ToastProvider>
        </UserProvider>
      </body>
    </html>
  );
}
