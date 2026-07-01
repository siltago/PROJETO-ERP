"use client";

import { useTheme } from "@/ui/theme/ThemeProvider";
import { SunIcon, MoonIcon } from "@/ui/icons";

export function ThemeToggle() {
  const { resolvedTheme, toggle } = useTheme();
  const dark = resolvedTheme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="flex h-8 w-8 items-center justify-center rounded text-white transition-colors hover:bg-white/10"
    >
      {dark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
