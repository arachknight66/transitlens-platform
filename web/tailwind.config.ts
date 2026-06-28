import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        planet: "#3C3489",
        binary: "#712B13",
        blend: "#D48B00",
        noise: "#444441",
        primary: "#534AB7",
        "bg-dark": "#0E1117",
        "bg-card": "#1A1A2E",
        "text-primary": "#FAFAFA",
        "text-secondary": "#AAAAAA",
        "text-muted": "#888888",
        "status-green": "#4CAF50",
        "status-amber": "#D48B00",
        "status-red": "#FF6B6B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        pill: "999px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "40px",
        xxl: "64px",
      },
      fontSize: {
        caption: "11px",
        body: "13px",
        ui: "14px",
        heading: "16px",
        "heading-xl": "20px",
        display: "32px",
      },
      animation: {
        shimmer: "shimmer 2s infinite",
        fadeInUp: "fadeInUp 0.6s ease-out",
        barGrow: "barGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        barGrow: {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
