"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Theme } from "./tokens";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
  frameTheme: boolean;
  setFrameTheme: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggle: () => {},
  frameTheme: true,
  setFrameTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark", frame: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("frame", frame);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");
  const [frameTheme, setFrameThemeState] = useState(true);

  useEffect(() => {
    const stored = (localStorage.getItem("squad-theme") as Theme) ?? "system";
    const storedFrame = localStorage.getItem("squad-frame-theme") !== "false";
    const r = stored === "system" ? getSystemTheme() : (stored as "light" | "dark");
    setThemeState(stored);
    setResolved(r);
    setFrameThemeState(storedFrame);
    applyTheme(r, storedFrame);
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const r = mq.matches ? "dark" : "light";
      setResolved(r);
      applyTheme(r, frameTheme);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme, frameTheme]);

  const setTheme = useCallback((t: Theme) => {
    const r = t === "system" ? getSystemTheme() : (t as "light" | "dark");
    setThemeState(t);
    setResolved(r);
    localStorage.setItem("squad-theme", t);
    applyTheme(r, frameTheme);
  }, [frameTheme]);

  const toggle = useCallback(() => {
    setTheme(resolved === "dark" ? "light" : "dark");
  }, [resolved, setTheme]);

  const setFrameTheme = useCallback((v: boolean) => {
    setFrameThemeState(v);
    localStorage.setItem("squad-frame-theme", String(v));
    applyTheme(resolved, v);
  }, [resolved]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: resolved, setTheme, toggle, frameTheme, setFrameTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){
  try {
    var t = localStorage.getItem('squad-theme') || 'system';
    var f = localStorage.getItem('squad-frame-theme') !== 'false';
    var d = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
    if (f) document.documentElement.classList.add('frame');
  } catch(e) {}
})()`,
      }}
    />
  );
}
