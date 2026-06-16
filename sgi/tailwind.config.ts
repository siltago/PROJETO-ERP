import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta "instrumento de precisão"
        canvas: "#F7F8FA",   // fundo da aplicação
        surface: "#FFFFFF",  // cartões / painéis
        ink: {
          DEFAULT: "#1A2332", // texto principal (slate profundo)
          soft: "#475569",    // texto secundário
          faint: "#94A3B8",   // legendas / placeholders
        },
        line: "#E2E8F0",      // bordas / divisórias
        steel: {
          // azul-aço — o acento funcional do produto
          DEFAULT: "#0F4C81",
          hover: "#0C3E6B",
          soft: "#E8F0F7",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,30,54,0.04), 0 1px 3px rgba(16,30,54,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
