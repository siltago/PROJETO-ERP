import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import "./globals.css";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((m) => m.ThemeToggle),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "SGI — Gestão Industrial",
  description: "Sistema de gestão para esquadrias e vidros",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <header
          className="fixed inset-x-0 top-0 z-50 flex items-center px-4 gap-3"
          style={{ backgroundColor: "#0F4C81", height: 56 }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-sm font-bold text-white"
              style={{ backgroundColor: "#0a3660" }}
            >
              S
            </div>
            <span className="font-bold text-white text-base leading-none">
              SGI
            </span>
          </Link>

          {/* Centro */}
          <div className="flex-1 text-center">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
              Sistema de Gestão Industrial
            </span>
          </div>

          {/* Direita */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white select-none"
              style={{ backgroundColor: "#0a3660" }}
            >
              AD
            </div>
          </div>
        </header>

        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
