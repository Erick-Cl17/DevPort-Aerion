import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-raised": "var(--surface-raised)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        cyan: "var(--cyan)",
        success: "var(--success)",
        warning: "var(--warning)",
        critical: "var(--critical)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        panel: "0 24px 60px -30px rgba(0,0,0,0.85)",
        lift: "0 30px 70px -28px rgba(56, 132, 255, 0.38)",
      },
      backgroundImage: {
        "gradient-hero":
          "radial-gradient(120% 90% at 50% -10%, rgba(56,132,255,0.26), transparent 62%), radial-gradient(80% 70% at 90% 100%, rgba(56,211,255,0.12), transparent 60%)",
        "gradient-accent": "linear-gradient(120deg, var(--primary), var(--cyan))",
      },
    },
  },
  plugins: [],
};

export default config;
